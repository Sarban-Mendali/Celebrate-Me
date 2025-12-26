// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const icon = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  const menuText = document.getElementById('menu-theme-text');
  
  if (theme === 'dark') {
    icon.textContent = '☀️';
    label.textContent = 'Light';
    menuText.textContent = '☀️ Light Mode';
  } else {
    icon.textContent = '🌙';
    label.textContent = 'Dark';
    menuText.textContent = '🌙 Dark Mode';
  }
}

// Menu Toggle
function toggleMenu() {
  const menu = document.getElementById('dropdown-menu');
  menu.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
  const menu = document.getElementById('dropdown-menu');
  const menuBtn = document.querySelector('.menu-btn');
  
  if (!menu.contains(event.target) && !menuBtn.contains(event.target)) {
    menu.classList.remove('active');
  }
});

// About Modal
function showAbout() {
  document.getElementById('about-modal').classList.add('active');
}

function closeAbout() {
  document.getElementById('about-modal').classList.remove('active');
}

// Share Website
function shareWebsite() {
  const url = window.location.origin + window.location.pathname;
  
  if (navigator.share) {
    navigator.share({
      title: 'Message Generator',
      text: 'Create beautiful personalized messages for any occasion!',
      url: url
    }).catch(() => {
      copyToClipboard(url);
    });
  } else {
    copyToClipboard(url);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Website link copied to clipboard!');
  });
}

// Load URL parameters on page load
window.addEventListener('DOMContentLoaded', function() {
  initTheme();
  
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const msg = urlParams.get('msg');

  if (type && msg) {
    showMessageView(type, decodeURIComponent(msg));
  }
});

// Show message view for recipients
function showMessageView(type, message) {
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('message-view').style.display = 'block';
  document.getElementById('received-message').textContent = message;
  
  // Set celebration emoji based on type
  const emojiMap = {
    'birthday': '🎂',
    'anniversary': '💕',
    'achievement': '🏆'
  };
  document.getElementById('celebration-emoji').textContent = emojiMap[type] || '🎉';
  
  // Set title based on type
  const titleMap = {
    'birthday': 'Happy Birthday! 🎉',
    'anniversary': 'Happy Anniversary! 💑',
    'achievement': 'Congratulations! 🎊'
  };
  document.getElementById('message-title').textContent = titleMap[type] || 'You\'ve Received a Message!';
}

// Go to home page
function goHome() {
  // Clear URL parameters
  window.history.pushState({}, document.title, window.location.pathname);
  
  // Show main app, hide message view
  document.getElementById('main-app').style.display = 'block';
  document.getElementById('message-view').style.display = 'none';
  
  // Reset form
  document.getElementById('message-display').style.display = 'none';
}

// Tab switching
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
  button.addEventListener('click', function() {
    const tab = this.getAttribute('data-tab');
    switchTab(tab);
  });
});

function switchTab(tab) {
  // Update active tab button
  tabButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  // Update active form
  document.querySelectorAll('.form-container').forEach(form => {
    form.classList.remove('active');
  });
  document.getElementById(`${tab}-form`).classList.add('active');

  // Hide message display
  document.getElementById('message-display').style.display = 'none';
}

// Birthday message generation
function generateBirthdayMessage() {
  const name = document.getElementById('birthday-name').value.trim();
  const age = document.getElementById('birthday-age').value.trim();

  if (!name) {
    alert('Please enter a name');
    return;
  }

  const messages = [
    `Happy ${age ? age + 'th ' : ''}Birthday, ${name}! 🎂 May your day be filled with joy, laughter, and all the things that make you smile. Here's to another year of wonderful memories!`,
    `Wishing you the happiest of birthdays, ${name}! ${age ? `${age} looks amazing on you! ` : ''}May this year bring you endless happiness and success. 🎉`,
    `Happy Birthday to the incredible ${name}! ${age ? `Cheers to ${age} years! ` : ''}May your special day be as wonderful as you are. 🎈`
  ];

  displayMessage(messages[Math.floor(Math.random() * messages.length)], 'birthday');
}

