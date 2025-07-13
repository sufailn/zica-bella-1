import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    // Sample products data with prices in Indian Rupees
    const sampleProducts = [
      {
        name: 'Classic White T-Shirt',
        description: 'Comfortable cotton t-shirt perfect for everyday wear',
        price: 1499,
        images: ['/shop/products/tshirt-1/p (1).jpeg'],
        category: 'T-Shirts',
        stock_quantity: 50,
        sku: 'TSHIRT-001',
        is_featured: true,
        is_active: true
      },
      {
        name: 'Premium Cotton Shirt',
        description: 'High-quality cotton shirt for formal occasions',
        price: 2999,
        images: ['/shop/products/shirt-1/p (1).jpeg'],
        category: 'Shirts',
        stock_quantity: 30,
        sku: 'SHIRT-001',
        is_featured: true,
        is_active: true
      },
      {
        name: 'Slim Fit Jeans',
        description: 'Modern slim fit jeans with stretch comfort',
        price: 3999,
        images: ['/shop/products/jeans-1/p (1).jpeg'],
        category: 'Jeans',
        stock_quantity: 25,
        sku: 'JEANS-001',
        is_featured: false,
        is_active: true
      },
      {
        name: 'Graphic Print T-Shirt',
        description: 'Stylish graphic print t-shirt with unique design',
        price: 1799,
        images: ['/shop/products/tshirt-2/p (1).jpeg'],
        category: 'T-Shirts',
        stock_quantity: 40,
        sku: 'TSHIRT-002',
        is_featured: false,
        is_active: true
      },
      {
        name: 'Casual Denim Shirt',
        description: 'Versatile denim shirt for casual and smart casual looks',
        price: 3499,
        images: ['/shop/products/shirt-2/p (1).jpeg'],
        category: 'Shirts',
        stock_quantity: 20,
        sku: 'SHIRT-002',
        is_featured: false,
        is_active: true
      }
    ];

    // Insert sample products
    const { data: insertedProducts, error } = await supabaseAdmin
      .from('products')
      .insert(sampleProducts)
      .select()

    if (error) {
      console.error('Error inserting sample products:', error)
      return NextResponse.json(
        { error: 'Failed to insert sample products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Sample products added successfully',
      products: insertedProducts
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 