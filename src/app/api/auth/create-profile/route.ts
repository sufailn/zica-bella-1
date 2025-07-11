import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/auth/create-profile - Manually create or update user profile
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { user_id, email, first_name, last_name, phone } = body

    if (!user_id || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          first_name: first_name || existingProfile.first_name,
          last_name: last_name || existingProfile.last_name,
          phone: phone || existingProfile.phone,
        })
        .eq('id', user_id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        profile: updatedProfile,
        action: 'updated'
      })
    } else {
      // Create new profile
      const { data: newProfile, error } = await supabaseAdmin
        .from('user_profiles')
        .insert([{
          id: user_id,
          email,
          first_name: first_name || '',
          last_name: last_name || '',
          phone: phone || '',
          role: email.includes('admin') ? 'admin' : 'customer'
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        profile: newProfile,
        action: 'created'
      })
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/auth/create-profile - Fix all users without profiles
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json(
        { error: 'Failed to fetch auth users' },
        { status: 500 }
      )
    }

    // Get existing profiles
    const { data: existingProfiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || [])
    const usersWithoutProfiles = authUsers.users.filter(user => !existingProfileIds.has(user.id))

    if (usersWithoutProfiles.length === 0) {
      return NextResponse.json({ 
        message: 'All users already have profiles',
        created: 0
      })
    }

    // Create profiles for users without them
    const profilesToCreate = usersWithoutProfiles.map(user => ({
      id: user.id,
      email: user.email || '',
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      phone: user.user_metadata?.phone || '',
      role: (user.email || '').includes('admin') ? 'admin' : 'customer'
    }))

    const { data: createdProfiles, error: createError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profilesToCreate)
      .select()

    if (createError) {
      console.error('Error creating profiles:', createError)
      return NextResponse.json(
        { error: 'Failed to create profiles' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Successfully created missing profiles',
      created: createdProfiles?.length || 0,
      profiles: createdProfiles
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 