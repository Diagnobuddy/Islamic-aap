const PRAYERS=['fajr','dhuhr','asr','maghrib','isha','witr'];
const PRAYER_NAMES={fajr:'Fajr',dhuhr:'Dhuhr',asr:'Asr',maghrib:'Maghrib',isha:'Isha',witr:'Witr'};
const PRAYER_ICONS={fajr:'🌅',dhuhr:'🌤️',asr:'🌇',maghrib:'🌆',isha:'🌙',witr:'⭐'};
function getQazaData(){const s=localStorage.getItem('qazaData');return s?JSON.parse(s):null;}
function saveQazaData(d){localStorage.setItem('qazaData',JSON.stringify(d));}
function calculateQaza(){
const age=parseInt(document.getElementById('qaza-age').value)||0;
const balighAge=parseInt(document.getElementById('qaza-baligh').value)||12;
const yearsRegular=parseInt(document.getElementById('qaza-regular').value)||0;
if(age<=0){alert('Please enter valid age');return;}
if(age<=balighAge){alert('Age should be greater than Baligh age');return;}
const totalYears=Math.max(0,age-balighAge-yearsRegular);
const totalDays=totalYears*365;
const data={age,balighAge,yearsRegular,totalYears,totalDays,prayers:{}};
PRAYERS.forEach(p=>{data.prayers[p]=totalDays;});
saveQazaData(data);renderQaza();
}
function tickQaza(p){
const data=getQazaData();if(!data)return;
if(data.prayers[p]>0){data.prayers[p]--;saveQazaData(data);
if(navigator.vibrate)navigator.vibrate(30);renderQaza();}
}
function resetQaza(){
if(!confirm('Reset all Qaza data?'))return;
localStorage.removeItem('qazaData');renderQaza();
}
function renderQaza(){
const data=getQazaData();
if(!data){
const html=`
<div class="card">
<div class="card-title"><span class="card-title-icon">🧮</span> Qaza Calculator</div>
<p style="font-size:.85rem;color:var(--text-muted);margin-bottom:16px;">Enter your details to calculate pending Qaza namaz.</p>
<div class="input-group"><label class="input-label">Current Age (years)</label><input type="number" class="input-field" id="qaza-age" placeholder="e.g. 25" min="1"></div>
<div class="input-group"><label class="input-label">Age at which you became Baligh</label><input type="number" class="input-field" id="qaza-baligh" placeholder="e.g. 12" value="12" min="1"></div>
<div class="input-group"><label class="input-label">Years you prayed regularly</label><input type="number" class="input-field" id="qaza-regular" placeholder="e.g. 5" value="0" min="0"></div>
<button class="primary-btn" onclick="calculateQaza()">Calculate Qaza</button>
</div>
`;
document.getElementById('qaza').innerHTML=html;return;
}
const rows=PRAYERS.map(p=>`
<div class="qaza-item">
<div class="qaza-info"><span style="font-size:1.4rem;">${PRAYER_ICONS[p]}</span><div><div class="namaz-name">${PRAYER_NAMES[p]}</div></div></div>
<div style="display:flex;align-items:center;gap:14px;">
<span class="qaza-count">${data.prayers[p]}</span>
<button class="qaza-tick-btn" onclick="tickQaza('${p}')" ${data.prayers[p]<=0?'disabled':''}>✓</button>
</div>
</div>
`).join('');
const html=`
<div class="card">
<div class="card-title"><span class="card-title-icon">📊</span> Summary</div>
<p style="font-size:.85rem;color:var(--text-muted);">Total years: <strong>${data.totalYears}</strong> • Total days: <strong>${data.totalDays}</strong></p>
</div>
<div class="card">
<div class="card-title"><span class="card-title-icon">🕌</span> Pending Qaza Namaz</div>
${rows}
</div>
<div class="card">
<button class="primary-btn" onclick="resetQaza()" style="background:#DC2626;">Reset All</button>
</div>
`;
document.getElementById('qaza').innerHTML=html;
}
function initQaza(){renderQaza();}
