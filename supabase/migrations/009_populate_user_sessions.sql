-- Populate user sessions based on existing user profiles
-- This creates sample session data for existing users

-- Function to create user sessions for existing users
CREATE OR REPLACE FUNCTION populate_user_sessions()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
  session_token TEXT;
BEGIN
  -- Loop through all existing user profiles
  FOR user_record IN SELECT * FROM user_profiles LOOP
    -- Generate a sample session token
    session_token := 'session_' || user_record.id || '_' || extract(epoch from now())::text;
    
    -- Insert a user session record
    INSERT INTO user_sessions (
      user_id,
      session_token,
      device_info,
      ip_address,
      last_activity,
      expires_at
    ) VALUES (
      user_record.id,
      session_token,
      jsonb_build_object(
        'browser', 'Chrome',
        'os', 'Windows',
        'device', 'Desktop'
      ),
      '192.168.1.100'::inet,
      NOW() - INTERVAL '1 hour',
      NOW() + INTERVAL '7 days'
    )
    ON CONFLICT DO NOTHING; -- Avoid duplicates if sessions already exist
  END LOOP;
  
  RAISE NOTICE 'User sessions populated for % users', (SELECT COUNT(*) FROM user_profiles);
END;
$$ LANGUAGE plpgsql;

-- Execute the function to populate sessions
SELECT populate_user_sessions();

-- Create some sample orders if none exist
INSERT INTO orders (
  user_id,
  order_number,
  status,
  subtotal,
  shipping_cost,
  tax_amount,
  total_amount,
  payment_method,
  payment_status,
  shipping_address,
  notes
)
SELECT 
  up.id,
  'ORD' || LPAD((ROW_NUMBER() OVER (ORDER BY up.created_at))::text, 6, '0'),
  (ARRAY['pending', 'confirmed', 'processing', 'shipped', 'delivered'])[1 + (random() * 4)::int],
  99.99,
  10.00,
  11.00,
  120.99,
  (ARRAY['card', 'upi', 'cod'])[1 + (random() * 2)::int],
  (ARRAY['pending', 'paid'])[1 + (random() * 1)::int],
  jsonb_build_object(
    'name', COALESCE(up.first_name || ' ' || up.last_name, 'Sample User'),
    'address', '123 Sample Street',
    'city', 'Sample City',
    'state', 'Sample State',
    'postal_code', '12345',
    'country', 'India'
  ),
  'Sample order created for testing'
FROM user_profiles up
WHERE up.role = 'customer'
  AND NOT EXISTS (SELECT 1 FROM orders WHERE user_id = up.id)
LIMIT 5; -- Create max 5 sample orders

-- Create sample order items for the orders
INSERT INTO order_items (
  order_id,
  product_id,
  product_name,
  product_price,
  quantity,
  selected_color,
  selected_size,
  item_total
)
SELECT 
  o.id,
  1, -- Assumes at least one product exists with id=1
  'Sample Product',
  99.99,
  1,
  'Blue',
  'M',
  99.99
FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = o.id)
LIMIT 5;

-- Add some helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_activity ON user_sessions(user_id, last_activity);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);

-- Clean up the function
DROP FUNCTION IF EXISTS populate_user_sessions();

-- Add comments
COMMENT ON TABLE user_sessions IS 'Contains active and historical user sessions for tracking';
COMMENT ON TABLE orders IS 'Customer orders with sample data for testing'; 