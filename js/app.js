// ============ APP INITIALIZATION ============

// --- Tab Navigation ---
function showTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  const tab = document.getElementById(tabName);
  if (tab) tab.classList.add('active');
  
  const btn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
  if (btn) btn.classList.add('active');
  
  if (tabName === 'namaz' && typeof renderPrayerTimes === 'function') renderPrayerTimes();
  if (tabName === 'quran' && typeof renderQuran === 'function') renderQuran();
  if (tabName === 'hadith' && typeof renderHadith === 'function') renderHadith();
  if (tabName === 'masjid' && typeof renderMasjid === 'function') renderMasjid();
  if (tabName === 'tasbeeh' && typeof renderTasbeeh === 'function') renderTasbeeh();
  if (tabName === 'qaza' && typeof renderQaza === 'function') renderQaza();
}

// --- Dark Mode ---
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  document.getElementById('dark-icon').textContent = isDark ? '☀️' : '🌙';
}

function loadDarkMode() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    const icon = document.getElementById('dark-icon');
    if (icon) icon.textContent = '☀️';
  }
}

// --- Get User IP ---
async function getUserIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch (e) {
    try {
      const res2 = await fetch('https://api.ipify.org');
      const ip = await res2.text();
      return ip;
    } catch (e2) {
      console.log('IP fetch failed');
      return null;
    }
  }
}

// --- Get IP Info (Location from IP) ---
async function getIPInfo() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      lat: data.latitude,
      lng: data.longitude,
      timezone: data.timezone
    };
  } catch (e) {
    console.log('IP info fetch failed:', e);
    return null;
  }
}

// --- Hijri Date ---
function updateHijriDate() {
  try {
    const today = new Date();
    const hijri = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(today);
    const el = document.getElementById('hijri-date');
    if (el) el.textContent = hijri.replace(' AH', '');
  } catch (e) {
    const el = document.getElementById('hijri-date');
    if (el) el.textContent = new Date().toLocaleDateString();
  }
}

// ============ HIJRI CALENDAR ============
let hijriViewDate = new Date();

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi-ul-Awwal', 'Rabi-ul-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
];

function toggleHijriCalendar() {
  const popup = document.getElementById('hijri-calendar-popup');
  if (popup.classList.contains('hidden')) {
    hijriViewDate = new Date();
    renderHijriCalendar();
    popup.classList.remove('hidden');
  } else {
    popup.classList.add('hidden');
  }
}

function changeHijriMonth(delta) {
  hijriViewDate.setMonth(hijriViewDate.getMonth() + delta);
  renderHijriCalendar();
}

function goToToday() {
  hijriViewDate = new Date();
  renderHijriCalendar();
}

function getHijriDate(engDate) {
  try {
    const fmt = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });
    const parts = fmt.formatToParts(engDate);
    const day = parseInt(parts.find(p => p.type === 'day').value);
    const month = parseInt(parts.find(p => p.type === 'month').value);
    const year = parseInt(parts.find(p => p.type === 'year').value);
    return { day, month, year };
  } catch (e) {
    return null;
  }
}

function renderHijriCalendar() {
  const year = hijriViewDate.getFullYear();
  const month = hijriViewDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  
  const firstHijri = getHijriDate(firstDay);
  const lastHijri = getHijriDate(lastDay);
  
  const hijriMonthName = firstHijri ? HIJRI_MONTHS[firstHijri.month - 1] : '';
  const hijriYear = firstHijri ? firstHijri.year : '';
  const hijriMonthNameEnd = lastHijri ? HIJRI_MONTHS[lastHijri.month - 1] : '';
  const hijriYearEnd = lastHijri ? lastHijri.year : '';
  
  let title;
  if (firstHijri && lastHijri && firstHijri.month === lastHijri.month) {
    title = `${hijriMonthName} ${hijriYear} AH`;
  } else {
    title = `${hijriMonthName} ${hijriYear} - ${hijriMonthNameEnd} ${hijriYearEnd} AH`;
  }
  
  document.getElementById('hijri-month-title').textContent = title;
  
  const engMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('hijri-month-subtitle').textContent = `${engMonths[month]} ${year}`;
  
  const grid = document.getElementById('hijri-calendar-grid');
  grid.innerHTML = '';
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  for (let i = 0; i < startWeekday; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'hijri-day empty';
    grid.appendChild(emptyCell);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const engDate = new Date(year, month, d);
    const hijri = getHijriDate(engDate);
    const dateStr = `${year}-${month}-${d}`;
    
    const cell = document.createElement('div');
    cell.className = 'hijri-day';
    if (dateStr === todayStr) cell.classList.add('today');
    
    const hijriNum = hijri ? hijri.day : '?';
    
    cell.innerHTML = `
      <div class="hijri-day-num">${hijriNum}</div>
      <div class="hijri-day-eng">${d}</div>
    `;
    
    cell.onclick = () => {
      alert(`${d} ${engMonths[month]} ${year}\n\n${hijriNum} ${hijri ? HIJRI_MONTHS[hijri.month-1] : ''} ${hijri ? hijri.year : ''} AH`);
    };
    
    grid.appendChild(cell);
  }
}

