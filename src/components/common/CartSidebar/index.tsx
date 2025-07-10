"use client";
import React from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import { IoClose, IoAdd, IoRemove } from 'react-icons/io5';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { cart, cartTotal, removeFromCart, updateCartItemQuantity } = useProducts();

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItemQuantity(itemId, newQuantity);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-black">Shopping Cart ({cart.length})</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <IoClose className="text-2xl text-black" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-200px)]">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  {/* Product Image */}
                  <div className="w-20 h-20 flex-shrink-0">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-black truncate">
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      {item.selectedColor && item.selectedSize && <span> • </span>}
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    </div>
                    <p className="text-sm font-semibold text-black mt-1">
                      ₹{item.product.price}
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <IoRemove className="text-sm text-black" />
                      </button>
                      <span className="text-sm font-medium min-w-[20px] text-center text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <IoAdd className="text-sm text-black" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-black">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-black">Total:</span>
              <span className="text-xl font-bold text-black">₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              <Link href="/checkout" className="block">
                <button className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-800 transition font-medium">
                  Checkout
                </button>
              </Link>
              <button 
                onClick={onClose}
                className="w-full py-2 border border-gray-300 text-black rounded-md hover:bg-gray-50 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar; 