import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/debug/check-admin-by-email - Check if an email has admin role
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check user role using admin client (bypasses RLS)
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single()

    return NextResponse.json({
      success: true,
      email,
      found: !!profile,
      profile: profile,
      isAdmin: profile?.role === 'admin',
      role: profile?.role || null,
      error: error?.message || null
    })

  } catch (error) {
    console.error('Check admin by email error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 