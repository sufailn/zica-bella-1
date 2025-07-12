"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { supabase, Order, ShippingAddress } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

// Types
interface OptimizedOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method?: string;
  payment_status: string;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    selected_color?: string;
    selected_size?: string;
    item_total: number;
  }[];
}

interface ProfileContextType {
  // Orders
  orders: OptimizedOrder[];
  ordersCount: number;
  hasMoreOrders: boolean;
  isLoadingOrders: boolean;
  isLoadingMoreOrders: boolean;
  loadOrders: (page?: number, append?: boolean) => Promise<void>;
  loadMoreOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  
  // Addresses
  addresses: ShippingAddress[];
  addressesCount: number;
  isLoadingAddresses: boolean;
  loadAddresses: () => Promise<void>;
  refreshAddresses: () => Promise<void>;
  
  // Address operations
  createAddress: (address: Partial<ShippingAddress>) => Promise<{ error?: any }>;
  updateAddress: (id: string, updates: Partial<ShippingAddress>) => Promise<{ error?: any }>;
  deleteAddress: (id: string) => Promise<{ error?: any }>;
  
  // Order operations
  cancelOrder: (orderId: string) => Promise<{ error?: any }>;
  
  // Utils
  clearCache: () => void;
  getOrderById: (orderId: string) => OptimizedOrder | undefined;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Cache management
interface ProfileCache {
  orders: {
    data: OptimizedOrder[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
    timestamp: number;
  } | null;
  addresses: {
    data: ShippingAddress[];
    timestamp: number;
  } | null;
}

const cache: ProfileCache = {
  orders: null,
  addresses: null,
};

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const DEFAULT_PAGE_SIZE = 10;

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { userProfile, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  // Orders state
  const [orders, setOrders] = useState<OptimizedOrder[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [hasMoreOrders, setHasMoreOrders] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingMoreOrders, setIsLoadingMoreOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Addresses state
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [addressesCount, setAddressesCount] = useState(0);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear cache when user changes
  useEffect(() => {
    if (!isAuthenticated) {
      clearCache();
    }
  }, [isAuthenticated, userProfile?.id]);

  // Check if cached data is valid
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_TIMEOUT;
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cache.orders = null;
    cache.addresses = null;
    pendingRequests.clear();
    setOrders([]);
    setOrdersCount(0);
    setHasMoreOrders(false);
    setCurrentPage(0);
    setAddresses([]);
    setAddressesCount(0);
  }, []);

  // Load orders with pagination and caching
  const loadOrders = useCallback(async (page = 0, append = false) => {
    if (!userProfile || !isAuthenticated) return;
    
    const cacheKey = `orders-${userProfile.id}-${page}`;
    
    // Check for pending request
    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey);
    }
    
    // Check cache for first page
    if (page === 0 && !append && cache.orders && isCacheValid(cache.orders.timestamp)) {
      setOrders(cache.orders.data);
      setOrdersCount(cache.orders.totalCount);
      setHasMoreOrders(cache.orders.hasMore);
      setCurrentPage(cache.orders.currentPage);
      return;
    }
    
