// soft pastel background colors
const colors = [
  "#fef9f3", // cream
  "#fce4ec", // soft pink
  "#e3eef9", // dusty blue
  "#e8f5e9", // sage
  "#f3e5f5"  // lavender
];

// Internal state
let clickCount = 0;
let recentMessages = []; // last 3 shown messages
let lastTierShown = null;
let hasEnded = false;

// track current background color explicitly
let currentBackgroundColor = colors[0];

const messageEl = document.getElementById("message");
const btn = document.getElementById("btn");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

// get a random item from an array
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// get available messages from a tier (excluding recent)
function getAvailableFromTier(tier) {
  return tier.filter(m => !recentMessages.includes(m));
}

// add message to recent tracking (keeps last 3)
function trackMessage(message) {
  recentMessages.push(message);
  if (recentMessages.length > 3) {
    recentMessages.shift();
  }
}

// select tier based on probabilities
function selectTierByProbability(probabilities) {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [tier, prob] of probabilities) {
    cumulative += prob;
    if (rand < cumulative) {
      return tier;
    }
  }
  
  // fallback to first tier
  return probabilities[0][0];
}

// get message based on click progression rules
function getMessageByProgression() {
  let selectedTier;
  let tierName;
  
  // Clicks 1-2: settling phase - Tier A only
  if (clickCount <= 2) {
    selectedTier = tierA;
    tierName = 'A';
  }
  // Clicks 3-4: gentle variation - A (70%) or B (30%)
  else if (clickCount <= 4) {
    // No Tier B twice in a row
    if (lastTierShown === 'B') {
      selectedTier = tierA;
      tierName = 'A';
    } else {
      const probabilities = [
        [tierA, 0.7],
        [tierB, 0.3]
      ];
      selectedTier = selectTierByProbability(probabilities);
      tierName = selectedTier === tierA ? 'A' : 'B';
    }
  }
  // Click 5: possible surprise - A (60%), B (30%), C (10%)
  else if (clickCount === 5) {
    // Tier C only if lastTierShown != C
    if (lastTierShown === 'C') {
      const probabilities = [
        [tierA, 0.67],
        [tierB, 0.33]
      ];
      selectedTier = selectTierByProbability(probabilities);
      tierName = selectedTier === tierA ? 'A' : 'B';
    } else {
      const probabilities = [
        [tierA, 0.6],
        [tierB, 0.3],
        [tierC, 0.1]
      ];
      selectedTier = selectTierByProbability(probabilities);
      tierName = selectedTier === tierA ? 'A' : (selectedTier === tierB ? 'B' : 'C');
    }
  }
  // Click 6: flattening - Tier A only
  else if (clickCount === 6) {
    selectedTier = tierA;
    tierName = 'A';
  }
  // Click 7+: ending - Tier D only
  else {
    selectedTier = tierD;
    tierName = 'D';
  }
  
  // Get available messages (not in recent)
  let available = getAvailableFromTier(selectedTier);
  
  // If all messages were recent, use full tier
  if (available.length === 0) {
    available = selectedTier;
  }
  
  const message = getRandomItem(available);
  
  // Track the message and tier
  trackMessage(message);
  lastTierShown = tierName;
  
  return message;
}

// get a random color that's different from current
function getRandomColor(currentColor) {
  const availableColors = colors.filter(c => c !== currentColor);
  return getRandomItem(availableColors);
}

// change message with fade transition - slower for smooth feel
function changeMessage(newMessage) {
  messageEl.classList.add("fade");
  
  setTimeout(() => {
    messageEl.textContent = newMessage;
    messageEl.classList.remove("fade");
  }, 500);
}

// Single neutral color for the disintegration effect (non-colorful)
const particleColor = "#5a5a5a"; // neutral grey matching text color

// Animation timing constants for the disintegration effect
const PARTICLE_MIN_DRIFT_LEFT = 80;
const PARTICLE_DRIFT_LEFT_RANGE = 150;
const PARTICLE_MIN_DRIFT_UP = 30;
const PARTICLE_DRIFT_UP_RANGE = 80;
const PARTICLE_VERTICAL_VARIATION = 40;
const WAVE_DELAY_MAX_MS = 2500;
const WAVE_VARIATION_MS = 400;
const PARTICLE_MIN_DURATION_MS = 1800;
const PARTICLE_DURATION_RANGE_MS = 1200;

