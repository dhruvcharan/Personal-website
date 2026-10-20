import React, { useState, useEffect, useRef } from "react";
import { REFERENCE_SCALE } from "../utils/stageGeometry";
import "../styles/PixelArtCharacter.css";

import idleSprite1 from "../assets/character-idle.png";
import idleSprite2 from "../assets/character-idle-2.png";
import interactSprite from "../assets/interact.png";
import jmpSprite1 from "../assets/jmp1.png";
import jmpSprite2 from "../assets/jmp2.png";
import jmpSprite3 from "../assets/jmp3.png";
import moveLeft1 from "../assets/move-left1.png";
import moveLeft2 from "../assets/move-left2.png";
import moveLeft3 from "../assets/move-left3.png";
import moveLeft4 from "../assets/move-left4.png";
import moveRight1 from "../assets/move-right1.png";
import moveRight2 from "../assets/move-right2.png";
import moveRight3 from "../assets/move-right3.png";
import moveRight4 from "../assets/move-right4.png";

const CHARACTER_SPRITE_URLS = [
  idleSprite1,
  idleSprite2,
  interactSprite,
  jmpSprite1,
  jmpSprite2,
  jmpSprite3,
  moveLeft1,
  moveLeft2,
  moveLeft3,
  moveLeft4,
  moveRight1,
  moveRight2,
  moveRight3,
  moveRight4,
];

interface Position {
  x: number;
  y: number;
}

interface RoadBoundaries {
  left: number;
  right: number;
}

export interface ObstacleHitbox {
  id: string;
  left: number;
  right: number;
}

export interface WalkTarget {
  x: number;
  id: number;
}

interface PixelArtCharacterProps {
  selectedLink?: string | null;
  position: Position;
  targetX?: number | WalkTarget | null;
  baseYPosition: number;
  stageScale?: number;
  moveSpeedPps?: number;
  jumpHeight?: number;
  onArrival?: () => void;
  onJump?: () => void;
  onPositionUpdate?: (position: Position) => void;
  roadBoundaries?: RoadBoundaries;
  obstacles?: ObstacleHitbox[];
  isOpeningSatchel?: boolean;
  speechText?: string | null;
  isCastingWand?: boolean;
  onSpeechComplete?: () => void;
}

type IdleFlavor = "idle" | "idle-ponder" | "idle-fidget" | "idle-blink";
type AnimationState = IdleFlavor | "jump" | "move-left" | "move-right" | "interact";

interface Particle {
  id: number;
  x: number;
  y: number;
  type: "dust";
  size: number;
}

const JUMP_DURATION = 600;

const easeOutQuad = (t: number): number => -t * (t - 2);
const easeInQuad = (t: number): number => t * t;

