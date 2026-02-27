
-- Allow authenticated parents to insert their own families
CREATE POLICY "Parents can insert own family"
  ON families FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

-- Allow authenticated parents to read their own family
CREATE POLICY "Parents can read own family"
  ON families FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

-- Allow authenticated users to insert credit settings for their family
CREATE POLICY "Parents can insert credit settings"
  ON credit_settings FOR INSERT
  TO authenticated
  WITH CHECK (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));

-- Allow authenticated users to read their credit settings
CREATE POLICY "Parents can read own credit settings"
  ON credit_settings FOR SELECT
  TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE parent_id = auth.uid()));
