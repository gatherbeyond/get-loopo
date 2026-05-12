DROP TRIGGER IF EXISTS validate_parent_deal_status_trigger ON public.parent_deals;
DROP FUNCTION IF EXISTS public.validate_parent_deal_status();

CREATE OR REPLACE FUNCTION public.validate_parent_deal_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('requested', 'active', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be requested, active, completed, or cancelled.', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_parent_deal_status_trigger
BEFORE INSERT OR UPDATE ON public.parent_deals
FOR EACH ROW
EXECUTE FUNCTION public.validate_parent_deal_status();