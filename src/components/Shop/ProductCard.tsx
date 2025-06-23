"use client"
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col w-[250px] md:w-[280px] mx-auto">
      <div className="relative w-full h-[260px] md:h-[300px]">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          className="h-full"
          modules={[Pagination]}
          pagination={{ clickable: true, el: undefined, bulletClass: 'swiper-pagination-bullet', bulletActiveClass: 'swiper-pagination-bullet-active', renderBullet: (index, className) => `<span class='${className}'></span>` }}
        >
          {product.images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={img}
                alt={product.name}
                className="object-cover w-full h-[260px] md:h-[300px]"
                loading="lazy"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <style jsx global>{`
          .swiper-pagination {
            position: absolute;
            bottom: 8px;
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
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-medium text-lg mb-1 truncate">{product.name}</h3>
        <div className="text-gray-500 text-sm mb-2">${product.price}</div>
        <button className="mt-auto bg-black text-white rounded-md py-2 px-4 hover:bg-gray-800 transition">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard; 