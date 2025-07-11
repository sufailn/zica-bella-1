import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/products/[id]/sizes - Get sizes for a specific product
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

    const { data: sizes, error } = await supabaseAdmin
      .from('product_sizes')
      .select(`
        id,
        size_id,
        available,
        sizes:size_id (
          id,
          name,
          display_order
        )
      `)
      .eq('product_id', productId)

    if (error) {
      console.error('Error fetching product sizes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch product sizes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sizes })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 