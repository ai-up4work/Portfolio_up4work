// src/app/api/blog/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { BlogPost } from '@/lib/models';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const tag = searchParams.get('tag');
    
    let query = BlogPost.find();
    
    if (featured === 'true') {
      query = query.where('featured').equals(true);
    }
    
    if (tag) {
      query = query.where('tags').in([tag]);
    }
    
    query = query.sort({ order: 1, publishedAt: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const posts = await query.lean();
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error('Blog API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Check if slug already exists
    const existing = await BlogPost.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A blog post with this slug already exists' },
        { status: 400 }
      );
    }
    
    const post = await BlogPost.create(body);
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) {
    console.error('Blog API Error:', error);
    
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
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}