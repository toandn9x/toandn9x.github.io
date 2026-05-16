const typeMap = {
  all: { label: 'Tất cả', icon: '✨' },
  url: { label: 'URL', icon: '🔗' },
  file: { label: 'File', icon: '📄' },
  folder: { label: 'Folder', icon: '📁' }
};

let currentFilter = 'all';
let currentSearch = '';

const $ = (selector) => document.querySelector(selector);
const list = $('#shareList');
const emptyState = $('#emptyState');
const toast = $('#toast');

function initPage() {
  const { author, page } = shareConfig;

  document.title = `ShareHub - ${page.title}`;
  $('#authorName').innerHTML = author.name;
  $('#copyrightText').textContent = author.copyright;
  $('.author-avatar').textContent = author.initials;
  $('.eyebrow').textContent = page.badge.replace('⚡ ', '');
  $('#pageTitle').textContent = page.title;
  $('.bio-text').textContent = page.subtitle;

  initTheme();
  renderTabs();
  renderLinks();
  bindEvents();
}

function renderTabs() {
  const existingTypes = ['all', ...new Set(shareConfig.links.map((item) => item.type))];
  $('#filterTabs').innerHTML = existingTypes.map((type) => `
    <button
      id="filter-${type}"
      class="tab-btn ${type === currentFilter ? 'active' : ''}"
      type="button"
      data-type="${type}"
      aria-pressed="${type === currentFilter}"
    >${typeMap[type]?.icon || '⭐'} ${typeMap[type]?.label || type}</button>
  `).join('');
}

function renderLinks() {
  const keyword = currentSearch.trim().toLowerCase();
  
  // map first to keep original index
  const itemsWithIndex = shareConfig.links.map((item, index) => ({ item, index }));
  
  const filteredLinks = itemsWithIndex.filter(({ item }) => {
    const matchesType = currentFilter === 'all' || item.type === currentFilter;
    const haystack = `${item.title} ${item.description} ${item.tag} ${item.url}`.toLowerCase();
    return matchesType && haystack.includes(keyword);
  });

  list.innerHTML = filteredLinks.map(({ item, index }) => createListItem(item, index)).join('');
  emptyState.hidden = filteredLinks.length > 0;
}

function createListItem(item, index) {
  const icon = typeMap[item.type]?.icon || '⭐';
  const previewUrl = `preview.html?id=${index}`;

  return `
    <li class="share-item">
      <a
        id="open-${index}"
        class="share-link"
        style="--accent:${item.accent || '#7c3aed'}"
        href="${previewUrl}"
        title="Xem trước: ${escapeHtml(item.title)}"
      >
        <span class="share-icon" aria-hidden="true">${icon}</span>
        <span class="share-content">
          <span class="share-title">${escapeHtml(item.title)}</span>
          <span class="share-desc">${escapeHtml(item.description)}</span>
        </span>
        <span class="share-arrow" aria-hidden="true">›</span>
      </a>
    </li>
  `;
}

function bindEvents() {
  $('#searchInput').addEventListener('input', (event) => {
    currentSearch = event.target.value;
    renderLinks();
  });

  $('#filterTabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-type]');
    if (!button) return;
    currentFilter = button.dataset.type;
    renderTabs();
    renderLinks();
  });

  $('#copyPageBtn').addEventListener('click', () => copyText(window.location.href));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
  showToast('Đã copy link trang!');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function initTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  $('#themeToggle').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  
  $('#themeToggle').addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    $('#themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });
}

initPage();
