// soft pastel background colors
const colors = [
  "#fef9f3", // cream
  "#fce4ec", // soft pink
  "#e3eef9", // dusty blue
  "#e8f5e9", // sage
  "#f3e5f5"  // lavender
];

let clickCount = 0;
const maxClicks = 7;

// track current background color explicitly
let currentBackgroundColor = colors[0];

// track shown messages to prevent repeats in the same session
let shownMessages = new Set();

const messageEl = document.getElementById("message");
const btn = document.getElementById("btn");

// get a random item from an array
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// get a random message that hasn't been shown in this session
function getRandomMessage() {
  const availableMessages = messages.filter(m => !shownMessages.has(m));
  
  // if all messages have been shown, reset the tracking
  if (availableMessages.length === 0) {
    shownMessages = new Set();
    return getRandomItem(messages);
  }
  
  const message = getRandomItem(availableMessages);
  shownMessages.add(message);
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
  clickCount++;
  
  if (clickCount >= maxClicks) {
    // show ending message
    changeMessage(getRandomItem(endingMessages));
    changeBackground();
    btn.disabled = true;
    btn.classList.add("hidden");
  } else {
    // show random message that hasn't been shown
    const newMessage = getRandomMessage();
    
    changeMessage(newMessage);
    changeBackground();
  }
}

// initialize
function init() {
  const initialMessage = getRandomMessage();
  messageEl.textContent = initialMessage;
  btn.addEventListener("click", handleClick);
}

init();
