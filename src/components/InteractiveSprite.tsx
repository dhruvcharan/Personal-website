import React, { useState, useEffect, useRef } from 'react';
import '../styles/InteractiveSprite.css';

interface InteractiveSpriteProps {
  type: 'github' | 'linkedin' | 'blog' | 'now' | 'mail' | 'unknown';
  position: { x: number; y: number };
  isInteracting: boolean;
  spritePaths: string[];
  onInteractionComplete: () => void;
}

const FRAME_DURATION_MS = 220;
const FINAL_FRAME_HOLD_MS = 280;

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
  const onCompleteRef = useRef(onInteractionComplete);

  useEffect(() => {
    onCompleteRef.current = onInteractionComplete;
  }, [onInteractionComplete]);

  useEffect(() => {
    if (!isInteracting || spritePaths.length === 0) return;

    setIsAnimating(true);
    setCurrentFrameIndex(0);

    let frame = 0;

    const stepNextFrame = () => {
      frame += 1;
      if (frame < spritePaths.length) {
        setCurrentFrameIndex(frame);
        const holdTime = frame === spritePaths.length - 1 ? FINAL_FRAME_HOLD_MS : FRAME_DURATION_MS;
        animationRef.current = setTimeout(stepNextFrame, holdTime);
      } else {
        setIsAnimating(false);
        onCompleteRef.current();
      }
    };

    const initialHold = spritePaths.length === 1 ? FINAL_FRAME_HOLD_MS : FRAME_DURATION_MS;
    animationRef.current = setTimeout(stepNextFrame, initialHold);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isInteracting, spritePaths]);

  if (!isInteracting && !isAnimating) {
    return null;
  }

  return (
    <div
      className={`interactive-sprite ${type} ${isAnimating ? 'animating' : ''}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translate3d(${Math.round(position.x)}px, ${Math.round(position.y)}px, 0)`,
        marginLeft: 'calc(var(--char-width, 128px) * -0.25)',
        backgroundImage: `url(${spritePaths[currentFrameIndex]})`,
        width: 'calc(var(--char-width, 128px) * 1.5)',
        height: 'var(--char-height, 142px)',
        backgroundSize: '100% auto',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center bottom',
        imageRendering: 'pixelated',
        willChange: 'transform, background-image',
        zIndex: 1000,
      }}
    >
      <div className="character-ground-shadow" />
    </div>
  );
};

export default InteractiveSprite;