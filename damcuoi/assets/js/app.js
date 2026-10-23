/* Thiệp cưới tĩnh: đọc config.js và các tham số trên link.
   ?name=Chị Tuyền   tên khách hiện trên phong bì và thiệp
   ?g=tuyen          lấy tên khách từ danh sách guests trong config.js
   ?xh=chị           ép cách xưng hô trong lời mời (mặc định tự đoán từ tên)
   ?template=2       chọn giao diện (xử lý trong <head> của index.html)
   ?open=1           bỏ qua phong bì, vào thẳng trang */
(() => {
  'use strict';

  const W = window.WEDDING || {};
  const doc = document, html = doc.documentElement, body = doc.body;
  const $ = (s, r = doc) => r.querySelector(s);
  const $$ = (s, r = doc) => Array.from(r.querySelectorAll(s));
  const params = new URLSearchParams(location.search);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DOW = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const clean = (s, max = 60) => String(s || '').replace(/[\u0000-\u001f<>{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
  const ascii = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

  // Giờ trong config luôn là giờ Việt Nam (UTC+7), dù khách mở thiệp ở múi giờ nào.
  function parseVN(s) {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/.exec(s || '');
    if (!m) return null;
    const [y, mo, d, h, mi] = m.slice(1).map((x) => Number(x) || 0);
    return { y, mo, d, h, mi, ts: Date.UTC(y, mo - 1, d, h - 7, mi), dow: new Date(Date.UTC(y, mo - 1, d)).getUTCDay() };
  }

  // Ảnh Unsplash: tự thêm kích thước để tải nhẹ. Ảnh của bạn (photos/...) giữ nguyên.
  function photo(url, size) {
    if (!url) return '';
    if (!/^https:\/\/images\.unsplash\.com\//.test(url)) return url;
    const u = new URL(url);
    if (size && !u.searchParams.has('w')) {
      const [w, h] = String(size).split('x');
      u.searchParams.set('w', w);
      if (h) { u.searchParams.set('h', h); u.searchParams.set('fit', 'crop'); }
    }
    if (!u.searchParams.has('q')) u.searchParams.set('q', '80');
    if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
    return u.href;
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-show'), 2400);
  }

  /* ---------- Khách mời & cách xưng hô ---------- */
  const guestKey = clean(params.get('g'), 40);
  let guest = '';
  if (guestKey && W.guests && Object.prototype.hasOwnProperty.call(W.guests, guestKey)) guest = clean(W.guests[guestKey].name);
  if (!guest) guest = clean(params.get('name') || params.get('ten'));
  if (guest && guest === guest.toLowerCase()) guest = guest.replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toUpperCase());

  const SALUTES = ['gia đình', 'anh chị', 'cô chú', 'ông bà', 'các bạn', 'anh', 'chị', 'em', 'bạn', 'cô', 'chú', 'bác', 'ông', 'bà', 'cậu', 'mợ', 'dì', 'dượng', 'thím', 'thầy', 'cụ'];
  const PRONOUN = { 'gia đình': 'cả nhà' };
  function pronounFor(name) {
    const forced = clean(params.get('xh'), 20);
    if (forced) return forced.toLowerCase();
    if (!name) return 'quý khách';
    const low = name.toLowerCase();
    const hit = SALUTES.find((s) => low === s || low.startsWith(s + ' '));
    return hit ? PRONOUN[hit] || hit : 'bạn';
  }
  const xung = pronounFor(guest);
  const fill = (s) => String(s || '').replace(/\{khach\}/g, guest || 'quý khách').replace(/\{xung\}/g, xung);

  /* ---------- Dữ liệu hiển thị ---------- */
  const groom = W.groom || {}, bride = W.bride || {};
  const events = list(W.events);
  const mainEvent = events.find((e) => e.main) || events[events.length - 1] || {};
  const when = parseVN(W.date) || parseVN(mainEvent.time) || parseVN('2026-12-20T11:00');
  const lunar = window.Lunar ? window.Lunar.describe(when.d, when.mo, when.y) : '';
  const initial = (n) => (String(n || '').trim().split(/\s+/).pop() || '').charAt(0).toUpperCase();
  const inv = W.invitation || {};

  const data = {
    groom, bride, mainEvent,
    invitation: inv,
    tagline: W.tagline || '',
    guest: guest || 'Quý khách',
    invitationBody: fill(inv.body),
    closing: fill(inv.closing),
    texts: Object.fromEntries(Object.entries(W.texts || {}).map(([k, v]) => [k, fill(v)])),
    photoCredit: W.photoCredit || '',
    cover: W.cover,
    closingPhoto: W.closing,
    dateShort: `${pad(when.d)} . ${pad(when.mo)} . ${when.y}`,
    dateHero: `${DOW[when.dow]} · ${pad(when.d)}.${pad(when.mo)}.${when.y} · ${pad(when.h)}:${pad(when.mi)}`,
    time: `${pad(when.h)} giờ ${pad(when.mi)}`,
    weekday: DOW[when.dow],
    day: pad(when.d),
    month: pad(when.mo),
    year: when.y,
    lunar,
    monogram: `${initial(groom.name)}&${initial(bride.name)}`,
  };
  const lookup = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), data);

  $$('[data-bind]').forEach((el) => {
    const v = lookup(el.dataset.bind);
    if (v == null || v === '') {
      if (el.hasAttribute('data-optional')) el.hidden = true;
      return;
    }
    el.textContent = v;
  });
  $$('[data-bind-src]').forEach((el) => {
    const v = lookup(el.dataset.bindSrc);
    if (v) el.src = photo(v, el.dataset.size);
    else (el.closest('figure') || el).hidden = true;
  });
  doc.title = (guest ? `Kính gửi ${guest} · ` : '') + `Thiệp cưới ${groom.name || ''} & ${bride.name || ''}`;

  /* ---------- Lịch tháng có ngày Âm ---------- */
  (function renderCalendar() {
    const { y, mo, d } = when;
    const offset = (new Date(Date.UTC(y, mo - 1, 1)).getUTCDay() + 6) % 7; // tuần bắt đầu từ thứ Hai
    const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
    let cells = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((x) => `<span class="cal__dow">${x}</span>`).join('');
    cells += '<span class="cal__cell"></span>'.repeat(offset);
    for (let day = 1; day <= days; day++) {
      const l = window.Lunar ? window.Lunar.solar2lunar(day, mo, y) : null;
      const lun = !l ? '' : l.day === 1 ? `${l.day}/${l.month}` : l.day;
      const sun = (offset + day - 1) % 7 === 6;
      const wed = day === d;
      cells += `<span class="cal__cell${sun ? ' is-sun' : ''}${wed ? ' is-wedding' : ''}">`
        + (wed ? '<svg aria-hidden="true"><use href="#heart"/></svg>' : '')
        + `<b>${day}</b><small>${lun}</small></span>`;
    }
    $('#calendar').innerHTML = `<div class="cal__head"><span class="cal__month">Tháng ${mo}</span><span class="cal__year">${y}</span></div>`
      + `<div class="cal__grid">${cells}</div>`
      + `<p class="cal__foot">${esc(DOW[when.dow])}, ${pad(when.h)}:${pad(when.mi)} · Âm lịch ${esc(lunar)}</p>`;
  })();

  /* ---------- Đếm ngược ---------- */
  const cd = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  const cdNote = $('#countdown-note');
  function tick() {
    const diff = when.ts - Date.now();
    if (diff <= 0) {
      Object.values(cd).forEach((el) => { el.textContent = '00'; });
      cdNote.textContent = diff > -12 * 3600e3 ? 'Hôm nay là ngày chung đôi của chúng mình!' : 'Cảm ơn bạn đã cùng chúng mình đi qua ngày hạnh phúc ♡';
      return false;
    }
    const s = Math.floor(diff / 1000);
    cd.d.textContent = pad(Math.floor(s / 86400));
    cd.h.textContent = pad(Math.floor((s % 86400) / 3600));
    cd.m.textContent = pad(Math.floor((s % 3600) / 60));
    cd.s.textContent = pad(s % 60);
    return true;
  }
  if (tick()) {
    cdNote.textContent = 'Từng giây đang đếm ngược tới ngày vui';
    const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
  }

  $('#add-cal').addEventListener('click', () => {
    const start = when.ts, end = start + 4 * 3600e3;
    const fmt = (t) => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const title = `Đám cưới ${groom.name || ''} & ${bride.name || ''}`;
    const loc = [mainEvent.place, mainEvent.address].filter(Boolean).join(', ');
    const link = location.href.split('#')[0];
    if (/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) {
      const icsEsc = (s) => String(s).replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//thiep-cuoi//vi', 'BEGIN:VEVENT',
        `UID:${start}@thiep-cuoi`, `DTSTAMP:${fmt(Date.now())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
        `SUMMARY:${icsEsc(title)}`, `LOCATION:${icsEsc(loc)}`, `DESCRIPTION:${icsEsc(link)}`,
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(title)}`, 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR',
      ].join('\r\n');
      const a = doc.createElement('a');
      a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
      a.download = 'dam-cuoi.ics';
      body.append(a);
      a.click();
      a.remove();
    } else {
      const u = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
        + `&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}`
        + `&location=${encodeURIComponent(loc)}&details=${encodeURIComponent(link)}`;
      window.open(u, '_blank', 'noopener');
    }
  });

  /* ---------- Lễ cưới & bản đồ ---------- */
  const directions = (e) => e.map || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(e.address || e.place || '')}`;
  $('#events-list').innerHTML = events.map((e) => {
    const t = parseVN(e.time);
    return `<article class="event reveal${e.main ? ' event--main' : ''}">`
      + (t ? `<div class="event__time"><b>${pad(t.h)}:${pad(t.mi)}</b><span>${pad(t.d)}.${pad(t.mo)}.${t.y}</span></div>` : '')
      + `<h3 class="event__title">${esc(e.title)}</h3>`
      + (e.place ? `<p class="event__place">${esc(e.place)}</p>` : '')
      + (e.hall ? `<p class="event__hall">${esc(e.hall)}</p>` : '')
      + (e.address ? `<p class="event__addr">${esc(e.address)}</p>` : '')
      + `<a class="btn btn--line" href="${esc(directions(e))}" target="_blank" rel="noopener"><svg class="icon"><use href="#i-nav"/></svg> Chỉ đường</a>`
      + '</article>';
  }).join('');
  if (mainEvent.address || mainEvent.place) {
    const map = $('#map');
    const where = encodeURIComponent(mainEvent.address || mainEvent.place);
    map.innerHTML = `<iframe title="Bản đồ tới ${esc(mainEvent.place || 'tiệc cưới')}" src="https://maps.google.com/maps?q=${where}&z=16&hl=vi&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
    map.hidden = false;
  }

  /* ---------- Chuyện tình ---------- */
  const story = list(W.story);
  if (story.length) {
    $('#story-list').innerHTML = story.map((s) => '<li class="story__item reveal">'
      + `<span class="kicker">${esc(s.when)}</span><h3 class="story__title">${esc(s.title)}</h3><p class="story__text">${esc(s.text)}</p></li>`).join('');
    $('#story').hidden = false;
  }

  /* ---------- Album + xem ảnh ---------- */
  const gallery = list(W.gallery);
  const SHAPES = { 0: 'tall', 3: 'wide', 5: 'tall', 8: 'wide' };
  if (gallery.length) {
    $('#gallery').innerHTML = gallery.map((u, i) => {
      const shape = SHAPES[i % 10] ? ` gal__item--${SHAPES[i % 10]}` : '';
      return `<button class="gal__item reveal${shape}" type="button" data-i="${i}" aria-label="Xem ảnh ${i + 1}" style="transition-delay:${(i % 3) * 90}ms">`
        + `<img src="${esc(photo(u, '800'))}" alt="" loading="lazy" decoding="async"></button>`;
    }).join('');
    $('#album').hidden = false;

    const lb = $('#lightbox'), lbImg = $('#lightbox-img'), lbCount = $('#lightbox-count');
    let lbIndex = 0, lastFocus = null, touchX = null;
    const lbShow = (i) => {
      lbIndex = (i + gallery.length) % gallery.length;
      lbImg.src = photo(gallery[lbIndex], '1800');
      lbCount.textContent = `${lbIndex + 1} / ${gallery.length}`;
      [1, -1].forEach((k) => { new Image().src = photo(gallery[(lbIndex + k + gallery.length) % gallery.length], '1800'); });
    };
    const lbOpen = (i) => {
      lastFocus = doc.activeElement;
      lb.hidden = false;
      body.classList.add('is-locked');
      lbShow(i);
      $('[data-lb="close"]', lb).focus();
    };
    const lbClose = () => {
      lb.hidden = true;
      body.classList.remove('is-locked');
      lbImg.removeAttribute('src');
      if (lastFocus) lastFocus.focus();
    };
    $('#gallery').addEventListener('click', (e) => {
      const b = e.target.closest('.gal__item');
      if (b) lbOpen(Number(b.dataset.i));
    });
    lb.addEventListener('click', (e) => {
      const act = e.target.closest('[data-lb]')?.dataset.lb;
      if (act === 'close' || e.target === lb) lbClose();
      else if (act === 'prev') lbShow(lbIndex - 1);
      else if (act === 'next') lbShow(lbIndex + 1);
    });
    doc.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
      else if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    });
    lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) lbShow(lbIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ---------- Xác nhận tham dự & lời chúc (Google Sheets) ---------- */
  const rsvp = W.rsvp || {};
  const endpoint = String(rsvp.endpoint || '').trim();
  const form = $('#rsvp-form'), note = $('#rsvp-note');
  const wishesBox = $('#wishes'), wishesList = $('#wishes-list');
  if (rsvp.deadline) {
    const el = $('#rsvp-deadline');
    el.textContent = `Bạn vui lòng xác nhận trước ngày ${rsvp.deadline} để gia đình chuẩn bị chu đáo nhé.`;
    el.hidden = false;
  }
  if (guest) form.elements.namedItem('name').value = guest;

  function addWish(w, atTop) {
    const fig = doc.createElement('figure');
    fig.className = 'wish';
    const q = doc.createElement('blockquote');
    const cap = doc.createElement('figcaption');
    q.textContent = w.message;
    cap.textContent = '— ' + w.name;
    fig.append(q, cap);
    if (atTop) wishesList.prepend(fig); else wishesList.append(fig);
    wishesBox.hidden = false;
  }
  if (endpoint) {
    fetch(endpoint + (endpoint.includes('?') ? '&' : '?') + 'action=wishes')
      .then((r) => r.json())
      .then((rows) => list(rows).slice(0, 80).forEach((w) => {
        if (w.message) addWish({ name: clean(w.name) || 'Một người bạn', message: String(w.message).slice(0, 500) });
      }))
      .catch(() => {});
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = clean(fd.get('name'), 80);
    const message = String(fd.get('message') || '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, 500);
    if (!name) {
      note.textContent = 'Bạn cho chúng mình xin tên nhé.';
      form.elements.namedItem('name').focus();
      return;
    }
    fd.set('name', name);
    fd.set('message', message);
    fd.set('guest_key', guestKey);
    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    btn.textContent = 'Đang gửi…';
    note.textContent = '';
    try {
      if (endpoint) await fetch(endpoint, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(fd) });
      else await new Promise((r) => setTimeout(r, 500));
      const yes = fd.get('attend') === 'yes';
      const them = pronounFor(name);
      form.innerHTML = '<div class="rsvp-done"><svg class="rsvp-done__heart" aria-hidden="true"><use href="#heart"/></svg>'
        + `<p class="rsvp-done__title">Cảm ơn ${esc(name)}!</p>`
        + `<p>${yes ? `Chúng mình rất mong được gặp ${esc(them)} trong ngày vui.` : `Tiếc quá, hẹn gặp ${esc(them)} vào một dịp gần nhất nhé.`}</p>`
        + (endpoint ? '' : '<p class="form-note">Bản xem thử: câu trả lời chưa được lưu vì chưa nối Google Sheets (xem HUONG-DAN.md).</p>')
        + '</div>';
      if (message) addWish({ name, message }, true);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Gửi xác nhận';
      note.textContent = 'Chưa gửi được, bạn kiểm tra mạng rồi thử lại nhé.';
    }
  });

  /* ---------- Mừng cưới (VietQR) ---------- */
  const gifts = list(W.gifts).filter((g) => g.account);
  if (gifts.length) {
    $('#gift').hidden = false;
    const box = $('#gifts'), toggle = $('#gift-toggle');
    const memo = ascii(guest ? `${guest} mung cuoi` : 'Mung cuoi').replace(/[^A-Za-z0-9 ]/g, '').slice(0, 25);
    box.innerHTML = gifts.map((g) => {
      const qr = `https://img.vietqr.io/image/${encodeURIComponent(g.bank || '')}-${encodeURIComponent(g.account)}-compact.png`
        + `?addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(g.holder || '')}`;
      return '<div class="gcard">'
        + `<p class="kicker">${esc(g.label || 'Mừng cưới')}</p>`
        + `<div class="gcard__qr"><img data-qr="${esc(qr)}" alt="Mã QR chuyển khoản ${esc(g.bankName || g.bank || '')}" width="188" height="188"></div>`
        + `<p class="gcard__bank">${esc(g.bankName || g.bank || '')}</p>`
        + `<button class="gcard__acc" type="button" data-copy="${esc(g.account)}" aria-label="Chép số tài khoản ${esc(g.account)}">${esc(g.account)} <svg class="icon"><use href="#i-copy"/></svg></button>`
        + (g.holder ? `<p class="gcard__holder">${esc(g.holder)}</p>` : '')
        + '</div>';
    }).join('');
    const label = toggle.lastChild;
    const setGiftOpen = (open) => {
      box.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      label.textContent = open ? ' Đóng hộp mừng cưới' : ' Mở hộp mừng cưới';
      if (open) $$('img[data-qr]', box).forEach((img) => { if (!img.src) img.src = img.dataset.qr; });
    };
    toggle.addEventListener('click', () => setGiftOpen(box.hidden));
    // Bấm "Mừng cưới" trên thanh mục lục hoặc mở link có #gift thì mở sẵn hộp.
    $('#dock a[data-sec="gift"]').addEventListener('click', () => setGiftOpen(true));
    if (location.hash === '#gift') setGiftOpen(true);
    box.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-copy]');
      if (!b) return;
      const text = b.dataset.copy;
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (err) {
        const ta = doc.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;opacity:0';
        body.append(ta);
        ta.select();
        try { ok = doc.execCommand('copy'); } catch (err2) { ok = false; }
        ta.remove();
      }
      toast(ok ? 'Đã chép số tài khoản' : `Số tài khoản: ${text}`);
    });
  }

  /* ---------- Nhạc nền ---------- */
  const musicBtn = $('#music');
  let playMusic = () => {};
  if (W.music && W.music.src) {
    const audio = new Audio();
    audio.preload = 'none';
    audio.loop = true;
    audio.src = W.music.src;
    musicBtn.hidden = false;
    if (W.music.credit) $('#music-credit').textContent = 'Nhạc nền: ' + W.music.credit;
    const setPlaying = (on) => {
      musicBtn.classList.toggle('is-playing', on);
      musicBtn.setAttribute('aria-pressed', String(on));
      musicBtn.setAttribute('aria-label', on ? 'Tắt nhạc nền' : 'Bật nhạc nền');
    };
    playMusic = () => audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    musicBtn.addEventListener('click', () => {
      if (audio.paused) playMusic();
      else { audio.pause(); setPlaying(false); }
    });
    let resume = false;
    doc.addEventListener('visibilitychange', () => {
      if (doc.hidden) { resume = !audio.paused; audio.pause(); } else if (resume) playMusic();
    });
  }

  /* ---------- Hiệu ứng rơi ---------- */
  function startFx() {
    const kind = W.effect || 'petals';
    const canvas = $('#fx');
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (reduceMotion || kind === 'none' || !ctx) return;
    let w = 0, h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    const COLORS = kind === 'hearts'
      ? ['#d7263d', '#f06a7e', '#e2bd6a', '#ff9aa8']
      : ['#f7c6cf', '#f2a7b6', '#ffdfe4', '#e2bd6a', '#fbefcf', '#e98a9c'];
    const HEART = new Path2D('M12 21s-7.6-4.7-9.4-9.4C1.2 8 3.5 4.4 7.1 4.4c2 0 3.5 1.1 4.9 3 1.4-1.9 2.9-3 4.9-3 3.6 0 5.9 3.6 4.5 7.2C19.6 16.3 12 21 12 21z');
    const rnd = (a, b) => a + Math.random() * (b - a);
    const make = (anywhere) => ({
      x: rnd(0, w), y: anywhere ? rnd(-h, h) : rnd(-60, -20),
      r: rnd(5, 10), vy: rnd(0.35, 1), vx: rnd(-0.3, 0.3),
      rot: rnd(0, 6.28), vr: rnd(-0.02, 0.02), flip: rnd(0, 6.28), vf: rnd(0.01, 0.04), sway: rnd(0, 6.28),
      color: COLORS[Math.floor(Math.random() * COLORS.length)], alpha: rnd(0.55, 0.95),
    });
    const parts = Array.from({ length: w < 640 ? 16 : 28 }, () => make(true));
    const drawPetal = (r) => {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.95, -r * 0.55, r * 0.7, r * 0.7, 0, r);
      ctx.bezierCurveTo(-r * 0.7, r * 0.7, -r * 0.95, -r * 0.55, 0, -r);
      ctx.fill();
    };
    const drawHeart = (r) => {
      ctx.scale(r / 11, r / 11);
      ctx.translate(-12, -12);
      ctx.fill(HEART);
    };
    let running = true;
    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.sway += 0.015;
        p.x += p.vx + Math.sin(p.sway) * 0.45;
        p.y += p.vy;
        p.rot += p.vr;
        p.flip += p.vf;
        if (p.y > h + 30 || p.x < -40 || p.x > w + 40) Object.assign(p, make(false));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.max(0.25, Math.abs(Math.cos(p.flip))));
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (kind === 'hearts') drawHeart(p.r); else drawPetal(p.r);
        ctx.restore();
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    doc.addEventListener('visibilitychange', () => {
      const was = running;
      running = !doc.hidden;
      if (running && !was) requestAnimationFrame(frame);
    });
  }

  /* ---------- Hiện dần khi cuộn + thanh mục lục ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    : null;
  $$('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));

  $$('#dock a').forEach((a) => {
    const sec = doc.getElementById(a.dataset.sec);
    if (!sec || sec.hidden) a.remove();
  });
  // Thanh mục lục chỉ hiện khi đã cuộn qua màn đầu (để ảnh bìa thoáng) và sáng mục đang xem.
  const dock = $('#dock');
  const dockLinks = $$('#dock a').map((a) => ({ a, sec: doc.getElementById(a.dataset.sec) }));
  let dockTick = false;
  const updateDock = () => {
    dockTick = false;
    const mid = window.innerHeight / 2;
    dock.classList.toggle('is-shown', window.scrollY > window.innerHeight * 0.55);
    dockLinks.forEach(({ a, sec }) => {
      const r = sec.getBoundingClientRect();
      a.classList.toggle('is-active', r.top <= mid && r.bottom > mid);
    });
  };
  window.addEventListener('scroll', () => {
    if (!dockTick) { dockTick = true; requestAnimationFrame(updateDock); }
  }, { passive: true });
  updateDock();

  /* ---------- Mở phong bì ---------- */
  const intro = $('#intro'), env = $('#env');
  let opened = false;
  function finishIntro(instant) {
    if (instant) intro.hidden = true;
    intro.classList.add('is-done');
    body.classList.remove('is-locked');
    html.classList.add('is-ready');
    const target = location.hash && doc.getElementById(location.hash.slice(1));
    if (target) {
      try { target.scrollIntoView({ behavior: 'instant' }); } catch (err) { target.scrollIntoView(); } // Safari cũ chưa có 'instant'
    }
    updateDock();
    startFx();
    setTimeout(() => intro.remove(), 1000);
  }
  function openInvite(instant) {
    if (opened) return;
    opened = true;
    if (!instant) playMusic();
    if (instant || reduceMotion) { finishIntro(true); return; }
    intro.classList.add('is-opening');
    env.classList.add('is-open');
    setTimeout(() => env.classList.add('is-flipped'), 420);
    setTimeout(() => env.classList.add('is-letter'), 780);
    setTimeout(finishIntro, 2400);
  }
  $('#intro-btn').addEventListener('click', () => openInvite(false));
  env.addEventListener('click', () => openInvite(false));
  if (params.get('open') === '1') openInvite(true);
})();
