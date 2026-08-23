import React, { useState, useRef, useEffect } from "react";
import PixelArtCharacter from "./PixelArtCharacter";
import InteractiveSprite from "./InteractiveSprite";
import ScholarNpc from "./ScholarNpc";
import DialogueMenu from "./DialogueMenu";
import InteractionWheel, { InteractiveTarget, VerbType } from "./InteractionWheel";
import { DialogueOption } from "../data/dialogueData";
import { soundFx } from "../utils/audio";
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
}

const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'blog', type: 'blog', label: 'Message Board', verbText: 'Examine Message Board (Go to Blog)', path: '/about', icon: blogIcon },
  { id: 'github', type: 'github', label: 'Code Scroll', verbText: 'Inspect Code Scroll (Go to GitHub)', path: '/projects', icon: githubIcon },
  { id: 'linkedin', type: 'linkedin', label: 'Phonebook', verbText: 'Open Phonebook (Go to LinkedIn)', path: '/linkedin', icon: linkedinIcon },
  { id: 'mail', type: 'mail', label: 'Mailbox', verbText: 'Open Mailbox (Contact / Email)', path: '/mail', icon: mailIcon },
  { id: 'now', type: 'now', label: 'Hourglass', verbText: 'Look at Hourglass (Go to Now Page)', path: '/now', icon: nowIcon },
];

const getRoadBoundaries = () => {
  const windowWidth = window.innerWidth;
  return {
    left: windowWidth * 0.04,
    right: windowWidth * 0.94
  };
};

const SCHOLAR_X_PERCENT = 0.81;
const PROXIMITY_THRESHOLD = 130;

