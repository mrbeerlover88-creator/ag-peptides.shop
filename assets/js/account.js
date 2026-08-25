/* ============================================================
   Личный кабинет клиента + панель управления магазином
   ============================================================ */

const ACC_NAV = [
  { id: 'home',  name: 'Обзор',        icon: 'dash'  },
  { id: 'orders',name: 'Мои заказы',   icon: 'bag'   },
  { id: 'favs',  name: 'Избранное',    icon: 'heart' },
  { id: 'bonus', name: 'Бонусы',       icon: 'gift'  },
  { id: 'coa',   name: 'Сертификаты',  icon: 'doc'   },
  { id: 'addr',  name: 'Адреса',       icon: 'pin'   },
  { id: 'prof',  name: 'Профиль',      icon: 'gear'  }
];

const TIERS = [
  { name: 'Research', min: 0,      cb: 5,  next: 30000 },
  { name: 'Silver',   min: 30000,  cb: 7,  next: 80000 },
  { name: 'Gold',     min: 80000,  cb: 10, next: 150000 },
  { name: 'Platinum', min: 150000, cb: 12, next: null }
];
function tierOf(spent) {
  let t = TIERS[0];
  TIERS.forEach(x => { if (spent >= x.min) t = x; });
  return t;
}

/* ---------- Вход / регистрация ---------- */
function authModal(mode = 'login') {
  const login = mode === 'login';
  modal(`<div class="modal-head">
      <h3>${login ? 'Вход в личный кабинет' : 'Регистрация'}</h3>
      <p>${login ? 'Заказы, трекинг, бонусы и сертификаты на ваши партии' : 'Начислим 500 приветственных бонусов сразу после регистрации'}</p>
    </div>
    <form id="auth-form">
      ${login ? '' : `<div class="field"><label>Имя и фамилия <span class="req">*</span></label>
        <input class="inp" id="a-name" placeholder="Иван Петров"><div class="err-msg">Укажите имя</div></div>
      <div class="field"><label>Телефон</label><input class="inp" id="a-phone" placeholder="+7 999 123-45-67"></div>`}
      <div class="field"><label>E-mail <span class="req">*</span></label>
        <input class="inp" id="a-email" placeholder="mail@example.com" autocomplete="email"><div class="err-msg">Проверьте адрес</div></div>
      <div class="field"><label>Пароль <span class="req">*</span></label>
        <input class="inp" id="a-pass" type="password" placeholder="Минимум 4 символа" autocomplete="current-password"><div class="err-msg">Минимум 4 символа</div></div>
      ${login ? '' : `<label class="check"><input type="checkbox" id="a-agree" checked>
        <span>Мне есть 18 лет, согласен с условиями и политикой обработки данных</span></label>`}
      <button class="btn btn-p btn-block" type="submit">${login ? 'Войти' : 'Создать аккаунт'}</button>
    </form>
    <p style="text-align:center;margin-top:16px;font-size:13.5px;color:var(--text-2)">
      ${login ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
      <b style="color:var(--brand);cursor:pointer" id="auth-switch">${login ? 'Зарегистрироваться' : 'Войти'}</b>
    </p>
    `);

  $('#auth-switch').onclick = () => authModal(login ? 'reg' : 'login');
  $('#auth-form').onsubmit = e => {
    e.preventDefault();
    const email = $('#a-email'), pass = $('#a-pass');
    let ok = true;
    const bad = (el, c) => { el.classList.toggle('bad', !c); if (!c) ok = false; };
    bad(email, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email.value.trim()));
    bad(pass, pass.value.length >= 4);
    if (!login) bad($('#a-name'), $('#a-name').value.trim().length >= 2);
    if (!ok) return;
    const done = login
      ? window.login(email.value, pass.value)
      : register({ name: $('#a-name').value.trim(), email: email.value, phone: $('#a-phone').value.trim(), pass: pass.value });
    if (done) {
      closeModal();
      const dest = isAdmin() ? '#/admin' : '#/account/home';
      // тот же хеш не вызывает hashchange — перерисовываем вручную
      if (location.hash === dest) route(); else location.hash = dest;
    }
  };
}

