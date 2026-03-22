// ============================================
// VIẾNG CHÙA ONLINE - Hòm Công Đức (Donation Box)
// ============================================

let donations = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Load sample data
  const data = await Utils.loadData('data/donations.txt');
  let baseDonations = (data && data.donations) ? data.donations : [];

  // Load custom from local
  let customDonations = Utils.getData('myDonations', []);

  donations = [...baseDonations, ...customDonations];

  // Sort by date (newest first)
  donations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  renderDonationList();
});

function renderDonationList() {
  const list = document.getElementById('donorList');
  const totalStats = document.getElementById('totalStats');
  list.innerHTML = '';

  let total = 0;
  donations.forEach((d, index) => {
    total += parseInt(d.amount);

    // Show only top 50 in list to keep performant
    if (index < 50) {
      const li = document.createElement('li');
      li.className = 'donor-item fade-in';
      li.style.animationDelay = `${index * 0.05}s`;

      let rankClass = 'normal';
      if (index === 0) rankClass = 'top-1';
      else if (index === 1) rankClass = 'top-2';
      else if (index === 2) rankClass = 'top-3';

      li.innerHTML = `
        <div class="donor-rank ${rankClass}">${index + 1}</div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between">
            <strong style="color: var(--gold-light);">${d.name || 'Phật tử ẩn danh'}</strong>
            <span class="text-gold" style="font-weight: bold; color: var(--gold);">${Utils.formatCurrency(d.amount)}</span>
          </div>
          <div class="text-muted small">${d.message || ''}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted);">${Utils.formatDate(d.timestamp)}</div>
        </div>
      `;
      list.appendChild(li);
    }
  });

  // Format total with dots
  totalStats.textContent = total.toLocaleString('vi-VN');
}

async function submitDonation() {
  const name = document.getElementById('donorName').value.trim();
  const amount = parseInt(document.getElementById('donationAmount').value);
  const message = document.getElementById('donorMessage').value.trim();

  if (!message) {
    Utils.showToast("Vui lòng nhập lời cầu nguyện/nhắn nhủ 🙏");
    return;
  }

  const donorDisplayName = name || 'Phật tử ẩn danh';

  // Step 1: Animation
  animateCoin();

  // Step 2: Play sound
  setTimeout(() => audioManager.playCoinDrop(), 400);

  // Step 3: Fetch config for QR
  const config = await Utils.loadData('data/config.txt');
  const qrUrl = (config && config.settings && config.settings.donationQrUrl) ? config.settings.donationQrUrl : 'images/qr-code.jpg';
  const templeName = (config && config.templeName) ? config.templeName : 'Chùa Ninh An';

  // Step 4: Feedback toast and show modal
  setTimeout(() => {
    Utils.showToast(`🙏 Cảm niệm công đức của ${donorDisplayName}! Phúc thọ khương ninh.`);

    // Update Modal Content from Config
    const qrImg = document.getElementById('qrImage');
    const qrTitle = document.getElementById('qrTempleName');
    if (qrImg) qrImg.src = qrUrl;
    if (qrTitle) qrTitle.textContent = templeName;

    // Show Modal
    const qrModal = new bootstrap.Modal(document.getElementById('qrModal'));
    qrModal.show();

    // Save locally
    const newDonation = {
      id: Utils.generateId(),
      name: name,
      amount: amount,
      message: message,
      timestamp: Utils.now()
    };

    let myDonations = Utils.getData('myDonations', []);
    myDonations.push(newDonation);
    Utils.saveData('myDonations', myDonations);

    // Update UI
    donations.unshift(newDonation);
    renderDonationList();

    // Reset form fields but not name (UX choice)
    document.getElementById('donorMessage').value = '';

    // Particles
    const btn = document.querySelector('.btn-temple');
    const rect = btn.getBoundingClientRect();
    Utils.createParticles(rect.left + rect.width / 2, rect.top, '💰', 8);
  }, 1000);
}

function animateCoin() {
  const coin = document.createElement('div');
  coin.className = 'coin coin-dropping';
  coin.textContent = '₪';

  const anchor = document.getElementById('coinAnchor');
  anchor.appendChild(coin);

  setTimeout(() => coin.remove(), 1100);
}
