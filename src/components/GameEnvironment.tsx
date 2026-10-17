import React, { useState, useRef, useEffect, useMemo } from "react";
import PixelArtCharacter, { WalkTarget } from "./PixelArtCharacter";
import InteractiveSprite from "./InteractiveSprite";
import ScholarNpc from "./ScholarNpc";
import DialogueMenu from "./DialogueMenu";
import InteractionWheel, { InteractiveTarget, VerbType } from "./InteractionWheel";
import {
  DialogueOption,
  InventoryItemId,
  INVENTORY_DIALOGUE_CONFIG,
  SATCHEL_INTERACTION_CONFIG,
  SCHOLAR_INTERACTION_CONFIG,
  STAGE_UI_TEXT,
  WORLD_HOTSPOTS_CONFIG,
  WorldHotspotConfig,
} from "../data/dialogueData";

import { soundFx } from "../utils/audio";
import {
  calculateStageMetrics,
  StageMetrics,
  SCHOLAR_X_PERCENT,
  getClosestWalkTarget,
  getDistanceToScholar,
  nativeToViewportRect,
  ViewportRect,
} from "../utils/stageGeometry";
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
  type: InventoryItemId | 'unknown';
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
  id: InventoryItemId;
  type: InventoryItemId;
  label: string;
  verbText: string;
  path: string;
  icon: string;
}

interface WorldSpeechBubble {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

const INVENTORY_ICONS: Record<InventoryItemId, string> = {
  blog: blogIcon,
  github: githubIcon,
  linkedin: linkedinIcon,
  mail: mailIcon,
  now: nowIcon,
};

const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = (
  Object.keys(INVENTORY_DIALOGUE_CONFIG) as InventoryItemId[]
).map((id) => {
  const cfg = INVENTORY_DIALOGUE_CONFIG[id];
  return {
    id: cfg.id,
    type: cfg.id,
    label: cfg.label,
    verbText: cfg.defaultVerbText,
    path: cfg.path,
    icon: INVENTORY_ICONS[id],
  };
});

const GameEnvironment: React.FC<GameEnvironmentProps> = ({ onNavigate }) => {
  const [stageMetrics, setStageMetrics] = useState<StageMetrics>(() => calculateStageMetrics());
  const [showCharacter, setShowCharacter] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactiveObjects, setInteractiveObjects] = useState<InteractiveObject[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [isOpeningSatchel, setIsOpeningSatchel] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | { label: string; verbText: string } | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [characterSpeech, setCharacterSpeech] = useState<string | null>(null);
  const [scholarSpeech, setScholarSpeech] = useState<string | null>(null);
  const [worldSpeech, setWorldSpeech] = useState<WorldSpeechBubble | null>(null);
  const [showDialogueMenu, setShowDialogueMenu] = useState(false);
  const [isSpeakingDialogue, setIsSpeakingDialogue] = useState(false);
  const [inventoryList] = useState<InventoryItem[]>(DEFAULT_INVENTORY_ITEMS);
  const [activeWheel, setActiveWheel] = useState<{
    position: { x: number; y: number };
    target: InteractiveTarget;
  } | null>(null);
  const [wheelHoveredVerbText, setWheelHoveredVerbText] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.getMuted());

  const [characterPosition, setCharacterPosition] = useState<Position>(() => ({
    x: (typeof window !== 'undefined' ? window.innerWidth : 1440) * 0.2,
    y: stageMetrics.characterBaseY
  }));

  const [walkTarget, setWalkTarget] = useState<WalkTarget | null>(null);
  const [targetMarker, setTargetMarker] = useState<TargetMarker | null>(null);

  const scholarObstacles = useMemo(
    () => [stageMetrics.scholarObstacleHitbox],
    [stageMetrics.scholarObstacleHitbox]
  );

  // Project native background hotspots and ambient fixtures to current viewport
  const projectedHotspots = useMemo(() => {
    return WORLD_HOTSPOTS_CONFIG.map((def) => ({
      ...def,
      rect: nativeToViewportRect(
        def.nativeRect.nx,
        def.nativeRect.ny,
        def.nativeRect.nw,
        def.nativeRect.nh,
        stageMetrics
      ),
    }));
  }, [stageMetrics]);

