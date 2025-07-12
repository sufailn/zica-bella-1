"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useProducts } from '@/context/ProductContext';
import { useProfile } from '@/context/ProfileContext';
import { Order } from '@/lib/supabase';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ProfileGuard from '@/components/common/ProfileGuard';
import { IoArrowBack, IoLocationOutline, IoCash, IoCard, IoWallet, IoCopy } from 'react-icons/io5';
import { motion } from 'framer-motion';

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const { getProductById } = useProducts();
  const { getOrderById, cancelOrder } = useProfile();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  useEffect(() => {
    if (params.id && userProfile) {
      loadOrder();
    }
  }, [params.id, userProfile]);

  const loadOrder = async () => {
    if (!userProfile || !params.id) return;
    
    setLoading(true);
    try {
      const foundOrder = getOrderById(params.id as string);
      
      if (!foundOrder) {
        showToast('Order not found', 'error');
        router.push('/profile?tab=orders');
        return;
      }
      
      setOrder(foundOrder as Order);
    } catch (error) {
      console.error('Error loading order:', error);
      showToast('Failed to load order', 'error');
      router.push('/profile?tab=orders');
    } finally {
      setLoading(false);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const getOrderProgress = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(status);
    
    if (status === 'cancelled') {
      return { currentIndex: 0, steps: ['cancelled'], percentage: 100 };
    }
    
    const percentage = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
    return { currentIndex, steps, percentage };
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancellingOrder(true);
    try {
      const { error } = await cancelOrder(order.id);
      
      if (error) throw error;

      // Update the local order state
      setOrder({ ...order, status: 'cancelled' });
      showToast('Order cancelled successfully', 'success');
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast(error instanceof Error ? error.message : 'Failed to cancel order', 'error');
    } finally {
      setCancellingOrder(false);
    }
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
            <p className="text-gray-400 mb-6">The order you're looking for doesn't exist or doesn't belong to your account.</p>
            <button
              onClick={() => router.push('/profile?tab=orders')}
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
    <ProfileGuard requireAuth={true}>
      <div className="min-h-screen bg-black text-white">
        <Navbar isHome={false} />
        
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => router.push('/profile?tab=orders')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              >
                <IoArrowBack className="text-xl" />
                Back to Orders
              </button>
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-2xl font-bold mt-2">₹{order.total_amount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Order Progress */}
                {order.status !== 'cancelled' && (
                  <div className="mt-6">
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
                  {order.order_items?.map((item, index) => {
                    const product = getProductById(item.product_id);
                    const productImage = product?.images?.[0] || null;
                    
                    return (
                      <div key={index} className="flex gap-4 p-4 bg-gray-800 rounded-lg">
                        <div className="w-16 h-16 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                          {productImage ? (
                            <img 
                              src={productImage} 
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<span class="flex items-center justify-center h-full text-gray-400 text-xs">No Image</span>';
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
                          <p className="text-xs text-gray-500 mt-1">Product ID: {item.product_id}</p>
                          <div className="text-sm text-gray-400 mt-1">
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
                  })}
                </div>
              </div>

              {/* Payment & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              {order.notes && (
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
                  <p className="text-gray-300">{order.notes}</p>
                </div>
              )}

              {/* Order Actions */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Order Actions</h2>
                  <div className="flex gap-4">
                    {order.status === 'pending' || order.status === 'confirmed' ? (
                      <button 
                        onClick={handleCancelOrder}
                        disabled={cancellingOrder}
                        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {cancellingOrder && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        Cancel Order
                      </button>
                    ) : order.status === 'processing' ? (
                      <div className="bg-gray-800 px-6 py-2 rounded-md text-gray-400">
                        Order is being processed - cannot be cancelled
                      </div>
                    ) : order.status === 'shipped' ? (
                      <div className="bg-gray-800 px-6 py-2 rounded-md text-gray-400">
                        Order has been shipped - contact support for returns
                      </div>
                    ) : null}
                    
                    {order.payment_status === 'pending' && order.payment_method !== 'cod' && (
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium">
                        Retry Payment
                      </button>
                    )}
                  </div>
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

export default OrderDetailPage; 