/* ---------- Кабинет ---------- */
function viewAccount(tab = 'home') {
  if (!S.user) { authModal(); return `<div class="wrap sec"><div class="empty">${ic('lock')}
    <h3>Требуется вход</h3><p class="muted" style="margin-top:8px">Войдите, чтобы открыть личный кабинет</p>
    <button class="btn btn-p" style="margin-top:18px" onclick="authModal()">Войти</button></div></div>`; }
  if (isAdmin()) { location.hash = '#/admin'; return ''; }

  const orders = myOrders();
  const spent = orders.filter(o => o.status !== 'cancel').reduce((s, o) => s + o.total, 0);
  const tier = tierOf(spent);
  const u = S.user;

  const body = {
    home:  accHome(orders, spent, tier),
    orders: accOrders(orders),
    favs:  accFavs(),
    bonus: accBonus(spent, tier, orders),
    coa:   accCoa(orders),
    addr:  accAddr(),
    prof:  accProf()
  }[tab] || accHome(orders, spent, tier);

  return `<div class="view wrap" style="padding-top:28px">
    <div class="acc">
      <aside class="acc-side">
        <div class="acc-user">
          <div class="avatar">${esc(u.name[0])}</div>
          <div style="min-width:0"><b style="overflow:hidden;text-overflow:ellipsis;display:block">${esc(u.name)}</b>
            <span>${tier.name} · ${tier.cb}% кэшбэк</span></div>
        </div>
        <nav class="acc-nav">
          ${ACC_NAV.map(n => `<a href="#/account/${n.id}" class="${tab === n.id ? 'on' : ''}">${ic(n.icon)} ${n.name}
            ${n.id === 'orders' && orders.length ? `<span class="cnt">${orders.length}</span>` : ''}
            ${n.id === 'favs' && S.favs.length ? `<span class="cnt">${S.favs.length}</span>` : ''}</a>`).join('')}
          <a href="#" id="logout" style="color:var(--danger)">${ic('out')} Выйти</a>
        </nav>
      </aside>
      <div>${body}</div>
    </div>
  </div>`;
}

function accHome(orders, spent, tier) {
  const last = orders[0];
  const need = tier.next ? tier.next - spent : 0;
  return `
  <div class="panel">
    <div class="panel-head"><h3>Обзор</h3><span class="dim" style="font-size:13px">Сегодня ${today()}</span></div>
    <div class="kpis">
      <div class="kpi"><span>Бонусный счёт</span><b style="color:var(--brand)">${new Intl.NumberFormat('ru-RU').format(S.user.bonus||0)}</b><i>1 бонус = 1 ₽</i></div>
      <div class="kpi"><span>Заказов</span><b>${orders.length}</b><i>${orders.filter(o=>o.status!=='done').length} в работе</i></div>
      <div class="kpi"><span>Потрачено</span><b>${rub(spent)}</b><i>за всё время</i></div>
      <div class="kpi"><span>Статус</span><b>${tier.name}</b><i>кэшбэк ${tier.cb}%</i></div>
    </div>
  </div>

  <div class="panel">
    <div class="tier">
      <b>${tier.name}</b>
      <p>${tier.next ? `До статуса ${TIERS[TIERS.indexOf(tier)+1].name} осталось ${rub(need)}` : 'Максимальный статус — кэшбэк 12% с каждого заказа'}</p>
      <div class="bar"><i style="width:${tier.next ? Math.min(100, spent/tier.next*100) : 100}%"></i></div>
    </div>
  </div>

  ${last ? `<div class="panel">
    <div class="panel-head"><h3>Последний заказ</h3><a href="#/account/orders" class="btn btn-ghost btn-sm">Все заказы ${ic('arrow')}</a></div>
    ${orderCard(last, true)}
  </div>` : `<div class="panel"><div class="empty" style="padding:40px 10px">${ic('bag')}
    <h3 style="font-size:18px">Заказов пока нет</h3><a href="#/catalog" class="btn btn-p btn-sm" style="margin-top:16px">В каталог</a></div></div>`}

  <div class="panel">
    <div class="panel-head"><h3>Быстрые действия</h3></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px">
      <a href="#/catalog" class="opt"><div class="opt-ic">${ic('cart')}</div><div class="opt-txt"><b>Каталог</b><span>23 позиции</span></div></a>
      <a href="#/account/favs" class="opt"><div class="opt-ic">${ic('heart')}</div><div class="opt-txt"><b>Избранное</b><span>${S.favs.length} шт.</span></div></a>
      <a href="#/account/coa" class="opt"><div class="opt-ic">${ic('doc')}</div><div class="opt-txt"><b>Сертификаты</b><span>по вашим партиям</span></div></a>
      <a href="https://t.me/ag_peptides_platform" target="_blank" rel="noopener" class="opt"><div class="opt-ic">${ic('tg')}</div><div class="opt-txt"><b>Менеджер</b><span>ответ за 15 минут</span></div></a>
    </div>
  </div>`;
}

