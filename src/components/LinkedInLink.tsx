import React from 'react';
import '../styles/LinkedInLink.css';

interface LinkedInLinkProps {
    onClick: () => void;
}

const LinkedInLink: React.FC<LinkedInLinkProps> = ({ onClick }) => {
    return (
        <button className="linkedin-link" onClick={onClick}>
            LinkedIn
        </button>
    );
};

export default LinkedInLink;