-- Update RLS policies for orders and users to ensure admin access
-- This migration adds specific policies for admin access to orders and users

-- First, drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can manage own orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage all orders" ON orders;
DROP POLICY IF EXISTS "Users can manage own order items" ON order_items;
DROP POLICY IF EXISTS "Service role can manage all order items" ON order_items;

-- Create comprehensive policies for orders
-- 1. Users can view and manage their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Service role can do everything (for API operations)
CREATE POLICY "Service role full access to orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- 3. Admin users can view and manage all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Create comprehensive policies for order_items
-- 1. Users can manage their own order items (through orders)
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- 2. Service role can do everything
CREATE POLICY "Service role full access to order items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

-- 3. Admins can view and manage all order items
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Update user_profiles policies to ensure admins can view all users
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;

-- Create new comprehensive policies for user_profiles
-- 1. Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Service role can do everything
CREATE POLICY "Service role full access to user profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- 3. Admins can view and manage all user profiles
CREATE POLICY "Admins can view all user profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all user profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role = 'admin'
    )
  );

-- Create a function to check if current user is admin (avoiding recursion)
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role directly using service role context
  SELECT role INTO user_role 
  FROM user_profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role = 'admin', FALSE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative admin policies using the function (commented out for now)
-- These can be used instead if the above policies still cause issues

/*
-- Alternative admin policies using the function
CREATE POLICY "Admins view orders (function)" ON orders
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Admins update orders (function)" ON orders
  FOR UPDATE USING (is_current_user_admin());

CREATE POLICY "Admins view users (function)" ON user_profiles
  FOR SELECT USING (is_current_user_admin() OR auth.uid() = id);

CREATE POLICY "Admins update users (function)" ON user_profiles
  FOR UPDATE USING (is_current_user_admin() OR auth.uid() = id);
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_items TO service_role;

-- Create indexes for better performance on admin queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_admin ON user_profiles(role) WHERE role = 'admin';
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at ON orders(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Add some helpful comments
COMMENT ON POLICY "Admins can view all orders" ON orders IS 'Allows admin users to view all orders in the system';
COMMENT ON POLICY "Admins can view all user profiles" ON user_profiles IS 'Allows admin users to view all user profiles';
COMMENT ON FUNCTION is_current_user_admin() IS 'Helper function to check if current user has admin role'; 