import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/products/[id]/colors - Get colors for a specific product
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
    const productId = parseInt(idString)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const { data: colors, error } = await supabaseAdmin
      .from('product_colors')
      .select(`
        id,
        color_id,
        available,
        colors:color_id (
          id,
          name,
          value
        )
      `)
      .eq('product_id', productId)

    if (error) {
      console.error('Error fetching product colors:', error)
      return NextResponse.json(
        { error: 'Failed to fetch product colors' },
        { status: 500 }
      )
    }

    return NextResponse.json({ colors })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 