-- Add RLS policies for tasks table

CREATE POLICY "Parents can read family tasks"
  ON tasks FOR SELECT TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can insert family tasks"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can update family tasks"
  ON tasks FOR UPDATE TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can delete family tasks"
  ON tasks FOR DELETE TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));