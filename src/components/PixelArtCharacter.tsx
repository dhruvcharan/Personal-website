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

interface PixelArtCharacterProps {
  selectedLink?: string | null;
  position: Position;
  targetX?: number | null;
  onArrival?: () => void;
  onJump?: () => void;
  onPositionUpdate?: (position: Position) => void;
  roadBoundaries?: RoadBoundaries;
  isOpeningSatchel?: boolean;
}

const MOVE_SPEED = 6;
const JUMP_HEIGHT = 80;
const JUMP_DURATION = 1050;
const getBaseYPosition = () => window.innerHeight - 175;

// Easing functions
const easeOutQuad = (t: number): number => -t * (t - 2);
const easeInQuad = (t: number): number => t * t;

const PixelArtCharacter: React.FC<PixelArtCharacterProps> = ({
  position,
  targetX = null,
  onArrival,
  onPositionUpdate,
  roadBoundaries = { left: 0, right: window.innerWidth },
  isOpeningSatchel = false
}) => {
  const [currentPosition, setCurrentPosition] = useState<Position>({
    x: position.x || window.innerWidth * 0.2, 
    y: getBaseYPosition(),
  });
  const [animation, setAnimation] = useState<"idle" | "jump" | "move-left" | "move-right" | "interact">("idle");
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isJumping, setIsJumping] = useState(false);
  const characterRef = useRef<HTMLDivElement>(null);

  const keyPressedRef = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const movementFrameRef = useRef<number | null>(null);
  const jumpFrameRef = useRef<number | null>(null);
  const targetWalkFrameRef = useRef<number | null>(null);
  const initialYPositionRef = useRef<number>(getBaseYPosition());
  const lastReportedPosition = useRef<Position>({ x: 0, y: 0 });

  const clampXPosition = (xPos: number): number => {
    const minX = roadBoundaries.left;
    const maxX = roadBoundaries.right - (characterRef.current?.offsetWidth || 64);
    return Math.max(minX, Math.min(maxX, xPos));
  };

  useEffect(() => {
    if (isOpeningSatchel) {
      setAnimation("interact");
    } else if (animation === "interact") {
      setAnimation("idle");
    }
  }, [isOpeningSatchel]);

  // Keyboard Movement Loop
  const startKeyboardMovement = () => {
    if (movementFrameRef.current !== null) {
      cancelAnimationFrame(movementFrameRef.current);
    }

    const moveCharacter = () => {
      setCurrentPosition((prev) => {
        let newX = prev.x;

        if (keyPressedRef.current.left) {
          newX -= MOVE_SPEED;
          setDirection("left");
          setAnimation("move-left");
        } else if (keyPressedRef.current.right) {
          newX += MOVE_SPEED;
          setDirection("right");
          setAnimation("move-right");
        } else {
          setAnimation("idle");
        }

        const clampedX = clampXPosition(newX);
        return { x: clampedX, y: isJumping ? prev.y : getBaseYPosition() };
      });

      if (keyPressedRef.current.left || keyPressedRef.current.right) {
        movementFrameRef.current = requestAnimationFrame(moveCharacter);
      }
    };

    movementFrameRef.current = requestAnimationFrame(moveCharacter);
  };

  // Point & Click Walk-To Target Loop
  useEffect(() => {
    if (targetX === null || targetX === undefined) return;

    if (targetWalkFrameRef.current !== null) {
      cancelAnimationFrame(targetWalkFrameRef.current);
      targetWalkFrameRef.current = null;
    }

    const clampedTargetX = clampXPosition(targetX);

    const stepTargetWalk = () => {
      setCurrentPosition((prev) => {
        const dx = clampedTargetX - prev.x;
        const dist = Math.abs(dx);

        if (dist <= MOVE_SPEED) {
          // Arrived!
          setAnimation("idle");
          if (targetWalkFrameRef.current !== null) {
            cancelAnimationFrame(targetWalkFrameRef.current);
            targetWalkFrameRef.current = null;
          }
          if (onArrival) {
            setTimeout(onArrival, 20);
          }
          return { x: clampedTargetX, y: getBaseYPosition() };
        }

        const newDirection = dx > 0 ? "right" : "left";
        setDirection(newDirection);
        setAnimation(`move-${newDirection}`);

        const stepX = prev.x + (dx > 0 ? MOVE_SPEED : -MOVE_SPEED);
        return { x: clampXPosition(stepX), y: getBaseYPosition() };
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
  }, [targetX, roadBoundaries]);

  // Keyboard Event Listeners
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
      <div className="character-sprite" />
    </div>
  );
};

export default PixelArtCharacter;