function orderCard(o, open = false) {
  const idx = ORDER_FLOW.findIndex(s => s.id === o.status);
  const st = { new:'s-new', paid:'s-paid', pack:'s-paid', ship:'s-ship', done:'s-done', cancel:'s-cancel' }[o.status];
  const stName = o.status === 'cancel' ? 'Отменён' : (ORDER_FLOW.find(s => s.id === o.status) || {}).name;
  return `<div class="ord ${open ? 'open' : ''}" data-ord="${o.id}">
    <div class="ord-top">
      <b>№ ${o.id}</b>
      <span class="status ${st}">${stName}</span>
      <span class="when">${new Date(o.createdAt).toLocaleDateString('ru-RU')} · ${plural(o.items.reduce((s,i)=>s+i.q,0),'товар','товара','товаров')}</span>
      <span class="ord-sum">${rub(o.total)}</span>
      <i class="ord-chev">${ic('chev')}</i>
    </div>
    <div class="ord-body"><div class="ord-inner">
      ${o.status !== 'cancel' ? `<div class="track">
        ${ORDER_FLOW.map((s,i)=>`<div class="tr ${i<=idx?'done':''} ${i===idx?'now':''}">
          <i>${i<=idx?ic('check'):''}</i><span>${s.name}</span></div>`).join('')}
      </div>` : ''}
      ${o.items.map(i=>`<div class="sum-row"><span>${esc(i.name)} × ${i.q}</span><b style="color:var(--text)">${rub(i.price*i.q)}</b></div>`).join('')}
      <div class="sum-row"><span>Доставка · ${esc(o.shipName||'')}</span><b style="color:var(--text)">${o.ship?rub(o.ship):'бесплатно'}</b></div>
      ${o.disc?`<div class="sum-row"><span>Скидка</span><b class="save">−${rub(o.disc)}</b></div>`:''}
      <div class="sum-row total"><span>Итого</span><span>${rub(o.total)}</span></div>
      <div class="kpis" style="margin-top:16px">
        <div class="kpi"><span>Трек-номер</span><b style="font-size:15px;font-family:ui-monospace,monospace">${o.track}</b></div>
        <div class="kpi"><span>Оплата</span><b style="font-size:15px">${esc(o.payName||'')}</b></div>
        <div class="kpi"><span>Начислено бонусов</span><b style="font-size:19px;color:var(--brand)">+${o.cashback}</b></div>
      </div>
      <div style="display:flex;gap:9px;margin-top:16px;flex-wrap:wrap">
        <button class="btn btn-o btn-sm" data-repeat="${o.id}">${ic('repeat')} Повторить заказ</button>
        <button class="btn btn-g btn-sm" data-track="${o.track}">${ic('copy')} Скопировать трек</button>
        <button class="btn btn-g btn-sm" data-ordcoa="${o.id}">${ic('doc')} Сертификаты партий</button>
      </div>
    </div></div>
  </div>`;
}

