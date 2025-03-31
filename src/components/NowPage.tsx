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
            I am Dhruv a 25yo about to graduate CS Grad Student at Stony Brook
            University. I spent a few years working as a Software Development
            Engineer at Amazon, followed by a role as a Product Engineer at
            Kombai.io. Open to Full Time Opportunities. My primary areas of
            technical competence and interests lie in the broad field of MLOps
            and Devops.
          </p>
          <p>
            I have a deep love for puzzles of all kinds and get an unreasonable
            amount of joy from solving them. Crosswords are a particular
            favorite—I’m hoping to beat my peak streak of 355. I also enjoy
            trivia and pop culture quizzes. Professionally, I’m looking for
            opportunities where I can apply this problem-solving instinct,
            tackling interesting and complex challenges with code and
            infrastructure expertise. Beyond that, I’m an avid reader, aiming to
            finish 100 books this year with a balanced mix of technical,
            leisure, and nonfiction reads
          </p>
          <p>
            Currently working on a couple of side Projects and looking to learn
            more about building resilient intelligent systems that are maximally
            user-friendly. Striving to build a knowledge base on a foundation of
            continuous learning and growth and a deep apprfrom app import
            Appeciation for the things that make the world tick.
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

