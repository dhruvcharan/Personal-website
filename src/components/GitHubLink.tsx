import React from 'react';
import '../styles/GitHubLink.css';

interface GitHubLinkProps {
    onClick: () => void;
}

const GitHubLink: React.FC<GitHubLinkProps> = ({onClick}) => {
    return (
        <button className="github-link" onClick={onClick}>
            GitHub
        </button>
    );
};

export default GitHubLink;