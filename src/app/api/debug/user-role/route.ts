import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/debug/user-role - Check current user's authentication and role status
export async function GET(request: NextRequest) {
  try {
    // Create supabase client with cookies context for server-side
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user session from cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({
        authenticated: false,
        error: authError.message,
        user: null,
        profile: null,
        isAdmin: false,
        message: 'Authentication error'
      })
    }

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        profile: null,
        isAdmin: false,
        message: 'No user session found'
      })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile: null,
        profileError: profileError.message,
        isAdmin: false,
        message: 'User authenticated but profile not found'
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profile,
      isAdmin: profile?.role === 'admin',
      message: `User authenticated with role: ${profile?.role || 'none'}`
    })

  } catch (error) {
    console.error('Debug user role error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      authenticated: false,
      user: null,
      profile: null,
      isAdmin: false
    }, { status: 500 })
  }
} 