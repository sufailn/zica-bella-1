import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/debug/make-admin - Make current user an admin (for development/setup)
export async function POST(request: NextRequest) {
  try {
    // Create supabase client with cookies context for server-side
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user session to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Authentication required',
        details: authError?.message || 'No user session found'
      }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, confirm } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (confirm !== 'YES_MAKE_ADMIN') {
      return NextResponse.json(
        { 
          error: 'Confirmation required',
          message: 'Please send { "email": "your@email.com", "confirm": "YES_MAKE_ADMIN" }'
        },
        { status: 400 }
      )
    }

    // Additional security: only allow users to make themselves admin
    if (email !== user.email) {
      return NextResponse.json(
        { error: 'Can only make yourself admin' },
        { status: 403 }
      )
    }

    // Find user by email and update their role
    const { data: profile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('email', email)
      .select('*')
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found with that email' },
          { status: 404 }
        )
      }
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been made an admin`,
      profile: profile
    })

  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({
      error: 'Failed to make user admin',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 