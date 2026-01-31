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

// Constants for canvas-based pixel disintegration
const DEBUG = false;
const REPETITION_COUNT = 2; // number of times each pixel is assigned to a canvas
const NUM_FRAMES = 128;

/**
 * Generates the individual subsets of pixels that are animated to create the effect
 * @param {HTMLCanvasElement} $canvas
 * @param {number} count The higher the frame count, the less grouped the pixels will look - Google use 32, but for our elms we use 128 since we have images near the edges
 * @return {HTMLCanvasElement[]} Each canvas contains a subset of the original pixels
 */
function generateFrames($canvas, count = 32) {
  const { width, height } = $canvas;
  const ctx = $canvas.getContext("2d");
  const originalData = ctx.getImageData(0, 0, width, height);
  const imageDatas = [...Array(count)].map(
    (_, i) => ctx.createImageData(width, height)
  );
  
  // assign the pixels to a canvas
  // each pixel is assigned to 2 canvas', based on its x-position
  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < height; ++y) {
      for (let i = 0; i < REPETITION_COUNT; ++i) {
        const dataIndex = Math.floor(
          count * (Math.random() + 2 * x / width) / 3
        );
        const pixelIndex = (y * width + x) * 4;
        // copy the pixel over from the original image
        for (let offset = 0; offset < 4; ++offset) {
          imageDatas[dataIndex].data[pixelIndex + offset]
            = originalData.data[pixelIndex + offset];
        }
      }
    }
  }
  
  // turn image datas into canvas'
  return imageDatas.map(data => {
    const $c = $canvas.cloneNode(true);
    $c.getContext("2d").putImageData(data, 0, 0);
    return $c;
  });
}

/**
 * Inserts a new element over an old one, hiding the old one
 */
function replaceElementVisually($old, $new) {
  const rect = $old.getBoundingClientRect();
  $new.style.position = 'fixed';
  $new.style.top = `${rect.top}px`;
  $new.style.left = `${rect.left}px`;
  $new.style.width = `${rect.width}px`;
  $new.style.height = `${rect.height}px`;
  document.body.appendChild($new);
  $old.style.visibility = "hidden";
}

/**
 * Thanos snap / disintegration effect - canvas-based pixel dissolution
 */
function disintegrateMessage() {
  html2canvas(messageEl).then($canvas => {    
    // create the container we'll use to replace the element with
    const $container = document.createElement("div");
    $container.classList.add("disintegration-container");
    
    // setup the frames for animation
    const $frames = generateFrames($canvas, NUM_FRAMES);
    $frames.forEach(($frame, i) => {
      $frame.style.transitionDelay = `${1.35 * i / $frames.length}s`;
      $container.appendChild($frame);
    });
    
    // then insert them into the DOM over the element
    replaceElementVisually(messageEl, $container);
    
    // then animate them
    $container.offsetLeft; // forces reflow, so CSS we apply below does transition
    if (!DEBUG) {
      // set the values the frame should animate to
      // note that this is done after reflow so the transitions trigger
      $frames.forEach($frame => {
        const randomRadian = 2 * Math.PI * (Math.random() - 0.5);
        $frame.style.transform = 
          `rotate(${15 * (Math.random() - 0.5)}deg) translate(${60 * Math.cos(randomRadian)}px, ${30 * Math.sin(randomRadian)}px)
rotate(${15 * (Math.random() - 0.5)}deg)`;
        $frame.style.opacity = 0;
      });
    } else {
      $frames.forEach($frame => {
        $frame.style.animation = `debug-pulse 1s ease ${$frame.style.transitionDelay} infinite alternate`;
      });
    }
  });
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
