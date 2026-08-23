import React, { useEffect } from 'react';
import { currentlyReading, bookCategories } from './book_data';
import { soundFx } from '../utils/audio';
import '../styles/NowPage.css';

interface NowPageProps {
  onBackClick: () => void;
}

const NowPage: React.FC<NowPageProps> = ({ onBackClick }) => {
  useEffect(() => {
    soundFx.playMagic();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundFx.playClick();
        onBackClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackClick]);

  const handleClose = () => {
    soundFx.playClick();
    onBackClick();
  };

  return (
    <div className="adv-now-overlay" onClick={handleClose}>
      <div className="adv-now-window" onClick={(e) => e.stopPropagation()}>
        
        {/* Chunky 3D Close Push-Button */}
        <button
          className="adv-gui-close-btn"
          onClick={handleClose}
          aria-label="Close Living Chronolog (Escape)"
          title="Return to Street (ESC)"
        >
          <span className="close-btn-text">✕ ESC</span>
        </button>

        {/* Window Title Plaque */}
        <header className="adv-window-header">
          <div className="adv-header-plaque">
            <span className="plaque-sub">TEMPORAL LOG • WHAT I'M DOING NOW</span>
            <h1 className="plaque-title">The Chronolog</h1>
            <p className="plaque-desc">
              Inspired by Derek Sivers' <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer" className="adv-link">/now page movement</a>.
            </p>
          </div>
        </header>

        {/* Section 1: The Scribe's Current Focus Console */}
        <section className="adv-console-section">
          <div className="adv-section-badge">
            <span>ACTIVE QUESTS &amp; PURSUITS</span>
          </div>

          <div className="adv-console-body">
            <p>
              Hi there, Dhruv here! I'm a Software Developer with a deep-rooted interest in the mechanics of capital markets. I currently work at <strong>Goldman Sachs</strong>, where my present focus is on building AI tools, enterprise data systems, and cloud infrastructure.
            </p>
            <p>
              I have a serious love for puzzles of all kinds. Crosswords are a particular favorite—I’m aiming to beat my peak streak of <strong>355 days</strong> on the NYT Crossword. I also enjoy trivia and pop culture quizzes. Professionally, I’m constantly looking for opportunities to apply this problem-solving instinct toward challenging problems in the financial space, where the tail risks and stakes are high—as is the upside.
            </p>
            <p>
              Currently exploring new side projects and deepening my understanding of building resilient, intelligent systems that are maximally user-friendly. Striving to cultivate a knowledge base grounded in continuous learning, deliberate practice, and an appreciation for the subtle gears that make the world tick.
            </p>
          </div>
        </section>

        {/* Section 2: Library Bookshelf & Archive */}
        <section className="adv-library-section">
          <div className="adv-section-header">
            <h2 className="adv-section-title">Reading Archive</h2>
            <p className="adv-section-desc">Volumes collected, studied, and catalogued across disciplines.</p>
          </div>

          <div className="adv-category-list">
            {bookCategories.map((category) => {
              const booksInCategory = currentlyReading.filter(
                (book) => book.category === category
              );
              if (booksInCategory.length === 0) return null;

              return (
                <div key={category} className="adv-category-group">
                  
                  {/* Category Header Badge */}
                  <div className="adv-category-badge-row">
                    <span className="adv-category-badge">[{category.toUpperCase()}]</span>
                    <div className="adv-category-rule" />
                  </div>

                  {/* Books Grid */}
                  <div className="adv-books-grid">
                    {booksInCategory.map((book) => (
                      <article key={book.id} className="adv-book-card">
                        
                        {/* Book Cover */}
                        <div className="adv-book-cover-box">
                          <a
                            href={book.goodreads}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="adv-book-cover-link"
                            title={`View "${book.title}" on Goodreads`}
                            onClick={() => soundFx.playClick()}
                          >
                            <img
                              src={book.imageUrl}
                              alt={`Cover of ${book.title}`}
                              className="adv-book-cover-img"
                              loading="lazy"
                            />
                          </a>
                        </div>

                        {/* Book Details */}
                        <div className="adv-book-details">
                          <h3 className="adv-book-title">
                            <a
                              href={book.goodreads}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="adv-book-title-link"
                              onClick={() => soundFx.playClick()}
                            >
                              {book.title}
                            </a>
                          </h3>
                          <p className="adv-book-author">by {book.author}</p>

                          {book.rating && (
                            <div className="adv-book-rating">
                              <span className="rating-stars">{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</span>
                              <span className="rating-score">({book.rating}/5)</span>
                            </div>
                          )}

                          {book.thoughts && (
                            <div className="adv-book-marginalia">
                              <span className="marginalia-tag">NOTES:</span>
                              <p className="marginalia-p">{book.thoughts}</p>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NowPage;
