CREATE POLICY "Kids can insert own deal requests"
ON public.parent_deals
FOR INSERT
TO authenticated
WITH CHECK (kid_id IN (
  SELECT kids.id FROM public.kids
  WHERE kids.anonymous_uid = auth.uid()
));