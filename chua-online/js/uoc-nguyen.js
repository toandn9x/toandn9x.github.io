// ============================================
// VIẾNG CHÙA ONLINE - Cây Ước Nguyện (Wish Tree)
// ============================================

let allWishes = [];
let selectedColor = '#e74c3c';
const wishModal = new bootstrap.Modal(document.getElementById('wishModal'));

let bodhiTree;

document.addEventListener('DOMContentLoaded', async () => {
  // Load base wishes
  const data = await Utils.loadData('data/wishes.txt');
  let baseWishes = (data && data.wishes) ? data.wishes : [];
  
  // Load custom wishes from local
  let customWishes = Utils.getData('myWishes', []);
  
  allWishes = [...baseWishes, ...customWishes];
  
  initColorPicker();
  
  // Init canvas tree
  if (window.AnimatedBodhiTree) {
    bodhiTree = new AnimatedBodhiTree('treeCanvas', (tips) => {
      renderTree(tips);
    });
    bodhiTree.startAnimation();
  } else {
    renderTree(null);
  }
});

function initColorPicker() {
  const pickers = document.querySelectorAll('.color-picker');
  pickers.forEach(p => {
    p.addEventListener('click', () => {
      pickers.forEach(el => {
        el.classList.remove('active');
        el.style.border = 'none';
      });
      p.classList.add('active');
      p.style.border = '2px solid white';
      selectedColor = p.dataset.color;
    });
  });
}

function renderTree(tips = null) {
  const container = document.getElementById('ribbonsContainer');
  const countEl = document.getElementById('totalWishes');
  container.innerHTML = '';
  
  countEl.textContent = allWishes.length;
  
  allWishes.forEach((wish, index) => {
    let position = null;
    if (tips && tips.length > 0) {
      const tip = tips[index % tips.length];
      position = {
        left: (tip.x / bodhiTree.canvas.width) * 100,
        top: (tip.y / bodhiTree.canvas.height) * 100
      };
    }
    createRibbon(wish, true, position, index * 100);
  });
}

function createRibbon(wish, animate = false, position = null, delay = 0) {
  const container = document.getElementById('ribbonsContainer');
  const ribbon = document.createElement('div');
  ribbon.className = 'wish-ribbon';
  ribbon.style.pointerEvents = 'auto'; // Ensures clickable over canvas
  
  let left, top;
  if (position) {
    left = position.left;
    top = position.top;
  } else {
    left = 20 + Math.random() * 60;
    top = 15 + Math.random() * 50;
    
    // Pick from tree branch tips if available
    if (bodhiTree && bodhiTree.branchTips.length > 0) {
      const tip = bodhiTree.branchTips[Math.floor(Math.random() * bodhiTree.branchTips.length)];
      left = (tip.x / bodhiTree.canvas.width) * 100;
      top = (tip.y / bodhiTree.canvas.height) * 100;
    }
  }
  
  ribbon.style.left = `${left}%`;
  ribbon.style.top = `${top}%`;
  ribbon.style.backgroundColor = wish.color || '#e74c3c';
  ribbon.style.color = 'white';
  
  // Truncate name for ribbon display
  const displayName = wish.name.length > 8 ? wish.name.substring(0, 8) + '..' : wish.name;
  ribbon.textContent = displayName;
  
  ribbon.onclick = (e) => {
    e.stopPropagation();
    showWishDetail(wish);
  };
  
  if (animate) {
    ribbon.style.opacity = '0';
    ribbon.style.transform = 'scale(2) rotate(45deg)';
    container.appendChild(ribbon);
    
    setTimeout(() => {
      ribbon.style.transition = 'all 1s ease-out';
      ribbon.style.opacity = '1';
      ribbon.style.transform = 'scale(1) rotate(0deg)';
      setTimeout(() => {
        ribbon.style.transition = '';
        ribbon.style.transform = '';
      }, 1000);
    }, delay + 50);
  } else {
    container.appendChild(ribbon);
  }
}

function showWishDetail(wish) {
  document.getElementById('modalWishName').textContent = `Ước nguyện của: ${wish.name}`;
  document.getElementById('modalWishContent').innerHTML = `<p style="font-family: 'Dancing Script', cursive; font-size: 1.5rem; line-height: 1.5;">"${wish.content}"</p>`;
  document.getElementById('modalWishDate').textContent = `Thời gian: ${Utils.formatDate(wish.timestamp)}`;
  
  wishModal.show();
  audioManager.playBell();
}

function submitWish() {
  const name = document.getElementById('wishName').value.trim();
  const content = document.getElementById('wishContent').value.trim();
  
  if (!name || !content) {
    Utils.showToast("Vui lòng nhập tên và nội dung ước nguyện 🙏");
    return;
  }
  
  const newWish = {
    id: Utils.generateId(),
    name: name,
    content: content,
    timestamp: Utils.now(),
    color: selectedColor
  };
  
  // Save locally
  let myWishes = Utils.getData('myWishes', []);
  myWishes.push(newWish);
  Utils.saveData('myWishes', myWishes);
  
  // Update state
  allWishes.push(newWish);
  
  // Clear form
  document.getElementById('wishName').value = '';
  document.getElementById('wishContent').value = '';
  
  // Animate new ribbon
  createRibbon(newWish, true);
  
  // Feedback
  document.getElementById('totalWishes').textContent = allWishes.length;
  Utils.showToast("Ước nguyện của bạn đã được treo lên cây bồ đề 🙏");
  
  // Particles
  const btn = document.querySelector('.btn-temple');
  const rect = btn.getBoundingClientRect();
  Utils.createParticles(rect.left + rect.width/2, rect.top, '🌸', 10);
}
