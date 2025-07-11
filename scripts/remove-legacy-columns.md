# Remove Legacy Columns Migration

Run this SQL in your Supabase Dashboard → SQL Editor to remove the old colors and sizes columns:

```sql
-- Remove legacy colors and sizes columns from products table
-- These are no longer needed as we now use proper relational tables

-- Remove the legacy columns
ALTER TABLE products DROP COLUMN IF EXISTS colors;
ALTER TABLE products DROP COLUMN IF EXISTS sizes;
ALTER TABLE products DROP COLUMN IF EXISTS deprecated_colors;
ALTER TABLE products DROP COLUMN IF EXISTS deprecated_sizes;

-- Add comment to document the change
COMMENT ON TABLE products IS 'Products table - colors and sizes are now managed via product_colors and product_sizes junction tables';
```

This will clean up your database schema by removing the old JSON columns that are no longer needed. 