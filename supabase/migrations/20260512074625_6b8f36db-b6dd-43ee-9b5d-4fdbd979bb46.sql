-- Add interests array column to kids table
ALTER TABLE public.kids
ADD COLUMN interests text[] DEFAULT '{}';

-- Document the column purpose
COMMENT ON COLUMN public.kids.interests IS 'Interest categories selected during kid onboarding (e.g., Gaming, Sports, Art)';