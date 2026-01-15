import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Project } from '@/lib/models';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const project = await Project.findOne({ slug: params.slug });
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await Project.updateOne(
      { slug: params.slug },
      { $inc: { 'metadata.views': 1 } }
    );
    
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Project API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const project = await Project.findOneAndUpdate(
      { slug: params.slug },
      body,
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Project API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const project = await Project.findOneAndDelete({ slug: params.slug });
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Project API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}