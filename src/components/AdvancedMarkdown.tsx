// src/components/AdvancedMarkdown.tsx
'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Heading, Text, SmartLink } from "@once-ui-system/core";
import mermaid from 'mermaid';

interface AdvancedMarkdownProps {
  source: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────
// LIGHTBOX — clicking any markdown image opens it fullscreen.
// If the image is landscape (wider than tall) but the viewport
// is portrait (taller than wide, i.e. a phone held normally),
// the image is rotated 90° so it fills the screen using its
// long edge instead of being capped by the short edge.
// ─────────────────────────────────────────────────────────────
interface LightboxImage {
  src: string;
  alt: string;
  isPortrait: boolean; // naturalHeight > naturalWidth
}

interface LightboxContextValue {
  open: (img: LightboxImage) => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error('useLightbox must be used within LightboxProvider');
  return ctx;
}

function useViewportIsPortrait() {
  const [viewportPortrait, setViewportPortrait] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const update = () => setViewportPortrait(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return viewportPortrait;
}

function Lightbox({
  image,
  onClose,
}: {
  image: LightboxImage | null;
  onClose: () => void;
}) {
  const viewportPortrait = useViewportIsPortrait();
  const [manualRotate, setManualRotate] = useState(false);

  // Reset manual override whenever a new image is opened
  useEffect(() => {
    setManualRotate(false);
  }, [image?.src]);

  useEffect(() => {
    if (!image) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key.toLowerCase() === 'r') setManualRotate((v) => !v);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [image, onClose]);

  if (!image || typeof document === 'undefined') return null;

  const imageIsLandscape = !image.isPortrait;
  const autoRotate = imageIsLandscape && viewportPortrait;
  const shouldRotate = autoRotate !== manualRotate; // manual toggle flips auto decision

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 8, 15, 0.94)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'lightbox-fade-in 0.15s ease-out',
      }}
    >
      <style>{`
        @keyframes lightbox-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1002,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.5)',
          color: '#fff',
          fontSize: '1.25rem',
          lineHeight: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>

      {/* Rotate toggle — only useful when the image is landscape */}
      {imageIsLandscape && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setManualRotate((v) => !v);
          }}
          aria-label="Rotate image"
          style={{
            position: 'fixed',
            top: '1rem',
            right: '4.25rem',
            zIndex: 1002,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            fontSize: '1.1rem',
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ⟳
        </button>
      )}

      {shouldRotate ? (
        // Rotated box: pre-rotation dimensions are swapped (100vh x 100vw)
        // so that after a 90° rotation about its own center, its visual
        // footprint matches the viewport instead of being capped by the
        // short edge.
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vh',
            height: '100vw',
            transform: 'translate(-50%, -50%) rotate(90deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            style={{
              maxWidth: '96%',
              maxHeight: '96%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          onClick={(e) => e.stopPropagation()}
          src={image.src}
          alt={image.alt}
          style={{
            maxWidth: '96vw',
            maxHeight: '96vh',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        />
      )}

      {image.alt && (
        <p
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.75)',
            fontSize: '0.8rem',
            fontStyle: 'italic',
            textAlign: 'center',
            maxWidth: '90vw',
            zIndex: 1002,
          }}
        >
          {image.alt}
        </p>
      )}
    </div>,
    document.body
  );
}

function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [image, setImage] = useState<LightboxImage | null>(null);

  const open = useCallback((img: LightboxImage) => setImage(img), []);
  const close = useCallback(() => setImage(null), []);

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      <Lightbox image={image} onClose={close} />
    </LightboxContext.Provider>
  );
}

// Mermaid diagram component
function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#06b6d4',
          primaryTextColor: '#e2e8f0',
          primaryBorderColor: '#0891b2',
          lineColor: '#22d3ee',
          secondaryColor: '#0891b2',
          tertiaryColor: '#164e63',
          background: '#0f172a',
          mainBkg: '#0f172a',
          secondBkg: '#1e293b',
          tertiaryBkg: '#334155',
          textColor: '#e2e8f0',
          fontSize: '16px',
          fontFamily: 'var(--font-sans, system-ui, sans-serif)'
        },
        flowchart: {
          curve: 'basis',
          padding: 20
        }
      });

      const renderDiagram = async () => {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            ref.current.innerHTML = `<pre style="color: #ef4444; padding: 1rem;">Error rendering diagram: ${error}</pre>`;
          }
        }
      };

      renderDiagram();
    }
  }, [chart]);

  return (
    <div style={{
      marginBottom: '2.5rem',
      marginTop: '1.5rem',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '3px solid transparent',
      background: 'linear-gradient(#0f172a, #0f172a) padding-box, linear-gradient(135deg, #06b6d4, #0891b2, #22d3ee) border-box',
      boxShadow: '0 8px 24px rgba(6, 182, 212, 0.2), 0 0 0 1px rgba(6, 182, 212, 0.1)',
      padding: '2rem'
    }}>
      <div ref={ref} style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center'
      }} />
    </div>
  );
}

// Image component with orientation-aware inline sizing AND click-to-fullscreen.
function MarkdownImage(props: any) {
  const { node, ...imgProps } = props;
  const [isPortrait, setIsPortrait] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { open } = useLightbox();

  const handleLoad = (e: any) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setIsPortrait(naturalHeight > naturalWidth);
    setLoaded(true);
  };

  return (
    <div style={{
      marginBottom: '2.5rem',
      marginTop: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      clear: 'both'
    }}>
      <div style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '3px solid transparent',
        background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #06b6d4, #0891b2, #22d3ee) border-box',
        boxShadow: '0 8px 24px rgba(6, 182, 212, 0.2), 0 0 0 1px rgba(6, 182, 212, 0.1)',
        transition: 'all 0.3s ease',
        maxWidth: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        cursor: 'zoom-in'
      }}
      onClick={() => {
        if (imgProps.src) {
          open({ src: imgProps.src, alt: imgProps.alt || '', isPortrait });
        }
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          style={{
            width: isPortrait ? 'auto' : '100%',
            maxWidth: '100%',
            maxHeight: isPortrait ? '70vh' : 'none',
            height: 'auto',
            display: 'block',
            borderRadius: '13px',
            opacity: loaded ? 1 : 0.4,
            transition: 'opacity 0.2s ease'
          }}
          {...imgProps}
          onLoad={handleLoad}
          alt={imgProps.alt || ''}
        />
      </div>
      {imgProps.alt && (
        <p style={{
          marginTop: '1rem',
          marginBottom: 0,
          fontSize: '0.875rem',
          color: 'var(--neutral-on-background-weak)',
          fontStyle: 'italic',
          textAlign: 'center',
          width: '100%',
          display: 'block'
        }}>
          {imgProps.alt}
        </p>
      )}
    </div>
  );
}

// Enhanced markdown components with comprehensive styling
const markdownComponents = {
  h1: (props: any) => (
    <Heading 
      as="h1"
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
      as="h2"
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
      as="h3"
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
      as="h4"
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
      as="h5"
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
      as="h6"
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
  
  p: (props: any) => {
    const { node, children, ...rest } = props;

    const containsImage = node?.children?.some(
      (child: any) => child.type === 'image' || child.tagName === 'img'
    );

    if (containsImage) {
      return (
        <div
          style={{
            marginBottom: '1.25rem',
            lineHeight: '1.8',
            color: 'var(--neutral-on-background-strong)',
            display: 'block',
            width: '100%'
          }}
          {...rest}
        >
          {children}
        </div>
      );
    }

    return (
      <Text
        as="p"
        variant="body-default-m"
        style={{
          marginBottom: '1.25rem',
          lineHeight: '1.8',
          color: 'var(--neutral-on-background-strong)',
          display: 'block',
          width: '100%',
          clear: 'both'
        }}
        {...rest}
      >
        {children}
      </Text>
    );
  },
  
  a: (props: any) => (
    <SmartLink 
      style={{
        color: '#06b6d4',
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
  
  strong: (props: any) => (
    <strong 
      style={{ 
        fontWeight: 600,
        color: 'var(--neutral-on-background-strong)'
      }}
      {...props}
    />
  ),
  
  em: (props: any) => (
    <em 
      style={{ 
        fontStyle: 'italic',
        color: 'var(--neutral-on-background-medium)'
      }}
      {...props}
    />
  ),
  
  code: (props: any) => {
    const { children, className, node, ...rest } = props;
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    if (language === 'mermaid') {
      return <MermaidDiagram chart={String(children).trim()} />;
    }
    
    if (match) {
      return (
        <div style={{
          position: 'relative',
          marginBottom: '2rem',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--neutral-alpha-medium)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
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
              color: '#e2e8f0',
              whiteSpace: 'pre'
            }}
            {...rest}
          >
            {children}
          </code>
        </div>
      );
    }
    
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
        {...rest}
      >
        {children}
      </code>
    );
  },
  
  pre: (props: any) => {
    const { children, node, ...rest } = props;
    
    const hasCodeChild = children?.props?.className?.startsWith('language-');
    
    if (!hasCodeChild && typeof children === 'object' && children?.props?.children) {
      return (
        <div style={{
          position: 'relative',
          marginBottom: '2rem',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--neutral-alpha-medium)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <pre 
            style={{ 
              display: 'block',
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              padding: '1.5rem',
              fontSize: '0.875em',
              fontFamily: 'var(--font-code)',
              overflowX: 'auto',
              lineHeight: '1.6',
              color: '#e2e8f0',
              margin: 0
            }}
            {...rest}
          >
            {children}
          </pre>
        </div>
      );
    }
    
    return <>{children}</>;
  },
  
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

  img: (props: any) => <MarkdownImage {...props} />,
};

export function AdvancedMarkdown({ source, className }: AdvancedMarkdownProps) {
  return (
    <LightboxProvider>
      <div 
        className={className}
        style={{
          maxWidth: '85vw',
          width: '100%',
          margin: '0 auto',
          padding: '2rem'
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={markdownComponents}
        >
          {source}
        </ReactMarkdown>
      </div>
    </LightboxProvider>
  );
}

export default AdvancedMarkdown;