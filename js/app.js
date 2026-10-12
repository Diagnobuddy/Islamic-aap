function showTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
  document.getElementById(tabName).classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initPrayerTimes === 'function') initPrayerTimes();
  if (typeof initQuran === 'function') initQuran();
  if (typeof initHadith === 'function') initHadith();
  if (typeof initTasbeeh === 'function') initTasbeeh();
  if (typeof initQaza === 'function') initQaza();
});