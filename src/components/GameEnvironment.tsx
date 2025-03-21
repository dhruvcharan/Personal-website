import React, { useState, useEffect } from "react";
import PixelArtCharacter from "./PixelArtCharacter";
import ActionBar from "./ActionBar";
import InteractiveSprite from "./InteractiveSprite";
import "../styles/GameEnvironment.css";

// Import the interaction sprites for github (repeat similar imports for linkedin and blog)
import githubSprite1 from "../assets/interactions/github-interaction.png";
import githubSprite2 from "../assets/interactions/github-interaction1.png";
import githubSprite3 from "../assets/interactions/github-interaction2.png";
import linkedinSprite1 from "../assets/interactions/linkedin-interaction.png";
import linkedinSprite2 from "../assets/interactions/linkedin-interaction1.png";
import linkedinSprite3 from "../assets/interactions/linkedin-interaction2.png";
import blogSprite1 from "../assets/interactions/blog-interaction.png";
import blogSprite2 from "../assets/interactions/blog-interaction1.png";
import blogSprite3 from "../assets/interactions/blog-interaction2.png";

interface GameEnvironmentProps {
  onNavigate: (path: string) => void;
}

interface InteractiveObject {
  type: 'github' | 'linkedin' | 'blog';
  position: { x: number; y: number };
  isInteracting: boolean;
  spritePaths: string[];
}

const GameEnvironment: React.FC<GameEnvironmentProps> = ({ onNavigate }) => {
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [activeButton, setActiveButton] = useState<HTMLDivElement | null>(null);
  const [interactiveObjects, setInteractiveObjects] = useState<InteractiveObject[]>([]);
  const [showCharacter, setShowCharacter] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  // Define sprite collections
  const spriteCollections = {
    github: [githubSprite1, githubSprite2, githubSprite3],
    linkedin: [linkedinSprite1, linkedinSprite2, linkedinSprite3],
    blog: [blogSprite1, blogSprite2, blogSprite3]
  };

  const handleButtonClick = (path: string, buttonElement: HTMLDivElement) => {
    // Only allow button clicks if not currently in an interaction
    if (isInteracting) return;
    
    console.log("Button clicked:", path);
    const rect = buttonElement.getBoundingClientRect();
    setButtonPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setActiveButton(buttonElement);
    setSelectedLink(path);

    // Create interactive object based on path
    const type = path === '/projects' ? 'github' : 
                 path === '/contact' ? 'linkedin' : 'blog';
    
    // Get the appropriate sprite collection based on type
    const spritePaths = spriteCollections[type];

    // Clear any existing interactive objects first
    setInteractiveObjects([{
      type,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      },
      isInteracting: false,
      spritePaths
    }]);
  };

  const handleCharacterJump = () => {
    console.log("Character jumped near button");
    if (activeButton && !isInteracting) {
      activeButton.classList.add("deformed");

      setTimeout(() => {
        activeButton.classList.remove("deformed");
      }, 300);

      const path = activeButton.getAttribute("data-path");
      console.log("Active button path:", path);
      if (path) {
        // Set interaction state to true to prevent multiple interactions
        setIsInteracting(true);
        
        // Hide the character when interaction starts
        setShowCharacter(false);
        
        // Start interaction with the corresponding object
        setInteractiveObjects(prev => prev.map(obj => ({
          ...obj,
          isInteracting: true
        })));
      }
    }
  };

  const handleInteractionComplete = () => {
    console.log("Interaction complete");
    
    // Navigate to the appropriate page after a short delay
    const path = activeButton?.getAttribute("data-path");
    if (path) {
      setTimeout(() => {
        // Clean up all state before navigating
        setInteractiveObjects([]);
        setIsInteracting(false);
        setShowCharacter(true);
        onNavigate(path);
        setSelectedLink(null);
        setButtonPosition(null);
        setActiveButton(null);
      }, 500);
    }
  };

  return (
    <div className="game-environment">
      {/* Only render character if showCharacter is true AND not in interaction mode */}
      {showCharacter && !isInteracting && (
        <div className="character-container">
          <PixelArtCharacter
            selectedLink={selectedLink}
            position={buttonPosition || { x: 50, y: 0 }}
            onJump={handleCharacterJump}
            interactiveObjects={[]} // We're now handling the interactive objects here, not in PixelArtCharacter
            onInteractionComplete={handleInteractionComplete}
          />
        </div>
      )}
      
      {/* Render interactive sprites at the game environment level */}
      {interactiveObjects.map((obj, index) => (
        <InteractiveSprite
          key={`${obj.type}-${index}`}
          type={obj.type}
          position={obj.position}
          isInteracting={obj.isInteracting}
          spritePaths={obj.spritePaths}
          onInteractionComplete={handleInteractionComplete}
        />
      ))}
      
      <ActionBar onButtonClick={handleButtonClick} />
    </div>
  );
};

export default GameEnvironment;