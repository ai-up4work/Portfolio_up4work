// src/app/work/[slug]/page.tsx
import { notFound } from "next/navigation";
import {
  Meta,
  Schema,
  Column,
  Heading,
  Media,
  Text,
  SmartLink,
  Row,
  Line,
} from "@once-ui-system/core";
import { baseURL, about, person, work } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { ScrollToHash } from "@/components";
import { Metadata } from "next";
import { Projects } from "@/components/work/Projects";
import dbConnect from "@/lib/mongodb";
import { Project } from "@/lib/models";
import AdvancedMarkdown from "@/components/AdvancedMarkdown";

// Generate static params for all projects
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    await dbConnect();
    const projects = await Project.find({}).select('slug').lean();
    
    return projects.map((project) => ({
      slug: project.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    
    await dbConnect();
    const project = await Project.findOne({ slug }).lean();

    if (!project) {
      return {};
    }

    return Meta.generate({
      title: project.seo?.metaTitle || project.title,
      description: project.seo?.metaDescription || project.description,
      baseURL: baseURL,
      image: project.seo?.ogImage || project.image || `/api/og/generate?title=${encodeURIComponent(project.title)}`,
      path: `${work.path}/${project.slug}`,
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {};
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  try {
    await dbConnect();
    const project = await Project.findOne({ slug }).lean();

    if (!project) {
      notFound();
    }

    return (
      <Column as="section" maxWidth="m" horizontal="center" gap="l">
        <Schema
          as="blogPosting"
          baseURL={baseURL}
          path={`${work.path}/${project.slug}`}
          title={project.title}
          description={project.description}
          datePublished={project.publishedAt.toISOString()}
          dateModified={project.updatedAt?.toISOString() || project.publishedAt.toISOString()}
          image={
            project.image || `/api/og/generate?title=${encodeURIComponent(project.title)}`
          }
          author={{
            name: project.author || person.name,
            url: `${baseURL}${about.path}`,
            image: `${baseURL}${person.avatar}`,
          }}
        />

        {/* Header Section */}
        <Column maxWidth="s" gap="16" horizontal="center" align="center">
          <SmartLink href="/work">
            <Text variant="label-strong-m">Projects</Text>
          </SmartLink>
          <Text variant="body-default-xs" onBackground="neutral-weak" marginBottom="12">
            {formatDate(project.publishedAt.toString())}
          </Text>
          <Heading variant="display-strong-m">{project.title}</Heading>
          
          {/* Description */}
          {project.description && (
            <Text 
              variant="body-default-l" 
              onBackground="neutral-weak" 
              align="center"
              style={{ fontStyle: 'italic' }}
            >
              {project.description}
            </Text>
          )}
          
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <Row gap="8" horizontal="center" wrap>
              {project.tags.map((tag) => (
                <Text
                  key={tag}
                  variant="label-default-s"
                  onBackground="neutral-weak"
                  paddingX="8"
                  paddingY="4"
                  style={{
                    border: '1px solid var(--neutral-alpha-medium)',
                    borderRadius: '4px',
                  }}
                >
                  {tag}
                </Text>
              ))}
            </Row>
          )}
        </Column>

        {/* Featured Image */}
        {(project.images?.[0] || project.image) && (
          <Media
            priority
            aspectRatio="16 / 9"
            radius="m"
            alt={project.title}
            src={project.images?.[0] || project.image}
          />
        )}

        {/* MDX Content using AdvancedMarkdown */}
        <Column style={{ margin: "auto" }} as="article" maxWidth="xs">
          <AdvancedMarkdown source={project.content} />
        </Column>

        {/* Metadata Footer */}
        {project.metadata && (
          <Row gap="24" horizontal="center" marginTop="24">
            {project.metadata.readTime && (
              <Text variant="label-default-s" onBackground="neutral-weak">
                📖 {project.metadata.readTime}
              </Text>
            )}
            {project.metadata.views && (
              <Text variant="label-default-s" onBackground="neutral-weak">
                👁️ {project.metadata.views.toLocaleString()} views
              </Text>
            )}
          </Row>
        )}

        {/* Related Projects */}
        <Column fillWidth gap="40" horizontal="center" marginTop="40">
          <Line maxWidth="40" />
          <Heading as="h2" variant="heading-strong-xl" marginBottom="24">
            Related projects
          </Heading>
          <Projects exclude={[project.slug]} range={[1, 3]} />
        </Column>

        <ScrollToHash />
      </Column>
    );
  } catch (error) {
    console.error('Error loading project:', error);
    notFound();
  }
}