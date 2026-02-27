import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the authenticated user has completed onboarding (has a family).
 * Returns the redirect path: '/parent' if family exists, '/signup?step=2' if not.
 */
export async function getPostAuthRedirect(): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return "/parent-login";
  }

  const { data: family } = await supabase
    .from("families")
    .select("id")
    .eq("parent_id", user.id)
    .maybeSingle();

  return family ? "/parent" : "/signup?step=2";
}
