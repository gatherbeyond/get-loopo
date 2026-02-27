-- RLS policies for kids table (parent-scoped via family ownership)
CREATE POLICY "Parents can read family kids"
  ON kids FOR SELECT TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can insert family kids"
  ON kids FOR INSERT TO authenticated
  WITH CHECK (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can update family kids"
  ON kids FOR UPDATE TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can delete family kids"
  ON kids FOR DELETE TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));