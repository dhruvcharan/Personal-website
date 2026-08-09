import React, { useState, useRef, useEffect } from "react";
import PixelArtCharacter from "./PixelArtCharacter";
import InteractiveSprite from "./InteractiveSprite";
import "../styles/GameEnvironment.css";

// Assets & Interaction Sprites
import githubIcon from "../assets/github.png";
import linkedinIcon from "../assets/linkedin.png";
import nowIcon from "../assets/now.png";
import blogIcon from "../assets/blog.png";
import mailIcon from "../assets/mail.png";
import pixelSatchel from "../assets/pixel-satchel.png";
import interactSprite from "../assets/interact.png";
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

interface TargetMarker {
  x: number;
  y: number;
  id: number;
}

interface InventoryItem {
  id: string;
  type: InteractiveObject['type'];
  label: string;
  verbText: string;
  path: string;
  icon: string;
}

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'blog', type: 'blog', label: 'Message Board', verbText: 'Examine Message Board (Go to Blog)', path: '/about', icon: blogIcon },
  { id: 'github', type: 'github', label: 'Code Scroll', verbText: 'Read Code Scroll (Go to GitHub)', path: '/projects', icon: githubIcon },
  { id: 'linkedin', type: 'linkedin', label: 'Network Journal', verbText: 'Open Network Journal (Go to LinkedIn)', path: '/linkedin', icon: linkedinIcon },
  { id: 'now', type: 'now', label: 'Hourglass', verbText: 'Look at Hourglass (Go to Now Page)', path: '/now', icon: nowIcon },
  { id: 'mail', type: 'mail', label: 'Mailbox', verbText: 'Open Mailbox (Contact / Email)', path: '/mail', icon: mailIcon },
];

const getRoadBoundaries = () => {
  const windowWidth = window.innerWidth;
  return {
    left: windowWidth * 0.05,
    right: windowWidth * 0.92
  };
};

const GameEnvironment: React.FC<GameEnvironmentProps> = ({ onNavigate }) => {
  const [showCharacter, setShowCharacter] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactiveObjects, setInteractiveObjects] = useState<InteractiveObject[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [isOpeningSatchel, setIsOpeningSatchel] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);

  const [characterPosition, setCharacterPosition] = useState<Position>({
    x: window.innerWidth * 0.2,
    y: window.innerHeight - 175
  });

  const [walkTargetX, setWalkTargetX] = useState<number | null>(null);
  const [targetMarker, setTargetMarker] = useState<TargetMarker | null>(null);

  const characterPositionRef = useRef<Position>(characterPosition);
  const roadBoundariesRef = useRef(getRoadBoundaries());

  const spriteCollections = {
    github: [githubSprite1, githubSprite2, githubSprite3],
    linkedin: [linkedinSprite1, linkedinSprite2, linkedinSprite3],
    blog: [blogSprite1, blogSprite2, blogSprite3],
    now: [nowSprite1, nowSprite2, nowSprite3, nowSprite4],
    mail: [mailSprite1, mailSprite2, mailSprite3],
    unknown: []
  };

  useEffect(() => {
    const handleResize = () => {
      roadBoundariesRef.current = getRoadBoundaries();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateCharacterPosition = (pos: Position) => {
    setCharacterPosition(pos);
    characterPositionRef.current = pos;
  };

  // Click anywhere on stage floor -> Character walks to click location
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.satchel-transparent-btn') || target.closest('.scumm-pouch-modal')) {
      return;
    }

    const clickX = e.clientX;
    const clickY = Math.min(e.clientY, window.innerHeight - 140);

    setTargetMarker({ x: clickX, y: clickY, id: Date.now() });
    setWalkTargetX(clickX);

    setTimeout(() => {
      setTargetMarker(null);
    }, 1000);
  };

  // Satchel Click -> Plays Character Reach Into Satchel Animation -> Opens Inventory
  const handleSatchelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showInventory) {
      setShowInventory(false);
      setIsOpeningSatchel(false);
      return;
    }

    setIsOpeningSatchel(true);
    setTimeout(() => {
      setIsOpeningSatchel(false);
      setShowInventory(true);
    }, 350);
  };

  // Trigger Inventory Item Interaction
  const handleUseInventoryItem = (item: InventoryItem) => {
    setShowInventory(false);
    if (isInteracting) return;

    setActivePath(item.path);
    const spritePaths = spriteCollections[item.type] || [];
    const currentPos = {
      x: characterPositionRef.current.x,
      y: characterPositionRef.current.y
    };

    setShowCharacter(false);
    setIsInteracting(true);

    setInteractiveObjects([{
      type: item.type,
      position: currentPos,
      isInteracting: true,
      spritePaths
    }]);
  };

  const handleInteractionComplete = () => {
    if (activePath) {
      const destinationPath = activePath;
      setTimeout(() => {
        setInteractiveObjects([]);
        setIsInteracting(false);
        setShowCharacter(true);
        setActivePath(null);
        onNavigate(destinationPath);
      }, 10);
    }
  };

  const statusLineText = hoveredItem
    ? hoveredItem.verbText
    : "Look at inventory on bottom left to navigate to links or click to move around";

  return (
    <div className="game-environment" onClick={handleStageClick}>
      {/* SCUMM Status Plaque at Top Center */}
      <div className="scumm-top-plaque">
        <span className="plaque-text">{statusLineText}</span>
      </div>

      {/* Borderless Transparent Satchel Icon Button */}
      <button
        className="satchel-transparent-btn"
        onClick={handleSatchelClick}
      >
        <span className="satchel-hover-tooltip">INVENTORY</span>
        <img src={pixelSatchel} alt="Inventory Satchel" className="satchel-pixel-img" />
      </button>

      {/* Retro Inventory Window */}
      {showInventory && (
        <div className="scumm-pouch-overlay" onClick={() => setShowInventory(false)}>
          <div className="scumm-pouch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pouch-header">
              <span className="pouch-verb">{hoveredItem ? hoveredItem.verbText : "Dhruv's Inventory"}</span>
              <button className="pouch-close-btn" onClick={() => setShowInventory(false)}>&times;</button>
            </div>

            <div className="pouch-grid">
              {INVENTORY_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="pouch-slot"
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleUseInventoryItem(item)}
                >
                  <img src={item.icon} alt={item.label} className="pouch-item-img" />
                  <span className="pouch-item-name">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Background Stage - 100% Clean & Unobstructed */}
      <div className="parallax-layer layer-stage">
        <div className="cobblestone-path" />

        {/* Target Crosshair Marker ("X Marks the Spot") */}
        {targetMarker && (
          <div
            className="target-crosshair"
            style={{ left: `${targetMarker.x}px`, top: `${targetMarker.y}px` }}
          >
            <div className="crosshair-x">✕</div>
            <div className="crosshair-ring" />
          </div>
        )}
      </div>

      {/* Character Render - Fully Visible & Unobscured */}
      {showCharacter && !isInteracting && (
        <div className="character-container">
          <PixelArtCharacter
            position={characterPosition}
            targetX={walkTargetX}
            onArrival={() => setWalkTargetX(null)}
            onPositionUpdate={updateCharacterPosition}
            roadBoundaries={roadBoundariesRef.current}
            isOpeningSatchel={isOpeningSatchel}
          />
        </div>
      )}

      {/* Interaction Sprites */}
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
    </div>
  );
};

export default GameEnvironment;