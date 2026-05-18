ALTER TABLE public.tasks
  ADD COLUMN video_url text,
  ADD COLUMN voice_url text,
  ADD COLUMN parent_voice_url text;