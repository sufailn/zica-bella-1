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
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Prevent multiple simultaneous requests for the same profile
const pendingRequests = new Map<string, Promise<UserProfile | null>>()

// Clear cache for a specific user (useful after profile updates)
export const clearProfileCache = (userId?: string) => {
  if (userId) {
    profileCache.delete(userId)
    pendingRequests.delete(userId)
  } else {
    profileCache.clear()
    pendingRequests.clear()
  }
}

// Optimized profile fetching with caching and request batching
export const getUserProfile = async (userId?: string, useCache = true) => {
  try {
    const uid = userId || (await getCurrentUser())?.id
    if (!uid) return null
    
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
      
      // Cache the result
      if (useCache) {
        profileCache.set(uid, { profile, timestamp: Date.now() })
      }
      
      return profile
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(uid)
    }
  } catch (error) {
    console.error('getUserProfile error:', error)
    return null
  }
}

// Internal function to fetch profile from database
const fetchProfileFromDB = async (uid: string): Promise<UserProfile | null> => {
  let profile: UserProfile | null = null
  
  // Use admin client first if available (faster and bypasses RLS)
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', uid)
      .single()
    
    if (!error && data) {
      profile = data as UserProfile
    } else if (error?.code === 'PGRST116') {
      // If profile doesn't exist, create it
      profile = await createUserProfile(uid)
    }
  }
  
  // Fallback to regular client if admin client failed
  if (!profile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', uid)
      .single()
    
    if (!error && data) {
      profile = data as UserProfile
    } else if (error?.code === 'PGRST116') {
      profile = await createUserProfile(uid)
    } else if (error) {
      console.error('Error fetching user profile:', error?.message)
    }
  }
  
  return profile
}

// Separate function to create user profile
const createUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!supabaseAdmin) return null
    
    // Get user data once
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) return null
    
    const { data: newProfile, error } = await supabaseAdmin
      .from('user_profiles')
      .insert([{
        id: userId,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        role: 'customer'
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }
    
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