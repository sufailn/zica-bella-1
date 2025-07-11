import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const sampleProducts = [
  {
    name: "CLASSIC WHITE TEE",
    description: "Premium cotton classic white t-shirt with perfect fit and comfort.",
    price: 1200,
    images: [
      "/shop/products/tshirt-1/p (1).jpeg",
      "/shop/products/tshirt-1/p (2).jpeg",
      "/shop/products/tshirt-1/p (3).jpeg",
      "/shop/products/tshirt-1/p (4).jpeg"
    ],
    category: "T-SHIRTS",
    stock_quantity: 50,
    sku: "TS001",
    is_featured: true,
    colors: [1, 2], // White, Black
    sizes: [2, 3, 4] // S, M, L
  },
  {
    name: "STRIPED GRAPHIC TEE",
    description: "Stylish striped graphic t-shirt with bold design and comfortable fit.",
    price: 1400,
    images: [
      "/shop/products/tshirt-2/p (1).jpeg",
      "/shop/products/tshirt-2/p (2).jpeg",
      "/shop/products/tshirt-2/p (3).jpeg",
      "/shop/products/tshirt-2/p (4).jpeg"
    ],
    category: "T-SHIRTS",
    stock_quantity: 30,
    sku: "TS002",
    is_featured: false,
    colors: [7, 3], // Navy, Red
    sizes: [2, 3, 4, 5] // S, M, L, XL
  },
  {
    name: "PREMIUM COTTON TEE",
    description: "Ultra-premium cotton t-shirt with exceptional quality and comfort.",
    price: 1600,
    images: [
      "/shop/products/tshirt-3/p (1).jpeg",
      "/shop/products/tshirt-3/p (2).jpeg",
      "/shop/products/tshirt-3/p (3).jpeg",
      "/shop/products/tshirt-3/p (4).jpeg"
    ],
    category: "T-SHIRTS",
    stock_quantity: 0, // Sold out
    sku: "TS003",
    is_featured: false,
    colors: [1, 2, 4], // White, Black, Blue
    sizes: [2, 3, 4, 5] // S, M, L, XL
  },
  {
    name: "MINIMALIST TEE",
    description: "Clean and minimalist design t-shirt for everyday wear.",
    price: 1100,
    images: ["/shop/products/tshirt-4/p.jpeg"],
    category: "T-SHIRTS",
    stock_quantity: 25,
    sku: "TS004",
    is_featured: false,
    colors: [1, 2], // White, Black
    sizes: [2, 3, 4] // S, M, L
  },
  {
    name: "LINEN CASUAL SHIRT",
    description: "Comfortable linen casual shirt perfect for any occasion.",
    price: 2200,
    images: [
      "/shop/products/shirt-1/p (1).jpeg",
      "/shop/products/shirt-1/p (2).jpeg",
      "/shop/products/shirt-1/p (3).jpeg"
    ],
    category: "SHIRTS",
    stock_quantity: 20,
    sku: "SH001",
    is_featured: true,
    colors: [13, 1, 4], // Beige, White, Blue
    sizes: [2, 3, 4, 5] // S, M, L, XL
  },
  {
    name: "FORMAL OXFORD SHIRT",
    description: "Classic Oxford shirt with formal design and professional look.",
    price: 2500,
    images: [
      "/shop/products/shirt-2/p (1).jpeg",
      "/shop/products/shirt-2/p (2).jpeg",
      "/shop/products/shirt-2/p (3).jpeg",
      "/shop/products/shirt-2/p (4).jpeg"
    ],
    category: "SHIRTS",
    stock_quantity: 15,
    sku: "SH002",
    is_featured: false,
    colors: [1, 4, 9], // White, Blue, Pink
    sizes: [2, 3, 4, 5] // S, M, L, XL
  },
  {
    name: "PREMIUM DENIM JEANS",
    description: "Premium denim jeans with perfect fit and modern styling.",
    price: 3200,
    images: [
      "/shop/products/jeans-1/p (1).jpeg",
      "/shop/products/jeans-1/p (2).jpeg",
      "/shop/products/jeans-1/p (3).jpeg"
    ],
    category: "JEANS",
    stock_quantity: 12,
    sku: "JN001",
    is_featured: true,
    colors: [4, 2, 6], // Blue, Black, Gray
    sizes: [10, 11, 12, 13] // 30, 32, 34, 36
  }
];

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { confirm } = await request.json();
    
    if (confirm !== 'YES_POPULATE') {
      return NextResponse.json(
        { error: 'Confirmation required. Send { "confirm": "YES_POPULATE" }' },
        { status: 400 }
      )
    }

    // Check if products already exist
    const { data: existingProducts } = await supabaseAdmin
      .from('products')
      .select('id')
      .limit(1);

    if (existingProducts && existingProducts.length > 0) {
      return NextResponse.json(
        { error: 'Products already exist in database. Use clear endpoint first if needed.' },
        { status: 400 }
      )
    }

    const createdProducts = [];
    const errors = [];

    for (const productData of sampleProducts) {
      try {
        const { colors, sizes, ...productFields } = productData;

        // Insert product
        const { data: product, error: productError } = await supabaseAdmin
          .from('products')
          .insert(productFields)
          .select()
          .single();

        if (productError) {
          errors.push(`Failed to create ${productData.name}: ${productError.message}`);
          continue;
        }

        // Insert color relationships
        if (colors && colors.length > 0) {
          const colorInserts = colors.map(colorId => ({
            product_id: product.id,
            color_id: colorId,
            available: true
          }));

          const { error: colorError } = await supabaseAdmin
            .from('product_colors')
            .insert(colorInserts);

          if (colorError) {
            errors.push(`Failed to add colors for ${productData.name}: ${colorError.message}`);
          }
        }

        // Insert size relationships
        if (sizes && sizes.length > 0) {
          const sizeInserts = sizes.map(sizeId => ({
            product_id: product.id,
            size_id: sizeId,
            available: true
          }));

          const { error: sizeError } = await supabaseAdmin
            .from('product_sizes')
            .insert(sizeInserts);

          if (sizeError) {
            errors.push(`Failed to add sizes for ${productData.name}: ${sizeError.message}`);
          }
        }

        createdProducts.push(product);
      } catch (error) {
        errors.push(`Unexpected error creating ${productData.name}: ${error}`);
      }
    }

    return NextResponse.json({
      message: `Successfully created ${createdProducts.length} products`,
      products: createdProducts,
      errors: errors.length > 0 ? errors : null
    });

  } catch (error) {
    console.error('Error populating products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { confirm } = await request.json();
    
    if (confirm !== 'YES_DELETE_ALL') {
      return NextResponse.json(
        { error: 'Confirmation required. Send { "confirm": "YES_DELETE_ALL" }' },
        { status: 400 }
      )
    }

    // Delete all products (cascade will handle colors and sizes)
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .neq('id', 0); // Delete all where id is not 0 (which means all)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete products: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'All products deleted successfully' });

  } catch (error) {
    console.error('Error deleting products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 