    const loadingState = append ? setIsLoadingMoreOrders : setIsLoadingOrders;
    loadingState(true);
    
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      const fetchPromise = (async () => {
        // Get total count only for first page
        let totalCount = ordersCount;
        if (page === 0) {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userProfile.id);
          totalCount = count || 0;
        }
        
        // Fetch orders with optimized query
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            status,
            total_amount,
            payment_method,
            payment_status,
            created_at,
            order_items!inner (
              id,
              product_name,
              product_price,
              quantity,
              selected_color,
              selected_size,
              item_total
            )
          `)
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false })
          .range(page * DEFAULT_PAGE_SIZE, (page + 1) * DEFAULT_PAGE_SIZE - 1);
        
        if (error) throw error;
        
        const ordersData = data || [];
        const hasMore = ordersData.length === DEFAULT_PAGE_SIZE;
        
        const newOrders = append ? [...orders, ...ordersData] : ordersData;
        
        // Update state
        setOrders(newOrders);
        setOrdersCount(totalCount);
        setHasMoreOrders(hasMore);
        setCurrentPage(page);
        
        // Cache first page
        if (page === 0) {
          cache.orders = {
            data: newOrders,
            totalCount,
            hasMore,
            currentPage: page,
            timestamp: Date.now(),
          };
        }
        
        return newOrders;
      })();
      
      pendingRequests.set(cacheKey, fetchPromise);
      return await fetchPromise;
      
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('Error loading orders:', error);
      showToast('Failed to load orders', 'error');
      throw error;
    } finally {
      loadingState(false);
      pendingRequests.delete(cacheKey);
    }
  }, [userProfile, isAuthenticated, ordersCount, orders, isCacheValid, showToast]);

  // Load more orders
  const loadMoreOrders = useCallback(async () => {
    if (!hasMoreOrders || isLoadingMoreOrders) return;
    await loadOrders(currentPage + 1, true);
  }, [hasMoreOrders, isLoadingMoreOrders, currentPage, loadOrders]);

  // Load addresses with caching
  const loadAddresses = useCallback(async () => {
    if (!userProfile || !isAuthenticated) return;
    
    const cacheKey = `addresses-${userProfile.id}`;
    
    // Check for pending request
    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey);
    }
    
    // Check cache
    if (cache.addresses && isCacheValid(cache.addresses.timestamp)) {
      setAddresses(cache.addresses.data);
      setAddressesCount(cache.addresses.data.length);
      return;
    }
    
    setIsLoadingAddresses(true);
    
    try {
      const fetchPromise = (async () => {
        const { data, error } = await supabase
          .from('shipping_addresses')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const addressesData = data || [];
        
        // Update state
        setAddresses(addressesData);
        setAddressesCount(addressesData.length);
        
        // Cache the result
        cache.addresses = {
          data: addressesData,
          timestamp: Date.now(),
        };
        
        return addressesData;
      })();
      
      pendingRequests.set(cacheKey, fetchPromise);
      return await fetchPromise;
      
    } catch (error: any) {
      console.error('Error loading addresses:', error);
      showToast('Failed to load addresses', 'error');
      throw error;
    } finally {
      setIsLoadingAddresses(false);
      pendingRequests.delete(cacheKey);
    }
  }, [userProfile, isAuthenticated, isCacheValid, showToast]);

  // Refresh functions
  const refreshOrders = useCallback(async () => {
    cache.orders = null;
    await loadOrders(0, false);
  }, [loadOrders]);

  const refreshAddresses = useCallback(async () => {
    cache.addresses = null;
    await loadAddresses();
  }, [loadAddresses]);

  // Address operations
  const createAddress = useCallback(async (address: Partial<ShippingAddress>) => {
    if (!userProfile || !isAuthenticated) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .insert([{
          ...address,
          user_id: userProfile.id,
        }]);

      if (error) throw error;
      
      // Refresh addresses
      await refreshAddresses();
      
      return { error: null };
    } catch (error) {
      console.error('Error creating address:', error);
      return { error };
    }
  }, [userProfile, isAuthenticated, refreshAddresses]);

  const updateAddress = useCallback(async (id: string, updates: Partial<ShippingAddress>) => {
    if (!userProfile || !isAuthenticated) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userProfile.id);

      if (error) throw error;
      
      // Refresh addresses
      await refreshAddresses();
      
      return { error: null };
    } catch (error) {
      console.error('Error updating address:', error);
      return { error };
    }
  }, [userProfile, isAuthenticated, refreshAddresses]);

  const deleteAddress = useCallback(async (id: string) => {
    if (!userProfile || !isAuthenticated) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', userProfile.id);

      if (error) throw error;
      
      // Refresh addresses
      await refreshAddresses();
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting address:', error);
      return { error };
    }
  }, [userProfile, isAuthenticated, refreshAddresses]);

  // Order operations
  const cancelOrder = useCallback(async (orderId: string) => {
    if (!userProfile || !isAuthenticated) return { error: 'Not authenticated' };

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userProfile.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      // Refresh orders
      await refreshOrders();

      return { error: null };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { error };
    }
  }, [userProfile, isAuthenticated, refreshOrders]);

  // Get order by ID
  const getOrderById = useCallback((orderId: string) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  // Cancel ongoing requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const value = {
    // Orders
    orders,
    ordersCount,
    hasMoreOrders,
    isLoadingOrders,
    isLoadingMoreOrders,
    loadOrders,
    loadMoreOrders,
    refreshOrders,
    
    // Addresses
    addresses,
    addressesCount,
    isLoadingAddresses,
    loadAddresses,
    refreshAddresses,
    
    // Address operations
    createAddress,
    updateAddress,
    deleteAddress,
    
    // Order operations
    cancelOrder,
    
    // Utils
    clearCache,
    getOrderById,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 