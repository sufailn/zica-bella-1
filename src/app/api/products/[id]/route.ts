import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { id: idString } = await params
    const id = parseInt(idString)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const { data: product, error } = await supabaseAdmin
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
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching product:', error)
      return NextResponse.json(
        { error: 'Failed to fetch product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { id: idString } = await params
    const id = parseInt(idString)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const {
      name,
      description,
      price,
      images,
      category,
      selectedColors,
      selectedSizes,
      stock_quantity,
      sku,
      is_featured,
      is_active
    } = body

    // Validation
    if (name && name.trim() === '') {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      )
    }

    if (price && price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Check if SKU already exists for other products (only if SKU is provided and not empty)
    if (sku && sku.trim() !== '') {
      const { data: existingProduct } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('sku', sku.trim())
        .neq('id', id)
        .single()

      if (existingProduct) {
        return NextResponse.json(
          { error: 'SKU already exists for another product' },
          { status: 400 }
        )
      }
    }

    // Build update object with only provided fields
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (images !== undefined) updateData.images = images
    if (category !== undefined) updateData.category = category
    if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity)
    if (sku !== undefined) updateData.sku = sku && sku.trim() !== '' ? sku.trim() : null
    if (is_featured !== undefined) updateData.is_featured = is_featured
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      )
    }

    // Handle color/size relationships if provided
    if (selectedColors !== undefined) {
      // Delete existing color relationships
      await supabaseAdmin
        .from('product_colors')
        .delete()
        .eq('product_id', id)

      // Insert new color relationships
      if (selectedColors.length > 0) {
        const colorInserts = selectedColors.map((colorId: number) => ({
          product_id: id,
          color_id: colorId,
          available: true
        }))

        const { error: colorError } = await supabaseAdmin
          .from('product_colors')
          .insert(colorInserts)

        if (colorError) {
          console.error('Error updating product colors:', colorError)
        }
      }
    }

    if (selectedSizes !== undefined) {
      // Delete existing size relationships
      await supabaseAdmin
        .from('product_sizes')
        .delete()
        .eq('product_id', id)

      // Insert new size relationships
      if (selectedSizes.length > 0) {
        const sizeInserts = selectedSizes.map((sizeId: number) => ({
          product_id: id,
          size_id: sizeId,
          available: true
        }))

        const { error: sizeError } = await supabaseAdmin
          .from('product_sizes')
          .insert(sizeInserts)

        if (sizeError) {
          console.error('Error updating product sizes:', sizeError)
        }
      }
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { id: idString } = await params
    const id = parseInt(idString)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 