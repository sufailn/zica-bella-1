"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useProfile } from '@/context/ProfileContext';
import { ShippingAddress } from '@/lib/supabase';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ProfileGuard from '@/components/common/ProfileGuard';
import { IoPersonOutline, IoLocationOutline, IoReceiptOutline, IoAdd, IoPencil, IoTrash } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { OrdersListSkeleton, ProfileFormSkeleton } from '@/components/common/LoadingSkeleton';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

const ProfilePage = () => {
  const { userProfile, updateProfile, loading } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  
  // Use the unified profile context
  const {
    orders,
    ordersCount,
    hasMoreOrders,
    isLoadingOrders,
    isLoadingMoreOrders,
    loadOrders,
    loadMoreOrders,
    refreshOrders,
    addresses,
    addressesCount,
    isLoadingAddresses,
    loadAddresses,
    refreshAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    cancelOrder,
  } = useProfile();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Address form state
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
    isDefault: false,
  });

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders' || tab === 'addresses') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Initialize profile form with user data
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile]);

  // Load orders and addresses when tab changes
  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      loadOrders();
    } else if (activeTab === 'addresses' && addresses.length === 0) {
      loadAddresses();
    }
  }, [activeTab, orders.length, addresses.length, loadOrders, loadAddresses]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await updateProfile({
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
        phone: profileForm.phone,
      });

      if (error) throw error;
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await updateAddress(editingAddress.id, addressForm);
        if (error) throw error;
        showToast('Address updated successfully', 'success');
      } else {
        // Create new address
        const { error } = await createAddress(addressForm);
        if (error) throw error;
        showToast('Address added successfully', 'success');
      }

      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (error) {
      console.error('Error saving address:', error);
      showToast('Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await deleteAddress(addressId);
      if (error) throw error;
      showToast('Address deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast('Failed to delete address', 'error');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      title: 'Home',
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      phone: '',
      isDefault: false,
    });
  };

  const startEditingAddress = (address: ShippingAddress) => {
    setEditingAddress(address);
    setAddressForm({
      title: address.title,
      firstName: address.first_name,
      lastName: address.last_name,
      addressLine1: address.address_line1,
      addressLine2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.is_default,
    });
    setShowAddressForm(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await cancelOrder(orderId);
      if (error) throw error;
      showToast('Order cancelled successfully', 'success');
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast(error instanceof Error ? error.message : 'Failed to cancel order', 'error');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pt-24 max-w-6xl mx-auto px-4">
          <div className="space-y-6">
            <LoadingSkeleton variant="text" className="h-8 w-48" />
            <LoadingSkeleton variant="text" className="h-6 w-96" />
            <div className="flex space-x-8 mb-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <LoadingSkeleton key={index} variant="text" className="h-6 w-20" />
              ))}
            </div>
            <ProfileFormSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileGuard requireAuth={true}>
      <div className="min-h-screen bg-black text-white">
        <Navbar isHome={false} />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Account</h1>
            <p className="text-gray-400">
              Welcome back, {userProfile.first_name || 'User'}!
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8 mb-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 pb-4 ${
                activeTab === 'profile'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <IoPersonOutline size={20} />
              Profile
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
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-2 pb-4 ${
                activeTab === 'addresses'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <IoLocationOutline size={20} />
              Addresses
            </button>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                {loading ? (
                  <ProfileFormSkeleton />
                ) : (
                  <div className="bg-gray-900 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={userProfile.email}
                        disabled
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                        placeholder="Phone number"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition font-medium"
                    >
                      Update Profile
                    </button>
                  </form>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Order History</h2>
                {isLoadingOrders ? (
                  <OrdersListSkeleton />
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <IoReceiptOutline size={64} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-gray-400 mb-4">You haven't placed any orders yet.</p>
                    <a
                      href="/shop"
                      className="inline-block bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition font-medium"
                    >
                      Start Shopping
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                            <p className="text-gray-400 text-sm">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        
                        {/* Order Items Preview */}
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="mb-4">
                            <div className="space-y-2">
                              {order.order_items.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-300">
                                    {item.product_name}
                                    {item.selected_color && ` (${item.selected_color}`}
                                    {item.selected_size && `, ${item.selected_size}`}
                                    {(item.selected_color || item.selected_size) && ')'}
                                    {' '}x{item.quantity}
                                  </span>
                                  <span className="text-gray-400">₹{item.item_total.toLocaleString()}</span>
                                </div>
                              ))}
                              {order.order_items.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{order.order_items.length - 2} more item(s)
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="border-t border-gray-700 pt-4">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <p className="text-sm text-gray-400">
                                {order.order_items?.length || 0} item(s)
                              </p>
                              <p className="text-sm text-gray-400">
                                Payment: {order.payment_method?.toUpperCase() || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₹{order.total_amount.toLocaleString()}</p>
                              <p className="text-sm text-gray-400">
                                Status: {order.payment_status}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <Link
                              href={`/profile/orders/${order.id}`}
                              className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition font-medium text-sm"
                            >
                              View Details
                            </Link>
                            {order.status === 'pending' || order.status === 'confirmed' ? (
                              <button 
                                onClick={() => handleCancelOrder(order.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition font-medium text-sm"
                              >
                                Cancel Order
                              </button>
                            ) : order.status === 'processing' ? (
                              <span className="text-gray-400 text-sm">Order is being processed</span>
                            ) : order.status === 'shipped' ? (
                              <span className="text-gray-400 text-sm">Order has been shipped</span>
                            ) : order.status === 'delivered' ? (
                              <span className="text-gray-400 text-sm">Order has been delivered</span>
                            ) : order.status === 'cancelled' ? (
                              <span className="text-red-400 text-sm">Order has been cancelled</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Load More Button */}
                    {hasMoreOrders && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={loadMoreOrders}
                          disabled={isLoadingMoreOrders}
                          className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isLoadingMoreOrders && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          )}
                          Load More Orders
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Shipping Addresses</h2>
                  <button
                    onClick={() => {
                      resetAddressForm();
                      setEditingAddress(null);
                      setShowAddressForm(true);
                    }}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition font-medium"
                  >
                    <IoAdd size={20} />
                    Add Address
                  </button>
                </div>

                {showAddressForm && (
                  <div className="bg-gray-900 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Address Title</label>
                        <input
                          type="text"
                          value={addressForm.title}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                          placeholder="e.g., Home, Office"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">First Name</label>
                          <input
                            type="text"
                            value={addressForm.firstName}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Last Name</label>
                          <input
                            type="text"
                            value={addressForm.lastName}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Address Line 1</label>
                        <input
                          type="text"
                          value={addressForm.addressLine1}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={addressForm.addressLine2}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">City</label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">State</label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Postal Code</label>
                          <input
                            type="text"
                            value={addressForm.postalCode}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone</label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Country</label>
                          <select
                            value={addressForm.country}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                          >
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="Canada">Canada</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                          className="mr-2"
                        />
                        <label htmlFor="isDefault" className="text-sm">
                          Set as default address
                        </label>
                      </div>
                      
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition font-medium"
                        >
                          {editingAddress ? 'Update Address' : 'Add Address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                            resetAddressForm();
                          }}
                          className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {isLoadingAddresses ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="bg-gray-900 p-6 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <LoadingSkeleton variant="text" className="h-6 w-32" />
                          <LoadingSkeleton variant="text" className="h-4 w-16" />
                        </div>
                        <div className="space-y-2">
                          <LoadingSkeleton variant="text" className="h-4 w-full" />
                          <LoadingSkeleton variant="text" className="h-4 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <IoLocationOutline size={64} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
                    <p className="text-gray-400">Add an address to speed up checkout.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-gray-900 p-6 rounded-lg relative">
                        {address.is_default && (
                          <span className="absolute top-4 right-4 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                        
                        <h3 className="font-semibold mb-2">{address.title}</h3>
                        <div className="text-gray-300 text-sm space-y-1">
                          <p>{address.first_name} {address.last_name}</p>
                          <p>{address.address_line1}</p>
                          {address.address_line2 && <p>{address.address_line2}</p>}
                          <p>{address.city}, {address.state} {address.postal_code}</p>
                          <p>{address.country}</p>
                          {address.phone && <p>Phone: {address.phone}</p>}
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => startEditingAddress(address)}
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                          >
                            <IoPencil size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
                          >
                            <IoTrash size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
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

export default ProfilePage; 