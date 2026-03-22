// ============================================
// VIẾNG CHÙA ONLINE - Sảnh Chính (Main Hall)
// ============================================

// State management
const sanhState = {
  candleLit: false,
  incenseBurning: false,
  chantingPlaying: false,
  sutraOpen: false,
  bowCount: Utils.getData('bowCount', 0),
  fishCount: Utils.getData('fishCount', 0)
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Load config for altar image
  const config = await Utils.loadData('data/config.txt');
  if (config && config.settings && config.settings.altarImageUrl) {
    const altarImg = document.querySelector('#altarImage img');
    if (altarImg) altarImg.src = config.settings.altarImageUrl;
  }

  // Restore state from localStorage
  if (Utils.getData('candleLit', false)) toggleCandle();
  if (Utils.getData('incenseBurning', false)) toggleIncense();
});

// ---- CANDLE ----
function toggleCandle() {
  sanhState.candleLit = !sanhState.candleLit;

  const leftFlame = document.getElementById('leftFlame');
  const rightFlame = document.getElementById('rightFlame');
  const leftGlow = document.getElementById('leftGlow');
  const rightGlow = document.getElementById('rightGlow');
  const btn = document.getElementById('btnCandle');

  if (sanhState.candleLit) {
    leftFlame.classList.add('lit');
    rightFlame.classList.add('lit');
    leftGlow.classList.add('lit');
    rightGlow.classList.add('lit');
    btn.classList.add('active');
    updateStatus('🕯️ Nến đã được thắp sáng');
    Utils.showToast('🕯️ Thắp nến thành công! Ánh sáng trí tuệ tỏa sáng.');

    // Particle effect
    const rect = btn.getBoundingClientRect();
    Utils.createParticles(rect.left + rect.width / 2, rect.top, '✨', 6);
  } else {
    leftFlame.classList.remove('lit');
    rightFlame.classList.remove('lit');
    leftGlow.classList.remove('lit');
    rightGlow.classList.remove('lit');
    btn.classList.remove('active');
    updateStatus('Nến đã tắt');
  }

  Utils.saveData('candleLit', sanhState.candleLit);
}

// ---- INCENSE ----
function toggleIncense() {
  sanhState.incenseBurning = !sanhState.incenseBurning;

  const btn = document.getElementById('btnIncense');

  for (let i = 1; i <= 3; i++) {
    const tip = document.getElementById(`tip${i}`);
    const smokeA = document.getElementById(`smoke${i}a`);
    const smokeB = document.getElementById(`smoke${i}b`);
    const smokeC = document.getElementById(`smoke${i}c`);

    if (sanhState.incenseBurning) {
      tip.classList.add('burning');
      smokeA.classList.add('rising');
      smokeB.classList.add('rising');
      smokeC.classList.add('rising');
    } else {
      tip.classList.remove('burning');
      smokeA.classList.remove('rising');
      smokeB.classList.remove('rising');
      smokeC.classList.remove('rising');
    }
  }

  if (sanhState.incenseBurning) {
    btn.classList.add('active');
    updateStatus('🪔 Hương đã được dâng lên');
    Utils.showToast('🪔 Dâng hương thành công! Mùi trầm hương lan tỏa.');

    const rect = btn.getBoundingClientRect();
    Utils.createParticles(rect.left + rect.width / 2, rect.top, '🌸', 6);
  } else {
    btn.classList.remove('active');
    updateStatus('Hương đã tắt');
  }

  Utils.saveData('incenseBurning', sanhState.incenseBurning);
}

// ---- BOW ----
function doBow() {
  sanhState.bowCount++;
  Utils.saveData('bowCount', sanhState.bowCount);

  const altar = document.getElementById('altarImage');
  const hands = document.getElementById('prayingHands');

  // Hands animation
  hands.classList.remove('active');
  void hands.offsetWidth;
  hands.classList.add('active');

  setTimeout(() => {
    hands.classList.remove('active');
  }, 1500);

  // Play bell sound every 3 bows
  if (sanhState.bowCount % 3 === 0) {
    audioManager.playBell();
    Utils.showToast(`🙏 Đã lạy ${sanhState.bowCount} lạy. Chuông ngân vang!`);
  } else {
    updateStatus(`🙏 Lạy lần thứ ${sanhState.bowCount}`);
  }
}

// ---- CHANTING & SUTRA ----
function toggleChanting() {
  sanhState.chantingPlaying = !sanhState.chantingPlaying;
  sanhState.sutraOpen = sanhState.chantingPlaying; // Sync sutra window with audio

  const btn = document.getElementById('btnChanting');
  const sutraSection = document.getElementById('sutraSection');

  if (sanhState.chantingPlaying) {
    audioManager.startChanting();
    btn.classList.add('active');
    btn.querySelector('.action-icon').textContent = '📖';
    sutraSection.style.display = 'block';
    updateStatus('🔊 Đang niệm Phật & Tụng kinh... Nam Mô A Di Đà Phật');
    Utils.showToast('🔊 Bắt đầu niệm Phật và mở kinh văn.');
  } else {
    audioManager.stopChanting();
    btn.classList.remove('active');
    btn.querySelector('.action-icon').textContent = '📿';
    sutraSection.style.display = 'none';
    updateStatus('Đã tắt niệm Phật & Tụng kinh');
  }
}

// ---- WOODEN FISH ----
function hitWoodenFish() {
  sanhState.fishCount++;
  Utils.saveData('fishCount', sanhState.fishCount);

  const icon = document.getElementById('fishIcon');

  // Hit animation
  icon.classList.remove('wooden-fish-hit');
  void icon.offsetWidth;
  icon.classList.add('wooden-fish-hit');

  // Play sound
  audioManager.playWoodenFish();

  if (sanhState.fishCount % 10 === 0) {
    Utils.showToast(`🔔 Đã gõ mõ ${sanhState.fishCount} lần. Tâm an tĩnh.`);
  }
}

// ---- STATUS ----
function updateStatus(text) {
  document.getElementById('statusText').textContent = text;
}
