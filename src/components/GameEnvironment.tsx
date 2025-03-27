import React, { useState, useRef, useEffect } from "react";
import PixelArtCharacter from "./PixelArtCharacter";
import ActionBar from "./ActionBar";
import InteractiveSprite from "./InteractiveSprite";
import "../styles/GameEnvironment.css";

//interaction sprites
import githubSprite1 from "../assets/interactions/github-interaction.png";
import githubSprite2 from "../assets/interactions/github-interaction1.png";
import githubSprite3 from "../assets/interactions/github-interaction2.png";
import linkedinSprite1 from "../assets/interactions/linkedin-interaction.png";
import linkedinSprite2 from "../assets/interactions/linkedin-interaction1.png";
import linkedinSprite3 from "../assets/interactions/linkedin-interaction2.png";
import blogSprite1 from "../assets/interactions/blog-interaction.png";
import blogSprite2 from "../assets/interactions/blog-interaction1.png";
import blogSprite3 from "../assets/interactions/blog-interaction2.png";
import nowSprite1 from "../assets/interactions/now-interaction.png";
import nowSprite2 from "../assets/interactions/now-interaction1.png";
import nowSprite3 from "../assets/interactions/now-interaction2.png";
import nowSprite4 from "../assets/interactions/now-interaction3.png";
import mailSprite1 from "../assets/interactions/mail-interaction.png";
import mailSprite2 from "../assets/interactions/mail-interaction1.png";
import mailSprite3 from "../assets/interactions/mail-interaction2.png";

interface GameEnvironmentProps {
  onNavigate: (path: string) => void;
}

interface InteractiveObject {
  type: 'github' | 'linkedin' | 'blog' | 'now' | 'mail' | 'unknown';
  position: { x: number; y: number };
  isInteracting: boolean;
  spritePaths: string[];
}

interface Position {
  x: number;
  y: number;
}

const GameEnvironment: React.FC<GameEnvironmentProps> = ({ onNavigate }) => {
  const [showCharacter, setShowCharacter] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactiveObjects, setInteractiveObjects] = useState<InteractiveObject[]>([]);
  const [activeButton, setActiveButton] = useState<HTMLDivElement | null>(null);
  const [characterPosition, setCharacterPosition] = useState<Position>({
    x: window.innerWidth * 0.2,
    y: window.innerHeight - 130
  });
  
  // Ref to keep track of character position
  const characterPositionRef = useRef<Position>(characterPosition);
  
 
  const spriteCollections = {
    github: [githubSprite1, githubSprite2, githubSprite3],
    linkedin: [linkedinSprite1, linkedinSprite2, linkedinSprite3],
    blog: [blogSprite1, blogSprite2, blogSprite3],
    now: [nowSprite1, nowSprite2, nowSprite3,nowSprite4],
    mail: [mailSprite1, mailSprite2, mailSprite3],
    unknown: []
  };

  
  const updateCharacterPosition = (position: Position) => {
    setCharacterPosition(position);
    characterPositionRef.current = position; // Update the ref with the latest position
  };
  
  const handleButtonClick = (path: string, buttonElement: HTMLDivElement) => {
    
    if (isInteracting) return;
    
    console.log("Button clicked:", path);
    setActiveButton(buttonElement);

    
    buttonElement.classList.add("deformed");
    setTimeout(() => {
      buttonElement.classList.remove("deformed");
    }, 300);

    let type: InteractiveObject['type'] = 'unknown';
    if (path === '/projects') {
      type = 'github';
    } else if (path === '/about') {
      type = 'blog';
    }
    else if (path === '/linkedin') {
      type = 'linkedin';
    }
    else if (path === '/now') {
      type = 'now';
    }
    else if (path === '/mail') {
      type = 'mail';
    }

    
    
    const spritePaths = spriteCollections[type];

    
    setShowCharacter(false);
    setIsInteracting(true);
    
    
    console.log("Character position for interaction:", characterPositionRef.current);
    
    setInteractiveObjects([{
      type,
      position: {
        x: characterPositionRef.current.x,
        y: characterPositionRef.current.y
      },
      isInteracting: true,
      spritePaths
    }]);
  };

  const handleInteractionComplete = () => {
    console.log("Interaction complete");
    
    
    const path = activeButton?.getAttribute("data-path");
    if (path) {
      setTimeout(() => {
        setInteractiveObjects([]);
        setIsInteracting(false);
        setShowCharacter(true);
        onNavigate(path);
        setActiveButton(null);
      }, 10);
    }
  };

  return (
    <div className="game-environment">
      {}
      {showCharacter && !isInteracting && (
        <div className="character-container">
          <PixelArtCharacter
            selectedLink={null}
            position={characterPosition} 
            onJump={() => {}}
            onPositionUpdate={updateCharacterPosition}
          />
        </div>
      )}
      
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
      
      <div className="action-bar-container">
        <ActionBar onButtonClick={handleButtonClick} />
      </div>
    </div>
  );
};

export default GameEnvironment;