// Anniversary message generation
function generateAnniversaryMessage() {
  const name = document.getElementById('anniversary-name').value.trim();
  const years = document.getElementById('anniversary-years').value.trim();

  if (!name) {
    alert('Please enter a name');
    return;
  }

  const messages = [
    `Happy ${years ? years + ' Year ' : ''}Anniversary, ${name}! 💕 Here's to the beautiful journey you've shared together. May your love continue to grow stronger with each passing day.`,
    `Congratulations on ${years ? years + ' wonderful years' : 'your anniversary'}, ${name}! ❤️ Your love story is truly inspiring. Wishing you many more years of happiness together!`,
    `Happy Anniversary, ${name}! ${years ? `${years} years of love, laughter, and memories! ` : ''}May your bond continue to deepen and your hearts stay forever intertwined. 🌹`
  ];

  displayMessage(messages[Math.floor(Math.random() * messages.length)], 'anniversary');
}

// Achievement message generation
function generateAchievementMessage() {
  const name = document.getElementById('achievement-name').value.trim();
  const achievement = document.getElementById('achievement-text').value.trim();

  if (!name || !achievement) {
    alert('Please enter both name and achievement');
    return;
  }

  const messages = [
    `Congratulations, ${name}! 🎊 Your achievement in ${achievement} is absolutely remarkable. Your hard work and dedication have truly paid off!`,
    `Way to go, ${name}! 🌟 Your success in ${achievement} is well-deserved. Keep reaching for the stars!`,
    `Incredible work, ${name}! 🏆 Your accomplishment in ${achievement} is inspiring. This is just the beginning of your amazing journey!`
  ];

  displayMessage(messages[Math.floor(Math.random() * messages.length)], 'achievement');
}

// Display generated message
function displayMessage(message, type) {
  document.getElementById('generated-message').textContent = message;
  document.getElementById('message-display').style.display = 'block';
  
  // Store current type for sharing
  window.currentMessageType = type;
  
  // Reset copy button
  document.getElementById('share-text').style.display = 'inline';
  document.getElementById('copied-text').style.display = 'none';
}

// Copy shareable link
function copyShareableLink() {
  const message = document.getElementById('generated-message').textContent;
  const type = window.currentMessageType;
  
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    type: type,
    msg: encodeURIComponent(message)
  });
  const shareableLink = `${baseUrl}?${params.toString()}`;

  // Copy to clipboard
  navigator.clipboard.writeText(shareableLink).then(() => {
    // Show copied confirmation
    document.getElementById('share-text').style.display = 'none';
    document.getElementById('copied-text').style.display = 'inline';

    // Reset after 2 seconds
    setTimeout(() => {
      document.getElementById('share-text').style.display = 'inline';
      document.getElementById('copied-text').style.display = 'none';
    }, 2000);
  }).catch(err => {
    alert('Failed to copy link');
  });
}
// Helper to convert Gallery File to Base64 String
function getBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
// --- NEW HELPER FUNCTION ---
// Converts a file from the gallery into a Base64 string
function getBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// --- UPDATED GENERATION FUNCTIONS ---

async function generateBirthdayMessage() {
  const name = document.getElementById('birthday-name').value.trim();
  const age = document.getElementById('birthday-age').value.trim();
  const file = document.getElementById('birthday-file').files[0];

  if (!name) { alert('Please enter a name'); return; }

  const mediaData = await getBase64(file);
  const messages = [
    `Happy ${age ? age + 'th ' : ''}Birthday, ${name}! 🎂 May your day be filled with joy, laughter, and all the things that make you smile.`,
    `Wishing you the happiest of birthdays, ${name}! ${age ? `${age} looks amazing on you! ` : ''}May this year bring you endless happiness. 🎉`,
    `Happy Birthday to the incredible ${name}! ${age ? `Cheers to ${age} years! ` : ''}May your special day be as wonderful as you are. 🎈`
  ];

  displayMessage(messages[Math.floor(Math.random() * messages.length)], 'birthday', mediaData);
}

