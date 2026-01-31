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

// change message with fade transition
function changeMessage(newMessage) {
  messageEl.classList.add("fade");
  
  setTimeout(() => {
    messageEl.textContent = newMessage;
    messageEl.classList.remove("fade");
  }, 300);
}

// change background color
function changeBackground() {
  const newColor = getRandomColor(currentBackgroundColor);
  currentBackgroundColor = newColor;
  document.body.style.backgroundColor = newColor;
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
  } else {
    // Get message based on progression rules
    const newMessage = getMessageByProgression();
    changeMessage(newMessage);
    changeBackground();
  }
}

// initialize
function init() {
  clickCount = 1;
  const initialMessage = getMessageByProgression();
  messageEl.textContent = initialMessage;
  btn.addEventListener("click", handleClick);
}

init();
