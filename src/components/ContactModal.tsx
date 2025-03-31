import React, {useEffect, useState} from 'react';
import '../styles/ContactModal.css';
import profilePicture from '../assets/me.jpeg'; // Update with your actual image path

interface ContactModalProps {
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({onClose}) => {

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
          <p>
            I’m Dhruv Charan—a 25-year-old CS grad student at Stony Brook
            University. I’ve spent a few years as a Software Development
            Engineer at Amazon and later dabbled in the startup world as a
            Product Engineer at Kombai.io. Right now, I’m on the lookout for
            full-time opportunities where I can put my analytical and
            programming skills to work in a fast-paced, ever-evolving
            environment. Want to know what I’m up to these days? Check out my
            Now page!
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