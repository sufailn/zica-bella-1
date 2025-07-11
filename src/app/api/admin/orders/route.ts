import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/orders - Get orders for admin with pagination and filters
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const payment_status = searchParams.get('payment_status')
    const search = searchParams.get('search')
    const sort_by = searchParams.get('sort_by') || 'created_at'
    const sort_order = searchParams.get('sort_order') || 'desc'

    const offset = (page - 1) * limit

    // First, get orders with order_items
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        user_id,
        order_number,
        status,
        subtotal,
        shipping_cost,
        tax_amount,
        total_amount,
        payment_method,
        payment_status,
        shipping_address,
        billing_address,
        notes,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          product_name,
          product_price,
          quantity,
          selected_color,
          selected_size,
          item_total
        )
      `, { count: 'exact' })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (payment_status && payment_status !== 'all') {
      query = query.eq('payment_status', payment_status)
    }

    // Search functionality (basic - can be enhanced with full-text search)
    if (search && search.trim()) {
      query = query.or(`order_number.ilike.%${search}%`)
    }

    // Apply sorting
    const sortColumn = ['created_at', 'total_amount', 'status'].includes(sort_by) ? sort_by : 'created_at'
    const ascending = sort_order === 'asc'
    
    query = query
      .order(sortColumn, { ascending })
      .range(offset, offset + limit - 1)

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Error loading orders:', error)
      throw error
    }

    // Get user profiles separately to avoid foreign key issues
    let enrichedOrders = orders || []
    if (orders && orders.length > 0) {
      const userIds = [...new Set(orders.map(order => order.user_id))]
      
      const { data: userProfiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds)
      
      if (!profilesError && userProfiles) {
        const profilesMap = userProfiles.reduce((acc, profile) => {
          acc[profile.id] = profile
          return acc
        }, {} as Record<string, any>)
        
        enrichedOrders = orders.map(order => ({
          ...order,
          user_profiles: profilesMap[order.user_id] || null
        }))
      }
    }

    // Get summary statistics (separate lightweight query)
    const { data: stats } = await supabaseAdmin
      .from('orders')
      .select('status, payment_status, total_amount')

    const orderStats = stats ? {
      total: stats.length,
      pending: stats.filter(o => o.status === 'pending').length,
      confirmed: stats.filter(o => o.status === 'confirmed').length,
      processing: stats.filter(o => o.status === 'processing').length,
      shipped: stats.filter(o => o.status === 'shipped').length,
      delivered: stats.filter(o => o.status === 'delivered').length,
      cancelled: stats.filter(o => o.status === 'cancelled').length,
      totalRevenue: stats.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total_amount || 0), 0)
    } : {
      total: 0, pending: 0, confirmed: 0, processing: 0, 
      shipped: 0, delivered: 0, cancelled: 0, totalRevenue: 0
    }

    return NextResponse.json({ 
      orders: enrichedOrders,
      count: count || 0,
      stats: orderStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: (page * limit) < (count || 0),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error loading orders:', error)
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
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(testOrder)
      .select()

    if (error) {
      console.error('Error creating test order:', error)
      throw error
    }

    return NextResponse.json({ order: data[0] })
  } catch (error) {
    console.error('Error creating test order:', error)
    return NextResponse.json(
      { error: 'Failed to create test order' },
      { status: 500 }
    )
  }
} 