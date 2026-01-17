// src/app/api/projects/[slug]/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Project } from '@/lib/models';

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
    const slug = decodeURIComponent(encodedSlug);
    
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
    
    // If slug is being changed, check for uniqueness
    if (updateData.slug && updateData.slug !== slug) {
      const existing = await Project.findOne({ slug: updateData.slug });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }
    
    const project = await Project.findOneAndUpdate(
      { slug },
      { 
        ...updateData,
        updatedAt: new Date() // Explicitly set updatedAt
      },
      { 
        new: true, // Return updated document
        runValidators: true, // Run schema validators
        lean: true // Return plain object
      }
    );
    
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
    const slug = decodeURIComponent(encodedSlug);
    
    await connectDB();
    
    // Optional: Add authentication check here
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
    
    const project = await Project.findOneAndDelete({ slug });
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Optional: Clean up associated resources (images, etc.)
    // await deleteProjectImages(project.images);
    
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