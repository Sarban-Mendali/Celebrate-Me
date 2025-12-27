// Global variables
let mediaRecorder, audioChunks = [];
let generatedLink = '';
let audioDataStore = {};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initColorPickers();
  initTabs();
  generateInitialMessages();
  checkURLParams();
});

// ========== THEME ==========
function initTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeButton(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const menuText = document.getElementById('menu-theme-text');
  menuText.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// ========== MENU ==========
function toggleMenu() {
  document.getElementById('dropdown-menu').classList.toggle('active');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('dropdown-menu');
  const btn = document.querySelector('.menu-btn');
  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('active');
  }
});

// ========== MODALS ==========
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

// ========== TABS ==========
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  
  document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));
  document.getElementById(`${tab}-form`).classList.add('active');
  
  document.getElementById('message-display').style.display = 'none';
}

// ========== COLOR PICKER ==========
function initColorPickers() {
  const colors = ['#667eea', '#f43f5e', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',];
  
  ['birthday', 'anniversary', 'achievement', 'custom'].forEach(type => {
    const container = document.getElementById(`${type}-colors`);
    if (container) {
      container.innerHTML = '';
      colors.forEach((c, i) => {
        const d = document.createElement('div');
        d.className = 'color-option' + (i === 0 ? ' selected' : '');
        d.style.background = c; 
        d.onclick = () => selectColor(type, d);
        container.appendChild(d);
      });
    }
  });
}

function selectColor(type, el) {
  document.querySelectorAll(`#${type}-colors .color-option`).forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
}

function getSelectedColor(type) {
  const s = document.querySelector(`#${type}-colors .color-option.selected`);
  return s ? s.style.background : '#667eea';
}

// ========== INITIAL MESSAGES ==========
function generateInitialMessages() {
  const msgs = {
    birthday: ["Happy Birthday! 🎂 May your day be filled with joy!", "Wishing you the happiest birthday! 🎉", "Happy Birthday! 🎈 Another year of amazing memories!"],
    anniversary: ["Happy Anniversary! 💕 Here's to your beautiful journey!", "Congratulations! ❤️ Your love story inspires!", "Happy Anniversary! 🌹 Forever and always!"],
    achievement: ["Congratulations! 🎊 Your hard work paid off!", "Way to go! 🌟 You deserve this success!", "Incredible work! 🏆 Just the beginning!"]
  };
  
  Object.keys(msgs).forEach(type => {
    const el = document.getElementById(`${type}-message`);
    if (el) el.value = msgs[type][Math.floor(Math.random() * msgs[type].length)];
  });
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

      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          audioDataStore[type] = reader.result;
          preview.src = URL.createObjectURL(blob);
          preview.style.display = 'block';
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      btn.classList.add('recording');
      text.textContent = 'Stop Recording';
    } catch {
      alert('Microphone access denied');
    }
  } else {
    mediaRecorder.stop();
    btn.classList.remove('recording');
    text.textContent = 'Record Voice';
  }
}

