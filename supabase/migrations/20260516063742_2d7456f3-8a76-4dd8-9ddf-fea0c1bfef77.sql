ALTER TABLE public.tasks
ADD COLUMN recurring_frequency text CHECK (recurring_frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly'));

CREATE OR REPLACE FUNCTION public.handle_recurring_task()
RETURNS TRIGGER AS $$
DECLARE
  next_deadline timestamptz;
BEGIN
  IF NEW.status = 'completed' AND NEW.recurring_frequency IS NOT NULL THEN
    next_deadline := CASE NEW.recurring_frequency
      WHEN 'daily'     THEN NOW() + INTERVAL '1 day'
      WHEN 'weekly'    THEN NOW() + INTERVAL '7 days'
      WHEN 'bi-weekly' THEN NOW() + INTERVAL '14 days'
      WHEN 'monthly'   THEN NOW() + INTERVAL '30 days'
      ELSE NULL
    END;
    INSERT INTO public.tasks (
      family_id, kid_id, title, description,
      credits_reward, status, photo_required,
      deadline, recurring_frequency
    ) VALUES (
      NEW.family_id, NEW.kid_id, NEW.title, NEW.description,
      NEW.credits_reward, 'not_started', NEW.photo_required,
      next_deadline, NEW.recurring_frequency
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_task_completed_recurring
AFTER UPDATE ON public.tasks
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.handle_recurring_task();