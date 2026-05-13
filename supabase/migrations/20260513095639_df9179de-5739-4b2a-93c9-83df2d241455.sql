ALTER TABLE public.tasks
ADD COLUMN celebration_seen boolean NOT NULL DEFAULT false;

UPDATE public.tasks
SET celebration_seen = true
WHERE status = 'completed';

CREATE OR REPLACE FUNCTION public.mark_celebration_seen(task_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tasks
  SET celebration_seen = true
  WHERE id = task_id;
END;
$$;