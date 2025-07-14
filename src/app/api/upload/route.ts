import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import sharp from 'sharp'

// POST /api/upload - Upload images to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []
    const errors: string[] = []

    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name}: Only image files are allowed`)
          continue
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          errors.push(`${file.name}: File size must be less than 5MB`)
          continue
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `products/${fileName}`

        // Convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        let fileBuffer = new Uint8Array(arrayBuffer)

        // Compress image if JPEG or PNG
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          const compressed = await sharp(fileBuffer).jpeg({ quality: 80 }).toBuffer()
          fileBuffer = new Uint8Array(compressed)
        } else if (file.type === 'image/png') {
          const compressed = await sharp(fileBuffer).png({ quality: 80, compressionLevel: 8 }).toBuffer()
          fileBuffer = new Uint8Array(compressed)
        }
        // For GIFs and other formats, skip compression

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin!.storage
          .from('product-images')
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: false
          })

        if (error) {
          console.error('Upload error:', error)
          errors.push(`${file.name}: Upload failed - ${error.message}`)
          continue
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin!.storage
          .from('product-images')
          .getPublicUrl(data.path)

        uploadedUrls.push(urlData.publicUrl)

      } catch (fileError) {
        console.error('File processing error:', fileError)
        errors.push(`${file.name}: Processing failed`)
      }
    }

    // Return results
    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { 
          error: 'No files uploaded successfully',
          details: errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      urls: uploadedUrls,
      errors: errors.length > 0 ? errors : undefined,
      message: `${uploadedUrls.length} file(s) uploaded successfully`
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/upload - Delete image from Supabase Storage
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Extract file path from URL
    const urlParts = imageUrl.split('/product-images/')
    if (urlParts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      )
    }

    const filePath = urlParts[1]

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin!.storage
      .from('product-images')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Image deleted successfully' })

  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 