"use client";
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
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

// Cache management
interface ProductCache {
  data: Product[];
  timestamp: number;
  categories: string[];
}

let productCache: ProductCache | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const pendingProductRequest = { current: null as Promise<Product[]> | null };

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to convert Supabase product to legacy format for backward compatibility
  const processProduct = useCallback((product: Product): Product => {
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
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return productCache && (Date.now() - productCache.timestamp) < CACHE_DURATION;
  }, []);

  // Fetch products from API with caching and request deduplication
  const fetchProducts = useCallback(async (forceRefresh = false): Promise<Product[]> => {
    try {
      // Check cache first
      if (!forceRefresh && isCacheValid()) {
        const processedProducts = productCache!.data.map(processProduct);
        setProducts(processedProducts);
        setCategories(productCache!.categories);
        setError(null);
        return processedProducts;
      }

      // Check for pending request
      if (pendingProductRequest.current) {
        return await pendingProductRequest.current;
      }

      setLoading(true);
      setError(null);
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const fetchPromise = (async () => {
        try {
          const response = await fetch('/api/products', {
            signal: abortControllerRef.current?.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (!data.products || !Array.isArray(data.products)) {
            throw new Error('Invalid products data received');
          }
          
          const rawProducts = data.products;
          const processedProducts = rawProducts.map(processProduct);
          
          // Extract unique categories
          const uniqueCategories = Array.from(new Set(processedProducts.map((p: Product) => p.category))) as string[];
          

          
          // Update cache
          productCache = {
            data: rawProducts,
            timestamp: Date.now(),
            categories: uniqueCategories
          };
          
          // Update state
          setProducts(processedProducts);
          setCategories(uniqueCategories);
          setError(null);
          
          return processedProducts;
        } catch (error: any) {
          if (error.name === 'AbortError') {
            throw error;
          }
          
          // If cache exists, use it as fallback
          if (productCache) {
            console.warn('Using cached products due to fetch error:', error);
            const processedProducts = productCache.data.map(processProduct);
            setProducts(processedProducts);
            setCategories(productCache.categories);
            setError('Using cached data - connection issue');
            return processedProducts;
          }
          
          throw error;
        }
      })();

      pendingProductRequest.current = fetchPromise;
      
      try {
        const result = await fetchPromise;
        return result;
      } finally {
        pendingProductRequest.current = null;
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return []; // Return empty array if aborted
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error fetching products:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [processProduct, isCacheValid, showToast]);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // Optimized category filtering with flexible matching
  const getProductsByCategory = useCallback((category: string): Product[] => {
    if (category === 'VIEW ALL') {
      return products;
    }
    
    // Try exact match first
    let filtered = products.filter(product => product.category === category);
    
    // If no exact match, try case-insensitive match
    if (filtered.length === 0) {
      filtered = products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // If still no match, try partial match
    if (filtered.length === 0) {
      filtered = products.filter(product => 
        product.category.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(product.category.toLowerCase())
      );
    }
    
    return filtered;
  }, [products, categories]);

  // Optimized product lookup
  const getProductById = useCallback((id: number): Product | undefined => {
    return products.find(product => product.id === id);
  }, [products]);

  // Optimized cart operations
  const addToCart = useCallback((productId: number, quantity: number = 1, color?: string, size?: string) => {
    const product = getProductById(productId);
    if (!product) {
      showToast('Product not found', 'error');
      return;
    }

    setCart(prevCart => {
      // Check if item with same product, color, and size already exists
      const existingItemIndex = prevCart.findIndex(item => 
        item.product.id === productId &&
        item.selectedColor === color &&
        item.selectedSize === size
      );

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity
        };
        return newCart;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: Date.now() + Math.random(), // Simple ID generation
          product,
          quantity,
          selectedColor: color,
          selectedSize: size,
        };
        return [...prevCart, newItem];
      }
    });

    showToast(`${product.name} added to cart!`, 'success');
  }, [getProductById, showToast]);

  const removeFromCart = useCallback((itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    showToast('Item removed from cart', 'success');
  }, [showToast]);

  const updateCartItemQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => prevCart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('Cart cleared', 'success');
  }, [showToast]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts(true);
  }, [fetchProducts]);

  // Memoized computed values
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