// ============ HADITH MODULE ============

const HADITH_BOOKS = [
  { id: 'bukhari',  name: 'Sahih Bukhari',  file: 'bukhari.json',  icon: '📗' },
  { id: 'muslim',   name: 'Sahih Muslim',   file: 'muslim.json',   icon: '📘' },
  { id: 'abudawud', name: 'Sunan Abu Dawood', file: 'abudawud.json', icon: '📙' },
  { id: 'tirmidhi', name: 'Jami at-Tirmidhi', file: 'tirmidhi.json', icon: '📕' },
  { id: 'nasai',    name: 'Sunan an-Nasai', file: 'nasai.json',    icon: '📓' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', file: 'ibnmajah.json', icon: '📔' }
];

let hadithCache = {};

async function loadHadithBook(bookId) {
  if (hadithCache[bookId]) return hadithCache[bookId];
  
  const book = HADITH_BOOKS.find(b => b.id === bookId);
  if (!book) return null;
  
  try {
    const data = await fetch(`data/hadith/${book.file}`).then(r => r.json());
    hadithCache[bookId] = data;
    return data;
  } catch (e) {
    console.error('Hadith load error:', e);
    return null;
  }
}

// Get hadith of the day
function getHadithOfTheDay(hadiths) {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const index = dayOfYear % hadiths.length;
  return hadiths[index];
}

async function renderHadith() {
  document.getElementById('hadith').innerHTML = `
    <div class="card">
      <div class="loading"><div class="spinner"></div><p>Loading Hadith...</p></div>
    </div>
  `;

  // Load Bukhari for "Hadith of the Day"
  const bukhari = await loadHadithBook('bukhari');
  
  if (!bukhari) {
    document.getElementById('hadith').innerHTML = `
      <div class="card"><div class="loading">Failed to load Hadith. Refresh please.</div></div>
    `;
    return;
  }

  const hadiths = bukhari.hadiths || bukhari;
  const daily = getHadithOfTheDay(hadiths);

  document.getElementById('hadith').innerHTML = `
    <div class="card">
      <h3 class="card-title"><span>📜</span> Hadith of the Day</h3>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:10px;">
        Sahih Bukhari • Hadith #${daily.hadithnumber || daily.id}
      </div>
      <div style="font-family:'Amiri',serif;font-size:1.15rem;text-align:right;direction:rtl;line-height:2;margin-bottom:12px;">
        ${daily.arabic || ''}
      </div>
      <div style="font-size:0.95rem;line-height:1.7;color:var(--text);">
        ${daily.text || daily.english || ''}
      </div>
    </div>

    <div class="card">
      <h3 class="card-title"><span>📚</span> All Hadith Books</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        ${HADITH_BOOKS.map(b => `
          <button onclick="openBook('${b.id}')" style="padding:14px;border:1px solid var(--border);background:var(--card);border-radius:10px;cursor:pointer;font-family:inherit;text-align:left;transition:all 0.2s;">
            <div style="font-size:1.5rem;">${b.icon}</div>
            <div style="font-weight:600;color:var(--text);margin-top:6px;font-size:0.9rem;">${b.name}</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

async function openBook(bookId) {
  const book = HADITH_BOOKS.find(b => b.id === bookId);
  
  document.getElementById('hadith').innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <button onclick="renderHadith()" style="padding:6px 12px;border:none;background:var(--primary);color:white;border-radius:8px;cursor:pointer;font-family:inherit;">← Back</button>
        <div style="font-weight:600;">${book.icon} ${book.name}</div>
      </div>
      <div class="loading"><div class="spinner"></div><p>Loading ${book.name}...</p></div>
    </div>
  `;
  
  const data = await loadHadithBook(bookId);
  if (!data) {
    document.getElementById('hadith').innerHTML += `
      <div class="card"><div class="loading">Failed to load</div></div>
    `;
    return;
  }
  
  const hadiths = (data.hadiths || data).slice(0, 30); // First 30
  
  document.getElementById('hadith').innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <button onclick="renderHadith()" style="padding:6px 12px;border:none;background:var(--primary);color:white;border-radius:8px;cursor:pointer;font-family:inherit;">← Back</button>
        <div style="font-weight:600;font-size:0.9rem;">${book.name}</div>
      </div>
      <div style="font-size:0.75rem;color:var(--text-muted);">Showing first 30 hadiths</div>
    </div>
    ${hadiths.map(h => `
      <div class="card">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;">Hadith #${h.hadithnumber || h.id}</div>
        <div style="font-size:0.9rem;line-height:1.7;">${h.text || h.english || ''}</div>
      </div>
    `).join('')}
  `;
}

function initHadith() {
  renderHadith();
}