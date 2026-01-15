'use client';

import React, { useState, useEffect } from 'react';

interface ItemData {
  slug: string;
  title: string;
  description: string;
  image?: string;
  content: string;
  tags?: string[];
  featured: boolean;
  order: number;
}

interface FormData {
  slug: string;
  title: string;
  description: string;
  image: string;
  content: string;
  tags: string;
  featured: boolean;
  order: number;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'projects' | 'blog'>('projects');
  const [items, setItems] = useState<ItemData[]>([]);
  const [formData, setFormData] = useState<FormData>({
    slug: '',
    title: '',
    description: '',
    image: '',
    content: '',
    tags: '',
    featured: false,
    order: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'projects' ? '/api/projects' : '/api/blog';
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

  const handleSubmit = async () => {
    setLoading(true);

    const endpoint = activeTab === 'projects' ? '/api/projects' : '/api/blog';
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

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
      content: item.content,
      tags: item.tags?.join(', ') || '',
      featured: item.featured,
      order: item.order
    });
    setEditingId(item.slug);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const endpoint = activeTab === 'projects' ? '/api/projects' : '/api/blog';
    
    try {
      const response = await fetch(`${endpoint}/${slug}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Deleted successfully!');
        fetchItems();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Error: ' + errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      description: '',
      image: '',
      content: '',
      tags: '',
      featured: false,
      order: 0
    });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen" style={{ 
      color: 'var(--neutral-on-background-strong)'
    }}>
      <div style={{ 
        maxWidth: '80rem',
        margin: '0 auto',
        padding: 'var(--static-space-64) var(--static-space-24)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--static-space-48)' }}>
          <h1 style={{
            fontSize: 'var(--font-size-display-l)',
            fontWeight: 600,
            lineHeight: 'var(--font-line-height-display-l)',
            letterSpacing: 'var(--font-letter-spacing-display-l)',
            marginBottom: 'var(--static-space-8)'
          }}>
            Content Management
          </h1>
          <p style={{
            fontSize: 'var(--font-size-body-l)',
            lineHeight: 'var(--font-line-height-body-l)',
            color: 'var(--neutral-on-background-weak)'
          }}>
            Manage your portfolio projects and blog posts
          </p>
        </div>
        
        {/* Tabs */}
        <div style={{ 
          display: 'flex',
          gap: 'var(--static-space-8)',
          marginBottom: 'var(--static-space-48)',
          borderBottom: '1px solid var(--neutral-alpha-weak)',
          paddingBottom: '0'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('projects'); resetForm(); }}
            style={{
              padding: 'var(--static-space-12) var(--static-space-16)',
              fontSize: 'var(--font-size-label-m)',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'projects' ? '2px solid var(--brand-on-background-strong)' : '2px solid transparent',
              color: activeTab === 'projects' ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-medium)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-1px'
            }}
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('blog'); resetForm(); }}
            style={{
              padding: 'var(--static-space-12) var(--static-space-16)',
              fontSize: 'var(--font-size-label-m)',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'blog' ? '2px solid var(--brand-on-background-strong)' : '2px solid transparent',
              color: activeTab === 'blog' ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-medium)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-1px'
            }}
          >
            Blog Posts
          </button>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 32rem), 1fr))',
          gap: 'var(--static-space-32)'
        }}>
          {/* Form Section */}
          <div style={{
            background: 'var(--surface-background)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--neutral-alpha-weak)',
            borderRadius: 'var(--radius-l)',
            padding: 'var(--static-space-32)'
          }}>
            <h2 style={{
              fontSize: 'var(--font-size-heading-l)',
              fontWeight: 600,
              lineHeight: 'var(--font-line-height-heading-l)',
              marginBottom: 'var(--static-space-24)'
            }}>
              {editingId ? 'Edit' : 'Create New'} {activeTab === 'projects' ? 'Project' : 'Post'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--static-space-20)' }}>
              <div>
                <label htmlFor="slug" style={{
                  display: 'block',
                  fontSize: 'var(--font-size-label-s)',
                  fontWeight: 500,
                  marginBottom: 'var(--static-space-8)',
                  color: 'var(--neutral-on-background-medium)'
                }}>
                  Slug (URL-friendly)
                </label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--static-space-12) var(--static-space-16)',
                    fontSize: 'var(--font-size-body-m)',
                    background: 'var(--input-background)',
                    border: '1px solid var(--neutral-alpha-weak)',
                    borderRadius: 'var(--radius-m)',
                    color: 'var(--neutral-on-background-strong)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  placeholder="my-awesome-project"
                  disabled={!!editingId}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand-alpha-medium)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-alpha-weak)'}
                />
              </div>

              <div>
                <label htmlFor="title" style={{
                  display: 'block',
                  fontSize: 'var(--font-size-label-s)',
                  fontWeight: 500,
                  marginBottom: 'var(--static-space-8)',
                  color: 'var(--neutral-on-background-medium)'
                }}>
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--static-space-12) var(--static-space-16)',
                    fontSize: 'var(--font-size-body-m)',
                    background: 'var(--input-background)',
                    border: '1px solid var(--neutral-alpha-weak)',
                    borderRadius: 'var(--radius-m)',
                    color: 'var(--neutral-on-background-strong)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  placeholder="My Awesome Project"
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand-alpha-medium)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-alpha-weak)'}
                />
              </div>

              <div>
                <label htmlFor="description" style={{
                  display: 'block',
                  fontSize: 'var(--font-size-label-s)',
                  fontWeight: 500,
                  marginBottom: 'var(--static-space-8)',
                  color: 'var(--neutral-on-background-medium)'
                }}>
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--static-space-12) var(--static-space-16)',
                    fontSize: 'var(--font-size-body-m)',
                    background: 'var(--input-background)',
                    border: '1px solid var(--neutral-alpha-weak)',
                    borderRadius: 'var(--radius-m)',
                    color: 'var(--neutral-on-background-strong)',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '5rem',
                    fontFamily: 'var(--font-body)',
                    transition: 'border-color 0.2s ease'
                  }}
                  rows={3}
                  placeholder="A brief description..."
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand-alpha-medium)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-alpha-weak)'}
                />
              </div>

              <div>
                <label htmlFor="image" style={{
                  display: 'block',
                  fontSize: 'var(--font-size-label-s)',
                  fontWeight: 500,
                  marginBottom: 'var(--static-space-8)',
                  color: 'var(--neutral-on-background-medium)'
                }}>
                  Image URL
                </label>
                <input
                  id="image"
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--static-space-12) var(--static-space-16)',
                    fontSize: 'var(--font-size-body-m)',
                    background: 'var(--input-background)',
                    border: '1px solid var(--neutral-alpha-weak)',
                    borderRadius: 'var(--radius-m)',
                    color: 'var(--neutral-on-background-strong)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  placeholder="/images/project.jpg"
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand-alpha-medium)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-alpha-weak)'}
                />
              </div>

              <div>
                <label htmlFor="tags" style={{
                  display: 'block',
                  fontSize: 'var(--font-size-label-s)',
                  fontWeight: 500,
                  marginBottom: 'var(--static-space-8)',
                  color: 'var(--neutral-on-background-medium)'
                }}>
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--static-space-12) var(--static-space-16)',
                    fontSize: 'var(--font-size-body-m)',
                    background: 'var(--input-background)',
                    border: '1px solid var(--neutral-alpha-weak)',
                    borderRadius: 'var(--radius-m)',
                    color: 'var(--neutral-on-background-strong)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  placeholder="react, nextjs, design"
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand-alpha-medium)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-alpha-weak)'}
                />
              </div>

              <div>
                <label htmlFor="content" style={{
                  display: 'block',
                  fontSize: 'var(--font-size-label-s)',
                  fontWeight: 500,
                  marginBottom: 'var(--static-space-8)',
                  color: 'var(--neutral-on-background-medium)'
                }}>
                  Content (Markdown)
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--static-space-12) var(--static-space-16)',
                    fontSize: 'var(--font-size-body-s)',
                    background: 'var(--input-background)',
                    border: '1px solid var(--neutral-alpha-weak)',
                    borderRadius: 'var(--radius-m)',
                    color: 'var(--neutral-on-background-strong)',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '12rem',
                    fontFamily: 'var(--font-code)',
                    transition: 'border-color 0.2s ease'
                  }}
                  rows={10}
                  placeholder="# Heading&#10;&#10;Your markdown content here..."
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand-alpha-medium)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-alpha-weak)'}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--static-space-16)', alignItems: 'end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--static-space-8)' }}>
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    style={{
                      width: '1.125rem',
                      height: '1.125rem',
                      cursor: 'pointer',
                      accentColor: 'var(--brand-background-strong)'
                    }}
                  />
                  <label htmlFor="featured" style={{
                    fontSize: 'var(--font-size-label-s)',
                    color: 'var(--neutral-on-background-medium)',
                    cursor: 'pointer'
                  }}>
                    Featured
                  </label>
                </div>

                <div style={{ flex: 1 }}>
                  <label htmlFor="order" style={{
                    display: 'block',
                    fontSize: 'var(--font-size-label-s)',
                    fontWeight: 500,
                    marginBottom: 'var(--static-space-8)',
                    color: 'var(--neutral-on-background-medium)'
                  }}>
                    Order
                  </label>
                  <input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: 'var(--static-space-12) var(--static-space-16)',
                      fontSize: 'var(--font-size-body-m)',
                      background: 'var(--input-background)',
                      border: '1px solid var(--neutral-alpha-weak)',
                      borderRadius: 'var(--radius-m)',
                      color: 'var(--neutral-on-background-strong)',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--brand-alpha-medium)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--neutral-alpha-weak)'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--static-space-12)', marginTop: 'var(--static-space-8)' }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: 'var(--static-space-12) var(--static-space-24)',
                    fontSize: 'var(--font-size-label-m)',
                    fontWeight: 500,
                    background: loading ? 'var(--neutral-alpha-weak)' : 'var(--brand-background-strong)',
                    color: 'var(--brand-on-background-strong)',
                    border: 'none',
                    borderRadius: 'var(--radius-m)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.opacity = '1';
                  }}
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: 'var(--static-space-12) var(--static-space-24)',
                      fontSize: 'var(--font-size-label-m)',
                      fontWeight: 500,
                      background: 'transparent',
                      color: 'var(--neutral-on-background-medium)',
                      border: '1px solid var(--neutral-alpha-weak)',
                      borderRadius: 'var(--radius-m)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--neutral-alpha-weak)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* List Section */}
          <div style={{
            background: 'var(--surface-background)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--neutral-alpha-weak)',
            borderRadius: 'var(--radius-l)',
            padding: 'var(--static-space-32)'
          }}>
            <h2 style={{
              fontSize: 'var(--font-size-heading-l)',
              fontWeight: 600,
              lineHeight: 'var(--font-line-height-heading-l)',
              marginBottom: 'var(--static-space-24)'
            }}>
              Existing {activeTab === 'projects' ? 'Projects' : 'Posts'}
            </h2>
            
            {loading ? (
              <p style={{
                fontSize: 'var(--font-size-body-m)',
                color: 'var(--neutral-on-background-weak)'
              }}>
                Loading...
              </p>
            ) : items.length === 0 ? (
              <p style={{
                fontSize: 'var(--font-size-body-m)',
                color: 'var(--neutral-on-background-weak)'
              }}>
                No items yet. Create your first one!
              </p>
            ) : (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--static-space-16)',
                maxHeight: '40rem',
                overflowY: 'auto'
              }}>
                {items.map((item) => (
                  <div 
                    key={item.slug} 
                    style={{
                      border: '1px solid var(--neutral-alpha-weak)',
                      borderRadius: 'var(--radius-m)',
                      padding: 'var(--static-space-20)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--neutral-alpha-medium)';
                      e.currentTarget.style.background = 'var(--neutral-alpha-weak)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--neutral-alpha-weak)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'start',
                      marginBottom: 'var(--static-space-8)'
                    }}>
                      <h3 style={{
                        fontSize: 'var(--font-size-heading-s)',
                        fontWeight: 600,
                        lineHeight: 'var(--font-line-height-heading-s)'
                      }}>
                        {item.title}
                      </h3>
                      {item.featured && (
                        <span style={{
                          padding: 'var(--static-space-4) var(--static-space-8)',
                          fontSize: 'var(--font-size-label-xs)',
                          background: 'var(--accent-alpha-weak)',
                          color: 'var(--accent-on-background-strong)',
                          borderRadius: 'var(--radius-s)',
                          fontWeight: 500
                        }}>
                          Featured
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: 'var(--font-size-body-s)',
                      lineHeight: 'var(--font-line-height-body-s)',
                      color: 'var(--neutral-on-background-weak)',
                      marginBottom: 'var(--static-space-12)'
                    }}>
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div style={{ 
                        display: 'flex',
                        gap: 'var(--static-space-8)',
                        flexWrap: 'wrap',
                        marginBottom: 'var(--static-space-12)'
                      }}>
                        {item.tags.map((tag) => (
                          <span 
                            key={tag}
                            style={{
                              padding: 'var(--static-space-4) var(--static-space-8)',
                              fontSize: 'var(--font-size-label-xs)',
                              background: 'var(--neutral-alpha-weak)',
                              color: 'var(--neutral-on-background-medium)',
                              borderRadius: 'var(--radius-s)'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 'var(--static-space-16)' }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        style={{
                          padding: 0,
                          fontSize: 'var(--font-size-label-s)',
                          fontWeight: 500,
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--brand-on-background-strong)',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.slug)}
                        style={{
                          padding: 0,
                          fontSize: 'var(--font-size-label-s)',
                          fontWeight: 500,
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent-on-background-strong)',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
      </div>
    </div>
  );
}