import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Validate required fields
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

// GET /api/orders - Get orders for a user (requires authentication)
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

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 