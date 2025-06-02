"use client";
import { SwiperSlide, Swiper } from "swiper/react";
import "swiper/css";

const CategorySection = () => {
  return (
    <div className="product-section">
      <h2>Featured Products</h2>
    <div className="product-list">
        <Swiper
            spaceBetween={16}
            slidesPerView={2.5}
            breakpoints={{
                640: { slidesPerView: 3.5 },
                1024: { slidesPerView: 4.5 },
            }}
        >
            {/* Example product items */}
            <SwiperSlide>
                <div className="product-card">Product 1</div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="product-card">Product 2</div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="product-card">Product 3</div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="product-card">Product 4</div>
            </SwiperSlide>
        </Swiper>
    </div>
    </div>
  );
}

export default CategorySection;

const Card = ({ product }:any) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span>${product.price}</span>
    </div>
  );
}