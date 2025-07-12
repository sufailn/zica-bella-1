import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Get user if session exists
    let userProfile = null;
    let profileError = null;
    
    if (session?.user) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        userProfile = data;
        profileError = error;
      } catch (err) {
        profileError = err;
      }
    }
    
    // Environment check
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    };
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      session: {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        expiresAt: session?.expires_at,
        isExpired: session?.expires_at ? new Date(session.expires_at * 1000) < new Date() : null,
      },
      sessionError: sessionError ? (sessionError as any)?.message || sessionError : null,
      profile: {
        exists: !!userProfile,
        id: userProfile?.id,
        email: userProfile?.email,
        role: userProfile?.role,
        firstName: userProfile?.first_name,
        lastName: userProfile?.last_name,
      },
      profileError: profileError ? (profileError as any)?.message || profileError : null,
      cookies: {
        hasAuthCookie: !!request.cookies.get('sb-access-token'),
        hasRefreshCookie: !!request.cookies.get('sb-refresh-token'),
      },
      headers: {
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      }
    };
    
    return NextResponse.json(debugInfo, { status: 200 });
    
  } catch (error) {
    console.error('Debug auth status error:', error);
    
    return NextResponse.json({
      error: 'Failed to get auth status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 