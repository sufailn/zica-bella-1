"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import { getProductById } from "@/data/products";
import 'swiper/css';
import 'swiper/css/navigation';

const ProductDetailPage = () => {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      const productData = getProductById(params.id as string);
      setProduct(productData);
      if (productData?.colors?.length) {
        setSelectedColor(productData.colors[0].name);
      }
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar isHome={false} />
      
      <div className="pt-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* Product Images */}
          <div className="relative">
            <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
              <Swiper
                spaceBetween={0}
                slidesPerView={1}
                navigation={{
                  nextEl: '.swiper-button-next-custom',
                  prevEl: '.swiper-button-prev-custom',
                }}
                modules={[Navigation]}
                className="h-full"
              >
                {product.images.map((image: string, index: number) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Custom Navigation Buttons */}
              <button className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 z-10  rounded-full p-2 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="#fff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 z-10  rounded-full p-2 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="#fff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6 px-4">
            
            {/* Product Title and Price */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-4 uppercase tracking-wide">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-black font-numbers">
                ${product.price}
              </p>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-black uppercase tracking-wide">
                COLOR
              </h3>
              <div className="flex space-x-3">
                {product.colors.map((color: any) => (
                  <button
                    key={color.name}
                    onClick={() => color.available && setSelectedColor(color.name)}
                    disabled={!color.available}
                    className={`
                      w-10 h-10 rounded-full border-2 transition-all duration-200
                      ${selectedColor === color.name 
                        ? 'border-black ring-2 ring-gray-300' 
                        : 'border-gray-300'
                      }
                      ${!color.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-black uppercase tracking-wide">
                SIZE
              </h3>
              <div className="flex space-x-3">
                {product.sizes.map((size: any) => (
                  <button
                    key={size.name}
                    onClick={() => size.available && setSelectedSize(size.name)}
                    disabled={!size.available}
                    className={`
                      w-12 h-12 rounded-full border-2 text-sm font-medium transition-all duration-200
                      ${selectedSize === size.name
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-black hover:border-gray-400'
                      }
                      ${!size.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6">
              <button 
                className="w-full py-4 border-2 border-black text-black font-medium hover:bg-gray-50 transition-colors duration-200 uppercase tracking-wide"
                disabled={!selectedSize}
              >
                ADD TO CART
              </button>
              <button 
                className="w-full py-4 bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-200 uppercase tracking-wide"
                disabled={!selectedSize}
              >
                BUY NOW
              </button>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-black uppercase tracking-wide mb-3">
                  DESCRIPTION
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetailPage;