  const ambientLocations = useMemo(() => {
    return {
      chimney: nativeToViewportRect(408, 0, 38, 40, stageMetrics),
      tavernLeftWindow: nativeToViewportRect(24, 444, 58, 72, stageMetrics),
      tavernRightWindow: nativeToViewportRect(298, 444, 58, 72, stageMetrics),
      tavernDoorGlow: nativeToViewportRect(160, 565, 95, 42, stageMetrics),
      guildTopWindow: nativeToViewportRect(1134, 92, 46, 70, stageMetrics),
      guildMidWindows: nativeToViewportRect(1055, 240, 225, 98, stageMetrics),
      guildLowWindows: nativeToViewportRect(1062, 444, 155, 94, stageMetrics),
      guildGroundGlow: nativeToViewportRect(1050, 565, 210, 48, stageMetrics),
      alleyMist: nativeToViewportRect(565, 435, 195, 145, stageMetrics),
      stars: [
        { ...nativeToViewportRect(496, 18, 8, 8, stageMetrics), delay: '0s' },
        { ...nativeToViewportRect(753, 18, 9, 9, stageMetrics), delay: '1.1s' },
        { ...nativeToViewportRect(810, 62, 8, 8, stageMetrics), delay: '2.3s' },
        { ...nativeToViewportRect(1024, 18, 9, 9, stageMetrics), delay: '0.6s' },
        { ...nativeToViewportRect(574, 90, 6, 6, stageMetrics), delay: '1.7s' },
      ],
    };
  }, [stageMetrics]);

  const characterPositionRef = useRef<Position>(characterPosition);
  const prevViewportWidthRef = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const roadBoundariesRef = useRef(stageMetrics.roadBoundaries);
  const pendingFloorPickupRef = useRef<boolean>(false);
  const pendingScholarTalkRef = useRef<boolean>(false);
  const pendingScholarShoveRef = useRef<boolean>(false);
  const pendingWorldActionRef = useRef<(() => void) | null>(null);
  const scholarPokeCountRef = useRef<number>(0);
  const dialogueTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const characterSpeechTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scholarSpeechTimerRef = useRef<NodeJS.Timeout | null>(null);
  const worldSpeechTimerRef = useRef<NodeJS.Timeout | null>(null);
  const worldReplyDelayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllSpeechTimers = () => {
    if (characterSpeechTimerRef.current) {
      clearTimeout(characterSpeechTimerRef.current);
      characterSpeechTimerRef.current = null;
    }
    if (scholarSpeechTimerRef.current) {
      clearTimeout(scholarSpeechTimerRef.current);
      scholarSpeechTimerRef.current = null;
    }
    if (worldSpeechTimerRef.current) {
      clearTimeout(worldSpeechTimerRef.current);
      worldSpeechTimerRef.current = null;
    }
    if (worldReplyDelayTimerRef.current) {
      clearTimeout(worldReplyDelayTimerRef.current);
      worldReplyDelayTimerRef.current = null;
    }
  };

