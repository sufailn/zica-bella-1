import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Cache for orders data
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (shorter for orders as they update more frequently)

// Helper function to check cache validity
const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Helper function to get cache key
const getCacheKey = (params: URLSearchParams) => {
  return `orders_${params.toString()}`;
};

// POST /api/orders - Create a new order
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
      cart_items, 
      customer_info, 
      shipping_info, 
      payment_info,
      subtotal,
      shipping_cost,
      total_amount 
    } = body

    // Validation
    if (!user_id || !cart_items || !customer_info || !shipping_info || !payment_info) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id,
        subtotal: subtotal || 0,
        shipping_cost: shipping_cost || 0,
        total_amount: total_amount || 0,
        payment_method: payment_info.method,
        payment_status: payment_info.method === 'cod' ? 'pending' : 'paid',
        shipping_address: {
          first_name: customer_info.firstName,
          last_name: customer_info.lastName,
          email: customer_info.email,
          phone: customer_info.phone,
          address: shipping_info.address,
          city: shipping_info.city,
          state: shipping_info.state,
          postal_code: shipping_info.pincode,
          country: shipping_info.country
        },
        billing_address: {
          first_name: customer_info.firstName,
          last_name: customer_info.lastName,
          email: customer_info.email,
          phone: customer_info.phone,
          address: shipping_info.address,
          city: shipping_info.city,
          state: shipping_info.state,
          postal_code: shipping_info.pincode,
          country: shipping_info.country
        }
      }])
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = cart_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity,
      selected_color: item.selectedColor,
      selected_size: item.selectedSize,
      item_total: item.product.price * item.quantity
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback order creation if items creation fails
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', order.id)
      
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // Clear cache for this user after order creation
    const keysToDelete = [];
    for (const key of cache.keys()) {
      if (key.includes(user_id)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));

    return NextResponse.json({ 
      order: {
        ...order,
        order_items: orderItems
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/orders - Get orders for a user with pagination and caching
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
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeItems = searchParams.get('include_items') !== 'false' // Default to true

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = getCacheKey(searchParams);
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return NextResponse.json(cachedData.data, {
        headers: {
          'Cache-Control': 'public, max-age=120', // 2 minutes
        }
      });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    // Build optimized query
    const selectClause = includeItems ? `
      id,
      order_number,
      status,
      total_amount,
      payment_method,
      payment_status,
      created_at,
      order_items (
        id,
        product_name,
        product_price,
        quantity,
        selected_color,
        selected_size,
        item_total
      )
    ` : `
      id,
      order_number,
      status,
      total_amount,
      payment_method,
      payment_status,
      created_at
    `;

    const offset = page * limit;
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(selectClause)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Prepare response
    const response = {
      orders: orders || [],
      totalCount: totalCount || 0,
      page,
      limit,
      hasMore: (orders?.length || 0) === limit,
    };

    // Cache the response
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });

    // Clean up old cache entries periodically
    if (cache.size > 50) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (!isCacheValid(value.timestamp)) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=120', // 2 minutes
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