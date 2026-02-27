import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
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
        return new Response(JSON.stringify({ error: "Family code not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get kids for this family (without pin_hash)
      const { data: kids } = await supabase
        .from("kids")
        .select("id, name, age, avatar")
        .eq("family_id", family.id);

      return new Response(
        JSON.stringify({ family: { id: family.id, name: family.family_name }, kids: kids || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Verify PIN
    if (action === "verify_pin") {
      if (!kidId || !pin || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: kid, error } = await supabase
        .from("kids")
        .select("id, name, avatar, pin_hash, family_id")
        .eq("id", kidId)
        .single();

      if (error || !kid) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const isValid = await bcrypt.compare(pin, kid.pin_hash);

      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid PIN" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          kid: { id: kid.id, name: kid.name, avatar: kid.avatar },
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
