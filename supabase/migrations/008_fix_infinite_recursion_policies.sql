-- Fix infinite recursion in RLS policies
-- Remove recursive policies and rely on service role for admin operations

-- Drop the problematic recursive admin policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all user profiles" ON user_profiles;

-- Keep only the essential non-recursive policies
-- For user_profiles: users can manage their own, service role can do everything
-- (These should already exist from the previous migration)

-- For orders: users can manage their own, service role can do everything
-- (These should already exist from the previous migration)

-- For order_items: users can manage their own, service role can do everything
-- (These should already exist from the previous migration)

-- Update the is_current_user_admin function to be safer
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Always return false for regular policy checks to avoid recursion
  -- Admin operations should use service role instead
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment explaining the approach
COMMENT ON FUNCTION is_current_user_admin() IS 'Returns false to avoid RLS recursion. Admin operations use service role instead.';

-- Ensure service role has proper access
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_items TO service_role;
GRANT ALL ON shipping_addresses TO service_role;

-- Add a note about admin access
COMMENT ON TABLE orders IS 'Admin access is handled via service role to avoid RLS recursion issues';
COMMENT ON TABLE user_profiles IS 'Admin access is handled via service role to avoid RLS recursion issues'; 