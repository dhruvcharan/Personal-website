import React, { useState, useEffect, useRef } from "react";
import { REFERENCE_SCALE } from "../utils/stageGeometry";
import "../styles/PixelArtCharacter.css";

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

interface PixelArtCharacterProps {
  selectedLink?: string | null;
  position: Position;
  targetX?: number | null;
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

const JUMP_DURATION = 1050;

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
  const [animation, setAnimation] = useState<AnimationState>("idle");
  const [direction, setDirection] = useState<"left" | "right">("right");
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

  // Sync vertical baseline with parent whenever screen dimensions/metrics update
  useEffect(() => {
    if (!isJumping) {
      setCurrentPosition((prev) => ({
        ...prev,
        y: baseYPosition,
      }));
    }
  }, [baseYPosition, isJumping]);

  const getCharWidth = (): number => {
    return characterRef.current?.offsetWidth || Math.round(116 * stageScale);
  };

  const getCharHeight = (): number => {
    return characterRef.current?.offsetHeight || Math.round(129 * stageScale);
  };

  const clampXPosition = (prevX: number, nextX: number): number => {
    const charW = getCharWidth();
    const minX = roadBoundaries.left;
    const maxX = roadBoundaries.right - charW;
    let clamped = Math.max(minX, Math.min(maxX, nextX));

    const halfW = charW / 2;
    const charCenterX = prevX + halfW;
    const nextCenterX = clamped + halfW;

    // Obstacle Hitbox Collision Checks
    for (const obs of obstacles) {
      if (nextCenterX > charCenterX) {
        // Moving right -> check if crossing obstacle left boundary
        if (charCenterX <= obs.left && nextCenterX > obs.left) {
          clamped = obs.left - halfW;
          break;
        }
      } else if (nextCenterX < charCenterX) {
        // Moving left -> check if crossing obstacle right boundary
        if (charCenterX >= obs.right && nextCenterX < obs.right) {
          clamped = obs.right - halfW;
          break;
        }
      }
    }

    return clamped;
  };

  // Dust Particle Spawner on step
  const spawnDust = (x: number, y: number) => {
    const charW = getCharWidth();
    const charH = getCharHeight();
    const scaleFactor = stageScale / REFERENCE_SCALE;
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
    } else if (animation === "interact") {
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
          setAnimation("idle");
          scheduleNextIdleFlavor();
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
    if (movementFrameRef.current !== null) {
      cancelAnimationFrame(movementFrameRef.current);
    }
    lastKeyboardTimestampRef.current = null;
    keyboardAccumulatedDistanceRef.current = 0;

    const moveCharacter = (timestamp: number) => {
      if (lastKeyboardTimestampRef.current === null) {
        lastKeyboardTimestampRef.current = timestamp;
      }
      const dt = Math.min((timestamp - lastKeyboardTimestampRef.current) / 1000, 0.1);
      lastKeyboardTimestampRef.current = timestamp;

      const stepDistance = moveSpeedPps * dt;

      setCurrentPosition((prev) => {
        let rawNextX = prev.x;

        if (keyPressedRef.current.left) {
          rawNextX -= stepDistance;
          setDirection("left");
          setAnimation("move-left");
        } else if (keyPressedRef.current.right) {
          rawNextX += stepDistance;
          setDirection("right");
          setAnimation("move-right");
        } else {
          setAnimation("idle");
        }

        keyboardAccumulatedDistanceRef.current += stepDistance;
        const dustThreshold = 45 * (stageScale / REFERENCE_SCALE);
        if (keyboardAccumulatedDistanceRef.current >= dustThreshold) {
          keyboardAccumulatedDistanceRef.current = 0;
          spawnDust(prev.x, prev.y);
        }

        const clampedX = clampXPosition(prev.x, rawNextX);
        return { x: clampedX, y: isJumping ? prev.y : baseYPosition };
      });

      if (keyPressedRef.current.left || keyPressedRef.current.right) {
        movementFrameRef.current = requestAnimationFrame(moveCharacter);
      } else {
        lastKeyboardTimestampRef.current = null;
      }
    };

    movementFrameRef.current = requestAnimationFrame(moveCharacter);
  };

