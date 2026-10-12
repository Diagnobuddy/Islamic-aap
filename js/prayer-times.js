const MASLAK_METHODS = {
  hanafi:  { name: 'Hanafi',        method: 'Karachi', asrFactor: 2 },
  shafi:   { name: "Shafi'i",        method: 'MWL',     asrFactor: 1 },
  maliki:  { name: 'Maliki',         method: 'MWL',     asrFactor: 1 },
  hanbali: { name: 'Hanbali',        method: 'MWL',     asrFactor: 1 },
  shia:    { name: 'Shia (Jafari)',  method: 'Tehran',  asrFactor: 1 }
};

let userCoords = { lat: 28.6139, lng: 77.2090 };
let userMaslak = localStorage.getItem('maslak') || 'hanafi';

function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(userCoords); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        resolve(userCoords);
      },
      () => resolve(userCoords),
      { timeout: 5000 }
    );
  });
}

function setMaslak(maslak) {
  userMaslak = maslak;
  localStorage.setItem('maslak', maslak);
  renderPrayerTimes();
}

function calculatePrayerTimes() {
  const config = MASLAK_METHODS[userMaslak];
  const coordinates = new adhan.Coordinates(userCoords.lat, userCoords.lng);
  const date = new Date();
  const params = adhan.CalculationMethod[config.method]();

  if (userMaslak === 'shia') {
    params.madhab = adhan.Madhab.Shafi;
    params.fajrAngle = 16;
    params.ishaAngle = 14;
  } else {
    params.madhab = config.asrFactor === 2 ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  }

  const times = new adhan.PrayerTimes(coordinates, date, params);
  return {
    fajr:    formatTime(times.fajr),
    sunrise: formatTime(times.sunrise),
    dhuhr:   formatTime(times.dhuhr),
    asr:     formatTime(times.asr),
    maghrib: formatTime(times.maghrib),
    isha:    formatTime(times.isha)
  };
}

function formatTime(date) {
  if (!date) return '--:--';
  let h = date.getHours();
  let m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  m = m.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

async function renderPrayerTimes() {
  await getUserLocation();
  const times = calculatePrayerTimes();
  const config = MASLAK_METHODS[userMaslak];

  const namazList = [
    { key: 'fajr',    label: 'Fajr',    icon: '🌅' },
    { key: 'sunrise', label: 'Sunrise', icon: '☀️' },
    { key: 'dhuhr',   label: 'Dhuhr',   icon: '🌤️' },
    { key: 'asr',     label: 'Asr',     icon: '🌇' },
    { key: 'maghrib', label: 'Maghrib', icon: '🌆' },
    { key: 'isha',    label: 'Isha',    icon: '🌙' }
  ];

  let maslakButtons = Object.keys(MASLAK_METHODS).map(key => `
    <button class="maslak-btn ${key === userMaslak ? 'active' : ''}" onclick="setMaslak('${key}')">
      ${MASLAK_METHODS[key].name}
    </button>
  `).join('');

  const html = `
    <div class="card">
      <h3>📍 Location</h3>
      <p>Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)}</p>
      <button onclick="renderPrayerTimes()" style="margin-top:8px;padding:6px 12px;border:none;background:#0a5c36;color:white;border-radius:6px;cursor:pointer;">
        🔄 Refresh Location
      </button>
    </div>
    <div class="card">
      <h3>🕌 Maslak चुनें</h3>
      <div class="maslak-list">${maslakButtons}</div>
    </div>
    <div class="card">
      <h3>⏰ Namaz Times — ${config.name}</h3>
      ${namazList.map(n => `
        <div class="namaz-row">
          <span>${n.icon} ${n.label}</span>
          <strong>${times[n.key]}</strong>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('namaz').innerHTML = html;
}

function initPrayerTimes() {
  renderPrayerTimes();
}