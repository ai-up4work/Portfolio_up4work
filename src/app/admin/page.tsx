'use client';

import React, { useState, useEffect } from 'react';
import { Upload, X, Link as LinkIcon, Eye, EyeOff, ChevronDown, ChevronUp, Image as ImageIcon, FileText } from 'lucide-react';

interface ItemData {
  _id?: string;
  slug: string;
  title: string;
  description: string;
  image?: string;
  images?: string[];
  content: string;
  author?: string;
  tags?: string[];
  featured: boolean;
  order: number;
  publishedAt?: string;
  link?: string;
  avatars?: { src: string }[];
  metadata?: {
    readTime?: string;
    tag?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}

interface GalleryImage {
  id: string;
  url: string;
  thumbnail: string;
  medium: string;
  large: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
}

interface FormData {
  slug: string;
  title: string;
  description: string;
  image: string;
  images: string[];
  content: string;
  author: string;
  tags: string;
  featured: boolean;
  order: number;
  publishedAt: string;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  link: string;
  avatars: string;
  tag: string;
}

export default function AdminCMS() {
  const [activeTab, setActiveTab] = useState<'projects' | 'blogs' | 'gallery'>('projects');
  const [items, setItems] = useState<ItemData[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [formData, setFormData] = useState<FormData>({
    slug: '',
    title: '',
    description: '',
    image: '',
    images: [],
    content: '',
    author: '',
    tags: '',
    featured: false,
    order: 0,
    publishedAt: new Date().toISOString().split('T')[0],
    readTime: '',
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
    link: '',
    avatars: '',
    tag: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [additionalImagesMode, setAdditionalImagesMode] = useState<'upload' | 'url'>('upload');
  const [showPreview, setShowPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    media: true,
    content: true,
    metadata: false,
    seo: false
  });
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  
  // New state for MD file upload
  const [mdFile, setMdFile] = useState<File | null>(null);
  const [mdImages, setMdImages] = useState<File[]>([]);
  const [mdUploadMode, setMdUploadMode] = useState<'manual' | 'md-upload'>('manual');

  useEffect(() => {
    if (activeTab === 'gallery') {
      fetchGalleryImages();
    } else {
      fetchItems();
    }
  }, [activeTab]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'projects' ? '/api/work' : '/api/blog';
      const response = await fetch(endpoint);
      const result = await response.json();
      if (result.success) {
        setItems(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gallery');
      const result = await response.json();
      if (result.success) {
        setGalleryImages(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      return result.url;
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  };

  // New function to parse MD file and extract image references
  const extractImageReferences = (mdContent: string): string[] => {
    // Match both ![alt](path) and ![alt](path "title") formats
    const imageRegex = /!\[.*?\]\((.*?)(?:\s+".*?")?\)/g;
    const matches = mdContent.matchAll(imageRegex);
    const imagePaths: string[] = [];
    
    for (const match of matches) {
      const imagePath = match[1].trim();
      // Only include local references (not URLs)
      if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
        imagePaths.push(imagePath);
      }
    }
    
    return imagePaths;
  };

  // New function to extract frontmatter from MD file
  const parseFrontmatter = (mdContent: string): { frontmatter: any; content: string } => {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = mdContent.match(frontmatterRegex);
    
    if (!match) {
      return { frontmatter: {}, content: mdContent };
    }
    
    const frontmatterText = match[1];
    const content = match[2];
    
    // Parse YAML frontmatter (simple key: value format)
    const frontmatter: any = {};
    const lines = frontmatterText.split('\n');
    
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Remove quotes if present
        value = value.replace(/^["']|["']$/g, '');
        
        frontmatter[key] = value;
      }
    });
    
    return { frontmatter, content };
  };

  // New function to handle MD file upload with images
  const handleMdFileUpload = async () => {
    if (!mdFile) {
      alert('Please select an MD file first');
      return;
    }

    setUploading(true);
    try {
      // Read MD file content
      const mdContent = await mdFile.text();
      
      // Parse frontmatter and content
      const { frontmatter, content } = parseFrontmatter(mdContent);
      
      // Extract image references from MD content
      const imageRefs = extractImageReferences(content);
      
      // Create a map of original filename to uploaded URL
      const imageUrlMap: { [key: string]: string } = {};
      
      // Upload all images to Cloudinary
      const folder = activeTab === 'projects' 
        ? `Up4work-portfolio/Project_Images/${frontmatter.slug || formData.slug || 'temp'}`
        : `Up4work-portfolio/Blog_Images/${frontmatter.slug || formData.slug || 'temp'}`;
      
      for (const imageFile of mdImages) {
        const fileName = imageFile.name;
        const cloudinaryUrl = await uploadToCloudinary(imageFile, folder);
        
        // Map various possible reference formats
        imageUrlMap[fileName] = cloudinaryUrl;
        imageUrlMap[`./${fileName}`] = cloudinaryUrl;
        imageUrlMap[`./images/${fileName}`] = cloudinaryUrl;
        imageUrlMap[`images/${fileName}`] = cloudinaryUrl;
        
        // Handle encoded spaces
        const encodedName = fileName.replace(/ /g, '%20');
        imageUrlMap[encodedName] = cloudinaryUrl;
        imageUrlMap[`./${encodedName}`] = cloudinaryUrl;
        imageUrlMap[`./images/${encodedName}`] = cloudinaryUrl;
        imageUrlMap[`images/${encodedName}`] = cloudinaryUrl;
      }
      
      // Replace image references in content
      let updatedContent = content;
      imageRefs.forEach(ref => {
        if (imageUrlMap[ref]) {
          // Escape special regex characters in the path
          const escapedRef = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`!\\[([^\\]]*)\\]\\(${escapedRef}(?:\\s+"[^"]*")?\\)`, 'g');
          updatedContent = updatedContent.replace(regex, `![$1](${imageUrlMap[ref]})`);
        }
      });
      
      // Update form data with parsed information
      setFormData({
        ...formData,
        slug: frontmatter.slug || formData.slug,
        title: frontmatter.title || formData.title,
        description: frontmatter.description || frontmatter.summary || formData.description,
        image: frontmatter.image || formData.image,
        content: updatedContent,
        tags: frontmatter.tag || frontmatter.tags || formData.tags,
        publishedAt: frontmatter.publishedAt || formData.publishedAt,
        author: frontmatter.author || formData.author,
        metaTitle: frontmatter.metaTitle || formData.metaTitle,
        metaDescription: frontmatter.metaDescription || formData.metaDescription,
        ogImage: frontmatter.ogImage || formData.ogImage,
      });
      
      // Switch to manual mode to show the processed content
      setMdUploadMode('manual');
      setExpandedSections({ basic: true, media: true, content: true, metadata: true, seo: true });
      
      alert(`MD file processed successfully! ${mdImages.length} image(s) uploaded to Cloudinary.`);
      setMdFile(null);
      setMdImages([]);
      
    } catch (error) {
      alert('Failed to process MD file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const folder = activeTab === 'projects' 
        ? `Up4work-portfolio/Project_Images/${formData.slug || 'temp'}`
        : `Up4work-portfolio/Blog_Images/${formData.slug || 'temp'}`;
      
      const url = await uploadToCloudinary(file, folder);
      setFormData({ ...formData, image: url });
      alert('Image uploaded successfully!');
    } catch (error) {
      alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const folder = `Up4work-portfolio/Project_Images/${formData.slug || 'temp'}`;
      const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file, folder));
      const urls = await Promise.all(uploadPromises);
      
      setFormData({ 
        ...formData, 
        images: [...formData.images, ...urls]
      });
      alert(`${urls.length} image(s) uploaded successfully!`);
    } catch (error) {
      alert('Failed to upload images: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedGalleryFiles(Array.from(files));
    }
  };

  const uploadGalleryImages = async () => {
    if (selectedGalleryFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = selectedGalleryFiles.map(async (file) => {
        return await uploadToCloudinary(file, 'Up4work-portfolio/gallery');
      });

      await Promise.all(uploadPromises);
      alert(`${selectedGalleryFiles.length} image(s) uploaded successfully to gallery!`);
      setSelectedGalleryFiles([]);
      fetchGalleryImages();
    } catch (error) {
      alert('Failed to upload images: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const deleteGalleryImage = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/upload?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        alert('Image deleted successfully!');
        fetchGalleryImages();
      }
    } catch (error) {
      alert('Failed to delete image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const endpoint = activeTab === 'projects' ? '/api/work' : '/api/blog';
    const payload: any = {
      slug: formData.slug,
      title: formData.title,
      description: formData.description,
      image: formData.image,
      content: formData.content,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      featured: formData.featured,
      order: formData.order,
      publishedAt: formData.publishedAt,
      metadata: {
        readTime: formData.readTime,
      },
      seo: {
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        ogImage: formData.ogImage
      }
    };

    if (activeTab === 'projects') {
      payload.images = formData.images;
      payload.link = formData.link;
      if (formData.avatars) {
        payload.avatars = formData.avatars.split(',').map(src => ({ src: src.trim() })).filter(a => a.src);
      }
    }

    if (activeTab === 'blogs') {
      payload.author = formData.author;
      payload.metadata.tag = formData.tag;
    }

    try {
      const response = await fetch(editingId ? `${endpoint}/${editingId}` : endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        alert(editingId ? 'Updated successfully!' : 'Created successfully!');
        resetForm();
        fetchItems();
      } else {
        alert('Failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ItemData) => {
    setFormData({
      slug: item.slug,
      title: item.title,
      description: item.description,
      image: item.image || '',
      images: item.images || [],
      content: item.content,
      author: item.author || '',
      tags: item.tags?.join(', ') || '',
      featured: item.featured,
      order: item.order,
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      readTime: item.metadata?.readTime || '',
      metaTitle: item.seo?.metaTitle || '',
      metaDescription: item.seo?.metaDescription || '',
      ogImage: item.seo?.ogImage || '',
      link: item.link || '',
      avatars: item.avatars?.map(a => a.src).join(', ') || '',
      tag: item.metadata?.tag || ''
    });
    setEditingId(item._id || item.slug);
    setMdUploadMode('manual');
    setExpandedSections({ basic: true, media: true, content: true, metadata: true, seo: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const endpoint = activeTab === 'projects' ? '/api/work' : '/api/blog';
    
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        alert('Deleted successfully!');
        fetchItems();
      }
    } catch (error) {
      alert('Failed to delete: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      description: '',
      image: '',
      images: [],
      content: '',
      author: '',
      tags: '',
      featured: false,
      order: 0,
      publishedAt: new Date().toISOString().split('T')[0],
      readTime: '',
      metaTitle: '',
      metaDescription: '',
      ogImage: '',
      link: '',
      avatars: '',
      tag: ''
    });
    setEditingId(null);
    setMdFile(null);
    setMdImages([]);
    setMdUploadMode('manual');
    setExpandedSections({ basic: true, media: true, content: true, metadata: false, seo: false });
  };

  const SectionHeader = ({ title, section }: { title: string; section: keyof typeof expandedSections }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        fontSize: '16px',
        fontWeight: 600,
        color: 'var(--neutral-on-background-strong)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        borderBottom: '1px solid var(--neutral-alpha-weak)',
        marginBottom: expandedSections[section] ? '16px' : '0'
      }}
    >
      {title}
      {expandedSections[section] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </button>
  );

  return (
    <div className="min-h-screen" style={{ color: 'var(--neutral-on-background-strong)' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            marginBottom: '12px',
            background: 'linear-gradient(135deg, var(--brand-on-background-strong), var(--accent-on-background-strong))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Content Management System
          </h1>
          <p style={{
            fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
            color: 'var(--neutral-on-background-weak)',
            maxWidth: '48rem',
            margin: '0 auto'
          }}>
            Create and manage your portfolio projects, blog posts, and gallery
          </p>
        </div>
        
        {/* Tabs */}
        <div style={{ 
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('projects'); resetForm(); }}
            style={{
              padding: '12px 24px',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: 600,
              background: activeTab === 'projects' ? 'var(--brand-background-strong)' : 'var(--surface-background)',
              color: activeTab === 'projects' ? 'white' : 'var(--neutral-on-background-medium)',
              border: '1px solid var(--neutral-alpha-weak)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'projects' ? '0 4px 12px var(--brand-alpha-weak)' : 'none'
            }}
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('blogs'); resetForm(); }}
            style={{
              padding: '12px 24px',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: 600,
              background: activeTab === 'blogs' ? 'var(--brand-background-strong)' : 'var(--surface-background)',
              color: activeTab === 'blogs' ? 'white' : 'var(--neutral-on-background-medium)',
              border: '1px solid var(--neutral-alpha-weak)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'blogs' ? '0 4px 12px var(--brand-alpha-weak)' : 'none'
            }}
          >
            Blog Posts
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('gallery'); resetForm(); }}
            style={{
              padding: '12px 24px',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: 600,
              background: activeTab === 'gallery' ? 'var(--brand-background-strong)' : 'var(--surface-background)',
              color: activeTab === 'gallery' ? 'white' : 'var(--neutral-on-background-medium)',
              border: '1px solid var(--neutral-alpha-weak)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'gallery' ? '0 4px 12px var(--brand-alpha-weak)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ImageIcon size={16} /> Gallery
          </button>
        </div>

        {activeTab === 'gallery' ? (
          // Gallery Tab Content
          <div style={{
            background: 'var(--surface-background)',
            border: '1px solid var(--neutral-alpha-weak)',
            borderRadius: '16px',
            padding: 'clamp(1.5rem, 3vw, 2.5rem)',
            boxShadow: '0 8px 32px var(--neutral-alpha-weak)',
            width: '90vw',
            maxWidth: '90vw',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 700,
              marginBottom: '24px'
            }}>
              Gallery Management
            </h2>

            {/* Upload Section */}
            <div style={{
              background: 'var(--input-background)',
              border: '1px solid var(--neutral-alpha-weak)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                Upload Images to Gallery
              </h3>

              <label style={{
                display: 'block',
                width: '100%',
                padding: '32px',
                background: 'var(--surface-background)',
                border: '2px dashed var(--neutral-alpha-weak)',
                borderRadius: '12px',
                color: 'var(--neutral-on-background-medium)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '16px'
              }}>
                {selectedGalleryFiles.length > 0 
                  ? `${selectedGalleryFiles.length} file(s) selected` 
                  : 'Click to select images or drag and drop'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFileSelect}
                  style={{ display: 'none' }}
                />
              </label>

              {selectedGalleryFiles.length > 0 && (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    {selectedGalleryFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid var(--neutral-alpha-weak)'
                        }}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={uploadGalleryImages}
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: '16px 32px',
                      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                      fontWeight: 600,
                      background: uploading 
                        ? 'var(--neutral-alpha-weak)' 
                        : 'linear-gradient(135deg, var(--brand-background-strong), var(--accent-background-strong))',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.6 : 1,
                      transition: 'all 0.3s ease',
                      boxShadow: uploading ? 'none' : '0 4px 16px var(--brand-alpha-weak)'
                    }}
                  >
                    {uploading ? 'Uploading...' : `Upload ${selectedGalleryFiles.length} Image(s)`}
                  </button>
                </>
              )}
            </div>

            {/* Gallery Grid */}
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                Current Gallery ({galleryImages.length} images)
              </h3>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--neutral-on-background-weak)' }}>
                  Loading gallery...
                </div>
              ) : galleryImages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                  <ImageIcon size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ color: 'var(--neutral-on-background-weak)' }}>
                    No images in gallery yet. Upload some above!
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {galleryImages.map((image) => (
                    <div
                      key={image.id}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--neutral-alpha-weak)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        const btn = e.currentTarget.querySelector('button') as HTMLElement;
                        const info = e.currentTarget.querySelector('.image-info') as HTMLElement;
                        if (btn) btn.style.opacity = '1';
                        if (info) info.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget.querySelector('button') as HTMLElement;
                        const info = e.currentTarget.querySelector('.image-info') as HTMLElement;
                        if (btn) btn.style.opacity = '0';
                        if (info) info.style.opacity = '0';
                      }}
                    >
                      <img
                        src={image.thumbnail}
                        alt={image.id}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        onClick={() => deleteGalleryImage(image.id)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'var(--accent-background-strong)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          opacity: 0,
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        <X size={18} />
                      </button>
                      <div
                        className="image-info"
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                          padding: '24px 12px 12px',
                          color: 'white',
                          fontSize: '0.75rem',
                          opacity: 0,
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        {image.width} × {image.height}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Projects & Blogs Tab Content
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '45vw 45vw',
            gap: '24px',
            alignItems: 'start',
            width: '90vw',
            maxWidth: '90vw',
            margin: '0 auto'
          }}>
            {/* Form Section */}
            <div style={{
              background: 'var(--surface-background)',
              border: '1px solid var(--neutral-alpha-weak)',
              borderRadius: '16px',
              padding: 'clamp(1.5rem, 3vw, 2.5rem)',
              boxShadow: '0 8px 32px var(--neutral-alpha-weak)',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{
                  fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                  fontWeight: 700
                }}>
                  {editingId ? 'Edit' : 'Create'} {activeTab === 'projects' ? 'Project' : 'Post'}
                </h2>
                
                {/* Input Mode Toggle */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setMdUploadMode('manual')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      background: mdUploadMode === 'manual' ? 'var(--brand-alpha-weak)' : 'transparent',
                      color: mdUploadMode === 'manual' ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-medium)',
                      border: '1px solid var(--neutral-alpha-weak)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setMdUploadMode('md-upload')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      background: mdUploadMode === 'md-upload' ? 'var(--brand-alpha-weak)' : 'transparent',
                      color: mdUploadMode === 'md-upload' ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-medium)',
                      border: '1px solid var(--neutral-alpha-weak)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 600
                    }}
                  >
                    <FileText size={16} /> MD Upload
                  </button>
                </div>
              </div>
              
              {mdUploadMode === 'md-upload' ? (
                // MD File Upload Mode
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{
                    background: 'var(--input-background)',
                    border: '2px dashed var(--brand-alpha-weak)',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center'
                  }}>
                    <FileText size={48} style={{ margin: '0 auto 16px', color: 'var(--brand-on-background-strong)' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
                      Upload Markdown File with Images
                    </h3>
                    <p style={{ color: 'var(--neutral-on-background-weak)', marginBottom: '32px', fontSize: '14px' }}>
                      Upload your .md file along with all referenced images. We'll automatically upload images to Cloudinary and update the references.
                    </p>
                    
                    {/* MD File Input */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        width: '100%',
                        padding: '20px 32px',
                        background: mdFile 
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : 'var(--brand-background-strong)',
                        color: 'white',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '16px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          <FileText size={24} />
                          <span>{mdFile ? `✓ ${mdFile.name}` : '📄 Click to Select Markdown File (.md)'}</span>
                        </div>
                        <input
                          type="file"
                          accept=".md,.markdown"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setMdFile(file);
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {mdFile && (
                        <p style={{ 
                          marginTop: '8px', 
                          fontSize: '12px', 
                          color: 'var(--brand-on-background-strong)',
                          fontWeight: 600 
                        }}>
                          ✓ File selected successfully
                        </p>
                      )}
                    </div>
                    
                    {/* Images Input */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        width: '100%',
                        padding: '20px 32px',
                        background: mdImages.length > 0
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : 'var(--accent-background-strong)',
                        color: 'white',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '16px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          <ImageIcon size={24} />
                          <span>
                            {mdImages.length > 0 
                              ? `✓ ${mdImages.length} image(s) selected` 
                              : '🖼️ Click to Select Images (Multiple)'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) setMdImages(Array.from(files));
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {mdImages.length > 0 && (
                        <p style={{ 
                          marginTop: '8px', 
                          fontSize: '12px', 
                          color: 'var(--accent-on-background-strong)',
                          fontWeight: 600 
                        }}>
                          ✓ {mdImages.length} image(s) ready to upload
                        </p>
                      )}
                    </div>
                    
                    {/* Selected Images Preview */}
                    {mdImages.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: '12px',
                        marginTop: '20px',
                        marginBottom: '20px'
                      }}>
                        {mdImages.map((img, idx) => (
                          <div key={idx} style={{
                            position: 'relative',
                            aspectRatio: '1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--neutral-alpha-weak)'
                          }}>
                            <img
                              src={URL.createObjectURL(img)}
                              alt={img.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              padding: '4px',
                              fontSize: '10px',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}>
                              {img.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Process Button */}
                    <button
                      onClick={handleMdFileUpload}
                      disabled={!mdFile || uploading}
                      style={{
                        width: '100%',
                        padding: '16px 32px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: (!mdFile || uploading)
                          ? 'var(--neutral-alpha-weak)'
                          : 'linear-gradient(135deg, var(--brand-background-strong), var(--accent-background-strong))',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: (!mdFile || uploading) ? 'not-allowed' : 'pointer',
                        opacity: (!mdFile || uploading) ? 0.6 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {uploading ? 'Processing & Uploading...' : 'Process MD File & Upload Images'}
                    </button>
                    
                    <p style={{
                      marginTop: '16px',
                      fontSize: '12px',
                      color: 'var(--neutral-on-background-weak)'
                    }}>
                      💡 Tip: Make sure image filenames in your MD file match the actual image files
                    </p>
                  </div>
                </div>
              ) : (
                // Manual Input Mode
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Basic Info Section */}
                  <div>
                    <SectionHeader title="Basic Information" section="basic" />
                    {expandedSections.basic && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                            Slug *
                          </label>
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="url-friendly-slug"
                            disabled={!!editingId}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                              background: 'var(--input-background)',
                              border: '1px solid var(--neutral-alpha-weak)',
                              borderRadius: '8px',
                              color: 'var(--neutral-on-background-strong)',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                            Title *
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter a compelling title"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                              background: 'var(--input-background)',
                              border: '1px solid var(--neutral-alpha-weak)',
                              borderRadius: '8px',
                              color: 'var(--neutral-on-background-strong)',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                            Description *
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description for cards and previews"
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                              background: 'var(--input-background)',
                              border: '1px solid var(--neutral-alpha-weak)',
                              borderRadius: '8px',
                              color: 'var(--neutral-on-background-strong)',
                              outline: 'none',
                              resize: 'vertical',
                              fontFamily: 'inherit'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                            Tags
                          </label>
                          <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="react, nextjs, design (comma-separated)"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                              background: 'var(--input-background)',
                              border: '1px solid var(--neutral-alpha-weak)',
                              borderRadius: '8px',
                              color: 'var(--neutral-on-background-strong)',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Media Section */}
                  <div>
                    <SectionHeader title="Media & Assets" section="media" />
                    {expandedSections.media && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Main Image */}
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '8px' }}>
                            Main Image
                          </label>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => setImageInputMode('upload')}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                background: imageInputMode === 'upload' ? 'var(--brand-alpha-weak)' : 'transparent',
                                color: imageInputMode === 'upload' ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-medium)',
                                border: '1px solid var(--neutral-alpha-weak)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Upload size={14} /> Upload
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageInputMode('url')}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                background: imageInputMode === 'url' ? 'var(--brand-alpha-weak)' : 'transparent',
                                color: imageInputMode === 'url' ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-medium)',
                                border: '1px solid var(--neutral-alpha-weak)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <LinkIcon size={14} /> URL
                            </button>
                          </div>

                          {imageInputMode === 'upload' ? (
                            <label style={{
                              display: 'block',
                              width: '100%',
                              padding: '24px',
                              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                              background: 'var(--input-background)',
                              border: '2px dashed var(--neutral-alpha-weak)',
                              borderRadius: '8px',
                              color: 'var(--neutral-on-background-medium)',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}>
                              {uploading ? 'Uploading...' : formData.image ? 'Click to change image' : 'Click or drag to upload'}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleMainImageUpload}
                                disabled={uploading || !formData.slug}
                                style={{ display: 'none' }}
                              />
                            </label>
                          ) : (
                            <input
                              type="text"
                              value={formData.image}
                              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                                background: 'var(--input-background)',
                                border: '1px solid var(--neutral-alpha-weak)',
                                borderRadius: '8px',
                                color: 'var(--neutral-on-background-strong)',
                                outline: 'none'
                              }}
                            />
                          )}

                          {formData.image && (
                            <div style={{ marginTop: '12px' }}>
                              <img 
                                src={formData.image} 
                                alt="Preview" 
                                style={{ 
                                  width: '100%', 
                                  height: 'clamp(150px, 20vw, 200px)', 
                                  objectFit: 'cover', 
                                  borderRadius: '8px',
                                  border: '1px solid var(--neutral-alpha-weak)'
                                }} 
                              />
                            </div>
                          )}
                        </div>

                        {/* Additional Images for Projects */}
                        {activeTab === 'projects' && (
                          <>
                            <div>
                              <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '8px' }}>
                                Gallery Images
                              </label>
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() => setAdditionalImagesMode('upload')}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    background: additionalImagesMode === 'upload' ? 'var(--brand-alpha-weak)' : 'transparent',
                                    color: additionalImagesMode === 'upload' ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-medium)',
                                    border: '1px solid var(--neutral-alpha-weak)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Upload size={14} /> Upload
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAdditionalImagesMode('url')}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    background: additionalImagesMode === 'url' ? 'var(--brand-alpha-weak)' : 'transparent',
                                    color: additionalImagesMode === 'url' ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-medium)',
                                    border: '1px solid var(--neutral-alpha-weak)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <LinkIcon size={14} /> URL
                                </button>
                              </div>

                              {additionalImagesMode === 'upload' ? (
                                <label style={{
                                  display: 'block',
                                  width: '100%',
                                  padding: '24px',
                                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                                  background: 'var(--input-background)',
                                  border: '2px dashed var(--neutral-alpha-weak)',
                                  borderRadius: '8px',
                                  color: 'var(--neutral-on-background-medium)',
                                  textAlign: 'center',
                                  cursor: 'pointer'
                                }}>
                                  {uploading ? 'Uploading...' : 'Upload gallery images (multiple)'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAdditionalImagesUpload}
                                    disabled={uploading || !formData.slug}
                                    style={{ display: 'none' }}
                                  />
                                </label>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="https://img1.jpg, https://img2.jpg"
                                  onBlur={(e) => {
                                    const urls = e.target.value.split(',').map(u => u.trim()).filter(Boolean);
                                    setFormData({ ...formData, images: [...formData.images, ...urls] });
                                    e.target.value = '';
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                                    background: 'var(--input-background)',
                                    border: '1px solid var(--neutral-alpha-weak)',
                                    borderRadius: '8px',
                                    color: 'var(--neutral-on-background-strong)',
                                    outline: 'none'
                                  }}
                                />
                              )}

                              {formData.images.length > 0 && (
                                <div style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                                  gap: '12px', 
                                  marginTop: '12px' 
                                }}>
                                  {formData.images.map((img, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                      <img 
                                        src={img} 
                                        alt={`Gallery ${index + 1}`} 
                                        style={{ 
                                          width: '100%', 
                                          height: 'clamp(80px, 10vw, 100px)', 
                                          objectFit: 'cover', 
                                          borderRadius: '6px',
                                          border: '1px solid var(--neutral-alpha-weak)'
                                        }} 
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeAdditionalImage(index)}
                                        style={{
                                          position: 'absolute',
                                          top: '4px',
                                          right: '4px',
                                          background: 'var(--accent-background-strong)',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '50%',
                                          width: '24px',
                                          height: '24px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          padding: 0,
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                        }}
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                                Project Link
                              </label>
                              <input
                                type="text"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="https://project-demo.com"
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                                  background: 'var(--input-background)',
                                  border: '1px solid var(--neutral-alpha-weak)',
                                  borderRadius: '8px',
                                  color: 'var(--neutral-on-background-strong)',
                                  outline: 'none'
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                                Team Avatars (URLs, comma-separated)
                              </label>
                              <input
                                type="text"
                                value={formData.avatars}
                                onChange={(e) => setFormData({ ...formData, avatars: e.target.value })}
                                placeholder="https://avatar1.jpg, https://avatar2.jpg"
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                                  background: 'var(--input-background)',
                                  border: '1px solid var(--neutral-alpha-weak)',
                                  borderRadius: '8px',
                                  color: 'var(--neutral-on-background-strong)',
                                  outline: 'none'
                                }}
                              />
                            </div>
                          </>
                        )}

                        {activeTab === 'blogs' && (
                          <>
                            <div>
                              <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                                Author Name
                              </label>
                              <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                placeholder="John Doe"
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                                  background: 'var(--input-background)',
                                  border: '1px solid var(--neutral-alpha-weak)',
                                  borderRadius: '8px',
                                  color: 'var(--neutral-on-background-strong)',
                                  outline: 'none'
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                                Category Tag
                              </label>
                              <input
                                type="text"
                                value={formData.tag}
                                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                placeholder="Tutorial"
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                                  background: 'var(--input-background)',
                                  border: '1px solid var(--neutral-alpha-weak)',
                                  borderRadius: '8px',
                                  color: 'var(--neutral-on-background-strong)',
                                  outline: 'none'
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div>
                    <SectionHeader title="Content" section="content" />
                    {expandedSections.content && (
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                          Main Content (Markdown) *
                        </label>
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="Write your content in Markdown format..."
                          rows={12}
                          style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                            background: 'var(--input-background)',
                            border: '1px solid var(--neutral-alpha-weak)',
                            borderRadius: '8px',
                            color: 'var(--neutral-on-background-strong)',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'monospace',
                            lineHeight: '1.6'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Metadata Section */}
                  <div>
                    <SectionHeader title="Metadata & Publishing" section="metadata" />
                    {expandedSections.metadata && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                              Published Date
                            </label>
                            <input
                              type="date"
                              value={formData.publishedAt}
                              onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                                background: 'var(--input-background)',
                                border: '1px solid var(--neutral-alpha-weak)',
                                borderRadius: '8px',
                                color: 'var(--neutral-on-background-strong)',
                                outline: 'none'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                              Read Time
                            </label>
                            <input
                              type="text"
                              value={formData.readTime}
                              onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                              placeholder="5 min read"
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                                background: 'var(--input-background)',
                                border: '1px solid var(--neutral-alpha-weak)',
                                borderRadius: '8px',
                                color: 'var(--neutral-on-background-strong)',
                                outline: 'none'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          padding: '16px',
                          background: 'var(--neutral-alpha-weak)',
                          borderRadius: '8px'
                        }}>
                          <input
                            type="checkbox"
                            id="featured"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: 'var(--brand-background-strong)'
                            }}
                          />
                          <label htmlFor="featured" style={{
                            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                            color: 'var(--neutral-on-background-strong)',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}>
                            Mark as Featured
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SEO Section */}
                  <div>
                    <SectionHeader title="SEO & Social" section="seo" />
                    {expandedSections.seo && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                            Meta Title
                          </label>
                          <input
                            type="text"
                            value={formData.metaTitle}
                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                            placeholder="SEO optimized title (60 chars)"
                            maxLength={60}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                              background: 'var(--input-background)',
                              border: '1px solid var(--neutral-alpha-weak)',
                              borderRadius: '8px',
                              color: 'var(--neutral-on-background-strong)',
                              outline: 'none'
                            }}
                          />
                          <div style={{ fontSize: '12px', color: 'var(--neutral-on-background-weak)', marginTop: '4px' }}>
                            {formData.metaTitle.length}/60 characters
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                            Meta Description
                          </label>
                          <textarea
                            value={formData.metaDescription}
                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                            placeholder="Brief description for search engines (160 chars)"
                            maxLength={160}
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                              background: 'var(--input-background)',
                              border: '1px solid var(--neutral-alpha-weak)',
                              borderRadius: '8px',
                              color: 'var(--neutral-on-background-strong)',
                              outline: 'none',
                              resize: 'vertical',
                              fontFamily: 'inherit'
                            }}
                          />
                          <div style={{ fontSize: '12px', color: 'var(--neutral-on-background-weak)', marginTop: '4px' }}>
                            {formData.metaDescription.length}/160 characters
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', color: 'var(--neutral-on-background-medium)', marginBottom: '6px' }}>
                            OG Image URL
                          </label>
                          <input
                            type="text"
                            value={formData.ogImage}
                            onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                            placeholder="https://example.com/og-image.jpg"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                              background: 'var(--input-background)',
                              border: '1px solid var(--neutral-alpha-weak)',
                              borderRadius: '8px',
                              color: 'var(--neutral-on-background-strong)',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid var(--neutral-alpha-weak)',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{
                        flex: '1',
                        minWidth: '150px',
                        padding: '16px 32px',
                        fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                        fontWeight: 600,
                        background: loading ? 'var(--neutral-alpha-weak)' : 'linear-gradient(135deg, var(--brand-background-strong), var(--accent-background-strong))',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        transition: 'all 0.3s ease',
                        boxShadow: loading ? 'none' : '0 4px 16px var(--brand-alpha-weak)'
                      }}
                    >
                      {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        style={{
                          padding: '16px 32px',
                          fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                          fontWeight: 600,
                          background: 'transparent',
                          color: 'var(--neutral-on-background-medium)',
                          border: '2px solid var(--neutral-alpha-weak)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Items List Section */}
            <div style={{
              background: 'var(--surface-background)',
              border: '1px solid var(--neutral-alpha-weak)',
              borderRadius: '16px',
              padding: 'clamp(1.5rem, 3vw, 2rem)',
              boxShadow: '0 8px 32px var(--neutral-alpha-weak)',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              <h2 style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: 700,
                marginBottom: '24px'
              }}>
                {activeTab === 'projects' ? 'Projects' : 'Blog Posts'}
              </h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--neutral-on-background-weak)' }}>
                  Loading...
                </div>
              ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', marginBottom: '16px', opacity: 0.3 }}>📝</div>
                  <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                    color: 'var(--neutral-on-background-weak)'
                  }}>
                    No items yet. Create your first one!
                  </p>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  overflowY: 'auto',
                  paddingRight: '8px'
                }}>
                  {items.map((item) => (
                    <div 
                      key={item.slug} 
                      style={{
                        border: '1px solid var(--neutral-alpha-weak)',
                        borderRadius: '12px',
                        padding: 'clamp(1rem, 2vw, 1.25rem)',
                        transition: 'all 0.2s ease',
                        background: 'var(--input-background)'
                      }}
                    >
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: 'clamp(100px, 15vw, 120px)',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            border: '1px solid var(--neutral-alpha-weak)'
                          }}
                        />
                      )}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'start',
                        marginBottom: '8px',
                        gap: '8px'
                      }}>
                        <h3 style={{
                          fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                          fontWeight: 600,
                          flex: 1
                        }}>
                          {item.title}
                        </h3>
                        {item.featured && (
                          <span style={{
                            padding: '4px 12px',
                            fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                            background: 'linear-gradient(135deg, var(--accent-alpha-weak), var(--brand-alpha-weak))',
                            color: 'var(--accent-on-background-strong)',
                            borderRadius: '9999px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }}>
                            Featured
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontSize: 'clamp(0.875rem, 1.5vw, 0.875rem)',
                        color: 'var(--neutral-on-background-weak)',
                        marginBottom: '12px'
                      }}>
                        {item.description.length > 120 ? item.description.substring(0, 120) + '...' : item.description}
                      </p>
                      {item.tags && item.tags.length > 0 && (
                        <div style={{ 
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap',
                          marginBottom: '12px'
                        }}>
                          {item.tags.slice(0, 3).map((tag) => (
                            <span 
                              key={tag}
                              style={{
                                padding: '4px 10px',
                                fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                                background: 'var(--neutral-alpha-weak)',
                                color: 'var(--neutral-on-background-medium)',
                                borderRadius: '4px',
                                fontWeight: 500
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span style={{
                              padding: '4px 10px',
                              fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                              color: 'var(--neutral-on-background-weak)'
                            }}>
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      <div style={{ 
                        display: 'flex', 
                        gap: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--neutral-alpha-weak)',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          style={{
                            padding: '8px 16px',
                            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                            fontWeight: 600,
                            background: 'var(--brand-alpha-weak)',
                            border: '1px solid var(--brand-alpha-weak)',
                            borderRadius: '6px',
                            color: 'var(--brand-on-background-strong)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id || item.slug)}
                          style={{
                            padding: '8px 16px',
                            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                            fontWeight: 600,
                            background: 'transparent',
                            border: '1px solid var(--accent-alpha-weak)',
                            borderRadius: '6px',
                            color: 'var(--accent-on-background-strong)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}