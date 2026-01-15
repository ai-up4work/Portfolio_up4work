import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { GalleryImage } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const images = await GalleryImage.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    console.error('Gallery API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const image = await GalleryImage.create(body);
    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error) {
    console.error('Gallery API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gallery image' },
      { status: 500 }
    );
  }
}