-- Add UPDATE policy for credit_settings
CREATE POLICY "Parents can update own credit settings"
ON public.credit_settings
FOR UPDATE
TO authenticated
USING (family_id IN (SELECT families.id FROM families WHERE families.parent_id = auth.uid()))
WITH CHECK (family_id IN (SELECT families.id FROM families WHERE families.parent_id = auth.uid()));

-- Add unique constraint on family_id for upsert support
ALTER TABLE public.credit_settings ADD CONSTRAINT credit_settings_family_id_unique UNIQUE (family_id);