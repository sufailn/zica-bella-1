import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/sizes - Get all sizes
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { data: sizes, error } = await supabaseAdmin
      .from('sizes')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching sizes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sizes' },
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

// POST /api/sizes - Create a new size
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
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

    const { data: size, error } = await supabaseAdmin
      .from('sizes')
      .insert({ name: name.trim().toUpperCase(), display_order: parseInt(display_order) })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Size name already exists' },
          { status: 400 }
        )
      }
      console.error('Error creating size:', error)
      return NextResponse.json(
        { error: 'Failed to create size' },
        { status: 500 }
      )
    }

    return NextResponse.json({ size }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 