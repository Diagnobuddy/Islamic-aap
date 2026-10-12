// ============ QURAN MODULE ============

let quranData = {
  arabic: null,
  english: null,
  hindi: null,
  urdu: null
};

let currentSurah = 1;
let currentTranslation = 'hindi';

// Surah names (114)
const SURAH_NAMES = [
  "Al-Fatihah","Al-Baqarah","Aal-Imran","An-Nisa","Al-Maidah","Al-Anam",
  "Al-Araf","Al-Anfal","At-Taubah","Yunus","Hud","Yusuf","Ar-Rad","Ibrahim",
  "Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha","Al-Anbiya",
  "Al-Hajj","Al-Muminun","An-Nur","Al-Furqan","Ash-Shuara","An-Naml",
  "Al-Qasas","Al-Ankabut","Ar-Rum","Luqman","As-Sajdah","Al-Ahzab","Saba",
  "Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir","Fussilat",
  "Ash-Shura","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad",
  "Al-Fath","Al-Hujurat","Qaf","Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar",
  "Ar-Rahman","Al-Waqiah","Al-Hadid","Al-Mujadilah","Al-Hashr","Al-Mumtahanah",
  "As-Saff","Al-Jumuah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim",
  "Al-Mulk","Al-Qalam","Al-Haqqah","Al-Maarij","Nuh","Al-Jinn","Al-Muzzammil",
  "Al-Muddaththir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba","An-Naziat",
  "Abasa","At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj",
  "At-Tariq","Al-Ala","Al-Ghashiyah","Al-Fajr","Al-Balad","Ash-Shams",
  "Al-Lail","Ad-Duha","Ash-Sharh","At-Tin","Al-Alaq","Al-Qadr","Al-Bayyinah",
  "Az-Zalzalah","Al-Adiyat","Al-Qariah","At-Takathur","Al-Asr","Al-Humazah",
  "Al-Fil","Quraish","Al-Maun","Al-Kauthar","Al-Kafirun","An-Nasr",
  "Al-Lahab","Al-Ikhlas","Al-Falaq","An-Nas"
];

// Load all Quran translations
async function loadQuranData() {
  try {
    if (!quranData.arabic) {
      const [arabic, english, hindi, urdu] = await Promise.all([
        fetch('data/quran/quran-arabic.json').then(r => r.json()),
        fetch('data/quran/quran-english.json').then(r => r.json()),
        fetch('data/quran/quran-hindi.json').then(r => r.json()),
        fetch('data/quran/quran-urdu.json').then(r => r.json())
      ]);
      quranData = { arabic, english, hindi, urdu };
    }
    return quranData;
  } catch (e) {
    console.error('Quran load error:', e);
    return null;
  }
}

// Get ayahs for a surah
function getSurahAyahs(surahNum) {
  if (!quranData.arabic) return [];
  
  const result = [];
  const arabicData = quranData.arabic.quran || quranData.arabic;
  const englishData = quranData.english.quran || quranData.english;
  const hindiData = quranData.hindi.quran || quranData.hindi;
  const urduData = quranData.urdu.quran || quranData.urdu;
  
  for (let i = 0; i < arabicData.length; i++) {
    const a = arabicData[i];
    if (a.chapter === surahNum) {
      result.push({
        chapter: a.chapter,
        verse: a.verse,
        arabic: a.text,
        english: englishData[i]?.text || '',
        hindi: hindiData[i]?.text || '',
        urdu: urduData[i]?.text || ''
      });
    }
  }
  return result;
}

// Render Quran module
async function renderQuran() {
  document.getElementById('quran').innerHTML = `
    <div class="card">
      <div class="loading"><div class="spinner"></div><p>Loading Quran...</p></div>
    </div>
  `;

  const data = await loadQuranData();
  if (!data) {
    document.getElementById('quran').innerHTML = `
      <div class="card">
        <div class="loading">Failed to load Quran. Please refresh.</div>
      </div>
    `;
    return;
  }

  const surahOptions = SURAH_NAMES.map((name, i) => 
    `<option value="${i+1}">${i+1}. ${name}</option>`
  ).join('');

  document.getElementById('quran').innerHTML = `
    <div class="card">
      <h3 class="card-title"><span>📖</span> Quran</h3>
      <select id="surah-select" onchange="changeSurah(this.value)" style="width:100%;padding:10px;margin-bottom:10px;border-radius:8px;border:1px solid var(--border);font-family:inherit;font-size:1rem;">
        ${surahOptions}
      </select>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
        <button class="maslak-btn ${currentTranslation==='hindi'?'active':''}" onclick="setTranslation('hindi')">हिंदी</button>
        <button class="maslak-btn ${currentTranslation==='english'?'active':''}" onclick="setTranslation('english')">English</button>
        <button class="maslak-btn ${currentTranslation==='urdu'?'active':''}" onclick="setTranslation('urdu')">اردو</button>
      </div>
    </div>
    <div id="ayahs-container"></div>
  `;

  document.getElementById('surah-select').value = currentSurah;
  displaySurah(currentSurah);
}

function setTranslation(lang) {
  currentTranslation = lang;
  renderQuran();
}

function changeSurah(num) {
  currentSurah = parseInt(num);
  displaySurah(currentSurah);
}

function displaySurah(num) {
  const ayahs = getSurahAyahs(num);
  const container = document.getElementById('ayahs-container');
  
  if (ayahs.length === 0) {
    container.innerHTML = `<div class="card"><div class="loading">No ayahs found</div></div>`;
    return;
  }

  const surahName = SURAH_NAMES[num-1];
  const bismillah = num !== 9 && num !== 1 ? `
    <div style="text-align:center;padding:16px;font-family:'Amiri',serif;font-size:1.5rem;color:var(--primary);margin-bottom:12px;">
      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    </div>
  ` : '';

  container.innerHTML = `
    <div class="card">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:1.2rem;font-weight:600;color:var(--primary);">Surah ${num}: ${surahName}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);">${ayahs.length} ayahs</div>
      </div>
      ${bismillah}
      ${ayahs.map(a => `
        <div style="padding:14px 0;border-bottom:1px solid var(--border);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="background:var(--primary);color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:600;">${a.verse}</span>
          </div>
          <div style="font-family:'Amiri',serif;font-size:1.3rem;text-align:right;direction:rtl;line-height:2;margin-bottom:10px;color:var(--text);">
            ${a.arabic}
          </div>
          <div style="font-size:0.95rem;color:var(--text);line-height:1.7;direction:${currentTranslation==='urdu'?'rtl':'ltr'};">
            ${a[currentTranslation] || ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function initQuran() {
  renderQuran();
}