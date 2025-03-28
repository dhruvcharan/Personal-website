import React, { useState } from 'react';
import GameEnvironment from './components/GameEnvironment';
import './App.css';
import NowPage from './components/NowPage';
import BlogListPage from './components/BlogListPage';
import ContactModal from './components/ContactModal';
import BlogPostPage from './components/BlogPostPage';

function App() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'now' | 'blogList' | 'blogPost'>('home');
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const openContactModal = () => setShowContactModal(true);
  const closeContactModal = () => setShowContactModal(false);

  const handleNavigate = (path: string) => {
    if (isNavigating) return;
    
    console.log('Navigating to:', path);
    setIsNavigating(true);
    
    if (path === '/mail') {
      openContactModal();
      setIsNavigating(false);
      return;
    }

    setTimeout(() => {
      switch(path) {
        case '/about':
          setCurrentPage('blogList');
          break;
        case '/projects':
          window.open('https://github.com/dhruvcharan', '_blank');
          setCurrentPage('home'); 
          break;
        case '/linkedin':
          window.open('https://linkedin.com/in/dhruv-charan', '_blank');
          setCurrentPage('home'); 
          break;
        case '/now':
          setCurrentPage('now');
          break;
        default:
          console.log('Unknown path:', path);
          setCurrentPage('home');
      }
      
      setIsNavigating(false);
    }, 2000); 
  };

  const handleBlogPostClick = (slug: string) => {
    setSelectedPostSlug(slug);
    setCurrentPage('blogPost');
    setShowContactModal(false);
  };

  const closeSubPage = () => {
    setSelectedPostSlug(null);
    setCurrentPage('home');
    setShowContactModal(false);
  };

  const closeBlogPost = () => {
    setSelectedPostSlug(null);
    setCurrentPage('blogList');
    setShowContactModal(false);
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <div className="content">
          <h1>Dhruv Charan</h1>
          <p>Click on the links to have the character take you where you need to go</p>
          <GameEnvironment onNavigate={handleNavigate} />
        </div>
      )}
      
      {currentPage === 'now' && (
        <NowPage onBackClick={closeSubPage} />
      )}

      {currentPage === 'blogList' && (
        <BlogListPage
          onClose={closeSubPage}
          onSelectPost={handleBlogPostClick}
        />
      )}
    
      {currentPage === 'blogPost' && selectedPostSlug && (
        <BlogPostPage
          slug={selectedPostSlug}
          onClose={closeBlogPost}
        />
      )}
      
      {showContactModal && <ContactModal onClose={closeContactModal} />}
    </div>
  );
}

export default App;