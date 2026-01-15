'use client';

import { useEffect, useState } from 'react';
import { Column, Row, Heading, Text } from '@once-ui-system/core';
import { IProject } from '@/lib/models';

interface ProjectsProps {
  range?: [number, number?];
  columns?: string;
}

export function Projects({ range, columns = '1' }: ProjectsProps) {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects?featured=true');
        const result = await response.json();
        
        if (result.success) {
          let filtered = result.data;
          
          if (range) {
            const [start, end] = range;
            filtered = filtered.slice(start - 1, end || start);
          }
          
          setProjects(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [range]);

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <Column fillWidth gap="l">
      {projects.map((project) => (
        <Row key={project.slug} fillWidth gap="m">
          <Column flex={1}>
            <Heading as="h3" variant="heading-strong-l">
              {project.title}
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {project.description}
            </Text>
            {project.tags && (
              <Row gap="8" marginTop="8">
                {project.tags.map((tag) => (
                  <Text key={tag} variant="label-default-s" onBackground="neutral-medium">
                    #{tag}
                  </Text>
                ))}
              </Row>
            )}
          </Column>
        </Row>
      ))}
    </Column>
  );
}