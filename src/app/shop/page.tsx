"use client"
import Navbar from "@/components/common/Navbar";
import { ProductRow } from "@/components/Shop";

// Mock product data
const products = [
  {
    id: 1,
    name: "Classic Shirt",
    price: 120,
    images: ["/shop/image1.jpeg", "/shop/image2.jpeg", "/shop/image3.jpeg"],
    category: "Shirts",
  },
  {
    id: 2,
    name: "Striped Tee",
    price: 80,
    images: ["/shop/image2.jpeg", "/shop/image3.jpeg"],
    category: "T-Shirts",
  },
  {
    id: 3,
    name: "Leather Bag",
    price: 350,
    images: ["/shop/image3.jpeg", "/shop/image1.jpeg"],
    category: "Bags",
  },
  // ...add more products and categories as needed
];

const categories = Array.from(new Set(products.map(p => p.category)));

const ShopPage = () => {
  return (
    <div className="bg-[#faf9f6] min-h-screen">
      <Navbar isHome={false} />
      <div className="pt-24 max-w-7xl mx-auto px-2 md:px-6">
        {categories.map(category => (
          <ProductRow
            key={category}
            title={category}
            products={products.filter(p => p.category === category)}
          />
        ))}
      </div>
    </div>
  );
};

export default ShopPage;