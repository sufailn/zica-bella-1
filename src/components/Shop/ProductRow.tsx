"use client"
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
}

const ProductRow = ({ title, products }: { title: string; products: Product[] }) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-serif mb-4 px-2">{title}</h2>
      <Swiper
        spaceBetween={20}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
        }}
      >
        {products.map(product => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ProductRow; 