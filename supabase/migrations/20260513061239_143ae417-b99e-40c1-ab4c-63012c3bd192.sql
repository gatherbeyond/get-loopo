CREATE TABLE public.kid_wishlist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kid_id uuid NOT NULL REFERENCES public.kids(id) ON DELETE CASCADE,
  title text NOT NULL,
  credits_goal integer NOT NULL CHECK (credits_goal > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_kid_wishlist_items_kid_id
  ON public.kid_wishlist_items(kid_id);

ALTER TABLE public.kid_wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kids can insert own wishlist items"
ON public.kid_wishlist_items
FOR INSERT
TO authenticated
WITH CHECK (
  kid_id IN (SELECT kids.id FROM public.kids WHERE kids.anonymous_uid = auth.uid())
);

CREATE POLICY "Kids can read own wishlist items"
ON public.kid_wishlist_items
FOR SELECT
TO authenticated
USING (
  kid_id IN (SELECT kids.id FROM public.kids WHERE kids.anonymous_uid = auth.uid())
);

CREATE POLICY "Kids can update own wishlist items"
ON public.kid_wishlist_items
FOR UPDATE
TO authenticated
USING (
  kid_id IN (SELECT kids.id FROM public.kids WHERE kids.anonymous_uid = auth.uid())
)
WITH CHECK (
  kid_id IN (SELECT kids.id FROM public.kids WHERE kids.anonymous_uid = auth.uid())
);

CREATE POLICY "Kids can delete own wishlist items"
ON public.kid_wishlist_items
FOR DELETE
TO authenticated
USING (
  kid_id IN (SELECT kids.id FROM public.kids WHERE kids.anonymous_uid = auth.uid())
);

CREATE POLICY "Parents can read family wishlist items"
ON public.kid_wishlist_items
FOR SELECT
TO authenticated
USING (
  kid_id IN (
    SELECT k.id FROM public.kids k
    WHERE k.family_id IN (SELECT f.id FROM public.families f WHERE f.parent_id = auth.uid())
  )
);

CREATE TRIGGER update_kid_wishlist_items_updated_at
BEFORE UPDATE ON public.kid_wishlist_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();