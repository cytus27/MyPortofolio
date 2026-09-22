// ============================================
// SUPER MARIO BROS GAME ENGINE & AUDIO SYNTH
// ============================================

let audioCtx = null;
let coinsCollected = 5;
let currentScore = 3480;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// --- 8-Bit Web Audio API Sound Effects ---

export function playCoinSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    // Classic Mario Coin sound: B5 (987.77 Hz) for 80ms, then E6 (1318.51 Hz) for 300ms
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.error('Audio play error', e);
  }
}

export function playJumpSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    // Frequency sweep up for jump
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    console.error('Audio play error', e);
  }
}

export function playPowerupSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
    });

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.error('Audio play error', e);
  }
}

// --- Question Block Interaction ---

export function initQuestionBlocks() {
  const blocks = document.querySelectorAll('.question-block');
  const coinCounterEl = document.getElementById('hud-coins');
  const scoreCounterEl = document.getElementById('hud-score');

  blocks.forEach((block) => {
    block.addEventListener('click', (e) => {
      e.stopPropagation();
      playCoinSound();

      // Block hit animation
      block.classList.add('hit');
      setTimeout(() => block.classList.remove('hit'), 200);

      // Spawn floating coin
      const coin = document.createElement('div');
      coin.className = 'floating-coin';
      coin.textContent = '🪙';
      block.appendChild(coin);

      // Spawn floating score (+100)
      const popup = document.createElement('div');
      popup.className = 'score-popup';
      popup.textContent = '+100';
      block.appendChild(popup);

      setTimeout(() => {
        coin.remove();
        popup.remove();
      }, 800);

      // Update HUD Stats
      coinsCollected += 1;
      currentScore += 100;

      if (coinCounterEl) {
        coinCounterEl.textContent = String(coinsCollected).padStart(2, '0');
      }
      if (scoreCounterEl) {
        scoreCounterEl.textContent = String(currentScore).padStart(6, '0');
      }
    });
  });

  // Mushroom Power-up clicks
  document.querySelectorAll('.mario-mushroom-icon').forEach((mushroom) => {
    mushroom.addEventListener('click', () => {
      playPowerupSound();
      mushroom.style.animation = 'none';
      mushroom.offsetHeight; // trigger reflow
      mushroom.style.animation = 'marioJump 0.45s ease-out';
    });
  });
}

// --- Mario Character Jump ---

export function initMarioCharacter() {
  const marioElements = document.querySelectorAll('.mario-character');
  marioElements.forEach((mario) => {
    mario.addEventListener('click', () => {
      playJumpSound();
      mario.classList.add('jump');
      setTimeout(() => mario.classList.remove('jump'), 450);
    });
  });
}

// --- Interactive Photo Profile Game ---

const STAGES = [
  { name: 'MARIO',       cls: '',           color: '#f8b800', emoji: '🍄', msg: 'SUPER MARIO!' },
  { name: 'SUPER',       cls: 'stage-super', color: '#4ade80', emoji: '⭐', msg: 'SUPER MODE!' },
  { name: 'FIRE',        cls: 'stage-fire',  color: '#f97316', emoji: '🔥', msg: 'FIRE POWER!' },
  { name: 'STAR POWER',  cls: 'stage-star',  color: '#fbbf24', emoji: '🌟', msg: 'STAR POWER!' },
];

let photoStage = 0;
let photoClicks = 0;
let photoScore = 0;
let photoCoins = 0;
let photoLives = 3;
let photoStarTimer = null;

export function initPhotoGame() {
  const photo = document.getElementById('hero-photo-card');
  if (!photo) return;

  // Inject HUD into photo
  photo.insertAdjacentHTML('afterbegin', `
    <div class="photo-game-hud">
      <div class="photo-hud-left">
        <span class="photo-hud-label">ALDO</span>
        <span class="photo-hud-value" id="photo-score">000000</span>
        <div class="photo-hp-bar">
          <span class="photo-hp-heart" id="photo-heart-1">❤️</span>
          <span class="photo-hp-heart" id="photo-heart-2">❤️</span>
          <span class="photo-hp-heart" id="photo-heart-3">❤️</span>
        </div>
      </div>
      <div class="photo-hud-right">
        <span class="photo-hud-label">COINS</span>
        <span class="photo-hud-value" id="photo-coins">🪙×00</span>
      </div>
    </div>
  `);

  // Inject bottom badge
  photo.insertAdjacentHTML('beforeend', `
    <div class="photo-stage-badge">
      <span class="photo-stage-label" id="photo-stage-label">▶ WORLD 1-1</span>
      <span class="photo-tap-hint">TAP ME!</span>
    </div>
  `);

  // Click / tap interaction
  photo.addEventListener('click', (e) => {
    e.stopPropagation();
    handlePhotoClick(photo, e);
  });

  // Mouse parallax tilt (desktop only)
  if (window.innerWidth > 768) {
    photo.addEventListener('mousemove', (e) => {
      const rect = photo.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      photo.querySelector('.hero-photo-inner').style.transform =
        `perspective(600px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) scale(1.02)`;
    });

    photo.addEventListener('mouseleave', () => {
      photo.querySelector('.hero-photo-inner').style.transform = '';
    });
  }
}

