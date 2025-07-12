import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Cache for addresses data
const addressesCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to check cache validity
const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// GET /api/addresses - Get shipping addresses for a user
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = `addresses_${user_id}`;
    const cachedData = addressesCache.get(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return NextResponse.json(cachedData.data, {
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes
        }
      });
    }

    // Fetch addresses from database
    const { data: addresses, error } = await supabaseAdmin
      .from('shipping_addresses')
      .select('*')
      .eq('user_id', user_id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: 500 }
      )
    }

    const response = {
      addresses: addresses || [],
      count: addresses?.length || 0
    };

    // Cache the response
    addressesCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/addresses - Create a new shipping address
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      user_id, 
      title,
      first_name,
      last_name,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default
    } = body

    // Validation
    if (!user_id || !first_name || !last_name || !address_line1 || !city || !state || !postal_code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the address
    const { data: address, error } = await supabaseAdmin
      .from('shipping_addresses')
      .insert([{
        user_id,
        title: title || 'Home',
        first_name,
        last_name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country: country || 'India',
        phone,
        is_default: is_default || false
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return NextResponse.json(
        { error: 'Failed to create address' },
        { status: 500 }
      )
    }

    // Clear cache for this user
    addressesCache.delete(`addresses_${user_id}`);

    return NextResponse.json({ 
      address,
      message: 'Address created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/addresses - Update a shipping address
export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      id,
      user_id,
      title,
      first_name,
      last_name,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default
    } = body

    if (!id || !user_id) {
      return NextResponse.json(
        { error: 'Address ID and User ID are required' },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (first_name !== undefined) updateData.first_name = first_name
    if (last_name !== undefined) updateData.last_name = last_name
    if (address_line1 !== undefined) updateData.address_line1 = address_line1
    if (address_line2 !== undefined) updateData.address_line2 = address_line2
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (postal_code !== undefined) updateData.postal_code = postal_code
    if (country !== undefined) updateData.country = country
    if (phone !== undefined) updateData.phone = phone
    if (is_default !== undefined) updateData.is_default = is_default

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update the address
    const { data: address, error } = await supabaseAdmin
      .from('shipping_addresses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating address:', error)
      return NextResponse.json(
        { error: 'Failed to update address' },
        { status: 500 }
      )
    }

    // Clear cache for this user
    addressesCache.delete(`addresses_${user_id}`);

    return NextResponse.json({ 
      address,
      message: 'Address updated successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/addresses - Delete a shipping address
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const user_id = searchParams.get('user_id')

    if (!id || !user_id) {
      return NextResponse.json(
        { error: 'Address ID and User ID are required' },
        { status: 400 }
      )
    }

    // Delete the address
    const { error } = await supabaseAdmin
      .from('shipping_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id)

    if (error) {
      console.error('Error deleting address:', error)
      return NextResponse.json(
        { error: 'Failed to delete address' },
        { status: 500 }
      )
    }

    // Clear cache for this user
    addressesCache.delete(`addresses_${user_id}`);

    return NextResponse.json({ 
      message: 'Address deleted successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 