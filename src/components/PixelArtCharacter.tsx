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

interface RoadBoundaries {
  left: number;
  right: number;
}

interface PixelArtCharacterProps {
  selectedLink: string | null;
  position: Position;
  onJump?: () => void;
  onPositionUpdate?: (position: Position) => void;
  roadBoundaries?: RoadBoundaries;
}

const JUMP_BUFFER = 100;
const MOVE_SPEED = 5;
const JUMP_HEIGHT = 80;
const JUMP_DURATION = 1050;
const getBaseYPosition = () => window.innerHeight - 175;

// Easing functions
const easeInOutQuad = (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const easeOutQuad = (t: number): number => -t * (t - 2);
const easeInQuad = (t: number): number => t * t;

const PixelArtCharacter: React.FC<PixelArtCharacterProps> = ({
  selectedLink,
  position,
  onJump,
  onPositionUpdate,
  roadBoundaries = { left: 0, right: window.innerWidth }
}) => {
  console.log('Component rendering with props:', { selectedLink, position, roadBoundaries });
  
  const [currentPosition, setCurrentPosition] = useState<Position>({
    x: window.innerWidth * 0.2, 
    y: getBaseYPosition(),
  });
  const [animation, setAnimation] = useState<"idle" | "jump" | "move-left" | "move-right">("idle");
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
  const initialYPositionRef = useRef<number>(getBaseYPosition());
  const lastReportedPosition = useRef<Position>({x: 0, y: 0});
  
  const roadBoundariesRef = useRef<RoadBoundaries>(roadBoundaries);
  
  useEffect(() => {
    roadBoundariesRef.current = roadBoundaries;
  }, [roadBoundaries]);

  const getScreenBoundaries = () => {
    if (!characterRef.current)
      return { minX: roadBoundaries.left, maxX: roadBoundaries.right };
      
    const characterWidth = characterRef.current.offsetWidth;
    return {
      minX: roadBoundaries.left,
      maxX: roadBoundaries.right - characterWidth,
    };
  };

  const clampPosition = (pos: Position): Position => {
    const boundaries = getScreenBoundaries();
    const result = {
      x: Math.max(boundaries.minX, Math.min(boundaries.maxX, pos.x)),
      y: isJumping ? pos.y : getBaseYPosition(),
    };
    console.log('Clamping position:', { input: pos, boundaries, result, isJumping });
    return result;
  };

  const startMovement = () => {
    console.log('Starting movement animation');
    if (movementFrameRef.current !== null) {
      console.log('Canceling existing movement frame');
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

        const newPos = clampPosition({ ...prev, x: newX });
        console.log('Moving character to:', newPos);
        return newPos;
      });

      if (keyPressedRef.current.left || keyPressedRef.current.right) {
        movementFrameRef.current = requestAnimationFrame(moveCharacter);
      }
    };

    movementFrameRef.current = requestAnimationFrame(moveCharacter);
  };

  useEffect(() => {
    console.log('Setting up keyboard handlers. isJumping:', isJumping);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key down:', e.key, 'isJumping:', isJumping);
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
        console.log('Starting movement from key press');
        startMovement();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      console.log('Key up:', e.key);
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
        console.log('Stopping movement animation');
        cancelAnimationFrame(movementFrameRef.current);
        movementFrameRef.current = null;
        setAnimation("idle");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      console.log('Cleaning up keyboard handlers');
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isJumping]);

  const handleJump = () => {
    console.log('Jump requested. Current isJumping:', isJumping);
    if (isJumping) return;

    console.log('Starting jump animation');
    setIsJumping(true);
    setAnimation("jump");

    initialYPositionRef.current = currentPosition.y;
    console.log('Initial Y position for jump:', initialYPositionRef.current);

    const startTime = Date.now();

    if (jumpFrameRef.current !== null) {
      console.log('Canceling existing jump frame');
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
      console.log('Jump animation frame:', { progress, jumpOffset, newY });

      setCurrentPosition((prev) => ({ ...prev, y: newY }));


      if (progress < 1) {
        jumpFrameRef.current = requestAnimationFrame(jumpAnimate);
      } else {
        console.log('Jump animation complete (duration reached)');
        completeJump(); 
      }
    };


    jumpFrameRef.current = requestAnimationFrame(jumpAnimate);
  }; 


  // No changes needed for completeJump for this specific modification
  const completeJump = () => {
    console.log('Completing jump');
    if (jumpFrameRef.current !== null) {
      cancelAnimationFrame(jumpFrameRef.current);
      jumpFrameRef.current = null;
    }

    const baseYPosition = getBaseYPosition();
    console.log('Returning to base Y position:', baseYPosition);
    setCurrentPosition((prev) => ({
      ...prev,
      y: baseYPosition,
    }));
    initialYPositionRef.current = baseYPosition; 

    if (keyPressedRef.current.left) {
      setAnimation("move-left");
    } else if (keyPressedRef.current.right) {
      setAnimation("move-right");
    } else {
      setAnimation("idle");
    }

    setIsJumping(false); // Allow jumping again
  };

  useEffect(() => {
    console.log('selectedLink or position changed:', { selectedLink, position });
    
    if (autoMoveFrameRef.current !== null) {
      console.log('Canceling existing auto-move frame');
      cancelAnimationFrame(autoMoveFrameRef.current);
      autoMoveFrameRef.current = null;
    }

    if (!selectedLink) {
      console.log('No selected link, skipping auto-movement');
      return;
    }

    console.log("Moving to selected link:", selectedLink);

    if (movementFrameRef.current !== null) {
      console.log('Canceling existing movement frame before auto-move');
      cancelAnimationFrame(movementFrameRef.current);
      movementFrameRef.current = null;
    }

    // Force stop any jumping
    if (jumpFrameRef.current !== null) {
      console.log('Canceling existing jump before auto-move');
      cancelAnimationFrame(jumpFrameRef.current);
      jumpFrameRef.current = null;
      setIsJumping(false);
    }

    const moveToPosition = () => {
      const dx = position.x - currentPosition.x;
      const newDirection = dx > 0 ? "right" : "left";
      console.log('Auto-move parameters:', { dx, newDirection, targetPosition: position });
      setDirection(newDirection);

      const moveAnimation: "idle" | "move-left" | "move-right" =
        dx !== 0 ? `move-${newDirection}` : "idle";
      setAnimation(moveAnimation);

      const distance = Math.abs(dx);
      const duration = distance * 5;
      console.log('Auto-move animation setup:', { distance, duration });

      const startTime = Date.now();
      const startX = currentPosition.x;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = easeInOutQuad(progress);
        const newX = startX + dx * easedProgress;
        console.log('Auto-move animation frame:', { elapsed, progress, easedProgress, newX });
        
        setCurrentPosition((prev) => {
          const newPos = clampPosition({ ...prev, x: newX });
          console.log('Setting new position from auto-move:', newPos);
          return newPos;
        });

        if (progress < 1) {
          autoMoveFrameRef.current = requestAnimationFrame(animate);
        } else {
          console.log('Auto-move complete, preparing for jump');
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
      console.log('Cleaning up auto-move effect');
      if (autoMoveFrameRef.current !== null) {
        cancelAnimationFrame(autoMoveFrameRef.current);
        autoMoveFrameRef.current = null;
      }
    };
  }, [selectedLink, position]);

  useEffect(() => {
    console.log('Setting up resize handler');
    
    const handleResize = () => {
      const newBaseY = getBaseYPosition();
      console.log('Window resized, new base Y:', newBaseY);
      
      if (!isJumping) {
        console.log('Not jumping, adjusting position on resize');
        const newPos = {
          x: currentPosition.x, 
          y: newBaseY
        };
        
        const clampedPos = clampPosition(newPos);
        console.log('New position after resize:', { newPos, clampedPos });
        
        if (clampedPos.y !== currentPosition.y || 
            clampedPos.x !== currentPosition.x) {
          console.log('Position changed after resize, updating state');
          setCurrentPosition(clampedPos);
          initialYPositionRef.current = newBaseY;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      console.log('Cleaning up resize handler');
      window.removeEventListener("resize", handleResize);
    }
  }, [isJumping, currentPosition.x, currentPosition.y]);

  useEffect(() => {
    console.log('Position update check:', { 
      current: currentPosition,
      last: lastReportedPosition.current,
      diff: {
        x: Math.abs(lastReportedPosition.current.x - currentPosition.x),
        y: Math.abs(lastReportedPosition.current.y - currentPosition.y)
      }
    });
    
    if (onPositionUpdate && 
        (Math.abs(lastReportedPosition.current.x - currentPosition.x) > 1 || 
         Math.abs(lastReportedPosition.current.y - currentPosition.y) > 1)) {
      console.log('Reporting position update to parent');
      lastReportedPosition.current = {...currentPosition};
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