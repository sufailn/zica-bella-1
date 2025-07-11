import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    env_check: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✓' : 'Missing ✗',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing ✗',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set ✓' : 'Missing ✗',
    },
    url_length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    anon_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    service_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    node_env: process.env.NODE_ENV
  })
} 