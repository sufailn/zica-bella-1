-- Migration: 011_optimize_admin_orders_performance.sql
-- Description: Add database functions for efficient order statistics calculation

-- Function to get order status counts
CREATE OR REPLACE FUNCTION get_order_status_counts()
RETURNS TABLE(status TEXT, count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    o.status,
    COUNT(*) as count
  FROM orders o
  GROUP BY o.status;
$$;

-- Function to get payment status counts
CREATE OR REPLACE FUNCTION get_payment_status_counts()
RETURNS TABLE(payment_status TEXT, count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    o.payment_status,
    COUNT(*) as count
  FROM orders o
  GROUP BY o.payment_status;
$$;

-- Function to get total revenue from paid orders
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS DECIMAL(10,2)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    COALESCE(SUM(total_amount), 0) as total_revenue
  FROM orders 
  WHERE payment_status = 'paid';
$$;

-- Function to get comprehensive order statistics in one call
CREATE OR REPLACE FUNCTION get_order_statistics()
RETURNS TABLE(
  total_orders BIGINT,
  pending_orders BIGINT,
  confirmed_orders BIGINT,
  processing_orders BIGINT,
  shipped_orders BIGINT,
  delivered_orders BIGINT,
  cancelled_orders BIGINT,
  total_revenue DECIMAL(10,2)
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
    COUNT(*) FILTER (WHERE status = 'processing') as processing_orders,
    COUNT(*) FILTER (WHERE status = 'shipped') as shipped_orders,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
    COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as total_revenue
  FROM orders;
$$;

-- Create additional indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at_desc ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_created_at_desc ON orders(payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at_desc ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number_gin ON orders USING gin(order_number gin_trgm_ops);

-- Enable the pg_trgm extension for faster text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Update statistics
ANALYZE orders;
ANALYZE order_items;
ANALYZE user_profiles; 