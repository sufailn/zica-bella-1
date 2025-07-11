import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PUT /api/sizes/[id] - Update a size
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
        { error: 'Invalid size ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, display_order = 0 } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Size name is required' },
        { status: 400 }
      )
    }

    // Check if name already exists for other sizes
    const { data: existingSize } = await supabaseAdmin
      .from('sizes')
      .select('id')
      .eq('name', name.trim().toUpperCase())
      .neq('id', id)
      .single()

    if (existingSize) {
      return NextResponse.json(
        { error: 'Size name already exists' },
        { status: 400 }
      )
    }

    const { data: size, error } = await supabaseAdmin
      .from('sizes')
      .update({
        name: name.trim().toUpperCase(),
        display_order: parseInt(display_order)
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Size not found' },
          { status: 404 }
        )
      }
      console.error('Error updating size:', error)
      return NextResponse.json(
        { error: 'Failed to update size' },
        { status: 500 }
      )
    }

    return NextResponse.json({ size })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/sizes/[id] - Delete a size
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
        { error: 'Invalid size ID' },
        { status: 400 }
      )
    }

    // Check if size is being used by products
    const { data: productSizes } = await supabaseAdmin
      .from('product_sizes')
      .select('id')
      .eq('size_id', id)
      .limit(1)

    if (productSizes && productSizes.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete size that is being used by products' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('sizes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting size:', error)
      return NextResponse.json(
        { error: 'Failed to delete size' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Size deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 