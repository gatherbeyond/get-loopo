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

      const isValid = bcrypt.compareSync(pin, kid.pin_hash);

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
      if (!anonymousUid) {
        try {
          const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
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
          console.error("Failed to create anonymous user:", e);
          // Login still succeeds without anonymous_uid
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          kid: { id: kid.id, name: kid.name, avatar: kid.avatar, anonymous_uid: anonymousUid },
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
