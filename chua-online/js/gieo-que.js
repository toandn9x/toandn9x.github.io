// ============================================
// VIẾNG CHÙA ONLINE - Gieo Quẻ (Fortune Drawing)
// ============================================

let sticksData = [];
let isShaking = false;
let resultModal;

// Dữ liệu dự phòng nếu không load được file.txt (3 quẻ đầu)
const STICKS_BACKUP = [
  {"id":1,"ten":"Quẻ Thuần Càn (Càn Vi Thiên)","hang":"thuong","bai_tho":"Rồng bay chín dặm giữa tầng cao,\nVận thế hanh thông sáng tựa sao.\nQuân tử kiên tâm làm việc thiện,\nCông thành danh toại phước dâng trào.","noi_dung":"Sức mạnh sáng tạo, hanh thông cực độ. Thời cơ đại cát.","loi_khuyen":"Nên giữ tâm khiêm hạ, tránh tự cao tự đại để giữ vững thành quả.","y_nghia":"Công danh sự nghiệp đang ở đỉnh cao, tài lộc dồi dào."},
  {"id":2,"ten":"Quẻ Thuần Khôn (Khôn Vi Địa)","hang":"thuong","bai_tho":"Đất rộng bao dung chở vạn vật,\nNhu mì thuận thảo đức dày sâu.\nLòng thành kiên định đường công đức,\nVạn sự an bình chẳng lo âu.","noi_dung":"Sự bao dung, thuận theo tự nhiên. Cát lợi nếu biết nhẫn nại.","loi_khuyen":"Hãy bao dung và nhẫn nại, quý nhân sẽ xuất hiện giúp đỡ.","y_nghia":"Mọi việc nên thuận theo lẽ tự nhiên, không nên cưỡng cầu."},
  {"id":3,"ten":"Quẻ Thủy Lôi Truân","hang":"ha","bai_tho":"Mầm non mới nhú giữa sương mù,\nKhó khăn chồng chất tựa mây u.\nKiên tâm bền chí chờ thời vận,\nHết đoạn gian nan tới thái phù.","noi_dung":"Gian nan bước đầu, vạn sự khởi đầu nan. Cần kiên nhẫn.","loi_khuyen":"Nên cẩn trọng, tìm người tin cậy để tư vấn, không nên vội vã.","y_nghia":"Đang gặp bế tắc, chưa phải lúc hành động mạnh mẽ."}
];

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Modal safely
  const modalEl = document.getElementById('resultModal');
  if (modalEl) {
    resultModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    
    // Listen for modal close to reset state (works with ESC key too)
    modalEl.addEventListener('hidden.bs.modal', resetPage);
  }

  // 1. Fill tube immediately so it is not empty
  const container = document.getElementById('sticksContainer');
  if (container) {
    for (let i = 0; i < 15; i++) {
      const stick = document.createElement('div');
      stick.className = 'fortune-stick';
      stick.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg) translateY(${Math.random() * 5}px)`;
      container.appendChild(stick);
    }
  }

  // 2. Load que data
  try {
    const data = await Utils.loadData('data/que.txt');
    if (data && data.que && data.que.length > 0) {
      sticksData = data.que;
    } else {
      sticksData = STICKS_BACKUP; // Fallback
    }
  } catch (e) {
    sticksData = STICKS_BACKUP;
  }
});

// Reset state when navigating back (BFcache)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    resetPage();
  }
});

async function shakeTube() {
  if (isShaking) return;

  // Đảm bảo dữ liệu đã sẵn sàng
  if (sticksData.length === 0) {
    const data = await Utils.loadData('data/que.txt');
    if (data && data.que) {
      sticksData = data.que;
    } else {
      sticksData = STICKS_BACKUP;
    }
  }

  isShaking = true;
  const tube = document.getElementById('fortuneTube');
  const btn = document.getElementById('btnShake');
  const instruction = document.getElementById('instructionText');

  if (btn) btn.disabled = true;
  if (instruction) instruction.textContent = "Thành tâm cầu nguyện...";

  // Play shake sound multiple times
  if (typeof audioManager !== 'undefined') {
    audioManager.playShake();
    setTimeout(() => audioManager.playShake(), 200);
    setTimeout(() => audioManager.playShake(), 400);
  }

  // Add shaking class
  if (tube) tube.classList.add('shaking');

  // After 1.5s of shaking, "drop" a stick
  setTimeout(() => {
    if (tube) tube.classList.remove('shaking');
    dropStick();
  }, 1500);
}

function dropStick() {
  const stick = document.getElementById('fallingStick');
  if (!stick) {
    showResult();
    return;
  }
  
  // Position falling stick
  stick.style.display = 'block';
  stick.style.left = '50%';
  stick.style.top = '100px';
  stick.classList.add('stick-falling');

  // Play dropping sound
  if (typeof audioManager !== 'undefined') {
    setTimeout(() => audioManager.playWoodenFish(), 300);
  }

  // Show result after animation
  setTimeout(() => {
    showResult();
  }, 800);
}

function showResult() {
  if (sticksData.length === 0) {
    Utils.showToast("Không tìm thấy dữ liệu quẻ xăm!");
    resetPage();
    return;
  }

  const randomIndex = Math.floor(Math.random() * sticksData.length);
  const que = sticksData[randomIndex];

  const resultBody = document.getElementById('resultBody');
  const detailLink = document.getElementById('detailLink');

  if (resultBody) {
    resultBody.innerHTML = `
      <div class="result-card fade-in">
        <div class="que-badge ${que.hang}">${que.hang === 'thuong' ? 'Đại Cát' : (que.hang === 'trung' ? 'Trung Bình' : 'Hạ Cát')}</div>
        <h2 class="que-title mt-3">${que.ten}</h2>
        <div class="lotus-divider">🪷</div>
        <div class="que-poem">
          ${que.bai_tho.replace(/\n/g, '<br>')}
        </div>
        <p class="text-secondary mt-3">${que.noi_dung}</p>
      </div>
    `;
  }

  if (detailLink) {
    detailLink.href = `luan-que.html?id=${que.id}`;
  }

  // Save to history
  let history = Utils.getData('queHistory', []);
  history.unshift({
    id: que.id,
    ten: que.ten,
    hang: que.hang,
    time: Utils.now()
  });
  Utils.saveData('queHistory', history.slice(0, 10)); // Keep last 10

  if (resultModal) {
    resultModal.show();
  }
  
  if (typeof audioManager !== 'undefined') {
    audioManager.playBell();
  }

  // Particles for good luck
  Utils.createParticles(window.innerWidth / 2, window.innerHeight / 2, '🏮', 12);
}

function resetPage() {
  isShaking = false;
  const stick = document.getElementById('fallingStick');
  const btn = document.getElementById('btnShake');
  const instruction = document.getElementById('instructionText');

  if (stick) {
    stick.style.display = 'none';
    stick.classList.remove('stick-falling');
  }
  if (btn) btn.disabled = false;
  if (instruction) instruction.textContent = "Chạm vào ống xăm để tiếp tục gieo";
}

