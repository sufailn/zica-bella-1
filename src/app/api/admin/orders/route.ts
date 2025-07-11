import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/orders - Get all orders for admin
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    console.log('API: Loading orders...')
    
    // First check simple orders
    const { data: simpleOrders, error: simpleError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount, status, created_at')
      .limit(10)
      
    console.log('API: Simple orders check:', { simpleOrders, simpleError, count: simpleOrders?.length })
    
    // Get orders with order_items first
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })

    console.log('API: Orders query result:', { orders, error, count: orders?.length })

    if (error) {
      console.error('API: Orders query error:', error)
      throw error
    }

    // If we have orders, get user profiles separately  
    let enrichedOrders = orders || []
    
    if (orders && orders.length > 0) {
      // Get unique user IDs from orders
      const userIds = [...new Set(orders.map(order => order.user_id))]
      
      // Get user profiles for those users
      const { data: userProfiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds)
        
      console.log('API: User profiles query result:', { userProfiles, profilesError, count: userProfiles?.length })
        
      if (!profilesError && userProfiles) {
        // Create a map of user profiles for quick lookup
        const profilesMap: Record<string, any> = userProfiles.reduce((acc, profile) => {
          acc[profile.id] = profile
          return acc
        }, {} as Record<string, any>)
        
        // Enrich orders with user profile data
        enrichedOrders = orders.map(order => ({
          ...order,
          user_profile: profilesMap[order.user_id] || null
        }))
      }
    }

    console.log('API: Enriched orders:', { count: enrichedOrders?.length })

    return NextResponse.json({ 
      orders: enrichedOrders,
      count: enrichedOrders?.length || 0 
    })
  } catch (error) {
    console.error('API: Error loading orders:', error)
    return NextResponse.json(
      { error: 'Failed to load orders' },
      { status: 500 }
    )
  }
}

// POST /api/admin/orders - Create test order
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const testOrder = {
      user_id,
      order_number: `TEST-${Date.now()}`,
      status: 'pending',
      subtotal: 100.00,
      shipping_cost: 10.00,
      tax_amount: 11.00,
      total_amount: 121.00,
      payment_method: 'card',
      payment_status: 'pending',
      shipping_address: { 
        name: 'Test User', 
        address: '123 Test St', 
        city: 'Test City', 
        state: 'Test State', 
        postal_code: '12345' 
      }
    }

    console.log('API: Creating test order:', testOrder)
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(testOrder)
      .select()

    if (error) {
      console.error('API: Error creating test order:', error)
      throw error
    }

    console.log('API: Created test order:', data)
    return NextResponse.json({ order: data[0] })
  } catch (error) {
    console.error('API: Error creating test order:', error)
    return NextResponse.json(
      { error: 'Failed to create test order' },
      { status: 500 }
    )
  }
} 