import React, { useState, useEffect, useRef } from "react";
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

const MOVE_SPEED = 6;
const JUMP_HEIGHT = 80;
const JUMP_DURATION = 1050;
const getBaseYPosition = () => window.innerHeight - 175;

const easeOutQuad = (t: number): number => -t * (t - 2);
const easeInQuad = (t: number): number => t * t;

const PixelArtCharacter: React.FC<PixelArtCharacterProps> = ({
  position,
  targetX = null,
  onArrival,
  onPositionUpdate,
  roadBoundaries = { left: 0, right: window.innerWidth },
  obstacles = [],
  isOpeningSatchel = false,
  speechText = null,
  isCastingWand = false,
  onSpeechComplete
}) => {
  const [currentPosition, setCurrentPosition] = useState<Position>({
    x: position.x || window.innerWidth * 0.2,
    y: getBaseYPosition(),
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
  const initialYPositionRef = useRef<number>(getBaseYPosition());
  const lastReportedPosition = useRef<Position>({ x: 0, y: 0 });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clampXPosition = (prevX: number, nextX: number): number => {
    const minX = roadBoundaries.left;
    const maxX = roadBoundaries.right - (characterRef.current?.offsetWidth || 64);
    let clamped = Math.max(minX, Math.min(maxX, nextX));

    const charCenterX = prevX + 96;
    const nextCenterX = clamped + 96;

    // Obstacle Hitbox Collision Checks
    for (const obs of obstacles) {
      if (nextCenterX > charCenterX) {
        // Moving right -> check if crossing obstacle left boundary
        if (charCenterX <= obs.left && nextCenterX > obs.left) {
          clamped = obs.left - 96;
          break;
        }
      } else if (nextCenterX < charCenterX) {
        // Moving left -> check if crossing obstacle right boundary
        if (charCenterX >= obs.right && nextCenterX < obs.right) {
          clamped = obs.right - 96;
          break;
        }
      }
    }

    return clamped;
  };

  // Dust Particle Spawner on step
  const spawnDust = (x: number, y: number) => {
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: x + 80 + (Math.random() * 20 - 10),
      y: y + 110,
      type: "dust",
      size: Math.random() * 5 + 3
    };
    setParticles(prev => [...prev.slice(-8), newParticle]);
  };

  // Handle Satchel & Reaching Action
  useEffect(() => {
    if (isOpeningSatchel || isCastingWand) {
      setAnimation("interact");
    } else if (animation === "interact") {
      setAnimation("idle");
    }
  }, [isOpeningSatchel, isCastingWand]);

  // Floating text timer
  useEffect(() => {
    if (speechText) {
      setDisplayedSpeech(speechText);
      const timer = setTimeout(() => {
        setDisplayedSpeech(null);
        if (onSpeechComplete) onSpeechComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [speechText, onSpeechComplete]);

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

  // Keyboard Movement
  const startKeyboardMovement = () => {
    if (movementFrameRef.current !== null) {
      cancelAnimationFrame(movementFrameRef.current);
    }

    let stepCount = 0;
    const moveCharacter = () => {
      setCurrentPosition((prev) => {
        let rawNextX = prev.x;

        if (keyPressedRef.current.left) {
          rawNextX -= MOVE_SPEED;
          setDirection("left");
          setAnimation("move-left");
        } else if (keyPressedRef.current.right) {
          rawNextX += MOVE_SPEED;
          setDirection("right");
          setAnimation("move-right");
        } else {
          setAnimation("idle");
        }

        stepCount++;
        if (stepCount % 12 === 0) {
          spawnDust(prev.x, prev.y);
        }

        const clampedX = clampXPosition(prev.x, rawNextX);
        return { x: clampedX, y: isJumping ? prev.y : getBaseYPosition() };
      });

      if (keyPressedRef.current.left || keyPressedRef.current.right) {
        movementFrameRef.current = requestAnimationFrame(moveCharacter);
      }
    };

    movementFrameRef.current = requestAnimationFrame(moveCharacter);
  };

  // Point & Click Walk-To Target Loop with Collision Clamping
  useEffect(() => {
    if (targetX === null || targetX === undefined) return;

    if (targetWalkFrameRef.current !== null) {
      cancelAnimationFrame(targetWalkFrameRef.current);
      targetWalkFrameRef.current = null;
    }

    let stepCount = 0;

    const stepTargetWalk = () => {
      setCurrentPosition((prev) => {
        const dx = targetX - prev.x;
        const dist = Math.abs(dx);

        if (dist <= MOVE_SPEED) {
          setAnimation("idle");
          if (targetWalkFrameRef.current !== null) {
            cancelAnimationFrame(targetWalkFrameRef.current);
            targetWalkFrameRef.current = null;
          }
          if (onArrival) {
            setTimeout(onArrival, 20);
          }
          return { x: clampXPosition(prev.x, targetX), y: getBaseYPosition() };
        }

        const newDirection = dx > 0 ? "right" : "left";
        setDirection(newDirection);
        setAnimation(`move-${newDirection}`);

        stepCount++;
        if (stepCount % 10 === 0) {
          spawnDust(prev.x, prev.y);
        }

        const rawStepX = prev.x + (dx > 0 ? MOVE_SPEED : -MOVE_SPEED);
        const clampedX = clampXPosition(prev.x, rawStepX);

        // If collision stopped us from moving further toward target, arrive!
        if (Math.abs(clampedX - prev.x) < 0.5) {
          setAnimation("idle");
          if (targetWalkFrameRef.current !== null) {
            cancelAnimationFrame(targetWalkFrameRef.current);
            targetWalkFrameRef.current = null;
          }
          if (onArrival) {
            setTimeout(onArrival, 20);
          }
          return { x: clampedX, y: getBaseYPosition() };
        }

        return { x: clampedX, y: getBaseYPosition() };
      });

      targetWalkFrameRef.current = requestAnimationFrame(stepTargetWalk);
    };

    targetWalkFrameRef.current = requestAnimationFrame(stepTargetWalk);

    return () => {
      if (targetWalkFrameRef.current !== null) {
        cancelAnimationFrame(targetWalkFrameRef.current);
        targetWalkFrameRef.current = null;
      }
    };
  }, [targetX, roadBoundaries, obstacles]);

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
        setAnimation("idle");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isJumping]);

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
        jumpOffset = easeOutQuad(progress * 2) * JUMP_HEIGHT;
      } else {
        jumpOffset = (1 - easeInQuad((progress - 0.5) * 2)) * JUMP_HEIGHT;
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

    const baseYPosition = getBaseYPosition();
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

  // Report position updates
  useEffect(() => {
    if (
      onPositionUpdate &&
      (Math.abs(lastReportedPosition.current.x - currentPosition.x) > 1 ||
        Math.abs(lastReportedPosition.current.y - currentPosition.y) > 1)
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
      {/* Clean Floating Text directly above character's head */}
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
        {particles.map(p => (
          <div
            key={p.id}
            className="particle dust"
            style={{
              left: `${p.x - currentPosition.x}px`,
              top: `${p.y - currentPosition.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelArtCharacter;