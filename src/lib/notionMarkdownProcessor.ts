// src/lib/notionMarkdownProcessor.ts

/**
 * Process Notion exported Markdown to work with our AdvancedMarkdown component
 */
export function processNotionMarkdown(markdown: string): string {
  let processed = markdown;
  
  // 1. Convert Notion callouts to our Callout component
  processed = convertCallouts(processed);
  
  // 2. Convert Notion toggle blocks
  processed = convertToggles(processed);
  
  // 3. Fix code blocks
  processed = fixCodeBlocks(processed);
  
  // 4. Handle Notion-style highlights
  processed = convertHighlights(processed);
  
  // 5. Fix image paths (Notion exports images to a folder)
  processed = fixImagePaths(processed);
  
  // 6. Convert Notion dividers
  processed = convertDividers(processed);
  
  return processed;
}

/**
 * Convert Notion callouts/alerts to our Callout component
 */
function convertCallouts(markdown: string): string {
  const calloutMap: { [key: string]: string } = {
    '💡': 'info',
    'ℹ️': 'info',
    'ℹ': 'info',
    '💬': 'info',
    '⚠️': 'warning',
    '⚠': 'warning',
    '⚡': 'warning',
    '🔥': 'warning',
    '✅': 'success',
    '✓': 'success',
    '✔️': 'success',
    '🎉': 'success',
    '🎊': 'success',
    '❌': 'error',
    '❗': 'error',
    '🚨': 'error',
    '⛔': 'error',
    '🛑': 'error',
    '📝': 'note',
    '📌': 'note',
    '💭': 'note',
    '📄': 'note',
    '🔖': 'note'
  };
  
  let processed = markdown;
  
  // Match Notion callout pattern: > emoji followed by content
  Object.entries(calloutMap).forEach(([emoji, type]) => {
    // Match single line or multi-line callouts
    const singleLineRegex = new RegExp(`^>\\s*${emoji}\\s*(.+?)$`, 'gm');
    const multiLineRegex = new RegExp(
      `^>\\s*${emoji}\\s*(.+?)\\n((?:>\\s*.+?\\n)*)`,
      'gm'
    );
    
    // Replace multi-line callouts
    processed = processed.replace(multiLineRegex, (match, firstLine, restLines) => {
      const content = firstLine + '\n' + restLines.replace(/^>\s*/gm, '');
      return `\n<Callout type="${type}">\n\n${content.trim()}\n\n</Callout>\n`;
    });
    
    // Replace single-line callouts
    processed = processed.replace(singleLineRegex, (match, content) => {
      return `\n<Callout type="${type}">\n\n${content.trim()}\n\n</Callout>\n`;
    });
  });
  
  return processed;
}

/**
 * Convert Notion toggle blocks to our Toggle component
 */
function convertToggles(markdown: string): string {
  // Notion exports toggles as <details> tags
  const detailsRegex = /<details>\s*<summary>(.+?)<\/summary>\s*([\s\S]+?)<\/details>/g;
  
  return markdown.replace(detailsRegex, (match, summary, content) => {
    const cleanSummary = summary.trim().replace(/\*\*/g, ''); // Remove bold markers
    const cleanContent = content.trim();
    return `\n<Toggle summary="${cleanSummary}">\n\n${cleanContent}\n\n</Toggle>\n`;
  });
}

/**
 * Fix code blocks to ensure they have language tags
 */
function fixCodeBlocks(markdown: string): string {
  let processed = markdown;
  
  // Add 'text' language to code blocks without language
  processed = processed.replace(/```\n/g, '```text\n');
  
  // Fix common language aliases
  const languageAliases: { [key: string]: string } = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'py': 'python',
    'sh': 'bash',
    'yml': 'yaml',
  };
  
  Object.entries(languageAliases).forEach(([alias, proper]) => {
    const regex = new RegExp(`\`\`\`${alias}\\n`, 'g');
    processed = processed.replace(regex, `\`\`\`${proper}\n`);
  });
  
  return processed;
}

/**
 * Convert Notion highlights to HTML marks or emphasized text
 */
function convertHighlights(markdown: string): string {
  // Notion uses ==highlight== but some exports might use different formats
  // Convert to our supported format: **highlighted text**
  return markdown.replace(/==(.+?)==/g, '**$1**');
}

/**
 * Fix image paths from Notion exports
 */
function fixImagePaths(markdown: string): string {
  // Notion exports images like: ![image.png](Notion%20Export%20abc/image.png)
  // We need to handle these properly
  
  // If images are in a subfolder, you might want to:
  // 1. Upload them to Cloudinary/your CDN
  // 2. Or store them in your public folder
  
  // For now, we'll just clean up the URLs
  return markdown.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, url) => {
      // Decode URL-encoded paths
      const decodedUrl = decodeURIComponent(url);
      
      // If it's a relative path, you might want to prepend your image host
      // For example: `/uploaded-images/${decodedUrl}`
      
      return `![${alt}](${decodedUrl})`;
    }
  );
}

/**
 * Convert Notion dividers
 */
function convertDividers(markdown: string): string {
  // Notion uses ---
  // Ensure proper spacing around dividers
  return markdown.replace(/\n---\n/g, '\n\n---\n\n');
}

/**
 * Extract title from Notion markdown (usually first H1)
 */
export function extractTitle(markdown: string): string | null {
  const titleMatch = markdown.match(/^#\s+(.+?)$/m);
  return titleMatch ? titleMatch[1].trim() : null;
}

/**
 * Extract metadata from Notion markdown frontmatter if present
 */
export function extractFrontmatter(markdown: string): {
  content: string;
  metadata: Record<string, any>;
} {
  const frontmatterRegex = /^---\n([\s\S]+?)\n---\n([\s\S]+)$/;
  const match = markdown.match(frontmatterRegex);
  
  if (!match) {
    return { content: markdown, metadata: {} };
  }
  
  const [, frontmatter, content] = match;
  const metadata: Record<string, any> = {};
  
  // Parse YAML-like frontmatter
  frontmatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      metadata[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes
    }
  });
  
  return { content: content.trim(), metadata };
}

/**
 * Complete processor with all features
 */
export function processNotionExport(markdownFile: string): {
  title: string | null;
  content: string;
  metadata: Record<string, any>;
} {
  // Extract frontmatter if present
  const { content: rawContent, metadata } = extractFrontmatter(markdownFile);
  
  // Extract title
  const title = extractTitle(rawContent);
  
  // Process the markdown
  const processedContent = processNotionMarkdown(rawContent);
  
  return {
    title,
    content: processedContent,
    metadata
  };
}