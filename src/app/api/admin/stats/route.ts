import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/stats - Get dashboard statistics
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    console.log('API: Loading dashboard stats...')

    // Load orders stats
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('total_amount, status')

    if (ordersError) {
      console.error('API: Orders stats error:', ordersError)
      throw ordersError
    }

    // Load users count
    const { count: usersCount, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    if (usersError) {
      console.error('API: Users count error:', usersError)
      throw usersError
    }

    const totalOrders = ordersData?.length || 0
    const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
    const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0

    const stats = {
      totalOrders,
      totalRevenue,
      totalUsers: usersCount || 0,
      pendingOrders,
    }

    console.log('API: Dashboard stats:', stats)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('API: Error loading dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard statistics' },
      { status: 500 }
    )
  }
} 