const accOrders = orders => `<div class="panel">
  <div class="panel-head"><h3>Мои заказы</h3><span class="dim" style="font-size:13px">${plural(orders.length,'заказ','заказа','заказов')}</span></div>
  ${orders.length ? orders.map(o=>orderCard(o)).join('')
    : `<div class="empty" style="padding:50px 10px">${ic('bag')}<h3 style="font-size:18px">Заказов пока нет</h3>
       <a href="#/catalog" class="btn btn-p btn-sm" style="margin-top:16px">Перейти в каталог</a></div>`}
</div>`;

function accFavs() {
  const list = S.favs.map(getProduct).filter(Boolean);
  return `<div class="panel">
    <div class="panel-head"><h3>Избранное</h3>${list.length?`<button class="btn btn-ghost btn-sm" id="fav-all">${ic('cart')} Всё в корзину</button>`:''}</div>
    ${list.length ? `<div class="grid-p">${list.map(productCard).join('')}</div>`
      : `<div class="empty" style="padding:50px 10px">${ic('heart')}<h3 style="font-size:18px">Список пуст</h3>
         <p class="muted" style="margin-top:8px;font-size:14px">Нажмите ♥ на карточке товара, чтобы сохранить его</p>
         <a href="#/catalog" class="btn btn-p btn-sm" style="margin-top:16px">В каталог</a></div>`}
  </div>`;
}

const accBonus = (spent, tier, orders) => `<div class="panel">
  <div class="panel-head"><h3>Бонусный счёт</h3></div>
  <div class="kpis">
    <div class="kpi"><span>Доступно</span><b style="color:var(--brand)">${new Intl.NumberFormat('ru-RU').format(S.user.bonus||0)}</b><i>1 бонус = 1 ₽</i></div>
    <div class="kpi"><span>Ставка кэшбэка</span><b>${tier.cb}%</b><i>статус ${tier.name}</i></div>
    <div class="kpi"><span>Оплатить бонусами</span><b>до 30%</b><i>от суммы заказа</i></div>
  </div>
  <div class="note brand" style="margin-top:16px">${ic('gift')}
    <span>Бонусы начисляются в течение суток после получения заказа и действуют 12 месяцев. Списать можно до 30% стоимости корзины — просто отметьте галочку на шаге оплаты.</span></div>
  <h4 style="margin:24px 0 12px;font:800 15px/1 var(--head)">История начислений</h4>
  <div class="tbl-scroll"><table class="tbl">
    <thead><tr><th>Дата</th><th>Операция</th><th>Заказ</th><th style="text-align:right">Бонусы</th></tr></thead>
    <tbody>
      <tr><td>${today()}</td><td>Приветственный бонус</td><td>—</td><td style="text-align:right;color:var(--brand);font-weight:700">+500</td></tr>
      ${orders.map(o=>`<tr><td>${new Date(o.createdAt).toLocaleDateString('ru-RU')}</td><td>Кэшбэк с заказа</td>
        <td>№ ${o.id}</td><td style="text-align:right;color:var(--brand);font-weight:700">+${o.cashback}</td></tr>`).join('')}
    </tbody></table></div>
</div>

<div class="panel">
  <div class="panel-head"><h3>Реферальная программа</h3></div>
  <p class="muted" style="font-size:14.5px;margin-bottom:16px">Отправьте ссылку другу — он получит скидку 10% на первый заказ, а вы 1 000 бонусов после его получения.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <input class="inp" readonly value="agpeptides.ru/?ref=${S.user.id}" style="flex:1;min-width:200px">
    <button class="btn btn-p" data-copy="agpeptides.ru/?ref=${S.user.id}">${ic('copy')} Скопировать</button>
  </div>
</div>`;

function accCoa(orders) {
  const seen = new Set(); const list = [];
  orders.forEach(o => o.items.forEach(i => { if (i.coa && !seen.has(i.coa.batch)) { seen.add(i.coa.batch); list.push({ ...i }); } }));
  return `<div class="panel">
    <div class="panel-head"><h3>Сертификаты моих партий</h3><span class="dim" style="font-size:13px">${list.length} шт.</span></div>
    <p class="muted" style="font-size:14px;margin-bottom:18px">Здесь только те партии, которые физически приехали к вам. Каждый отчёт привязан к номеру заказа.</p>
    ${list.length ? `<div class="coa-grid">${list.map(i=>`<div class="coa" data-coa="${i.id}">
      <b>${esc(i.name)}</b><div class="batch">Партия: ${i.coa.batch}</div>
      <div class="coa-nums">
        <div><span>Чистота</span><b>${i.coa.purity}</b></div>
        <div><span>Содержание</span><b style="color:var(--text)">${i.coa.content}</b></div>
      </div></div>`).join('')}</div>`
      : `<div class="empty" style="padding:40px 10px">${ic('doc')}<p class="muted">Сертификаты появятся после первого заказа</p></div>`}
  </div>`;
}

function accAddr() {
  const a = S.user.addresses || [];
  return `<div class="panel">
    <div class="panel-head"><h3>Адреса доставки</h3><button class="btn btn-p btn-sm" id="addr-new">${ic('plus')} Добавить</button></div>
    ${a.length ? a.map(x=>`<div class="opt" style="cursor:default">
        <div class="opt-ic">${ic('pin')}</div>
        <div class="opt-txt"><b>${esc(x.label)} · ${esc(x.city)}</b><span>${esc(x.text)}${x.zip?', '+esc(x.zip):''}</span></div>
        <button class="citem-del" data-addrdel="${x.id}">${ic('trash')}</button></div>`).join('')
      : `<div class="empty" style="padding:40px 10px">${ic('pin')}<p class="muted">Адресов пока нет — добавьте, чтобы оформлять заказ в один клик</p></div>`}
  </div>`;
}

const accProf = () => `<div class="panel">
  <div class="panel-head"><h3>Профиль</h3></div>
  <form id="prof-form">
    <div class="row2">
      <div class="field"><label>Имя и фамилия</label><input class="inp" id="p-name" value="${esc(S.user.name)}"></div>
      <div class="field"><label>Телефон</label><input class="inp" id="p-phone" value="${esc(S.user.phone||'')}" placeholder="+7 999 123-45-67"></div>
    </div>
    <div class="field"><label>E-mail</label><input class="inp" id="p-email" value="${esc(S.user.email)}"></div>
    <button class="btn btn-p" type="submit">Сохранить изменения</button>
  </form>
  <div style="border-top:1px solid var(--line);margin:26px 0 20px"></div>
  <h4 style="font:800 15px/1 var(--head);margin-bottom:12px">Уведомления</h4>
  <label class="check"><input type="checkbox" checked><span>Статусы заказа в Telegram и на e-mail</span></label>
  <label class="check"><input type="checkbox" checked><span>Сообщать, когда товар из избранного вернётся в наличие</span></label>
  <label class="check"><input type="checkbox"><span>Акции и новые поступления (не чаще раза в месяц)</span></label>
</div>`;

/* ============================================================
   ПАНЕЛЬ УПРАВЛЕНИЯ
   ============================================================ */
const ADM_NAV = [
  { id: 'dash',   name: 'Дашборд',   icon: 'chart' },
  { id: 'goods',  name: 'Товары',    icon: 'box'   },
  { id: 'orders', name: 'Заказы',    icon: 'bag'   },
  { id: 'users',  name: 'Клиенты',   icon: 'users' },
  { id: 'promo',  name: 'Промокоды', icon: 'tag'   },
  { id: 'set',    name: 'Настройки', icon: 'gear'  }
];

function viewAdmin(tab = 'dash') {
  if (!isAdmin()) { authModal(); return `<div class="wrap sec"><div class="empty">${ic('lock')}
    <h3>Доступ только для администратора</h3></div></div>`; }

  const body = { dash: admDash(), goods: admGoods(), orders: admOrders(), users: admUsers(), promo: admPromo(), set: admSet() }[tab] || admDash();
  return `<div class="view wrap" style="padding-top:28px">
    <div class="acc">
      <aside class="acc-side">
        <div class="acc-user"><div class="avatar" style="background:linear-gradient(140deg,var(--accent),#8a6a10)">${ic('gear')}</div>
          <div><b>Панель управления</b><span>AG Peptides</span></div></div>
        <nav class="acc-nav">
          ${ADM_NAV.map(n=>`<a href="#/admin/${n.id}" class="${tab===n.id?'on':''}">${ic(n.icon)} ${n.name}</a>`).join('')}
          <a href="#/" >${ic('home')} На витрину</a>
          <a href="#" id="logout" style="color:var(--danger)">${ic('out')} Выйти</a>
        </nav>
      </aside>
      <div>${body}</div>
    </div>
  </div>`;
}

function admDash() {
  const os = S.orders;
  const rev = os.filter(o => o.status !== 'cancel').reduce((s, o) => s + o.total, 0);
  const avg = os.length ? rev / os.length : 0;
  const low = allProducts().filter(p => p.stock <= 10);
  // выручка по дням (последние 14)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toDateString();
    return { d, v: os.filter(o => new Date(o.createdAt).toDateString() === key).reduce((s, o) => s + o.total, 0) };
  });
  const max = Math.max(1, ...days.map(x => x.v));
  const byCat = CATEGORIES.filter(c => c.id !== 'all').map(c => ({
    ...c, v: os.flatMap(o => o.items).filter(i => i.cat === c.id).reduce((s, i) => s + i.price * i.q, 0)
  })).sort((a, b) => b.v - a.v);
  const maxCat = Math.max(1, ...byCat.map(c => c.v));

  return `<div class="panel">
    <div class="panel-head"><h3>Дашборд</h3><span class="dim" style="font-size:13px">${today()}</span></div>
    <div class="kpis">
      <div class="kpi"><span>Выручка</span><b>${rub(rev)}</b><i>${ic('chart')} за всё время</i></div>
      <div class="kpi"><span>Заказов</span><b>${os.length}</b><i>${os.filter(o=>['paid','new','pack'].includes(o.status)).length} требуют сборки</i></div>
      <div class="kpi"><span>Средний чек</span><b>${rub(avg)}</b></div>
      <div class="kpi"><span>Клиентов</span><b>${S.users.length}</b></div>
      <div class="kpi"><span>Позиций</span><b>${allProducts().length}</b></div>
      <div class="kpi"><span>Заканчивается</span><b style="color:${low.length?'var(--accent)':'var(--text)'}">${low.length}</b><i>остаток ≤ 10</i></div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><h3>Выручка за 14 дней</h3></div>
    <div style="display:flex;align-items:flex-end;gap:6px;height:170px">
      ${days.map(x=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end" title="${x.d.toLocaleDateString('ru-RU')}: ${rub(x.v)}">
        <div style="width:100%;height:${Math.max(3, x.v/max*130)}px;border-radius:6px 6px 3px 3px;background:linear-gradient(180deg,var(--brand),var(--brand-2));opacity:${x.v?1:.25};transition:height .8s var(--ease)"></div>
        <span style="font-size:9.5px;color:var(--text-3)">${x.d.getDate()}</span>
      </div>`).join('')}
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><h3>Продажи по категориям</h3></div>
    ${byCat.map(c=>`<div style="margin-bottom:13px">
      <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px">
        <span class="muted">${c.name}</span><b>${rub(c.v)}</b></div>
      <div class="bar"><i style="width:${c.v/maxCat*100}%"></i></div></div>`).join('')}
  </div>

  ${low.length?`<div class="panel">
    <div class="panel-head"><h3>Нужно пополнить</h3><a href="#/admin/goods" class="btn btn-ghost btn-sm">К товарам ${ic('arrow')}</a></div>
    <div class="tbl-scroll"><table class="tbl"><thead><tr><th>Товар</th><th>Остаток</th><th>Цена</th></tr></thead><tbody>
      ${low.map(p=>`<tr><td><b>${esc(p.name)} ${esc(p.dose)}</b></td>
        <td><span class="status ${p.stock?'s-new':'s-cancel'}">${p.stock} шт.</span></td><td>${rub(p.price)}</td></tr>`).join('')}
    </tbody></table></div></div>`:''}`;
}

function admGoods() {
  const list = allProducts();
  return `<div class="panel">
    <div class="panel-head"><h3>Товары</h3><span class="dim" style="font-size:13px">${plural(list.length,'позиция','позиции','позиций')}</span></div>
    <p class="muted" style="font-size:13.5px;margin-bottom:16px">Цена, остаток и статус меняются прямо в таблице — изменения сразу видны на витрине.</p>
    <div class="tbl-scroll"><table class="tbl">
      <thead><tr><th>Товар</th><th>Категория</th><th>Цена, ₽</th><th>Рынок РФ</th><th>Остаток</th><th>Метка</th><th></th></tr></thead>
      <tbody>${list.map(p=>`<tr>
        <td><b>${esc(p.name)}</b> <span class="dose">${esc(p.dose)}</span></td>
        <td class="muted">${(CATEGORIES.find(c=>c.id===p.cat)||{}).name}</td>
        <td><input class="inp" style="height:38px;width:104px;padding:0 10px" type="number" value="${p.price}" data-price="${p.id}"></td>
        <td class="dim">${rub(p.marketRu)}</td>
        <td><input class="inp" style="height:38px;width:78px;padding:0 10px" type="number" value="${p.stock}" data-stock="${p.id}"></td>
        <td><select class="sel" style="height:38px;padding:0 30px 0 10px" data-badge="${p.id}">
          <option value=""${!p.badge?' selected':''}>—</option>
          <option value="hit"${p.badge==='hit'?' selected':''}>Хит</option>
          <option value="new"${p.badge==='new'?' selected':''}>Новинка</option></select></td>
        <td><button class="citem-del" data-goodsdel="${p.id}" title="Скрыть товар">${ic('trash')}</button></td>
      </tr>`).join('')}</tbody>
    </table></div>
    <div style="display:flex;gap:9px;margin-top:18px;flex-wrap:wrap">
      <button class="btn btn-p btn-sm" id="goods-save">${ic('check')} Сохранить изменения</button>
      <button class="btn btn-g btn-sm" id="goods-reset">${ic('repeat')} Сбросить к исходным</button>
    </div>
  </div>`;
}

function admOrders() {
  const os = S.orders;
  return `<div class="panel">
    <div class="panel-head"><h3>Заказы</h3><span class="dim" style="font-size:13px">${plural(os.length,'заказ','заказа','заказов')}</span></div>
    ${os.length ? `<div class="tbl-scroll"><table class="tbl">
      <thead><tr><th>№</th><th>Дата</th><th>Клиент</th><th>Состав</th><th>Сумма</th><th>Оплата</th><th>Статус</th></tr></thead>
      <tbody>${os.map(o=>`<tr>
        <td><b>${o.id}</b></td>
        <td class="muted">${new Date(o.createdAt).toLocaleDateString('ru-RU')}</td>
        <td>${esc((o.contact&&o.contact.name)||'Гость')}<br><span class="dim" style="font-size:12px">${esc((o.contact&&o.contact.phone)||'')}</span></td>
        <td class="muted" style="max-width:230px;font-size:13px">${o.items.map(i=>esc(i.name)+' ×'+i.q).join(', ')}</td>
        <td><b>${rub(o.total)}</b></td>
        <td class="muted" style="font-size:13px">${esc(o.payName||'')}</td>
        <td><select class="sel" style="height:36px;padding:0 30px 0 10px;font-size:13px" data-ostatus="${o.id}">
          ${[...ORDER_FLOW,{id:'cancel',name:'Отменён'}].map(s=>`<option value="${s.id}"${o.status===s.id?' selected':''}>${s.name}</option>`).join('')}
        </select></td></tr>`).join('')}</tbody></table></div>`
      : `<div class="empty" style="padding:40px 10px">${ic('bag')}<p class="muted">Заказов ещё нет</p></div>`}
  </div>`;
}

function admUsers() {
  return `<div class="panel">
    <div class="panel-head"><h3>Клиенты</h3><span class="dim" style="font-size:13px">${plural(S.users.length,'клиент','клиента','клиентов')}</span></div>
    ${S.users.length?`<div class="tbl-scroll"><table class="tbl">
      <thead><tr><th>Имя</th><th>Контакты</th><th>Заказов</th><th>Потрачено</th><th>Статус</th><th>Бонусы</th></tr></thead>
      <tbody>${S.users.map(u=>{
        const os = S.orders.filter(o=>o.userId===u.id);
        const sp = os.reduce((s,o)=>s+o.total,0);
        return `<tr><td><b>${esc(u.name)}</b><br><span class="dim" style="font-size:12px">с ${new Date(u.createdAt).toLocaleDateString('ru-RU')}</span></td>
          <td class="muted" style="font-size:13px">${esc(u.email)}<br>${esc(u.phone||'—')}</td>
          <td>${os.length}</td><td><b>${rub(sp)}</b></td>
          <td><span class="status s-done">${tierOf(sp).name}</span></td>
          <td style="color:var(--brand);font-weight:700">${u.bonus||0}</td></tr>`;}).join('')}
      </tbody></table></div>`
      : `<div class="empty" style="padding:40px 10px">${ic('users')}<p class="muted">Пока никто не зарегистрировался</p></div>`}
  </div>`;
}

const admPromo = () => `<div class="panel">
  <div class="panel-head"><h3>Промокоды</h3></div>
  <div class="tbl-scroll"><table class="tbl">
    <thead><tr><th>Код</th><th>Тип</th><th>Значение</th><th>Условие</th><th>Использований</th></tr></thead>
    <tbody>${Object.entries(PROMOS).map(([c,p])=>`<tr>
      <td><b style="font-family:ui-monospace,monospace">${c}</b></td>
      <td class="muted">${{percent:'Процент',fixed:'Фикс. сумма',ship:'Доставка'}[p.type]}</td>
      <td><b>${p.type==='percent'?p.value+'%':p.type==='fixed'?rub(p.value):'бесплатно'}</b></td>
      <td class="muted">${p.min?'от '+rub(p.min):'без ограничений'}</td>
      <td>${S.orders.filter(o=>o.promo===c).length}</td></tr>`).join('')}
    </tbody></table></div>
  <div class="note" style="margin-top:16px">${ic('info')}
    <span>В демо-версии список промокодов задан в <b>assets/js/data.js</b>. В боевой версии он редактируется здесь и хранится в базе.</span></div>
