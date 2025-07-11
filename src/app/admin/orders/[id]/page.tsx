"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useProducts } from '@/context/ProductContext';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ProfileGuard from '@/components/common/ProfileGuard';
import { IoArrowBack, IoLocationOutline, IoCash, IoCard, IoWallet, IoCopy, IoPencil, IoSave, IoClose, IoPrint } from 'react-icons/io5';
import { motion } from 'framer-motion';

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
  user_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const { getProductById } = useProducts();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load order');
      }
      
      setOrder(data.order);
      setNewStatus(data.order.status);
      setNewNotes(data.order.notes || '');
    } catch (error) {
      console.error('Error loading order:', error);
      showToast('Failed to load order', 'error');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
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

      setOrder({ ...order, status: newStatus });
      setEditingStatus(false);
      showToast('Order status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const updateOrderNotes = async () => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: newNotes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order notes');
      }

      setOrder({ ...order, notes: newNotes });
      setEditingNotes(false);
      showToast('Order notes updated successfully', 'success');
    } catch (error) {
      console.error('Error updating order notes:', error);
      showToast('Failed to update order notes', 'error');
    } finally {
      setUpdating(false);
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

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card': return <IoCard />;
      case 'upi': return <IoWallet />;
      case 'cod': return <IoCash />;
      default: return <IoCash />;
    }
  };

  const copyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      showToast('Order number copied to clipboard', 'success');
    }
  };

  const printOrder = () => {
    window.print();
  };

  const getOrderProgress = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(status);
    
    if (status === 'cancelled') {
      return { currentIndex: 0, steps: ['cancelled'], percentage: 100 };
    }
    
    const percentage = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
    return { currentIndex, steps, percentage };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar isHome={false} />
        <div className="pt-24 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar isHome={false} />
        <div className="pt-24 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-gray-400 mb-6">The order you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/admin/orders')}
              className="bg-white text-black px-6 py-3 rounded-md hover:bg-gray-200 transition font-medium"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = getOrderProgress(order.status);

  return (
    <ProfileGuard requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-black text-white">
        <Navbar isHome={false} />
        
        <div className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/admin/orders')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                  <IoArrowBack className="text-xl" />
                  Back to Orders
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={printOrder}
                  className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  <IoPrint />
                  Print
                </button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Order Header */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
                      <button
                        onClick={copyOrderNumber}
                        className="text-gray-400 hover:text-white transition"
                        title="Copy order number"
                      >
                        <IoCopy />
                      </button>
                    </div>
                    <p className="text-gray-400">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      {editingStatus ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:border-white focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={updateOrderStatus}
                            disabled={updating}
                            className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                          >
                            <IoSave />
                          </button>
                          <button
                            onClick={() => {
                              setEditingStatus(false);
                              setNewStatus(order.status);
                            }}
                            className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                          >
                            <IoClose />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <button
                            onClick={() => setEditingStatus(true)}
                            className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                            title="Edit status"
                          >
                            <IoPencil />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-2xl font-bold">₹{order.total_amount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t border-gray-700 pt-4 mb-4">
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Name</p>
                      <p>{order.user_profile?.first_name} {order.user_profile?.last_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Email</p>
                      <p>{order.user_profile?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Customer ID</p>
                      <p className="font-mono text-xs">{order.user_id}</p>
                    </div>
                  </div>
                </div>

                {/* Order Progress */}
                {order.status !== 'cancelled' && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Order Progress</span>
                      <span>{Math.round(progress.percentage)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-3">
                      {progress.steps.map((step, index) => (
                        <div 
                          key={step}
                          className={`text-xs capitalize ${
                            index <= progress.currentIndex 
                              ? 'text-blue-400 font-medium' 
                              : 'text-gray-500'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item, index) => {
                    const product = getProductById(item.product_id);
                    const productImage = product?.images?.[0] || null;
                    
                    return (
                      <div key={index} className="flex gap-4 p-4 bg-gray-800 rounded-lg">
                        <div className="w-20 h-20 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                          {productImage ? (
                            <img 
                              src={productImage} 
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full"><span class="text-gray-400 text-xs">No Image</span></div>';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product_name}</h3>
                          <div className="text-sm text-gray-400 mt-1">
                            <p>Product ID: {item.product_id}</p>
                            {item.selected_color && <span>Color: {item.selected_color}</span>}
                            {item.selected_color && item.selected_size && <span> • </span>}
                            {item.selected_size && <span>Size: {item.selected_size}</span>}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-400">Qty: {item.quantity}</span>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">₹{item.product_price.toLocaleString()} each</p>
                              <p className="font-medium">₹{item.item_total.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-yellow-500 bg-yellow-500/10 p-4 rounded-lg">
                        <p className="font-medium">⚠️ No order items found</p>
                        <p className="text-sm mt-2 text-gray-400">
                          This order doesn't have any associated items. This might be a data issue that needs investigation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Shipping Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Information */}
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">
                        {getPaymentIcon(order.payment_method || 'cod')}
                      </div>
                      <div>
                        <p className="font-medium">
                          {order.payment_method?.toUpperCase() || 'Cash on Delivery'}
                        </p>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subtotal</span>
                        <span>₹{order.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Shipping</span>
                        <span>₹{order.shipping_cost.toLocaleString()}</span>
                      </div>
                      {order.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tax</span>
                          <span>₹{order.tax_amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg border-t border-gray-700 pt-2">
                        <span>Total</span>
                        <span>₹{order.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <IoLocationOutline />
                    Shipping Address
                  </h2>
                  {order.shipping_address && (
                    <div className="text-gray-300 space-y-1">
                      <p className="font-medium">
                        {order.shipping_address.first_name} {order.shipping_address.last_name}
                      </p>
                      <p>{order.shipping_address.address}</p>
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.country}</p>
                      {order.shipping_address.phone && (
                        <p className="mt-2">Phone: {order.shipping_address.phone}</p>
                      )}
                      {order.shipping_address.email && (
                        <p>Email: {order.shipping_address.email}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Admin Notes</h2>
                  {!editingNotes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
                    >
                      <IoPencil />
                      Edit Notes
                    </button>
                  )}
                </div>
                
                {editingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                      rows={4}
                      placeholder="Add internal notes about this order..."
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={updateOrderNotes}
                        disabled={updating}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition font-medium"
                      >
                        Save Notes
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(false);
                          setNewNotes(order.notes || '');
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-300">
                    {order.notes ? (
                      <p>{order.notes}</p>
                    ) : (
                      <p className="text-gray-500 italic">No notes added</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </ProfileGuard>
  );
};

export default AdminOrderDetailPage; 