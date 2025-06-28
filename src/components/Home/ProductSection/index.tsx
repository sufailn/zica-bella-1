"use client";
import { useState } from "react";
import CategoryTabs from "./CategoryTabs";
import ProductCard from "./ProductCard";
import ProductTitle from "./ProductTitle";

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState('VIEW ALL');

  // Sample product data matching the UI
  const products = [
    {
      id: 1,
      name: "AVOINE HOODED QUILTED JACKET",
      price: 1500,
      images: ["/shop/image1.jpeg", "/shop/image2.jpeg"],
      category: "JACKETS",
      soldOut: true
    },
    {
      id: 2,
      name: "AVOINE HOODED QUILTED JACKET",
      price: 1500,
      images: ["/shop/image2.jpeg", "/shop/image3.jpeg", "/shop/image1.jpeg"],
      category: "JACKETS",
      soldOut: true
    },
    {
      id: 3,
      name: "CLASSIC SHIRT",
      price: 800,
      images: ["/shop/image1.jpeg", "/shop/image2.jpeg"],
      category: "SHIRTS",
      soldOut: true
    },
    {
      id: 4,
      name: "GRAPHIC TEE",
      price: 600,
      images: ["/shop/image2.jpeg"],
      category: "SHIRTS",
      soldOut: true
    },
  ];

  const filteredProducts = activeCategory === 'VIEW ALL' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <div className="py-8 px-4">
      {/* Category Tabs */}
      <ProductTitle />
      <CategoryTabs onCategoryChange={setActiveCategory} />
      
      {/* Products Grid */}
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductsSection;
