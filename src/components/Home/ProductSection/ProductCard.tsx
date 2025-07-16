"use client";
import React, { useEffect, useRef, useState, memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useProducts, Product as ProductType } from "@/context/ProductContext";
import ProductSelectionModal from "@/components/common/ProductSelectionModal";
import "swiper/css";
import "swiper/css/pagination";

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  soldOut?: boolean;
}

const ProductCard = ({
  product,
  isNotLastColumn,
  index,
}: {
  product: Product;
  isNotLastColumn: boolean;
  index: number;
}) => {
  const { addToCart, getProductById } = useProducts();
  const [inView, setInView] = useState(false);
  const [shouldRender, setShouldRender] = useState(index < 4); // initial 4 rendered
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
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
    
    // Show feedback
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

  // IntersectionObserver for lazy rendering
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setShouldRender(true); // now allow render
        }
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Preload all images
  useEffect(() => {
    if (!shouldRender) return;

    const preload = async () => {
      const promises = product.images.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve(true);
        });
      });
      await Promise.all(promises);
      setImagesLoaded(true);
    };

    preload();
  }, [shouldRender, product.images]);

  // Memoize Swiper configuration to prevent recreation on every render
  const swiperConfig = useMemo(() => ({
    spaceBetween: 0,
    slidesPerView: 1,
    className: "h-full product-swiper",
    modules: [Pagination],
    loop: product.images.length > 1,
    pagination: product.images.length > 1 ? {
      clickable: true,
      dynamicBullets: false,
      // Use a stable CSS selector instead of renderBullet function
      bulletClass: `swiper-pagination-bullet-${product.id}`,
      bulletActiveClass: `swiper-pagination-bullet-active-${product.id}`,
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

  if (!shouldRender) return <div ref={containerRef} className="h-80" />;

  return (
    <>
      <Link href={`/shop/${product.id}`} className="block">
        <div
          className={`group relative bg-black overflow-hidden pb-4 cursor-pointer ${index % 2 == 0 ? "md:border-l-2 md:border-black" : ""}`}
          style={{
            borderRight: isNotLastColumn && index % 2 == 0 ? "2px solid #000" : "none",
          }}
          ref={containerRef}
        >
          <div className="relative h-80 aspect-[3/4] w-full overflow-hidden bg-gray-900">
            {!imagesLoaded ? (
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
                {inView && (
                  <div className="absolute inset-0 bg-transparent animate-intentionalZoom z-10 pointer-events-none" />
                )}
              </div>
            ) : (
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
              <svg
                className="h-4 w-4 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>

            <style jsx global>{`
              @keyframes zoom {
                0% {
                  transform: scale(1.05);
                }
                100% {
                  transform: scale(1);
                }
              }

              .animate-zoom {
                animation: zoom 1s ease-out forwards;
              }

              .product-swiper .swiper-pagination {
                position: absolute !important;
                bottom: 0 !important;
                left: 0 !important;
                width: 100% !important;
                display: flex !important;
                justify-content: center !important;
                z-index: 10 !important;
                height: 4px !important;
              }

              .swiper-pagination-bullet-${product.id} {
                flex: 1 !important;
                height: 4px !important;
                margin: 0 !important;
                background: #e5e7eb !important;
                border-radius: 0 !important;
                opacity: 1 !important;
                transition: background 0.3s !important;
              }

              .swiper-pagination-bullet-active-${product.id} {
                background: #111 !important;
              }
            `}</style>
          </div>

          {/* Product Info */}
          <div className="mt-4 space-y-1 px-2 text-center">
            <h3 className="text-sm font-medium text-white uppercase tracking-wide">
              {product.name}
            </h3>
            <p className="text-sm text-white font-medium font-poppins">
                              ₹{product.price.toLocaleString()}
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
    </>
  );
};

export default memo(ProductCard);
