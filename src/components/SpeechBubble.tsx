import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/audio';
import '../styles/SpeechBubble.css';

interface SpeechBubbleProps {
  text: string;
  onComplete?: () => void;
  speakerName?: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsDone(false);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        if (index % 2 === 0) {
          soundFx.playTalk();
        }
        index++;
      } else {
        clearInterval(timer);
        setIsDone(true);
        if (onComplete) {
          onComplete();
        }
      }
    }, 32);

    return () => clearInterval(timer);
  }, [text, onComplete]);

  return (
    <div className={`speech-bubble-container ${isDone ? 'done' : 'typing'}`}>
      <div className="speech-bubble-tail" />
      <div className="speech-bubble-box">
        <span className="speech-text">{displayedText}</span>
        {isDone && <span className="speech-cursor">▼</span>}
      </div>
    </div>
  );
};

export default SpeechBubble;
