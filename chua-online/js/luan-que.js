// ============================================
// VIẾNG CHÙA ONLINE - Luận Quẻ (Fortune Interpretation)
// ============================================

let allQue = [];

// Dữ liệu dự phòng nếu không load được file.txt
const STICKS_BACKUP = [
  { "id": 1, "ten": "Quẻ Thuần Càn (Càn Vi Thiên)", "hang": "thuong", "bai_tho": "Rồng bay chín dặm giữa tầng cao,\nVận thế hanh thông sáng tựa sao.\nQuân tử kiên tâm làm việc thiện,\nCông thành danh toại phước dâng trào.", "noi_dung": "Sức mạnh sáng tạo, hanh thông cực độ. Thời cơ đại cát.", "loi_khuyen": "Nên giữ tâm khiêm hạ, tránh tự cao tự đại để giữ vững thành quả.", "y_nghia": "Công danh sự nghiệp đang ở đỉnh cao, tài lộc dồi dào." },
  { "id": 2, "ten": "Quẻ Thuần Khôn (Khôn Vi Địa)", "hang": "thuong", "bai_tho": "Đất rộng bao dung chở vạn vật,\nNhu mì thuận thảo đức dày sâu.\nLòng thành kiên định đường công đức,\nVạn sự an bình chẳng lo âu.", "noi_dung": "Sự bao dung, thuận theo tự nhiên. Cát lợi nếu biết nhẫn nại.", "loi_khuyen": "Hãy bao dung và nhẫn nại, quý nhân sẽ xuất hiện giúp đỡ.", "y_nghia": "Mọi việc nên thuận theo lẽ tự nhiên, không nên cưỡng cầu." },
  { "id": 3, "ten": "Quẻ Thủy Lôi Truân", "hang": "ha", "bai_tho": "Mầm non mới nhú giữa sương mù,\nKhó khăn chồng chất tựa mây u.\nKiên tâm bền chí chờ thời vận,\nHết đoạn gian nan tới thái phù.", "noi_dung": "Gian nan bước đầu, vạn sự khởi đầu nan. Cần kiên nhẫn.", "loi_khuyen": "Nên cẩn trọng, tìm người tin cậy để tư vấn, không nên vội vã.", "y_nghia": "Đang gặp bế tắc, chưa phải lúc hành động mạnh mẽ." }
];

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load data
  try {
    const data = await Utils.loadData('data/que.txt');
    if (data && data.que && data.que.length > 0) {
      allQue = data.que;
    } else {
      allQue = STICKS_BACKUP;
    }
  } catch (e) {
    allQue = STICKS_BACKUP;
  }

  // 2. Render History
  renderHistory();

  // 3. Check if ID is in URL
  const urlParams = new URLSearchParams(window.location.search);
  const queId = urlParams.get('id');

  if (queId) {
    showQueDetail(parseInt(queId));
  }

  // 4. Initial grid render
  renderQueGrid(allQue);
});

function renderQueGrid(items) {
  const grid = document.getElementById('queGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = '<div class="col-12 text-center text-muted py-5">Không tìm thấy quẻ phù hợp</div>';
    return;
  }

  items.forEach(que => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg-3';
    col.innerHTML = `
      <div class="temple-card text-center p-3 h-100" style="cursor: pointer;" onclick="showQueDetail(${que.id})">
        <div class="que-badge ${que.hang} mb-2" style="font-size: 0.7rem;">Số ${que.id}</div>
        <h4 style="font-size: 1rem; color: var(--gold);">${que.ten}</h4>
        <small class="text-muted d-block mt-2">${que.hang === 'thuong' ? 'Đại Cát' : (que.hang === 'trung' ? 'Trung Bình' : 'Hạ Cát')}</small>
      </div>
    `;
    grid.appendChild(col);
  });
}

