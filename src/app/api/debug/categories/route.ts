import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    // Get all categories
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Get all products with their categories
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, category, is_active')
      .order('category')

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    // Get unique categories from products
    const productCategories = Array.from(new Set(products?.map(p => p.category) || []))

    return NextResponse.json({
      categories: categories || [],
      products: products || [],
      productCategories,
      summary: {
        totalCategories: categories?.length || 0,
        totalProducts: products?.length || 0,
        uniqueProductCategories: productCategories.length,
        activeProducts: products?.filter(p => p.is_active).length || 0
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 