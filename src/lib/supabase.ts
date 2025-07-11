import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = serviceRoleKey
  ? createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : undefined

// Types for our database
export interface Product {
  id: number
  name: string
  description?: string
  price: number
  images: string[]
  category: string
  stock_quantity: number
  sku?: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  // Relational data (when included in queries)
  product_colors?: ProductColor[]
  product_sizes?: ProductSize[]
}

export interface Color {
  id: number
  name: string
  value: string
  created_at: string
}

export interface Size {
  id: number
  name: string
  display_order: number
  created_at: string
}

export interface ProductColor {
  id: number
  product_id: number
  color_id: number
  available: boolean
  created_at: string
  color?: Color
}

export interface ProductSize {
  id: number
  product_id: number
  size_id: number
  available: boolean
  created_at: string
  size?: Size
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  created_at: string
}

export interface ProductVariant {
  id: number
  product_id: number
  color?: string
  size?: string
  sku?: string
  stock_quantity: number
  additional_price: number
  created_at: string
}

// Auth-related types
export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping_cost: number
  tax_amount: number
  total_amount: number
  payment_method?: 'card' | 'upi' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  shipping_address: any
  billing_address?: any
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: number
  product_name: string
  product_price: number
  quantity: number
  selected_color?: string
  selected_size?: string
  item_total: number
  created_at: string
}

export interface ShippingAddress {
  id: string
  user_id: string
  title: string
  first_name: string
  last_name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Simple in-memory cache for user profiles
const profileCache = new Map<string, { profile: UserProfile | null; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes (increased from 5)

// Prevent multiple simultaneous requests for the same profile
const pendingRequests = new Map<string, Promise<UserProfile | null>>()

// Track failed requests to implement circuit breaker pattern
const failedRequests = new Map<string, { count: number; lastFailed: number }>()
const MAX_FAILED_ATTEMPTS = 3
const FAILURE_RESET_TIME = 5 * 60 * 1000 // 5 minutes

// Clear cache for a specific user (useful after profile updates)
export const clearProfileCache = (userId?: string) => {
  if (userId) {
    profileCache.delete(userId)
    pendingRequests.delete(userId)
    failedRequests.delete(userId)
  } else {
    profileCache.clear()
    pendingRequests.clear()
    failedRequests.clear()
  }
}

// Check if we should attempt to fetch profile (circuit breaker)
const shouldAttemptFetch = (userId: string): boolean => {
  const failures = failedRequests.get(userId)
  if (!failures) return true
  
  // If too many failures and not enough time has passed, don't attempt
  if (failures.count >= MAX_FAILED_ATTEMPTS) {
    const timeSinceLastFailure = Date.now() - failures.lastFailed
    if (timeSinceLastFailure < FAILURE_RESET_TIME) {
      return false
    }
    // Reset failure count after timeout
    failedRequests.delete(userId)
  }
  
  return true
}

// Record a failed request
const recordFailure = (userId: string) => {
  const current = failedRequests.get(userId) || { count: 0, lastFailed: 0 }
  failedRequests.set(userId, {
    count: current.count + 1,
    lastFailed: Date.now()
  })
}

// Record a successful request
const recordSuccess = (userId: string) => {
  failedRequests.delete(userId)
}

// Optimized profile fetching with enhanced caching and error handling
export const getUserProfile = async (userId?: string, useCache = true): Promise<UserProfile | null> => {
  try {
    const uid = userId || (await getCurrentUser())?.id
    if (!uid) return null
    
    // Check circuit breaker
    if (!shouldAttemptFetch(uid)) {
      console.warn(`Profile fetch blocked for user ${uid} due to repeated failures`)
      return profileCache.get(uid)?.profile || null
    }
    
    // Check if there's already a pending request for this user
    if (pendingRequests.has(uid)) {
      return await pendingRequests.get(uid)!
    }
    
    // Check cache first
    if (useCache) {
      const cached = profileCache.get(uid)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.profile
      }
    }
    
    // Create a new request and store it to prevent duplicates
    const profileRequest = fetchProfileFromDB(uid)
    pendingRequests.set(uid, profileRequest)
    
    try {
      const profile = await profileRequest
      
      // Record success and cache the result
      recordSuccess(uid)
      if (useCache) {
        profileCache.set(uid, { profile, timestamp: Date.now() })
      }
      
      return profile
    } catch (error) {
      // Record failure
      recordFailure(uid)
      
      // Return cached profile if available as fallback
      const cached = profileCache.get(uid)
      if (cached) {
        console.warn(`Using cached profile for ${uid} due to fetch error:`, error)
        return cached.profile
      }
      
      throw error
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(uid)
    }
  } catch (error) {
    console.error('getUserProfile error:', error)
    return null
  }
}

// Internal function to fetch profile from database with better error handling
const fetchProfileFromDB = async (uid: string): Promise<UserProfile | null> => {
  let profile: UserProfile | null = null
  let lastError: any = null
  
  // Use admin client first if available (faster and bypasses RLS)
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', uid)
        .single()
      
      if (!error && data) {
        return data as UserProfile
      } else if (error?.code === 'PGRST116') {
        // Profile doesn't exist, try to create it
        return await createUserProfile(uid)
      } else if (error) {
        lastError = error
        console.warn('Admin client profile fetch failed:', error)
      }
    } catch (error) {
      lastError = error
      console.warn('Admin client error:', error)
    }
  }
  
  // Fallback to regular client
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', uid)
      .single()
    
    if (!error && data) {
      return data as UserProfile
    } else if (error?.code === 'PGRST116') {
      return await createUserProfile(uid)
    } else if (error) {
      lastError = error
      console.error('Regular client profile fetch failed:', error)
    }
  } catch (error) {
    lastError = error
    console.error('Regular client error:', error)
  }
  
  // If we got here, both attempts failed
  if (lastError) {
    throw new Error(`Failed to fetch profile: ${lastError.message || lastError}`)
  }
  
  return null
}

// Enhanced profile creation with better error handling
const createUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!supabaseAdmin) {
      console.warn('Cannot create profile: admin client not available')
      return null
    }
    
    // Get user data with retry
    let userData = null
    for (let i = 0; i < 3; i++) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!error && user && user.id === userId) {
          userData = user
          break
        }
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)))
        }
      } catch (error) {
        console.warn(`Auth user fetch attempt ${i + 1} failed:`, error)
      }
    }
    
    if (!userData) {
      console.error('Could not get user data for profile creation')
      return null
    }
    
    const { data: newProfile, error } = await supabaseAdmin
      .from('user_profiles')
      .insert([{
        id: userId,
        email: userData.email || '',
        first_name: userData.user_metadata?.first_name || '',
        last_name: userData.user_metadata?.last_name || '',
        phone: userData.user_metadata?.phone || '',
        role: 'customer'
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }
    
    console.log('Successfully created new profile for user:', userId)
    return newProfile as UserProfile
  } catch (error) {
    console.error('createUserProfile error:', error)
    return null
  }
}

// Optimized admin check
export const isAdmin = async (userId?: string) => {
  try {
    const uid = userId || (await getCurrentUser())?.id
    if (!uid || !supabaseAdmin) return false
    
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', uid)
      .single()
    
    return !error && data?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUp = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
  return { data, error }
} 