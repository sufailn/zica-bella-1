-- Create colors table
CREATE TABLE colors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  value VARCHAR(7) NOT NULL, -- Hex color code like #FF0000
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sizes table
CREATE TABLE sizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_colors junction table
CREATE TABLE product_colors (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  color_id INTEGER REFERENCES colors(id) ON DELETE CASCADE,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, color_id)
);

-- Create product_sizes junction table
CREATE TABLE product_sizes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  size_id INTEGER REFERENCES sizes(id) ON DELETE CASCADE,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size_id)
);

-- Insert default colors
INSERT INTO colors (name, value) VALUES
  ('Black', '#000000'),
  ('White', '#FFFFFF'),
  ('Red', '#FF0000'),
  ('Blue', '#0000FF'),
  ('Green', '#008000'),
  ('Gray', '#808080'),
  ('Navy', '#000080'),
  ('Brown', '#A52A2A'),
  ('Pink', '#FFC0CB'),
  ('Purple', '#800080'),
  ('Orange', '#FFA500'),
  ('Yellow', '#FFFF00'),
  ('Beige', '#F5F5DC'),
  ('Maroon', '#800000'),
  ('Olive', '#808000');

-- Insert default sizes
INSERT INTO sizes (name, display_order) VALUES
  ('XS', 1),
  ('S', 2),
  ('M', 3),
  ('L', 4),
  ('XL', 5),
  ('XXL', 6),
  ('XXXL', 7),
  ('28', 10),
  ('30', 11),
  ('32', 12),
  ('34', 13),
  ('36', 14),
  ('38', 15),
  ('40', 16),
  ('42', 17);

-- Create indexes for better performance
CREATE INDEX idx_product_colors_product_id ON product_colors(product_id);
CREATE INDEX idx_product_colors_color_id ON product_colors(color_id);
CREATE INDEX idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX idx_product_sizes_size_id ON product_sizes(size_id);
CREATE INDEX idx_sizes_display_order ON sizes(display_order);

-- Enable RLS on new tables
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;

-- Create policies for colors
CREATE POLICY "Colors are viewable by everyone" ON colors FOR SELECT USING (true);
CREATE POLICY "Colors are manageable by service role" ON colors FOR ALL USING (auth.role() = 'service_role');

-- Create policies for sizes
CREATE POLICY "Sizes are viewable by everyone" ON sizes FOR SELECT USING (true);
CREATE POLICY "Sizes are manageable by service role" ON sizes FOR ALL USING (auth.role() = 'service_role');

-- Create policies for product_colors
CREATE POLICY "Product colors are viewable by everyone" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Product colors are manageable by service role" ON product_colors FOR ALL USING (auth.role() = 'service_role');

-- Create policies for product_sizes
CREATE POLICY "Product sizes are viewable by everyone" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Product sizes are manageable by service role" ON product_sizes FOR ALL USING (auth.role() = 'service_role');

-- Remove the old colors and sizes columns from products table (they're now in separate tables)
-- Note: We'll keep them for now to maintain backward compatibility, but they'll be deprecated
ALTER TABLE products ADD COLUMN deprecated_colors JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN deprecated_sizes JSONB DEFAULT '[]';

-- Migrate existing data (if any)
UPDATE products SET 
  deprecated_colors = colors,
  deprecated_sizes = sizes
WHERE colors IS NOT NULL OR sizes IS NOT NULL; 