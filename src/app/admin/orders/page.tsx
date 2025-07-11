"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ProfileGuard from '@/components/common/ProfileGuard';
import { IoSearch, IoFilter, IoEye, IoPencil, IoDownload, IoRefresh, IoChevronDown, IoChevronUp, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface OrderItem {
  id: string;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  selected_color?: string;
  selected_size?: string;
  item_total: number;
}

interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  shipping_address: any;
  billing_address: any;
  notes: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  user_profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const AdminOrdersPage = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0, pending: 0, confirmed: 0, processing: 0,
    shipped: 0, delivered: 0, cancelled: 0, totalRevenue: 0
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'total_amount' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter, paymentFilter, sortBy, sortOrder]);

  // Load orders when page or filters change
  useEffect(() => {
    loadOrders();
  }, [pagination.page, debouncedSearch, statusFilter, paymentFilter, sortBy, sortOrder]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('payment_status', paymentFilter);

      const url = `/api/admin/orders?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setOrders(data.orders || []);
      setOrderStats(data.stats || {
        total: 0, pending: 0, confirmed: 0, processing: 0,
        shipped: 0, delivered: 0, cancelled: 0, totalRevenue: 0
      });
      setPagination(data.pagination || {
        page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
      });
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast(`Failed to load orders: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      
      // Set empty state on error
      setOrders([]);
      setOrderStats({
        total: 0, pending: 0, confirmed: 0, processing: 0,
        shipped: 0, delivered: 0, cancelled: 0, totalRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      showToast('Order status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Failed to update order status', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-800 bg-yellow-100';
      case 'confirmed': return 'text-blue-800 bg-blue-100';
      case 'processing': return 'text-purple-800 bg-purple-100';
      case 'shipped': return 'text-orange-800 bg-orange-100';
      case 'delivered': return 'text-green-800 bg-green-100';
      case 'cancelled': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-800 bg-green-100';
      case 'pending': return 'text-yellow-800 bg-yellow-100';
      case 'failed': return 'text-red-800 bg-red-100';
      case 'refunded': return 'text-blue-800 bg-blue-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const exportOrders = async () => {
    try {
      // Export all orders matching current filters (not just current page)
      const params = new URLSearchParams({
        limit: '1000', // Large limit for export
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('payment_status', paymentFilter);

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to export orders');
      }

      const csv = [
        'Order Number,Customer,Email,Status,Payment Status,Total,Date',
        ...data.orders.map((order: Order) => [
          order.order_number,
          `${order.user_profiles?.first_name || ''} ${order.user_profiles?.last_name || ''}`.trim(),
          order.user_profiles?.email || '',
          order.status,
          order.payment_status,
          order.total_amount,
          new Date(order.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting orders:', error);
      showToast('Failed to export orders', 'error');
    }
  };

  const changePage = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <ProfileGuard requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-black text-white">
        <Navbar isHome={false} />
        
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Order Management</h1>
                <p className="text-gray-400">
                  Manage all customer orders • Showing {orders.length} of {pagination.total} orders
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={loadOrders}
                  className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                  disabled={loading}
                >
                  <IoRefresh className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
                <button
                  onClick={exportOrders}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  <IoDownload />
                  Export CSV
                </button>
                <Link
                  href="/admin"
                  className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Back to Admin
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{orderStats.total}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{orderStats.pending}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-blue-500">{orderStats.confirmed}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Processing</p>
                <p className="text-2xl font-bold text-purple-500">{orderStats.processing}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Shipped</p>
                <p className="text-2xl font-bold text-orange-500">{orderStats.shipped}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-green-500">{orderStats.delivered}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold">₹{orderStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-900 p-6 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search Orders</label>
                  <div className="relative">
                    <IoSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Order number, customer name, email..."
                      className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Payment</label>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'created_at' | 'total_amount' | 'status')}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                  >
                    <option value="created_at">Date</option>
                    <option value="total_amount">Amount</option>
                    <option value="status">Status</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No orders found</p>
                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' ? (
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-2">No orders have been placed yet</p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-900 rounded-lg overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">#{order.order_number}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(order.payment_status)}`}>
                                {order.payment_status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              <p>Customer: {order.user_profiles?.first_name} {order.user_profiles?.last_name} ({order.user_profiles?.email})</p>
                              <p>Date: {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                              <p>Payment: {order.payment_method?.toUpperCase()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold">₹{order.total_amount.toLocaleString()}</p>
                              <p className="text-sm text-gray-400">
                                {order.order_items?.length || 0} item(s)
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                className="p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                                title="Toggle details"
                              >
                                {expandedOrder === order.id ? <IoChevronUp /> : <IoChevronDown />}
                              </button>
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                title="View full details"
                              >
                                <IoEye />
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Quick Status Update */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm font-medium">Update Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={updatingStatus === order.id}
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:border-white focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {updatingStatus === order.id && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedOrder === order.id && (
                        <div className="border-t border-gray-700 p-6 bg-gray-800">
                          <h4 className="font-semibold mb-3">Order Items</h4>
                          <div className="space-y-2 mb-4">
                            {order.order_items && order.order_items.length > 0 ? (
                              order.order_items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                  <span>
                                    {item.product_name}
                                    {item.selected_color && ` (${item.selected_color}`}
                                    {item.selected_size && `, ${item.selected_size}`}
                                    {(item.selected_color || item.selected_size) && ')'}
                                    {' '}x{item.quantity}
                                  </span>
                                  <span>₹{item.item_total.toLocaleString()}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded">
                                ⚠️ No order items found for this order.
                              </div>
                            )}
                          </div>
                          
                          {order.shipping_address && (
                            <div>
                              <h4 className="font-semibold mb-2">Shipping Address</h4>
                              <div className="text-sm text-gray-400">
                                <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                                <p>{order.shipping_address.address}</p>
                                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                                <p>{order.shipping_address.country}</p>
                                {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IoChevronBack />
                      Previous
                    </button>
                    
                    <span className="text-gray-400">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <IoChevronForward />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </ProfileGuard>
  );
};

export default AdminOrdersPage; 