// ============ DAILY HADITH TOP BAR ============
let dailyHadith = null;
let hadithEnglish = null;
let hadithUrdu = null;

async function loadDailyHadith() {
  try {
    if (!hadithEnglish) {
      const data = await fetch('data/hadith/bukhari.json').then(r => r.json());
      hadithEnglish = data.hadiths || data;
    }
    
    if (!hadithUrdu) {
      try {
        const data = await fetch('data/hadith/bukhari-urdu.json').then(r => r.json());
        hadithUrdu = data.hadiths || data;
      } catch (e) {
        console.log('Urdu hadith not available:', e);
      }
    }
    
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const index = dayOfYear % hadithEnglish.length;
    
    dailyHadith = hadithEnglish[index];
    window.dailyHadithUrdu = (hadithUrdu && hadithUrdu[index]) ? hadithUrdu[index] : null;
    
    displayDailyHadith();
    
  } catch (e) {
    console.error('Daily hadith error:', e);
    const el = document.getElementById('hadith-top-text');
    if (el) el.textContent = 'Assalamu Alaikum';
  }
}

function displayDailyHadith() {
  const el = document.getElementById('hadith-top-text');
  if (!el || !dailyHadith) return;
  
  const hEng = dailyHadith;
  const hUrd = window.dailyHadithUrdu;
  
  let english = hEng.text || hEng.english || '';
  english = english.replace(/\s+/g, ' ').trim();
  
  let urdu = '';
  if (hUrd) {
    urdu = hUrd.text || hUrd.urdu || '';
    urdu = urdu.replace(/\s+/g, ' ').trim();
  }
  
  const bookName = 'Sahih Bukhari';
  const hadithNum = hEng.hadithnumber || hEng.id || '?';
  
  let html = '';
  
  if (urdu) {
    html += `
      <div style="font-family:'Noto Nastaliq Urdu','Amiri',serif;font-size:0.92rem;line-height:2;color:#0B3D2E;direction:rtl;text-align:right;margin-bottom:8px;font-weight:500;">
        ${urdu}
      </div>
    `;
  }
  
  if (english) {
    html += `
      <div style="font-size:0.78rem;line-height:1.5;color:#0B3D2E;margin-bottom:6px;">
        ${english}
      </div>
    `;
  }
  
  html += `
    <div style="font-size:0.72rem;color:#5C4A15;opacity:0.9;font-weight:600;letter-spacing:0.3px;margin-top:4px;border-top:1px dashed rgba(92,74,21,0.3);padding-top:6px;">
      📚 ${bookName} • Hadith #${hadithNum}
    </div>
  `;
  
  el.innerHTML = html;
}

// ============ AZAN NOTIFICATION + AUDIO ============
let azanEnabled = false;
let azanCheckInterval = null;

function toggleAzan() {
  if (!('Notification' in window)) {
    alert('इस browser में notifications support नहीं हैं');
    return;
  }
  
  azanEnabled = !azanEnabled;
  localStorage.setItem('azanEnabled', azanEnabled);
  
  const btn = document.getElementById('azan-toggle');
  if (btn) {
    btn.textContent = azanEnabled ? '🔔 Azan ON' : '🔕 Azan OFF';
    btn.style.background = azanEnabled ? 'var(--primary)' : 'var(--border)';
    btn.style.color = azanEnabled ? 'white' : 'var(--text)';
  }
  
  if (azanEnabled) {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        startAzanChecker();
        new Notification('🕌 Azan Enabled', {
          body: 'नमाज़ के वक़्त पर Azan sound + notification मिलेगा',
          icon: 'icons/icon-192.png'
        });
      } else {
        azanEnabled = false;
        alert('Notification permission denied');
      }
    });
  } else {
    if (azanCheckInterval) clearInterval(azanCheckInterval);
  }
}

