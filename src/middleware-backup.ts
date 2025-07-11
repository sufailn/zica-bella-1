import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return res
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Get the current session
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error in middleware:', sessionError)
    }

    const isAuthenticated = !!session?.user

    // Debug logging
    console.log('Middleware Debug:', {
      pathname,
      isAuthenticated,
      hasSession: !!session,
      userId: session?.user?.id,
      sessionError: sessionError?.message
    })

    // Admin route protection
    if (pathname.startsWith('/admin')) {
      if (!isAuthenticated) {
        // Redirect to home with auth required message
        const redirectUrl = new URL('/', req.url)
        redirectUrl.searchParams.set('auth_required', 'admin')
        return NextResponse.redirect(redirectUrl)
      }

      // Check if user has admin role using service client
      if (session?.user?.id && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const supabaseService = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
              cookies: {
                getAll() { return [] },
                setAll() {},
              },
            }
          )

          const { data: userProfile, error: profileError } = await supabaseService
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Error checking user role:', profileError)
          }

          if (!userProfile || userProfile.role !== 'admin') {
            // Redirect to home with unauthorized message
            const redirectUrl = new URL('/', req.url)
            redirectUrl.searchParams.set('unauthorized', 'admin')
            return NextResponse.redirect(redirectUrl)
          }
        } catch (error) {
          console.error('Error in admin check:', error)
          const redirectUrl = new URL('/', req.url)
          redirectUrl.searchParams.set('unauthorized', 'admin')
          return NextResponse.redirect(redirectUrl)
        }
      }
    }

    // Profile and orders routes (require authentication)
    if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
      if (!isAuthenticated) {
        const redirectUrl = new URL('/', req.url)
        redirectUrl.searchParams.set('auth_required', 'profile')
        return NextResponse.redirect(redirectUrl)
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 