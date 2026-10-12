let tasbeehCount=parseInt(localStorage.getItem('tasbeehCount')||'0');
let tasbeehTarget=parseInt(localStorage.getItem('tasbeehTarget')||'33');
let tasbeehTotal=parseInt(localStorage.getItem('tasbeehTotal')||'0');
function incrementTasbeeh(){
tasbeehCount++;tasbeehTotal++;
localStorage.setItem('tasbeehCount',tasbeehCount);
localStorage.setItem('tasbeehTotal',tasbeehTotal);
if(navigator.vibrate)navigator.vibrate(30);
updateTasbeehDisplay();
}
function resetTasbeeh(){
if(!confirm('Reset current count?'))return;
tasbeehCount=0;localStorage.setItem('tasbeehCount',0);
updateTasbeehDisplay();
}
function setTasbeehTarget(n){
tasbeehTarget=n;tasbeehCount=0;
localStorage.setItem('tasbeehTarget',n);
localStorage.setItem('tasbeehCount',0);
renderTasbeeh();
}
function updateTasbeehDisplay(){
const c=document.getElementById('tasbeeh-count');
const t=document.getElementById('tasbeeh-total');
const g=document.getElementById('tasbeeh-target');
if(c)c.textContent=tasbeehCount;
if(t)t.textContent=tasbeehTotal;
if(g)g.textContent=tasbeehTarget;
}
function renderTasbeeh(){
const html=`
<div class="card">
<div class="card-title"><span class="card-title-icon">📿</span> Tasbeeh Counter</div>
<div class="tasbeeh-container">
<button class="tasbeeh-circle" onclick="incrementTasbeeh()">
<div class="tasbeeh-count" id="tasbeeh-count">${tasbeehCount}</div>
<div class="tasbeeh-label">Tap to Count</div>
</button>
<div class="tasbeeh-controls">
<button class="tasbeeh-btn" onclick="resetTasbeeh()">🔄 Reset</button>
</div>
<div class="tasbeeh-presets">
<button class="preset-chip" onclick="setTasbeehTarget(33)">33</button>
<button class="preset-chip" onclick="setTasbeehTarget(66)">66</button>
<button class="preset-chip" onclick="setTasbeehTarget(99)">99</button>
<button class="preset-chip" onclick="setTasbeehTarget(100)">100</button>
</div>
</div>
</div>
<div class="card">
<div class="card-title"><span class="card-title-icon">📊</span> Stats</div>
<div class="namaz-row"><span>Total Count</span><strong class="namaz-time" id="tasbeeh-total">${tasbeehTotal}</strong></div>
<div class="namaz-row"><span>Current Target</span><strong class="namaz-time" id="tasbeeh-target">${tasbeehTarget}</strong></div>
</div>
`;
document.getElementById('tasbeeh').innerHTML=html;
}
function initTasbeeh(){renderTasbeeh();}
