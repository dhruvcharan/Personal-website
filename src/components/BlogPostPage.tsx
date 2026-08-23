import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getPostMetadataBySlug, PostMetadata } from '../postsData';
import { soundFx } from '../utils/audio';
import '../styles/BlogPostPage.css';

interface BlogPostPageProps {
  slug: string;
  onClose: () => void;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onClose }) => {
  const [metadata, setMetadata] = useState<PostMetadata | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    soundFx.playMagic();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundFx.playClick();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    const postMeta = getPostMetadataBySlug(slug);
    setMetadata(postMeta || null);

    if (postMeta) {
      const fetchPath = `${process.env.PUBLIC_URL}/${postMeta.markdownPath}`;
      fetch(fetchPath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ${fetchPath}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching markdown:", err);
          setContent('# Error\n\nCould not retrieve this dispatch archive.');
          setLoading(false);
        });
    } else {
      setContent('# Error\n\nDispatch not found.');
      setLoading(false);
    }
  }, [slug]);

  const handleClose = () => {
    soundFx.playClick();
    onClose();
  };

  const formattedDate = metadata?.date
    ? new Date(metadata.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  return (
    <div className="adv-post-overlay" onClick={handleClose}>
      <div className="adv-post-window" onClick={(e) => e.stopPropagation()}>
        
        {/* Navigation & Close Bar */}
        <div className="adv-post-topbar">
          <button
            className="adv-post-back-btn"
            onClick={handleClose}
            aria-label="Return to Dispatches (Escape)"
          >
            ◄ RETURN TO DISPATCHES (ESC)
          </button>
          
          <button
            className="adv-gui-close-btn"
            onClick={handleClose}
            aria-label="Close Post"
          >
            <span className="close-btn-text">✕</span>
          </button>
        </div>

        {/* Post Masthead */}
        {metadata && (
          <header className="adv-post-masthead">
            <div className="adv-masthead-badge">
              <span className="masthead-tag">FIELD DISPATCH ARCHIVE</span>
              <time className="masthead-date" dateTime={metadata.date}>
                {formattedDate}
              </time>
            </div>

            <h1 className="adv-post-title">{metadata.title}</h1>
            <div className="adv-post-author-line">
              <span>BY DHRUV CHARAN</span>
            </div>
          </header>
        )}

        {/* Post Markdown Body */}
        <div className="adv-post-body-container">
          {loading ? (
            <div className="adv-post-loading">
              <p>ACCESSING DISPATCH ARCHIVES...</p>
            </div>
          ) : (
            <div className="adv-markdown-article">
              <ReactMarkdown>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <footer className="adv-post-footer">
          <button
            className="adv-post-footer-btn"
            onClick={handleClose}
          >
            ◄ Return to Town Message Board
          </button>
        </footer>
      </div>
    </div>
  );
};

export default BlogPostPage;