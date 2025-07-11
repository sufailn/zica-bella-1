import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

// POST /api/orders/[id]/cancel - Cancel an order (user can only cancel their own orders)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    // Get user ID from request body or JWT token
    const body = await request.json().catch(() => ({}))
    const cookieStore = cookies()
    
    // For now, we'll require the user_id to be passed in the request
    // In a production app, you'd verify the JWT token
    let userId = body.user_id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // First, get the order to verify it belongs to the user and can be cancelled
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status, payment_status')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found or access denied' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Order is already cancelled' },
        { status: 400 }
      )
    }

    if (order.status === 'delivered') {
      return NextResponse.json(
        { error: 'Cannot cancel a delivered order' },
        { status: 400 }
      )
    }

    if (order.status === 'shipped') {
      return NextResponse.json(
        { error: 'Cannot cancel a shipped order. Please contact support for returns.' },
        { status: 400 }
      )
    }

    // Update the order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error cancelling order:', updateError)
      throw updateError
    }

    return NextResponse.json({ 
      message: 'Order cancelled successfully',
      order: updatedOrder
    })
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
} 