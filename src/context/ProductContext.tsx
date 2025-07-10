"use client";
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useToast } from './ToastContext';

export interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  soldOut: boolean;
  colors?: Array<{
    name: string;
    value: string;
    available: boolean;
  }>;
  sizes?: Array<{
    name: string;
    available: boolean;
  }>;
  description?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface ProductContextType {
  products: Product[];
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  getProductsByCategory: (category: string) => Product[];
  getProductById: (id: number) => Product | undefined;
  addToCart: (productId: number, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (itemId: number) => void;
  updateCartItemQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Product data from ProductsSection
const productData: Product[] = [
  {
    id: 1,
    name: "CLASSIC WHITE TEE",
    price: 1200,
    images: [
      "/shop/products/tshirt-1/p (1).jpeg",
      "/shop/products/tshirt-1/p (2).jpeg",
      "/shop/products/tshirt-1/p (3).jpeg",
      "/shop/products/tshirt-1/p (4).jpeg"
    ],
    category: "T-SHIRTS",
    soldOut: false,
    colors: [
      { name: "White", value: "#ffffff", available: true },
      { name: "Black", value: "#000000", available: true },
      { name: "Gray", value: "#808080", available: false }
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: false }
    ],
    description: "Premium cotton classic white t-shirt with perfect fit and comfort."
  },
  {
    id: 2,
    name: "STRIPED GRAPHIC TEE",
    price: 1400,
    images: [
      "/shop/products/tshirt-2/p (1).jpeg",
      "/shop/products/tshirt-2/p (2).jpeg",
      "/shop/products/tshirt-2/p (3).jpeg",
      "/shop/products/tshirt-2/p (4).jpeg"
    ],
    category: "T-SHIRTS",
    soldOut: false,
    colors: [
      { name: "Navy", value: "#000080", available: true },
      { name: "Red", value: "#ff0000", available: true },
      { name: "Green", value: "#008000", available: false }
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true }
    ],
    description: "Stylish striped graphic t-shirt with bold design and comfortable fit."
  },
  {
    id: 3,
    name: "PREMIUM COTTON TEE",
    price: 1600,
    images: [
      "/shop/products/tshirt-3/p (1).jpeg",
      "/shop/products/tshirt-3/p (2).jpeg",
      "/shop/products/tshirt-3/p (3).jpeg",
      "/shop/products/tshirt-3/p (4).jpeg"
    ],
    category: "T-SHIRTS",
    soldOut: true,
    colors: [
      { name: "White", value: "#ffffff", available: false },
      { name: "Black", value: "#000000", available: false },
      { name: "Blue", value: "#0000ff", available: false }
    ],
    sizes: [
      { name: "S", available: false },
      { name: "M", available: false },
      { name: "L", available: false },
      { name: "XL", available: false }
    ],
    description: "Ultra-premium cotton t-shirt with exceptional quality and comfort."
  },
  {
    id: 4,
    name: "MINIMALIST TEE",
    price: 1100,
    images: [
      "/shop/products/tshirt-4/p.jpeg"
    ],
    category: "T-SHIRTS",
    soldOut: false,
    colors: [
      { name: "White", value: "#ffffff", available: true },
      { name: "Black", value: "#000000", available: true }
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true }
    ],
    description: "Clean and minimalist design t-shirt for everyday wear."
  },
  {
    id: 5,
    name: "LINEN CASUAL SHIRT",
    price: 2200,
    images: [
      "/shop/products/shirt-1/p (1).jpeg",
      "/shop/products/shirt-1/p (2).jpeg",
      "/shop/products/shirt-1/p (3).jpeg"
    ],
    category: "SHIRTS",
    soldOut: false,
    colors: [
      { name: "Beige", value: "#f5f5dc", available: true },
      { name: "White", value: "#ffffff", available: true },
      { name: "Blue", value: "#0000ff", available: false }
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true }
    ],
    description: "Comfortable linen casual shirt perfect for any occasion."
  },
  {
    id: 6,
    name: "FORMAL OXFORD SHIRT",
    price: 2500,
    images: [
      "/shop/products/shirt-2/p (1).jpeg",
      "/shop/products/shirt-2/p (2).jpeg",
      "/shop/products/shirt-2/p (3).jpeg",
      "/shop/products/shirt-2/p (4).jpeg"
    ],
    category: "SHIRTS",
    soldOut: false,
    colors: [
      { name: "White", value: "#ffffff", available: true },
      { name: "Blue", value: "#0000ff", available: true },
      { name: "Pink", value: "#ffc0cb", available: true }
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true }
    ],
    description: "Classic Oxford shirt with formal design and professional look."
  },
  {
    id: 7,
    name: "PREMIUM DENIM JEANS",
    price: 3200,
    images: [
      "/shop/products/jeans-1/p (1).jpeg",
      "/shop/products/jeans-1/p (2).jpeg",
      "/shop/products/jeans-1/p (3).jpeg"
    ],
    category: "JEANS",
    soldOut: false,
    colors: [
      { name: "Blue", value: "#0000ff", available: true },
      { name: "Black", value: "#000000", available: true },
      { name: "Gray", value: "#808080", available: false }
    ],
    sizes: [
      { name: "30", available: true },
      { name: "32", available: true },
      { name: "34", available: true },
      { name: "36", available: false }
    ],
    description: "Premium denim jeans with perfect fit and modern styling."
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const getProductsByCategory = (category: string): Product[] => {
    if (category === 'VIEW ALL') {
      return productData;
    }
    return productData.filter(product => product.category === category);
  };

  const getProductById = (id: number): Product | undefined => {
    return productData.find(product => product.id === id);
  };

  const addToCart = (productId: number, quantity: number = 1, color?: string, size?: string) => {
    const product = getProductById(productId);
    if (!product || product.soldOut) return;

    let isNewItem = false;

    setCart(prevCart => {
      // Check if item with same product, color, and size already exists
      const existingItemIndex = prevCart.findIndex(item => 
        item.product.id === productId && 
        item.selectedColor === color && 
        item.selectedSize === size
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Add new item to cart
        isNewItem = true;
        const newItem: CartItem = {
          id: Date.now(), // Simple ID generation
          product,
          quantity,
          selectedColor: color,
          selectedSize: size
        };
        return [...prevCart, newItem];
      }
    });

    // Show toast notification - need to be called outside the context
    // This will be handled by the components using addToCart
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const value: ProductContextType = {
    products: productData,
    cart,
    cartCount,
    cartTotal,
    getProductsByCategory,
    getProductById,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}; 