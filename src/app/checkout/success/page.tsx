"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { IoCheckmarkCircle, IoHome, IoStorefront } from 'react-icons/io5';

const CheckoutSuccessPage = () => {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        {/* Success Icon */}
        <div className="mb-6">
          <IoCheckmarkCircle className="text-6xl text-green-500 mx-auto" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-300 mb-2">
          Thank you for your order. You will receive a confirmation email shortly.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Order ID: #ZB{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            href="/" 
            className="w-full inline-flex items-center justify-center gap-2 bg-white text-black py-3 px-6 rounded-md hover:bg-gray-200 transition font-medium"
          >
            <IoHome className="text-lg" />
            Back to Home
          </Link>
          <Link 
            href="/shop" 
            className="w-full inline-flex items-center justify-center gap-2 border border-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-900 transition"
          >
            <IoStorefront className="text-lg" />
            Continue Shopping
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg text-left">
          <h3 className="font-semibold mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• You'll receive an order confirmation email</li>
            <li>• We'll notify you when your order ships</li>
            <li>• Delivery typically takes 3-7 business days</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage; 