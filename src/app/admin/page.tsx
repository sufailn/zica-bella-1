"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, Order, UserProfile } from '@/lib/supabase';

// Extended interface for orders with joined user data
interface OrderWithUser extends Order {
  user_profile?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ProfileGuard from '@/components/common/ProfileGuard';
import ProductManagement from '@/components/admin/ProductManagement';
import { 
  IoGridOutline, 
  IoReceiptOutline, 
  IoPeopleOutline, 
  IoStatsChartOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoCloseCircle
} from 'react-icons/io5';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
}

const AdminDashboard = () => {
  const { userProfile, loading } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
  });
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      loadDashboardStats();
    }
  }, [userProfile]);

  useEffect(() => {
    if (activeTab === 'orders' && userProfile?.role === 'admin') {
      loadOrders();
    } else if (activeTab === 'users' && userProfile?.role === 'admin') {
      loadUsers();
    }
  }, [activeTab, userProfile]);

  const loadDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      // Debug environment variables
      console.log('Environment check:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        service: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        supabaseAdmin: 'Using API routes now'
      });
      
      console.log('Loading dashboard stats via API...');
      
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load dashboard statistics');
      }
      
      console.log('Dashboard stats API response:', data);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      showToast('Failed to load dashboard statistics', 'error');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      console.log('Loading orders via API...');
      
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load orders');
      }
      
      console.log('Orders API response:', data);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load users');
      }
      
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // For now, just show a message - can implement API route later if needed
      showToast('Order status update feature will be implemented via API', 'info');
      console.log('Update order:', orderId, 'to status:', newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Failed to update order status', 'error');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'customer' | 'admin') => {
    try {
      // For now, just show a message - can implement API route later if needed
      showToast('User role update feature will be implemented via API', 'info');
      console.log('Update user:', userId, 'to role:', newRole);
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast('Failed to update user role', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'shipped': return 'text-orange-600 bg-orange-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'text-purple-600 bg-purple-100' : 'text-blue-600 bg-blue-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileGuard requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-black text-white">
        <Navbar isHome={false} />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">
              Manage your e-commerce platform
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8 mb-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 pb-4 ${
                activeTab === 'overview'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <IoStatsChartOutline size={20} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 pb-4 ${
                activeTab === 'products'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <IoGridOutline size={20} />
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 pb-4 ${
                activeTab === 'orders'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <IoReceiptOutline size={20} />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 pb-4 ${
                activeTab === 'users'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <IoPeopleOutline size={20} />
              Users
            </button>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Orders</p>
                        <p className="text-2xl font-bold">
                          {isLoadingStats ? '...' : stats.totalOrders}
                        </p>
                      </div>
                      <IoReceiptOutline size={32} className="text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold">
                          {isLoadingStats ? '...' : `₹${stats.totalRevenue.toLocaleString()}`}
                        </p>
                      </div>
                      <IoStatsChartOutline size={32} className="text-green-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-2xl font-bold">
                          {isLoadingStats ? '...' : stats.totalUsers}
                        </p>
                      </div>
                      <IoPeopleOutline size={32} className="text-purple-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Pending Orders</p>
                        <p className="text-2xl font-bold">
                          {isLoadingStats ? '...' : stats.pendingOrders}
                        </p>
                      </div>
                      <IoCloseCircle size={32} className="text-yellow-400" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('products')}
                      className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                    >
                      <IoGridOutline size={24} />
                      <div className="text-left">
                        <p className="font-medium">Manage Products</p>
                        <p className="text-sm text-gray-400">Add, edit, or remove products</p>
                      </div>
                    </button>
                    
                    <a
                      href="/admin/orders"
                      className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                    >
                      <IoReceiptOutline size={24} />
                      <div className="text-left">
                        <p className="font-medium">Order Management</p>
                        <p className="text-sm text-gray-400">Advanced order management dashboard</p>
                      </div>
                    </a>
                    
                    <button
                      onClick={() => setActiveTab('users')}
                      className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                    >
                      <IoPeopleOutline size={24} />
                      <div className="text-left">
                        <p className="font-medium">Manage Users</p>
                        <p className="text-sm text-gray-400">View users and manage roles</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <ProductManagement />
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Order Management</h2>
                  <div className="flex items-center gap-4">
                    <a
                      href="/admin/orders"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm"
                    >
                      Advanced Order Management
                    </a>
                    <div className="text-sm text-gray-400">
                      Total: {orders.length} orders
                    </div>
                  </div>
                </div>

                {isLoadingOrders ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-gray-900 p-12 rounded-lg text-center">
                    <IoReceiptOutline size={64} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders found</h3>
                    <p className="text-gray-400 mb-4">Orders will appear here when customers make purchases.</p>
                    <div className="space-y-2">
                      <button
                        onClick={async () => {
                          try {
                            console.log('Creating test order via API...');
                            
                            const response = await fetch('/api/admin/orders', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                user_id: userProfile.id
                              })
                            });
                            
                            const data = await response.json();
                            
                            if (!response.ok) {
                              throw new Error(data.error || 'Failed to create test order');
                            }
                            
                            console.log('Created test order:', data);
                            showToast('Test order created successfully', 'success');
                            loadOrders();
                            loadDashboardStats();
                          } catch (error) {
                            console.error('Error creating test order:', error);
                            showToast('Failed to create test order: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Create Test Order
                      </button>
                      
                      <button
                        onClick={async () => {
                          try {
                            console.log('Checking orders count via API...');
                            const response = await fetch('/api/admin/orders');
                            const data = await response.json();
                            
                            if (!response.ok) {
                              throw new Error(data.error || 'Failed to check orders');
                            }
                            
                            console.log('Orders count check:', data);
                            showToast(`Found ${data.count || 0} orders in database`, 'info');
                          } catch (error) {
                            console.error('Error checking orders:', error);
                            showToast('Failed to check orders', 'error');
                          }
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Check Orders Count
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-gray-900 p-6 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                            <p className="text-gray-400 text-sm">
                              Customer: {order.user_profile?.first_name || 'N/A'} {order.user_profile?.last_name || ''}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Email: {order.user_profile?.email || 'N/A'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Date: {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">₹{order.total_amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-400 capitalize">
                              Payment: {order.payment_method || 'N/A'} ({order.payment_status})
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="text-sm text-gray-400">
                              {order.order_items?.length || 0} item(s)
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              <IoEyeOutline size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <div className="text-sm text-gray-400">
                    Total: {users.length} users
                  </div>
                </div>

                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="bg-gray-900 p-12 rounded-lg text-center">
                    <IoPeopleOutline size={64} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No users found</h3>
                    <p className="text-gray-400">Registered users will appear here.</p>
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="text-left p-4">User</th>
                            <th className="text-left p-4">Email</th>
                            <th className="text-left p-4">Role</th>
                            <th className="text-left p-4">Joined</th>
                            <th className="text-left p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user, index) => (
                            <tr key={user.id} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
                              <td className="p-4">
                                <div>
                                  <p className="font-medium">
                                    {user.first_name} {user.last_name}
                                  </p>
                                  <p className="text-sm text-gray-400">ID: {user.id.substring(0, 8)}...</p>
                                </div>
                              </td>
                              <td className="p-4 text-gray-300">{user.email}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-4 text-gray-400 text-sm">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <select
                                  value={user.role}
                                  onChange={(e) => updateUserRole(user.id, e.target.value as 'customer' | 'admin')}
                                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
                                  disabled={user.id === userProfile.id} // Can't change own role
                                >
                                  <option value="customer">Customer</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

        <Footer />
      </div>
    </ProfileGuard>
  );
};

export default AdminDashboard; 