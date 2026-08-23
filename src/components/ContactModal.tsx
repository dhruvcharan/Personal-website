import React, { useEffect } from 'react';
import profilePicture from '../assets/me.jpeg';
import { soundFx } from '../utils/audio';
import '../styles/ContactModal.css';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  useEffect(() => {
    soundFx.playMagic();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundFx.playClick();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleClose = () => {
    soundFx.playClick();
    onClose();
  };

  const myEmail = 'dhruvcharan222@gmail.com';
  const myResumeGoogleDriveLink = 'https://drive.google.com/file/d/1OynAWxb7mHDj1NOKyzATWUiHxHFppd3T/view?usp=sharing';

  return (
    <div className="adv-contact-overlay" onClick={handleClose}>
      <div className="adv-contact-window" onClick={(e) => e.stopPropagation()}>
        
        {/* Chunky 3D Close Push-Button */}
        <button
          className="adv-gui-close-btn"
          onClick={handleClose}
          aria-label="Close Dossier (Escape)"
          title="Return to Street (ESC)"
        >
          <span className="close-btn-text">✕ ESC</span>
        </button>

        {/* Header with Photo & Title */}
        <header className="adv-dossier-header">
          <div className="adv-dossier-tag">
            <span>ADVENTURER DOSSIER &amp; REGISTRY</span>
          </div>

          <div className="adv-portrait-box">
            <img
              src={profilePicture}
              alt="Dhruv Charan"
              className="adv-portrait-img"
            />
          </div>

          <h1 className="adv-dossier-name">Dhruv Charan</h1>
          <p className="adv-dossier-role">Software Developer • Capital Markets &amp; Distributed Systems</p>
        </header>

        {/* Etched Motto */}
        <blockquote className="adv-dossier-motto">
          <p className="motto-text">
            “When you don't create things, you become defined by your tastes rather than ability. Your tastes only narrow &amp; exclude people. So create.”
          </p>
          <footer className="motto-author">— _why the lucky stiff</footer>
        </blockquote>

        {/* Bio Panel */}
        <div className="adv-dossier-bio">
          <p>
            I’m Dhruv Charan, a 26-year-old Software Developer at <strong>Goldman Sachs</strong>.
            Previously, I worked as a Software Development Engineer at <strong>Amazon</strong> and later built developer products as a Product Engineer at <strong>Kombai.io</strong>.
          </p>
          <p>
            Today, I am deeply invested in financial systems, algorithmic workflows, and cloud data architecture. I am actively exploring opportunities to combine my passion for finance and technology—parlaying my experience and skills into roles that interface with the core plumbing of modern capital markets in a meaningful way.
          </p>
        </div>

        {/* 3D Action Push-Buttons */}
        <div className="adv-dossier-actions">
          <a
            href={myResumeGoogleDriveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="adv-3d-action-btn"
            onClick={() => soundFx.playClick()}
          >
            <span className="action-btn-icon">📜</span>
            <div className="action-btn-text">
              <span className="action-btn-heading">CURRICULUM VITAE</span>
              <span className="action-btn-sub">Inspect Resume &amp; Credentials ☞</span>
            </div>
          </a>

          <a
            href={`mailto:${myEmail}`}
            className="adv-3d-action-btn"
            onClick={() => soundFx.playClick()}
          >
            <span className="action-btn-icon">🕊️</span>
            <div className="action-btn-text">
              <span className="action-btn-heading">DISPATCH EMAIL</span>
              <span className="action-btn-sub">{myEmail} ☞</span>
            </div>
          </a>
        </div>

        {/* External Portals Bar */}
        <footer className="adv-dossier-portals">
          <span className="portals-title">EXTERNAL ARCHIVES:</span>
          <div className="portals-links">
            <a
              href="https://github.com/dhruvcharan"
              target="_blank"
              rel="noopener noreferrer"
              className="portal-link-btn"
              onClick={() => soundFx.playClick()}
            >
              <i className="fab fa-github"></i> GitHub Archive
            </a>
            <span className="portal-pip">✦</span>
            <a
              href="https://linkedin.com/in/dhruv-charan"
              target="_blank"
              rel="noopener noreferrer"
              className="portal-link-btn"
              onClick={() => soundFx.playClick()}
            >
              <i className="fab fa-linkedin"></i> LinkedIn Phonebook
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ContactModal;