function handlePhotoClick(photo, e) {
  photoClicks++;
  const rect = photo.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Shockwave
  spawnShockwave(photo, x, y);

  // Coins burst (2–4 coins)
  const count = photoStage >= 3 ? 5 : photoStage >= 2 ? 4 : photoStage >= 1 ? 3 : 2;
  for (let i = 0; i < count; i++) {
    setTimeout(() => spawnPhotoCoin(photo, x, y, i, count), i * 60);
  }

  // Score points
  const pts = (photoStage + 1) * 100;
  photoScore += pts;
  photoCoins += count;
  updatePhotoHUD();

  // Score popup
  spawnPhotoScorePop(photo, x, y, `+${pts}`);

  // Sound
  playCoinSound();

  // Stage up every 5 clicks
  if (photoClicks % 5 === 0 && photoStage < STAGES.length - 1) {
    advancePhotoStage(photo);
  }

  // Star stage: auto-revert after 5s
  if (photoStage === 3 && !photoStarTimer) {
    photoStarTimer = setTimeout(() => revertPhotoStage(photo), 5000);
  }

  // Also update global score
  currentScore += pts;
  coinsCollected += count;
  const scoreEl = document.getElementById('hud-score');
  const coinEl  = document.getElementById('hud-coins');
  if (scoreEl) scoreEl.textContent = String(currentScore).padStart(6, '0');
  if (coinEl)  coinEl.textContent  = String(coinsCollected).padStart(2, '0');
}

function advancePhotoStage(photo) {
  // Remove old stage class
  STAGES.forEach(s => { if (s.cls) photo.classList.remove(s.cls); });
  photoStage++;
  const stage = STAGES[photoStage];
  if (stage.cls) photo.classList.add(stage.cls);

  // Flash banner
  const banner = document.createElement('div');
  banner.className = 'photo-powerup-banner';
  banner.innerHTML = `<span>${stage.emoji}<br>${stage.msg}</span>`;
  photo.appendChild(banner);
  playPowerupSound();
  setTimeout(() => banner.remove(), 1200);

  // Update stage label
  const label = document.getElementById('photo-stage-label');
  if (label) label.textContent = `▶ ${stage.name} MODE`;

  // Mark active
  photo.classList.add('game-active');
}

function revertPhotoStage(photo) {
  photoStarTimer = null;
  STAGES.forEach(s => { if (s.cls) photo.classList.remove(s.cls); });
  photoStage = 0;
  photoClicks = 0;
  const label = document.getElementById('photo-stage-label');
  if (label) label.textContent = '▶ WORLD 1-1';
}

function updatePhotoHUD() {
  const scoreEl = document.getElementById('photo-score');
  const coinsEl = document.getElementById('photo-coins');
  if (scoreEl) scoreEl.textContent = String(photoScore).padStart(6, '0');
  if (coinsEl) coinsEl.textContent = `🪙×${String(photoCoins).padStart(2, '0')}`;
}

function spawnShockwave(photo, x, y) {
  const el = document.createElement('div');
  el.className = 'photo-shockwave';
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  photo.appendChild(el);
  setTimeout(() => el.remove(), 500);
}

function spawnPhotoCoin(photo, x, y, index, total) {
  const el = document.createElement('div');
  el.className = 'photo-coin';
  el.textContent = '🪙';
  const angle = (index / total) * 360 + Math.random() * 40 - 20;
  const rad = angle * (Math.PI / 180);
  const dx = Math.sin(rad) * (30 + Math.random() * 20);
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  el.style.setProperty('--dx', `${dx}px`);
  photo.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function spawnPhotoScorePop(photo, x, y, text) {
  const el = document.createElement('div');
  el.className = 'photo-score-pop';
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  photo.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// --- Theme Switcher Logic ---

export function initThemeSwitcher() {
  const toggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('mario_portfolio_theme') || 'mario';

  if (savedTheme === 'mario') {
    document.body.classList.add('theme-mario');
    if (toggleBtn) toggleBtn.innerHTML = '⚡ Dark Mode';
  } else {
    document.body.classList.remove('theme-mario');
    if (toggleBtn) toggleBtn.innerHTML = '🎮 Mario Mode';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      playPowerupSound();
      const isMario = document.body.classList.toggle('theme-mario');

      if (isMario) {
        localStorage.setItem('mario_portfolio_theme', 'mario');
        toggleBtn.innerHTML = '⚡ Dark Mode';
      } else {
        localStorage.setItem('mario_portfolio_theme', 'dark');
        toggleBtn.innerHTML = '🎮 Mario Mode';
      }
    });
  }
}

// --- 8-Bit Super Mario Bros Overworld Theme Music Synthesizer ---

let isMusicPlaying = false;
let musicTimer = null;

