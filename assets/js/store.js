/* ============================================================
   Store: состояние, корзина, авторизация, заказы, промокоды
   Хранилище — localStorage (демо-режим без бэкенда)
   ============================================================ */

const KEY = 'agp:v1';

const DEFAULT_STATE = {
  cart: [],          // [{id, q}]
  favs: [],          // [id]
  user: null,        // {id,name,email,phone,pass,bonus,addresses[],createdAt}
  users: [],
  orders: [],
  promo: null,
  theme: 'light',
  ageOk: false,
  overrides: {},     // правки товаров из админки: {id:{price,stock,...}}
  viewed: []
};

const S = load();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...structuredClone(DEFAULT_STATE), ...raw };
  } catch { return structuredClone(DEFAULT_STATE); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }

/* ---------- Товары с учётом правок админки ---------- */
function allProducts() {
  return PRODUCTS.map(p => ({ ...p, ...(S.overrides[p.id] || {}) }))
                 .filter(p => !p.deleted);
}
function getProduct(id) { return allProducts().find(p => p.id === id); }
function perMg(p) {
  const mg = parseFloat(p.dose);
  return p.form === 'water' || !mg ? null : Math.round(p.price / mg);
}

/* ---------- Корзина ---------- */
function cartAdd(id, q = 1) {
  const p = getProduct(id); if (!p) return;
  const line = S.cart.find(l => l.id === id);
  const have = line ? line.q : 0;
  if (have + q > p.stock) { toast('Больше нет в наличии', `Доступно ${p.stock} шт.`, 'err'); return false; }
  if (line) line.q += q; else S.cart.push({ id, q });
  save(); syncCart();
  return true;
}
function cartSet(id, q) {
  const p = getProduct(id);
  const line = S.cart.find(l => l.id === id); if (!line) return;
  if (q <= 0) return cartDel(id);
  line.q = Math.min(q, p ? p.stock : q);
  save(); syncCart();
}
function cartDel(id) { S.cart = S.cart.filter(l => l.id !== id); save(); syncCart(); }
function cartClear() { S.cart = []; S.promo = null; save(); syncCart(); }
function cartCount() { return S.cart.reduce((s, l) => s + l.q, 0); }
function cartLines() {
  return S.cart.map(l => { const p = getProduct(l.id); return p ? { ...p, q: l.q, sum: p.price * l.q } : null; })
               .filter(Boolean);
}

/* Итоги: подытог, скидка промокода, бонусы, доставка */
function totals(shipId) {
  const lines = cartLines();
  const sub = lines.reduce((s, l) => s + l.sum, 0);
  const market = lines.reduce((s, l) => s + (l.marketRu || l.price) * l.q, 0);

  let disc = 0, freeShip = false;
  const pr = S.promo && PROMOS[S.promo];
  if (pr) {
    if (pr.type === 'percent') disc = Math.round(sub * pr.value / 100);
    if (pr.type === 'fixed' && sub >= (pr.min || 0)) disc = pr.value;
    if (pr.type === 'ship') freeShip = true;
  }
  const ship = SHIPPING.find(s => s.id === shipId);
  let shipCost = 0;
  if (ship) shipCost = (freeShip || (ship.free && sub - disc >= ship.free)) ? 0 : ship.price;

  const total = Math.max(0, sub - disc) + shipCost;
  return { lines, sub, disc, shipCost, total, market, saved: Math.max(0, market - sub), cashback: Math.round(total * 0.05) };
}

function applyPromo(code) {
  const c = String(code || '').trim().toUpperCase();
  if (!PROMOS[c]) { toast('Промокод не найден', 'Проверьте написание', 'err'); return false; }
  S.promo = c; save();
  toast('Промокод применён', PROMOS[c].desc);
  return true;
}

/* ---------- Избранное ---------- */
function favToggle(id) {
  const i = S.favs.indexOf(id);
  if (i > -1) { S.favs.splice(i, 1); toast('Убрано из избранного', '', 'info'); }
  else { S.favs.push(id); toast('Добавлено в избранное'); }
  save(); syncFavs();
  return S.favs.includes(id);
}
const isFav = id => S.favs.includes(id);

/* ---------- Пользователи ---------- */
function hash(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return String(h); }

