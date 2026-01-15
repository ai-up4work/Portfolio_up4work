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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Content Management</h1>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            type="button"
            onClick={() => { setActiveTab('projects'); resetForm(); }}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'projects'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('blog'); resetForm(); }}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'blog'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Blog Posts
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingId ? 'Edit' : 'Create New'} {activeTab === 'projects' ? 'Project' : 'Post'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL-friendly)
                </label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="my-awesome-project"
                  disabled={!!editingId}
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Project"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="A brief description..."
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  id="image"
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/images/project.jpg"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="react, nextjs, design"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content (Markdown)
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={10}
                  placeholder="# Heading&#10;&#10;Your markdown content here..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured
                  </label>
                </div>

                <div className="flex-1">
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Existing {activeTab === 'projects' ? 'Projects' : 'Posts'}
            </h2>
            
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-gray-500">No items yet. Create your first one!</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.slug} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                      {item.featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {item.tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.slug)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
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