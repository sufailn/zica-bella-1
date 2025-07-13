"use client";
import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Product } from '@/context/ProductContext';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (color?: string, size?: string, quantity?: number) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart 
}) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  React.useEffect(() => {
    if (product && isOpen) {
      // Set default selections
      if (product.colors && product.colors.length > 0) {
        const availableColor = product.colors.find(c => c.available);
        setSelectedColor(availableColor ? availableColor.name : '');
      }
      if (product.sizes && product.sizes.length > 0) {
        const availableSize = product.sizes.find(s => s.available);
        setSelectedSize(availableSize ? availableSize.name : '');
      }
      setQuantity(1);
    }
  }, [product, isOpen]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if color is required and selected
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }
    
    // Check if size is required and selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }

    onAddToCart(selectedColor, selectedSize, quantity);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-black">Select Options</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <IoClose className="text-xl text-black" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Product Info */}
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 flex-shrink-0">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div>
                <h3 className="font-medium text-black">{product.name}</h3>
                <p className="text-lg font-semibold text-black">₹{product.price.toLocaleString()}</p>
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-black mb-3">
                  Color {selectedColor && <span className="text-gray-500">({selectedColor})</span>}
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => color.available && setSelectedColor(color.name)}
                      disabled={!color.available}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                        selectedColor === color.name 
                          ? 'border-black ring-2 ring-gray-300' 
                          : 'border-gray-300'
                      } ${!color.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-black mb-3">Size</h4>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => size.available && setSelectedSize(size.name)}
                      disabled={!size.available}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 ${
                        selectedSize === size.name
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-black hover:border-gray-400'
                      } ${!size.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-black mb-3">Quantity</h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-lg font-medium min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 text-black rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.soldOut}
                className={`flex-1 py-2 rounded-md transition font-medium ${
                  product.soldOut
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {product.soldOut ? 'Sold Out' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductSelectionModal; 