async function generateAnniversaryMessage() {
  const name = document.getElementById('anniversary-name').value.trim();
  const years = document.getElementById('anniversary-years').value.trim();
  const file = document.getElementById('anniversary-file').files[0];

  if (!name) { alert('Please enter a name'); return; }

  const mediaData = await getBase64(file);
  const messages = [
    `Happy ${years ? years + ' Year ' : ''}Anniversary, ${name}! 💕 Here's to the beautiful journey you've shared together.`,
    `Congratulations on ${years ? years + ' wonderful years' : 'your anniversary'}, ${name}! ❤️ Your love story is truly inspiring.`,
    `Happy Anniversary, ${name}! ${years ? `${years} years of love and laughter! ` : ''}May your bond continue to deepen. 🌹`
  ];

  displayMessage(messages[Math.floor(Math.random() * messages.length)], 'anniversary', mediaData);
}

async function generateAchievementMessage() {
  const name = document.getElementById('achievement-name').value.trim();
  const achievement = document.getElementById('achievement-text').value.trim();
  const file = document.getElementById('achievement-file').files[0];

  if (!name || !achievement) { alert('Please enter both name and achievement'); return; }

  const mediaData = await getBase64(file);
  const messages = [
    `Congratulations, ${name}! 🎊 Your achievement in ${achievement} is absolutely remarkable. Hard work pays off!`,
    `Way to go, ${name}! 🌟 Your success in ${achievement} is well-deserved. Keep reaching for the stars!`,
    `Incredible work, ${name}! 🏆 Your accomplishment in ${achievement} is inspiring. This is just the beginning!`
  ];

  displayMessage(messages[Math.floor(Math.random() * messages.length)], 'achievement', mediaData);
}

// --- UPDATED DISPLAY & SHARE LOGIC ---

function displayMessage(message, type, mediaData) {
  document.getElementById('generated-message').textContent = message;
  document.getElementById('message-display').style.display = 'block';
  
  // Store these globally so the Copy Link function can access them
  window.currentMessageType = type;
  window.currentMediaData = mediaData;
  
  document.getElementById('share-text').style.display = 'inline';
  document.getElementById('copied-text').style.display = 'none';
}

function copyShareableLink() {
  const message = document.getElementById('generated-message').textContent;
  const type = window.currentMessageType;
  const media = window.currentMediaData; 
  
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    type: type,
    msg: encodeURIComponent(message)
  });
  
  // Add media to URL if it exists
  if (media) params.append('media', encodeURIComponent(media));

  const shareableLink = `${baseUrl}?${params.toString()}`;

  navigator.clipboard.writeText(shareableLink).then(() => {
    document.getElementById('share-text').style.display = 'none';
    document.getElementById('copied-text').style.display = 'inline';
    setTimeout(() => {
      document.getElementById('share-text').style.display = 'inline';
      document.getElementById('copied-text').style.display = 'none';
    }, 2000);
  }).catch(err => alert('Link too long to copy! Use a smaller photo.'));
}

// --- UPDATED RECEIVER VIEW ---

window.addEventListener('DOMContentLoaded', function() {
  initTheme();
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const msg = urlParams.get('msg');
  const media = urlParams.get('media');

  if (type && msg) {
    showMessageView(type, decodeURIComponent(msg), media ? decodeURIComponent(media) : null);
  }
});

function showMessageView(type, message, mediaData) {
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('message-view').style.display = 'block';
  document.getElementById('received-message').textContent = message;
  
  // Create or Find Media Container
  let mediaArea = document.getElementById('media-display-area');
  if (!mediaArea) {
    mediaArea = document.createElement('div');
    mediaArea.id = 'media-display-area';
    const msgP = document.getElementById('received-message');
    msgP.parentNode.insertBefore(mediaArea, msgP);
  }
  
  mediaArea.innerHTML = '';
  if (mediaData) {
    if (mediaData.includes("video")) {
      mediaArea.innerHTML = `<video src="${mediaData}" controls style="width:100%; border-radius:12px; margin-bottom:15px;"></video>`;
    } else {
      mediaArea.innerHTML = `<img src="${mediaData}" style="width:100%; border-radius:12px; margin-bottom:15px;">`;
    }
  }

  const emojiMap = { 'birthday': '🎂', 'anniversary': '💕', 'achievement': '🏆' };
  const titleMap = { 'birthday': 'Happy Birthday! 🎉', 'anniversary': 'Happy Anniversary! 💑', 'achievement': 'Congratulations! 🎊' };
  
  document.getElementById('celebration-emoji').textContent = emojiMap[type] || '🎉';
  document.getElementById('message-title').textContent = titleMap[type] || 'A Special Message!';
}