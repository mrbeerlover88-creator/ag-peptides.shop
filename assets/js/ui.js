/* ============================================================
   UI-слой: иконки, иллюстрации, тосты, модалки, анимации
   ============================================================ */

/* ---------- Иконки ---------- */
const ICONS = {
  grid:    '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
  flame:   '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  heart:   '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  spark:   '<path d="m12 3-1.9 5.8L4 10.5l6.1 1.7L12 18l1.9-5.8L20 10.5l-6.1-1.7Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
  bolt:    '<path d="M13 2 3 14h9l-1 8 10-12h-9Z"/>',
  brain:   '<path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>',
  drop:    '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12.5 4 12 2c-.5 2-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7Z"/>',
  cart:    '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  user:    '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  search:  '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  x:       '<path d="M18 6 6 18M6 6l12 12"/>',
  check:   '<path d="M20 6 9 17l-5-5"/>',
  plus:    '<path d="M12 5v14M5 12h14"/>',
  minus:   '<path d="M5 12h14"/>',
  trash:   '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  chev:    '<path d="m6 9 6 6 6-6"/>',
  arrow:   '<path d="M5 12h14M12 5l7 7-7 7"/>',
  up:      '<path d="m18 15-6-6-6 6"/>',
  star:    '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  shield:  '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
  truck:   '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  lab:     '<path d="M9 3h6M10 3v6.5L4.6 18.6A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.4L14 9.5V3"/><path d="M6.5 15h11"/>',
  doc:     '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5M9 13h6M9 17h6"/>',
  box:     '<path d="m21 8-9-5-9 5v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  tg:      '<path d="M21.9 4.3 18.7 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9L18 5.6c.4-.3-.1-.5-.6-.2L7 12l-4.6-1.4c-1-.3-1-1 .2-1.5l18-6.9c.8-.3 1.6.2 1.3 2.1z"/>',
  snow:    '<path d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5 4.9 17.5"/>',
  clock:   '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  qr:      '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z"/><path d="M14 14h3v3h-3zM20 14h1M14 20h1M20 17v4h-3"/>',
  card:    '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  sber:    '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  tbank:   '<path d="M4 5h16v4l-6 2v8h-4v-8L4 9Z"/>',
  yoo:     '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M9 10l3 3 3-3"/>',
  split:   '<rect x="2" y="7" width="8" height="10" rx="2"/><rect x="14" y="7" width="8" height="10" rx="2"/><path d="M10 12h4"/>',
  crypto:  '<circle cx="12" cy="12" r="9"/><path d="M9 8h4.5a2.5 2.5 0 0 1 0 5H9zM9 13h5a2.5 2.5 0 0 1 0 5H9zM10 6v2M10 18v2M14 6v2M14 18v2"/>',
  cash:    '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  dash:    '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  bag:     '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  gift:    '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  pin:     '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  gear:    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.35.4.65.73.85.3.18.65.28 1 .28H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
  out:     '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  moon:    '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  menu:    '<path d="M4 6h16M4 12h16M4 18h16"/>',
  home:    '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
  info:    '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  warn:    '<path d="M10.3 3.2 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.2a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  pen:     '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  chart:   '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  users:   '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  tag:     '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.6 8.6a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8Z"/><circle cx="7" cy="7" r="1.2"/>',
  copy:    '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  mail:    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  phone:   '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  filter:  '<path d="M3 4h18l-7 8v7l-4 2v-9Z"/>',
  repeat:  '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  lock:    '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  eye:     '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'
};
const ic = (n, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg>`;

/* ---------- Иллюстрации товаров ---------- */
const CAT_HUE = { weight:'#16A46A', recovery:'#4C9AE2', skin:'#D9B44A', energy:'#E2574C', cognitive:'#9B6BE2', libido:'#E24C8F', solvent:'#5BC7C7' };

/* Путь к фото: в однофайловой сборке картинки лежат в IMG_DATA как data:URI */
function imgSrc(file) {
  return (typeof IMG_DATA !== 'undefined' && IMG_DATA[file]) || 'assets/img/' + file;
}

/* Превью сертификата: в однофайловой сборке лежит в COA_SHOTS как data:URI */
function coaShot(file) {
  return (typeof COA_SHOTS !== 'undefined' && COA_SHOTS[file]) || 'assets/coa/preview/' + file + '.jpg';
}

/* Реальное фото товара; при отсутствии файла — генерируемый SVG-дублёр */
function productArt(p, cls = 'art') {
  if (p && p.img) {
    const alt = esc((p.name + ' ' + (p.dose || '')).trim());
    return `<img class="${cls} photo" src="${imgSrc(p.img)}" alt="${alt}"
      width="760" height="760" loading="lazy" decoding="async"
      onerror="photoFallback(this,'${p.id}')">`;
  }
  return productArtSvg(p, cls);
}
function photoFallback(img, id) {
  const p = (typeof PRODUCTS !== 'undefined' && PRODUCTS.find(x => x.id === id)) || { id, form: 'vial', cat: 'weight' };
  img.outerHTML = productArtSvg(p, img.className.replace(/\bphoto\b/, '').trim() || 'art');
}

function productArtSvg(p, cls = 'art') {
  const c = CAT_HUE[p.cat] || '#12A05F';
  const light = document.documentElement.getAttribute('data-theme') !== 'dark';
  const glass = light ? '#FFFFFF' : '#E9F1EC';          // блик стекла
  const ink   = light ? '#B7C8BE' : '#0B1310';          // тень стекла
  const line  = light ? '#7E9689' : '#050A08';          // печать на этикетке
  const cap   = light ? '#C6D4CC' : '#9DB3A8';          // алюминиевый колпачок
  const uid = 'g' + p.id.replace(/[^a-z0-9]/gi, '');

  if (p.form === 'pen') {
    return `<svg class="${cls}" viewBox="0 0 120 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${uid}a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${glass}"/><stop offset=".5" stop-color="${c}" stop-opacity=".28"/><stop offset="1" stop-color="${ink}" stop-opacity=".55"/>
        </linearGradient>
        <linearGradient id="${uid}b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".28" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="${ink}" stop-opacity=".16"/>
        </linearGradient>
      </defs>
      <rect x="34" y="10" width="52" height="42" rx="14" fill="${c}" opacity=".85"/>
      <rect x="42" y="18" width="36" height="10" rx="5" fill="#fff" opacity=".7"/>
      <rect x="30" y="50" width="60" height="128" rx="18" fill="url(#${uid}a)"/>
      <rect x="30" y="50" width="60" height="128" rx="18" fill="url(#${uid}b)"/>
      <rect x="44" y="66" width="32" height="96" rx="10" fill="${glass}" opacity=".85"/>
      <rect x="48" y="70" width="24" height="60" rx="7" fill="${c}" opacity=".55"/>
      <g opacity=".9">
        <rect x="36" y="186" width="48" height="34" rx="10" fill="${c}" opacity=".16"/>
        <rect x="42" y="194" width="36" height="4" rx="2" fill="${line}" opacity=".55"/>
        <rect x="42" y="203" width="26" height="4" rx="2" fill="${line}" opacity=".32"/>
        <rect x="42" y="212" width="30" height="4" rx="2" fill="${line}" opacity=".32"/>
      </g>
      <rect x="52" y="220" width="16" height="26" rx="5" fill="${cap}"/>
      <rect x="57" y="240" width="6" height="14" rx="3" fill="${cap}" opacity=".7"/>
    </svg>`;
  }

  if (p.form === 'water') {
    return `<svg class="${cls}" viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${uid}w" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${glass}"/><stop offset="1" stop-color="${c}" stop-opacity=".3"/></linearGradient></defs>
      <rect x="40" y="8" width="40" height="18" rx="6" fill="${cap}"/>
      <rect x="46" y="24" width="28" height="12" rx="4" fill="${c}" opacity=".8"/>
      <path d="M30 40h60v128a16 16 0 0 1-16 16H46a16 16 0 0 1-16-16V40Z" fill="url(#${uid}w)"/>
      <path d="M34 96h52v72a12 12 0 0 1-12 12H46a12 12 0 0 1-12-12V96Z" fill="${c}" opacity=".24"/>
      <rect x="42" y="112" width="36" height="3.5" rx="2" fill="${line}" opacity=".5"/>
      <rect x="42" y="122" width="24" height="3.5" rx="2" fill="${line}" opacity=".3"/>
      <ellipse cx="46" cy="70" rx="5" ry="16" fill="#fff" opacity=".75"/>
    </svg>`;
  }

  return `<svg class="${cls}" viewBox="0 0 120 210" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${uid}v" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${glass}"/><stop offset=".55" stop-color="${c}" stop-opacity=".22"/><stop offset="1" stop-color="${ink}" stop-opacity=".5"/>
      </linearGradient>
      <radialGradient id="${uid}p"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="${c}"/></radialGradient>
    </defs>
    <rect x="42" y="6" width="36" height="16" rx="5" fill="${c}" opacity=".85"/>
    <rect x="38" y="20" width="44" height="14" rx="4" fill="${cap}"/>
    <rect x="46" y="24" width="28" height="6" rx="3" fill="#fff" opacity=".6"/>
    <path d="M32 34h56v148a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V34Z" fill="url(#${uid}v)"/>
    <path d="M36 122h48v60a12 12 0 0 1-12 12H48a12 12 0 0 1-12-12v-60Z" fill="url(#${uid}p)" opacity=".45"/>
    <ellipse cx="60" cy="124" rx="24" ry="7" fill="#fff" opacity=".6"/>
    <rect x="42" y="146" width="36" height="3.5" rx="2" fill="${line}" opacity=".45"/>
    <rect x="42" y="156" width="26" height="3.5" rx="2" fill="${line}" opacity=".28"/>
    <rect x="42" y="166" width="30" height="3.5" rx="2" fill="${line}" opacity=".28"/>
    <ellipse cx="46" cy="66" rx="5" ry="20" fill="#fff" opacity=".7"/>
  </svg>`;
}

/* ---------- Утилиты ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';
const plural = (n, a, b, c) => { const m = n % 100, d = n % 10;
  return n + ' ' + (m > 4 && m < 21 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c); };
const esc = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const stars = r => `<span class="stars">${Array.from({length:5},(_,i)=>ic('star')).join('')}</span>`;
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toLocaleDateString('ru-RU');

/* ---------- Тосты ---------- */
function toast(title, sub = '', type = 'ok') {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<div class="toast-ic">${ic(type === 'ok' ? 'check' : type === 'err' ? 'warn' : 'info')}</div>
    <div><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 3600);
}

/* ---------- Лайтбокс фотографии ---------- */
function lightbox(src, alt = '') {
  let box = $('#lightbox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'lightbox'; box.className = 'lightbox';
    box.addEventListener('click', closeLightbox);
    document.body.appendChild(box);
  }
  box.innerHTML = `<img src="${src}" alt="${esc(alt)}">`;
  requestAnimationFrame(() => box.classList.add('open'));
  document.body.classList.add('no-scroll');
}
function closeLightbox() {
  const box = $('#lightbox');
  if (!box || !box.classList.contains('open')) return;
  box.classList.remove('open');
  if (!$('#modal-overlay').classList.contains('open') && !$('#cart-drawer').classList.contains('open'))
    document.body.classList.remove('no-scroll');
}

/* ---------- Модалка ---------- */
function modal(html, opts = {}) {
  const ov = $('#modal-overlay');
  ov.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" style="position:relative">
      <button class="icon-btn modal-x" data-close>${ic('x')}</button>${html}</div>`;
  ov.classList.add('open');
  document.body.classList.add('no-scroll');
  ov.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModal);
  return ov;
}
function closeModal() {
  $('#modal-overlay').classList.remove('open');
  if (!$('#cart-drawer').classList.contains('open')) document.body.classList.remove('no-scroll');
  setTimeout(() => { if (!$('#modal-overlay').classList.contains('open')) $('#modal-overlay').innerHTML = ''; }, 350);
}

