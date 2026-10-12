// ============ NAMAZ TIMES WITH MASLAK SUPPORT ============

const MASLAK_METHODS = {
  hanafi:  { name: 'Hanafi',        method: 'Karachi',  asrFactor: 2 },
  shafi:   { name: "Shafi'i",        method: 'MWL',      asrFactor: 1 },
  maliki:  { name: 'Maliki',         method: 'MWL',      asrFactor: 1 },
  hanbali: { name: 'Hanbali',        method: 'MWL',      asrFactor: 1 },
  shia:    { name: 'Shia (Jafari)',  method: 'Tehran',   asrFactor: 1 }
};

let userCoords = { lat: 28.6139, lng: 77.2090 };
let userMaslak = localStorage.getItem('maslak') || 'hanafi';

// ---------- Location ----------
function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(userCoords); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        updateCityName();
        resolve(userCoords);
      },
      () => resolve(userCoords),
      { timeout: 5000 }
    );
  });
}

async function updateCityName() {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userCoords.lat}&lon=${userCoords.lng}&format=json`);
    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.state || 'Location';
    const el = document.getElementById('city-name');
    if (el) el.textContent = city;
  } catch (e) {
    const el = document.getElementById('city-name');
    if (el) el.textContent = `${userCoords.lat.toFixed(2)}, ${userCoords.lng.toFixed(2)}`;
  }
}

// ---------- Maslak ----------
function setMaslak(maslak) {
  userMaslak = maslak;
  localStorage.setItem('maslak', maslak);
  renderPrayerTimes();
}

// ---------- Calculate ----------
function calculatePrayerTimes() {
  const config = MASLAK_METHODS[userMaslak];
  const coordinates = new adhan.Coordinates(userCoords.lat, userCoords.lng);
  const date = new Date();
  
  let params;
  try {
    params = adhan.CalculationMethod[config.method]();
  } catch (e) {
    params = adhan.CalculationMethod.MuslimWorldLeague();
  }

  if (userMaslak === 'shia') {
    params.madhab = adhan.Madhab.Shafi;
    params.fajrAngle = 16;
    params.ishaAngle = 14;
  } else {
    params.madhab = config.asrFactor === 2 ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  }

  const times = new adhan.PrayerTimes(coordinates, date, params);
  return {
    fajr:    times.fajr,
    sunrise: times.sunrise,
    dhuhr:   times.dhuhr,
    asr:     times.asr,
    maghrib: times.maghrib,
    isha:    times.isha
  };
}

// ---------- Format ----------
function formatTime(date) {
  if (!date) return '--:--';
  let h = date.getHours();
  let m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  m = m.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

function formatTime24(date) {
  if (!date) return '--:--';
  return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
}

// ---------- Current/Next ----------
function findCurrentNext(times) {
  const now = new Date();
  const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let current = null;
  let next = null;
  
  for (let i = 0; i < order.length; i++) {
    const key = order[i];
    const t = times[key];
    if (!t) continue;
    if (now >= t) { current = key; } else { next = key; break; }
  }
  if (!next) next = 'fajr';
  return { current, next };
}

// ---------- Countdown ----------
let countdownInterval = null;

function startCountdown(nextKey, times) {
  if (countdownInterval) clearInterval(countdownInterval);
  const el = document.getElementById('countdown-value');
  const sub = document.getElementById('countdown-sub');
  const label = document.getElementById('countdown-label');
  if (!el) return;
  
  const icons = { fajr:'🌅', sunrise:'☀️', dhuhr:'🌤️', asr:'🌇', maghrib:'🌆', isha:'🌙' };
  const names = { fajr:'Fajr', sunrise:'Sunrise', dhuhr:'Dhuhr', asr:'Asr', maghrib:'Maghrib', isha:'Isha' };
  
  let target = times[nextKey];
  if (target && target < new Date()) {
    target = new Date(target.getTime() + 24 * 60 * 60 * 1000);
  }
  
  function update() {
    const diff = target - new Date();
    if (diff <= 0) { renderPrayerTimes(); return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }
  
  if (label) label.textContent = `Time until ${names[nextKey]}`;
  if (sub) sub.textContent = `${icons[nextKey]} ${names[nextKey]} at ${formatTime(times[nextKey])}`;
  update();
  countdownInterval = setInterval(update, 1000);
}

// ---------- Render ----------
async function renderPrayerTimes() {
  await getUserLocation();
  const times = calculatePrayerTimes();
  const config = MASLAK_METHODS[userMaslak];
  const { current, next } = findCurrentNext(times);
  
  // Save times for Azan checker
  localStorage.setItem('prayerTimes', JSON.stringify({
    fajr: formatTime24(times.fajr),
    dhuhr: formatTime24(times.dhuhr),
    asr: formatTime24(times.asr),
    maghrib: formatTime24(times.maghrib),
    isha: formatTime24(times.isha)
  }));
  
  const namazList = [
    { key: 'fajr',    label: 'Fajr',    icon: '🌅' },
    { key: 'sunrise', label: 'Sunrise', icon: '☀️' },
    { key: 'dhuhr',   label: 'Dhuhr',   icon: '🌤️' },
    { key: 'asr',     label: 'Asr',     icon: '🌇' },
    { key: 'maghrib', label: 'Maghrib', icon: '🌆' },
    { key: 'isha',    label: 'Isha',    icon: '🌙' }
  ];
  
  const maslakButtons = Object.keys(MASLAK_METHODS).map(key => `
    <button class="maslak-btn ${key === userMaslak ? 'active' : ''}" onclick="setMaslak('${key}')">
      ${MASLAK_METHODS[key].name}
    </button>
  `).join('');
  
  const namazRows = namazList.map(n => {
    const isCurrent = n.key === current;
    const isPassed = times[n.key] && times[n.key] < new Date() && !isCurrent;
    const cls = isCurrent ? 'current' : (isPassed ? 'passed' : '');
    return `
      <div class="namaz-row ${cls}">
        <div class="namaz-left">
          <span class="namaz-icon">${n.icon}</span>
          <div>
            <div class="namaz-name">${n.label}</div>
            ${isCurrent ? '<div class="namaz-name-small">Now</div>' : ''}
          </div>
        </div>
        <span class="namaz-time">${formatTime(times[n.key])}</span>
      </div>
    `;
  }).join('');
  
  // Check azan state
  const azanOn = localStorage.getItem('azanEnabled') === 'true';
  
  const html = `
    <div class="countdown-card">
      <div class="countdown-label" id="countdown-label">Loading...</div>
      <div class="countdown-value" id="countdown-value">--:--:--</div>
      <div class="countdown-sub" id="countdown-sub"></div>
    </div>
    
    <div class="card">
      <div class="card-title"><span class="card-title-icon">🕌</span> Maslak</div>
      <div class="maslak-list">${maslakButtons}</div>
    </div>
    
    <div class="card">
      <div class="card-title"><span class="card-title-icon">⏰</span> ${config.name} Timings</div>
      <div class="namaz-list">${namazRows}</div>
    </div>
    
    <div class="card">
      <div class="card-title"><span class="card-title-icon">📍</span> Location</div>
      <p style="font-size:0.85rem;color:var(--text-muted);">Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)}</p>
      <button class="location-btn" onclick="renderPrayerTimes()">🔄 Refresh</button>
    </div>
    
    <div class="card">
      <div class="card-title"><span class="card-title-icon">🔔</span> Azan Notification</div>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:10px;">
       Get notification at prayer time
      </p>
      <button id="azan-toggle" onclick="toggleAzan()" style="width:100%;padding:12px;border:none;border-radius:10px;cursor:pointer;font-family:inherit;font-size:0.95rem;font-weight:500;background:${azanOn ? 'var(--primary)' : 'var(--border)'};color:${azanOn ? 'white' : 'var(--text)'};">
        ${azanOn ? '🔔 Azan ON' : '🔕 Azan OFF'}
      </button>
    </div>
  `;
  
  document.getElementById('namaz').innerHTML = html;
  startCountdown(next, times);
}

function initPrayerTimes() {
  renderPrayerTimes();
}