// ========== HELPERS ==========
async function getBase64(file) {
  return new Promise((resolve) => {
    if (!file) resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function getFontClass(font) {
  return { default: 'font-default', cursive: 'font-cursive', bold: 'font-bold', playful: 'font-playful' }[font] || 'font-default';
}

function extractYouTubeID(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

// ========== MESSAGE GENERATION ==========
async function generateBirthdayMessage() {
  const name = document.getElementById('birthday-name').value.trim();
  const message = document.getElementById('birthday-message').value.trim();
  if (!name || !message) { alert('Please fill required fields'); return; }

  const data = {
    type: 'birthday',
    name,
    age: document.getElementById('birthday-age').value,
    message,
    color: getSelectedColor('birthday'),
    font: document.getElementById('birthday-font').value,
    countdown: document.getElementById('birthday-countdown').value,
    youtube: document.getElementById('birthday-youtube').value,
    file: document.getElementById('birthday-file').files[0],
    audio: audioDataStore.birthday
  };

  await generateMessage(data);
}

async function generateAnniversaryMessage() {
  const name = document.getElementById('anniversary-name').value.trim();
  const message = document.getElementById('anniversary-message').value.trim();
  if (!name || !message) { alert('Please fill required fields'); return; }

  const data = {
    type: 'anniversary',
    name,
    years: document.getElementById('anniversary-years').value,
    message,
    color: getSelectedColor('anniversary'),
    font: document.getElementById('anniversary-font').value,
    countdown: document.getElementById('anniversary-countdown').value,
    youtube: document.getElementById('anniversary-youtube').value,
    file: document.getElementById('anniversary-file').files[0],
    audio: audioDataStore.anniversary
  };

  await generateMessage(data);
}

async function generateAchievementMessage() {
  const name = document.getElementById('achievement-name').value.trim();
  const achievement = document.getElementById('achievement-text').value.trim();
  const message = document.getElementById('achievement-message').value.trim();
  if (!name || !achievement || !message) { alert('Please fill required fields'); return; }

  const data = {
    type: 'achievement',
    name,
    achievement,
    message,
    color: getSelectedColor('achievement'),
    font: document.getElementById('achievement-font').value,
    countdown: document.getElementById('achievement-countdown').value,
    youtube: document.getElementById('achievement-youtube').value,
    file: document.getElementById('achievement-file').files[0],
    audio: audioDataStore.achievement
  };

  await generateMessage(data);
}

async function generateCustomMessage() {
  const occasion = document.getElementById('custom-occasion').value.trim();
  const message = document.getElementById('custom-message').value.trim();
  if (!occasion || !message) { alert('Please fill required fields'); return; }

  const data = {
    type: 'custom',
    occasion,
    name: document.getElementById('custom-name').value,
    message,
    color: getSelectedColor('custom'),
    font: document.getElementById('custom-font').value,
    youtube: document.getElementById('custom-youtube').value,
    file: document.getElementById('custom-file').files[0],
    audio: audioDataStore.custom
  };

  await generateMessage(data);
}

async function generateMessage(data) {
  const mediaData = await getBase64(data.file);
  const ytId = extractYouTubeID(data.youtube);

  const params = new URLSearchParams({
    type: data.type,
    msg: encodeURIComponent(data.message),
    color: encodeURIComponent(data.color),
    font: data.font
  });

  if (mediaData) params.append('media', encodeURIComponent(mediaData));
  if (data.countdown) params.append('countdown', data.countdown);
  if (ytId) params.append('youtube', ytId);
  if (data.audio) params.append('audio', encodeURIComponent(data.audio));

  generatedLink = `${location.origin}${location.pathname}?${params}`;

  saveToHistory({
    type: data.type,
    name: data.name || data.occasion || 'Message',
    message: data.message,
    date: new Date().toISOString()
  });

  showPreview(data.message, data.color, data.font);
}

// ========== PREVIEW ==========
function showPreview(message, color, font) {
  const box = document.getElementById('preview-box');
  box.className = 'message-box ' + getFontClass(font);
  box.style.background = color;
  box.style.color = '#fff';
  
  document.getElementById('generated-message').textContent = message;
  document.getElementById('message-display').style.display = 'block';
  document.getElementById('qr-container').style.display = 'none';
  
  document.getElementById('share-text').style.display = 'inline';
  document.getElementById('copied-text').style.display = 'none';
  document.getElementById('qr-toggle-text').textContent = '📱 Show QR';
}

// ========== SHARING ==========
function copyShareableLink() {
  navigator.clipboard.writeText(generatedLink).then(() => {
    document.getElementById('share-text').style.display = 'none';
    document.getElementById('copied-text').style.display = 'inline';
    setTimeout(() => {
      document.getElementById('share-text').style.display = 'inline';
      document.getElementById('copied-text').style.display = 'none';
    }, 2000);
  });
}

function shareWhatsApp() {
  window.open(`https://wa.me/?text=${encodeURIComponent('🎉 Surprise for you! ' + generatedLink)}`, '_blank');
}

function shareTelegram() {
  window.open(`https://t.me/share/url?url=${encodeURIComponent(generatedLink)}&text=${encodeURIComponent('🎉 Surprise for you!')}`, '_blank');
}

function toggleQR() {
  const c = document.getElementById('qr-container');
  const t = document.getElementById('qr-toggle-text');
  
  if (c.style.display === 'none') {
    generateQRCode();
    c.style.display = 'block';
    t.textContent = '📱 Hide QR';
  } else {
    c.style.display = 'none';
    t.textContent = '📱 Show QR';
  }
}

function generateQRCode() {
  const qr = document.getElementById('qrcode');
  qr.innerHTML = '';
  new QRCode(qr, { text: generatedLink, width: 200, height: 200 });
}

// ========== HISTORY ==========
function saveToHistory(data) {
  let history = JSON.parse(localStorage.getItem('messageHistory') || '[]');
  history.unshift(data);
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('messageHistory', JSON.stringify(history));
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem('messageHistory') || '[]');
  const list = document.getElementById('history-list');
  
  if (!history.length) {
    list.innerHTML = '<p style="text-align:center;color:#64748b;padding:20px;">No messages yet</p>';
    return;
  }
  
  list.innerHTML = '';
  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <strong>${item.name} - ${item.type}</strong><br>
      <small>${new Date(item.date).toLocaleString()}</small><br>
      <small style="color:#94a3b8;">${item.message.substring(0, 60)}...</small>
    `;
    div.onclick = () => alert(item.message);
    list.appendChild(div);
  });
}

function clearHistory() {
  if (confirm('Clear all history?')) {
    localStorage.removeItem('messageHistory');
    loadHistory();
  }
}

// ========== RECIPIENT VIEW ==========
function checkURLParams() {
  const params = new URLSearchParams(location.search);
  if (params.get('msg')) {
    showRecipientView(params);
  }
}

function showRecipientView(params) {
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('recipient-view').style.display = 'block';
  
  window.recipientData = {
    type: params.get('type') || 'custom',
    message: decodeURIComponent(params.get('msg')),
    color: params.get('color') ? decodeURIComponent(params.get('color')) : '#667eea',
    font: params.get('font') || 'default',
    media: params.get('media') ? decodeURIComponent(params.get('media')) : null,
    countdown: params.get('countdown'),
    youtube: params.get('youtube'),
    audio: params.get('audio') ? decodeURIComponent(params.get('audio')) : null
  };
}

function openEnvelope() {
  document.getElementById('envelope').classList.add('open');
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  
  setTimeout(() => {
    const d = window.recipientData;
    document.getElementById('envelope-wrapper').style.display = 'none';
    document.getElementById('message-reveal').style.display = 'block';
    
    const emojiMap = { birthday: '🎂', anniversary: '💕', achievement: '🏆', custom: '✨' };
    const titleMap = { birthday: 'Happy Birthday! 🎉', anniversary: 'Happy Anniversary! 💑', achievement: 'Congratulations! 🎊', custom: 'Special Message! 💌' };
    
    document.getElementById('celebration-emoji').textContent = emojiMap[d.type] || '🎉';
    document.getElementById('message-title').textContent = titleMap[d.type] || 'You have Got Mail!';
    
    const content = document.getElementById('message-content-recipient');
    content.style.background = d.color;
    content.className = 'message-content-recipient ' + getFontClass(d.font);
    document.getElementById('received-message').textContent = d.message;
    
    // Media
    if (d.media) {
      const mediaDiv = document.createElement('div');
      mediaDiv.style.marginBottom = '15px';
      if (d.media.includes('video')) {
        mediaDiv.innerHTML = `<video src="${d.media}" controls style="width:100%;border-radius:12px;"></video>`;
      } else {
        mediaDiv.innerHTML = `<img src="${d.media}" style="width:100%;border-radius:12px;">`;
      }
      content.insertBefore(mediaDiv, content.firstChild);
    }
    
    // Countdown
    if (d.countdown) {
      document.getElementById('countdown-container').style.display = 'block';
      startCountdown(d.countdown);
    }
    
    // YouTube
    if (d.youtube) {
      document.getElementById('youtube-frame').src = `https://www.youtube.com/embed/${d.youtube}?autoplay=1`;
      document.getElementById('youtube-container').style.display = 'block';
    }
    
    // Audio
    if (d.audio) {
      document.getElementById('voice-player').src = d.audio;
      document.getElementById('audio-container').style.display = 'block';
    }
  }, 800);
}

function startCountdown(target) {
  const display = document.getElementById('countdown-display');
  
  function update() {
    const diff = new Date(target) - new Date();
    if (diff > 0) {
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      display.textContent = `${d}d ${h}h ${m}m ${s}s`;
    } else {
      display.textContent = '🎉 It\'s Time!';
    }
  }
  
  update();
  setInterval(update, 1000);
}

function goHome() {
  history.pushState({}, '', location.pathname);
  document.getElementById('main-app').style.display = 'block';
  document.getElementById('recipient-view').style.display = 'none';
  document.getElementById('message-display').style.display = 'none';
  
  document.getElementById('envelope').classList.remove('open');
  document.getElementById('envelope-wrapper').style.display = 'block';
  document.getElementById('message-reveal').style.display = 'none';
}