// Thanos snap / disintegration effect - smooth left-to-right dissolution
function disintegrateMessage() {
  const text = messageEl.textContent;
  const rect = messageEl.getBoundingClientRect();
  
  // Wrap original text in a span safely (avoid innerHTML for XSS prevention)
  const originalSpan = document.createElement('span');
  originalSpan.className = 'original-text';
  originalSpan.textContent = text;
  messageEl.textContent = '';
  messageEl.appendChild(originalSpan);
  messageEl.classList.add('disintegrating');
  
  // Create particles based on text - more particles for smoother effect
  const particleCount = Math.min(text.length * 20, 300);
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'dust-particle';
    
    // Random starting position within text bounds
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    
    // Random size (1-4px) - varied sizes for organic feel
    const size = 1 + Math.random() * 3;
    
    // Drift to the left and upward (Thanos style - left to right dissolution)
    const tx = -(PARTICLE_MIN_DRIFT_LEFT + Math.random() * PARTICLE_DRIFT_LEFT_RANGE);
    const ty = -PARTICLE_MIN_DRIFT_UP - Math.random() * PARTICLE_DRIFT_UP_RANGE + (Math.random() - 0.5) * PARTICLE_VERTICAL_VARIATION;
    
    // Left-to-right wave: particles on the left start first
    // Calculate position ratio (0 = left edge, 1 = right edge)
    const positionRatio = x / rect.width;
    
    // Base delay creates the left-to-right wave (left side starts first)
    const waveDelay = positionRatio * WAVE_DELAY_MAX_MS;
    
    // Add small random variation to prevent too mechanical look
    const randomVariation = Math.random() * WAVE_VARIATION_MS;
    const delay = waveDelay + randomVariation;
    
    // Longer, smoother duration
    const duration = PARTICLE_MIN_DURATION_MS + Math.random() * PARTICLE_DURATION_RANGE_MS;
    
    particle.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background-color: ${particleColor};
      --tx: ${tx}px;
      --ty: ${ty}px;
      animation: dust-away ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms forwards;
    `;
    
    messageEl.appendChild(particle);
  }
  
  // Clean up after all animations complete
  // Calculate based on max possible delay + max duration
  const cleanupDelay = WAVE_DELAY_MAX_MS + WAVE_VARIATION_MS + PARTICLE_MIN_DURATION_MS + PARTICLE_DURATION_RANGE_MS + 500;
  setTimeout(() => {
    messageEl.innerHTML = '';
    messageEl.classList.remove('disintegrating');
  }, cleanupDelay);
}

// change background color and browser theme-color
function changeBackground() {
  const newColor = getRandomColor(currentBackgroundColor);
  currentBackgroundColor = newColor;
  document.body.style.backgroundColor = newColor;
  
  // Update browser theme-color (address bar on mobile browsers)
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', newColor);
  }
}

// handle button click
function handleClick() {
  if (hasEnded) return;
  
  clickCount++;
  
  if (clickCount >= 7) {
    // Show ending message (Tier D)
    const endingMessage = getRandomItem(tierD);
    changeMessage(endingMessage);
    changeBackground();
    
    // Lock the ending
    hasEnded = true;
    btn.disabled = true;
    btn.classList.add("hidden");
    
    // Trigger Thanos snap effect after message is shown - longer pause before dissolution
    setTimeout(() => {
      disintegrateMessage();
    }, 3000);
  } else {
    // Get message based on progression rules
    const newMessage = getMessageByProgression();
    changeMessage(newMessage);
    changeBackground();
  }
}

// initialize
function init() {
  // Show initial message as if first click happened
  clickCount = 1;
  const initialMessage = getMessageByProgression();
  messageEl.textContent = initialMessage;
  btn.addEventListener("click", handleClick);
}

// Note: clickCount starts at 1 after init(), so first button click increments to 2.
// This is intentional: initial page load = click 1, first button press = click 2.

init();
