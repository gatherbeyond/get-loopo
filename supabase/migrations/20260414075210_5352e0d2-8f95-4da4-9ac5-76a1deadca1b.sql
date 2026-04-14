-- Table 1: family_reward_templates (global catalog)
CREATE TABLE public.family_reward_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  tier TEXT NOT NULL,
  default_credits INTEGER NOT NULL,
  category TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.family_reward_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read templates"
  ON public.family_reward_templates FOR SELECT
  TO authenticated USING (true);

-- Table 2: family_rewards (per-family rewards)
CREATE TABLE public.family_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  credits_cost INTEGER NOT NULL,
  tier TEXT,
  icon_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_from_template_id UUID REFERENCES public.family_reward_templates(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.family_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can select family rewards"
  ON public.family_rewards FOR SELECT TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can insert family rewards"
  ON public.family_rewards FOR INSERT TO authenticated
  WITH CHECK (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can update family rewards"
  ON public.family_rewards FOR UPDATE TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can delete family rewards"
  ON public.family_rewards FOR DELETE TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

CREATE POLICY "Kids can select active family rewards"
  ON public.family_rewards FOR SELECT TO authenticated
  USING (
    is_active = true
    AND family_id IN (SELECT family_id FROM kids WHERE anonymous_uid = auth.uid())
  );

-- Table 3: family_reward_requests
CREATE TABLE public.family_reward_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kid_id UUID NOT NULL REFERENCES public.kids(id) ON DELETE CASCADE,
  family_reward_id UUID NOT NULL REFERENCES public.family_rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'requested',
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  parent_note TEXT
);

ALTER TABLE public.family_reward_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can select family reward requests"
  ON public.family_reward_requests FOR SELECT TO authenticated
  USING (kid_id IN (
    SELECT k.id FROM kids k
    JOIN families f ON k.family_id = f.id
    WHERE f.parent_id = auth.uid()
  ));

CREATE POLICY "Parents can update family reward requests"
  ON public.family_reward_requests FOR UPDATE TO authenticated
  USING (kid_id IN (
    SELECT k.id FROM kids k
    JOIN families f ON k.family_id = f.id
    WHERE f.parent_id = auth.uid()
  ));

CREATE POLICY "Kids can insert own reward requests"
  ON public.family_reward_requests FOR INSERT TO authenticated
  WITH CHECK (kid_id IN (SELECT id FROM kids WHERE anonymous_uid = auth.uid()));

CREATE POLICY "Kids can select own reward requests"
  ON public.family_reward_requests FOR SELECT TO authenticated
  USING (kid_id IN (SELECT id FROM kids WHERE anonymous_uid = auth.uid()));

-- Seed templates
INSERT INTO public.family_reward_templates (title, tier, default_credits, category) VALUES
  ('Chocolate or Sweets for Dessert', 'easy', 500, 'Food and Treats'),
  ('Favorite Snack of Choice', 'easy', 500, 'Food and Treats'),
  ('Choose What to Watch Tonight', 'easy', 500, 'Screen and Device'),
  ('Family Game Night', 'easy', 500, 'Activities'),
  ('Extra Screen Time 30 mins', 'medium', 1000, 'Screen and Device'),
  ('Extra Gaming Time', 'medium', 1000, 'Screen and Device'),
  ('Stay Up Late 30 mins', 'medium', 1000, 'Bedtime and Privileges'),
  ('No Homework Check Tonight', 'medium', 1000, 'Bedtime and Privileges'),
  ('Movie Night at Home', 'medium', 1000, 'Activities'),
  ('Bake Something Together', 'medium', 1000, 'Activities'),
  ('Invite a Friend Over', 'medium', 1000, 'Activities'),
  ('Breakfast in Bed', 'medium', 1000, 'Food and Treats'),
  ('Extra Screen Time 1 Hour', 'hard', 1500, 'Screen and Device'),
  ('Stay Up Late 1 Hour', 'hard', 1500, 'Bedtime and Privileges'),
  ('Skip a Chore', 'hard', 1500, 'Bedtime and Privileges'),
  ('Choose Tonight''s Dinner', 'hard', 1500, 'Food and Treats'),
  ('Order Food Tonight', 'hard', 1500, 'Food and Treats'),
  ('One-on-One Day with Mom', 'hard', 1500, 'Quality Time'),
  ('One-on-One Day with Dad', 'hard', 1500, 'Quality Time'),
  ('Pick the Weekend Activity', 'hard', 1500, 'Activities'),
  ('Mall Trip', 'hard', 1500, 'Activities');

-- CHECK constraint for valid status values
ALTER TABLE public.family_reward_requests
  ADD CONSTRAINT valid_status CHECK (status IN ('requested', 'approved', 'denied', 'fulfilled'));