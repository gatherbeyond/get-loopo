CREATE POLICY "Authenticated users can view available products"
  ON products FOR SELECT
  TO authenticated
  USING (available = true);