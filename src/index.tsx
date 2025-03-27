import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/ActionBar.css';
import './styles/BlogLink.css';
import './styles/NowPage.css'
import './styles/GitHubLink.css';
import './styles/LinkedInLink.css';
import './styles/PixelArtCharacter.css';

import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);