import React from "react";
import { currentlyReading, bookCategories, Book } from "./book_data";
import "../styles/NowPage.css";

interface NowPageProps {
  onBackClick: () => void;
  onClose?: () => void;
}

const NowPage: React.FC<NowPageProps> = ({ onBackClick, onClose }) => {
  return (
    <div className="now-page-overlay" onClick={onClose}>
      {}
      <div className="now-page-content" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className="page-close-button" onClick={onClose}>
            &times; {}
          </button>
        )}

        <h1 className="now-page-title">What I Am Currently Up To</h1>

        <section className="personal-updates">
          <h2>Right Now...</h2>
          <p>
            Inspired by the{" "}
            <a
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
            >
              /now page movement
            </a>
            .
          </p>
          <p>
            Hi there, Dhruv here! I'm a Software Developer with a deep-rooted interest in the mechanics of capital markets. I currently work at Goldman Sachs, where my present focus is on building AI tools, data migration and ingestion pipelines in the cloud, and a few other interesting projects.
          </p>
          <p>
            I have a serious love for puzzles of all kinds. Crosswords are a particular
            favorite, I’m hoping to beat my peak streak of 355. I also enjoy
            trivia and pop culture quizzes. Professionally, I’m looking for
            opportunities to apply this problem-solving instinct toward
            challenging problems in the financial space, where the tail risks and stakes are high—as is the upside.
          </p>
          <p>
            Currently working on a couple of side projects and looking to learn
            more about building resilient, intelligent systems that are maximally
            user-friendly. Striving to build a knowledge base on a foundation of
            continuous learning, growth, and an appreciation for the things
            that make the world tick.
          </p>
        </section>

        {}
        <h2 className="reading-section-title">Currently Reading</h2>
        <p className="now-page-description">
          {" "}
          A peek into the books currently occupying my attention.
        </p>

        {}
        <div className="book-categories-container">
          {bookCategories.map((category) => {
            const booksInCategory = currentlyReading.filter(
              (book) => book.category === category,
            );
            if (booksInCategory.length === 0) return null;

            return (
              <section key={category} className="book-category">
                {}
                <h3 className="book-category-title">{category}</h3>
                {}
                <div className="book-list">
                  {booksInCategory.map((book) => (
                    <div key={book.id} className="book-item">
                      {}
                      <div className="book-cover-container">
                        <a
                          href={book.goodreads}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`View "${book.title}" on Goodreads`}
                        >
                          <img
                            src={book.imageUrl}
                            alt={`Cover of ${book.title}`}
                            className="book-cover"
                          />
                        </a>
                      </div>
                      {}
                      <div className="book-details">
                        {}
                        <h4 className="book-title">
                          <a
                            href={book.goodreads}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`View "${book.title}" on Goodreads`}
                          >
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
                          <p className="book-rating">
                            My Rating: {"★".repeat(book.rating)}
                            {"☆".repeat(5 - book.rating)} ({book.rating}/5)
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NowPage;
