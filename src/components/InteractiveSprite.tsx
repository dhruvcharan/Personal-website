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
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

 
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
    
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    let frame = 0;
    
    const animate = () => {
      setCurrentFrameIndex(frame);
      frame++;
      
      if (frame >= spritePaths.length) {
        setIsAnimating(false);
        onInteractionComplete();
        return;
      }
      
      
      animationRef.current = setTimeout(animate, 300); // 200ms per frame
    };
    
    animationRef.current = setTimeout(animate, 300);
  };

  if (!isInteracting && !isAnimating) {
    return null; 
  }

  return (
    <div
      className={`interactive-sprite ${type} ${isAnimating ? 'animating' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x }px`,
        top: `${position.y }px`,
        backgroundImage: `url(${spritePaths[currentFrameIndex]})`,
        width: '64px',
        height: '64px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        zIndex: 1000
        
      }}
    />
  );
};

export default InteractiveSprite;