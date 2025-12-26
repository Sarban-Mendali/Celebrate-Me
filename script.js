// Global variables
let mediaRecorder, audioChunks = [];
let recordingType = null;
let generatedLink = '';

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initColorPickers();
  checkURLParams();
  generateInitialMessages();
});

// ========== COLOR PICKER INITIALIZATION ==========
function initColorPickers() {
  const colors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', 
    '#fa709a', '#ffd89b', '#a8edea', '#fed6e3'
  ];
  
  ['birthday', 'anniversary', 'achievement', 'custom'].forEach(type => {
    const container = document.getElementById(`${type}-colors`);
    if (container) {
      colors.forEach((color, i) => {
        const div = document.createElement('div');
        div.className = 'color-option' + (i === 0 ? ' selected' : '');
        div.style.background = color;
        div.onclick = () => selectColor(type, div);
        container.appendChild(div);
      });
    }
  });
}

function selectColor(type, element) {
  const container = document.getElementById(`${type}-colors`);
  container.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
}

function getSelectedColor(type) {
  const selected = document.querySelector(`#${type}-colors .selected`);
  return selected ? selected.style.background : '#667eea';
}

// ========== INITIAL MESSAGE GENERATION ==========
function generateInitialMessages() {
  const birthdayMessages = [
    "Happy Birthday! 🎂 May your day be filled with joy, laughter, and unforgettable moments!",
    "Wishing you the happiest birthday ever! 🎉 May all your dreams come true!",
    "Happy Birthday! 🎈 Here's to another year of wonderful adventures!"
  ];
  
  const anniversaryMessages = [
    "Happy Anniversary! 💕 Here's to the beautiful journey you've shared together.",
    "Congratulations on your special day! ❤️ Your love story is truly inspiring.",
    "Happy Anniversary! 🌹 May your bond continue to deepen with each passing year."
  ];
  
  const achievementMessages = [
    "Congratulations! 🎊 Your hard work and dedication have truly paid off!",
    "Way to go! 🌟 Your success is well-deserved. Keep reaching for the stars!",
    "Incredible work! 🏆 This is just the beginning of your amazing journey!"
  ];
  
  document.getElementById('birthday-message').value = birthdayMessages[Math.floor(Math.random() * birthdayMessages.length)];
  document.getElementById('anniversary-message').value = anniversaryMessages[Math.floor(Math.random() * anniversaryMessages.length)];
  document.getElementById('achievement-message').value = achievementMessages[Math.floor(Math.random() * achievementMessages.length)];
}

// ========== THEME MANAGEMENT ==========
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

// ========== MENU TOGGLE ==========
function toggleMenu() {
  const menu = document.getElementById('dropdown-menu');
  menu.classList.toggle('active');
}

document.addEventListener('click', function(event) {
  const menu = document.getElementById('dropdown-menu');
  const menuBtn = document.querySelector('.menu-btn');
  
  if (!menu.contains(event.target) && !menuBtn.contains(event.target)) {
    menu.classList.remove('active');
  }
});

// ========== MODAL FUNCTIONS ==========
function showAbout() {
  document.getElementById('about-modal').classList.add('active');
}

function closeAbout() {
  document.getElementById('about-modal').classList.remove('active');
}

function showHistory() {
  loadHistory();
  document.getElementById('history-modal').classList.add('active');
}

function closeHistory() {
  document.getElementById('history-modal').classList.remove('active');
}

// ========== SHARE WEBSITE ==========
function shareWebsite() {
  const url = window.location.origin + window.location.pathname;
  
  if (navigator.share) {
    navigator.share({
      title: 'Wish-yours - Message Generator',
      text: 'Create beautiful personalized messages for any occasion!',
      url: url
    }).catch(() => {
      copyToClipboardUtil(url);
    });
  } else {
    copyToClipboardUtil(url);
  }
}

function copyToClipboardUtil(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Website link copied to clipboard!');
  });
}

// ========== TAB SWITCHING ==========
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
  button.addEventListener('click', function() {
    const tab = this.getAttribute('data-tab');
    switchTab(tab);
  });
});

function switchTab(tab) {
  tabButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  document.querySelectorAll('.form-container').forEach(form => {
    form.classList.remove('active');
  });
  document.getElementById(`${tab}-form`).classList.add('active');

  document.getElementById('message-display').style.display = 'none';
}

