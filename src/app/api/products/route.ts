import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const active = searchParams.get('active') !== 'false' // Default to true

    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        product_colors:product_colors(
          id,
          color_id,
          available,
          colors:color_id(
            id,
            name,
            value
          )
        ),
        product_sizes:product_sizes(
          id,
          size_id,
          available,
          sizes:size_id(
            id,
            name,
            display_order
          )
        )
      `)
      .eq('is_active', active)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    
    const {
      name,
      description,
      price,
      images = [],
      category,
      selectedColors = [],
      selectedSizes = [],
      stock_quantity = 0,
      sku,
      is_featured = false,
      is_active = true
    } = body

    // Validation
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Check if SKU already exists (only if SKU is provided and not empty)
    if (sku && sku.trim() !== '') {
      const { data: existingProduct } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('sku', sku.trim())
        .single()

      if (existingProduct) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        )
      }
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description,
        price: parseFloat(price),
        images,
        category,
        stock_quantity: parseInt(stock_quantity),
        sku: sku && sku.trim() !== '' ? sku.trim() : null, // Set to null if empty
        is_featured,
        is_active
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    // Handle colors and sizes relationships
    // Insert product-color relationships
    if (selectedColors && selectedColors.length > 0) {
      const colorInserts = selectedColors.map((colorId: number) => ({
        product_id: product.id,
        color_id: colorId,
        available: true
      }))

      const { error: colorError } = await supabaseAdmin
        .from('product_colors')
        .insert(colorInserts)

      if (colorError) {
        console.error('Error inserting product colors:', colorError)
      }
    }

    // Insert product-size relationships and get size data for legacy column
    if (selectedSizes && selectedSizes.length > 0) {
      const sizeInserts = selectedSizes.map((sizeId: number) => ({
        product_id: product.id,
        size_id: sizeId,
        available: true
      }))

      const { error: sizeError } = await supabaseAdmin
        .from('product_sizes')
        .insert(sizeInserts)

      if (sizeError) {
        console.error('Error inserting product sizes:', sizeError)
      }
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 