import React from 'react';
import '../styles/BlogLink.css';

interface BlogLinkProps {
  onClick: () => void;
}

const BlogLink: React.FC<BlogLinkProps> = ({ onClick }) => {
  return (
    <button className="blog-link" onClick={onClick}>
      Blog
    </button>
  );
};

export default BlogLink;