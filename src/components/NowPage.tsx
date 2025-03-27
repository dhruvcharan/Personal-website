import React from "react";
import { currentlyReading, bookCategories, Book } from "./book_data";
import "../styles/NowPage.css";

interface NowPageProps {
    onBackClick: () => void;
    onClose?: () => void;
}

const NowPage   : React.FC<NowPageProps> = ({ onBackClick, onClose }) => {
    console.log("Now Rendering");
    console.log("Data:", currentlyReading);
    return (
        
        <div className="now-page-overlay" onClick={onClose}>
          {}
          <div className="now-page-content" onClick={e => e.stopPropagation()}>
            
            {onClose && (
              <button className="page-close-button" onClick={onClose}>
                &times; {}
              </button>
            )}
    
            <h1 className="now-page-title">What I Am Currently Up To</h1>
    
    
            <section className="personal-updates">
              <h2>Right Now...</h2>
              <p>
               
              </p>
              <p>
               
              </p>
            </section>
    
            
    
            {}
            <h2 className="reading-section-title">Currently Reading</h2>
            <p className="now-page-description"> {/* Intro text moved closer to the relevant section */}
              A peek into the pages currently occupying my attention.
              Inspired by the <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer">/now page movement</a>.
            </p>
    
            {}
            <div className="book-categories-container">
              {bookCategories.map(category => {
                const booksInCategory = currentlyReading.filter(book => book.category === category);
                if (booksInCategory.length === 0) return null;
    
                return (
                  <section key={category} className="book-category">
                    {}
                    <h3 className="book-category-title">{category}</h3>
                    {}
                    <div className="book-list">
                      {booksInCategory.map(book => (
                        <div key={book.id} className="book-item">
                          {}
                          <div className="book-cover-container">
                            <a href={book.goodreads} target="_blank" rel="noopener noreferrer" title={`View "${book.title}" on Goodreads`}>
                              <img src={book.imageUrl} alt={`Cover of ${book.title}`} className="book-cover" />
                            </a>
                          </div>
                          {}
                          <div className="book-details">
                            {}
                            <h4 className="book-title">
                               <a href={book.goodreads} target="_blank" rel="noopener noreferrer" title={`View "${book.title}" on Goodreads`}>
                                  {book.title}
                               </a>
                            </h4>
                            {}
                            <p className="book-author">by {book.author}</p>
                            {}
                            {book.thoughts && ( 
                              <p className="book-notes">{book.thoughts}</p>
                            )}
                             {}
                            {book.rating && (
                                <p className="book-rating">My Rating: {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)} ({book.rating}/5)</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div> {}
          </div> {}
        </div> 
      );
    };
    
    export default NowPage;