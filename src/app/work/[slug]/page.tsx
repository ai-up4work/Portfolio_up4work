import { notFound } from 'next/navigation';
import { Column, Heading, Row, Text } from '@once-ui-system/core';
import ReactMarkdown from 'react-markdown';

async function getProject(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/projects/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return null;
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <Column maxWidth="m" gap="xl" paddingY="12">
      <Column gap="m">
        <Heading variant="display-strong-l">{project.title}</Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {project.description}
        </Text>
        {project.tags && (
          <Row gap="8">
            {project.tags.map((tag: string) => (
              <Text key={tag} variant="label-default-s" onBackground="neutral-medium">
                #{tag}
              </Text>
            ))}
          </Row>
        )}
      </Column>
      
      {project.image && (
        <img src={project.image} alt={project.title} style={{ width: '100%' }} />
      )}
      
      <Column gap="m" className="markdown-content">
        <ReactMarkdown>{project.content}</ReactMarkdown>
      </Column>
    </Column>
  );
}