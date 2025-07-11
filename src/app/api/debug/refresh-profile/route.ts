import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/debug/refresh-profile - Force refresh user profile with admin access
export async function POST() {
  try {
    // Create supabase client with cookies context for server-side
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user session from cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Authentication required',
        details: authError?.message || 'No user session found'
      }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Service role not configured'
      }, { status: 500 })
    }

    // Use admin client to fetch profile (bypasses RLS)
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Also try with regular client (now with proper session)
    const { data: regularProfile, error: regularError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      user_id: user.id,
      email: user.email,
      admin_client_result: {
        profile: adminProfile,
        error: adminError?.message
      },
      regular_client_result: {
        profile: regularProfile,
        error: regularError?.message
      },
      comparison: {
        same_role: adminProfile?.role === regularProfile?.role,
        admin_role: adminProfile?.role,
        regular_role: regularProfile?.role
      }
    })

  } catch (error) {
    console.error('Refresh profile error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 