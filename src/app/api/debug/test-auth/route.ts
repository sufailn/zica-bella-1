import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/debug/test-auth - Comprehensive auth diagnostics
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    // Try with route handler client
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Alternative: Check if we can get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({
      route_handler_client: {
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message || null
      },
      session_check: {
        session: sessionData.session ? { 
          user_id: sessionData.session.user.id,
          expires_at: sessionData.session.expires_at 
        } : null,
        error: sessionError?.message || null
      },
      request_info: {
        method: request.method,
        url: request.url,
        has_cookie_header: !!request.headers.get('cookie'),
        has_auth_header: !!request.headers.get('authorization'),
        cookie_length: request.headers.get('cookie')?.length || 0
      }
    })

  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/debug/test-auth - Alternative admin check using email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json({
        error: 'Email is required for this test'
      }, { status: 400 })
    }
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Service role not configured'
      }, { status: 500 })
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
      profile: profile,
      isAdmin: profile?.role === 'admin',
      error: error?.message || null,
      message: `Direct database lookup for ${email}: ${profile?.role || 'not found'}`
    })
    
  } catch (error) {
    console.error('Alternative admin check error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 