"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
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
  const [inView, setInView] = useState(false);
  const [shouldRender, setShouldRender] = useState(index < 4); // initial 4 rendered
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  if (!shouldRender) return <div ref={containerRef} className="h-80" />;

  return (
    <Link href={`/shop/${product.id}`} className="block">
      <div
        className="group relative bg-black overflow-hidden pb-4 cursor-pointer"
        style={{
          borderRight: isNotLastColumn ? "2px solid #000" : "none",
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
    <Swiper
      spaceBetween={0}
      slidesPerView={1}
      className="h-full"
      modules={[Pagination]}
      loop={true}
      pagination={{
        clickable: true,
        el: undefined,
        bulletClass: "swiper-pagination-bullet",
        bulletActiveClass: "swiper-pagination-bullet-active",
        renderBullet: (index, className) =>
          `<span class='${className}'></span>`,
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
  )}

          {/* Sold Out Badge */}
          {product.soldOut && (
            <div className="absolute top-3 right-3 bg-black px-3 py-1 text-xs font-medium text-white z-20">
              SOLD OUT
            </div>
          )}

          {/* Add to Cart Button */}
          <button className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors duration-200 z-20">
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

            .swiper-pagination {
              position: absolute;
              bottom: 0 !important;
              left: 0;
              width: 100%;
              display: flex;
              justify-content: center;
              z-index: 10;
            }

            .swiper-pagination-bullet {
              flex: 1;
              height: 4px;
              margin: 0 0px !important;
              background: #e5e7eb;
              border-radius: 0px;
              opacity: 1;
              transition: background 0.3s;
            }

            .swiper-pagination-bullet-active {
              background: #111;
            }
          `}</style>
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
  );
};

export default ProductCard;
