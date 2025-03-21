import React, { useState, useEffect, useRef } from 'react';
import '../styles/InteractiveSprite.css';

interface InteractiveSpriteProps {
  type: 'github' | 'linkedin' | 'blog';
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
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Start animation when isInteracting becomes true
  useEffect(() => {
    if (isInteracting && !isAnimating) {
      setIsAnimating(true);
      startAnimation();
    }
    
    return () => {
      // Clean up animation timeout when component unmounts
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isInteracting]);

  const startAnimation = () => {
    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    let frame = 0;
    
    const animate = () => {
      setCurrentFrameIndex(frame);
      frame++;
      
      // If we've shown all frames, complete the interaction
      if (frame >= spritePaths.length) {
        setIsAnimating(false);
        onInteractionComplete();
        return;
      }
      
      // Continue animation with next frame
      animationRef.current = setTimeout(animate, 300); // 300ms per frame
    };
    
    // Start the animation sequence
    animationRef.current = setTimeout(animate, 300);
  };

  if (!isInteracting && !isAnimating) {
    return null; // Don't render if not in interaction mode
  }

  return (
    <div
      className={`interactive-sprite ${type}-sprite ${isAnimating ? 'animating' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x - 64}px`, // Center the sprite (assuming 128px width)
        top: `${position.y - 64}px`,  // Center the sprite (assuming 128px height)
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