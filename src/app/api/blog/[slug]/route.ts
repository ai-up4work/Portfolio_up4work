import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { BlogPost } from '@/lib/models';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const post = await BlogPost.findOne({ slug: params.slug });
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await BlogPost.updateOne(
      { slug: params.slug },
      { $inc: { 'metadata.views': 1 } }
    );
    
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
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const post = await BlogPost.findOneAndUpdate(
      { slug: params.slug },
      body,
      { new: true, runValidators: true }
    );
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Blog API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
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
    const post = await BlogPost.findOneAndDelete({ slug: params.slug });
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Blog API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}