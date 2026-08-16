import React, { useState, useRef, useEffect } from "react";
import PixelArtCharacter from "./PixelArtCharacter";
import InteractiveSprite from "./InteractiveSprite";
import ScholarNpc from "./ScholarNpc";
import DialogueMenu from "./DialogueMenu";
import InteractionWheel, { InteractiveTarget, VerbType } from "./InteractionWheel";
import { DialogueOption } from "../data/dialogueData";
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
  { id: 'linkedin', type: 'linkedin', label: 'Phonebook', verbText: 'Open Phonebook (Go to LinkedIn)', path: '/linkedin', icon: linkedinIcon },
  { id: 'mail', type: 'mail', label: 'Mailbox', verbText: 'Open Mailbox (Contact / Email)', path: '/mail', icon: mailIcon },
];

const getRoadBoundaries = () => {
  const windowWidth = window.innerWidth;
  return {
    left: windowWidth * 0.05,
    right: windowWidth * 0.92
  };
};

const SCHOLAR_X_PERCENT = 0.80;
const PROXIMITY_THRESHOLD = 130;

const GameEnvironment: React.FC<GameEnvironmentProps> = ({ onNavigate }) => {
  const [showCharacter, setShowCharacter] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactiveObjects, setInteractiveObjects] = useState<InteractiveObject[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [isOpeningSatchel, setIsOpeningSatchel] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | FloorItem | { label: string; verbText: string } | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [characterSpeech, setCharacterSpeech] = useState<string | null>(null);
  const [scholarSpeech, setScholarSpeech] = useState<string | null>(null);
  const [showDialogueMenu, setShowDialogueMenu] = useState(false);
  const [isSpeakingDialogue, setIsSpeakingDialogue] = useState(false);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(DEFAULT_INVENTORY_ITEMS);
  const [activeWheel, setActiveWheel] = useState<{
    position: { x: number; y: number };
    target: InteractiveTarget;
  } | null>(null);
  const [wheelHoveredVerbText, setWheelHoveredVerbText] = useState<string | null>(null);

  // Hourglass resting naturally on the ground floor
  const [floorItem, setFloorItem] = useState<FloorItem>({
    id: 'now',
    label: 'Hourglass',
    icon: nowIcon,
    xPercent: 0.55,
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
  const pendingScholarTalkRef = useRef<boolean>(false);
  const dialogueTimerRef = useRef<NodeJS.Timeout | null>(null);

  const speakAsCharacter = (text: string | null) => {
    setScholarSpeech(null);
    setCharacterSpeech(text);
  };

  const speakAsScholar = (text: string | null) => {
    setCharacterSpeech(null);
    setScholarSpeech(text);
  };

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

    // Automatically close dialogue menu if the player walks away from the NPC
    const scholarRawX = window.innerWidth * SCHOLAR_X_PERCENT;
    if (showDialogueMenu && Math.abs(pos.x - scholarRawX) > PROXIMITY_THRESHOLD + 40) {
      setShowDialogueMenu(false);
    }
  };

  // Stage Floor Click -> Character walks to click location
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.satchel-transparent-btn') ||
      target.closest('.scumm-pouch-modal') ||
      target.closest('.ground-collectible-item') ||
      target.closest('.scholar-npc-container') ||
      target.closest('.scumm-dialogue-box')
    ) {
      return;
    }

    const clickX = e.clientX;
    const clickY = Math.min(e.clientY, window.innerHeight - 140);

    setTargetMarker({ x: clickX, y: clickY, id: Date.now() });
    setWalkTargetX(clickX);
    pendingFloorPickupRef.current = false;
    pendingScholarTalkRef.current = false;
    setShowDialogueMenu(false);

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
    pendingScholarTalkRef.current = false;
    setShowDialogueMenu(false);
    setWalkTargetX(stopXPos);
    setTargetMarker({ x: itemRawX, y: window.innerHeight - 175, id: Date.now() });
  };

  // Click Scholar NPC -> Walk over and only open dialogue upon reaching proximity!
  const handleScholarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentX = characterPositionRef.current.x;
    const scholarRawX = window.innerWidth * SCHOLAR_X_PERCENT;
    const distance = Math.abs(currentX - scholarRawX);

    if (distance <= PROXIMITY_THRESHOLD) {
      // Already right next to NPC
      setShowDialogueMenu(true);
      pendingScholarTalkRef.current = false;
    } else {
      // Walk over to NPC first
      const stopXPos = currentX < scholarRawX ? scholarRawX - 85 : scholarRawX + 85;
      pendingScholarTalkRef.current = true;
      pendingFloorPickupRef.current = false;
      setShowDialogueMenu(false);
      setWalkTargetX(stopXPos);
      setTargetMarker({ x: scholarRawX, y: window.innerHeight - 175, id: Date.now() });
    }
  };

  // Arrival handler
  const handleArrival = () => {
    setWalkTargetX(null);
    setTargetMarker(null);

    const currentX = characterPositionRef.current.x;
    const scholarRawX = window.innerWidth * SCHOLAR_X_PERCENT;

    if (pendingFloorPickupRef.current && !floorItem.pickedUp) {
      pendingFloorPickupRef.current = false;
      executePickUpItem();
    } else if (pendingScholarTalkRef.current) {
      pendingScholarTalkRef.current = false;
      // Only open dialogue if within conversational proximity
      if (Math.abs(currentX - scholarRawX) <= PROXIMITY_THRESHOLD + 40) {
        setShowDialogueMenu(true);
      }
    }
  };

  // Execute dialogue exchange
  const handleDialogueSelect = (option: DialogueOption) => {
    if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
    setIsSpeakingDialogue(true);
    setShowDialogueMenu(false);

    // Player speaks first (guarantees scholar text is cleared)
    const playerText = option.characterResponse || option.promptText.replace(/^[0-9]+\.\s*/, '');
    speakAsCharacter(playerText);

    // Scholar replies after delay (guarantees player text is cleared)
    dialogueTimerRef.current = setTimeout(() => {
      const reply = Array.isArray(option.npcResponse) ? option.npcResponse.join(' ') : option.npcResponse;
      speakAsScholar(reply);

      dialogueTimerRef.current = setTimeout(() => {
        setScholarSpeech(null);
        setIsSpeakingDialogue(false);

        if (option.id !== 'exit') {
          // Re-open dialogue tree after answering question ONLY if still in close proximity
          const curX = characterPositionRef.current.x;
          const schX = window.innerWidth * SCHOLAR_X_PERCENT;
          if (Math.abs(curX - schX) <= PROXIMITY_THRESHOLD + 40) {
            setShowDialogueMenu(true);
          }
        }
      }, 3600);
    }, 2000);
  };

  // Pick up floor item action
  const executePickUpItem = () => {
    setIsOpeningSatchel(true);
    speakAsCharacter("Picked up the Hourglass!");

    setTimeout(() => {
      setIsOpeningSatchel(false);
      setFloorItem(prev => ({ ...prev, pickedUp: true }));

      const newItem: InventoryItem = {
        id: 'now',
        type: 'now',
        label: 'Hourglass',
        verbText: 'Look at Hourglass (Go to Now Page)',
        path: '/now',
        icon: nowIcon
      };
      setInventoryList(prev => [...prev, newItem]);
    }, 650);
  };

  // Open interaction wheel on right click or special verb request
  const openWheelForTarget = (e: React.MouseEvent, target: InteractiveTarget) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveWheel({
      position: { x: e.clientX, y: e.clientY },
      target
    });
  };

  const getHourglassTarget = (): InteractiveTarget => ({
    id: 'hourglass',
    name: 'Hourglass',
    handVerb: 'Pick up Hourglass',
    eyeVerb: 'Examine Hourglass',
    mouthVerb: 'Taste Hourglass',
    onExecuteVerb: (verb: VerbType) => {
      if (verb === 'hand') {
        const currentX = characterPositionRef.current.x;
        const itemRawX = window.innerWidth * floorItem.xPercent;
        const stopXPos = currentX < itemRawX ? itemRawX - 60 : itemRawX + 60;
        pendingFloorPickupRef.current = true;
        setWalkTargetX(stopXPos);
      } else if (verb === 'eye') {
        speakAsCharacter("It says now ");
        setTimeout(() => {
          onNavigate('/now');
        }, 2200);
      } else if (verb === 'mouth') {
        speakAsCharacter("Hmm I am getting notes of silicon and glass and just the faintest hints of the present moment");
      }
    }
  });

  const getScholarTarget = (): InteractiveTarget => ({
    id: 'scholar',
    name: 'Archivist',
    handVerb: 'Poke Archivist',
    eyeVerb: 'Examine Archivist',
    mouthVerb: 'Talk to Archivist',
    onExecuteVerb: (verb: VerbType) => {
      const currentX = characterPositionRef.current.x;
      const scholarRawX = window.innerWidth * SCHOLAR_X_PERCENT;
      const distance = Math.abs(currentX - scholarRawX);

      if (verb === 'hand') {
        if (distance <= PROXIMITY_THRESHOLD) {
          speakAsCharacter("Knock it off!");
        } else {
          const stopXPos = currentX < scholarRawX ? scholarRawX - 85 : scholarRawX + 85;
          setWalkTargetX(stopXPos);
          setTimeout(() => {
            speakAsCharacter("Knock it off!");
          }, 1200);
        }
      } else if (verb === 'eye') {
        speakAsCharacter("He looks like he knows a thing or two about a thing or two");
      } else if (verb === 'mouth') {
        if (distance <= PROXIMITY_THRESHOLD) {
          setShowDialogueMenu(true);
          pendingScholarTalkRef.current = false;
        } else {
          const stopXPos = currentX < scholarRawX ? scholarRawX - 85 : scholarRawX + 85;
          pendingScholarTalkRef.current = true;
          setShowDialogueMenu(false);
          setWalkTargetX(stopXPos);
        }
      }
    }
  });

  const getSatchelTarget = (): InteractiveTarget => ({
    id: 'satchel',
    name: 'Inventory Satchel',
    handVerb: 'Open Satchel',
    eyeVerb: 'Examine Satchel',
    mouthVerb: 'Whisper into Satchel',
    onExecuteVerb: (verb: VerbType) => {
      if (verb === 'hand') {
        setShowInventory(true);
      } else if (verb === 'eye') {
        speakAsCharacter("A satchel for carrying items if that wasnt obvious ");
      } else if (verb === 'mouth') {
        speakAsCharacter("It doesn't answer back, not that I expected it to");
      }
    }
  });

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

  const statusLineText = wheelHoveredVerbText
    ? wheelHoveredVerbText
    : hoveredItem
      ? ('verbText' in hoveredItem ? hoveredItem.verbText : `Pick up ${hoveredItem.label}`)
      : "Click floor to walk • Right-click objects & NPCs to interact";

  return (
    <div className="game-environment" onClick={handleStageClick}>
      {/* Status Plaque at Top Center */}
      <div className="scumm-top-plaque">
        <span className="plaque-text">{statusLineText}</span>
      </div>

      {/* Borderless Transparent Satchel Button */}
      <button
        className="satchel-transparent-btn"
        onClick={handleSatchelClick}
        onContextMenu={(e) => openWheelForTarget(e, getSatchelTarget())}
      >
        <span className="satchel-hover-tooltip">INVENTORY (Right-Click to Interact)</span>
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
            onContextMenu={(e) => openWheelForTarget(e, getHourglassTarget())}
          >
            <img src={floorItem.icon} alt={floorItem.label} className="ground-item-img" />
          </div>
        )}

        {/* Interactive Scholar NPC */}
        <ScholarNpc
          xPercent={SCHOLAR_X_PERCENT}
          name="Archivist"
          onMouseEnter={() => setHoveredItem({ label: "Archivist", verbText: "Talk to Archivist (City Guide)" })}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={handleScholarClick}
          onContextMenu={(e) => openWheelForTarget(e, getScholarTarget())}
          speechText={scholarSpeech}
        />

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

      {/* Curse of Monkey Island Interaction Wheel Overlay */}
      {activeWheel && (
        <InteractionWheel
          position={activeWheel.position}
          target={activeWheel.target}
          onHoverVerb={(verbText) => setWheelHoveredVerbText(verbText)}
          onSelectVerb={(verb) => activeWheel.target.onExecuteVerb(verb)}
          onClose={() => {
            setActiveWheel(null);
            setWheelHoveredVerbText(null);
          }}
        />
      )}

      {/* Interactive Dialogue Menu Overlay */}
      {showDialogueMenu && (
        <DialogueMenu
          onSelectOption={handleDialogueSelect}
          onClose={() => setShowDialogueMenu(false)}
          isSpeaking={isSpeakingDialogue}
        />
      )}

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
              }] : []),
              {
                id: 'scholar',
                left: window.innerWidth * SCHOLAR_X_PERCENT - 55,
                right: window.innerWidth * SCHOLAR_X_PERCENT + 55
              }
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
