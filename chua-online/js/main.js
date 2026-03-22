// ============================================
// VIẾNG CHÙA ONLINE - Main Navigation & Shared Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollEffects();
});

function initNavigation() {
  // Highlight active nav item
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Top navbar
  document.querySelectorAll('.navbar-temple .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Bottom nav
  document.querySelectorAll('.bottom-nav .nav-item a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initScrollEffects() {
  // Fade in elements on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// Navigation helper function
function getNavHTML(activePage) {
  return ''; // Nav is inline in each HTML
}
