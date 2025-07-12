import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Cache for admin orders data
const adminOrdersCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Helper function to check cache validity
const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Helper function to get cache key
const getCacheKey = (params: URLSearchParams) => {
  return `admin_orders_${params.toString()}`;
};

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

    // Check cache first
    const cacheKey = getCacheKey(searchParams);
    const cachedData = adminOrdersCache.get(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return NextResponse.json(cachedData.data, {
        headers: {
          'Cache-Control': 'public, max-age=120', // 2 minutes
        }
      });
    }

    const offset = (page - 1) * limit

    // Build optimized query with proper joins
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
        ),
        user_profiles!orders_user_id_fkey (
          id,
          first_name,
          last_name,
          email
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

    // Get optimized statistics using single aggregation query
    const { data: statsData, error: statsError } = await supabaseAdmin
      .rpc('get_order_statistics')
      .single();

    if (statsError) {
      console.error('Error loading order statistics:', statsError);
    }

    // Process stats results with proper type handling
    const stats = statsData as any;
    const orderStats = {
      total: Number(stats?.total_orders) || 0,
      pending: Number(stats?.pending_orders) || 0,
      confirmed: Number(stats?.confirmed_orders) || 0,
      processing: Number(stats?.processing_orders) || 0,
      shipped: Number(stats?.shipped_orders) || 0,
      delivered: Number(stats?.delivered_orders) || 0,
      cancelled: Number(stats?.cancelled_orders) || 0,
      totalRevenue: Number(stats?.total_revenue) || 0
    };

    const response = {
      orders: orders || [],
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
    };

    // Cache the response
    adminOrdersCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });

    // Clean up old cache entries periodically
    if (adminOrdersCache.size > 50) {
      const now = Date.now();
      for (const [key, value] of adminOrdersCache.entries()) {
        if (!isCacheValid(value.timestamp)) {
          adminOrdersCache.delete(key);
        }
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=120', // 2 minutes
      }
    });
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