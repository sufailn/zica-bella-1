import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PUT /api/colors/[id] - Update a color
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
        { error: 'Invalid color ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, value } = body

    if (!name || !value) {
      return NextResponse.json(
        { error: 'Name and color value are required' },
        { status: 400 }
      )
    }

    // Validate hex color format
    if (!/^#[0-9A-F]{6}$/i.test(value)) {
      return NextResponse.json(
        { error: 'Color value must be a valid hex code (e.g., #FF0000)' },
        { status: 400 }
      )
    }

    // Check if name already exists for other colors
    const { data: existingColor } = await supabaseAdmin
      .from('colors')
      .select('id')
      .eq('name', name.trim())
      .neq('id', id)
      .single()

    if (existingColor) {
      return NextResponse.json(
        { error: 'Color name already exists' },
        { status: 400 }
      )
    }

    const { data: color, error } = await supabaseAdmin
      .from('colors')
      .update({
        name: name.trim(),
        value: value.toUpperCase()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Color not found' },
          { status: 404 }
        )
      }
      console.error('Error updating color:', error)
      return NextResponse.json(
        { error: 'Failed to update color' },
        { status: 500 }
      )
    }

    return NextResponse.json({ color })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/colors/[id] - Delete a color
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
        { error: 'Invalid color ID' },
        { status: 400 }
      )
    }

    // Check if color is being used by products
    const { data: productColors } = await supabaseAdmin
      .from('product_colors')
      .select('id')
      .eq('color_id', id)
      .limit(1)

    if (productColors && productColors.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete color that is being used by products' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('colors')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting color:', error)
      return NextResponse.json(
        { error: 'Failed to delete color' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Color deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 