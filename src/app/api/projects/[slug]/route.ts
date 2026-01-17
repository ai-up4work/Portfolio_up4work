// src/app/api/projects/[slug]/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Project } from '@/lib/models';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to delete images from Cloudinary
async function deleteProjectImages(images?: string[]) {
  if (!images || images.length === 0) return;
  
  try {
    const deletePromises = images.map(async (imageUrl) => {
      try {
        // Extract public_id from Cloudinary URL
        const matches = imageUrl.match(/\/v\d+\/(.+)\.\w+$/);
        if (matches && matches[1]) {
          const publicId = matches[1];
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image: ${publicId}`);
        }
      } catch (err) {
        console.error(`Failed to delete image ${imageUrl}:`, err);
      }
    });
    
    await Promise.allSettled(deletePromises);
  } catch (error) {
    console.error('Error deleting project images:', error);
  }
}

// GET - Fetch a single project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    // Decode URL-encoded slug
    const slug = decodeURIComponent(encodedSlug);
    
    const url = new URL(request.url);
    const incrementViews = url.searchParams.get('incrementViews') !== 'false';
    
    await connectDB();
    
    // Use lean() for better performance when you don't need Mongoose document features
    const project = await Project.findOne({ slug }).lean();
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Increment view count (only if not disabled via query param)
    if (incrementViews) {
      // Fire and forget - don't await to avoid slowing down response
      Project.updateOne(
        { slug },
        { $inc: { 'metadata.views': 1 } }
      ).catch(err => console.error('Failed to increment views:', err));
    }
    
    return NextResponse.json({ 
      success: true, 
      data: project 
    });
  } catch (error) {
    console.error('Project API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT - Update a project
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    // Decode URL-encoded slug
    const identifier = decodeURIComponent(encodedSlug);
    
    await connectDB();
    const body = await request.json();
    
    // Optional: Add authentication check here
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
    
    // Prevent updating certain fields
    const { _id, createdAt, ...updateData } = body;
    
    // Find existing project by _id or slug
    let existingProject;
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      existingProject = await Project.findById(identifier);
    } else {
      existingProject = await Project.findOne({ slug: identifier });
    }
    
    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // If slug is being changed, check for uniqueness
    if (updateData.slug && updateData.slug !== existingProject.slug) {
      const slugExists = await Project.findOne({ slug: updateData.slug });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }
    
    // Perform update
    let project;
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      project = await Project.findByIdAndUpdate(
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
      project = await Project.findOneAndUpdate(
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
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error: any) {
    console.error('Project Update Error:', error);
    
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
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (e.g., increment likes)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    // Decode URL-encoded slug
    const slug = decodeURIComponent(encodedSlug);
    
    await connectDB();
    const body = await request.json();
    
    // Handle specific actions
    if (body.action === 'incrementLikes') {
      const project = await Project.findOneAndUpdate(
        { slug },
        { $inc: { 'metadata.likes': 1 } },
        { new: true, lean: true }
      );
      
      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        data: { likes: project.metadata?.likes || 0 }
      });
    }
    
    if (body.action === 'toggleFeatured') {
      const project = await Project.findOne({ slug });
      
      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        );
      }
      
      project.featured = !project.featured;
      await project.save();
      
      return NextResponse.json({ 
        success: true, 
        data: { featured: project.featured }
      });
    }
    
    // Default patch behavior
    const { _id, createdAt, ...updateData } = body;
    const project = await Project.findOneAndUpdate(
      { slug },
      updateData,
      { new: true, lean: true }
    );
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Project Patch Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    // Decode URL-encoded slug
    const identifier = decodeURIComponent(encodedSlug);
    
    await connectDB();
    
    // Optional: Add authentication check here
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
    
    // Try to find by _id first, then by slug
    let project;
    
    // Check if identifier is a valid MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      project = await Project.findByIdAndDelete(identifier);
    }
    
    // If not found by _id, try by slug
    if (!project) {
      project = await Project.findOneAndDelete({ slug: identifier });
    }
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Clean up associated resources (images, etc.)
    // Combine main image and gallery images
    const allImages = [
      ...(project.image ? [project.image] : []),
      ...(project.images || [])
    ];
    
    if (allImages.length > 0) {
      // Fire and forget - don't block the response
      deleteProjectImages(allImages).catch(err => 
        console.error('Failed to delete project images:', err)
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: project,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Project Delete Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}