/* ---------- Reveal при скролле ---------- */
const revealIO = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
}, { threshold: .12, rootMargin: '0px 0px -60px' });
const bindReveal = root => $$('.reveal:not(.in)', root || document).forEach(el => {
  // всё, что уже в зоне первого экрана, показываем сразу — без ожидания скролла
  if (el.getBoundingClientRect().top < innerHeight * 1.05) { el.classList.add('in'); return; }
  revealIO.observe(el);
});
addEventListener('resize', () => bindReveal(), { passive: true });

/* ---------- Счётчик чисел ---------- */
function countUp(el, to, suffix = '') {
  const dur = 1100, t0 = performance.now();
  const fin = () => { el.textContent = new Intl.NumberFormat('ru-RU').format(to) + suffix; };
  const step = t => {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = new Intl.NumberFormat('ru-RU').format(Math.round(to * (1 - Math.pow(1 - k, 3)))) + suffix;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  // страховка: если rAF придушен (вкладка в фоне) — доводим значение до конечного
  setTimeout(fin, dur + 120);
}

/* ---------- Ripple ---------- */
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('.btn');
  if (!b) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
  const d = document.createElement('span');
  d.className = 'ripple';
  d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s/2}px;top:${e.clientY - r.top - s/2}px`;
  b.appendChild(d);
  setTimeout(() => d.remove(), 640);
});
