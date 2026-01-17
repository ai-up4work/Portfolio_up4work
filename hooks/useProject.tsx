// src/hooks/useProject.ts
'use client';

import { useState, useEffect } from 'react';
import { IProject } from '@/lib/models';

interface UseProjectOptions {
  incrementViews?: boolean;
}

export function useProject(slug: string, options: UseProjectOptions = {}) {
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (options.incrementViews === false) {
          params.append('incrementViews', 'false');
        }
        
        const url = `/api/projects/${slug}${params.toString() ? `?${params}` : ''}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
          setProject(result.data);
        } else {
          setError(result.error || 'Failed to fetch project');
        }
      } catch (err) {
        setError('Failed to fetch project');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProject();
    }
  }, [slug, options.incrementViews]);

  const likeProject = async () => {
    try {
      const response = await fetch(`/api/projects/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'incrementLikes' })
      });
      
      const result = await response.json();
      
      if (result.success && project) {
        setProject({
          ...project,
          metadata: {
            ...project.metadata,
            likes: result.data.likes
          }
        });
      }
    } catch (err) {
      console.error('Failed to like project:', err);
    }
  };

  const updateProject = async (data: Partial<IProject>) => {
    try {
      const response = await fetch(`/api/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setProject(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to update project' };
    }
  };

  const deleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${slug}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to delete project' };
    }
  };

  return {
    project,
    loading,
    error,
    likeProject,
    updateProject,
    deleteProject
  };
}

// Usage example:
// 
// function ProjectPage({ slug }: { slug: string }) {
//   const { project, loading, error, likeProject } = useProject(slug);
//
//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//
//   return (
//     <div>
//       <h1>{project?.title}</h1>
//       <button onClick={likeProject}>
//         👍 {project?.metadata?.likes || 0}
//       </button>
//     </div>
//   );
// }