function register({ name, email, phone, pass }) {
  email = String(email).trim().toLowerCase();
  if (S.users.some(u => u.email === email)) { toast('Такой e-mail уже зарегистрирован', 'Войдите в аккаунт', 'err'); return false; }
  const u = { id: uid(), name, email, phone, pass: hash(pass), bonus: 500, addresses: [], createdAt: Date.now(), role: 'client' };
  S.users.push(u); S.user = { ...u }; save();
  toast('Аккаунт создан', 'Начислено 500 приветственных бонусов 🎁');
  return true;
}
function login(email, pass) {
  email = String(email).trim().toLowerCase();
  const u = S.users.find(x => x.email === email && x.pass === hash(pass));
  if (!u) { toast('Неверный e-mail или пароль', '', 'err'); return false; }
  S.user = { ...u }; save(); toast(`С возвращением, ${u.name.split(' ')[0]}!`); return true;
}
function logout() { S.user = null; save(); toast('Вы вышли из аккаунта', '', 'info'); location.hash = '#/'; }
const isAdmin = () => S.user && S.user.role === 'admin';

function syncUser() {
  if (!S.user || S.user.role === 'admin') return;
  const i = S.users.findIndex(u => u.id === S.user.id);
  if (i > -1) S.users[i] = { ...S.users[i], ...S.user };
  save();
}

/* ---------- Заказы ---------- */
const ORDER_FLOW = [
  { id: 'new',  name: 'Оформлен' },
  { id: 'paid', name: 'Оплачен' },
  { id: 'pack', name: 'Собран' },
  { id: 'ship', name: 'В пути' },
  { id: 'done', name: 'Получен' }
];

function createOrder(data) {
  const t = totals(data.shipId);
  const order = {
    id: 'AG-' + String(Date.now()).slice(-6),
    createdAt: Date.now(),
    userId: S.user ? S.user.id : null,
    contact: data.contact,
    shipId: data.shipId,
    shipName: (SHIPPING.find(s => s.id === data.shipId) || {}).name,
    address: data.address,
    payId: data.payId,
    payName: (PAYMENTS.find(p => p.id === data.payId) || {}).name,
    promo: S.promo,
    items: t.lines.map(l => ({ id: l.id, name: `${l.name} ${l.dose}`, price: l.price, q: l.q, form: l.form, cat: l.cat, coa: l.coa })),
    sub: t.sub, disc: t.disc, ship: t.shipCost, total: t.total, cashback: t.cashback,
    status: 'paid',
    track: 'RU' + Math.floor(1e8 + Math.random() * 9e8) + 'AG',
    comment: data.comment || ''
  };
  // списываем остатки
  order.items.forEach(it => {
    const cur = getProduct(it.id);
    if (cur) S.overrides[it.id] = { ...(S.overrides[it.id] || {}), stock: Math.max(0, cur.stock - it.q) };
  });
  S.orders.unshift(order);
  if (S.user && S.user.role !== 'admin') { S.user.bonus = (S.user.bonus || 0) + order.cashback; syncUser(); }
  cartClear(); save();
  return order;
}
const myOrders = () => S.user ? S.orders.filter(o => o.userId === S.user.id) : [];

/* ---------- Тема ---------- */
function setTheme(t) {
  S.theme = t; save();
  document.documentElement.setAttribute('data-theme', t);
  const b = $('#theme-btn'); if (b) b.innerHTML = ic(t === 'dark' ? 'sun' : 'moon');
}
function toggleTheme() { setTheme(S.theme === 'dark' ? 'light' : 'dark'); if (typeof route === 'function') route(); }

/* ---------- Синхронизация индикаторов ---------- */
function syncCart() {
  const n = cartCount();
  $$('.cart-count').forEach(el => {
    el.textContent = n;
    el.classList.toggle('show', n > 0);
    el.classList.remove('bump'); void el.offsetWidth; if (n > 0) el.classList.add('bump');
  });
  if ($('#cart-drawer').classList.contains('open')) renderDrawer();
  if (location.hash.startsWith('#/cart')) route();
}
function syncFavs() {
  const n = S.favs.length;
  $$('.fav-count').forEach(el => { el.textContent = n; el.classList.toggle('show', n > 0); });
  $$('.fav[data-fav]').forEach(b => b.classList.toggle('on', isFav(b.dataset.fav)));
  if (location.hash.startsWith('#/account/favs')) route();
}

/* The public demo intentionally starts with no pre-created customer data. */
function seedDemo() {}
