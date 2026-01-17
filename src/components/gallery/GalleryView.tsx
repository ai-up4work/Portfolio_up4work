// components/gallery/GalleryView.tsx
"use client";

import { useEffect, useState } from 'react';
import { Media, MasonryGrid, Flex, Text } from "@once-ui-system/core";

interface GalleryImage {
  id: string;
  url: string;
  thumbnail: string;
  medium: string;
  large: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  orientation: 'horizontal' | 'vertical';
}

export default function GalleryView() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      const result = await response.json();

      if (result.success) {
        // Determine orientation based on aspect ratio
        const processedImages = result.data.map((img: any) => ({
          ...img,
          orientation: img.width > img.height ? 'horizontal' : 'vertical'
        }));
        setImages(processedImages);
      } else {
        setError(result.error || 'Failed to load gallery');
      }
    } catch (err) {
      setError('Failed to fetch gallery images');
      console.error('Gallery fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex
        as="div"
        fillWidth
        paddingY="l"
        gap="m"
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '400px' }}
      >
        <Text variant="body-default-m" onBackground="neutral-weak">
          Loading gallery...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex
        as="div"
        fillWidth
        paddingY="l"
        gap="m"
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '400px' }}
      >
        <Text variant="body-default-m" onBackground="accent-strong">
          {error}
        </Text>
      </Flex>
    );
  }

  if (images.length === 0) {
    return (
      <Flex
        as="div"
        fillWidth
        paddingY="l"
        gap="m"
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '400px' }}
      >
        <Text variant="heading-strong-l">📸</Text>
        <Text variant="body-default-m" onBackground="neutral-weak">
          No images in the gallery yet
        </Text>
      </Flex>
    );
  }

  return (
    <MasonryGrid columns={2} s={{ columns: 1 }}>
      {images.map((image, index) => (
        <Media
          enlarge
          priority={index < 10}
          sizes="(max-width: 560px) 100vw, 50vw"
          key={image.id}
          radius="m"
          aspectRatio={image.orientation === "horizontal" ? "16 / 9" : "3 / 4"}
          src={image.url}
          alt={`Gallery image ${index + 1}`}
        />
      ))}
    </MasonryGrid>
  );
}