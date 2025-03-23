import React from "react";
import "../styles/ActionBar.css";
import githubIcon from "../assets/github.png";
import linkedinIcon from "../assets/linkedin.png";
import blogIcon from "../assets/blog.png";

interface ActionBarProps {
  onButtonClick: (path: string, buttonElement: HTMLDivElement) => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ onButtonClick }) => {
  const actions = [
    { label: "Blog", path: "/about", icon: blogIcon },
    { label: "GitHub", path: "/projects", icon: githubIcon },
    { label: "LinkedIn", path: "/contact", icon: linkedinIcon },
  ];

  return (
    <div className="action-bar">
      {actions.map((action, index) => (
        <div
          key={action.path}
          className="action-item"
          data-path={action.path}
          onClick={(e) => onButtonClick(action.path, e.currentTarget)}
          style={{
            position: "absolute",
            left: `${(index + 1) * 25}%`,
            transform: "translateX(-50%)",
          }}
        >
          <img src={action.icon} alt={action.label} className="action-icon" />
          <span>{action.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ActionBar;

