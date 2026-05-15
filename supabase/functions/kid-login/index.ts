import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

Deno.serve(async (req) => {
  console.log("kid-login function invoked:", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, familyCode, kidId, pin } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Lookup family by code
    if (action === "lookup_family") {
      if (!familyCode || typeof familyCode !== "string" || !/^[A-Z0-9]{6}$/.test(familyCode)) {
        return new Response(JSON.stringify({ error: "Invalid family code format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: family, error } = await supabase
        .from("families")
        .select("id, family_name")
        .eq("family_code", familyCode)
        .single();

      if (error || !family) {
        return new Response(JSON.stringify({ error: "Invalid family code or PIN. Please try again." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: kids } = await supabase
        .from("kids")
        .select("id, name, age, avatar")
        .eq("family_id", family.id);

      return new Response(
        JSON.stringify({ family: { id: family.id, name: family.family_name }, kids: kids || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "tap_login") {
      if (!kidId || typeof kidId !== "string") {
        return new Response(JSON.stringify({ error: "Invalid kid ID" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: kid, error } = await supabase
        .from("kids")
        .select("id, name, avatar, family_id, anonymous_uid")
        .eq("id", kidId)
        .single();

      if (error || !kid) {
        return new Response(JSON.stringify({ error: "Kid not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let anonymousUid = kid.anonymous_uid;
      if (!anonymousUid) {
        try {
          const { data: authUser, error: createError } =
            await supabase.auth.admin.createUser({
              email: `kid-${kidId}@loopo.internal`,
              email_confirm: true,
              user_metadata: { role: "kid", kid_id: kidId },
            });
          if (!createError && authUser?.user?.id) {
            anonymousUid = authUser.user.id;
            await supabase
              .from("kids")
              .update({ anonymous_uid: anonymousUid })
              .eq("id", kidId);
          }
        } catch (e) {
          console.error("[tap_login] createUser THREW:", e);
        }
      }

      if (anonymousUid) {
        try {
          const { data: existingUser } =
            await supabase.auth.admin.getUserById(anonymousUid);
          if (existingUser?.user && !existingUser.user.email) {
            await supabase.auth.admin.updateUserById(anonymousUid, {
              email: `kid-${kidId}@loopo.internal`,
              email_confirm: true,
            });
          }
        } catch (e) {
          console.error("[tap_login] Email backfill THREW:", e);
        }
      }

      let hashedToken: string | null = null;
      if (anonymousUid) {
        try {
          const { data: linkData, error: linkError } =
            await supabase.auth.admin.generateLink({
              type: "magiclink",
              email: `kid-${kidId}@loopo.internal`,
            });
          if (!linkError && linkData?.properties?.hashed_token) {
            hashedToken = linkData.properties.hashed_token;
          } else {
            console.error("[tap_login] generateLink failed:", linkError);
          }
        } catch (e) {
          console.error("[tap_login] generateLink THREW:", e);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          kid: {
            id: kid.id,
            name: kid.name,
            avatar: kid.avatar,
            anonymous_uid: anonymousUid,
          },
          hashed_token: hashedToken,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Verify PIN with rate limiting
    if (action === "verify_pin") {
      if (!kidId || !pin || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
        return new Response(JSON.stringify({ error: "Invalid family code or PIN. Please try again." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check rate limit: count failed attempts in the last WINDOW_MINUTES
      const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
      const { count: failedCount } = await supabase
        .from("login_attempts")
        .select("*", { count: "exact", head: true })
        .eq("kid_id", kidId)
        .eq("success", false)
        .gte("attempt_time", windowStart);

      if ((failedCount ?? 0) >= MAX_ATTEMPTS) {
        return new Response(
          JSON.stringify({ error: "Too many attempts. Try again in 15 minutes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: kid, error } = await supabase
        .from("kids")
        .select("id, name, avatar, pin_hash, family_id, anonymous_uid")
        .eq("id", kidId)
        .single();
      if (error || !kid) {
        // Log failed attempt
        await supabase.from("login_attempts").insert({ kid_id: kidId, success: false });
        return new Response(JSON.stringify({ error: "Invalid family code or PIN. Please try again." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("[verify_pin] Starting PIN check for kid:", kidId, "| pin_hash exists:", !!kid.pin_hash, "| pin_hash length:", kid.pin_hash?.length);
      let isValid: boolean;
      try {
        isValid = bcrypt.compareSync(pin, kid.pin_hash);
      } catch (bcryptErr) {
        console.error("[verify_pin] bcrypt.compareSync THREW:", bcryptErr);
        return new Response(JSON.stringify({ error: "Invalid family code or PIN. Please try again." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log("[verify_pin] PIN valid:", isValid);

      // Log the attempt
      await supabase.from("login_attempts").insert({ kid_id: kidId, success: isValid });

      if (!isValid) {
        const remaining = MAX_ATTEMPTS - ((failedCount ?? 0) + 1);
        return new Response(
          JSON.stringify({
            error: remaining <= 0
              ? "Too many attempts. Try again in 15 minutes."
              : "Invalid family code or PIN. Please try again.",
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create or reuse anonymous UID
      let anonymousUid = kid.anonymous_uid;
      console.log("[verify_pin] anonymous_uid from DB:", anonymousUid);
      if (!anonymousUid) {
        console.log("[verify_pin] No anonymous_uid, creating user...");
        try {
          const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
            email: `kid-${kidId}@loopo.internal`,
            email_confirm: true,
            user_metadata: { role: "kid", kid_id: kidId },
          });
          console.log("[verify_pin] createUser result - error:", createError, "| user id:", authUser?.user?.id);
          if (!createError && authUser?.user?.id) {
            anonymousUid = authUser.user.id;
            await supabase
              .from("kids")
              .update({ anonymous_uid: anonymousUid })
              .eq("id", kidId);
            console.log("[verify_pin] Stored anonymous_uid:", anonymousUid);
          }
        } catch (e) {
          console.error("[verify_pin] createUser THREW:", e);
        }
      }

      // Ensure the anonymous user has an email (backfill for users created before this change)
      if (anonymousUid) {
        const kidEmail = `kid-${kidId}@loopo.internal`;
        try {
          console.log("[verify_pin] Checking email backfill for:", anonymousUid);
          const { data: existingUser } = await supabase.auth.admin.getUserById(anonymousUid);
          if (existingUser?.user && !existingUser.user.email) {
            console.log("[verify_pin] Backfilling email for anonymous user");
            await supabase.auth.admin.updateUserById(anonymousUid, {
              email: kidEmail,
              email_confirm: true,
            });
          }
        } catch (e) {
          console.error("[verify_pin] Email backfill THREW:", e);
        }
      }

      // Generate a magic link token so the frontend can establish a Supabase session
      let hashedToken: string | null = null;
      if (anonymousUid) {
        try {
          const kidEmail = `kid-${kidId}@loopo.internal`;
          console.log("[verify_pin] Generating magic link for:", kidEmail);
          const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: "magiclink",
            email: kidEmail,
          });
          console.log("[verify_pin] generateLink result - error:", linkError, "| has token:", !!linkData?.properties?.hashed_token);
          if (!linkError && linkData?.properties?.hashed_token) {
            hashedToken = linkData.properties.hashed_token;
          } else {
            console.error("[verify_pin] generateLink failed:", linkError);
          }
        } catch (e) {
          console.error("[verify_pin] generateLink THREW:", e);
        }
      } else {
        console.log("[verify_pin] Skipping magic link - no anonymousUid");
      }

      console.log("[verify_pin] Returning success. anonymous_uid:", anonymousUid, "| has hashed_token:", !!hashedToken);
      return new Response(
        JSON.stringify({
          success: true,
          kid: { id: kid.id, name: kid.name, avatar: kid.avatar, anonymous_uid: anonymousUid },
          hashed_token: hashedToken,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
