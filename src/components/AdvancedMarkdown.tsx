// src/components/AdvancedMarkdown.tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import { Heading, Text, SmartLink } from "@once-ui-system/core";
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface AdvancedMarkdownProps {
  source: string;
  className?: string;
}

// Enhanced MDX components with comprehensive styling
const mdxComponents = {
  // Headings with proper spacing
  h1: (props: any) => (
    <Heading 
      variant="display-strong-l" 
      style={{ 
        marginTop: '2.5rem', 
        marginBottom: '1.25rem',
        scrollMarginTop: '100px'
      }}
      {...props} 
    />
  ),
  h2: (props: any) => (
    <Heading 
      variant="heading-strong-xl" 
      style={{ 
        marginTop: '3rem', 
        marginBottom: '1rem',
        scrollMarginTop: '100px',
        borderBottom: '1px solid var(--neutral-alpha-weak)',
        paddingBottom: '0.5rem'
      }}
      {...props} 
    />
  ),
  h3: (props: any) => (
    <Heading 
      variant="heading-strong-l" 
      style={{ 
        marginTop: '2rem', 
        marginBottom: '0.875rem',
        scrollMarginTop: '100px'
      }}
      {...props} 
    />
  ),
  h4: (props: any) => (
    <Heading 
      variant="heading-strong-m" 
      style={{ 
        marginTop: '1.75rem', 
        marginBottom: '0.75rem',
        scrollMarginTop: '100px'
      }}
      {...props} 
    />
  ),
  h5: (props: any) => (
    <Heading 
      variant="heading-strong-s" 
      style={{ 
        marginTop: '1.5rem', 
        marginBottom: '0.625rem',
        scrollMarginTop: '100px'
      }}
      {...props} 
    />
  ),
  h6: (props: any) => (
    <Text 
      variant="label-strong-m" 
      style={{ 
        marginTop: '1.25rem', 
        marginBottom: '0.5rem', 
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        scrollMarginTop: '100px'
      }}
      {...props} 
    />
  ),
  
  // Paragraphs
  p: (props: any) => (
    <Text 
      variant="body-default-m" 
      style={{ 
        marginBottom: '1.25rem', 
        lineHeight: '1.8',
        color: 'var(--neutral-on-background-strong)'
      }}
      {...props} 
    />
  ),
  
  // Links
  a: (props: any) => (
    <SmartLink 
      style={{
        color: 'var(--brand-on-background-strong)',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        transition: 'color 0.2s ease'
      }}
      {...props} 
    />
  ),
  
  // Unordered Lists
  ul: (props: any) => (
    <ul 
      style={{ 
        marginLeft: '1.75rem', 
        marginBottom: '1.25rem',
        listStyleType: 'disc',
        color: 'var(--neutral-on-background-strong)',
        lineHeight: '1.7'
      }}
      {...props}
    />
  ),
  
  // Ordered Lists
  ol: (props: any) => (
    <ol 
      style={{ 
        marginLeft: '1.75rem', 
        marginBottom: '1.25rem',
        listStyleType: 'decimal',
        color: 'var(--neutral-on-background-strong)',
        lineHeight: '1.7'
      }}
      {...props}
    />
  ),
  
  // List Items
  li: (props: any) => (
    <li 
      style={{ 
        marginBottom: '0.625rem',
        lineHeight: '1.7',
        paddingLeft: '0.375rem'
      }}
      {...props}
    />
  ),
  
  // Strong/Bold
  strong: (props: any) => (
    <strong 
      style={{ 
        fontWeight: 600,
        color: 'var(--neutral-on-background-strong)'
      }}
      {...props}
    />
  ),
  
  // Emphasis/Italic
  em: (props: any) => (
    <em 
      style={{ 
        fontStyle: 'italic',
        color: 'var(--neutral-on-background-medium)'
      }}
      {...props}
    />
  ),
  
  // Inline Code
  code: (props: any) => {
    const { children, className } = props;
    const isCodeBlock = className?.startsWith('language-');
    
    if (isCodeBlock) {
      // Code block
      return (
        <code 
          style={{ 
            display: 'block',
            background: 'var(--neutral-alpha-weak)',
            padding: '1.25rem',
            borderRadius: '0.5rem',
            fontSize: '0.875em',
            fontFamily: 'var(--font-code)',
            overflowX: 'auto',
            marginBottom: '1.25rem',
            border: '1px solid var(--neutral-alpha-medium)',
            lineHeight: '1.6'
          }}
          className={className}
          {...props}
        />
      );
    }
    
    // Inline code
    return (
      <code 
        style={{ 
          background: 'var(--neutral-alpha-weak)',
          padding: '0.125rem 0.375rem',
          borderRadius: '0.25rem',
          fontSize: '0.9em',
          fontFamily: 'var(--font-code)',
          border: '1px solid var(--neutral-alpha-medium)',
          color: 'var(--brand-on-background-strong)'
        }}
        {...props}
      />
    );
  },
  
  // Pre (wraps code blocks)
  pre: (props: any) => (
    <pre 
      style={{ 
        marginBottom: '1.5rem',
        overflow: 'visible'
      }}
      {...props}
    />
  ),
  
  // Blockquotes
  blockquote: (props: any) => (
    <blockquote 
      style={{ 
        borderLeft: '4px solid var(--brand-background-strong)',
        paddingLeft: '1.25rem',
        marginLeft: '0',
        marginRight: '0',
        marginBottom: '1.5rem',
        fontStyle: 'italic',
        color: 'var(--neutral-on-background-medium)',
        background: 'var(--neutral-alpha-weak)',
        padding: '1rem 1.25rem',
        borderRadius: '0.375rem'
      }}
      {...props}
    />
  ),
  
  // Horizontal Rule
  hr: (props: any) => (
    <hr 
      style={{ 
        border: 'none',
        borderTop: '2px solid var(--neutral-alpha-medium)',
        margin: '2.5rem 0',
        borderRadius: '1px'
      }}
      {...props}
    />
  ),
  
  // Tables
  table: (props: any) => (
    <div style={{ 
      overflowX: 'auto', 
      marginBottom: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid var(--neutral-alpha-medium)'
    }}>
      <table 
        style={{ 
          width: '100%',
          borderCollapse: 'collapse'
        }}
        {...props}
      />
    </div>
  ),
  
  thead: (props: any) => (
    <thead 
      style={{ 
        background: 'var(--neutral-alpha-weak)'
      }}
      {...props}
    />
  ),
  
  th: (props: any) => (
    <th 
      style={{ 
        padding: '0.875rem 1rem',
        textAlign: 'left',
        borderBottom: '2px solid var(--neutral-alpha-medium)',
        fontWeight: 600,
        fontSize: '0.875rem',
        color: 'var(--neutral-on-background-strong)'
      }}
      {...props}
    />
  ),
  
  td: (props: any) => (
    <td 
      style={{ 
        padding: '0.875rem 1rem',
        borderBottom: '1px solid var(--neutral-alpha-weak)',
        fontSize: '0.875rem',
        color: 'var(--neutral-on-background-medium)'
      }}
      {...props}
    />
  ),
  
  tbody: (props: any) => (
    <tbody {...props} />
  ),
  
  tr: (props: any) => (
    <tr 
      style={{
        transition: 'background-color 0.15s ease'
      }}
      {...props}
    />
  ),

  // Images
  img: (props: any) => (
    <img
      style={{
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '0.5rem',
        marginBottom: '1.5rem',
        border: '1px solid var(--neutral-alpha-weak)'
      }}
      {...props}
    />
  ),
};

export async function AdvancedMarkdown({ source, className }: AdvancedMarkdownProps) {
  return (
    <div className={className}>
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkBreaks],
          },
        }}
      />
    </div>
  );
}

export default AdvancedMarkdown;