  // Delta-time based Point & Click Walk-To Target Loop
  useEffect(() => {
    if (targetX === null || targetX === undefined) return;

    if (targetWalkFrameRef.current !== null) {
      cancelAnimationFrame(targetWalkFrameRef.current);
      targetWalkFrameRef.current = null;
    }
    lastWalkTimestampRef.current = null;
    walkAccumulatedDistanceRef.current = 0;

    const stepTargetWalk = (timestamp: number) => {
      if (lastWalkTimestampRef.current === null) {
        lastWalkTimestampRef.current = timestamp;
      }
      const dt = Math.min((timestamp - lastWalkTimestampRef.current) / 1000, 0.1);
      lastWalkTimestampRef.current = timestamp;

      const stepDistance = moveSpeedPps * dt;

      setCurrentPosition((prev) => {
        const dx = targetX - prev.x;
        const dist = Math.abs(dx);

        if (dist <= stepDistance) {
          setAnimation("idle");
          if (targetWalkFrameRef.current !== null) {
            cancelAnimationFrame(targetWalkFrameRef.current);
            targetWalkFrameRef.current = null;
          }
          lastWalkTimestampRef.current = null;
          if (onArrival) {
            setTimeout(onArrival, 20);
          }
          return { x: clampXPosition(prev.x, targetX), y: baseYPosition };
        }

        const newDirection = dx > 0 ? "right" : "left";
        setDirection(newDirection);
        setAnimation(`move-${newDirection}`);

        walkAccumulatedDistanceRef.current += stepDistance;
        const dustThreshold = 45 * (stageScale / REFERENCE_SCALE);
        if (walkAccumulatedDistanceRef.current >= dustThreshold) {
          walkAccumulatedDistanceRef.current = 0;
          spawnDust(prev.x, prev.y);
        }

        const rawStepX = prev.x + (dx > 0 ? stepDistance : -stepDistance);
        const clampedX = clampXPosition(prev.x, rawStepX);

        // If collision or boundary stopped us from moving further toward target, arrive!
        if (Math.abs(clampedX - prev.x) < 0.2) {
          setAnimation("idle");
          if (targetWalkFrameRef.current !== null) {
            cancelAnimationFrame(targetWalkFrameRef.current);
            targetWalkFrameRef.current = null;
          }
          lastWalkTimestampRef.current = null;
          if (onArrival) {
            setTimeout(onArrival, 20);
          }
          return { x: clampedX, y: baseYPosition };
        }

        return { x: clampedX, y: baseYPosition };
      });

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
  }, [targetX, roadBoundaries, obstacles, moveSpeedPps, baseYPosition, stageScale]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isJumping) return;

      if (e.key === "ArrowLeft") {
        keyPressedRef.current.left = true;
      } else if (e.key === "ArrowRight") {
        keyPressedRef.current.right = true;
      } else if (e.key === " ") {
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
        setAnimation("idle");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isJumping, moveSpeedPps, baseYPosition, stageScale]);

  const handleJump = () => {
    if (isJumping) return;
    setIsJumping(true);
    setAnimation("jump");

    initialYPositionRef.current = currentPosition.y;
    const startTime = Date.now();

    const jumpAnimate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / JUMP_DURATION, 1);

      let jumpOffset = 0;
      if (progress < 0.5) {
        jumpOffset = easeOutQuad(progress * 2) * jumpHeight;
      } else {
        jumpOffset = (1 - easeInQuad((progress - 0.5) * 2)) * jumpHeight;
      }

      const newY = initialYPositionRef.current - jumpOffset;
      setCurrentPosition((prev) => ({ ...prev, y: newY }));

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

    setCurrentPosition((prev) => ({ ...prev, y: baseYPosition }));
    spawnDust(currentPosition.x, baseYPosition);

    if (keyPressedRef.current.left) {
      setAnimation("move-left");
    } else if (keyPressedRef.current.right) {
      setAnimation("move-right");
    } else {
      setAnimation("idle");
    }

    setIsJumping(false);
  };

  // Report position updates to parent
  useEffect(() => {
    if (
      onPositionUpdate &&
      (Math.abs(lastReportedPosition.current.x - currentPosition.x) > 0.5 ||
        Math.abs(lastReportedPosition.current.y - currentPosition.y) > 0.5)
    ) {
      lastReportedPosition.current = { ...currentPosition };
      onPositionUpdate(currentPosition);
    }
  }, [currentPosition, onPositionUpdate]);

  return (
    <div
      ref={characterRef}
      className={`pixel-art-character ${animation} facing-${direction}`}
      style={{
        transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
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

      {/* Dust Particles */}
      <div className="character-particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle dust"
            style={{
              left: `${p.x - currentPosition.x}px`,
              top: `${p.y - currentPosition.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelArtCharacter;