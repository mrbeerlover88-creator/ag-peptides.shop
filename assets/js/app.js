/* ============================================================
   Роутер, обработчики событий, инициализация
   ============================================================ */

/* ---------- Роутер ---------- */
function route() {
  const h = location.hash.replace(/^#/, '') || '/';
  const [, seg1, seg2] = h.split('/');
  const app = $('#app');
  let html = '';

  if (!seg1 || seg1 === '')      html = viewHome();
  else if (seg1 === 'catalog')   html = viewCatalog();
  else if (seg1 === 'p')         html = viewProduct(seg2);
  else if (seg1 === 'cart')      html = viewCart();
  else if (seg1 === 'checkout')  html = viewCheckout();
  else if (seg1 === 'account')   html = viewAccount(seg2 || 'home');
  else if (seg1 === 'admin')     html = viewAdmin(seg2 || 'dash');
  else if (seg1 === 'ok')        html = viewSuccess(seg2);
  else html = viewHome();

  app.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  bindReveal(app);
  bindPage();
  markNav(seg1 || '');
}

function markNav(seg) {
  $$('.menu a, .mbar a').forEach(a => {
    const t = (a.getAttribute('href') || '').replace('#/', '').split('/')[0];
    a.classList.toggle('on', t === seg || (t === '' && seg === ''));
  });
}

/* ---------- Экран успеха ---------- */
function viewSuccess(id) {
  const o = S.orders.find(x => x.id === id) || S.orders[0];
  if (!o) { location.hash = '#/'; return ''; }
  return `<div class="view wrap sec" style="max-width:640px">
    <div class="panel" style="text-align:center">
      <div class="ok-mark">${ic('check')}</div>
      <h2 style="font-size:1.8rem;margin-bottom:10px">Заказ оформлен</h2>
      <p class="muted" style="margin-bottom:24px">Номер заказа <b style="color:var(--text)">№ ${o.id}</b>. Подтверждение отправили на ${esc(o.contact.email || 'вашу почту')}.</p>
      <div class="kpis" style="text-align:left">
        <div class="kpi"><span>К оплате</span><b>${rub(o.total)}</b></div>
        <div class="kpi"><span>Трек-номер</span><b style="font-size:15px;font-family:ui-monospace,monospace">${o.track}</b></div>
        <div class="kpi"><span>Бонусов начислено</span><b style="color:var(--brand)">+${o.cashback}</b></div>
      </div>
      <div class="note brand" style="margin:20px 0;text-align:left">${ic('snow')}
        <span>Собираем заказ сегодня. Пептиды поедут в термоконтейнере с хладоэлементами — статус можно отслеживать в личном кабинете.</span></div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a href="#/account/orders" class="btn btn-p">${ic('bag')} Мои заказы</a>
        <a href="#/catalog" class="btn btn-g">В каталог</a>
      </div>
    </div>
  </div>`;
}

/* ---------- Обработчики страницы ---------- */
function bindPage() {
  const app = $('#app');

  /* счётчики в hero */
  $$('[data-count]', app).forEach(el => {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { countUp(el, +el.dataset.count, el.dataset.suffix || ''); io.disconnect(); }
    }), { threshold: .4 });
    io.observe(el);
  });

  /* FAQ */
  $$('.acc-q', app).forEach(b => b.onclick = () => {
    const it = b.closest('.acc-item'), was = it.classList.contains('open');
    $$('.acc-item', app).forEach(x => x.classList.remove('open'));
    if (!was) it.classList.add('open');
  });

  /* каталог */
  const q = $('#q', app);
  if (q) {
    let t;
    q.oninput = () => { clearTimeout(t); t = setTimeout(() => { F.q = q.value.trim(); refreshGrid(); }, 220); };
    $('#qclr').onclick = () => { q.value = ''; F.q = ''; refreshGrid(); q.focus(); };
  }
  const sortSel = $('#sort', app); if (sortSel) sortSel.onchange = () => { F.sort = sortSel.value; refreshGrid(); };
  const formSel = $('#form', app); if (formSel) formSel.onchange = () => { F.form = formSel.value; refreshGrid(); };
  $$('[data-cat]', app).forEach(b => b.onclick = () => {
    F.cat = b.dataset.cat;
    $$('[data-cat]', app).forEach(x => x.classList.toggle('on', x === b));
    refreshGrid();
  });
  const rst = $('#reset', app); if (rst) rst.onclick = () => { F.cat = 'all'; F.q = ''; F.form = 'all'; route(); };

  /* карточка товара — количество и табы */
  let pq = 1;
  $$('[data-pq]', app).forEach(b => b.onclick = () => {
    pq = Math.max(1, pq + (b.dataset.pq === '+' ? 1 : -1));
    $('#pq').textContent = pq;
  });
  const addq = $('[data-addq]', app);
  if (addq) addq.onclick = () => { if (cartAdd(addq.dataset.addq, pq)) { toast('Добавлено в корзину', plural(pq, 'штука', 'штуки', 'штук')); openDrawer(); } };
  const buy = $('[data-buy]', app);
  if (buy) buy.onclick = () => { if (cartAdd(buy.dataset.buy, pq)) location.hash = '#/checkout'; };
  $$('.pdp-tab', app).forEach(b => b.onclick = () => {
    $$('.pdp-tab', app).forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    const p = getProduct(location.hash.split('/')[2]);
    $('#tab-body').innerHTML = { about: tabAbout, coa: tabCoa, ship: tabShip }[b.dataset.tab](p);
  });

  /* корзина-страница */
  const cc = $('#clear-cart', app);
  if (cc) cc.onclick = () => modal(`<div class="modal-head"><h3>Очистить корзину?</h3><p>Все добавленные товары будут удалены.</p></div>
    <div style="display:flex;gap:10px"><button class="btn btn-g" style="flex:1" data-close>Отмена</button>
    <button class="btn btn-d" style="flex:1" id="yes-clear">Очистить</button></div>`)
    .querySelector('#yes-clear').onclick = () => { cartClear(); closeModal(); toast('Корзина очищена', '', 'info'); route(); };

  /* промокод */
  const pgo = $('#promo-go', app);
  if (pgo) pgo.onclick = () => { if (applyPromo($('#promo').value)) route(); };
  const ph = $('.promo-hint', app);
  if (ph) ph.onclick = () => { $('#promo').value = 'WELCOME10'; applyPromo('WELCOME10'); route(); };

  /* оформление */
  bindCheckout(app);
  /* кабинет + админка */
  bindAccount(app);
  bindAdmin(app);
}

function refreshGrid() {
  const g = $('#grid'); if (!g) return;
  const list = filtered();
  g.style.opacity = '.35';
  setTimeout(() => {
    g.innerHTML = list.length ? list.map(productCard).join('')
      : `<div class="empty">${ic('search')}<h3>Ничего не найдено</h3>
         <p class="muted" style="margin-top:8px">Попробуйте изменить запрос или сбросить фильтры</p>
         <button class="btn btn-o btn-sm" id="reset" style="margin-top:18px">Сбросить фильтры</button></div>`;
    g.style.opacity = '1';
    $$('.pcard', g).forEach(c => c.classList.add('in'));
    const p = g.previousElementSibling;
    if (p && p.tagName === 'P') p.textContent = plural(list.length, 'товар', 'товара', 'товаров');
    const r = $('#reset', g); if (r) r.onclick = () => { F.cat = 'all'; F.q = ''; F.form = 'all'; route(); };
  }, 140);
}

/* ---------- Оформление заказа ---------- */
function bindCheckout(app) {
  const next = $('#ch-next', app), back = $('#ch-back', app), pay = $('#ch-pay', app);
  $$('[data-ship]', app).forEach(l => l.onclick = () => { CH.shipId = l.dataset.ship; route(); });
  $$('[data-pay]', app).forEach(l => l.onclick = () => { CH.payId = l.dataset.pay; route(); });
  if (back) back.onclick = () => { CH.step--; route(); };

  if (next) next.onclick = () => {
    if (CH.step === 1) {
      const n = $('#c-name'), p = $('#c-phone'), e = $('#c-email');
      let ok = true;
      const chk = (el, c) => { el.classList.toggle('bad', !c); if (!c) ok = false; };
      chk(n, n.value.trim().length >= 2);
      chk(p, p.value.replace(/\D/g, '').length >= 10);
      chk(e, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(e.value.trim()));
      if (!$('#c-agree').checked) { toast('Нужно подтвердить условия', 'Отметьте галочку 18+', 'err'); ok = false; }
      if (!ok) return;
      CH.contact = { name: n.value.trim(), phone: p.value.trim(), email: e.value.trim(), tg: $('#c-tg').value.trim() };
    }
    if (CH.step === 2) {
      const a = $('#c-addr');
      const need = CH.shipId !== 'pickup';
      if (need && a.value.trim().length < 8) { a.classList.add('bad'); return; }
      CH.address = a.value.trim();
      CH.comment = $('#c-comment').value.trim();
    }
    CH.step++;
    route();
  };

  if (pay) pay.onclick = () => payFlow();
}

function payFlow() {
  const t = totals(CH.shipId);
  const m = PAYMENTS.find(p => p.id === CH.payId);
  let inner = '';

  if (CH.payId === 'sbp') {
    inner = `<div class="qr-box">${qrSvg()}</div>
      <p style="text-align:center" class="muted">Откройте приложение своего банка, отсканируйте QR-код и подтвердите платёж на <b style="color:var(--text)">${rub(t.total)}</b>.</p>`;
  } else if (CH.payId === 'crypto') {
    inner = `<div class="field"><label>Сеть</label><input class="inp" value="USDT · TRC-20" readonly></div>
      <div class="field"><label>Адрес для перевода</label>
        <div style="display:flex;gap:8px"><input class="inp" id="crypto-addr" value="TXk9Demo4AGPeptides7Wallet2Address6" readonly>
        <button class="btn btn-g btn-sm" data-copy="TXk9Demo4AGPeptides7Wallet2Address6">${ic('copy')}</button></div></div>
      <div class="note brand">${ic('gift')}<span>При оплате криптовалютой действует скидка 3% — она уже учтена менеджером при выставлении суммы.</span></div>`;
  } else if (CH.payId === 'invoice') {
    inner = `<div class="field"><label>ИНН организации</label><input class="inp" placeholder="10 или 12 цифр"></div>
      <div class="field"><label>E-mail для счёта</label><input class="inp" value="${esc(CH.contact.email || '')}"></div>
      <div class="note">${ic('doc')}<span>Счёт и договор придут в течение часа в рабочее время. Отгрузка — после поступления средств, закрывающие документы по ЭДО.</span></div>`;
  } else if (CH.payId === 'cash') {
    inner = `<div class="note brand">${ic('cash')}<span>Курьер привезёт заказ и терминал. Можно оплатить наличными или картой при получении — после осмотра посылки.</span></div>`;
  } else if (CH.payId === 'dolyami') {
    inner = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
        ${[0,1,2,3].map(i=>`<div class="kpi" style="text-align:center;padding:14px 8px">
          <span>${i===0?'сегодня':'через '+(i*2)+' нед.'}</span><b style="font-size:16px">${rub(t.total/4)}</b></div>`).join('')}
      </div>
      <div class="note brand">${ic('split')}<span>Четыре равных платежа без процентов и переплат. Первый — сейчас, остальные списываются автоматически каждые две недели.</span></div>`;
  } else {
    inner = `<div style="text-align:center;padding:10px 0 4px">
        <div class="spin"></div>
        <p class="muted" style="margin-top:18px">Перенаправляем на защищённую страницу<br><b style="color:var(--text)">${esc(m.name)}</b></p>
        <p class="dim" style="font-size:12.5px;margin-top:12px">Реквизиты вводятся на стороне банка по стандарту PCI DSS. Магазин их не получает.</p>
      </div>`;
  }

  modal(`<div class="modal-head"><h3>${esc(m.name)}</h3><p>Заказ на сумму ${rub(t.total)}</p></div>
    ${inner}
    <button class="btn btn-p btn-block" id="pay-go" style="margin-top:18px">${ic('lock')} Подтвердить оплату</button>
    <p class="dim" style="text-align:center;font-size:11.5px;margin-top:12px">Демонстрационный режим: реальное списание средств не производится</p>`);

  $$('[data-copy]').forEach(b => b.onclick = () => { navigator.clipboard?.writeText(b.dataset.copy); toast('Скопировано'); });
  $('#pay-go').onclick = () => {
    const box = $('#modal-overlay .modal');
    box.innerHTML = `<div style="text-align:center;padding:34px 0"><div class="spin"></div>
      <p class="muted" style="margin-top:20px">Проводим платёж…</p></div>`;
    setTimeout(() => {
      const o = createOrder({ contact: CH.contact, shipId: CH.shipId, address: CH.address, payId: CH.payId, comment: CH.comment });
      closeModal();
      CH.step = 1;
      toast('Оплата прошла успешно', `Заказ № ${o.id}`);
      location.hash = '#/ok/' + o.id;
    }, 1500);
  };
}

/* простой декоративный QR */
function qrSvg() {
  let r = 7;
  const rnd = () => (r = (r * 1103515245 + 12345) % 2147483648) / 2147483648;
  let cells = '';
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const fin = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    const on = fin ? ((x % 6 === 0 || y % 6 === 0) || (x > 1 && x < 5 && y > 1 && y < 5)) : rnd() > .52;
    if (on) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  return `<svg viewBox="0 0 21 21" width="100%" height="100%" fill="#0B1310">${cells}</svg>`;
}

/* ---------- Кабинет ---------- */
function bindAccount(app) {
  const lo = $('#logout', app);
  if (lo) lo.onclick = e => { e.preventDefault(); logout(); };

  $$('.ord-top', app).forEach(t => t.onclick = () => t.closest('.ord').classList.toggle('open'));

  $$('[data-repeat]', app).forEach(b => b.onclick = e => {
    e.stopPropagation();
    const o = S.orders.find(x => x.id === b.dataset.repeat);
    let n = 0;
    o.items.forEach(i => { if (getProduct(i.id) && cartAdd(i.id, i.q)) n++; });
    if (n) { toast('Товары добавлены в корзину', `${n} позиций из заказа № ${o.id}`); openDrawer(); }
  });
  $$('[data-track]', app).forEach(b => b.onclick = e => {
    e.stopPropagation(); navigator.clipboard?.writeText(b.dataset.track); toast('Трек-номер скопирован', b.dataset.track);
  });
  $$('[data-ordcoa]', app).forEach(b => b.onclick = e => {
    e.stopPropagation(); location.hash = '#/account/coa';
  });
  $$('[data-copy]', app).forEach(b => b.onclick = () => { navigator.clipboard?.writeText(b.dataset.copy); toast('Скопировано'); });

  const favAll = $('#fav-all', app);
  if (favAll) favAll.onclick = () => { S.favs.forEach(id => cartAdd(id)); toast('Избранное в корзине'); openDrawer(); };

  const an = $('#addr-new', app);
  if (an) an.onclick = () => {
    modal(`<div class="modal-head"><h3>Новый адрес</h3><p>Сохраните, чтобы оформлять заказ в один клик</p></div>
      <form id="addr-form">
        <div class="row2">
          <div class="field"><label>Название</label><input class="inp" id="ad-label" placeholder="Дом, Офис…" value="Дом"></div>
          <div class="field"><label>Город</label><input class="inp" id="ad-city" placeholder="Москва"></div>
        </div>
        <div class="field"><label>Улица, дом, квартира</label><input class="inp" id="ad-text" placeholder="ул. Примерная, 1, кв. 1"></div>
        <div class="field"><label>Индекс</label><input class="inp" id="ad-zip" placeholder="125009"></div>
        <button class="btn btn-p btn-block" type="submit">Сохранить адрес</button>
      </form>`);
    $('#addr-form').onsubmit = e => {
      e.preventDefault();
      const city = $('#ad-city').value.trim(), text = $('#ad-text').value.trim();
      if (!city || !text) { toast('Заполните город и адрес', '', 'err'); return; }
      S.user.addresses = S.user.addresses || [];
      S.user.addresses.push({ id: uid(), label: $('#ad-label').value.trim() || 'Адрес', city, text, zip: $('#ad-zip').value.trim() });
      syncUser(); closeModal(); toast('Адрес сохранён'); route();
    };
  };
  $$('[data-addrdel]', app).forEach(b => b.onclick = () => {
    S.user.addresses = S.user.addresses.filter(x => x.id !== b.dataset.addrdel);
    syncUser(); toast('Адрес удалён', '', 'info'); route();
  });

  const pf = $('#prof-form', app);
  if (pf) pf.onsubmit = e => {
    e.preventDefault();
    S.user.name = $('#p-name').value.trim() || S.user.name;
    S.user.phone = $('#p-phone').value.trim();
    S.user.email = $('#p-email').value.trim() || S.user.email;
    syncUser(); toast('Профиль сохранён'); route();
  };
}

/* ---------- Админка ---------- */
function bindAdmin(app) {
  const gs = $('#goods-save', app);
  if (gs) gs.onclick = () => {
    $$('[data-price]', app).forEach(i => {
      const id = i.dataset.price, v = Math.max(0, +i.value || 0);
      S.overrides[id] = { ...(S.overrides[id] || {}), price: v };
    });
    $$('[data-stock]', app).forEach(i => {
      const id = i.dataset.stock, v = Math.max(0, +i.value || 0);
      S.overrides[id] = { ...(S.overrides[id] || {}), stock: v };
    });
    $$('[data-badge]', app).forEach(s => {
      const id = s.dataset.badge;
      S.overrides[id] = { ...(S.overrides[id] || {}), badge: s.value || null };
    });
    save(); toast('Изменения сохранены', 'Витрина обновлена'); route();
  };
  const gr = $('#goods-reset', app);
  if (gr) gr.onclick = () => { S.overrides = {}; save(); toast('Каталог сброшен к исходному', '', 'info'); route(); };

  $$('[data-goodsdel]', app).forEach(b => b.onclick = () => {
    const id = b.dataset.goodsdel;
    S.overrides[id] = { ...(S.overrides[id] || {}), deleted: true };
    save(); toast('Товар скрыт с витрины', '', 'info'); route();
  });

  $$('[data-ostatus]', app).forEach(s => s.onchange = () => {
    const o = S.orders.find(x => x.id === s.dataset.ostatus);
    o.status = s.value; save();
    toast('Статус обновлён', `Заказ № ${o.id} → ${s.options[s.selectedIndex].text}`);
  });

  const w = $('#wipe', app);
  if (w) w.onclick = () => {
    modal(`<div class="modal-head"><h3>Очистить все данные?</h3><p>Будут удалены заказы, клиенты, корзина, избранное и правки каталога. Действие необратимо.</p></div>
      <div style="display:flex;gap:10px"><button class="btn btn-g" style="flex:1" data-close>Отмена</button>
      <button class="btn btn-d" style="flex:1" id="wipe-yes">Удалить всё</button></div>`);
    $('#wipe-yes').onclick = () => { localStorage.removeItem(KEY); location.hash = '#/'; location.reload(); };
  };
}

/* ---------- Глобальные делегированные клики ---------- */
document.addEventListener('click', e => {
  const t = e.target;

  const zoom = t.closest('.pdp-media img.art');
  if (zoom) { e.preventDefault(); lightbox(zoom.src, zoom.alt); return; }

  const quick = t.closest('.quick');
  if (quick) { e.preventDefault(); e.stopPropagation(); quickView(quick.dataset.open); return; }

  const open = t.closest('[data-open]');
  if (open) { location.hash = '#/p/' + open.dataset.open; return; }

  const add = t.closest('[data-add]');
  if (add) {
    e.preventDefault(); e.stopPropagation();
    const p = getProduct(add.dataset.add);
    if (cartAdd(add.dataset.add)) { toast('Добавлено в корзину', `${p.name} ${p.dose}`); flyToCart(add); }
    return;
  }

  const fav = t.closest('[data-fav]');
  if (fav) { e.preventDefault(); e.stopPropagation(); favToggle(fav.dataset.fav); return; }

  const qb = t.closest('[data-q]');
  if (qb) {
    const id = qb.dataset.id, line = S.cart.find(l => l.id === id);
    cartSet(id, (line ? line.q : 0) + (qb.dataset.q === '+' ? 1 : -1));
    if (location.hash.startsWith('#/checkout')) route();
    return;
  }

  const del = t.closest('[data-del]');
  if (del) { cartDel(del.dataset.del); toast('Товар удалён', '', 'info'); if (location.hash.startsWith('#/checkout')) route(); return; }

  const coa = t.closest('[data-coa]');
  if (coa) { coaModal(coa.dataset.coa); return; }

  if (t.closest('[data-close-drawer]')) closeDrawer();
  if (t.closest('[data-modal="calc"]')) protocolModal();
  if (t.id === 'modal-overlay') closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeModal(); closeDrawer(); $('#mmenu').classList.remove('open'); document.body.classList.remove('no-scroll'); }
});

/* анимация «полёт в корзину» */
function flyToCart(btn) {
  const card = btn.closest('.pcard'); if (!card) return;
  const art = card.querySelector('svg.art'), target = $('#cart-btn');
  if (!art || !target) return;
  const a = art.getBoundingClientRect(), b = target.getBoundingClientRect();
  const g = art.cloneNode(true);
  g.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;z-index:150;pointer-events:none;transition:all .8s cubic-bezier(.5,-.3,.4,1)`;
  document.body.appendChild(g);
  requestAnimationFrame(() => {
    g.style.left = b.left + b.width / 2 + 'px';
    g.style.top = b.top + b.height / 2 + 'px';
    g.style.width = g.style.height = '0px';
    g.style.opacity = '.2';
  });
  setTimeout(() => g.remove(), 850);
}

/* ---------- Быстрый просмотр ---------- */
function quickView(id) {
  const p = getProduct(id); if (!p) return;
  const pm = perMg(p);
  modal(`<div style="display:grid;grid-template-columns:190px 1fr;gap:22px" class="qv">
      <div style="border-radius:20px;background:radial-gradient(circle at 50% 40%,var(--bg-3),var(--bg-1));display:grid;place-items:center;padding:18px">
        ${productArt(p)}
      </div>
      <div>
        <span class="eyebrow" style="margin-bottom:12px">${(CATEGORIES.find(c=>c.id===p.cat)||{}).name}</span>
        <h3 style="margin:10px 0 8px">${esc(p.name)} <span style="color:var(--brand)">${esc(p.dose)}</span></h3>
        <p class="muted" style="font-size:14px;margin-bottom:14px">${esc(p.tagline)}</p>
        <div style="display:flex;align-items:flex-end;gap:10px;margin-bottom:14px">
          <span class="price" style="font-size:28px">${rub(p.price)}</span>
          ${p.marketRu>p.price?`<span class="price-old">${rub(p.marketRu)}</span>`:''}
        </div>
        ${pm?`<p class="dim" style="font-size:12.5px;margin-bottom:14px">${rub(pm)} за мг · чистота ${p.coa.purity}</p>`:''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-p btn-sm" data-add="${p.id}" ${p.stock?'':'disabled'}>${ic('cart')} В корзину</button>
          <a href="#/p/${p.id}" class="btn btn-g btn-sm" data-close>Подробнее</a>
        </div>
      </div>
    </div>
    <style>@media(max-width:560px){.qv{grid-template-columns:1fr!important}}</style>`, { wide: false });
}

/* ---------- Сертификат ---------- */
function coaModal(id) {
  const p = getProduct(id); if (!p) return;
  modal(`<div class="modal-head"><h3>Certificate of Analysis</h3><p>${esc(p.name)} ${esc(p.dose)} · партия ${p.coa.batch}</p></div>
    <div class="kpis">
      <div class="kpi"><span>Чистота (HPLC-UV)</span><b style="color:var(--brand)">${p.coa.purity}</b></div>
      <div class="kpi"><span>Содержание</span><b>${p.coa.content}</b></div>
      <div class="kpi"><span>Дата анализа</span><b style="font-size:18px">${p.coa.date}</b></div>
      <div class="kpi"><span>Метод</span><b style="font-size:14px">${p.coa.method}</b></div>
    </div>
    <div class="note brand" style="margin-top:16px">${ic('check')}
      <span>Идентичность подтверждена масс-спектрометрией (LC-MS). Отчёт относится к конкретной партии — при повторном заказе номер партии может отличаться.</span></div>
    <div style="display:flex;gap:9px;margin-top:18px;flex-wrap:wrap">
      <a href="#/p/${p.id}" class="btn btn-p btn-sm" data-close>К товару</a>
      <a href="https://t.me/ag_peptides_platform" target="_blank" rel="noopener" class="btn btn-g btn-sm">${ic('tg')} Запросить PDF</a>
    </div>`);
}

/* ---------- Подбор протокола ---------- */
function protocolModal() {
  const goals = [
    { id: 'weight',    t: 'Контроль веса',        d: 'Retatrutide, Tirzepatide, Cagrilintide' },
    { id: 'recovery',  t: 'Восстановление',       d: 'BPC-157, TB-500, комплекс BC+TB' },
    { id: 'skin',      t: 'Кожа и волосы',        d: 'GHK-Cu, GLOW, KLOW, Matrixyl' },
    { id: 'energy',    t: 'Энергия и антиэйдж',   d: 'NAD+, MOTS-c, Epithalon' },
    { id: 'cognitive', t: 'Ясность и сон',        d: 'Semax, Selank, DSIP' }
  ];
  modal(`<div class="modal-head"><h3>Подбор по направлению</h3>
      <p>Выберите направление исследования — покажем подходящие позиции и порядок цен.</p></div>
    ${goals.map(g=>`<button class="opt" style="width:100%;text-align:left" data-goal="${g.id}">
      <div class="opt-ic">${ic((CATEGORIES.find(c=>c.id===g.id)||{}).icon)}</div>
      <div class="opt-txt"><b>${g.t}</b><span>${g.d}</span></div>
      <span class="opt-r">${ic('arrow')}</span></button>`).join('')}
    <div class="note" style="margin-top:14px">${ic('warn')}
      <span>Подбор носит справочный характер и не является медицинской рекомендацией. Все товары — реактивы для лабораторных исследований.</span></div>`);
  $$('[data-goal]').forEach(b => b.onclick = () => { F.cat = b.dataset.goal; F.q = ''; closeModal(); location.hash = '#/catalog'; setTimeout(route, 30); });
}

/* ---------- Шторка-корзина ---------- */
function openDrawer() { renderDrawer(); $('#cart-drawer').classList.add('open'); $('#drawer-overlay').classList.add('open'); document.body.classList.add('no-scroll'); }
function closeDrawer() {
  $('#cart-drawer').classList.remove('open'); $('#drawer-overlay').classList.remove('open');
  if (!$('#modal-overlay').classList.contains('open')) document.body.classList.remove('no-scroll');
}

/* ---------- Возрастная модалка ---------- */
function ageGate() {
  if (S.ageOk) return;
  modal(`<div style="text-align:center">
      <div style="width:66px;height:66px;margin:0 auto 18px;border-radius:20px;background:var(--brand);color:#fff;display:grid;place-items:center">${ic('lab')}</div>
      <h3 style="margin-bottom:10px">Важное уведомление</h3>
      <p class="muted" style="font-size:14.5px;margin-bottom:22px">Все товары на этом сайте предназначены исключительно для лабораторных исследований (Research Use Only). Они не являются лекарственными средствами, БАД или косметикой и не предназначены для употребления человеком или животными.</p>
      <button class="btn btn-p btn-block" id="age-yes">Мне есть 18, я согласен</button>
      <p class="dim" style="font-size:12px;margin-top:14px">Продолжая, вы подтверждаете совершеннолетие и принимаете условия использования</p>
    </div>`);
  $('#modal-overlay .modal-x').style.display = 'none';
  $('#age-yes').onclick = () => { S.ageOk = true; save(); closeModal(); };
}

/* ---------- Инициализация ---------- */
function init() {
  seedDemo();
  setTheme(S.theme || 'light');

  $('#theme-btn').onclick = toggleTheme;
  $('#cart-btn').onclick = openDrawer;
  $$('.open-cart').forEach(b => b.onclick = e => { e.preventDefault(); openDrawer(); });
  $('#drawer-x').onclick = closeDrawer;
  $('#drawer-overlay').onclick = closeDrawer;
  $('#burger').onclick = () => { $('#mmenu').classList.add('open'); document.body.classList.add('no-scroll'); };
  $('#mmenu-x').onclick = () => { $('#mmenu').classList.remove('open'); document.body.classList.remove('no-scroll'); };
  $$('#mmenu a').forEach(a => a.addEventListener('click', () => { $('#mmenu').classList.remove('open'); document.body.classList.remove('no-scroll'); }));
  $('#user-btn').onclick = () => { if (S.user) location.hash = isAdmin() ? '#/admin' : '#/account/home'; else authModal(); };

  const up = $('#up');
  up.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  addEventListener('scroll', () => {
    $('#nav').classList.toggle('stuck', scrollY > 12);
    up.classList.toggle('show', scrollY > 640);
  }, { passive: true });

  addEventListener('hashchange', route);
  syncCart(); syncFavs(); route();
  setTimeout(ageGate, 700);
}
document.addEventListener('DOMContentLoaded', init);
