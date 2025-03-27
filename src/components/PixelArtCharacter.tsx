import React, { useState, useEffect, useRef } from "react";
import "../styles/PixelArtCharacter.css";

// Import all image assets
import characterIdle from "../assets/character-idle.png";
import characterIdle2 from "../assets/character-idle-2.png";
import jmp1 from "../assets/jmp1.png";
import jmp2 from "../assets/jmp2.png";
import jmp3 from "../assets/jmp3.png";
import moveLeft1 from "../assets/move-left1.png";
import moveLeft2 from "../assets/move-left2.png";
import moveLeft3 from "../assets/move-left3.png";
import moveLeft4 from "../assets/move-left4.png";
import moveRight1 from "../assets/move-right1.png";
import moveRight2 from "../assets/move-right2.png";
import moveRight3 from "../assets/move-right3.png";
import moveRight4 from "../assets/move-right4.png";

interface Position {
  x: number;
  y: number;
}

interface PixelArtCharacterProps {
  selectedLink: string | null;
  position: Position;
  onJump?: () => void;
  onPositionUpdate?: (position: Position) => void; // New prop
}

const JUMP_BUFFER = 100;
const MOVE_SPEED = 2;
const JUMP_HEIGHT = 80;
const JUMP_DURATION = 500;
const getBaseYPosition = () => window.innerHeight - 130;
const BASE_Y_POSITION = getBaseYPosition();

// Easing functions
const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

const easeOutQuad = (t: number): number => {
  return -t * (t - 2);
};

const easeInQuad = (t: number): number => {
  return t * t;
};

