CREATE TABLE public.parent_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES public.kids(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  real_cost NUMERIC(10,2) NOT NULL,
  credits_goal INTEGER NOT NULL,
  credits_paid INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  parent_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.parent_deals ENABLE ROW LEVEL SECURITY;

-- Validation trigger for status (instead of CHECK constraint)
CREATE OR REPLACE FUNCTION public.validate_parent_deal_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be active, completed, or cancelled.', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_parent_deal_status_trigger
BEFORE INSERT OR UPDATE ON public.parent_deals
FOR EACH ROW
EXECUTE FUNCTION public.validate_parent_deal_status();

-- Timestamp trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_parent_deals_updated_at
BEFORE UPDATE ON public.parent_deals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Parents can insert deals for their own family
CREATE POLICY "Parents can insert family deals"
ON public.parent_deals
FOR INSERT
TO authenticated
WITH CHECK (family_id IN (SELECT id FROM public.families WHERE parent_id = auth.uid()));

-- Parents can select deals for their own family
CREATE POLICY "Parents can read family deals"
ON public.parent_deals
FOR SELECT
TO authenticated
USING (family_id IN (SELECT id FROM public.families WHERE parent_id = auth.uid()));

-- Parents can update deals for their own family
CREATE POLICY "Parents can update family deals"
ON public.parent_deals
FOR UPDATE
TO authenticated
USING (family_id IN (SELECT id FROM public.families WHERE parent_id = auth.uid()))
WITH CHECK (family_id IN (SELECT id FROM public.families WHERE parent_id = auth.uid()));

-- Kids can select their own deals
CREATE POLICY "Kids can read own deals"
ON public.parent_deals
FOR SELECT
TO authenticated
USING (kid_id IN (SELECT id FROM public.kids WHERE anonymous_uid = auth.uid()));

-- Indexes
CREATE INDEX idx_parent_deals_family_id ON public.parent_deals(family_id);
CREATE INDEX idx_parent_deals_kid_id ON public.parent_deals(kid_id);
CREATE INDEX idx_parent_deals_status ON public.parent_deals(status);