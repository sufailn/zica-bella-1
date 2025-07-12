"use client"
import React, { useState, useCallback, memo, useMemo } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from 'swiper/modules';
import { useProducts } from "@/context/ProductContext";
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

interface ProductCardProps {
  product: Product;
  isNotLastColumn: boolean;
}

const ProductCard = ({ product, isNotLastColumn }: ProductCardProps) => {
  const { addToCart, getProductById } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fullProduct = getProductById(product.id);
    
    if (fullProduct && ((fullProduct.colors && fullProduct.colors.length > 0) || (fullProduct.sizes && fullProduct.sizes.length > 0))) {
      setIsModalOpen(true);
      return;
    }
    
    addToCart(product.id, 1);
    
    const button = e.currentTarget as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = '<svg class="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    setTimeout(() => {
      button.innerHTML = originalText;
    }, 1000);
  }, [addToCart, getProductById, product.id]);

  const handleModalAddToCart = useCallback((color?: string, size?: string, quantity?: number) => {
    addToCart(product.id, quantity || 1, color, size);
  }, [addToCart, product.id]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Memoize Swiper configuration to prevent recreation and infinite loops
  const swiperConfig = useMemo(() => ({
    spaceBetween: 0,
    slidesPerView: 1,
    className: "h-full sliding-swiper",
    modules: [Autoplay, Pagination],
    autoplay: product.images.length > 1 ? {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    } : false,
    loop: product.images.length > 1,
    allowTouchMove: false,
    pagination: product.images.length > 1 ? {
      clickable: true,
      dynamicBullets: false,
      // Use stable CSS selectors to prevent infinite loops
      bulletClass: `swiper-bullet-sliding-${product.id}`,
      bulletActiveClass: `swiper-bullet-sliding-active-${product.id}`,
    } : false,
    // Disable auto-updates to prevent infinite loops
    observer: false,
    observeParents: false,
    observeSlideChildren: false,
    watchOverflow: true,
    // Prevent unnecessary updates
    updateOnWindowResize: false,
    preventInteractionOnTransition: true,
  }), [product.id, product.images.length]);

  return (
    <>
      <Link href={`/shop/${product.id}`} className="block">
        <div 
          className="group relative bg-black overflow-hidden pb-4 cursor-pointer" 
          style={{borderRight: isNotLastColumn ? '2px solid #000' : 'none'}}
        >
          {/* Product Image */}
          <div className="relative h-80 aspect-[3/4] w-full overflow-hidden bg-gray-900">
            {product.images.length > 1 ? (
              <Swiper {...swiperConfig}>
                {product.images.map((img, idx) => (
                  <SwiperSlide key={`${product.id}-slide-${idx}`}>
                    <img
                      src={img}
                      alt={`${product.name} - Image ${idx + 1}`}
                      className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                      loading="lazy"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                loading="lazy"
              />
            )}
            
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

          {/* Product Info */}
          <div className="mt-4 space-y-1 px-2 text-center">
            <h3 className="text-sm font-medium text-white uppercase tracking-wide">
              {product.name}
            </h3>
            <p className="text-sm text-white font-medium font-poppins">
              ${product.price}
            </p>
          </div>
        </div>      
      </Link>
      
      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={getProductById(product.id) || null}
        onAddToCart={handleModalAddToCart}
      />

      {/* Custom styles for swiper bullets */}
      <style jsx>{`
        :global(.swiper-bullet-sliding-${product.id}) {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          margin: 0 4px !important;
          transition: all 0.3s;
        }
        
        :global(.swiper-bullet-sliding-active-${product.id}) {
          background: #fff;
          transform: scale(1.2);
        }
      `}</style>
    </>
  );
};

export default memo(ProductCard); 