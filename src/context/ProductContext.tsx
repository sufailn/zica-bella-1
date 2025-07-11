"use client";
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

export interface Color {
  id: number;
  name: string;
  value: string; // hex color code
}

export interface Size {
  id: number;
  name: string;
  display_order: number;
}

export interface ProductColor {
  id: number;
  color_id: number;
  available: boolean;
  colors: Color;
}

export interface ProductSize {
  id: number;
  size_id: number;
  available: boolean;
  sizes: Size;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  stock_quantity: number;
  sku?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_colors?: ProductColor[];
  product_sizes?: ProductSize[];
  // Legacy fields for backward compatibility
  soldOut?: boolean;
  colors?: Array<{
    name: string;
    value: string;
    available: boolean;
  }>;
  sizes?: Array<{
    name: string;
    available: boolean;
  }>;
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
  categories: string[];
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  error: string | null;
  getProductsByCategory: (category: string) => Product[];
  getProductById: (id: number) => Product | undefined;
  addToCart: (productId: number, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (itemId: number) => void;
  updateCartItemQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Helper function to convert Supabase product to legacy format for backward compatibility
  const processProduct = (product: Product): Product => {
    return {
      ...product,
      soldOut: product.stock_quantity === 0,
      colors: product.product_colors?.map(pc => ({
        name: pc.colors.name,
        value: pc.colors.value,
        available: pc.available
      })),
      sizes: product.product_sizes?.map(ps => ({
        name: ps.sizes.name,
        available: ps.available
      }))
    };
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      const processedProducts = data.products.map(processProduct);
      setProducts(processedProducts);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(processedProducts.map((p: Product) => p.category))) as string[];
      setCategories(uniqueCategories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const getProductsByCategory = (category: string): Product[] => {
    if (category === 'VIEW ALL') {
      return products;
    }
    return products.filter(product => product.category === category);
  };

  const getProductById = (id: number): Product | undefined => {
    return products.find(product => product.id === id);
  };

  const addToCart = (productId: number, quantity: number = 1, color?: string, size?: string) => {
    const product = getProductById(productId);
    if (!product) {
      showToast('Product not found', 'error');
      return;
    }

    // Check if item with same product, color, and size already exists
    const existingItemIndex = cart.findIndex(item => 
      item.product.id === productId &&
      item.selectedColor === color &&
      item.selectedSize === size
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
      setCart(newCart);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: Date.now() + Math.random(), // Simple ID generation
        product,
        quantity,
        selectedColor: color,
        selectedSize: size,
      };
      setCart([...cart, newItem]);
    }

    showToast(`${product.name} added to cart!`, 'success');
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(item => item.id !== itemId));
    showToast('Item removed from cart', 'success');
  };

  const updateCartItemQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const newCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
    showToast('Cart cleared', 'success');
  };

  const refreshProducts = async () => {
    await fetchProducts();
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const value = {
    products,
    categories,
    cart,
    cartCount,
    cartTotal,
    loading,
    error,
    getProductsByCategory,
    getProductById,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    refreshProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}; 