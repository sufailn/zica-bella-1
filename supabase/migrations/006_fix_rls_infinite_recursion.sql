-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all shipping addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Admins can view all sessions" ON user_sessions;

-- Create simpler, non-recursive policies for user_profiles
-- Users can view and update their own profile
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Service role can do everything (for API operations)
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Create non-recursive admin policies for other tables
-- For orders: admins can manage all, users can manage their own
CREATE POLICY "Users can manage own orders" ON orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- For order_items: linked to orders policy
CREATE POLICY "Users can manage own order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all order items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

-- For shipping_addresses: users can manage their own
CREATE POLICY "Users can manage own addresses" ON shipping_addresses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all addresses" ON shipping_addresses
  FOR ALL USING (auth.role() = 'service_role');

-- For user_sessions: users can manage their own
CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all sessions" ON user_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Update the is_admin function to be simpler and avoid recursion
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Use service role to bypass RLS
  SELECT role INTO user_role 
  FROM user_profiles 
  WHERE id = user_uuid;
  
  RETURN COALESCE(user_role = 'admin', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 