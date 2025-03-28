import React, { useState } from 'react';
import GameEnvironment from './components/GameEnvironment';
import './App.css';
import NowPage from './components/NowPage';
import BlogListPage from './components/BlogListPage';
import ContactModal from './components/ContactModal';
import BlogPostPage from './components/BlogPostPage';
function App() {
  // const [selectedLink, setSelectedLink] = useState<string | null>(null);
  // const [characterPosition, setCharacterPosition] = useState({ x: 50, y: 0 });
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'now' | 'blogList' | 'blogPost'>('home');
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);

  const openContactModal = () => setShowContactModal(true);
  const closeContactModal = () => setShowContactModal(false);

  const handleNavigate = (path: string) => {
    console.log('Navigating to:', path); 
    setCurrentPage('home');
    setSelectedPostSlug(null);
    if (path === '/mail') {
      openContactModal();
      return;
    }

    setCurrentPage('home');
    selectedPostSlug && setSelectedPostSlug(null);
    showContactModal && setShowContactModal(false);
    
    setTimeout(() => {
      switch(path) {
        case '/about':
          // window.open('https://dhruv248.substack.com/', '_blank');
          setCurrentPage('blogList');
          break;
        case '/projects':
          window.open('https://github.com/dhruvcharan', '_blank');
          break;
        case '/linkedin':
          window.open('https://linkedin.com/in/dhruv-charan', '_blank');
          break;
        case '/now':
          setCurrentPage('now');
          break;
       
        
        default:
          console.log('Unknown path:', path);
      }
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
    setShowContactModal(false); // Close modal if open
  };

  const closeBlogPost = () => {
    setSelectedPostSlug(null);
    setCurrentPage('blogList');
    setShowContactModal(false);
  };

  return (
    <div className="App">
      { currentPage === 'home' &&(
      <div className="content">
        <h1>Dhruv Charan</h1>
        <p>CLick on the links to have the character take you where you need to go</p>
        <GameEnvironment onNavigate={handleNavigate} />
      </div>
  )}
    {currentPage === 'now' &&
        <NowPage onBackClick={closeSubPage} /> // Use combined close function
      }

    {currentPage === 'blogList' && (
            <BlogListPage
              onClose={closeSubPage} // Use combined close function
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