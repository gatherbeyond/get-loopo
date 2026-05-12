
-- Add kid_note column for kid-initiated deal requests
ALTER TABLE public.parent_deals
ADD COLUMN IF NOT EXISTS kid_note text;

-- Drop existing status check constraint
ALTER TABLE public.parent_deals
DROP CONSTRAINT IF EXISTS parent_deals_status_check;

-- Recreate status check with 'requested' included
ALTER TABLE public.parent_deals
ADD CONSTRAINT parent_deals_status_check
CHECK (status IN ('requested', 'active', 'completed', 'cancelled'));

-- Make credits_goal nullable (parent sets when approving kid request)
ALTER TABLE public.parent_deals
ALTER COLUMN credits_goal DROP NOT NULL;

-- Make real_cost nullable (parent sets when approving kid request)
ALTER TABLE public.parent_deals
ALTER COLUMN real_cost DROP NOT NULL;
