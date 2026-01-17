// src/app/api/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

// GET - Fetch all gallery images from Cloudinary
export async function GET(request: NextRequest) {
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
    const maxResults = parseInt(searchParams.get('max') || '500');

    // Fetch images from the gallery folder
    const result = await cloudinary.search
      .expression('folder:Up4work-portfolio/gallery')
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .execute();

    // Transform the results to include various sizes
    const images = result.resources.map((resource: any) => ({
      id: resource.public_id,
      url: resource.secure_url,
      thumbnail: cloudinary.url(resource.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      medium: cloudinary.url(resource.public_id, {
        width: 800,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      large: cloudinary.url(resource.public_id, {
        width: 1920,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      width: resource.width,
      height: resource.height,
      format: resource.format,
      createdAt: resource.created_at
    }));

    return NextResponse.json({
      success: true,
      data: images,
      total: result.total_count
    });

  } catch (error: any) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch gallery images',
      },
      { status: 500 }
    );
  }
}