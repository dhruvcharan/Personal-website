import React, { useState } from 'react';
import GameEnvironment from './components/GameEnvironment';
import './App.css';

function App() {
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [characterPosition, setCharacterPosition] = useState({ x: 50, y: 0 });

  const handleNavigate = (path: string) => {
    console.log('Navigating to:', path); 
    setTimeout(() => {
      switch(path) {
        case '/about':
          window.open('https://dhruv248.substack.com/', '_blank');
          break;
        case '/projects':
          window.open('https://github.com/dhruvcharan', '_blank');
          break;
        case '/contact':
          window.open('https://linkedin.com/in/dhruv-charan', '_blank');
          break;
        default:
          console.log('Unknown path:', path);
      }
    }, 2000); 
  };

  return (
    <div className="App">
      <div className="content">
        <h1></h1>
        <p>Click on the Link to Guide the Character</p>
        <GameEnvironment onNavigate={handleNavigate} />
      </div>
    </div>
  );
}

export default App;