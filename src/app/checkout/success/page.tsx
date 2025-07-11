"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { motion } from 'framer-motion';

const CheckoutSuccessPage = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: showAnimation ? 1 : 0 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          <IoCheckmarkCircle size={80} className="mx-auto text-green-500 mb-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-gray-400 mb-6">
            Thank you for your purchase. Your order has been successfully placed.
          </p>

          {orderNumber && (
            <div className="bg-gray-900 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-400 mb-1">Order Number</p>
              <p className="text-lg font-semibold">#{orderNumber}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg text-left">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• You'll receive an email confirmation shortly</li>
                <li>• Track your order in your account</li>
                <li>• We'll notify you when your order ships</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/profile?tab=orders"
                className="flex-1 bg-white text-black px-6 py-3 rounded-md hover:bg-gray-200 transition font-medium text-center"
              >
                View Order
              </Link>
              <Link
                href="/shop"
                className="flex-1 border border-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition font-medium text-center"
              >
                Continue Shopping
              </Link>
            </div>

            <Link
              href="/"
              className="block text-gray-400 hover:text-white transition text-sm mt-4"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage; 