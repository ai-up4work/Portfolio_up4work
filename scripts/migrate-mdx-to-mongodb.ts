import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://up4work_admin:up4work5458@cluster0.vovz84k.mongodb.net/?appName=Cluster0';

// Define schemas directly in migration script
const ProjectSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  tags: [{ type: String }],
  content: { type: String, required: true },
});

const BlogPostSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  publishedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  tags: [{ type: String }],
  content: { type: String, required: true },
  author: { type: String },
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

function getMdxFiles(directory: string): string[] {
  const fullPath = path.join(process.cwd(), directory);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Directory not found: ${directory}`);
    return [];
  }

  return fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.mdx') || file.endsWith('.md'));
}

function parseMdxFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(fileContent);
  
  const filename = path.basename(filePath, path.extname(filePath));
  const slug = frontmatter.slug || filename;
  
  return {
    slug,
    title: frontmatter.title || filename,
    description: frontmatter.description || '',
    image: frontmatter.image || frontmatter.cover || '',
    publishedAt: frontmatter.publishedAt || frontmatter.date || new Date(),
    featured: frontmatter.featured || false,
    order: frontmatter.order || 0,
    tags: frontmatter.tags || [],
    content,
    author: frontmatter.author,
  };
}

async function migrateProjects() {
  console.log('\n📦 Migrating Projects...');
  
  const projectsDir = 'app/work/projects';
  const files = getMdxFiles(projectsDir);
  
  if (files.length === 0) {
    console.log('⚠️  No project files found');
    return;
  }

  for (const file of files) {
    try {
      const filePath = path.join(process.cwd(), projectsDir, file);
      const projectData = parseMdxFile(filePath);
      
      // Check if project already exists
      const existing = await Project.findOne({ slug: projectData.slug });
      
      if (existing) {
        console.log(`⏭️  Skipping existing project: ${projectData.title}`);
        continue;
      }
      
      await Project.create(projectData);
      console.log(`✅ Migrated project: ${projectData.title}`);
    } catch (error) {
      console.error(`❌ Error migrating ${file}:`, error);
    }
  }
}

async function migrateBlogPosts() {
  console.log('\n📝 Migrating Blog Posts...');
  
  const blogDir = 'app/blog/posts';
  const files = getMdxFiles(blogDir);
  
  if (files.length === 0) {
    console.log('⚠️  No blog post files found');
    return;
  }

  for (const file of files) {
    try {
      const filePath = path.join(process.cwd(), blogDir, file);
      const postData = parseMdxFile(filePath);
      
      // Check if post already exists
      const existing = await BlogPost.findOne({ slug: postData.slug });
      
      if (existing) {
        console.log(`⏭️  Skipping existing post: ${postData.title}`);
        continue;
      }
      
      await BlogPost.create(postData);
      console.log(`✅ Migrated post: ${postData.title}`);
    } catch (error) {
      console.error(`❌ Error migrating ${file}:`, error);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting MDX to MongoDB migration...\n');
    
    await connectDB();
    
    await migrateProjects();
    await migrateBlogPosts();
    
    console.log('\n✨ Migration completed successfully!');
    
    // Display summary
    const projectCount = await Project.countDocuments();
    const blogCount = await BlogPost.countDocuments();
    
    console.log('\n📊 Summary:');
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Blog Posts: ${blogCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

main();