// src/components/AdvancedMarkdown.tsx
'use client';

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote/rsc";
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
        borderBottom: '2px solid var(--brand-alpha-medium)',
        paddingBottom: '0.75rem',
        background: 'linear-gradient(135deg, var(--brand-on-background-strong), var(--accent-on-background-strong))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
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
        scrollMarginTop: '100px',
        color: 'var(--brand-on-background-strong)'
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
        scrollMarginTop: '100px',
        color: 'var(--accent-on-background-strong)'
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
  
  // Links - Cyan color styling
  a: (props: any) => (
    <SmartLink 
      style={{
        color: '#06b6d4', // Cyan color
        textDecoration: 'none',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s ease',
        fontWeight: 500,
        position: 'relative',
        paddingBottom: '2px'
      }}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.borderBottomColor = '#06b6d4';
        e.currentTarget.style.color = '#22d3ee';
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.borderBottomColor = 'transparent';
        e.currentTarget.style.color = '#06b6d4';
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
      // Extract language from className
      const language = className?.replace('language-', '') || 'text';
      
      // Code block with enhanced design
      return (
        <div style={{
          position: 'relative',
          marginBottom: '2rem',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--neutral-alpha-medium)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Language badge */}
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            padding: '0.5rem 1rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22d3ee',
              boxShadow: '0 0 8px #22d3ee'
            }} />
            {language}
          </div>
          <code 
            style={{ 
              display: 'block',
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              padding: '1.5rem',
              fontSize: '0.875em',
              fontFamily: 'var(--font-code)',
              overflowX: 'auto',
              lineHeight: '1.6',
              color: '#e2e8f0'
            }}
            className={className}
          >
            {children}
          </code>
        </div>
      );
    }
    
    // Inline code with cyan accent
    return (
      <code 
        style={{ 
          background: 'rgba(6, 182, 212, 0.1)',
          padding: '0.2rem 0.5rem',
          borderRadius: '0.375rem',
          fontSize: '0.9em',
          fontFamily: 'var(--font-code)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#0891b2',
          fontWeight: 500
        }}
        {...props}
      />
    );
  },
  
  // Pre (wraps code blocks)
  pre: (props: any) => (
    <pre 
      style={{ 
        marginBottom: '0',
        overflow: 'visible'
      }}
      {...props}
    />
  ),
  
  // Blockquotes
  blockquote: (props: any) => (
    <blockquote 
      style={{ 
        borderLeft: '4px solid #06b6d4',
        paddingLeft: '1.5rem',
        marginLeft: '0',
        marginRight: '0',
        marginBottom: '2rem',
        fontStyle: 'italic',
        color: 'var(--neutral-on-background-medium)',
        background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.05), transparent)',
        padding: '1.25rem 1.5rem',
        borderRadius: '0.5rem',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(6, 182, 212, 0.1)'
      }}
      {...props}
    />
  ),
  
  // Horizontal Rule
  hr: (props: any) => (
    <hr 
      style={{ 
        border: 'none',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
        margin: '3rem 0',
        borderRadius: '1px'
      }}
      {...props}
    />
  ),
  
  // Tables
  table: (props: any) => (
    <div style={{ 
      overflowX: 'auto', 
      marginBottom: '2rem',
      borderRadius: '12px',
      border: '1px solid var(--neutral-alpha-medium)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
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
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(8, 145, 178, 0.1))'
      }}
      {...props}
    />
  ),
  
  th: (props: any) => (
    <th 
      style={{ 
        padding: '1rem 1.25rem',
        textAlign: 'left',
        borderBottom: '2px solid #06b6d4',
        fontWeight: 600,
        fontSize: '0.875rem',
        color: '#0891b2',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
      {...props}
    />
  ),
  
  td: (props: any) => (
    <td 
      style={{ 
        padding: '1rem 1.25rem',
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
      onMouseEnter={(e: any) => {
        e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.05)';
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      {...props}
    />
  ),

  // Images with enhanced design borders and effects
  img: (props: any) => (
    <div style={{
      marginBottom: '2.5rem',
      marginTop: '1.5rem'
    }}>
      <div style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '3px solid transparent',
        background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #06b6d4, #0891b2, #22d3ee) border-box',
        boxShadow: '0 8px 24px rgba(6, 182, 212, 0.2), 0 0 0 1px rgba(6, 182, 212, 0.1)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(6, 182, 212, 0.3), 0 0 0 1px rgba(6, 182, 212, 0.2)';
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(6, 182, 212, 0.2), 0 0 0 1px rgba(6, 182, 212, 0.1)';
      }}
      >
        <img
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '13px'
          }}
          {...props}
        />
        {/* Decorative corner accents */}
        {/* <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '24px',
          height: '24px',
          borderTop: '3px solid #06b6d4',
          borderLeft: '3px solid #06b6d4',
          borderRadius: '4px 0 0 0'
        }} /> */}
        {/* <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          width: '24px',
          height: '24px',
          borderBottom: '3px solid #22d3ee',
          borderRight: '3px solid #22d3ee',
          borderRadius: '0 0 4px 0'
        }} /> */}
      </div>
      {props.alt && (
        <p style={{
          marginTop: '1rem',
          fontSize: '0.875rem',
          color: 'var(--neutral-on-background-weak)',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          {props.alt}
        </p>
      )}
    </div>
  ),
};

export function AdvancedMarkdown({ source, className }: AdvancedMarkdownProps) {
  return (
    <div 
      className={className}
      style={{
        // Make markdown section wider
        maxWidth: '85vw',
        width: '100%',
        margin: '0 auto',
        padding: '2rem'
      }}
    >
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkBreaks],
            rehypePlugins: [],
          },
        }}
      />
    </div>
  );
}

export default AdvancedMarkdown;