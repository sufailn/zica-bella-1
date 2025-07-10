"use client";
import React, { useState } from 'react';
import { useProducts } from '@/context/ProductContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoArrowBack, IoCard, IoWallet, IoCash } from 'react-icons/io5';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface PaymentInfo {
  method: 'card' | 'upi' | 'cod';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
}

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useProducts();
  const router = useRouter();
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'card'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/shop" className="bg-white text-black px-6 py-3 rounded-md hover:bg-gray-200 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = 99;
  const totalWithShipping = cartTotal + shippingCost;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Customer info validation
    if (!customerInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!customerInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!customerInfo.email.trim()) newErrors.email = 'Email is required';
    if (!customerInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Shipping info validation
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    if (!shippingInfo.state.trim()) newErrors.state = 'State is required';
    if (!shippingInfo.pincode.trim()) newErrors.pincode = 'Pincode is required';
    
    // Payment validation
    if (paymentInfo.method === 'card') {
      if (!paymentInfo.cardNumber?.trim()) newErrors.cardNumber = 'Card number is required';
      if (!paymentInfo.expiryDate?.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!paymentInfo.cvv?.trim()) newErrors.cvv = 'CVV is required';
    } else if (paymentInfo.method === 'upi') {
      if (!paymentInfo.upiId?.trim()) newErrors.upiId = 'UPI ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear cart and redirect to success page
    clearCart();
    router.push('/checkout/success');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-gray-300">
            <IoArrowBack className="text-xl" />
            Back to Store
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Information */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                      placeholder="Enter last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                      placeholder="Enter email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                      placeholder="Enter phone number"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <textarea
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                      placeholder="Enter full address"
                      rows={3}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                        placeholder="Enter city"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State</label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                        placeholder="Enter state"
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pincode</label>
                      <input
                        type="text"
                        value={shippingInfo.pincode}
                        onChange={(e) => setShippingInfo({...shippingInfo, pincode: e.target.value})}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                        placeholder="Enter pincode"
                      />
                      {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country</label>
                      <select
                        value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                      >
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                
                {/* Payment Method Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentInfo({...paymentInfo, method: 'card'})}
                    className={`p-4 border rounded-lg flex items-center justify-center gap-2 transition ${
                      paymentInfo.method === 'card' 
                        ? 'border-white bg-gray-800' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <IoCard className="text-xl" />
                    <span>Credit/Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentInfo({...paymentInfo, method: 'upi'})}
                    className={`p-4 border rounded-lg flex items-center justify-center gap-2 transition ${
                      paymentInfo.method === 'upi' 
                        ? 'border-white bg-gray-800' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <IoWallet className="text-xl" />
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentInfo({...paymentInfo, method: 'cod'})}
                    className={`p-4 border rounded-lg flex items-center justify-center gap-2 transition ${
                      paymentInfo.method === 'cod' 
                        ? 'border-white bg-gray-800' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <IoCash className="text-xl" />
                    <span>Cash on Delivery</span>
                  </button>
                </div>

                {/* Payment Details */}
                {paymentInfo.method === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number</label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber || ''}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={paymentInfo.expiryDate || ''}
                          onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                          placeholder="MM/YY"
                        />
                        {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input
                          type="text"
                          value={paymentInfo.cvv || ''}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                          placeholder="123"
                        />
                        {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {paymentInfo.method === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">UPI ID</label>
                    <input
                      type="text"
                      value={paymentInfo.upiId || ''}
                      onChange={(e) => setPaymentInfo({...paymentInfo, upiId: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-white focus:outline-none"
                      placeholder="example@upi"
                    />
                    {errors.upiId && <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>}
                  </div>
                )}

                {paymentInfo.method === 'cod' && (
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <p className="text-gray-300">
                      You will pay ₹{totalWithShipping.toLocaleString()} when your order is delivered.
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 p-6 rounded-lg sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
                      <div className="text-xs text-gray-400">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedColor && item.selectedSize && <span> • </span>}
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <span className="text-sm font-medium">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₹{shippingCost}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-2">
                  <span>Total:</span>
                  <span>₹{totalWithShipping.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full mt-6 py-3 bg-white text-black rounded-md hover:bg-gray-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Place Order • ₹${totalWithShipping.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 