// Frequencies for Mario Theme Notes (Hz)
const N = {
  E5: 659.25, E4: 329.63, G5: 783.99, G4: 392.00, C5: 523.25,
  A4: 440.00, B4: 493.88, Bb4: 466.16, F5: 698.46, A5: 880.00,
  D5: 587.33, Eb5: 622.25, Db5: 554.37, C4: 261.63, F4: 349.23,
  D4: 293.66, Eb4: 311.13, Ab4: 415.30, Gb4: 369.99, SILENT: 0
};

// Mario Overworld Main Theme Sequence [note, durationUnits]
const marioThemeNotes = [
  // Intro
  [N.E5, 1], [N.E5, 1], [N.SILENT, 1], [N.E5, 1], [N.SILENT, 1], [N.C5, 1], [N.E5, 2],
  [N.G5, 2], [N.SILENT, 2], [N.G4, 2], [N.SILENT, 2],

  // Section A
  [N.C5, 2], [N.SILENT, 1], [N.G4, 2], [N.SILENT, 1], [N.E4, 2], [N.SILENT, 1],
  [N.A4, 2], [N.B4, 2], [N.Bb4, 1], [N.A4, 2],
  [N.G4, 1.33], [N.E5, 1.33], [N.G5, 1.33], [N.A5, 2], [N.F5, 1], [N.G5, 1],
  [N.SILENT, 1], [N.E5, 2], [N.C5, 1], [N.D5, 1], [N.B4, 2],

  // Section A repeat
  [N.C5, 2], [N.SILENT, 1], [N.G4, 2], [N.SILENT, 1], [N.E4, 2], [N.SILENT, 1],
  [N.A4, 2], [N.B4, 2], [N.Bb4, 1], [N.A4, 2],
  [N.G4, 1.33], [N.E5, 1.33], [N.G5, 1.33], [N.A5, 2], [N.F5, 1], [N.G5, 1],
  [N.SILENT, 1], [N.E5, 2], [N.C5, 1], [N.D5, 1], [N.B4, 2],

  // Section B
  [N.SILENT, 2], [N.G5, 1], [N.Fs5 || N.Gb4, 1], [N.F5, 1], [N.Eb5, 2], [N.E5, 1],
  [N.SILENT, 1], [N.Ab4, 1], [N.A4, 1], [N.C5, 1], [N.SILENT, 1], [N.A4, 1], [N.C5, 1], [N.D5, 1],
  [N.SILENT, 2], [N.G5, 1], [N.Gb4, 1], [N.F5, 1], [N.Eb5, 2], [N.E5, 1],
  [N.SILENT, 1], [N.C6 || N.C5, 2], [N.C6 || N.C5, 1], [N.C6 || N.C5, 2]
];

function playThemeTone(freq, durationMs) {
  if (freq === 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    // Warm retro gain envelope
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (durationMs / 1000) * 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationMs / 1000);
  } catch (e) {
    console.error('Music play error', e);
  }
}

export function toggleMarioMusic() {
  const musicBtn = document.getElementById('music-toggle');
  const statusEl = musicBtn ? musicBtn.querySelector('.music-box-status') : null;
  const blockEl = musicBtn ? musicBtn.querySelector('.music-box-block') : null;
  const noteEl = musicBtn ? musicBtn.querySelector('.music-box-note') : null;
  
  if (isMusicPlaying) {
    stopMarioMusic();
    if (musicBtn) musicBtn.classList.remove('playing');
    if (statusEl) statusEl.textContent = 'OFF';
    if (blockEl) blockEl.textContent = '?';
    if (noteEl) noteEl.textContent = '🎵';
  } else {
    startMarioMusic();
    if (musicBtn) musicBtn.classList.add('playing');
    if (statusEl) statusEl.textContent = 'ON';
    if (blockEl) blockEl.textContent = '🎶';
    if (noteEl) noteEl.textContent = '🔊';
  }
}

export function startMarioMusic() {
  if (isMusicPlaying) return;
  isMusicPlaying = true;
  
  let noteIndex = 0;
  const tempoUnitMs = 150; // Speed factor

  function playNextNote() {
    if (!isMusicPlaying) return;

    const [freq, units] = marioThemeNotes[noteIndex];
    const durationMs = units * tempoUnitMs;

    playThemeTone(freq, durationMs);

    noteIndex = (noteIndex + 1) % marioThemeNotes.length;
    musicTimer = setTimeout(playNextNote, durationMs);
  }

  playNextNote();
}

export function stopMarioMusic() {
  isMusicPlaying = false;
  if (musicTimer) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
}

export function initMusicToggle() {
  const musicBtn = document.getElementById('music-toggle');
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      playPowerupSound();
      toggleMarioMusic();
    });
  }
}

// --- Master Initialization ---

export function initMarioGame() {
  initQuestionBlocks();
  initMarioCharacter();
  initThemeSwitcher();
  initMusicToggle();
  initPhotoGame();
}