const GameEnvironment: React.FC<GameEnvironmentProps> = ({ onNavigate }) => {
  const [showCharacter, setShowCharacter] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactiveObjects, setInteractiveObjects] = useState<InteractiveObject[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [isOpeningSatchel, setIsOpeningSatchel] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | { label: string; verbText: string } | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [characterSpeech, setCharacterSpeech] = useState<string | null>(null);
  const [scholarSpeech, setScholarSpeech] = useState<string | null>(null);
  const [showDialogueMenu, setShowDialogueMenu] = useState(false);
  const [isSpeakingDialogue, setIsSpeakingDialogue] = useState(false);
  const [inventoryList] = useState<InventoryItem[]>(DEFAULT_INVENTORY_ITEMS);
  const [activeWheel, setActiveWheel] = useState<{
    position: { x: number; y: number };
    target: InteractiveTarget;
  } | null>(null);
  const [wheelHoveredVerbText, setWheelHoveredVerbText] = useState<string | null>(null);

  const [characterPosition, setCharacterPosition] = useState<Position>({
    x: window.innerWidth * 0.2,
    y: window.innerHeight - 215
  });

  const [walkTargetX, setWalkTargetX] = useState<number | null>(null);
  const [targetMarker, setTargetMarker] = useState<TargetMarker | null>(null);

  const characterPositionRef = useRef<Position>(characterPosition);
  const roadBoundariesRef = useRef(getRoadBoundaries());
  const pendingFloorPickupRef = useRef<boolean>(false);
  const pendingScholarTalkRef = useRef<boolean>(false);
  const dialogueTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const characterSpeechTimerRef = useRef<NodeJS.Timeout | null>(null);

  const speakAsCharacter = (text: string | null, autoClearDuration: number = 2500) => {
    if (characterSpeechTimerRef.current) {
      clearTimeout(characterSpeechTimerRef.current);
      characterSpeechTimerRef.current = null;
    }
    setScholarSpeech(null);
    setCharacterSpeech(text);
    if (text) {
      soundFx.playTalk();
      if (autoClearDuration > 0) {
        characterSpeechTimerRef.current = setTimeout(() => {
          setCharacterSpeech(null);
        }, autoClearDuration);
      }
    }
  };

  const speakAsScholar = (text: string | null) => {
    if (characterSpeechTimerRef.current) {
      clearTimeout(characterSpeechTimerRef.current);
      characterSpeechTimerRef.current = null;
    }
    setCharacterSpeech(null);
    setScholarSpeech(text);
    if (text) soundFx.playTalk();
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
      target.closest('.scumm-dialogue-box') ||
      target.closest('.curse-verb-wheel')
    ) {
      return;
    }

    soundFx.playFootstep();
    const clickX = e.clientX;
    const clickY = Math.min(e.clientY, window.innerHeight - 140);

    setTargetMarker({ x: clickX, y: clickY, id: Date.now() });
    setWalkTargetX(clickX);
    pendingFloorPickupRef.current = false;
    pendingScholarTalkRef.current = false;
    setShowDialogueMenu(false);
    setActiveWheel(null);

    setTimeout(() => {
      setTargetMarker(null);
    }, 850);
  };

  // Click Scholar NPC -> Walk over and only open dialogue upon reaching proximity!
  const handleScholarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentX = characterPositionRef.current.x;
    const scholarRawX = window.innerWidth * SCHOLAR_X_PERCENT;
    const distance = Math.abs(currentX - scholarRawX);

    if (distance <= PROXIMITY_THRESHOLD) {
      setShowDialogueMenu(true);
      pendingScholarTalkRef.current = false;
    } else {
      soundFx.playFootstep();
      const stopXPos = currentX < scholarRawX ? scholarRawX - 85 : scholarRawX + 85;
      pendingScholarTalkRef.current = true;
      setShowDialogueMenu(false);
      setActiveWheel(null);
      setWalkTargetX(stopXPos);
      setTargetMarker({ x: scholarRawX, y: window.innerHeight - 215, id: Date.now() });
    }
  };

  // Arrival handler
  const handleArrival = () => {
    setWalkTargetX(null);
    setTargetMarker(null);

    const currentX = characterPositionRef.current.x;
    const scholarRawX = window.innerWidth * SCHOLAR_X_PERCENT;

    if (pendingScholarTalkRef.current) {
      pendingScholarTalkRef.current = false;
      if (Math.abs(currentX - scholarRawX) <= PROXIMITY_THRESHOLD + 40) {
        setShowDialogueMenu(true);
      }
    }
  };

  // Execute dialogue exchange (sequential banter: PC talks -> text clears -> NPC replies)
  const handleDialogueSelect = (option: DialogueOption) => {
    if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
    setIsSpeakingDialogue(true);
    setShowDialogueMenu(false);

    const playerText = option.characterResponse || option.promptText.replace(/^[0-9]+\.\s*/, '');
    speakAsCharacter(playerText);

    // Step 1: Wait for PC text duration, then clear PC text
    dialogueTimerRef.current = setTimeout(() => {
      setCharacterSpeech(null);

      // Step 2: Brief pause, then show Archivist reply
      dialogueTimerRef.current = setTimeout(() => {
        const reply = Array.isArray(option.npcResponse) ? option.npcResponse.join(' ') : option.npcResponse;
        speakAsScholar(reply);

        // Step 3: Wait for Archivist text duration, then clear and re-open dialogue menu
        dialogueTimerRef.current = setTimeout(() => {
          setScholarSpeech(null);
          setIsSpeakingDialogue(false);

          if (option.id !== 'exit') {
            const curX = characterPositionRef.current.x;
            const schX = window.innerWidth * SCHOLAR_X_PERCENT;
            if (Math.abs(curX - schX) <= PROXIMITY_THRESHOLD + 40) {
              setShowDialogueMenu(true);
            }
          }
        }, 3400);
      }, 350);
    }, 2400);
  };

  // Open interaction wheel on right click or touch long-press
  const openWheelForTarget = (clientX: number, clientY: number, target: InteractiveTarget) => {
    soundFx.playClick();
    setActiveWheel({
      position: { x: clientX, y: clientY },
      target
    });
  };

  const handleTouchStart = (targetGetter: () => InteractiveTarget, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      openWheelForTarget(clientX, clientY, targetGetter());
    }, 380);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  // Contextual SCUMM Verb Wheel targets for each inventory item
  const getInventoryItemTarget = (item: InventoryItem): InteractiveTarget => {
    switch (item.id) {
      case 'blog':
        return {
          id: 'blog',
          name: 'Message Board',
          handVerb: 'Examine Notices (Go to Blog)',
          eyeVerb: 'Read Town Decrees',
          mouthVerb: 'Lick Parchment',
          onExecuteVerb: (verb: VerbType) => {
            setShowInventory(false);
            if (verb === 'hand' || verb === 'eye') {
              executeNavigationInteraction('blog', '/about');
            } else if (verb === 'mouth') {
              speakAsCharacter("Tastes like aged oak bark and bureaucratic decrees.");
            }
          }
        };
      case 'github':
        return {
          id: 'github',
          name: 'Code Scroll',
          handVerb: 'Inspect Code Scroll (Go to GitHub)',
          eyeVerb: 'Study Ancient Algorithms',
          mouthVerb: 'Recite Incantation',
          onExecuteVerb: (verb: VerbType) => {
            setShowInventory(false);
            if (verb === 'hand' || verb === 'eye') {
              executeNavigationInteraction('github', '/projects');
            } else if (verb === 'mouth') {
              speakAsCharacter("git commit -m 'Lumos' - the incantation resonates!");
            }
          }
        };
      case 'linkedin':
        return {
          id: 'linkedin',
          name: 'Guild Phonebook',
          handVerb: 'Open Phonebook (Go to LinkedIn)',
          eyeVerb: 'Browse Guild Directory',
          mouthVerb: 'Call Contact',
          onExecuteVerb: (verb: VerbType) => {
            setShowInventory(false);
            if (verb === 'hand' || verb === 'eye') {
              executeNavigationInteraction('linkedin', '/linkedin');
            } else if (verb === 'mouth') {
              speakAsCharacter("Connecting to the guild network...");
            }
          }
        };
      case 'mail':
        return {
          id: 'mail',
          name: 'Enchanted Mailbox',
          handVerb: 'Open Mailbox (Send Email)',
          eyeVerb: 'Inspect Brass Latch',
          mouthVerb: 'Whisper Message',
          onExecuteVerb: (verb: VerbType) => {
            setShowInventory(false);
            if (verb === 'hand' || verb === 'eye') {
              executeNavigationInteraction('mail', '/mail');
            } else if (verb === 'mouth') {
              speakAsCharacter("Your whispered words turn into an envelope of stardust.");
            }
          }
        };
      case 'now':
      default:
        return {
          id: 'now',
          name: 'Hourglass',
          handVerb: 'Inspect Timeline (Go to Now)',
          eyeVerb: 'Watch the Sands of Time',
          mouthVerb: 'Taste Sand of Time',
          onExecuteVerb: (verb: VerbType) => {
            setShowInventory(false);
            if (verb === 'hand' || verb === 'eye') {
              executeNavigationInteraction('now', '/now');
            } else if (verb === 'mouth') {
              speakAsCharacter("Hmm, notes of silicon, glass, and the fleeting present moment.");
            }
          }
        };
    }
  };

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
        speakAsCharacter("He looks like he knows a thing or two about a thing or two.");
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
        soundFx.playSatchel();
        setShowInventory(true);
      } else if (verb === 'eye') {
        speakAsCharacter("A satchel for carrying relics, scrolls, and oddities.");
      } else if (verb === 'mouth') {
        speakAsCharacter("It doesn't answer back, not that I expected it to.");
      }
    }
  });

  // Satchel Pouch Open / Close
  const handleSatchelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playSatchel();
    if (showInventory) {
      setShowInventory(false);
      setIsOpeningSatchel(false);
      return;
    }

    setIsOpeningSatchel(true);
    setTimeout(() => {
      setIsOpeningSatchel(false);
      setShowInventory(true);
    }, 250);
  };

  const handleUseInventoryItem = (item: InventoryItem) => {
    soundFx.playClick();
    setShowInventory(false);
    if (isInteracting) return;

    if (item.path) {
      executeNavigationInteraction(item.type, item.path);
    }
  };

  const executeNavigationInteraction = (type: InteractiveObject['type'], path: string) => {
    setActivePath(path);
    soundFx.playMagic();
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
      ? hoveredItem.verbText
      : "Click floor to walk • Right-click items & NPCs to interact";

  return (
    <div className="game-environment" onClick={handleStageClick}>
      {/* Title Header Banner */}
      <div className="game-header-banner">
        <h1 className="game-title">Dhruv Charan</h1>
      </div>

      {/* SCUMM Status Plaque at Top Center */}
      <div className="scumm-top-plaque">
        <span className="plaque-text">{statusLineText}</span>
      </div>

      {/* Borderless Transparent Satchel Button */}
      <button
        className="satchel-transparent-btn"
        onClick={handleSatchelClick}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openWheelForTarget(e.clientX, e.clientY, getSatchelTarget());
        }}
        onTouchStart={(e) => handleTouchStart(getSatchelTarget, e)}
        onTouchEnd={handleTouchEnd}
        aria-label="Open Satchel Inventory"
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
                {hoveredItem ? hoveredItem.verbText : "Inventory (Right-Click to Interact)"}
              </span>
              <button
                className="pouch-close-btn"
                onClick={() => {
                  soundFx.playClick();
                  setShowInventory(false);
                }}
              >
                &times;
              </button>
            </div>

            <div className="pouch-grid">
              {inventoryList.map((item) => (
                <div
                  key={item.id}
                  className="pouch-slot"
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleUseInventoryItem(item)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openWheelForTarget(e.clientX, e.clientY, getInventoryItemTarget(item));
                  }}
                  onTouchStart={(e) => handleTouchStart(() => getInventoryItemTarget(item), e)}
                  onTouchEnd={handleTouchEnd}
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

        {/* Interactive Scholar NPC */}
        <ScholarNpc
          xPercent={SCHOLAR_X_PERCENT}
          name="Archivist"
          onMouseEnter={() => setHoveredItem({ label: "Archivist", verbText: "Talk to Archivist (City Guide)" })}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={handleScholarClick}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openWheelForTarget(e.clientX, e.clientY, getScholarTarget());
          }}
          onTouchStart={(e) => handleTouchStart(getScholarTarget, e)}
          onTouchEnd={handleTouchEnd}
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
              {
                id: 'scholar',
                left: window.innerWidth * SCHOLAR_X_PERCENT - 45,
                right: window.innerWidth * SCHOLAR_X_PERCENT + 45
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
