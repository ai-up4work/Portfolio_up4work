'use client';

import { useEffect, useState } from 'react';
import { Column, Flex, Text } from '@once-ui-system/core';
import { ProjectCard } from '@/components';
import { IProject } from '@/lib/models';

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

/* -----------------------------
   Skeleton Loader
------------------------------ */
function ProjectCardSkeleton() {
  return (
    <Column fillWidth gap="m">
      {/* Carousel skeleton */}
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />

      {/* Content skeleton */}
      <Flex
        fillWidth
        paddingX="s"
        paddingTop="12"
        paddingBottom="24"
        direction="column"
        gap="l"
      >
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
        </div>

        {/* Avatar skeleton */}
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 -ml-2 animate-pulse" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6 animate-pulse" />
        </div>

        {/* Links skeleton */}
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28 animate-pulse" />
        </div>
      </Flex>
    </Column>
  );
}

/* -----------------------------
   Error State
------------------------------ */
function ProjectsError({ onRetry }: { onRetry: () => void }) {
  return (
    <Column fillWidth gap="m" paddingY="l">
      <Flex
        direction="column"
        gap="m"
        paddingY="xl"
        style={{ alignItems: 'center' }}
      >
        <div className="text-6xl mb-4">⚠️</div>

        <Column gap="s" style={{ alignItems: 'center' }}>
          <Text variant="heading-strong-l" onBackground="neutral-strong">
            Failed to load projects
          </Text>
          <Text
            variant="body-default-s"
            onBackground="neutral-weak"
            align="center"
          >
            There was an error loading the projects. Please try again.
          </Text>
        </Column>

        <button
          onClick={onRetry}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Retry
        </button>
      </Flex>
    </Column>
  );
}

/* -----------------------------
   Empty State
------------------------------ */
function ProjectsEmpty() {
  return (
    <Column fillWidth gap="m" paddingY="l">
      <Flex
        direction="column"
        gap="m"
        paddingY="xl"
        style={{ alignItems: 'center' }}
      >
        <div className="text-6xl mb-4">📁</div>

        <Column gap="s" style={{ alignItems: 'center' }}>
          <Text variant="heading-strong-l" onBackground="neutral-strong">
            No projects found
          </Text>
          <Text
            variant="body-default-s"
            onBackground="neutral-weak"
            align="center"
          >
            Check back soon for new projects!
          </Text>
        </Column>
      </Flex>
    </Column>
  );
}

/* -----------------------------
   Main Component
------------------------------ */
export function Projects({ range, exclude }: ProjectsProps) {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fallbackImages = [
    '/images/placeholder-project-1.jpg',
    '/images/placeholder-project-2.jpg',
    '/images/placeholder-project-3.jpg',
  ];

  const fetchProjects = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch('/api/projects?featured=true');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        let filtered = result.data;

        if (exclude?.length) {
          filtered = filtered.filter(
            (project: IProject) => !exclude.includes(project.slug)
          );
        }

        const sorted = filtered.sort((a: IProject, b: IProject) => {
          const dateA = a.publishedAt
            ? new Date(a.publishedAt).getTime()
            : 0;
          const dateB = b.publishedAt
            ? new Date(b.publishedAt).getTime()
            : 0;
          return dateB - dateA;
        });

        const displayed = range
          ? sorted.slice(range[0] - 1, range[1] ?? sorted.length)
          : sorted;

        setProjects(displayed);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, exclude]);

  /* -----------------------------
     Render States
  ------------------------------ */
  if (loading) {
    return (
      <Column fillWidth gap="l">
        {Array.from({
          length: range
            ? Math.min(3, (range[1] ?? 3) - range[0] + 1)
            : 3,
        }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </Column>
    );
  }

  if (error) {
    return <ProjectsError onRetry={fetchProjects} />;
  }

  if (projects.length === 0) {
    return <ProjectsEmpty />;
  }

  return (
    <Column fillWidth gap="l">
      {projects.map((project, index) => {
        const projectImages =
          project.images?.length
            ? project.images
            : project.image
            ? [project.image]
            : fallbackImages;

        const projectAvatars =
          project.avatars?.length
            ? project.avatars
            : [{ src: '/images/logo.png' }];

        return (
          <ProjectCard
            key={project.slug || `project-${index}`}
            href={`/projects/${project.slug}`}
            images={projectImages}
            priority={index === 0}
            title={project.title}
            description={project.description}
            content={project.content || ''}
            avatars={projectAvatars}
            link={project.link || ''}
          />
        );
      })}
    </Column>
  );
}
