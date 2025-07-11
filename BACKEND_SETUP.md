# Supabase Backend Setup for Zica Bella

## 🚀 Quick Setup Guide

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Choose organization and set project details
4. Wait for project to be created (~2 minutes)

### 2. Get Your Keys
From your Supabase dashboard:
- **URL**: Found in Settings > API
- **Anon Key**: Found in Settings > API  
- **Service Role Key**: Found in Settings > API (keep this secret!)

### 3. Environment Variables
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Run Database Migrations
In your Supabase dashboard:
1. Go to **SQL Editor**
2. **First Migration**: Copy and paste the entire content from `supabase/migrations/001_create_products_table.sql`
3. Click **Run** to create all tables and policies
4. **Second Migration**: Copy and paste the entire content from `supabase/migrations/002_create_storage_bucket.sql`
5. Click **Run** to create the storage bucket for images

### 5. Test Your Setup
1. Start your development server: `pnpm dev`
2. Visit `http://localhost:3000/admin` to access the admin dashboard
3. Try creating a test product

## 📋 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products?category=tshirts` - Filter by category
- `GET /api/products?featured=true` - Get featured products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Image Upload
- `POST /api/upload` - Upload images to Supabase Storage
- `DELETE /api/upload?url=...` - Delete image from storage

## 🛡️ Security Features

### Row Level Security (RLS)
- Products are readable by everyone
- Only authenticated users can modify products
- Categories follow the same pattern

### Data Validation
- Required fields validation
- Price must be positive
- SKU uniqueness checks
- Proper error handling

## 📝 Database Schema

### Products Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR, NOT NULL)
- description (TEXT)
- price (DECIMAL, NOT NULL)
- images (TEXT[])
- category (VARCHAR, NOT NULL)
- colors (JSONB)
- sizes (JSONB)
- stock_quantity (INTEGER)
- sku (VARCHAR, UNIQUE)
- is_featured (BOOLEAN)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Categories Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR, UNIQUE, NOT NULL)
- slug (VARCHAR, UNIQUE, NOT NULL)
- description (TEXT)
- created_at (TIMESTAMP)
```

## 🎯 Sample Product Data

Here's a sample product you can create to test:

```json
{
  "name": "Classic Black T-Shirt",
  "description": "Comfortable cotton t-shirt perfect for everyday wear",
  "price": 29.99,
  "category": "tshirts",
  "images": [
    "/shop/image1.jpeg",
    "/shop/image2.jpeg"
  ],
  "colors": [
    { "name": "Black", "value": "#000000", "available": true },
    { "name": "White", "value": "#FFFFFF", "available": true }
  ],
  "sizes": [
    { "name": "S", "available": true },
    { "name": "M", "available": true },
    { "name": "L", "available": true },
    { "name": "XL", "available": true }
  ],
  "stock_quantity": 100,
  "sku": "TS-001-BLK",
  "is_featured": true,
  "is_active": true
}
```

## 🔧 Testing API Endpoints

### Using curl:

```bash
# Get all products
curl http://localhost:3000/api/products

# Create a new product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 25.99,
    "category": "tshirts",
    "images": ["/shop/image1.jpeg"],
    "stock_quantity": 50
  }'

# Update a product
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 30.99}'

# Delete a product
curl -X DELETE http://localhost:3000/api/products/1
```

## 🎨 Admin Dashboard Features

Visit `/admin` to access the admin dashboard:

- ✅ View all products in a table
- ✅ Add new products with full details
- ✅ Edit existing products
- ✅ Delete products
- ✅ **Drag & drop image uploads** to Supabase Storage
- ✅ **Multiple image upload** with preview
- ✅ **Automatic image optimization** and compression
- ✅ Set featured/active status
- ✅ Manage categories, colors, and sizes
- ✅ Real-time validation
- ✅ **Image deletion** from storage when removed

## 🚨 Troubleshooting

### Common Issues:

1. **"Cannot find module '@supabase/supabase-js'"**
   - Run: `pnpm install @supabase/supabase-js`

2. **"Failed to fetch products"**
   - Check your environment variables
   - Make sure Supabase project is running
   - Verify the database migration was successful

3. **"Products are not showing"**
   - Check if RLS policies are applied correctly
   - Make sure products have `is_active = true`

4. **"Permission denied for table products"**
   - Double-check your Service Role Key
   - Ensure RLS policies are set up properly

5. **"Image upload fails"**
   - Make sure the storage bucket was created (migration 002)
   - Check storage policies in Supabase dashboard
   - Verify file size is under 5MB
   - Ensure file type is supported (JPG, PNG, GIF, WebP)

## 💰 Cost Breakdown

**Free Tier Limits:**
- 500MB database storage
- 50MB file storage
- 50,000 monthly active users
- 500,000 API requests

**Perfect for getting started!** 🎉

## 🔄 Data Migration

To migrate existing product data, you can use the API endpoints or SQL inserts:

```sql
-- Example: Insert products directly
INSERT INTO products (name, price, category, images, stock_quantity, is_active) VALUES
  ('Premium T-Shirt', 39.99, 'tshirts', '{"image1.jpg","image2.jpg"}', 75, true),
  ('Casual Shirt', 49.99, 'shirts', '{"shirt1.jpg","shirt2.jpg"}', 50, true),
  ('Denim Jeans', 79.99, 'jeans', '{"jeans1.jpg","jeans2.jpg"}', 30, true);
``` 