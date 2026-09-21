import './styles/mario.css';
import './styles/index.css';
import './styles/components.css';
import './styles/sections.css';

import { initThreeScene } from './three-scene.js';
import { initAnimations } from './animations.js';
import { initNavigation } from './navigation.js';
import { initMarioGame } from './mario-game.js';

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initThreeScene();
  initAnimations();
  initNavigation();
  initMarioGame();
});

