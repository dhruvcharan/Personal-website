import React, { useEffect, useState } from 'react';
import '../styles/ContactModal.css';
import profilePicture from '../assets/me.jpeg'; // Update with your actual image path

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    }
  }
    , []);

  const myEmail = 'dhruvcharan222@gmail.com';
  const myResumeGoogleDriveLink = 'https://drive.google.com/file/d/1OynAWxb7mHDj1NOKyzATWUiHxHFppd3T/view?usp=sharing';

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div
        className="contact-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="contact-modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div className="profile-image-container">
          <img
            src={profilePicture}
            alt="Dhruv Charan"
            className="profile-image"
          />
        </div>
        <h2> About Me </h2>
        <blockquote className="personal-quote">
          "when you don't create things, you become defined by your tastes rather than ability. your tastes only narrow & exclude people. so create.
          -"_why
        </blockquote>
        <p>
          I’m Dhruv Charan, a 26yo Software Developer at Goldman Sachs.
          I spent a few years as a Software Development
          Engineer at Amazon and later dabbled in the startup world as a
          Product Engineer at Kombai.io. Now, I am deeply invested in financial systems and
          actively exploring opportunities to combine my passion for finance and technology and parlay
          my experience and skills into a role that interfaces with the core plumbing of modern markets in a
          meaningful way.
        </p>
        <div className="modal-section">
          <h3> Resume</h3>
          <a
            href={myResumeGoogleDriveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-link"
          >
            View My Resume
          </a>
        </div>
        <div className="modal-section">
          <h3> Get in touch</h3>
          <a href={`mailto:${myEmail}`} className="modal-link">
            <i className="fas fa-envelope"></i> {myEmail}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