// 🔊 Test Azan Audio
function testAzan() {
  try {
    const audio = new Audio('sounds/azan.mp3');
    audio.volume = 1.0;
    audio.play()
      .then(() => console.log('🕌 Azan playing...'))
      .catch(e => {
        console.log('Audio error:', e);
        alert('❌ Azan play नहीं हो पाई।\n\n' + 
              'कारण: ' + e.message + '\n\n' +
              'Solution: Page पर कहीं click करें, फिर दोबारा try करें।');
      });
  } catch (e) {
    alert('❌ Azan error: ' + e.message);
  }
}

function startAzanChecker() {
  if (azanCheckInterval) clearInterval(azanCheckInterval);
  azanCheckInterval = setInterval(() => {
    checkAzanTime();
  }, 60000);
  // Also check immediately
  checkAzanTime();
}

async function checkAzanTime() {
  if (!azanEnabled) return;
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  
  const savedTimes = JSON.parse(localStorage.getItem('prayerTimes') || '{}');
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const prayerNames = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
  const prayerIcons = { fajr: '🌅', dhuhr: '🌤️', asr: '🌇', maghrib: '🌆', isha: '🌙' };
  
  for (const p of prayers) {
    if (savedTimes[p] === currentTime) {
      const notifiedKey = `notified_${p}_${now.toDateString()}`;
      if (localStorage.getItem(notifiedKey)) continue;
      
      // 🔊 PLAY AZAN AUDIO
      try {
        const azanAudio = new Audio('sounds/azan.mp3');
        azanAudio.volume = 1.0;
        azanAudio.play()
          .then(() => console.log('🕌 Azan playing for', prayerNames[p]))
          .catch(e => console.log('Azan autoplay blocked:', e));
      } catch (e) {
        console.log('Azan audio error:', e);
      }
      
      // 🔔 SHOW NOTIFICATION
      if (Notification.permission === 'granted') {
        try {
          new Notification(`${prayerIcons[p]} ${prayerNames[p]} का वक़्त`, {
            body: `${prayerNames[p]} की अज़ान हो गई है। नमाज़ पढ़ लें।`,
            icon: 'icons/icon-192.png',
            badge: 'icons/icon-192.png',
            tag: `azan_${p}`,
            requireInteraction: true
          });
        } catch (e) {
          console.log('Notification error:', e);
        }
      }
      
      localStorage.setItem(notifiedKey, 'true');
    }
  }
}

// ============ USER INFO / IP DISPLAY ============
async function loadUserInfo() {
  const info = await getIPInfo();
  
  if (info) {
    console.log('📍 User IP Info:', info);
    window.userIPInfo = info;
    
    const cityEl = document.getElementById('city-name');
    if (cityEl && info.city) {
      cityEl.textContent = `${info.city}${info.region ? ', ' + info.region : ''}`;
    }
    
    localStorage.setItem('userIP', info.ip);
    localStorage.setItem('userCity', info.city);
    localStorage.setItem('userCountry', info.country);
    
    if (info.lat && info.lng) {
      localStorage.setItem('ipLat', info.lat);
      localStorage.setItem('ipLng', info.lng);
    }
  } else {
    const ip = await getUserIP();
    if (ip) {
      console.log('📍 User IP:', ip);
      localStorage.setItem('userIP', ip);
    }
  }
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  loadDarkMode();
  updateHijriDate();
  loadDailyHadith();
  loadUserInfo();
  
  // Restore Azan state
  if (localStorage.getItem('azanEnabled') === 'true') {
    azanEnabled = true;
    const btn = document.getElementById('azan-toggle');
    if (btn) {
      btn.textContent = '🔔 Azan ON';
      btn.style.background = 'var(--primary)';
      btn.style.color = 'white';
    }
    startAzanChecker();
  }
  
  if (typeof initPrayerTimes === 'function') initPrayerTimes();
  if (typeof initQuran === 'function') initQuran();
  if (typeof initHadith === 'function') initHadith();
  if (typeof initTasbeeh === 'function') initTasbeeh();
  if (typeof initQaza === 'function') initQaza();
});