const PixelArtCharacter: React.FC<PixelArtCharacterProps> = ({
  position,
  targetX = null,
  baseYPosition,
  stageScale = 1.1,
  moveSpeedPps = 550,
  jumpHeight = 80,
  onArrival,
  onPositionUpdate,
  roadBoundaries = { left: 0, right: window.innerWidth },
  obstacles = [],
  isOpeningSatchel = false,
  speechText = null,
  isCastingWand = false,
}) => {
  const [currentPosition, setCurrentPosition] = useState<Position>({
    x: position.x || window.innerWidth * 0.2,
    y: baseYPosition,
  });
  const [animation, setAnimationState] = useState<AnimationState>("idle");
  const [direction, setDirectionState] = useState<"left" | "right">("right");
  const [isJumping, setIsJumping] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [displayedSpeech, setDisplayedSpeech] = useState<string | null>(null);

  const characterRef = useRef<HTMLDivElement>(null);
  const keyPressedRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const movementFrameRef = useRef<number | null>(null);
  const jumpFrameRef = useRef<number | null>(null);
  const targetWalkFrameRef = useRef<number | null>(null);
  const lastKeyboardTimestampRef = useRef<number | null>(null);
  const lastWalkTimestampRef = useRef<number | null>(null);
  const keyboardAccumulatedDistanceRef = useRef<number>(0);
  const walkAccumulatedDistanceRef = useRef<number>(0);
  const initialYPositionRef = useRef<number>(baseYPosition);
  const lastReportedPosition = useRef<Position>({ x: 0, y: 0 });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPositionRef = useRef<Position>(currentPosition);
  const animationRef = useRef<AnimationState>("idle");
  const directionRef = useRef<"left" | "right">("right");
  const isJumpingRef = useRef<boolean>(false);

  // Keep latest mutable props in refs to prevent tearing down rAF loops on re-renders
  const roadBoundariesRef = useRef<RoadBoundaries>(roadBoundaries);
  const obstaclesRef = useRef<ObstacleHitbox[]>(obstacles);
  const moveSpeedPpsRef = useRef<number>(moveSpeedPps);
  const baseYPositionRef = useRef<number>(baseYPosition);
  const stageScaleRef = useRef<number>(stageScale);
  const onArrivalRef = useRef<(() => void) | undefined>(onArrival);
  const onPositionUpdateRef = useRef<((position: Position) => void) | undefined>(onPositionUpdate);

  // Preload all character sprite frames on mount to prevent first-cycle blank flashes
  useEffect(() => {
    CHARACTER_SPRITE_URLS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const setAnimation = (next: AnimationState) => {
    if (animationRef.current !== next) {
      animationRef.current = next;
      setAnimationState(next);
    }
  };

  const setDirection = (next: "left" | "right") => {
    if (directionRef.current !== next) {
      directionRef.current = next;
      setDirectionState(next);
    }
  };

  const applyTransformAndReport = (nextPos: Position, commitState: boolean = false) => {
    currentPositionRef.current = nextPos;
    if (characterRef.current) {
      characterRef.current.style.transform = `translate3d(${nextPos.x}px, ${nextPos.y}px, 0)`;
    }
    if (
      onPositionUpdateRef.current &&
      (Math.abs(lastReportedPosition.current.x - nextPos.x) > 0.5 ||
        Math.abs(lastReportedPosition.current.y - nextPos.y) > 0.5)
    ) {
      lastReportedPosition.current = { ...nextPos };
      onPositionUpdateRef.current(nextPos);
    }
    if (commitState) {
      setCurrentPosition(nextPos);
    }
  };

  useEffect(() => {
    roadBoundariesRef.current = roadBoundaries;
  }, [roadBoundaries]);

  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  useEffect(() => {
    moveSpeedPpsRef.current = moveSpeedPps;
  }, [moveSpeedPps]);

  useEffect(() => {
    baseYPositionRef.current = baseYPosition;
  }, [baseYPosition]);

  useEffect(() => {
    stageScaleRef.current = stageScale;
  }, [stageScale]);

  useEffect(() => {
    onArrivalRef.current = onArrival;
  }, [onArrival]);

  useEffect(() => {
    onPositionUpdateRef.current = onPositionUpdate;
  }, [onPositionUpdate]);

  // Sync position when parent resizes or remounts character
  useEffect(() => {
    if (!isJumpingRef.current) {
      const syncedPos = { x: position.x, y: baseYPosition };
      currentPositionRef.current = syncedPos;
      setCurrentPosition(syncedPos);
      if (characterRef.current) {
        characterRef.current.style.transform = `translate3d(${syncedPos.x}px, ${syncedPos.y}px, 0)`;
      }
    }
  }, [position.x, baseYPosition]);

  const getCharWidth = (): number => {
    return characterRef.current?.offsetWidth || Math.round(116 * stageScaleRef.current);
  };

  const getCharHeight = (): number => {
    return characterRef.current?.offsetHeight || Math.round(129 * stageScaleRef.current);
  };

  const clampXPosition = (prevX: number, nextX: number): number => {
    const charW = getCharWidth();
    const minX = roadBoundariesRef.current.left;
    const maxX = roadBoundariesRef.current.right - charW;
    let clamped = Math.max(minX, Math.min(maxX, nextX));

    // Obstacle Hitbox Collision Checks
    for (const obs of obstaclesRef.current) {
      const prevRight = prevX + charW;
      const nextRight = clamped + charW;

      // Moving right -> check if crossing into obstacle left boundary
      if (prevRight <= obs.left && nextRight > obs.left) {
        clamped = obs.left - charW;
      }
      // Moving left -> check if crossing into obstacle right boundary
      else if (prevX >= obs.right && clamped < obs.right) {
        clamped = obs.right;
      }
    }

    return clamped;
  };

  // Dust Particle Spawner on step (in fixed stage coordinates)
  const spawnDust = (x: number, y: number) => {
    const charW = getCharWidth();
    const charH = getCharHeight();
    const scaleFactor = stageScaleRef.current / REFERENCE_SCALE;
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: x + charW * 0.55 + (Math.random() * 20 - 10) * scaleFactor,
      y: y + charH * 0.9,
      type: "dust",
      size: (Math.random() * 5 + 3) * scaleFactor,
    };
    setParticles((prev) => [...prev.slice(-8), newParticle]);
  };

  // Handle Satchel & Reaching Action
  useEffect(() => {
    if (isOpeningSatchel || isCastingWand) {
      setAnimation("interact");
    } else if (animationRef.current === "interact") {
      setAnimation("idle");
    }
  }, [isOpeningSatchel, isCastingWand]);

  // Floating text sync with parent
  useEffect(() => {
    setDisplayedSpeech(speechText || null);
  }, [speechText]);

  // Subtle Idle Flavor Loop
  useEffect(() => {
    if (animation.startsWith("move") || animation === "jump" || isOpeningSatchel || isCastingWand) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    const scheduleNextIdleFlavor = () => {
      idleTimerRef.current = setTimeout(() => {
        const flavors: IdleFlavor[] = ["idle-ponder", "idle-fidget", "idle-blink"];
        const chosenFlavor = flavors[Math.floor(Math.random() * flavors.length)];

        setAnimation(chosenFlavor);

        setTimeout(() => {
          if (animationRef.current.startsWith("idle")) {
            setAnimation("idle");
            scheduleNextIdleFlavor();
          }
        }, 1800);
      }, 5000 + Math.random() * 4000);
    };

    scheduleNextIdleFlavor();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [animation, isOpeningSatchel, isCastingWand]);

  // Delta-time based Keyboard Movement
  const startKeyboardMovement = () => {
    if (targetWalkFrameRef.current !== null) {
      cancelAnimationFrame(targetWalkFrameRef.current);
      targetWalkFrameRef.current = null;
    }
    lastWalkTimestampRef.current = null;

    if (movementFrameRef.current !== null) {
      cancelAnimationFrame(movementFrameRef.current);
    }
    lastKeyboardTimestampRef.current = null;
    keyboardAccumulatedDistanceRef.current = 0;

    const moveCharacter = (timestamp: number) => {
      if (lastKeyboardTimestampRef.current === null) {
        lastKeyboardTimestampRef.current = timestamp;
        movementFrameRef.current = requestAnimationFrame(moveCharacter);
        return;
      }
      const dt = Math.min((timestamp - lastKeyboardTimestampRef.current) / 1000, 0.1);
      lastKeyboardTimestampRef.current = timestamp;

      const currentSpeed = moveSpeedPpsRef.current;
      const currentScale = stageScaleRef.current;
      const currentBaseY = baseYPositionRef.current;
      const stepDistance = currentSpeed * dt;

      const curX = currentPositionRef.current.x;
      let rawNextX = curX;

      if (keyPressedRef.current.left) {
        setDirection("left");
        if (!isJumpingRef.current) {
          rawNextX -= stepDistance;
          setAnimation("move-left");
        }
      } else if (keyPressedRef.current.right) {
        setDirection("right");
        if (!isJumpingRef.current) {
          rawNextX += stepDistance;
          setAnimation("move-right");
        }
      } else if (!isJumpingRef.current) {
        setAnimation("idle");
      }

      if (!isJumpingRef.current) {
        keyboardAccumulatedDistanceRef.current += stepDistance;
        const dustThreshold = 45 * (currentScale / REFERENCE_SCALE);
        if (keyboardAccumulatedDistanceRef.current >= dustThreshold) {
          keyboardAccumulatedDistanceRef.current = 0;
          spawnDust(curX, currentBaseY);
        }

        const clampedX = clampXPosition(curX, rawNextX);
        const keepMoving = keyPressedRef.current.left || keyPressedRef.current.right;
        applyTransformAndReport({ x: clampedX, y: currentBaseY }, !keepMoving);
      }

      if (keyPressedRef.current.left || keyPressedRef.current.right) {
        movementFrameRef.current = requestAnimationFrame(moveCharacter);
      } else {
        movementFrameRef.current = null;
        lastKeyboardTimestampRef.current = null;
      }
    };

    movementFrameRef.current = requestAnimationFrame(moveCharacter);
  };

  // Delta-time based Point & Click Walk-To Target Loop
  useEffect(() => {
    const targetVal = typeof targetX === "object" && targetX !== null ? targetX.x : targetX;

    if (targetVal === null || targetVal === undefined) {
      if (targetWalkFrameRef.current !== null) {
        cancelAnimationFrame(targetWalkFrameRef.current);
        targetWalkFrameRef.current = null;
      }
      lastWalkTimestampRef.current = null;
      return;
    }

    if (targetWalkFrameRef.current !== null) {
      cancelAnimationFrame(targetWalkFrameRef.current);
      targetWalkFrameRef.current = null;
    }
    lastWalkTimestampRef.current = null;
    walkAccumulatedDistanceRef.current = 0;

    const stepTargetWalk = (timestamp: number) => {
      if (lastWalkTimestampRef.current === null) {
        lastWalkTimestampRef.current = timestamp;
        targetWalkFrameRef.current = requestAnimationFrame(stepTargetWalk);
        return;
      }
      const dt = Math.min((timestamp - lastWalkTimestampRef.current) / 1000, 0.1);
      lastWalkTimestampRef.current = timestamp;

      const currentSpeed = moveSpeedPpsRef.current;
      const currentScale = stageScaleRef.current;
      const currentBaseY = baseYPositionRef.current;
      const stepDistance = currentSpeed * dt;

      const curX = currentPositionRef.current.x;
      const dx = targetVal - curX;
      const dist = Math.abs(dx);

      if (dist <= Math.max(stepDistance, 1.5)) {
        const finalX = clampXPosition(curX, targetVal);
        applyTransformAndReport({ x: finalX, y: currentPositionRef.current.y }, true);
        if (!isJumpingRef.current) setAnimation("idle");
        targetWalkFrameRef.current = null;
        lastWalkTimestampRef.current = null;
        if (onArrivalRef.current) {
          setTimeout(onArrivalRef.current, 20);
        }
        return;
      }

      const newDirection = dx > 0 ? "right" : "left";
      setDirection(newDirection);
      if (!isJumpingRef.current) {
        setAnimation(`move-${newDirection}`);
      }

      walkAccumulatedDistanceRef.current += stepDistance;
      const dustThreshold = 45 * (currentScale / REFERENCE_SCALE);
      if (walkAccumulatedDistanceRef.current >= dustThreshold && !isJumpingRef.current) {
        walkAccumulatedDistanceRef.current = 0;
        spawnDust(curX, currentBaseY);
      }

      const rawStepX = curX + (dx > 0 ? stepDistance : -stepDistance);
      const clampedX = clampXPosition(curX, rawStepX);

      // If collision or boundary stopped us from moving further toward target, arrive!
      if (stepDistance > 0.5 && Math.abs(clampedX - curX) < 0.2) {
        applyTransformAndReport({ x: clampedX, y: currentPositionRef.current.y }, true);
        if (!isJumpingRef.current) setAnimation("idle");
        targetWalkFrameRef.current = null;
        lastWalkTimestampRef.current = null;
        if (onArrivalRef.current) {
          setTimeout(onArrivalRef.current, 20);
        }
        return;
      }

      const nextY = isJumpingRef.current ? currentPositionRef.current.y : currentBaseY;
      applyTransformAndReport({ x: clampedX, y: nextY }, false);
      targetWalkFrameRef.current = requestAnimationFrame(stepTargetWalk);
    };

    targetWalkFrameRef.current = requestAnimationFrame(stepTargetWalk);

    return () => {
      if (targetWalkFrameRef.current !== null) {
        cancelAnimationFrame(targetWalkFrameRef.current);
        targetWalkFrameRef.current = null;
      }
      lastWalkTimestampRef.current = null;
    };
  }, [targetX]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        keyPressedRef.current.left = true;
        setDirection("left");
      } else if (e.key === "ArrowRight") {
        keyPressedRef.current.right = true;
        setDirection("right");
      } else if (e.key === " " && !isJumpingRef.current) {
        e.preventDefault();
        handleJump();
      }

      if ((keyPressedRef.current.left || keyPressedRef.current.right) && movementFrameRef.current === null) {
        startKeyboardMovement();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keyPressedRef.current.left = false;
      if (e.key === "ArrowRight") keyPressedRef.current.right = false;

      if (!keyPressedRef.current.left && !keyPressedRef.current.right && movementFrameRef.current !== null) {
        cancelAnimationFrame(movementFrameRef.current);
        movementFrameRef.current = null;
        lastKeyboardTimestampRef.current = null;
        setCurrentPosition({ ...currentPositionRef.current });
        if (!isJumpingRef.current) {
          setAnimation("idle");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [jumpHeight]);

  const handleJump = () => {
    if (isJumpingRef.current) return;
    isJumpingRef.current = true;
    setIsJumping(true);
    setAnimation("jump");

    initialYPositionRef.current = baseYPositionRef.current;
    const startTime = performance.now();
    let lastJumpTime = startTime;

    const jumpAnimate = (now: number) => {
      const elapsed = now - startTime;
      const dt = Math.min((now - lastJumpTime) / 1000, 0.1);
      lastJumpTime = now;
      const progress = Math.min(elapsed / JUMP_DURATION, 1);

      let jumpOffset = 0;
      if (progress < 0.5) {
        jumpOffset = easeOutQuad(progress * 2) * jumpHeight;
      } else {
        jumpOffset = (1 - easeInQuad((progress - 0.5) * 2)) * jumpHeight;
      }

      const newY = initialYPositionRef.current - jumpOffset;

      // Move forward horizontally during jump unless point-and-click walk is already driving X
      let nextX = currentPositionRef.current.x;
      if (targetWalkFrameRef.current === null) {
        const isHoldingArrow = keyPressedRef.current.left || keyPressedRef.current.right;
        const forwardSpeed = moveSpeedPpsRef.current * (isHoldingArrow ? 0.9 : 0.52);
        const dirSign = keyPressedRef.current.left
          ? -1
          : keyPressedRef.current.right
            ? 1
            : directionRef.current === "right"
              ? 1
              : -1;
        nextX = clampXPosition(nextX, nextX + dirSign * forwardSpeed * dt);
      }

      applyTransformAndReport({ x: nextX, y: newY }, false);

      if (progress < 1) {
        jumpFrameRef.current = requestAnimationFrame(jumpAnimate);
      } else {
        completeJump();
      }
    };

    jumpFrameRef.current = requestAnimationFrame(jumpAnimate);
  };

  const completeJump = () => {
    if (jumpFrameRef.current !== null) {
      cancelAnimationFrame(jumpFrameRef.current);
      jumpFrameRef.current = null;
    }

    const landedY = baseYPositionRef.current;
    const landedX = currentPositionRef.current.x;
    isJumpingRef.current = false;
    setIsJumping(false);

    applyTransformAndReport({ x: landedX, y: landedY }, true);
    spawnDust(landedX, landedY);

    if (keyPressedRef.current.left) {
      setAnimation("move-left");
    } else if (keyPressedRef.current.right) {
      setAnimation("move-right");
    } else {
      setAnimation("idle");
    }
  };

  return (
    <>
      <div
        ref={characterRef}
        className={`pixel-art-character ${animation} facing-${direction}`}
        style={{
          transform: `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0)`,
        }}
      >
        {/* Floating Speech directly above character's head */}
        {displayedSpeech && (
          <div className="floating-character-text">
            {displayedSpeech}
          </div>
        )}

        {/* Subtle Ponder '?' icon */}
        {animation === "idle-ponder" && (
          <div className="ponder-thought-bubble">?</div>
        )}

        {/* Ground shadow beneath character */}
        <div className="character-ground-shadow" />

        {/* Character Sprite Box */}
        <div className="character-sprite" />
      </div>

      {/* Stage-Space Dust Particles */}
      <div className="character-particles" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle dust"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default PixelArtCharacter;