// ========== VOICE RECORDING ==========
async function toggleRecording(type) {
  const btn = document.getElementById(`${type}-record-btn`);
  const text = document.getElementById(`${type}-record-text`);
  const preview = document.getElementById(`${type}-audio-preview`);

  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      recordingType = type;

      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          window[`${type}AudioData`] = reader.result;
          preview.src = URL.createObjectURL(blob);
          preview.style.display = 'block';
        };
        reader.readAsDataURL(blob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      btn.classList.add('recording');
      text.textContent = 'Stop Recording';
    } catch (err) {
      alert('Microphone access denied. Please allow microphone access to record voice notes.');
    }
  } else {
    mediaRecorder.stop();
    btn.classList.remove('recording');
    text.textContent = 'Record Voice';
    recordingType = null;
  }
}

// ========== HELPER FUNCTIONS ==========
function getBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function getFontClass(font) {
  const fontMap = {
    'default': 'font-default',
    'cursive': 'font-cursive',
    'bold': 'font-bold',
    'playful': 'font-playful'
  };
  return fontMap[font] || 'font-default';
}

function extractYouTubeID(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

// ========== MESSAGE GENERATION FUNCTIONS ==========
async function generateBirthdayMessage() {
  const name = document.getElementById('birthday-name').value.trim();
  const age = document.getElementById('birthday-age').value.trim();
  const message = document.getElementById('birthday-message').value.trim();
  
  if (!name) { alert('Please enter a name'); return; }
  if (!message) { alert('Please write a message'); return; }

  const file = document.getElementById('birthday-file').files[0];
  const mediaData = await getBase64(file);
  const color = getSelectedColor('birthday');
  const font = document.getElementById('birthday-font').value;
  const countdown = document.getElementById('birthday-countdown').value;
  const youtube = document.getElementById('birthday-youtube').value;
  const audio = window.birthdayAudioData;

  await generateMessage('birthday', { name, age, message, mediaData, color, font, countdown, youtube, audio });
}

async function generateAnniversaryMessage() {
  const name = document.getElementById('anniversary-name').value.trim();
  const years = document.getElementById('anniversary-years').value.trim();
  const message = document.getElementById('anniversary-message').value.trim();
  
  if (!name) { alert('Please enter a name'); return; }
  if (!message) { alert('Please write a message'); return; }

  const file = document.getElementById('anniversary-file').files[0];
  const mediaData = await getBase64(file);
  const color = getSelectedColor('anniversary');
  const font = document.getElementById('anniversary-font').value;
  const countdown = document.getElementById('anniversary-countdown').value;
  const youtube = document.getElementById('anniversary-youtube').value;
  const audio = window.anniversaryAudioData;

  await generateMessage('anniversary', { name, years, message, mediaData, color, font, countdown, youtube, audio });
}

async function generateAchievementMessage() {
  const name = document.getElementById('achievement-name').value.trim();
  const achievement = document.getElementById('achievement-text').value.trim();
  const message = document.getElementById('achievement-message').value.trim();
  
  if (!name || !achievement) { alert('Please enter name and achievement'); return; }
  if (!message) { alert('Please write a message'); return; }

  const file = document.getElementById('achievement-file').files[0];
  const mediaData = await getBase64(file);
  const color = getSelectedColor('achievement');
  const font = document.getElementById('achievement-font').value;
  const countdown = document.getElementById('achievement-countdown').value;
  const youtube = document.getElementById('achievement-youtube').value;
  const audio = window.achievementAudioData;

  await generateMessage('achievement', { name, achievement, message, mediaData, color, font, countdown, youtube, audio });
}

async function generateCustomMessage() {
  const occasion = document.getElementById('custom-occasion').value.trim();
  const name = document.getElementById('custom-name').value.trim();
  const message = document.getElementById('custom-message').value.trim();
  
  if (!occasion) { alert('Please enter an occasion'); return; }
  if (!message) { alert('Please write a message'); return; }

  const file = document.getElementById('custom-file').files[0];
  const mediaData = await getBase64(file);
  const color = getSelectedColor('custom');
  const font = document.getElementById('custom-font').value;
  const youtube = document.getElementById('custom-youtube').value;
  const audio = window.customAudioData;

  await generateMessage('custom', { occasion, name, message, mediaData, color, font, youtube, audio });
}

// ========== UNIFIED MESSAGE GENERATION ==========
async function generateMessage(type, data) {
  const params = new URLSearchParams({
    type,
    msg: encodeURIComponent(data.message),
    color: encodeURIComponent(data.color),
    font: data.font
  });

  if (data.mediaData) params.append('media', encodeURIComponent(data.mediaData));
  if (data.countdown) params.append('countdown', data.countdown);
  if (data.youtube) {
    const ytId = extractYouTubeID(data.youtube);
    if (ytId) params.append('youtube', ytId);
  }
  if (data.audio) params.append('audio', encodeURIComponent(data.audio));

  generatedLink = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  
  // Save to history
  saveToHistory({
    type,
    name: data.name || data.occasion || 'Custom',
    message: data.message,
    date: new Date().toISOString()
  });

  // Show preview
  showPreview(data.message, data.color, data.font);
}

// ========== MESSAGE PREVIEW ==========
function showPreview(message, color, font) {
  const preview = document.getElementById('preview-box');
  preview.style.background = color;
  preview.classList.add(getFontClass(font));
  
  document.getElementById('generated-message').textContent = message;
  document.getElementById('message-display').style.display = 'block';
  
  // Reset buttons
  document.getElementById('share-text').style.display = 'inline';
  document.getElementById('copied-text').style.display = 'none';
  document.getElementById('qr-container').style.display = 'none';
  document.getElementById('qr-toggle-text').textContent = 'Show QR';
}

// ========== SHARING FUNCTIONS ==========
function copyShareableLink() {
  navigator.clipboard.writeText(generatedLink).then(() => {
    document.getElementById('share-text').style.display = 'none';
    document.getElementById('copied-text').style.display = 'inline';
    setTimeout(() => {
      document.getElementById('share-text').style.display = 'inline';
      document.getElementById('copied-text').style.display = 'none';
    }, 2000);
  }).catch(err => alert('Failed to copy link'));
}

function shareWhatsApp() {
  const text = encodeURIComponent('🎉 I have a surprise for you! ' + generatedLink);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareTelegram() {
  const text = encodeURIComponent('🎉 I have a surprise for you!');
  window.open(`https://t.me/share/url?url=${encodeURIComponent(generatedLink)}&text=${text}`, '_blank');
}

function toggleQR() {
  const container = document.getElementById('qr-container');
  const toggleText = document.getElementById('qr-toggle-text');
  
  if (container.style.display === 'none') {
    generateQRCode();
    container.style.display = 'block';
    toggleText.textContent = 'Hide QR';
  } else {
    container.style.display = 'none';
    toggleText.textContent = 'Show QR';
  }
}

function generateQRCode() {
  const qr = document.getElementById('qrcode');
  qr.innerHTML = '';
  new QRCode(qr, {
    text: generatedLink,
    width: 200,
    height: 200,
    colorDark: '#1e293b',
    colorLight: '#ffffff'
  });
}

// ========== HISTORY MANAGEMENT ==========
function saveToHistory(data) {
  let history = JSON.parse(localStorage.getItem('messageHistory') || '[]');
  history.unshift(data);
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('messageHistory', JSON.stringify(history));
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem('messageHistory') || '[]');
  const list = document.getElementById('history-list');
  
  if (history.length === 0) {
    list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No messages created yet</p>';
    return;
  }
  
  list.innerHTML = '';
  history.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <strong>${item.name} - ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</strong><br>
      <small>${new Date(item.date).toLocaleString()}</small><br>
      <small style="color: var(--text-muted);">${item.message.substring(0, 60)}${item.message.length > 60 ? '...' : ''}</small>
    `;
    div.onclick = () => {
      alert(`Message: ${item.message}`);
    };
    list.appendChild(div);
  });
}

function clearHistory() {
  if (confirm('Are you sure you want to clear all message history?')) {
    localStorage.removeItem('messageHistory');
    loadHistory();
  }
}

// ========== RECIPIENT VIEW ==========
function checkURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const msg = urlParams.get('msg');

  if (type && msg) {
    const media = urlParams.get('media');
    const color = urlParams.get('color');
    const font = urlParams.get('font');
    const countdown = urlParams.get('countdown');
    const youtube = urlParams.get('youtube');
    const audio = urlParams.get('audio');
    
    showMessageView(type, {
      message: decodeURIComponent(msg),
      media: media ? decodeURIComponent(media) : null,
      color: color ? decodeURIComponent(color) : '#667eea',
      font: font || 'default',
      countdown,
      youtube,
      audio: audio ? decodeURIComponent(audio) : null
    });
  }
}

function showMessageView(type, data) {
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('message-view').style.display = 'block';
  
  // Show envelope first
  document.getElementById('envelope-wrapper').style.display = 'block';
  
  // Store data for opening
  window.recipientData = { type, ...data };
}

function openEnvelope() {
  document.getElementById('envelope').classList.add('open');
  
  // Trigger confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  setTimeout(() => {
    const { type, message, media, color, font, countdown, youtube, audio } = window.recipientData;
    
    document.getElementById('envelope-wrapper').style.display = 'none';
    document.getElementById('message-reveal').style.display = 'block';
    
    // Set emoji and title
    const emojiMap = { 'birthday': '🎂', 'anniversary': '💕', 'achievement': '🏆', 'custom': '✨' };
    const titleMap = { 
      'birthday': 'Happy Birthday! 🎉', 
      'anniversary': 'Happy Anniversary! 💑', 
      'achievement': 'Congratulations! 🎊',
      'custom': 'A Special Message! 💌'
    };
    
    document.getElementById('celebration-emoji').textContent = emojiMap[type] || '🎉';
    document.getElementById('message-title').textContent = titleMap[type] || 'You\'ve Received a Message!';
    
    // Display message with color and font
    const content = document.querySelector('.message-content');
    content.style.background = color;
    content.classList.add(getFontClass(font));
    document.getElementById('received-message').textContent = message;
    
    // Display media
    let mediaArea = document.getElementById('media-display-area');
    if (!mediaArea) {
      mediaArea = document.createElement('div');
      mediaArea.id = 'media-display-area';
      content.insertBefore(mediaArea, content.firstChild);
    }
    
    mediaArea.innerHTML = '';
    if (media) {
      if (media.includes("video")) {
        mediaArea.innerHTML = `<video src="${media}" controls style="width:100%; border-radius:12px; margin-bottom:15px;"></video>`;
      } else {
        mediaArea.innerHTML = `<img src="${media}" style="width:100%; border-radius:12px; margin-bottom:15px;" alt="Attached media">`;
      }
    }
    
    // Countdown timer
    if (countdown) {
      const countdownDiv = document.getElementById('countdown-container');
      countdownDiv.style.display = 'block';
      startCountdown(countdown);
    }
    
    // YouTube video
    if (youtube) {
      const ytContainer = document.getElementById('youtube-container');
      const ytFrame = document.getElementById('youtube-frame');
      ytFrame.src = `https://www.youtube.com/embed/${youtube}?autoplay=1`;
      ytContainer.style.display = 'block';
    }
    
    // Voice note
    if (audio) {
      const audioContainer = document.getElementById('audio-container');
      const player = document.getElementById('voice-player');
      player.src = audio;
      audioContainer.style.display = 'block';
    }
  }, 800);
}

function startCountdown(targetDate) {
  const display = document.getElementById('countdown-display');
  
  function update() {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;
    
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      display.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
      display.textContent = '🎉 It\'s time!';
      clearInterval(window.countdownInterval);
    }
  }
  
  update();
  window.countdownInterval = setInterval(update, 1000);
}

// ========== GO HOME ==========
function goHome() {
  window.history.pushState({}, document.title, window.location.pathname);
  document.getElementById('main-app').style.display = 'block';
  document.getElementById('message-view').style.display = 'none';
  document.getElementById('message-display').style.display = 'none';
  
  // Reset envelope
  document.getElementById('envelope').classList.remove('open');
  document.getElementById('envelope-wrapper').style.display = 'none';
  document.getElementById('message-reveal').style.display = 'none';
  
  if (window.countdownInterval) clearInterval(window.countdownInterval);}