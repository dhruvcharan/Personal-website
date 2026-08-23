import React, { useState, useEffect } from 'react';
import { DialogueOption, SCHOLAR_DIALOGUE } from '../data/dialogueData';
import { soundFx } from '../utils/audio';
import '../styles/DialogueMenu.css';

interface DialogueMenuProps {
  onSelectOption: (option: DialogueOption) => void;
  onClose: () => void;
  isSpeaking: boolean;
}

const DialogueMenu: React.FC<DialogueMenuProps> = ({
  onSelectOption,
  onClose,
  isSpeaking
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundFx.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (isSpeaking) return null;

  const handleOptionClick = (opt: DialogueOption) => {
    soundFx.playTalk();
    onSelectOption(opt);
  };

  const handleHover = (index: number | null) => {
    setHoveredIndex(index);
    if (index !== null) {
      soundFx.playClick();
    }
  };

  return (
    <div className="scumm-dialogue-overlay" onClick={onClose}>
      <div className="scumm-dialogue-box" onClick={(e) => e.stopPropagation()}>
        <div className="dialogue-box-header">
          <span className="dialogue-speaker-name">Archivist</span>
          <button className="dialogue-close-btn" onClick={onClose} title="Leave Conversation (ESC)">✕</button>
        </div>

        <p className="dialogue-greeting">{SCHOLAR_DIALOGUE.npcGreeting}</p>

        <div className="dialogue-options-list">
          {SCHOLAR_DIALOGUE.options.map((opt, index) => (
            <button
              key={opt.id}
              className={`dialogue-option-button ${hoveredIndex === index ? 'hovered' : ''}`}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={() => handleHover(null)}
              onClick={() => handleOptionClick(opt)}
            >
              <span className="dialogue-option-bullet">▸</span>
              <span className="dialogue-option-text">{opt.promptText}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DialogueMenu;
