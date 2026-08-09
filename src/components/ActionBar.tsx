import React from "react";
import "../styles/ActionBar.css";
import githubIcon from "../assets/github.png";
import linkedinIcon from "../assets/linkedin.png";
import nowIcon from "../assets/now.png";
import blogIcon from "../assets/blog.png";
import mailIcon from "../assets/mail.png";

interface ActionBarProps {
  onButtonClick: (path: string, buttonElement: HTMLDivElement) => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ onButtonClick }) => {
  const actions = [
    { label: "Blog", path: "/about", icon: blogIcon },
    { label: "GitHub", path: "/projects", icon: githubIcon },
    { label: "LinkedIn", path: "/linkedin", icon: linkedinIcon },
    { label: "Now", path: "/now", icon: nowIcon },
    { label: "Mail", path: "/mail", icon: mailIcon },
  ];

  return (
    <div className="action-bar-container">
      <div className="action-bar">
        {actions.map((action) => (
          <div
            key={action.path}
            className="action-item signposted"
            data-path={action.path}
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick(action.path, e.currentTarget);
            }}
          >
            <img src={action.icon} alt={action.label} className="action-icon" />
            <span className="signpost-label">{action.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionBar;

