import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/orders/[id] - Get single order with full details for admin
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    console.log('API: Fetching order with ID:', id)

    // Get order with order items first
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single()

    console.log('API: Order query result:', { order: order ? 'found' : 'not found', error, orderItemsCount: order?.order_items?.length || 0 })

    if (error) {
      console.error('API: Error fetching order:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      throw error
    }

    if (!order) {
      console.error('API: Order is null despite no error')
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get user profile separately
    let orderWithProfile = { ...order, user_profile: null }
    
    if (order.user_id) {
      const { data: userProfile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .eq('id', order.user_id)
        .single()
        
      if (!profileError && userProfile) {
        orderWithProfile.user_profile = userProfile
      } else {
        console.log('API: User profile not found or error:', profileError)
      }
    }

    return NextResponse.json({ order: orderWithProfile })
  } catch (error) {
    console.error('API: Error loading order:', error)
    return NextResponse.json(
      { error: 'Failed to load order' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/orders/[id] - Update order status or notes
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes, payment_status } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (payment_status !== undefined) updateData.payment_status = payment_status

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update the order
    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('API: Error updating order:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ 
      order: updatedOrder,
      message: 'Order updated successfully'
    })
  } catch (error) {
    console.error('API: Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/orders/[id] - Delete order (admin only, use with caution)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // First delete order items (due to foreign key constraints)
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('order_id', id)

    if (itemsError) {
      console.error('API: Error deleting order items:', itemsError)
      throw itemsError
    }

    // Then delete the order
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id)

    if (orderError) {
      console.error('API: Error deleting order:', orderError)
      throw orderError
    }

    return NextResponse.json({ 
      message: 'Order deleted successfully'
    })
  } catch (error) {
    console.error('API: Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
} 