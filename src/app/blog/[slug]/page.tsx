import { notFound } from 'next/navigation';
import { Column, Heading, Text, Row } from '@once-ui-system/core';
import ReactMarkdown from 'react-markdown';

async function getBlogPost(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blog/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return null;
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <Column maxWidth="m" gap="xl" paddingY="12">
      <Column gap="m">
        <Heading variant="display-strong-l">{post.title}</Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {post.description}
        </Text>
        <Row gap="12">
          {post.author && (
            <Text variant="label-default-s" onBackground="neutral-medium">
              By {post.author}
            </Text>
          )}
          {post.metadata?.readTime && (
            <Text variant="label-default-s" onBackground="neutral-medium">
              {post.metadata.readTime}
            </Text>
          )}
          {post.publishedAt && (
            <Text variant="label-default-s" onBackground="neutral-medium">
              {new Date(post.publishedAt).toLocaleDateString()}
            </Text>
          )}
        </Row>
        {post.tags && (
          <Row gap="8">
            {post.tags.map((tag: string) => (
              <Text key={tag} variant="label-default-s" onBackground="neutral-medium">
                #{tag}
              </Text>
            ))}
          </Row>
        )}
      </Column>
      
      {post.image && (
        <img src={post.image} alt={post.title} style={{ width: '100%' }} />
      )}
      
      <Column gap="m" className="markdown-content">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </Column>
    </Column>
  );
}