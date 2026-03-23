// ============================================
// VIẾNG CHÙA ONLINE - Shared Utilities
// ============================================

const Utils = {
  // Load JSON data from file
  async loadData(filePath) {
    const key = filePath.replace(/[^a-zA-Z]/g, '_');
    try {
      const response = await fetch(filePath, { cache: 'no-cache' });
      
      // Với file://, response.ok có thể false nhưng status vẫn là 0 nếu thành công
      if (!response.ok && response.status !== 0) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data) {
        // Lưu vào cache để dự phòng cho lần sau nếu lỗi fetch
        this.saveData(key, data);
      }
      return data;
    } catch (error) {
      console.warn(`Could not load ${filePath}, using localStorage fallback.`, error);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }
  },

  // Save data to localStorage (since we can't write to files from browser)
  saveData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save data:', e);
      return false;
    }
  },

  // Get data from localStorage
  getData(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Format date in Vietnamese
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('vi-VN', options);
  },

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },

  // Show toast notification
  showToast(message, duration = 3000) {
    // Remove existing toast
    const existing = document.querySelector('.temple-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'temple-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Create particle effect
  createParticles(x, y, emoji = '✨', count = 8) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.textContent = emoji;
      particle.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
      particle.style.top = (y + (Math.random() - 0.5) * 60) + 'px';
      particle.style.fontSize = (Math.random() * 16 + 12) + 'px';
      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 2000);
    }
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Sanitize HTML to prevent XSS
  sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Get current timestamp
  now() {
    return new Date().toISOString();
  }
};

// ============================================
// Audio Manager - Ưu tiên file thực, fallback Web Audio API
// ============================================
// Đặt file audio vào thư mục audio/:
//   audio/bell.mp3         - Tiếng chuông
//   audio/wooden-fish.mp3  - Tiếng gõ mõ
//   audio/chanting.mp3     - Niệm Phật (loop)
//   audio/coin-drop.mp3    - Tiếng bỏ tiền công đức
//   audio/shake.mp3        - Tiếng lắc ống xăm
// ============================================
class AudioManager {
  constructor() {
    this.context = null;
    this.isPlaying = false;
    this.chantingAudio = null;
    this.currentChantingSession = 0;

    // Cấu hình đường dẫn file audio
    this.audioFiles = {
      bell:       'audio/bell.mp3',
      woodenFish: 'audio/wooden-fish.mp3',
      chanting:   'audio/chanting.mp3',
      coinDrop:   'audio/coin-drop.mp3',
      shake:      'audio/shake.mp3'
    };

    // Cache kiểm tra file tồn tại (tránh request lại nhiều lần)
    this._fileExists = {};
  }

  getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.context;
  }

  // Phát file audio thực, trả về Promise<boolean> (true = thành công)
  _playFile(key, loop = false) {
    return new Promise((resolve) => {
      // Nếu đã biết file không tồn tại → skip luôn
      if (this._fileExists[key] === false) {
        resolve(false);
        return;
      }

      const src = this.audioFiles[key];
      if (!src) { resolve(false); return; }

      const audio = new Audio(src);
      audio.loop = loop;

      audio.addEventListener('canplaythrough', () => {
        this._fileExists[key] = true;
        audio.play().then(() => resolve(audio)).catch(() => resolve(false));
      }, { once: true });

      audio.addEventListener('error', () => {
        this._fileExists[key] = false;
        resolve(false);
      }, { once: true });

      // Timeout fallback (nếu file load quá lâu)
      setTimeout(() => resolve(false), 1000);
    });
  }

  // ---- GÕ MÕ ----
  async playWoodenFish() {
    const result = await this._playFile('woodenFish');
    if (result) return;

    // Fallback: synthesized mõ gỗ
    const ctx = this.getContext();
    const t = ctx.currentTime;

    // 1) Body resonance — thân gỗ rỗng cộng hưởng (tần số thấp-trung)
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(280, t);
    body.frequency.exponentialRampToValueAtTime(180, t + 0.08);
    bodyGain.gain.setValueAtTime(0.6, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    body.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    body.start(t);
    body.stop(t + 0.4);

    // 2) Attack tone — tiếng "tốc" đanh ở đầu
    const attack = ctx.createOscillator();
    const attackGain = ctx.createGain();
    attack.type = 'square';
    attack.frequency.setValueAtTime(900, t);
    attack.frequency.exponentialRampToValueAtTime(300, t + 0.02);
    attackGain.gain.setValueAtTime(0.3, t);
    attackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    attack.connect(attackGain);
    attackGain.connect(ctx.destination);
    attack.start(t);
    attack.stop(t + 0.08);

    // 3) Noise burst — tiếng va chạm gỗ
    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, t);
    noiseFilter.Q.setValueAtTime(1.5, t);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);
  }

  // ---- CHUÔNG ----
  async playBell() {
    const result = await this._playFile('bell');
    if (result) return;

    // Fallback: synthesized
    const ctx = this.getContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 2);
    osc2.stop(ctx.currentTime + 2);
  }

  // ---- NIỆM PHẬT (loop) ----
  async startChanting() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // Đánh dấu session mới để tránh race condition
    const session = ++this.currentChantingSession;

    const result = await this._playFile('chanting', true);
    
    // KIỂM TRA QUAN TRỌNG: Nếu session đã thay đổi hoặc đã bị tắt thì dừng ngay
    if (this.currentChantingSession !== session || !this.isPlaying) {
      if (result) {
        try { result.pause(); result.currentTime = 0; } catch(e) {}
      }
      return;
    }

    if (result) {
      this.chantingAudio = result;
      return;
    }

    // Fallback: synthesized drone (kiểm tra lại session/isPlaying)
    if (this.currentChantingSession !== session || !this.isPlaying) return;
    
    const ctx = this.getContext();
    this.droneOsc = ctx.createOscillator();
    this.droneGain = ctx.createGain();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(130.81, ctx.currentTime);
    this.droneGain.gain.setValueAtTime(0.08, ctx.currentTime);
    this.droneOsc.connect(this.droneGain);
    this.droneGain.connect(ctx.destination);
    this.droneOsc.start();

    this.harmOsc = ctx.createOscillator();
    this.harmGain = ctx.createGain();
    this.harmOsc.type = 'sine';
    this.harmOsc.frequency.setValueAtTime(196, ctx.currentTime);
    this.harmGain.gain.setValueAtTime(0.05, ctx.currentTime);
    this.harmOsc.connect(this.harmGain);
    this.harmGain.connect(ctx.destination);
    this.harmOsc.start();

    this.lfo = ctx.createOscillator();
    this.lfoGain = ctx.createGain();
    this.lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    this.lfoGain.gain.setValueAtTime(10, ctx.currentTime);
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.droneOsc.frequency);
    this.lfo.start();
  }

  stopChanting() {
    this.isPlaying = false;
    this.currentChantingSession++; // Huỷ bỏ mọi lượt load đang chạy

    // Dừng file audio thực nếu đang dùng
    if (this.chantingAudio) {
      try {
        this.chantingAudio.pause();
        this.chantingAudio.currentTime = 0;
      } catch (e) {}
      this.chantingAudio = null;
    }

    // Dừng synthesized (dọn dẹp bất kể isPlaying)
    const fadeTime = 0.5;
    const ctx = this.context;
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      if (this.droneGain) {
        this.droneGain.gain.exponentialRampToValueAtTime(0.001, t + fadeTime);
        setTimeout(() => { try { this.droneOsc.stop(); } catch(e) {} }, fadeTime * 1000);
      }
      if (this.harmGain) {
        this.harmGain.gain.exponentialRampToValueAtTime(0.001, t + fadeTime);
        setTimeout(() => { try { this.harmOsc.stop(); } catch(e) {} }, fadeTime * 1000);
      }
      if (this.lfo) {
        setTimeout(() => { try { this.lfo.stop(); } catch(e) {} }, fadeTime * 1000);
      }
    } catch (e) {}
  }

  // ---- BỎ TIỀN CÔNG ĐỨC ----
  async playCoinDrop() {
    const result = await this._playFile('coinDrop');
    if (result) return;

    // Fallback: synthesized
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.2);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  // ---- LẮC ỐNG XĂM ----
  async playShake() {
    const result = await this._playFile('shake');
    if (result) return;

    // Fallback: synthesized noise
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }
}

// Global instances
const audioManager = new AudioManager();
