import React, { useState, useRef, useEffect } from "react";
import PixelArtCharacter from "./PixelArtCharacter";
import InteractiveSprite from "./InteractiveSprite";
import "../styles/GameEnvironment.css";

// Assets & Navigation Icons
import githubIcon from "../assets/github.png";
import linkedinIcon from "../assets/linkedin.png";
import nowIcon from "../assets/now.png";
import blogIcon from "../assets/blog.png";
import mailIcon from "../assets/mail.png";
import pixelSatchel from "../assets/pixel-satchel.png";

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
  description?: string;
}

interface FloorItem {
  id: string;
  label: string;
  icon: string;
  xPercent: number;
  pickedUp: boolean;
}

const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'blog', type: 'blog', label: 'Message Board', verbText: 'Examine Message Board (Go to Blog)', path: '/about', icon: blogIcon },
  { id: 'github', type: 'github', label: 'Code Scroll', verbText: 'Inspect Code Scroll (Go to GitHub)', path: '/projects', icon: githubIcon },
  { id: 'linkedin', type: 'linkedin', label: 'Network Journal', verbText: 'Open Network Journal (Go to LinkedIn)', path: '/linkedin', icon: linkedinIcon },
  { id: 'mail', type: 'mail', label: 'Golden Mailbox', verbText: 'Open Golden Mailbox (Contact / Email)', path: '/mail', icon: mailIcon },
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
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | FloorItem | { label: string; verbText: string } | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [characterSpeech, setCharacterSpeech] = useState<string | null>(null);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(DEFAULT_INVENTORY_ITEMS);

  // Mystic Hourglass resting naturally on the ground floor
  const [floorItem, setFloorItem] = useState<FloorItem>({
    id: 'now',
    label: 'Mystic Hourglass',
    icon: nowIcon,
    xPercent: 0.60,
    pickedUp: false
  });

  const [characterPosition, setCharacterPosition] = useState<Position>({
    x: window.innerWidth * 0.2,
    y: window.innerHeight - 175
  });

  const [walkTargetX, setWalkTargetX] = useState<number | null>(null);
  const [targetMarker, setTargetMarker] = useState<TargetMarker | null>(null);

  const characterPositionRef = useRef<Position>(characterPosition);
  const roadBoundariesRef = useRef(getRoadBoundaries());
  const pendingFloorPickupRef = useRef<boolean>(false);

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

  // Stage Floor Click -> Character walks to click location
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.satchel-transparent-btn') ||
      target.closest('.scumm-pouch-modal') ||
      target.closest('.ground-collectible-item') ||
      target.closest('.pixel-npc-container')
    ) {
      return;
    }

    const clickX = e.clientX;
    const clickY = Math.min(e.clientY, window.innerHeight - 140);

    setTargetMarker({ x: clickX, y: clickY, id: Date.now() });
    setWalkTargetX(clickX);
    pendingFloorPickupRef.current = false;

    setTimeout(() => {
      setTargetMarker(null);
    }, 900);
  };

  // Click floor collectible item -> Walk to item and pick it up!
  const handleFloorItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (floorItem.pickedUp) return;

    const currentX = characterPositionRef.current.x;
    const itemRawX = window.innerWidth * floorItem.xPercent;
    const stopXPos = currentX < itemRawX ? itemRawX - 60 : itemRawX + 60;

    pendingFloorPickupRef.current = true;
    setWalkTargetX(stopXPos);
    setTargetMarker({ x: itemRawX, y: window.innerHeight - 175, id: Date.now() });
  };

  // Arrival handler
  const handleArrival = () => {
    setWalkTargetX(null);
    setTargetMarker(null);

    if (pendingFloorPickupRef.current && !floorItem.pickedUp) {
      pendingFloorPickupRef.current = false;
      executePickUpItem();
    }
  };

  // Pick up floor item action
  const executePickUpItem = () => {
    setIsOpeningSatchel(true);
    setCharacterSpeech("Picked up the Mystic Hourglass!");

    setTimeout(() => {
      setIsOpeningSatchel(false);
      setFloorItem(prev => ({ ...prev, pickedUp: true }));

      const newItem: InventoryItem = {
        id: 'now',
        type: 'now',
        label: 'Mystic Hourglass',
        verbText: 'Look at Mystic Hourglass (Go to Now Page)',
        path: '/now',
        icon: nowIcon
      };
      setInventoryList(prev => [...prev, newItem]);
    }, 650);
  };

  // Satchel Pouch Open / Close
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
    }, 300);
  };

  const handleUseInventoryItem = (item: InventoryItem) => {
    setShowInventory(false);
    if (isInteracting) return;

    if (item.path) {
      executeNavigationInteraction(item.type, item.path);
    }
  };

  const executeNavigationInteraction = (type: InteractiveObject['type'], path: string) => {
    setActivePath(path);
    const spritePaths = spriteCollections[type] || [];
    const currentPos = {
      x: characterPositionRef.current.x,
      y: characterPositionRef.current.y
    };

    setShowCharacter(false);
    setIsInteracting(true);

    setInteractiveObjects([{
      type,
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
        setCharacterSpeech(null);
        onNavigate(destinationPath);
      }, 10);
    }
  };

  const statusLineText = hoveredItem
    ? ('verbText' in hoveredItem ? hoveredItem.verbText : `Pick up ${hoveredItem.label}`)
    : "Click floor to walk or open inventory satchel on bottom left";

  return (
    <div className="game-environment" onClick={handleStageClick}>
      {/* SCUMM Status Plaque at Top Center */}
      <div className="scumm-top-plaque">
        <span className="plaque-text">{statusLineText}</span>
      </div>

      {/* Borderless Transparent Satchel Button */}
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
              <span className="pouch-verb">
                {hoveredItem ? ('verbText' in hoveredItem ? hoveredItem.verbText : hoveredItem.label) : "Dhruv's Inventory"}
              </span>
              <button className="pouch-close-btn" onClick={() => setShowInventory(false)}>&times;</button>
            </div>

            <div className="pouch-grid">
              {inventoryList.map((item) => (
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

      {/* Background Stage */}
      <div className="parallax-layer layer-stage">
        <div className="cobblestone-path" />

        {/* Mystic Hourglass resting naturally on the ground */}
        {!floorItem.pickedUp && (
          <div
            className="ground-collectible-item"
            style={{ left: `${floorItem.xPercent * 100}%` }}
            onMouseEnter={() => setHoveredItem(floorItem)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={handleFloorItemClick}
          >
            <img src={floorItem.icon} alt={floorItem.label} className="ground-item-img" />
          </div>
        )}

        {/* Target Crosshair Marker */}
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

      {/* Character Render */}
      {showCharacter && !isInteracting && (
        <div className="character-container">
          <PixelArtCharacter
            position={characterPosition}
            targetX={walkTargetX}
            onArrival={handleArrival}
            onPositionUpdate={updateCharacterPosition}
            roadBoundaries={roadBoundariesRef.current}
            obstacles={[
              ...(!floorItem.pickedUp ? [{
                id: 'hourglass',
                left: window.innerWidth * floorItem.xPercent - 30,
                right: window.innerWidth * floorItem.xPercent + 30
              }] : [])
            ]}
            isOpeningSatchel={isOpeningSatchel}
            speechText={characterSpeech}
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