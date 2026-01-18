// src/app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { ScrollToHash } from "@/components";
import {
  Meta,
  Schema,
  Column,
  Heading,
  HeadingNav,
  Row,
  Text,
  SmartLink,
  Avatar,
  Media,
  Line,
} from "@once-ui-system/core";
import { baseURL, about, blog, person } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { Metadata } from "next";
import React from "react";
import { Posts } from "@/components/blog/Posts";
import { ShareSection } from "@/components/blog/ShareSection";
import AdvancedMarkdown from "@/components/AdvancedMarkdown";

async function getBlogPost(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blog/${slug}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return null;
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) return {};

  return Meta.generate({
    title: post.title,
    description: post.description,
    baseURL: baseURL,
    image: post.image || `/api/og/generate?title=${post.title}`,
    path: `${blog.path}/${post.slug}`,
  });
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <Row fillWidth>
      <Row maxWidth={12} m={{ hide: true }} />
      <Row fillWidth horizontal="center">
        <Column as="section" maxWidth="m" horizontal="center" gap="l" paddingTop="24">
          <Schema
            as="blogPosting"
            baseURL={baseURL}
            path={`${blog.path}/${post.slug}`}
            title={post.title}
            description={post.description}
            datePublished={post.publishedAt}
            dateModified={post.publishedAt}
            image={
              post.image ||
              `/api/og/generate?title=${encodeURIComponent(post.title)}`
            }
            author={{
              name: post.author || person.name,
              url: `${baseURL}${about.path}`,
              image: `${baseURL}${person.avatar}`,
            }}
          />
          
          <Column maxWidth="s" gap="16" horizontal="center" align="center">
            <SmartLink href="/blog">
              <Text variant="label-strong-m">Blog</Text>
            </SmartLink>
            <Text variant="body-default-xs" onBackground="neutral-weak" marginBottom="12">
              {post.publishedAt && formatDate(post.publishedAt)}
            </Text>
            <Heading variant="display-strong-m">{post.title}</Heading>
            {post.description && (
              <Text 
                variant="body-default-l" 
                onBackground="neutral-weak" 
                align="center"
                style={{ fontStyle: 'italic' }}
              >
                {post.description}
              </Text>
            )}
          </Column>
          
          <Row marginBottom="32" horizontal="center">
            <Row gap="16" vertical="center">
              <Avatar size="s" src={person.avatar} />
              <Text variant="label-default-m" onBackground="brand-weak">
                {post.author || person.name}
              </Text>
              {post.metadata?.readTime && (
                <>
                  <Text variant="label-default-m" onBackground="neutral-weak">•</Text>
                  <Text variant="label-default-m" onBackground="neutral-weak">
                    {post.metadata.readTime}
                  </Text>
                </>
              )}
            </Row>
          </Row>
          
          {post.tags && post.tags.length > 0 && (
            <Row gap="8" horizontal="center" wrap marginBottom="16">
              {post.tags.map((tag: string) => (
                <Text key={tag} variant="label-default-s" onBackground="neutral-medium">
                  #{tag}
                </Text>
              ))}
            </Row>
          )}
          
          {post.image && (
            <Media
              src={typeof post.image === 'string' && post.image.length > 0
                      ? post.image
                      : '/images/placeholder-project-1.jpg'}
              alt={post.title}
              aspectRatio="16/9"
              priority
              sizes="(min-width: 768px) 100vw, 768px"
              border="neutral-alpha-weak"
              radius="l"
              marginTop="12"
              marginBottom="8"
            />
          )}
          
          {/* Replace CustomMDX with AdvancedMarkdown */}
          <Column as="article" maxWidth="s">
            <AdvancedMarkdown source={post.content} />
          </Column>
          
          <ShareSection 
            title={post.title} 
            url={`${baseURL}${blog.path}/${post.slug}`} 
          />

          
          <ScrollToHash />
        </Column>
      </Row>
      <Column
        maxWidth={12}
        paddingLeft="40"
        fitHeight
        position="sticky"
        top="80"
        gap="16"
        m={{ hide: true }}
      >
        <HeadingNav fitHeight />
      </Column>
    </Row>
  );
}