function showQueDetail(id) {
  const que = allQue.find(q => q.id === id);
  if (!que) {
    Utils.showToast("Không tìm thấy dữ liệu quẻ này!");
    return;
  }

  const modalEl = document.getElementById('queModal');
  const modalContent = document.getElementById('queModalContent');
  if (!modalEl || !modalContent) return;

  const queModal = bootstrap.Modal.getOrCreateInstance(modalEl);

  modalContent.innerHTML = `
      <div class="modal-header border-0 pb-0">
        <div class="que-badge ${que.hang} mb-0">Số ${que.id} - ${que.hang === 'thuong' ? 'Đại Cát' : (que.hang === 'trung' ? 'Trung Bình' : 'Hạ Cát')}</div>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body pt-2 text-center text-lg-start">
        <div class="result-card" style="background: transparent; border: none; box-shadow: none; padding: 0;">
          <h2 class="que-title mt-2 text-center">${que.ten}</h2>
          <div class="lotus-divider my-3">🪷</div>
          
          <div class="row">
            <div class="col-lg-5">
              <h4 style="color: var(--gold-light);">Linh Thiêng Thánh Ý:</h4>
              <div class="que-poem mb-4">
                ${que.bai_tho.replace(/\n/g, '<br>')}
              </div>
            </div>
            <div class="col-lg-7">
              <div class="mb-4">
                <h4 style="color: var(--gold-light);">Ý Nghĩa Quẻ Xăm:</h4>
                <p>${que.noi_dung}</p>
              </div>
              <div class="mb-4">
                <h4 style="color: var(--gold-light);">Lời Khuyên Của Chư Phật:</h4>
                <p>${que.loi_khuyen}</p>
              </div>
              <div>
                <h4 style="color: var(--gold-light);">Chi Tiết Vận Hạn:</h4>
                <p>${que.y_nghia}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer border-0 justify-content-center pt-0">
        <button class="btn btn-temple px-4" onclick="window.location.href='gieo-que.html'">🎋 Gieo Quẻ Lại</button>
      </div>
  `;

  queModal.show();

  // URL cleanup on manual modal close
  modalEl.addEventListener('hidden.bs.modal', function () {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
  }, { once: true });

  // Update URL for sharing/bookmarking
  const url = new URL(window.location);
  url.searchParams.set('id', id);
  window.history.pushState({}, '', url);
}

function closeDetail() {
  const modalEl = document.getElementById('queModal');
  if (modalEl) {
    const queModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    queModal.hide();
  }
}

function renderHistory() {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;

  const history = Utils.getData('queHistory', []);

  if (history.length === 0) {
    historyList.innerHTML = '<p class="text-muted small">Chưa có lịch sử gieo quẻ gần đây.</p>';
    return;
  }

  historyList.innerHTML = history.map(item => {
    // Check if time is available
    const timeStr = item.time ? Utils.formatDate(item.time) : '';
    const timeDisplay = timeStr.includes('lúc') ? timeStr.split('lúc')[1] : timeStr;

    return `
      <div class="history-item d-flex justify-content-between align-items-center mb-2 p-2" 
           style="background: rgba(0,0,0,0.2); border-radius: 5px; cursor: pointer;"
           onclick="showQueDetail(${item.id})">
        <div>
          <span class="que-badge ${item.hang}" style="font-size: 0.6rem; padding: 2px 5px;">Số ${item.id}</span>
          <span class="ms-1 small" style="color: var(--gold-light);">${item.ten}</span>
        </div>
        <small class="text-muted" style="font-size: 0.7rem;">${timeDisplay}</small>
      </div>
    `;
  }).join('');
}

function clearHistory() {
  if (confirm('Bạn có chắc chắn muốn xóa lịch sử gieo quẻ?')) {
    Utils.saveData('queHistory', []);
    renderHistory();
  }
}

function filterQue() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const hang = document.getElementById('hangFilter').value;

  const filtered = allQue.filter(que => {
    const matchQuery = que.ten.toLowerCase().includes(query) || que.id.toString() === query;
    const matchHang = hang === 'all' || que.hang === hang;
    return matchQuery && matchHang;
  });

  renderQueGrid(filtered);
}