const PixelArtCharacter: React.FC<PixelArtCharacterProps> = ({
  selectedLink,
  position,
  onJump,
  onPositionUpdate,
}) => {
  
  const [currentPosition, setCurrentPosition] = useState<Position>({
    x: window.innerWidth * 0.2, 
    y: BASE_Y_POSITION,
  });
  const [animation, setAnimation] = useState<
    "idle" | "jump" | "move-left" | "move-right"
  >("idle");
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isJumping, setIsJumping] = useState(false);
  const characterRef = useRef<HTMLDivElement>(null);

  const keyPressedRef = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const movementFrameRef = useRef<number | null>(null);
  const jumpFrameRef = useRef<number | null>(null);
  const autoMoveFrameRef = useRef<number | null>(null);
  const initialYPositionRef = useRef<number>(BASE_Y_POSITION);

  const getScreenBoundaries = () => {
    if (!characterRef.current)
      return { minX: 0, maxX: window.innerWidth - 128 };
    const characterWidth = characterRef.current.offsetWidth;
    return {
      minX: 0,
      maxX: window.innerWidth - characterWidth,
    };
  };

  const clampPosition = (pos: Position): Position => {
    const boundaries = getScreenBoundaries();
    return {
      x: Math.max(boundaries.minX, Math.min(boundaries.maxX, pos.x)),
      y: Math.max(0, Math.min(window.innerHeight - 128, pos.y)),
    };
  };

  const startMovement = () => {
    
    if (movementFrameRef.current !== null) {
      cancelAnimationFrame(movementFrameRef.current);
      movementFrameRef.current = null;
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

        return clampPosition({ ...prev, x: newX });
      });

      if (keyPressedRef.current.left || keyPressedRef.current.right) {
        movementFrameRef.current = requestAnimationFrame(moveCharacter);
      }
    };

    movementFrameRef.current = requestAnimationFrame(moveCharacter);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isJumping) return;

      switch (e.key) {
        case "ArrowLeft":
          keyPressedRef.current.left = true;
          break;
        case "ArrowRight":
          keyPressedRef.current.right = true;
          break;
        case " ":
          handleJump();
          break;
      }
      
      if (
        (keyPressedRef.current.left || keyPressedRef.current.right) &&
        movementFrameRef.current === null
      ) {
        startMovement();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          keyPressedRef.current.left = false;
          break;
        case "ArrowRight":
          keyPressedRef.current.right = false;
          break;
      }

      if (
        !keyPressedRef.current.left &&
        !keyPressedRef.current.right &&
        movementFrameRef.current !== null
      ) {
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

    if (jumpFrameRef.current !== null) {
      cancelAnimationFrame(jumpFrameRef.current);
    }

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

      if (onJump) {
        const dx = position.x - currentPosition.x;
        const dy = position.y - currentPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < JUMP_BUFFER) {
          onJump();
          completeJump();
          return;
        }
      }

      if (progress < 1) {
        jumpFrameRef.current = requestAnimationFrame(jumpAnimate);
      } else {
        completeJump();
      }
    };

    const completeJump = () => {
      if (jumpFrameRef.current !== null) {
        cancelAnimationFrame(jumpFrameRef.current);
        jumpFrameRef.current = null;
      }

      setCurrentPosition((prev) => ({
        ...prev,
        y: initialYPositionRef.current,
      }));

      if (keyPressedRef.current.left) {
        setAnimation("move-left");
      } else if (keyPressedRef.current.right) {
        setAnimation("move-right");
      } else {
        setAnimation("idle");
      }

      setIsJumping(false);
    };

    jumpFrameRef.current = requestAnimationFrame(jumpAnimate);
  };

  useEffect(() => {
    if (autoMoveFrameRef.current !== null) {
      cancelAnimationFrame(autoMoveFrameRef.current);
      autoMoveFrameRef.current = null;
    }

    if (!selectedLink) {
      return;
    }

    console.log("Moving to selected link:", selectedLink);

    if (movementFrameRef.current !== null) {
      cancelAnimationFrame(movementFrameRef.current);
      movementFrameRef.current = null;
    }

    // Force stop any jumping
    if (jumpFrameRef.current !== null) {
      cancelAnimationFrame(jumpFrameRef.current);
      jumpFrameRef.current = null;
      setIsJumping(false);
    }

    const moveToPosition = () => {
      const dx = position.x - currentPosition.x;
      const newDirection = dx > 0 ? "right" : "left";
      setDirection(newDirection);

      const moveAnimation: "idle" | "move-left" | "move-right" =
        dx !== 0 ? `move-${newDirection}` : "idle";
      setAnimation(moveAnimation);

      const distance = Math.abs(dx);
      const duration = distance * 5;

      const startTime = Date.now();
      const startX = currentPosition.x;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = easeInOutQuad(progress);
        const newX = startX + dx * easedProgress;
        setCurrentPosition((prev) => clampPosition({ ...prev, x: newX }));

        if (progress < 1) {
          autoMoveFrameRef.current = requestAnimationFrame(animate);
        } else {
          setAnimation("idle");
          // Store current Y position before jumping
          initialYPositionRef.current = currentPosition.y;
          handleJump();
          autoMoveFrameRef.current = null;
        }
      };

      autoMoveFrameRef.current = requestAnimationFrame(animate);
    };

    moveToPosition();

    return () => {
      if (autoMoveFrameRef.current !== null) {
        cancelAnimationFrame(autoMoveFrameRef.current);
        autoMoveFrameRef.current = null;
      }
    };
  }, [selectedLink, position]);

  
  useEffect(() => {
    const handleResize = () => {
      const newBaseY = window.innerHeight - 130;
      // const newBaseX = window.innerWidth * 0.2; 

      setCurrentPosition((prev) => {
        const shouldUpdateY = Math.abs(prev.y - initialYPositionRef.current) < 2;
        
        return clampPosition({
          x: prev.x, 
          y: shouldUpdateY ? newBaseY : prev.y,
        });
      });

      initialYPositionRef.current = newBaseY;
    };
    console.log("Resize Triggered")

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (movementFrameRef.current !== null) {
        cancelAnimationFrame(movementFrameRef.current);
      }
      if (jumpFrameRef.current !== null) {
        cancelAnimationFrame(jumpFrameRef.current);
      }
      if (autoMoveFrameRef.current !== null) {
        cancelAnimationFrame(autoMoveFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (onPositionUpdate) {
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

