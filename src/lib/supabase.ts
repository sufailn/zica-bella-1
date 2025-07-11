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

export const getUserProfile = async (userId?: string) => {
  const uid = userId || (await getCurrentUser())?.id
  if (!uid) return null
  
  console.log('Fetching profile for user ID:', uid)
  
  // First try with the admin client since we know it works
  if (supabaseAdmin) {
    console.log('Trying admin client first...')
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', uid)
      .single()
    
    if (!adminError && adminData) {
      console.log('Successfully fetched with admin client:', adminData)
      return adminData as UserProfile
    }
    
    console.log('Admin client failed:', adminError)
  }
  
  // Fallback to regular client (for client-side usage)
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', uid)
    .single()
  
  console.log('Profile fetch result:', { data, error })
  
  if (error) {
    console.error('Error fetching user profile:', error.message || error)
    
    // If the profile doesn't exist, try to create it with admin client
    if (error.code === 'PGRST116' && supabaseAdmin) {
      console.log('Profile not found, attempting to create with admin client...')
      const { data: user } = await supabase.auth.getUser()
      if (user.user) {
        const { data: newProfile, error: createError } = await supabaseAdmin
          .from('user_profiles')
          .insert([{
            id: user.user.id,
            email: user.user.email || '',
            first_name: user.user.user_metadata?.first_name || '',
            last_name: user.user.user_metadata?.last_name || '',
            phone: user.user.user_metadata?.phone || '',
            role: 'customer'
          }])
          .select()
          .single()
        
        if (createError) {
          console.error('Error creating user profile:', createError)
          return null
        }
        
        console.log('Created new profile:', newProfile)
        return newProfile as UserProfile
      }
    }
    
    return null
  }
  
  return data as UserProfile
}

export const isAdmin = async (userId?: string) => {
  try {
    const uid = userId || (await getCurrentUser())?.id
    if (!uid || !supabaseAdmin) return false
    
    // Use service role to bypass RLS for admin check
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', uid)
      .single()
    
    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }
    
    return data?.role === 'admin'
  } catch (error) {
    console.error('Error in isAdmin:', error)
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