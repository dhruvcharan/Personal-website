import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { getPostMetadataBySlug, PostMetadata } from "../postsData";
import "../styles/BlogPostPage.css";

interface BlogPostPageProps {
  slug: string;
  onClose: () => void;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onClose }) => {
  const [metadata, setMetadata] = useState<PostMetadata | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setContent(''); 

    const postMeta = getPostMetadataBySlug(slug);
    setMetadata(postMeta || null);

    if (postMeta) {
      fetch(postMeta.markdownPath) 
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ${postMeta.markdownPath}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          setContent(text);
          setIsLoading(false);
        })
        .catch(fetchError => {
          console.error("Error fetching markdown:", fetchError);
          setError(`Could not load post content.`);
          setIsLoading(false);
        });
    } else {
      setError("Post not found.");
      setIsLoading(false);
    }
  }, [slug]); 


  const renderContent = () => {
    if (isLoading) {
      return <p>Loading post...</p>;
    }

    if (error || !metadata) {
      return (
        <>
          <h1 className="blog-post-title">Error</h1>
          <p>{error || 'Sorry, the post could not be found!'}</p>
        </>
      );
    }

    
    return (
      <article className="blog-post-article">
        <h1 className="blog-post-title">{metadata.title}</h1>
        <p className="blog-post-date">
          {new Date(metadata.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="blog-post-body">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </article>
    );
  };

  return (
    <div className="blog-post-overlay" onClick={onClose}>
      <div className="blog-post-content" onClick={(e) => e.stopPropagation()}>
        <button className="page-close-button" onClick={onClose}>
          &times;
        </button>
        {renderContent()}
      </div>
    </div>
  );
}

export default BlogPostPage;