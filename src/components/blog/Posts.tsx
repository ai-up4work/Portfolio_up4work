'use client';

import { useEffect, useState } from 'react';
import { Column, Row, Heading, Text } from '@once-ui-system/core';
import { IBlogPost } from '@/lib/models';

interface PostsProps {
  range?: [number, number?];
  columns?: string;
  thumbnail?: boolean;
  direction?: 'row' | 'column';
}

export function Posts({ range, columns = '1', thumbnail = false, direction = 'row' }: PostsProps) {
  const [posts, setPosts] = useState<IBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog?featured=true');
        const result = await response.json();
        
        if (result.success) {
          let filtered = result.data;
          
          if (range) {
            const [start, end] = range;
            filtered = filtered.slice(start - 1, end || start);
          }
          
          setPosts(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [range]);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <Column fillWidth gap="l">
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--static-space-24)'
      }}>
        {posts.map((post) => (
          <Column 
            key={post.slug} 
            fillWidth 
            gap="m"
            style={{
              flexDirection: direction
            }}
          >
            {thumbnail && post.image && (
              <img 
                src={post.image} 
                alt={post.title} 
                style={{ 
                  width: '100%', 
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-m)'
                }} 
              />
            )}
            <Column flex={1}>
              <Heading as="h3" variant="heading-strong-l">
                {post.title}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {post.description}
              </Text>
              {post.tags && (
                <Row gap="8" marginTop="8">
                  {post.tags.map((tag) => (
                    <Text key={tag} variant="label-default-s" onBackground="neutral-medium">
                      #{tag}
                    </Text>
                  ))}
                </Row>
              )}
              {post.metadata?.readTime && (
                <Text variant="label-default-s" onBackground="neutral-weak" marginTop="4">
                  {post.metadata.readTime}
                </Text>
              )}
            </Column>
          </Column>
        ))}
      </div>
    </Column>
  );
}