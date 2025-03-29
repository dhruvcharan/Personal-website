import React, { useState, useEffect, useRef } from 'react';
import '../styles/InteractiveSprite.css';

interface InteractiveSpriteProps {
  type: 'github' | 'linkedin' | 'blog' | 'now' | 'mail' | 'unknown';
  position: { x: number; y: number };
  isInteracting: boolean;
  spritePaths: string[];
  onInteractionComplete: () => void;
}

const InteractiveSprite: React.FC<InteractiveSpriteProps> = ({
  type,
  position,
  isInteracting,
  spritePaths,
  onInteractionComplete,
}) => {
  console.log(`[InteractiveSprite] Rendering ${type} sprite with position:`, position);
  
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const previousPositionRef = useRef(position);

  useEffect(() => {
    console.log(`[InteractiveSprite] Position changed for ${type}:`, {
      previous: previousPositionRef.current,
      current: position,
      diff: {
        x: position.x - previousPositionRef.current.x,
        y: position.y - previousPositionRef.current.y
      }
    });
    previousPositionRef.current = position;
  }, [position, type]);

  useEffect(() => {
    console.log(`[InteractiveSprite] isInteracting changed to ${isInteracting} for ${type}`);
    
    if (isInteracting && !isAnimating) {
      console.log(`[InteractiveSprite] Starting animation for ${type} at position:`, position);
      setIsAnimating(true);
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        console.log(`[InteractiveSprite] Cleaning up animation timeout for ${type}`);
        clearTimeout(animationRef.current);
      }
    };
  }, [isInteracting]);

  const startAnimation = () => {
    console.log(`[InteractiveSprite] Animation starting for ${type} with ${spritePaths.length} frames`);
    
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    let frame = 0;

    const animate = () => {
      console.log(`[InteractiveSprite] Animating frame ${frame}/${spritePaths.length-1} for ${type} at position:`, position);
      setCurrentFrameIndex(frame);
      frame++;

      if (frame >= spritePaths.length) {
        console.log(`[InteractiveSprite] Animation complete for ${type}, calling onInteractionComplete`);
        setIsAnimating(false);
        onInteractionComplete();
        return;
      }

      animationRef.current = setTimeout(animate, 100); 
    };

    animationRef.current = setTimeout(animate, 300);
  };

  if (!isInteracting && !isAnimating) {
    console.log(`[InteractiveSprite] ${type} sprite not visible (not interacting and not animating)`);
    return null;
  }

  console.log(`[InteractiveSprite] Rendering ${type} sprite at position:`, position);
  
  return (
    <div
      className={`interactive-sprite ${type} ${isAnimating ? 'animating' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundImage: `url(${spritePaths[currentFrameIndex]})`,
        width: '128px',
        height: '128px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        zIndex: 1000
      }}
    />
  );
};

export default InteractiveSprite;