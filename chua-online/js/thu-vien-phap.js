// ============================================
// VIẾNG CHÙA ONLINE - Thư Viện Pháp (Dharma Library)
// ============================================

let dharmaData = null;
let currentCategory = 'kinh';

document.addEventListener('DOMContentLoaded', async () => {
  dharmaData = await Utils.loadData('data/kinh-phat.txt');
  renderCategory('kinh');
});

function switchCategory(cat) {
  currentCategory = cat;

  // Update sidebar UI
  document.querySelectorAll('.list-group-item').forEach(btn => btn.classList.remove('active'));
  if (cat === 'kinh') document.getElementById('btnKinh').classList.add('active');
  else if (cat === 'bai_hoc') document.getElementById('btnBaiHoc').classList.add('active');

  renderCategory(cat);
}

function renderCategory(cat) {
  const container = document.getElementById('libraryContent');
  container.className = 'fade-in';

  if (!dharmaData) {
    container.innerHTML = '<p class="text-center py-5">Đang tải dữ liệu...</p>';
    return;
  }

  const items = dharmaData[cat];
  if (!items) {
    container.innerHTML = '<p class="text-center py-5">Không có dữ liệu trong mục này.</p>';
    return;
  }

  container.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'temple-card mb-4';
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0" style="color: var(--gold-light);">${item.ten}</h3>
        <span class="que-badge ${item.loi === 'chu' ? 'trung' : 'thuong'}">${item.loi === 'chu' ? 'Thần Chú' : 'Kinh Tụng'}</span>
      </div>
      <p class="text-muted italic small mb-3">${item.mo_ta || ''}</p>
      <div class="chanting-scroll p-4" style="background: rgba(0,0,0,0.2); line-height: 2.2; font-size: 1.15rem;">
        ${item.noi_dung.replace(/\n/g, '<br>')}
      </div>
      <div class="mt-3 text-end">
        <button class="btn-temple-outline btn-sm" onclick="copyContent(this, \`${item.ten}\`)">📋 Sao chép bài ${item.loi === 'chu' ? 'pháp' : 'kinh'}</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function loadLunarCalendar() {
  document.querySelectorAll('.list-group-item').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btnLich').classList.add('active');

  const container = document.getElementById('libraryContent');
  container.innerHTML = `
    <div class="temple-card fade-in">
      <h3 class="text-center mb-4">📅 Lịch Phật Giáo - Năm Bính Ngọ 2026</h3>
      <div class="table-responsive">
        <table class="table table-dark table-borderless align-middle" style="background: transparent;">
          <thead>
            <tr class="border-bottom border-secondary text-gold">
              <th>Ngày (Lịch Trăng)</th>
              <th>Sự Kiện Phật Giáo</th>
              <th>Ý Nghĩa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1/1 (Âm lịch)</td>
              <td><strong>Vía Đức Di Lặc</strong></td>
              <td>Ngày Tết Nguyên Đán, cầu nguyện hạnh phúc và hỷ lạc.</td>
            </tr>
            <tr>
              <td>15/1</td>
              <td><strong>Rằm Tháng Giêng</strong></td>
              <td>Lễ Thượng Nguyên, cầu an buổi đầu năm.</td>
            </tr>
             <tr>
              <td>15/2</td>
              <td><strong>Ngày Phật Nhập Niết Bàn</strong></td>
              <td>Tưởng niệm ngày đức Thế Tôn lìa bỏ thân tứ đại.</td>
            </tr>
             <tr>
              <td>19/2</td>
              <td><strong>Vía Bồ Tát Quán Thế Âm</strong></td>
              <td>Ngày kỷ niệm đản sanh đức Quan Thế Âm.</td>
            </tr>
            <tr>
              <td>15/4</td>
              <td><strong>Đại Lễ Phật Đản</strong></td>
              <td>Vesak - Kỷ niệm đức Phật đản sanh, thành đạo, niết bàn.</td>
            </tr>
            <tr>
              <td>15/7</td>
              <td><strong>Đại Lễ Vu Lan</strong></td>
              <td>Mùa báo hiếu, cầu siêu cho cha mẹ, tổ tiên.</td>
            </tr>
            <tr>
              <td>15/8</td>
              <td><strong>Rằm Tháng Tám</strong></td>
              <td>Tết Trung Thu, lễ tạ ơn vạn vật.</td>
            </tr>
             <tr>
              <td>8/12</td>
              <td><strong>Ngày Phật Thành Đạo</strong></td>
              <td>Kỷ niệm ngày đức Phật đắc đạo dưới gốc cây Bồ Đề.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 p-3 rounded" style="background: rgba(212, 175, 55, 0.05);">
        <p class="mb-0 text-center text-muted small">Quý Phật tử nên giữ chay tịnh vào các ngày rằm (15) và mùng 1 hàng tháng.</p>
      </div>
    </div>
  `;
}

function copyContent(btn, title) {
  const content = btn.parentElement.previousElementSibling.innerText;
  navigator.clipboard.writeText(content).then(() => {
    btn.textContent = '✅ Đã sao chép';
    Utils.showToast(`Đã sao chép nội dung ${title}`);
    setTimeout(() => {
      btn.textContent = '📋 Sao chép bài kinh';
    }, 2000);
  });
}
