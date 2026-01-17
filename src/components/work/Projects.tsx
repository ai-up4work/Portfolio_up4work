'use client';

import { useEffect, useState } from 'react';
import { Column } from '@once-ui-system/core';
import { ProjectCard } from '@/components';
import { IProject } from '@/lib/models';

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

// Skeleton loader component
function ProjectCardSkeleton() {
  return (
    <div className="w-full rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-64 bg-gray-200 dark:bg-gray-800" />
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

export function Projects({ range, exclude }: ProjectsProps) {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback images from your own domain
  const fallbackImages = [
    '/images/placeholder-project-1.jpg',
    '/images/placeholder-project-2.jpg',
    '/images/placeholder-project-3.jpg'
  ];

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects?featured=true');
        const result = await response.json();

        if (result.success) {
          let filtered = result.data;

          // Exclude by slug (exact match)
          if (exclude && exclude.length > 0) {
            filtered = filtered.filter((project: IProject) => 
              !exclude.includes(project.slug)
            );
          }

          // Sort by publication date
          const sorted = filtered.sort((a: IProject, b: IProject) => {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          });

          // Apply range filter
          const displayed = range
            ? sorted.slice(range[0] - 1, range[1] ?? sorted.length)
            : sorted;

          setProjects(displayed);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [range, exclude]);

  if (loading) {
    return (
      <Column fillWidth gap="l">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </Column>
    );
  }

  if (projects.length === 0) {
    return (
      <Column fillWidth gap="m" paddingY="l" horizontal="center">  
        <p className="text-gray-500 dark:text-gray-400">
          No projects found
        </p>
      </Column>
    );
  }

  return (
    <Column fillWidth gap="l">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug || index}
          href={`/projects/${project.slug}`}
          images={
            project.images && project.images.length > 0
              ? project.images
              : project.image
              ? [project.image]
              : fallbackImages
          }
          title={project.title}
          description={project.description}
          content={project.content || ''}
          avatars={[{ src: '/images/logo.png' }]}
          link={project.link || ''}
        />
      ))}
    </Column>
  );
}