</div>`;

const admSet = () => `<div class="panel">
  <div class="panel-head"><h3>Настройки магазина</h3></div>
  <div class="row2">
    <div class="field"><label>Порог бесплатной доставки, ₽</label><input class="inp" value="15000"></div>
    <div class="field"><label>Ставка кэшбэка, %</label><input class="inp" value="5"></div>
  </div>
  <div class="field"><label>Telegram менеджера</label><input class="inp" value="@peptides_ag"></div>
  <div class="field"><label>E-mail для заказов</label><input class="inp" value="orders@agpeptides.ru"></div>
  <label class="check"><input type="checkbox" checked><span>Показывать модалку 18+ при первом входе</span></label>
  <label class="check"><input type="checkbox" checked><span>Показывать сравнение с ценами рынка РФ на карточках</span></label>
  <label class="check"><input type="checkbox" checked><span>Автоматически списывать остатки при оформлении</span></label>
  <button class="btn btn-p" style="margin-top:8px" onclick="toast('Настройки сохранены')">Сохранить</button>
</div>

<div class="panel">
  <div class="panel-head"><h3>Данные демо-режима</h3></div>
  <p class="muted" style="font-size:14px;margin-bottom:16px">Витрина работает без сервера: заказы, клиенты и правки товаров хранятся в localStorage браузера. Кнопка ниже полностью очищает демо-данные.</p>
  <button class="btn btn-d btn-sm" id="wipe">${ic('trash')} Очистить все данные</button>
</div>`;
