import mongoose, { Schema, Model } from 'mongoose';

// Gallery Model (unchanged)
interface IGalleryImage {
  src: string;
  alt: string;
  orientation: 'horizontal' | 'vertical';
  order: number;
  createdAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  orientation: { type: String, enum: ['horizontal', 'vertical'], required: true },
  order: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Enhanced Project Model with full content support
// In your models file
interface IProject {
  slug: string;
  title: string;
  description: string;
  image: string; // Keep for backward compatibility
  images?: string[]; // Add this for multiple images
  publishedAt: Date;
  featured: boolean;
  order: number;
  tags?: string[];
  content: string;
  metadata?: {
    readTime?: string;
    views?: number;
    likes?: number;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}

const ProjectSchema = new Schema<IProject>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  images: [{ type: String }], // Add this line
  publishedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  tags: [{ type: String }],
  content: { type: String, required: true },
  metadata: {
    readTime: { type: String },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    ogImage: { type: String },
  },
}, { timestamps: true });

// Enhanced Blog Post Model with full content support
interface IBlogPost {
  slug: string;
  title: string;
  description: string;
  image?: string;
  publishedAt: Date;
  featured: boolean;
  order: number;
  tags?: string[];
  content: string; // MDX/Markdown content
  author?: string;
  metadata?: {
    readTime?: string;
    views?: number;
    likes?: number;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}

const BlogPostSchema = new Schema<IBlogPost>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  publishedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  tags: [{ type: String }],
  content: { type: String, required: true }, // Full MDX/Markdown content
  author: { type: String },
  metadata: {
    readTime: { type: String },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    ogImage: { type: String },
  },
}, { timestamps: true });

// Export models
export const GalleryImage: Model<IGalleryImage> = 
  mongoose.models.GalleryImage || mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);

export const Project: Model<IProject> = 
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export const BlogPost: Model<IBlogPost> = 
  mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

// Export types
export type { IGalleryImage, IProject, IBlogPost };