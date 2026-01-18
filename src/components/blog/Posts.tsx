'use client';

import { useEffect, useState } from 'react';
import { Grid } from "@once-ui-system/core";
import Post from "./Post";
import { IBlogPost } from '@/lib/models';

interface PostsProps {
  range?: [number] | [number, number];
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
  direction?: "row" | "column";
  exclude?: string[];
  featured?: boolean;
  tag?: string;
  limit?: number;
}

export function Posts({
  range,
  columns = "1",
  thumbnail = false,
  exclude = [],
  direction,
  featured,
  tag,
  limit,
}: PostsProps) {
  const [posts, setPosts] = useState<IBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const params = new URLSearchParams();
        
        if (featured) {
          params.append('featured', 'true');
        }
        
        if (tag) {
          params.append('tag', tag);
        }
        
        if (limit) {
          params.append('limit', limit.toString());
        }
        
        const response = await fetch(`/api/blog?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          let filtered = result.data;
          
          // Exclude by slug (exact match)
          if (exclude.length) {
            filtered = filtered.filter((post: IBlogPost) => !exclude.includes(post.slug));
          }
          
          // Sort by publication date (already sorted by API, but keeping for consistency)
          const sorted = filtered.sort((a: IBlogPost, b: IBlogPost) => {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          });
          
          // Apply range filter
          const displayed = range
            ? sorted.slice(range[0] - 1, range.length === 2 ? range[1] : sorted.length)
            : sorted;
          
          setPosts(displayed);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Grid columns={columns} s={{ columns: 1 }} fillWidth marginBottom="40" gap="16">
        <div>Loading posts...</div>
      </Grid>
    );
  }

  return (
    <>
      {posts.length > 0 && (
        <Grid columns={columns} s={{ columns: 1 }} fillWidth marginBottom="40" gap="16">
          {posts.map((post) => (
            <Post 
              key={post.slug} 
              post={{
                slug: post.slug,
                metadata: {
                  title: post.title,
                  publishedAt: post.publishedAt,
                  summary: post.description,
                  image:
                    typeof post.image === 'string' && post.image.length > 0
                      ? post.image
                      : '/images/placeholder-project-1.jpg',
                  author: post.author,
                  tags: post.tags,
                },
                content: post.content,
              }} 
              thumbnail={thumbnail} 
              direction={direction} 
            />
          ))}
        </Grid>
      )}
    </>
  );
}