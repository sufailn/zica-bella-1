"use client"
import React, { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from 'swiper/modules';
import { useProducts } from "@/context/ProductContext";
import { useToast } from "@/context/ToastContext";
import ProductSelectionModal from "@/components/common/ProductSelectionModal";
import 'swiper/css';
import 'swiper/css/pagination';

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  soldOut?: boolean;
}

const ProductCard = ({ product, isNotLastColumn }: { product: Product, isNotLastColumn: boolean }) => {
  const { addToCart, getProductById } = useProducts();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();
    
    // Get full product data
    const fullProduct = getProductById(product.id);
    
    // Check if product has variants (colors or sizes)
    if (fullProduct && ((fullProduct.colors && fullProduct.colors.length > 0) || (fullProduct.sizes && fullProduct.sizes.length > 0))) {
      setIsModalOpen(true);
      return;
    }
    
    // Add directly to cart if no variants
    addToCart(product.id, 1);
    showToast(`${product.name} added to cart!`, 'success', 3000);
    
    // Show feedback
    const button = e.currentTarget as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = '<svg class="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    setTimeout(() => {
      button.innerHTML = originalText;
    }, 1000);
  };

  const handleModalAddToCart = (color?: string, size?: string, quantity?: number) => {
    addToCart(product.id, quantity || 1, color, size);
    showToast(`${product.name} added to cart!`, 'success', 3000);
  };

  return (
    <>
      <Link href={`/shop/${product.id}`} className="block">
        <div className="group relative bg-black overflow-hidden pb-4 cursor-pointer" style={{borderRight: isNotLastColumn ? '2px solid #000' : 'none'}}>
          {/* Product Image */}
          <div className="relative h-80 aspect-[3/4] w-full overflow-hidden bg-gray-900">
            <Swiper
              spaceBetween={0}
              slidesPerView={1}
              className="h-full"
              modules={[Autoplay, Pagination]}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              loop={true}
              allowTouchMove={false}
              pagination={{ 
                clickable: true, 
                el: undefined, 
                bulletClass: 'swiper-pagination-bullet11', 
                bulletActiveClass: 'swiper-pagination-bullet-active11', 
                renderBullet: (index, className) => `<span class='${className}'></span>` 
              }}
            >
              {product.images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img
                    src={img}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Sold Out Badge */}
            {product.soldOut && (
              <div className="absolute top-3 right-3 bg-black px-3 py-1 text-xs font-medium text-white z-20">
                SOLD OUT
              </div>
            )}
            
            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              disabled={product.soldOut}
              className={`absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-colors duration-200 z-20 ${
                product.soldOut 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-white hover:bg-gray-50 hover:scale-110'
              }`}
            >
              <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            
          
          </div>
        </div>      
        {/* Product Info */}
        <div className="mt-4 space-y-1 px-2 text-center">
          <h3 className="text-sm font-medium text-white uppercase tracking-wide">
            {product.name}
          </h3>
          <p className="text-sm text-white font-medium font-poppins">
            ${product.price}
          </p>
        </div>
      </Link>
      
      {/* Product Selection Modal - Outside Link */}
      <ProductSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={getProductById(product.id) || null}
        onAddToCart={handleModalAddToCart}
      />
    </>
  );
};

export default ProductCard; 