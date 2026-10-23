// Cloudflare Pages (advanced mode). Chạy được cả khi upload kéo-thả lẫn khi deploy bằng Wrangler.
// 1. Điền tiêu đề, mô tả, ảnh xem trước (Zalo / Messenger / Facebook) từ config.js, kèm tên khách trên link.
//    Các app này không chạy JavaScript nên phải sửa HTML ngay trên máy chủ.
// 2. Trả nhạc nền theo từng đoạn (HTTP 206) để iPhone/Safari phát được.
// Nếu có lỗi gì ở đây, trang vẫn được trả về nguyên bản, khách vẫn xem bình thường.
export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    const type = res.headers.get('content-type') || '';
    const range = request.headers.get('range');
    if (range && res.status === 200 && type.startsWith('audio/')) return partial(res, range);
    if (request.method !== 'GET' || !type.includes('text/html')) return res;

    const url = new URL(request.url);
    const guest = clean(url.searchParams.get('name') || url.searchParams.get('ten'));
    let share = null;
    try {
      const cfg = await env.ASSETS.fetch(new Request(new URL('/config.js', url)));
      if (cfg.ok) share = shareInfo(parseConfig(await cfg.text()), url, guest);
    } catch (err) {
      share = null;
    }
    if (!share && !guest) return res;

    const prefix = guest ? `Kính gửi ${guest} · ` : '';
    const setContent = (value) => ({ element(el) { if (value) el.setAttribute('content', value); } });
    let rw = new HTMLRewriter();
    if (share) {
      rw = rw
        .on('title', { element(el) { el.setInnerContent(prefix + share.title); } })
        .on('meta[property="og:title"]', setContent(prefix + share.title))
        .on('meta[name="description"]', setContent(share.description))
        .on('meta[property="og:description"]', setContent(share.description))
        .on('meta[property="og:image"]', setContent(share.image));
    } else {
      rw = rw
        .on('title', { element(el) { el.prepend(prefix); } })
        .on('meta[property="og:title"]', {
          element(el) { el.setAttribute('content', prefix + (el.getAttribute('content') || '')); },
        });
    }
    return rw.transform(res);
  },
};

const DOW = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const pad = (n) => String(n).padStart(2, '0');

// Tiêu đề / mô tả / ảnh xem trước, ghép từ config.js (share.* để trống thì tự ghép).
function shareInfo(cfg, url, guest) {
  const groom = cfg.groom || {}, bride = cfg.bride || {}, share = cfg.share || {};
  const events = Array.isArray(cfg.events) ? cfg.events.filter(Boolean) : [];
  const main = events.find((e) => e.main) || events[events.length - 1] || {};
  const couple = [tidy(groom.name), tidy(bride.name)].filter(Boolean).join(' & ');
  const title = tidy(share.title) || `Thiệp mời cưới · ${couple}`;

  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(cfg.date || main.time || '');
  const when = m ? `${DOW[new Date(Date.UTC(+m[1], m[2] - 1, +m[3])).getUTCDay()]}, ${pad(m[3])}.${pad(m[2])}.${m[1]}` : '';
  const head = [when, tidy(main.place)].filter(Boolean).join(' · ');
  const invite = `Trân trọng kính mời ${guest || 'bạn'} tới chung vui cùng gia đình chúng tôi.`;
  const description = tidy(share.description) || (head ? `${head}. ${invite}` : invite);

  let image = String(share.image || cfg.cover || '');
  if (image) {
    const u = new URL(image, url);
    if (u.hostname === 'images.unsplash.com') {
      u.searchParams.set('w', '1200');
      u.searchParams.set('h', '630');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('q', '80');
    }
    image = u.href;
  }
  return { title, description, image };
}

// Đọc object trong config.js (chú thích //, /* */, nháy đơn, dấu phẩy cuối...) mà không dùng eval
// (Cloudflare Worker không cho phép eval).
function parseConfig(src) {
  let i = src.indexOf('{', src.indexOf('WEDDING'));
  if (i < 0) throw new Error('config.js: không thấy window.WEDDING');
  const fail = () => { throw new Error('config.js: lỗi cú pháp ở ký tự thứ ' + i); };
  const skip = () => {
    for (;;) {
      while (i < src.length && /\s/.test(src[i])) i++;
      if (src.startsWith('//', i)) {
        const n = src.indexOf('\n', i);
        i = n < 0 ? src.length : n + 1;
      } else if (src.startsWith('/*', i)) {
        const n = src.indexOf('*/', i + 2);
        i = n < 0 ? src.length : n + 2;
      } else return;
    }
  };
  const string = () => {
    const q = src[i++];
    let out = '';
    while (i < src.length && src[i] !== q) {
      if (src[i] === '\\') {
        const c = src[i + 1];
        out += c === 'n' ? '\n' : c === 't' ? '\t' : c;
        i += 2;
      } else out += src[i++];
    }
    if (i >= src.length) fail();
    i++;
    return out;
  };
  const value = () => {
    skip();
    const c = src[i];
    if (c === '{') {
      i++;
      const obj = {};
      for (;;) {
        skip();
        if (src[i] === '}') { i++; return obj; }
        let key;
        if (src[i] === "'" || src[i] === '"') key = string();
        else {
          const k = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, i + 100));
          if (!k) fail();
          key = k[0];
          i += key.length;
        }
        skip();
        if (src[i] !== ':') fail();
        i++;
        obj[key] = value();
        skip();
        if (src[i] === ',') i++;
        else if (src[i] !== '}') fail();
      }
    }
    if (c === '[') {
      i++;
      const arr = [];
      for (;;) {
        skip();
        if (src[i] === ']') { i++; return arr; }
        arr.push(value());
        skip();
        if (src[i] === ',') i++;
        else if (src[i] !== ']') fail();
      }
    }
    if (c === "'" || c === '"' || c === '`') return string();
    const lit = /^(true|false|null|-?\d+(?:\.\d+)?)/.exec(src.slice(i, i + 40));
    if (!lit) fail();
    i += lit[0].length;
    return lit[0] === 'true' ? true : lit[0] === 'false' ? false : lit[0] === 'null' ? null : Number(lit[0]);
  };
  return value();
}

async function partial(res, header) {
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '')) return new Response(buf, { status: 200, headers: res.headers });
  const start = m[1] === '' ? Math.max(0, size - Number(m[2])) : Number(m[1]);
  const end = m[1] === '' || m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  if (start >= size || end < start) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  const headers = new Headers(res.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(buf.slice(start, end + 1), { status: 206, headers });
}

// Tên khách lấy từ link: ai cũng sửa được nên lọc chặt.
function clean(s, max = 60) {
  return String(s || '').replace(/[\u0000-\u001f<>"'&{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

// Chữ lấy từ config.js (của chủ nhà): chỉ bỏ ký tự làm hỏng HTML.
function tidy(s) {
  return String(s || '').replace(/[\u0000-\u001f<>"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 300);
}
