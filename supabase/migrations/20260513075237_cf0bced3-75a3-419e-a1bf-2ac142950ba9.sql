CREATE OR REPLACE FUNCTION public.complete_kid_onboarding(
  kid_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.kids
  SET onboarding_completed_at = now(),
      updated_at = now()
  WHERE id = kid_id;
END;
$$;