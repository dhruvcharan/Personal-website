import React from 'react';
import {getSortedPostsMetadata, PostMetadata} from '../postsData';
import '../styles/BlogListPage.css';

interface BlogListPageProps {
    onClose: () => void;
    onSelectPost: (slug: string) => void;
}

const BlogListPage: React.FC<BlogListPageProps> = ({onClose, onSelectPost}) => {
    const posts = getSortedPostsMetadata();

    return (
        <div className="blog-list-overlay" onClick={onClose}>
           <div className="blog-list-content" onClick={(e) => e.stopPropagation()}>
                <button className="page-close-button" onClick={onClose}>
                   &times;
                </button>
                <h1 className="blog-list-title">Inchoate Ramblings</h1>
                   {posts.length === 0 ? (
                       <p>No posts yet... check back later!</p>
                   ) : (
                       <ul className="post-items-list">
                           {posts.map((post) => (
                               <li key={post.slug} className="post-list-item">
                                   <h2 className="post-list-title">
                                       <button onClick={() => onSelectPost(post.slug)} className="post-title-button">
                                           {post.title}
                                       </button>
                                   </h2>
                                   <p className="post-list-date">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                   <p className="post-list-excerpt">{post.excerpt}</p>
                                   <button onClick={() => onSelectPost(post.slug)} className="read-more-button">
                                        Read More &raquo;
                                    </button>
                               </li>
                           ))}
                       </ul>
                   )}
           </div>
       </div>
     );
   };
   
   export default BlogListPage;