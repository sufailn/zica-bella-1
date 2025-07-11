import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/colors - Get all colors
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { data: colors, error } = await supabaseAdmin
      .from('colors')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching colors:', error)
      return NextResponse.json(
        { error: 'Failed to fetch colors' },
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

// POST /api/colors - Create a new color
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
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

    const { data: color, error } = await supabaseAdmin
      .from('colors')
      .insert({ name: name.trim(), value: value.toUpperCase() })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Color name already exists' },
          { status: 400 }
        )
      }
      console.error('Error creating color:', error)
      return NextResponse.json(
        { error: 'Failed to create color' },
        { status: 500 }
      )
    }

    return NextResponse.json({ color }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 