import React, { useEffect } from 'react';
import { getSortedPostsMetadata } from '../postsData';
import { soundFx } from '../utils/audio';
import '../styles/BlogListPage.css';

interface BlogListPageProps {
  onClose: () => void;
  onSelectPost: (slug: string) => void;
}

const BlogListPage: React.FC<BlogListPageProps> = ({ onClose, onSelectPost }) => {
  const posts = getSortedPostsMetadata();

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

  const handlePostClick = (slug: string) => {
    soundFx.playClick();
    onSelectPost(slug);
  };

  const handleClose = () => {
    soundFx.playClick();
    onClose();
  };

  return (
    <div className="adv-gui-overlay" onClick={handleClose}>
      {/* Heavy 3D Beveled Message Board Window */}
      <div className="adv-message-board-window" onClick={(e) => e.stopPropagation()}>
        
        {/* Chunky 3D Close Button */}
        <button
          className="adv-gui-close-btn"
          onClick={handleClose}
          aria-label="Close Bulletin (Escape)"
          title="Return to Street (ESC)"
        >
          <span className="close-btn-text">✕ ESC</span>
        </button>

        {/* Window Title Bar */}
        <header className="adv-window-header">
          <div className="adv-header-plaque">
            <span className="plaque-sub">TOWN MESSAGE BOARD • FIELD DISPATCHES</span>
            <h1 className="plaque-title">Inchoate Ramblings</h1>
            <p className="plaque-desc">
              Notes on capital markets plumbing, software craft, artificial intelligence, and curious systems.
            </p>
          </div>
        </header>

        {/* Pinned Parchment Notices */}
        {posts.length === 0 ? (
          <div className="adv-empty-notice">
            <p>No dispatches currently pinned to the board. Check back later.</p>
          </div>
        ) : (
          <div className="adv-notices-list">
            {posts.map((post, idx) => {
              const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <article
                  key={post.slug}
                  className="adv-dispatch-card"
                  onClick={() => handlePostClick(post.slug)}
                >
                  <div className="dispatch-header-row">
                    <span className="dispatch-badge">DISPATCH #{posts.length - idx}</span>
                    <time className="dispatch-date-stamp" dateTime={post.date}>
                      {formattedDate}
                    </time>
                  </div>

                  <h2 className="dispatch-headline">
                    <button
                      className="dispatch-title-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePostClick(post.slug);
                      }}
                    >
                      {post.title}
                    </button>
                  </h2>

                  <p className="dispatch-excerpt">{post.excerpt}</p>

                  <div className="dispatch-footer-row">
                    <span className="dispatch-read-prompt">
                      ☞ Click to Read Dispatch
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListPage;