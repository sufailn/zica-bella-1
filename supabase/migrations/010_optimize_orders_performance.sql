-- Migration: 010_optimize_orders_performance.sql
-- Description: Add indexes to optimize order queries for better performance

-- Index for orders table queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_created_at ON orders(payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- Index for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Index for user_profiles table
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Full-text search index for order numbers (optional, for future search enhancement)
CREATE INDEX IF NOT EXISTS idx_orders_order_number_gin ON orders USING gin(to_tsvector('english', order_number));

-- Analyze tables to update statistics
ANALYZE orders;
ANALYZE order_items;
ANALYZE user_profiles; 