"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import { useProducts } from "@/context/ProductContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import 'swiper/css';
import 'swiper/css/navigation';

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { getProductById, addToCart } = useProducts();
  const { showToast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (params.id) {
      const productData = getProductById(Number(params.id));
      setProduct(productData);
      if (productData?.colors?.length) {
        setSelectedColor(productData.colors[0].name);
      }
    }
  }, [params.id, getProductById]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showToast('Please select a size', 'error', 3000);
      return;
    }

    setIsAddingToCart(true);
    
    try {
      addToCart(product.id, quantity, selectedColor, selectedSize);
    } catch (error) {
      showToast('Failed to add item to cart', 'error', 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      showToast('Please select a size', 'error', 3000);
      return;
    }

    // Add to cart first
    addToCart(product.id, quantity, selectedColor, selectedSize);
    
    // Redirect to checkout
    router.push('/checkout');
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar isHome={false} />
        <div className="pt-24 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="space-y-6">
              <LoadingSkeleton variant="product" />
              <div className="space-y-4">
                <LoadingSkeleton variant="text" className="h-8 w-3/4" />
                <LoadingSkeleton variant="text" className="h-6 w-1/4" />
                <LoadingSkeleton variant="text" className="h-4 w-1/2" />
                <LoadingSkeleton variant="text" className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar isHome={false} />
      
      <div className="pt-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* Product Images */}
          <div className="relative">
            <div className="aspect-[3/4] bg-gray-900 overflow-hidden">
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
              <button className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 z-10  rounded-full p-2 transition-colors hover:bg-black/70">
                <svg className="w-6 h-6" fill="none" stroke="#fff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 z-10  rounded-full p-2 transition-colors hover:bg-black/70">
                <svg className="w-6 h-6" fill="none" stroke="#fff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6 px-4">
            
            {/* Product Title and Price */}
            <div className="border-b border-gray-700 pb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-wide">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-white font-numbers">
                ₹{product.price.toLocaleString()}
              </p>
            </div>

            {/* Color Selection with left icon and flexed colors */}
            <div className="space-y-3 border-b border-gray-700 pb-4">
              <div className="flex items-center mb-2">
                <div className="flex items-center w-16 justify-center">
                  <img src="/shop/icons/pants.png" alt="Pants Icon" className="w-10 h-10" />
                </div>
                <div className="flex-1 flex space-x-3">
                  {product.colors.map((color: any) => (
                    <button
                      key={color.name}
                      onClick={() => color.available && setSelectedColor(color.name)}
                      disabled={!color.available}
                      className={`
                        w-10 h-10 rounded-full border-2 transition-all duration-200
                        ${selectedColor === color.name 
                          ? 'border-white ring-2 ring-gray-500' 
                          : 'border-gray-600'
                        }
                        ${!color.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
                      `}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Shirt color palette (if needed) */}
            <div className="space-y-3 border-b border-gray-700 pb-4">
              <div className="flex items-center mb-2">
                <div className="flex items-center w-16 justify-center">
                  <img src="/shop/icons/shirts.png" alt="Shirt Icon" className="w-10 h-10" />
                </div>
                <div className="flex-1 flex space-x-3">
                  {product.colors.map((color: any) => (
                    <button
                      key={color.name}
                      onClick={() => color.available && setSelectedColor(color.name)}
                      disabled={!color.available}
                      className={`
                        w-10 h-10 rounded-full border-2 transition-all duration-200
                        ${selectedColor === color.name 
                          ? 'border-white ring-2 ring-gray-500' 
                          : 'border-gray-600'
                        }
                        ${!color.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
                      `}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Size Selection with left icon and flexed sizes */}
            <div className="space-y-3 border-b border-gray-700 pb-4">
              <div className="flex items-center mb-2">
                <div className="flex items-center w-16 justify-center">
                  <img src="/shop/icons/shirts.png" alt="Shirt Icon" className="w-10 h-10" />
                </div>
                <div className="flex-1 flex space-x-3">
                  {product.sizes.map((size: any) => (
                    <button
                      key={size.name}
                      onClick={() => size.available && setSelectedSize(size.name)}
                      disabled={!size.available}
                      className={`
                        w-12 h-12 rounded-full border-2 text-sm font-medium transition-all duration-200
                        ${selectedSize === size.name
                          ? 'border-white bg-white text-black'
                          : 'border-gray-600 text-white hover:border-gray-400'
                        }
                        ${!size.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white uppercase tracking-wide">
                QUANTITY
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-600 text-white hover:border-gray-400 transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-medium text-white min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-600 text-white hover:border-gray-400 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons styled like screenshot */}
            <div className="flex gap-2 pt-6">
              <button 
                onClick={handleAddToCart}
                disabled={!selectedSize || isAddingToCart}
                className="flex-1 py-4 border-2 border-white text-white font-bold text-base hover:bg-gray-900 transition-colors duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed bg-black"
              >
                {isAddingToCart ? 'ADDING...' : 'ADD TO CART'}
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={!selectedSize}
                className="flex-1 py-4 bg-white text-black font-bold text-base border-2 border-white hover:bg-gray-200 transition-colors duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                BUY NOW
              </button>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="pt-6 border-t border-gray-700">
                <h3 className="text-sm font-medium text-white uppercase tracking-wide mb-3">
                  DESCRIPTION
                </h3>
                <p className="text-gray-300 leading-relaxed">
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
