import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Project } from '@/lib/models';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    
    let query = Project.find();
    
    if (featured === 'true') {
      query = query.where('featured').equals(true);
    }
    
    query = query.sort({ order: 1, publishedAt: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const projects = await query;
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error('Projects API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const project = await Project.create(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('Projects API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}