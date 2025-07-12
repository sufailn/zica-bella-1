import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, Order, ShippingAddress } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface UseProfileDataOptions {
  pageSize?: number;
  cacheTimeout?: number;
}

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

interface OrdersData {
  orders: OptimizedOrder[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
}

interface AddressesData {
  addresses: ShippingAddress[];
  totalCount: number;
}

interface ProfileDataCache {
  orders: {
    data: OrdersData;
    timestamp: number;
  } | null;
  addresses: {
    data: AddressesData;
    timestamp: number;
  } | null;
}

const cache: ProfileDataCache = {
  orders: null,
  addresses: null,
};

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const DEFAULT_PAGE_SIZE = 10;

export const useProfileData = (options: UseProfileDataOptions = {}) => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  
  const pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
  const cacheTimeout = options.cacheTimeout || CACHE_TIMEOUT;
  
  const [ordersData, setOrdersData] = useState<OrdersData>({
    orders: [],
    totalCount: 0,
    hasMore: false,
    currentPage: 0,
  });
  
  const [addressesData, setAddressesData] = useState<AddressesData>({
    addresses: [],
    totalCount: 0,
  });
  
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isLoadingMoreOrders, setIsLoadingMoreOrders] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if cached data is valid
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < cacheTimeout;
  }, [cacheTimeout]);

  // Clear cache
  const clearCache = useCallback(() => {
    cache.orders = null;
    cache.addresses = null;
    pendingRequests.clear();
  }, []);

  // Load orders with pagination and caching
  const loadOrders = useCallback(async (page = 0, append = false) => {
    if (!userProfile) return;
    
    const cacheKey = `orders-${userProfile.id}-${page}`;
    
    // Check for pending request
    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey);
    }
    
    // Check cache for first page
    if (page === 0 && !append && cache.orders && isCacheValid(cache.orders.timestamp)) {
      setOrdersData(cache.orders.data);
      return cache.orders.data;
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
        let totalCount = ordersData.totalCount;
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
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) throw error;
        
        const orders = data || [];
        const hasMore = orders.length === pageSize;
        
        const newOrdersData: OrdersData = {
          orders: append ? [...ordersData.orders, ...orders] : orders,
          totalCount,
          hasMore,
          currentPage: page,
        };
        
        // Cache first page
        if (page === 0) {
          cache.orders = {
            data: newOrdersData,
            timestamp: Date.now(),
          };
        }
        
        return newOrdersData;
      })();
      
      pendingRequests.set(cacheKey, fetchPromise);
      const result = await fetchPromise;
      
      setOrdersData(result);
      return result;
      
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('Error loading orders:', error);
      showToast('Failed to load orders', 'error');
      throw error;
    } finally {
      loadingState(false);
      pendingRequests.delete(cacheKey);
    }
  }, [userProfile, pageSize, ordersData, isCacheValid, showToast]);

  // Load more orders
  const loadMoreOrders = useCallback(async () => {
    if (!ordersData.hasMore || isLoadingMoreOrders) return;
    await loadOrders(ordersData.currentPage + 1, true);
  }, [ordersData.hasMore, ordersData.currentPage, isLoadingMoreOrders, loadOrders]);

  // Load addresses with caching
  const loadAddresses = useCallback(async () => {
    if (!userProfile) return;
    
    const cacheKey = `addresses-${userProfile.id}`;
    
    // Check for pending request
    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey);
    }
    
    // Check cache
    if (cache.addresses && isCacheValid(cache.addresses.timestamp)) {
      setAddressesData(cache.addresses.data);
      return cache.addresses.data;
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
        
        const addressesData: AddressesData = {
          addresses: data || [],
          totalCount: data?.length || 0,
        };
        
        // Cache the result
        cache.addresses = {
          data: addressesData,
          timestamp: Date.now(),
        };
        
        return addressesData;
      })();
      
      pendingRequests.set(cacheKey, fetchPromise);
      const result = await fetchPromise;
      
      setAddressesData(result);
      return result;
      
    } catch (error: any) {
      console.error('Error loading addresses:', error);
      showToast('Failed to load addresses', 'error');
      throw error;
    } finally {
      setIsLoadingAddresses(false);
      pendingRequests.delete(cacheKey);
    }
  }, [userProfile, isCacheValid, showToast]);

  // Refresh data
  const refreshOrders = useCallback(async () => {
    cache.orders = null;
    await loadOrders(0, false);
  }, [loadOrders]);

  const refreshAddresses = useCallback(async () => {
    cache.addresses = null;
    await loadAddresses();
  }, [loadAddresses]);

  // Cancel ongoing requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Orders
    orders: ordersData.orders,
    ordersCount: ordersData.totalCount,
    hasMoreOrders: ordersData.hasMore,
    isLoadingOrders,
    isLoadingMoreOrders,
    loadOrders,
    loadMoreOrders,
    refreshOrders,
    
    // Addresses
    addresses: addressesData.addresses,
    addressesCount: addressesData.totalCount,
    isLoadingAddresses,
    loadAddresses,
    refreshAddresses,
    
    // Utils
    clearCache,
  };
}; 