  const speakAsCharacter = (text: string | null, autoClearDuration: number = 3200) => {
    clearAllSpeechTimers();
    setScholarSpeech(null);
    setWorldSpeech(null);
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

  const speakAsScholar = (text: string | null, autoClearDuration: number = 3200) => {
    clearAllSpeechTimers();
    setCharacterSpeech(null);
    setWorldSpeech(null);
    setScholarSpeech(text);
    if (text) {
      soundFx.playTalk();
      if (autoClearDuration > 0) {
        scholarSpeechTimerRef.current = setTimeout(() => {
          setScholarSpeech(null);
        }, autoClearDuration);
      }
    }
  };

  const speakFromWorld = (
    id: string,
    text: string,
    x: number,
    y: number,
    color: string = '#ff9966',
    autoClearDuration: number = 3400
  ) => {
    clearAllSpeechTimers();
    setCharacterSpeech(null);
    setScholarSpeech(null);
    setWorldSpeech({ id, text, x, y, color });
    soundFx.playTalk();
    if (autoClearDuration > 0) {
      worldSpeechTimerRef.current = setTimeout(() => {
        setWorldSpeech(null);
      }, autoClearDuration);
    }
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
      const newMetrics = calculateStageMetrics(window.innerWidth, window.innerHeight);
      setStageMetrics(newMetrics);
      roadBoundariesRef.current = newMetrics.roadBoundaries;

      setCharacterPosition((prev) => {
        const prevW = prevViewportWidthRef.current || window.innerWidth;
        const currentXPercent = prev.x / prevW;
        const newX = Math.max(
          newMetrics.roadBoundaries.left,
          Math.min(
            newMetrics.roadBoundaries.right - newMetrics.characterWidth,
            currentXPercent * window.innerWidth
          )
        );
        const newPos = {
          x: newX,
          y: newMetrics.characterBaseY
        };
        characterPositionRef.current = newPos;
        return newPos;
      });

      prevViewportWidthRef.current = window.innerWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
      clearAllSpeechTimers();
    };
  }, []);

  const updateCharacterPosition = (pos: Position) => {
    setCharacterPosition(pos);
    characterPositionRef.current = pos;

    // Automatically close dialogue menu if the player walks away from the NPC
    if (showDialogueMenu && getDistanceToScholar(pos.x, stageMetrics) > stageMetrics.scholarProximityThreshold + 40) {
      setShowDialogueMenu(false);
    }
  };

  // Stage Floor Click -> Character walks to closest point on the walk path to the click
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.satchel-transparent-btn') ||
      target.closest('.audio-mute-btn') ||
      target.closest('.scumm-pouch-modal') ||
      target.closest('.ground-collectible-item') ||
      target.closest('.scholar-npc-container') ||
      target.closest('.world-stage-hotspot') ||
      target.closest('.scumm-dialogue-box') ||
      target.closest('.curse-verb-wheel')
    ) {
      return;
    }

    soundFx.playFootstep();
    const currentX = characterPositionRef.current.x;
    const walkTargetPos = getClosestWalkTarget(e.clientX, currentX, stageMetrics);

    const targetObj: WalkTarget = { x: walkTargetPos.targetLeft, id: Date.now() };
    setTargetMarker({ x: walkTargetPos.targetCenterX, y: walkTargetPos.markerY, id: targetObj.id });
    setWalkTarget(targetObj);
    pendingFloorPickupRef.current = false;
    pendingScholarTalkRef.current = false;
    pendingScholarShoveRef.current = false;
    pendingWorldActionRef.current = null;
    if (dialogueTimerRef.current) {
      clearTimeout(dialogueTimerRef.current);
      dialogueTimerRef.current = null;
    }
    setIsSpeakingDialogue(false);
    setShowDialogueMenu(false);
    setActiveWheel(null);

    setTimeout(() => {
      setTargetMarker(null);
    }, 850);
  };

  // Walk character to a specific viewport X coordinate and run callback on arrival
  const walkToAndExecute = (desiredCenterX: number, callback: () => void) => {
    const currentX = characterPositionRef.current.x;
    const walkTargetPos = getClosestWalkTarget(desiredCenterX, currentX, stageMetrics);
    const dist = Math.abs(walkTargetPos.targetLeft - currentX);

    pendingFloorPickupRef.current = false;
    pendingScholarTalkRef.current = false;
    pendingScholarShoveRef.current = false;
    setIsSpeakingDialogue(false);
    setShowDialogueMenu(false);
    setActiveWheel(null);

    if (dist <= 18) {
      pendingWorldActionRef.current = null;
      callback();
    } else {
      soundFx.playFootstep();
      pendingWorldActionRef.current = callback;
      const targetObj: WalkTarget = { x: walkTargetPos.targetLeft, id: Date.now() };
      setWalkTarget(targetObj);
      setTargetMarker({ x: walkTargetPos.targetCenterX, y: walkTargetPos.markerY, id: targetObj.id });
    }
  };

  // Click Scholar NPC -> Walk over and only open dialogue upon reaching proximity!
  const handleScholarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentX = characterPositionRef.current.x;
    const scholarRawX = stageMetrics.scholarX;
    const distance = getDistanceToScholar(currentX, stageMetrics);

    pendingScholarShoveRef.current = false;
    pendingWorldActionRef.current = null;

    if (distance <= stageMetrics.scholarProximityThreshold) {
      setIsSpeakingDialogue(false);
      setShowDialogueMenu(true);
      pendingScholarTalkRef.current = false;
    } else {
      soundFx.playFootstep();
      const obs = stageMetrics.scholarObstacleHitbox;
      const targetLeft = currentX < scholarRawX
        ? obs.left - stageMetrics.characterWidth
        : obs.right;
      const targetObj: WalkTarget = { x: targetLeft, id: Date.now() };
      pendingScholarTalkRef.current = true;
      setIsSpeakingDialogue(false);
      setShowDialogueMenu(false);
      setActiveWheel(null);
      setWalkTarget(targetObj);
      setTargetMarker({ x: Math.round(targetLeft + stageMetrics.characterWidth / 2), y: stageMetrics.groundY - 10, id: targetObj.id });
    }
  };

  // Arrival handler
  const handleArrival = () => {
    setWalkTarget(null);
    setTargetMarker(null);

    const currentX = characterPositionRef.current.x;
    const distance = getDistanceToScholar(currentX, stageMetrics);

    if (pendingScholarTalkRef.current) {
      pendingScholarTalkRef.current = false;
      if (distance <= stageMetrics.scholarProximityThreshold + 40) {
        setIsSpeakingDialogue(false);
        setShowDialogueMenu(true);
      }
    }

    if (pendingScholarShoveRef.current) {
      pendingScholarShoveRef.current = false;
      if (distance <= stageMetrics.scholarProximityThreshold + 40) {
        const responses = SCHOLAR_INTERACTION_CONFIG.pokeResponses;
        const msg = responses[scholarPokeCountRef.current % responses.length];
        scholarPokeCountRef.current += 1;
        speakAsScholar(msg, 3200);
      }
    }

    if (pendingWorldActionRef.current) {
      const action = pendingWorldActionRef.current;
      pendingWorldActionRef.current = null;
      action();
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
        speakAsScholar(reply, 3400);

        // Step 3: Wait for Archivist text duration, then clear and re-open dialogue menu
        dialogueTimerRef.current = setTimeout(() => {
          setScholarSpeech(null);
          setIsSpeakingDialogue(false);

          if (option.id !== 'exit') {
            const curX = characterPositionRef.current.x;
            if (getDistanceToScholar(curX, stageMetrics) <= stageMetrics.scholarProximityThreshold + 40) {
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

  // World Hotspot Interactions driven completely by `WORLD_HOTSPOTS_CONFIG` in dialogueData.ts
  const executeHotspotVerb = (hotspot: WorldHotspotConfig & { rect: ViewportRect }, verb: VerbType) => {
    const outcome = hotspot.responses[verb];
    if (!outcome) return;

    const runAction = () => {
      if (outcome.sound === 'knock') {
        soundFx.playKnock();
      } else if (outcome.sound === 'magic') {
        soundFx.playMagic();
      } else if (outcome.sound === 'satchel') {
        soundFx.playSatchel();
      }

      if (outcome.navigate) {
        executeNavigationInteraction(outcome.navigate.type, outcome.navigate.path);
        return;
      }

      if (outcome.characterSpeech) {
        const speechDuration = outcome.worldReply?.delayMs
          ? Math.max(1200, outcome.worldReply.delayMs - 100)
          : 3500;
        speakAsCharacter(outcome.characterSpeech, speechDuration);
      }

      if (outcome.worldReply) {
        const reply = outcome.worldReply;
        worldReplyDelayTimerRef.current = setTimeout(() => {
          speakFromWorld(
            reply.speakerId,
            reply.text,
            hotspot.rect.centerX,
            hotspot.rect.top - 16,
            reply.color || '#ff8c66',
            reply.durationMs || 3600
          );
        }, reply.delayMs ?? 400);
      }
    };

    if (hotspot.walkToNativeX && (verb === 'hand' || (verb === 'mouth' && outcome.worldReply))) {
      const targetViewportRect = nativeToViewportRect(hotspot.walkToNativeX, 0, 10, 10, stageMetrics);
      walkToAndExecute(targetViewportRect.centerX, runAction);
    } else {
      runAction();
    }
  };

  const getWorldHotspotTarget = (hotspot: WorldHotspotConfig & { rect: ViewportRect }): InteractiveTarget => ({
    id: hotspot.id,
    name: hotspot.label,
    handVerb: hotspot.verbs.hand,
    eyeVerb: hotspot.verbs.eye,
    mouthVerb: hotspot.verbs.mouth,
    onExecuteVerb: (verb: VerbType) => executeHotspotVerb(hotspot, verb),
  });

  const handleWorldHotspotLeftClick = (
    e: React.MouseEvent,
    hotspot: WorldHotspotConfig & { rect: ViewportRect }
  ) => {
    e.stopPropagation();
    executeHotspotVerb(hotspot, hotspot.defaultLeftClickVerb);
  };

  // Inventory Item Interactions driven by `INVENTORY_DIALOGUE_CONFIG` in dialogueData.ts
  const getInventoryItemTarget = (item: InventoryItem): InteractiveTarget => {
    const cfg = INVENTORY_DIALOGUE_CONFIG[item.id];
    return {
      id: cfg.id,
      name: cfg.wheelName,
      handVerb: cfg.verbs.hand,
      eyeVerb: cfg.verbs.eye,
      mouthVerb: cfg.verbs.mouth,
      onExecuteVerb: (verb: VerbType) => {
        setShowInventory(false);
        if (verb === 'hand' || verb === 'eye') {
          executeNavigationInteraction(cfg.id, cfg.path);
        } else if (verb === 'mouth') {
          speakAsCharacter(cfg.mouthSpeech);
        }
      },
    };
  };

  // Scholar NPC Interactions driven by `SCHOLAR_INTERACTION_CONFIG` in dialogueData.ts
  const getScholarTarget = (): InteractiveTarget => ({
    id: 'scholar',
    name: SCHOLAR_INTERACTION_CONFIG.name,
    handVerb: SCHOLAR_INTERACTION_CONFIG.verbs.hand,
    eyeVerb: SCHOLAR_INTERACTION_CONFIG.verbs.eye,
    mouthVerb: SCHOLAR_INTERACTION_CONFIG.verbs.mouth,
    onExecuteVerb: (verb: VerbType) => {
      const currentX = characterPositionRef.current.x;
      const scholarRawX = stageMetrics.scholarX;
      const distance = getDistanceToScholar(currentX, stageMetrics);

      if (verb === 'hand') {
        pendingScholarTalkRef.current = false;
        pendingWorldActionRef.current = null;
        if (distance <= stageMetrics.scholarProximityThreshold) {
          pendingScholarShoveRef.current = false;
          const responses = SCHOLAR_INTERACTION_CONFIG.pokeResponses;
          const msg = responses[scholarPokeCountRef.current % responses.length];
          scholarPokeCountRef.current += 1;
          speakAsScholar(msg, 3200);
        } else {
          const obs = stageMetrics.scholarObstacleHitbox;
          const targetLeft = currentX < scholarRawX
            ? obs.left - stageMetrics.characterWidth
            : obs.right;
          pendingScholarShoveRef.current = true;
          setWalkTarget({ x: targetLeft, id: Date.now() });
          setTargetMarker({ x: Math.round(targetLeft + stageMetrics.characterWidth / 2), y: stageMetrics.groundY - 10, id: Date.now() });
        }
      } else if (verb === 'eye') {
        speakAsCharacter(SCHOLAR_INTERACTION_CONFIG.examineSpeech);
      } else if (verb === 'mouth') {
        pendingScholarShoveRef.current = false;
        pendingWorldActionRef.current = null;
        if (distance <= stageMetrics.scholarProximityThreshold) {
          setIsSpeakingDialogue(false);
          setShowDialogueMenu(true);
          pendingScholarTalkRef.current = false;
        } else {
          const obs = stageMetrics.scholarObstacleHitbox;
          const targetLeft = currentX < scholarRawX
            ? obs.left - stageMetrics.characterWidth
            : obs.right;
          pendingScholarTalkRef.current = true;
          setIsSpeakingDialogue(false);
          setShowDialogueMenu(false);
          setWalkTarget({ x: targetLeft, id: Date.now() });
          setTargetMarker({ x: Math.round(targetLeft + stageMetrics.characterWidth / 2), y: stageMetrics.groundY - 10, id: Date.now() });
        }
      }
    }
  });

  // Satchel Interactions driven by `SATCHEL_INTERACTION_CONFIG` in dialogueData.ts
  const getSatchelTarget = (): InteractiveTarget => ({
    id: 'satchel',
    name: SATCHEL_INTERACTION_CONFIG.name,
    handVerb: SATCHEL_INTERACTION_CONFIG.verbs.hand,
    eyeVerb: SATCHEL_INTERACTION_CONFIG.verbs.eye,
    mouthVerb: SATCHEL_INTERACTION_CONFIG.verbs.mouth,
    onExecuteVerb: (verb: VerbType) => {
      if (verb === 'hand') {
        soundFx.playSatchel();
        setShowInventory(true);
      } else if (verb === 'eye') {
        speakAsCharacter(SATCHEL_INTERACTION_CONFIG.examineSpeech);
      } else if (verb === 'mouth') {
        speakAsCharacter(SATCHEL_INTERACTION_CONFIG.mouthSpeech);
      }
    }
  });


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

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundFx.playClick();
    }
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
      : STAGE_UI_TEXT.defaultStatusPrompt;

  return (
    <div
      className="game-environment"
      style={{
        '--stage-scale': stageMetrics.stageScale,
        '--ground-offset': `${stageMetrics.groundOffset}px`,
        '--char-width': `${stageMetrics.characterWidth}px`,
        '--char-height': `${stageMetrics.characterHeight}px`,
        '--scholar-width': `${stageMetrics.scholarWidth}px`,
        '--scholar-height': `${stageMetrics.scholarHeight}px`,
      } as React.CSSProperties}
      onClick={handleStageClick}
    >
      {/*   header banner   */}
      <div className="game-header-banner">
        <h1 className="game-title">{STAGE_UI_TEXT.title}</h1>
      </div>

      <div className="scumm-top-plaque top-plaque">
        <span className="plaque-text">{statusLineText}</span>
      </div>

      {/* Discrete Retro Audio Toggle */}
      <button
        className="audio-mute-btn"
        onClick={handleToggleMute}
        onMouseEnter={() =>
          setHoveredItem({
            label: isMuted ? STAGE_UI_TEXT.audioMutedVerb : STAGE_UI_TEXT.audioActiveVerb,
            verbText: isMuted ? STAGE_UI_TEXT.audioMutedVerb : STAGE_UI_TEXT.audioActiveVerb,
          })
        }
        onMouseLeave={() => setHoveredItem(null)}
        aria-label={isMuted ? STAGE_UI_TEXT.audioMutedVerb : STAGE_UI_TEXT.audioActiveVerb}
      >
        <span className="audio-mute-icon">{isMuted ? '🔇' : '🔔'}</span>
        <span className="audio-mute-label">{isMuted ? 'MUTED' : 'SFX'}</span>
      </button>

      {/* Borderless Transparent Satchel Button */}
      <button
        className="satchel-transparent-btn"
        onClick={handleSatchelClick}
        onMouseEnter={() =>
          setHoveredItem({
            label: SATCHEL_INTERACTION_CONFIG.name,
            verbText: SATCHEL_INTERACTION_CONFIG.hoverVerbText,
          })
        }
        onMouseLeave={() => setHoveredItem(null)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openWheelForTarget(e.clientX, e.clientY, getSatchelTarget());
        }}
        onTouchStart={(e) => handleTouchStart(getSatchelTarget, e)}
        onTouchEnd={handleTouchEnd}
        aria-label={SATCHEL_INTERACTION_CONFIG.name}
      >
        <span className="satchel-hover-tooltip">{STAGE_UI_TEXT.satchelTooltip}</span>
        <img src={pixelSatchel} alt={SATCHEL_INTERACTION_CONFIG.name} className="satchel-pixel-img" />
      </button>

      {/* Retro Inventory Window */}
      {showInventory && (
        <div className="scumm-pouch-overlay" onClick={() => setShowInventory(false)}>
          <div className="scumm-pouch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pouch-header">
              <span className="pouch-verb">
                {hoveredItem ? hoveredItem.verbText : STAGE_UI_TEXT.inventoryModalDefaultPrompt}
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
        {/* ══════════════════════════════════════════════════════════════════
            AMBIENT LIVING STAGE EFFECTS (Candle Flicker, Chimney Smoke, Mist)
           ══════════════════════════════════════════════════════════════════ */}
        <div className="ambient-stage-effects" aria-hidden="true">
          {/* Starlight Twinkles */}
          {ambientLocations.stars.map((star, idx) => (
            <div
              key={`star-${idx}`}
              className="ambient-star-twinkle"
              style={{
                left: `${star.centerX}px`,
                top: `${star.centerY}px`,
                animationDelay: star.delay,
              }}
            />
          ))}

          {/* Tavern Chimney Pixel Smoke Plume */}
          <div
            className="ambient-chimney-emitter"
            style={{
              left: `${ambientLocations.chimney.centerX}px`,
              top: `${Math.max(8, ambientLocations.chimney.top)}px`,
            }}
          >
            <span className="chimney-smoke-puff puff-1" />
            <span className="chimney-smoke-puff puff-2" />
            <span className="chimney-smoke-puff puff-3" />
            <span className="chimney-smoke-puff puff-4" />
          </div>

          {/* Warm Candlelight Flicker Overlays on Tavern & Guild Windows */}
          <div
            className="ambient-window-glow glow-tavern"
            style={{
              left: `${ambientLocations.tavernLeftWindow.left}px`,
              top: `${ambientLocations.tavernLeftWindow.top}px`,
              width: `${ambientLocations.tavernLeftWindow.width}px`,
              height: `${ambientLocations.tavernLeftWindow.height}px`,
            }}
          />
          <div
            className="ambient-window-glow glow-tavern-alt"
            style={{
              left: `${ambientLocations.tavernRightWindow.left}px`,
              top: `${ambientLocations.tavernRightWindow.top}px`,
              width: `${ambientLocations.tavernRightWindow.width}px`,
              height: `${ambientLocations.tavernRightWindow.height}px`,
            }}
          />
          <div
            className="ambient-window-glow glow-guild-top"
            style={{
              left: `${ambientLocations.guildTopWindow.left}px`,
              top: `${ambientLocations.guildTopWindow.top}px`,
              width: `${ambientLocations.guildTopWindow.width}px`,
              height: `${ambientLocations.guildTopWindow.height}px`,
            }}
          />
          <div
            className="ambient-window-glow glow-guild-mid"
            style={{
              left: `${ambientLocations.guildMidWindows.left}px`,
              top: `${ambientLocations.guildMidWindows.top}px`,
              width: `${ambientLocations.guildMidWindows.width}px`,
              height: `${ambientLocations.guildMidWindows.height}px`,
            }}
          />
          <div
            className="ambient-window-glow glow-guild-low"
            style={{
              left: `${ambientLocations.guildLowWindows.left}px`,
              top: `${ambientLocations.guildLowWindows.top}px`,
              width: `${ambientLocations.guildLowWindows.width}px`,
              height: `${ambientLocations.guildLowWindows.height}px`,
            }}
          />

          {/* Ground Light Pools Spilling onto Cobblestones */}
          <div
            className="light-pool-amber"
            style={{
              left: `${ambientLocations.tavernDoorGlow.centerX}px`,
              top: `${ambientLocations.tavernDoorGlow.centerY}px`,
              width: `${ambientLocations.tavernDoorGlow.width * 1.8}px`,
              height: `${ambientLocations.tavernDoorGlow.height}px`,
            }}
          />
          <div
            className="light-pool-amber"
            style={{
              left: `${ambientLocations.guildGroundGlow.centerX}px`,
              top: `${ambientLocations.guildGroundGlow.centerY}px`,
              width: `${ambientLocations.guildGroundGlow.width * 1.4}px`,
              height: `${ambientLocations.guildGroundGlow.height}px`,
              animationDelay: '1.3s',
            }}
          />

          {/* Drifting Ankh-Morpork Alleyway Mist */}
          <div
            className="ambient-alley-mist"
            style={{
              left: `${ambientLocations.alleyMist.left}px`,
              top: `${ambientLocations.alleyMist.top}px`,
              width: `${ambientLocations.alleyMist.width}px`,
              height: `${ambientLocations.alleyMist.height}px`,
            }}
          />

          {/* Drifting Octarine / Night Lantern Motes */}
          <span className="ambient-firefly mote-1" />
          <span className="ambient-firefly mote-2" />
          <span className="ambient-firefly mote-3" />
          <span className="ambient-firefly mote-4" />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            INTERACTIVE SCUMM WORLD HOTSPOTS (Tavern, Archway, Guild, Moon)
           ══════════════════════════════════════════════════════════════════ */}
        {projectedHotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className={`world-stage-hotspot hotspot-${hotspot.id}`}
            style={{
              left: `${hotspot.rect.left}px`,
              top: `${hotspot.rect.top}px`,
              width: `${hotspot.rect.width}px`,
              height: `${hotspot.rect.height}px`,
            }}
            onMouseEnter={() =>
              setHoveredItem({
                label: hotspot.label,
                verbText: `${hotspot.defaultHoverVerb} (Right-Click for Verbs)`,
              })
            }
            onMouseLeave={() => setHoveredItem(null)}
            onClick={(e) => handleWorldHotspotLeftClick(e, hotspot)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openWheelForTarget(e.clientX, e.clientY, getWorldHotspotTarget(hotspot));
            }}
            onTouchStart={(e) => handleTouchStart(() => getWorldHotspotTarget(hotspot), e)}
            onTouchEnd={handleTouchEnd}
            role="button"
            aria-label={hotspot.label}
          >
            <span className="hotspot-hover-tag">{hotspot.label}</span>
          </div>
        ))}

        {/* Floating World Reply Text (e.g. Bouncer shouting from behind Tavern Door) */}
        {worldSpeech && (
          <div
            className="floating-world-speech"
            style={{
              left: `${worldSpeech.x}px`,
              top: `${worldSpeech.y}px`,
              color: worldSpeech.color,
            }}
          >
            {worldSpeech.text}
          </div>
        )}

        <div className="cobblestone-path" />

        {/* Interactive Scholar NPC */}
        <ScholarNpc
          xPercent={SCHOLAR_X_PERCENT}
          name={SCHOLAR_INTERACTION_CONFIG.name}
          onMouseEnter={() =>
            setHoveredItem({
              label: SCHOLAR_INTERACTION_CONFIG.name,
              verbText: SCHOLAR_INTERACTION_CONFIG.hoverVerbText,
            })
          }
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

      {/*  Overlay  */}
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
          onClose={() => {
            if (dialogueTimerRef.current) {
              clearTimeout(dialogueTimerRef.current);
              dialogueTimerRef.current = null;
            }
            setIsSpeakingDialogue(false);
            setShowDialogueMenu(false);
          }}
          isSpeaking={isSpeakingDialogue}
        />
      )}

      {/* Character Render */}
      {showCharacter && !isInteracting && (
        <div className="character-container">
          <PixelArtCharacter
            position={characterPosition}
            targetX={walkTarget}
            baseYPosition={stageMetrics.characterBaseY}
            stageScale={stageMetrics.stageScale}
            moveSpeedPps={stageMetrics.moveSpeedPps}
            jumpHeight={stageMetrics.jumpHeight}
            onArrival={handleArrival}
            onPositionUpdate={updateCharacterPosition}
            roadBoundaries={stageMetrics.roadBoundaries}
            obstacles={scholarObstacles}
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

