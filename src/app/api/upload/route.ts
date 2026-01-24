// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// App Router configuration - replaces the old config export
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary credentials not configured. Please check your .env.local file.' 
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'Up4work-portfolio';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate hash of the file content to check for duplicates
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex');

    // Check if an image with the same hash already exists in this folder
    try {
      const searchResult = await cloudinary.search
        .expression(`folder:${folder}/* AND context.content_hash=${fileHash}`)
        .max_results(1)
        .execute();

      if (searchResult.resources.length > 0) {
        const existingImage = searchResult.resources[0];
        
        // Return the existing image instead of an error
        return NextResponse.json({
          success: true,  // ← Changed to true
          url: existingImage.secure_url,
          public_id: existingImage.public_id,
          width: existingImage.width,
          height: existingImage.height,
          format: existingImage.format,
          original_filename: file.name,
          message: 'Image already exists, returning existing image' // Optional
        });
      }
    } catch (searchError) {
      console.error('Error checking for duplicates:', searchError);
      // Continue with upload even if search fails
    }

    // Generate a unique identifier using timestamp + random string
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const uniqueId = `${timestamp}_${randomString}`;

    // Upload to Cloudinary using a Promise
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: uniqueId, // Use unique ID instead of filename
          resource_type: 'auto',
          context: `content_hash=${fileHash}|original_filename=${file.name}`, // Store metadata
          transformation: [
            { width: 1920, crop: 'limit' }, // Limit max width
            { quality: 'auto' }, // Auto quality
            { fetch_format: 'auto' } // Auto format (WebP, etc.)
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Upload successful:', result?.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      original_filename: file.name
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Upload failed. Please try again.',
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove images from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary credentials not configured' 
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'No public_id provided' },
        { status: 400 }
      );
    }

    console.log('Deleting image:', publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully',
        result
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Image not found or already deleted',
        result
      });
    }

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Delete failed',
      },
      { status: 500 }
    );
  }
}