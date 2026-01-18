'use client';

import React, { useState } from 'react';
import { FileText, Upload as UploadIcon, ImageIcon } from 'lucide-react';

interface MDContentUploadProps {
  formData: {
    slug: string;
    content: string;
    [key: string]: any; // This allows all other formData properties
  };
  setFormData: (data: any) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  activeTab: 'projects' | 'blogs';
}

export default function MDContentUpload({
  formData,
  setFormData,
  uploading,
  setUploading,
  activeTab
}: MDContentUploadProps) {
  const [contentInputMode, setContentInputMode] = useState<'manual' | 'md-upload'>('manual');
  const [mdFile, setMdFile] = useState<File | null>(null);
  const [mdImages, setMdImages] = useState<File[]>([]);

  const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload,
    });

    const result = await response.json();
    if (result.success) {
      return result.url;
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  };

  const extractImageReferences = (mdContent: string): string[] => {
    const imageRegex = /!\[.*?\]\((.*?)(?:\s+".*?")?\)/g;
    const matches = mdContent.matchAll(imageRegex);
    const imagePaths: string[] = [];
    
    for (const match of matches) {
      const imagePath = match[1].trim();
      if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
        imagePaths.push(imagePath);
      }
    }
    
    return imagePaths;
  };

  const handleMdContentUpload = async () => {
    if (!mdFile) {
      alert('Please select an MD file first');
      return;
    }

    if (!formData.slug) {
      alert('Please enter a slug first before uploading MD file');
      return;
    }

    setUploading(true);
    try {
      // Read MD file content
      const mdContent = await mdFile.text();
      
      // Extract image references from MD content
      const imageRefs = extractImageReferences(mdContent);
      
      // Create a map of original filename to uploaded URL
      const imageUrlMap: { [key: string]: string } = {};
      
      // Upload all images to Cloudinary
      const folder = activeTab === 'projects' 
        ? `Up4work-portfolio/Project_Images/${formData.slug}`
        : `Up4work-portfolio/Blog_Images/${formData.slug}`;
      
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
      let updatedContent = mdContent;
      imageRefs.forEach(ref => {
        if (imageUrlMap[ref]) {
          const escapedRef = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`!\\[([^\\]]*)\\]\\(${escapedRef}(?:\\s+"[^"]*")?\\)`, 'g');
          updatedContent = updatedContent.replace(regex, `![$1](${imageUrlMap[ref]})`);
        }
      });
      
      // Update only the content field
      // Update content field and ensure images array exists
      setFormData({ 
        ...formData, 
        content: updatedContent,
        images: formData.images || [] // Ensure images array exists
      });      
      
      // Switch to manual mode to show the processed content
      setContentInputMode('manual');
      
      alert(`MD file processed successfully! ${mdImages.length} image(s) uploaded to Cloudinary.`);
      setMdFile(null);
      setMdImages([]);
      
    } catch (error) {
      alert('Failed to process MD file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          color: 'var(--neutral-on-background-medium)'
        }}>
          Main Content (Markdown) *
        </label>
        
        {/* Toggle buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setContentInputMode('manual')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: contentInputMode === 'manual' ? 'var(--brand-alpha-weak)' : 'transparent',
              color: contentInputMode === 'manual' ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-medium)',
              border: '1px solid var(--neutral-alpha-weak)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ✏️ Manual
          </button>
          <button
            type="button"
            onClick={() => setContentInputMode('md-upload')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: contentInputMode === 'md-upload' ? 'var(--brand-alpha-weak)' : 'transparent',
              color: contentInputMode === 'md-upload' ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-medium)',
              border: '1px solid var(--neutral-alpha-weak)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600
            }}
          >
            <FileText size={14} /> MD Upload
          </button>
        </div>
      </div>

      {contentInputMode === 'md-upload' ? (
        // MD Upload Mode
        <div style={{
          background: 'var(--input-background)',
          border: '2px dashed var(--brand-alpha-weak)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', color: 'var(--brand-on-background-strong)' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
              Upload Markdown Content
            </h4>
            <p style={{ color: 'var(--neutral-on-background-weak)', fontSize: '13px' }}>
              Upload your .md file with images. Images will be uploaded to Cloudinary automatically.
            </p>
          </div>
          
          {/* MD File Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              width: '100%',
              padding: '16px 24px',
              background: mdFile 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'var(--brand-background-strong)',
              color: 'white',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: 'none',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <FileText size={20} />
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
                marginTop: '6px', 
                fontSize: '11px', 
                color: 'var(--brand-on-background-strong)',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                ✓ File selected successfully
              </p>
            )}
          </div>
          
          {/* Images Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              width: '100%',
              padding: '16px 24px',
              background: mdImages.length > 0
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'var(--accent-background-strong)',
              color: 'white',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: 'none',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <ImageIcon size={20} />
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
                marginTop: '6px', 
                fontSize: '11px', 
                color: 'var(--accent-on-background-strong)',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                ✓ {mdImages.length} image(s) ready to upload
              </p>
            )}
          </div>

          {/* Selected Images Preview */}
          {mdImages.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
              gap: '10px',
              marginBottom: '16px',
              padding: '12px',
              background: 'var(--surface-background)',
              borderRadius: '8px'
            }}>
              {mdImages.map((img, idx) => (
                <div key={idx} style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '2px solid var(--brand-alpha-weak)'
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
                    background: 'rgba(0,0,0,0.75)',
                    color: 'white',
                    padding: '3px',
                    fontSize: '9px',
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
            onClick={handleMdContentUpload}
            disabled={!mdFile || uploading || !formData.slug}
            style={{
              width: '100%',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 700,
              background: (!mdFile || uploading || !formData.slug)
                ? 'var(--neutral-alpha-weak)'
                : 'linear-gradient(135deg, var(--brand-background-strong), var(--accent-background-strong))',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: (!mdFile || uploading || !formData.slug) ? 'not-allowed' : 'pointer',
              opacity: (!mdFile || uploading || !formData.slug) ? 0.6 : 1,
              transition: 'all 0.3s ease',
              boxShadow: (!mdFile || uploading || !formData.slug) ? 'none' : '0 4px 12px var(--brand-alpha-weak)'
            }}
          >
            {uploading ? '⏳ Processing & Uploading...' : '🚀 Process MD File & Upload Images'}
          </button>
          
          {!formData.slug && (
            <p style={{
              marginTop: '12px',
              fontSize: '12px',
              color: 'var(--accent-on-background-strong)',
              textAlign: 'center',
              fontWeight: 600
            }}>
              ⚠️ Please enter a slug in Basic Information before uploading
            </p>
          )}
          
          <p style={{
            marginTop: '12px',
            fontSize: '11px',
            color: 'var(--neutral-on-background-weak)',
            textAlign: 'center'
          }}>
            💡 Tip: Image filenames in your MD must match the actual files you select
          </p>
        </div>
      ) : (
        // Manual Mode
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
      )}
    </div>
  );
}