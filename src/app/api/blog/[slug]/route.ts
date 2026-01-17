// src/app/api/blog/[slug]/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { BlogPost } from '@/lib/models';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to delete images from Cloudinary
async function deleteBlogImages(imageUrl?: string) {
  if (!imageUrl) return;
  
  try {
    // Extract public_id from Cloudinary URL
    const matches = imageUrl.match(/\/v\d+\/(.+)\.\w+$/);
    if (matches && matches[1]) {
      const publicId = matches[1];
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted image: ${publicId}`);
    }
  } catch (error) {
    console.error('Error deleting blog image:', error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    const slug = decodeURIComponent(encodedSlug);
    
    const url = new URL(request.url);
    const incrementViews = url.searchParams.get('incrementViews') !== 'false';
    
    await connectDB();
    
    const post = await BlogPost.findOne({ slug }).lean();
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Increment view count (only if not disabled via query param)
    if (incrementViews) {
      // Fire and forget - don't await to avoid slowing down response
      BlogPost.updateOne(
        { slug },
        { $inc: { 'metadata.views': 1 } }
      ).catch(err => console.error('Failed to increment views:', err));
    }
    
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Blog API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    const identifier = decodeURIComponent(encodedSlug);
    
    await connectDB();
    const body = await request.json();
    
    // Prevent updating certain fields
    const { _id, createdAt, ...updateData } = body;
    
    // Find existing post by _id or slug
    let existingPost;
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      existingPost = await BlogPost.findById(identifier);
    } else {
      existingPost = await BlogPost.findOne({ slug: identifier });
    }
    
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // If slug is being changed, check for uniqueness
    if (updateData.slug && updateData.slug !== existingPost.slug) {
      const slugExists = await BlogPost.findOne({ slug: updateData.slug });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }
    
    // Perform update
    let post;
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      post = await BlogPost.findByIdAndUpdate(
        identifier,
        {
          ...updateData,
          updatedAt: new Date()
        },
        { 
          new: true, 
          runValidators: true,
          lean: true
        }
      );
    } else {
      post = await BlogPost.findOneAndUpdate(
        { slug: identifier },
        {
          ...updateData,
          updatedAt: new Date()
        },
        { 
          new: true, 
          runValidators: true,
          lean: true
        }
      );
    }
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: post,
      message: 'Blog post updated successfully'
    });
  } catch (error: any) {
    console.error('Blog Update Error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    const identifier = decodeURIComponent(encodedSlug);
    
    await connectDB();
    
    // Try to find by _id first, then by slug
    let post;
    
    // Check if identifier is a valid MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      post = await BlogPost.findByIdAndDelete(identifier);
    }
    
    // If not found by _id, try by slug
    if (!post) {
      post = await BlogPost.findOneAndDelete({ slug: identifier });
    }
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Clean up associated image
    if (post.image) {
      // Fire and forget - don't block the response
      deleteBlogImages(post.image).catch(err => 
        console.error('Failed to delete blog image:', err)
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: post,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Blog Delete Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}