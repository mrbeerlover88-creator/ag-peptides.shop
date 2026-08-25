/* ============================================================
   Витрина: главная, каталог, товар, корзина, оформление
   ============================================================ */

const F = { cat: 'all', q: '', sort: 'pop', form: 'all' };

/* ---------- Карточка товара ---------- */
function productCard(p) {
  const save = p.marketRu && p.marketRu > p.price ? Math.round((1 - p.price / p.marketRu) * 100) : 0;
  const pm = perMg(p);
  const low = p.stock > 0 && p.stock <= 10;
  return `<article class="pcard reveal" data-id="${p.id}">
    <div class="pcard-media" data-open="${p.id}">
      <div class="tags">
        ${p.badge === 'hit' ? '<span class="tag tag-hit">Хит</span>' : ''}
        ${p.badge === 'new' ? '<span class="tag tag-new">Новинка</span>' : ''}
        ${save >= 10 ? `<span class="tag tag-save">−${save}%</span>` : ''}
      </div>
      <button class="fav ${isFav(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="В избранное">${ic('heart')}</button>
      ${productArt(p)}
      <button class="quick" data-open="${p.id}">${ic('eye')} Быстрый просмотр</button>
    </div>
    <div class="pcard-body">
      <div class="pcard-title"><h3>${esc(p.name)}</h3><span class="dose">${esc(p.dose)}</span></div>
      <p class="pcard-tag">${esc(p.tagline)}</p>
      <div class="pcard-meta">
        ${stars(p.rating)}<span>${p.rating}</span>
        <span class="instock ${low ? 'low' : ''}"><i class="dot"></i>${p.stock > 0 ? (low ? `${p.stock} шт.` : 'В наличии') : 'Нет'}</span>
      </div>
      <div class="price-row">
        <span class="price">${rub(p.price)}</span>
        ${p.marketRu > p.price ? `<span class="price-old">${rub(p.marketRu)}</span>` : ''}
        ${pm ? `<span class="price-per">${rub(pm)} за мг · ${p.form === 'pen' ? 'ручка' : 'флакон'}</span>` : ''}
      </div>
      <div class="pcard-buy">
        <button class="btn btn-p btn-sm" data-add="${p.id}" ${p.stock ? '' : 'disabled'}>${ic('cart')} ${p.stock ? 'В корзину' : 'Нет в наличии'}</button>
      </div>
    </div>
  </article>`;
}

/* Средняя разница с ценой оригинала при пересчёте по курсу ЦБ */
function avgDiscount() {
  const ps = allProducts();
  const orig = ps.reduce((s, p) => s + p.originUsd * USD_RUB, 0);
  const ours = ps.reduce((s, p) => s + p.price, 0);
  return Math.round((1 - ours / orig) * 100);
}

/* ---------- Главная ---------- */
function viewHome() {
  const hits = allProducts().filter(p => p.badge === 'hit' || p.badge === 'new').slice(0, 8);
  const totalSaved = allProducts().reduce((s, p) => s + Math.max(0, (p.originUsd * USD_RUB) - p.price), 0) / allProducts().length;

  return `<div class="view">
  <!-- HERO -->
  <section class="hero">
    <div class="hero-bg"><div class="blob blob-1"></div><div class="blob blob-2"></div><div class="blob blob-3"></div></div>
    <div class="grid-lines"></div>
    <div class="wrap">
      <div class="hero-grid">
        <div>
          <span class="eyebrow reveal">${ic('lab')} Advanced Global Peptides</span>
          <h1 class="reveal d1">Премиальные пептиды — <span class="grad-text">качество и надёжность</span></h1>
          <p class="hero-sub reveal d2">Каждая партия проходит ВЭЖХ и получает оригинальный сертификат анализа — чистота не ниже 99%. Склад в Москве, холодовая цепь 2–8 °C, доставка по России за 2–5 дней и оплата любым удобным способом.</p>
          <div class="hero-cta reveal d3">
            <a href="#/catalog" class="btn btn-p btn-lg">${ic('cart')} Перейти в каталог</a>
            <button class="btn btn-g btn-lg" data-modal="calc">${ic('chart')} Подобрать протокол</button>
          </div>
          <div class="hero-stats reveal d4">
            <div class="hstat"><b data-count="23">0</b><span>позиций в наличии</span></div>
            <div class="hstat"><b data-count="99" data-suffix="%">0</b><span>чистота по HPLC</span></div>
            <div class="hstat"><b data-count="2">0</b><span>дня средняя доставка</span></div>
            <div class="hstat"><b data-count="${Math.round(totalSaved)}" data-suffix=" ₽">0</b><span>средняя экономия</span></div>
          </div>
        </div>
        <div class="hero-card reveal d2">
          <div class="hero-vial">${productArt(allProducts().find(x => x.id === 'reta-10') || { id: 'hero', form: 'pen', cat: 'weight' }, '')}</div>
          <ul class="hero-feats">
            <li><i class="tick">${ic('check')}</i> Чистота 99% в каждой партии</li>
            <li><i class="tick">${ic('check')}</i> Сертификат анализа (CoA) на каждый товар</li>
            <li><i class="tick">${ic('check')}</i> Холодовая цепь 2–8 °C при доставке</li>
            <li><i class="tick">${ic('check')}</i> Бактериостатическая вода в подарок</li>
            <li><i class="tick">${ic('check')}</i> Оплата: СБП, карты, крипта, рассрочка</li>
          </ul>
          <div class="ruo">Research Use Only · Not for human consumption</div>
        </div>
      </div>

      <div class="trust-row">
        ${[['shield','Проверенное качество','HPLC + LC-MS на партию'],
           ['truck','Доставка по РФ и СНГ','СДЭК, Почта, Яндекс'],
           ['card','9 способов оплаты','СБП, карты, крипта, «Долями»'],
           ['snow','Термоконтейнер','Хладоэлементы в каждой посылке']]
          .map(([i,t,s],k)=>`<div class="trust reveal d${k+1}"><div class="trust-ic">${ic(i)}</div><div><b>${t}</b><span>${s}</span></div></div>`).join('')}
      </div>
    </div>
  </section>

  <!-- ЭКОНОМИЯ -->
  <section class="wrap">
    <div class="save-band reveal">
      <div class="save-grid">
        <div class="save-i"><b>−${avgDiscount()}%</b><span>средняя разница с ценами зарубежных магазинов при пересчёте в рубли</span></div>
        <div class="save-i"><b>0 ₽</b><span>комиссия за конвертацию — цены зафиксированы в рублях</span></div>
        <div class="save-i"><b>15 000 ₽</b><span>порог бесплатной доставки по всей России</span></div>
        <div class="save-i"><b>5%</b><span>бонусами возвращается с каждого заказа в личный кабинет</span></div>
      </div>
    </div>
  </section>

  <!-- КАК ЗАКАЗАТЬ -->
  <section class="sec wrap" id="how">
    <div class="sec-head reveal">
      <span class="eyebrow">${ic('box')} Три шага</span>
      <h2>Заказ за две минуты</h2>
      <p>Регистрация не обязательна — но с личным кабинетом вы получаете историю заказов, трекинг, бонусы и сертификаты на свои партии.</p>
    </div>
    <div class="steps">
      ${[['cart','Собираете корзину','Отмечаете позиции в каталоге. Цены в рублях, итог виден сразу — без пересчёта на оплате.'],
         ['card','Выбираете оплату','СБП по QR, карта, SberPay, T-Pay, ЮMoney, «Долями» на 4 платежа, криптовалюта со скидкой 3% или наличные курьеру.'],
         ['truck','Получаете посылку','Термоконтейнер, трек-номер в кабинете и Telegram, бактериостатическая вода в подарок к каждому флакону.']]
        .map(([i,t,d],k)=>`<div class="step reveal d${k+1}"><div class="step-ic">${ic(i)}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
    </div>
  </section>

  <!-- ХИТЫ -->
  <section class="sec wrap" id="popular" style="padding-top:0">
    <div class="sec-head reveal" style="display:flex;justify-content:space-between;align-items:flex-end;max-width:none;gap:20px;flex-wrap:wrap">
      <div style="max-width:560px">
        <span class="eyebrow">${ic('flame')} Выбор покупателей</span>
        <h2>Хиты и новинки</h2>
        <p>Позиции, которые заказывают чаще всего. Все — из партий с актуальным CoA.</p>
      </div>
      <a href="#/catalog" class="btn btn-g">Весь каталог ${ic('arrow')}</a>
    </div>
    <div class="grid-p">${hits.map(productCard).join('')}</div>
  </section>

  <!-- НАУКА -->
  <section class="sec" class="band" style="background:var(--bg-2);border-block:1px solid var(--line)">
    <div class="wrap">
      <div class="sec-head reveal">
        <span class="eyebrow">${ic('brain')} Простыми словами</span>
        <h2>Что такое пептиды и почему они работают</h2>
        <p>Без маркетинга — три факта, которые объясняют, почему чистота и температура хранения важнее красивой упаковки.</p>
      </div>
      <div class="sci">
        <div class="sci-card reveal d1">
          <h3>Короткая цепочка</h3>
          <p>Белок — длинная нить из аминокислот, сотни звеньев. Пептид — та же нить, но короткая. У BPC-157 ровно пятнадцать звеньев, и их порядок известен до буквы.</p>
          <div class="chain">${'GEPPPGKPADDAGLV'.split('').map(a=>`<span class="aa">${a}</span>`).join('')}</div>
        </div>
        <div class="sci-card reveal d2">
          <h3>Родной язык организма</h3>
          <p>Тело само производит сотни пептидов: инсулин, окситоцин, эндорфины. Они работают как курьеры — приносят клеткам короткие точные приказы. Поэтому организм не воспринимает их как чужеродную химию.</p>
        </div>
        <div class="sci-card reveal d3">
          <h3>Форма решает всё</h3>
          <p>Цепочка сворачивается в спираль, и именно эта форма определяет, подойдёт ли молекула к рецептору. Форму ломают жара, свет и заморозка — поэтому 2–8 °C без морозилки это не маркетинг, а условие результата.</p>
          <div class="kpis" style="margin-top:18px">
            <div class="kpi"><span>Хранение</span><b>2–8 °C</b></div>
            <div class="kpi"><span>Заморозок</span><b>0</b></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ОПЛАТА -->
  <section class="sec wrap" id="pay">
    <div class="sec-head reveal">
      <span class="eyebrow">${ic('card')} Оплата</span>
      <h2>Платите как удобно вам</h2>
      <p>Девять способов — от мгновенного СБП до безналичного расчёта по счёту для юридических лиц.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px">
      ${PAYMENTS.map((p,k)=>`<div class="opt reveal d${(k%6)+1}" style="cursor:default">
        <div class="opt-ic">${ic(p.icon)}</div>
        <div class="opt-txt"><b>${p.name}</b><span>${p.desc}</span></div>
        ${p.badge?`<span class="mini-badge">${p.badge}</span>`:''}
      </div>`).join('')}
    </div>
    <div class="note brand reveal" style="margin-top:18px">${ic('info')}
      <span>Данные карты обрабатываются на стороне платёжного провайдера по стандарту PCI DSS — магазин их не получает и не хранит. Оплата по счёту для юрлиц: закрывающие документы отправляем по ЭДО.</span>
    </div>
  </section>

  <!-- СЕРТИФИКАТЫ -->
  <section class="sec wrap" id="coa" style="padding-top:0">
    <div class="sec-head reveal">
      <span class="eyebrow">${ic('doc')} Сертификаты</span>
      <h2>Certificate of Analysis на каждую партию</h2>
      <p>${CERTIFICATES.length} оригинальных лабораторных отчёта. Метод: ВЭЖХ с УФ-детектированием
         (HPLC-UV) плюс подтверждение идентичности масс-спектрометрией (LC-MS).
         Нажмите на отчёт, чтобы открыть оригинал PDF.</p>
    </div>
    <div class="cert-grid">
      ${CERTIFICATES.map((c, k) => `
        <a class="cert reveal d${(k % 6) + 1}" href="assets/coa/${c.file}.pdf" target="_blank" rel="noopener"
           data-cert="${c.file}"
           title="Открыть оригинал PDF: ${esc(c.name)}, партия ${esc(c.code)}">
          <div class="cert-shot">
            <img src="${coaShot(c.file)}" alt="Сертификат анализа ${esc(c.name)}"
                 width="560" height="726" loading="lazy" decoding="async">
            <span class="cert-open">${ic('doc')} Открыть PDF</span>
          </div>
          <div class="cert-body">
            <b>${esc(c.name)}</b>
            <div class="batch">Партия: ${esc(c.code)}</div>
            <div class="coa-nums">
              <div><span>Чистота</span><b>${esc(c.purity)}</b></div>
              <div><span>Содержание</span><b style="color:var(--text)">${esc(c.content)}</b></div>
              <div><span>Дата</span><b style="color:var(--text)">${esc(c.date)}</b></div>
            </div>
            <div class="cert-meth">${ic('check')} Идентичность подтверждена LC-MS · ${esc(c.method)}</div>
          </div>
        </a>`).join('')}
    </div>
    <p class="cert-note reveal">Не нашли сертификат на нужную позицию? Напишите менеджеру —
      предоставим отчёт по вашей партии. Все документы предназначены для исследовательских целей.</p>
  </section>

  <!-- ОТЗЫВЫ -->
  <section class="sec" class="band" style="background:var(--bg-2);border-block:1px solid var(--line)">
    <div class="wrap">
      <div class="sec-head reveal">
        <span class="eyebrow">${ic('users')} Отзывы</span>
        <h2>Что пишут покупатели</h2>
        <p>Отзывы оставляют только те, кто получил заказ — привязка к номеру в личном кабинете.</p>
      </div>
      <div class="rev-track">
        ${REVIEWS.map(r=>`<div class="rev">
          ${stars(r.rating)}
          <p>«${esc(r.text)}»</p>
          <div class="rev-who"><div class="rev-av">${esc(r.name[0])}</div>
            <div><b>${esc(r.name)}</b><span>${esc(r.city)} · ${r.date}</span></div></div>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="sec wrap" id="faq">
    <div class="sec-head reveal">
      <span class="eyebrow">${ic('info')} Вопросы</span>
      <h2>Частые вопросы</h2>
      <p>Не нашли ответ — напишите в Telegram, отвечаем в течение 15 минут в рабочее время.</p>
    </div>
    <div class="reveal">
      ${FAQ.map((f,i)=>`<div class="acc-item" data-faq="${i}">
        <button class="acc-q">${esc(f.q)} <i>${ic('plus')}</i></button>
        <div class="acc-a"><p>${esc(f.a)}</p></div>
      </div>`).join('')}
    </div>
  </section>
  </div>`;
}

/* ---------- Каталог ---------- */
function filtered() {
  let list = allProducts();
  if (F.cat !== 'all')  list = list.filter(p => p.cat === F.cat);
  if (F.form !== 'all') list = list.filter(p => p.form === F.form);
  if (F.q) {
    const q = F.q.toLowerCase();
    list = list.filter(p => (p.name + ' ' + p.dose + ' ' + p.tagline + ' ' + p.about).toLowerCase().includes(q));
  }
  const rank = { hit: 0, new: 1 };
  if (F.sort === 'asc')  list.sort((a, b) => a.price - b.price);
  if (F.sort === 'desc') list.sort((a, b) => b.price - a.price);
  if (F.sort === 'rate') list.sort((a, b) => b.rating - a.rating);
  if (F.sort === 'pop')  list.sort((a, b) => (rank[a.badge] ?? 2) - (rank[b.badge] ?? 2) || b.reviews - a.reviews);
  return list;
}

function viewCatalog() {
  const list = filtered();
  return `<div class="view">
  <section class="wrap" style="padding-top:34px">
    <div class="sec-head" style="margin-bottom:22px">
      <span class="eyebrow">${ic('grid')} Каталог</span>
      <h2>Пептиды с подтверждённой чистотой</h2>
      <p>Цены в рублях, зафиксированы. К каждому флакону — бактериостатическая вода в подарок.</p>
    </div>
  </section>
  <div class="cat-bar">
    <div class="wrap">
      <div class="cat-tools">
        <label class="search">
          ${ic('search')}
          <input id="q" placeholder="Поиск: BPC-157, ретатрутид, сон…" value="${esc(F.q)}" autocomplete="off">
          <button class="clr" id="qclr">${ic('x')}</button>
        </label>
        <select class="sel" id="form">
          <option value="all"${F.form==='all'?' selected':''}>Любая форма</option>
          <option value="pen"${F.form==='pen'?' selected':''}>Пептидные ручки</option>
          <option value="vial"${F.form==='vial'?' selected':''}>Флаконы</option>
          <option value="water"${F.form==='water'?' selected':''}>Растворители</option>
        </select>
        <select class="sel" id="sort">
          <option value="pop"${F.sort==='pop'?' selected':''}>Сначала популярные</option>
          <option value="asc"${F.sort==='asc'?' selected':''}>Цена: по возрастанию</option>
          <option value="desc"${F.sort==='desc'?' selected':''}>Цена: по убыванию</option>
          <option value="rate"${F.sort==='rate'?' selected':''}>По рейтингу</option>
        </select>
      </div>
      <div class="chips" style="margin-top:12px">
        ${CATEGORIES.map(c=>`<button class="chip ${F.cat===c.id?'on':''}" data-cat="${c.id}">${ic(c.icon)} ${c.name}</button>`).join('')}
      </div>
    </div>
  </div>
  <section class="wrap" style="padding-bottom:60px">
    <p class="muted" style="font-size:13.5px;margin-bottom:16px">${plural(list.length,'товар','товара','товаров')}</p>
    <div class="grid-p" id="grid">
      ${list.length ? list.map(productCard).join('')
        : `<div class="empty">${ic('search')}<h3>Ничего не найдено</h3><p class="muted" style="margin-top:8px">Попробуйте изменить запрос или сбросить фильтры</p>
           <button class="btn btn-o btn-sm" id="reset" style="margin-top:18px">Сбросить фильтры</button></div>`}
    </div>
  </section>
  </div>`;
}

/* ---------- Карточка товара ---------- */
function viewProduct(id) {
  const p = getProduct(id);
  if (!p) return `<div class="wrap sec"><div class="empty">${ic('warn')}<h3>Товар не найден</h3>
    <a href="#/catalog" class="btn btn-p btn-sm" style="margin-top:18px">В каталог</a></div></div>`;
  const pm = perMg(p);
  const save = p.marketRu > p.price ? Math.round((1 - p.price / p.marketRu) * 100) : 0;
  const same = allProducts().filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  return `<div class="view wrap" style="padding-top:28px">
    <nav style="font-size:13px;color:var(--text-3);margin-bottom:22px">
      <a href="#/">Главная</a> / <a href="#/catalog">Каталог</a> / <span style="color:var(--text-2)">${esc(p.name)} ${esc(p.dose)}</span>
    </nav>
    <div class="pdp">
      <div>
        <div class="pdp-media">
          <div class="tags">
            ${p.badge==='hit'?'<span class="tag tag-hit">Хит</span>':''}
            ${p.badge==='new'?'<span class="tag tag-new">Новинка</span>':''}
            ${save>=10?`<span class="tag tag-save">−${save}%</span>`:''}
          </div>
          <button class="fav ${isFav(p.id)?'on':''}" data-fav="${p.id}">${ic('heart')}</button>
          ${productArt(p)}
        </div>
        <div class="note brand" style="margin-top:14px">${ic('gift')}
          <span>${p.form==='vial'?'К этому флакону бесплатно кладём бактериостатическую воду 3 мл — растворитель, с которым раствор хранится до 6 месяцев.':'Ручка поставляется предзаполненной: разводить ничего не нужно.'}</span>
        </div>
      </div>

      <div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <span class="eyebrow">${ic((CATEGORIES.find(c=>c.id===p.cat)||{}).icon||'grid')} ${(CATEGORIES.find(c=>c.id===p.cat)||{}).name}</span>
          <span class="instock ${p.stock<=10?'low':''}" style="font-size:13px"><i class="dot"></i>${p.stock>0?`В наличии · ${p.stock} шт.`:'Нет в наличии'}</span>
        </div>
        <h1>${esc(p.name)} <span style="color:var(--brand)">${esc(p.dose)}</span></h1>
        <p class="muted" style="font-size:16.5px">${esc(p.tagline)}</p>
        <div style="display:flex;align-items:center;gap:10px;margin-top:14px;font-size:13.5px;color:var(--text-3)">
          ${stars(p.rating)}<b style="color:var(--text)">${p.rating}</b> · ${plural(p.reviews,'отзыв','отзыва','отзывов')}
        </div>

        <div class="pdp-price">
          <span class="price">${rub(p.price)}</span>
          ${p.marketRu>p.price?`<span class="price-old" style="font-size:17px">${rub(p.marketRu)}</span>`:''}
          ${save?`<span class="tag tag-save" style="align-self:center">выгода ${rub(p.marketRu-p.price)}</span>`:''}
        </div>
        ${pm?`<p class="dim" style="font-size:13px;margin-top:-12px">${rub(pm)} за миллиграмм · ${p.form==='pen'?'пептидная ручка':'флакон, лиофилизат'}</p>`:''}

        <div style="display:flex;gap:10px;margin:24px 0;flex-wrap:wrap">
          <div class="qty" style="height:52px">
            <button data-pq="-">${ic('minus')}</button><span id="pq">1</span><button data-pq="+">${ic('plus')}</button>
          </div>
          <button class="btn btn-p" style="flex:1;min-width:180px;--bh:52px" data-addq="${p.id}" ${p.stock?'':'disabled'}>
            ${ic('cart')} ${p.stock?'Добавить в корзину':'Нет в наличии'}
          </button>
          <button class="btn btn-g" data-buy="${p.id}" ${p.stock?'':'disabled'} style="--bh:52px">Купить в 1 клик</button>
        </div>

        <div class="specs">
          ${Object.entries(p.specs).map(([k,v])=>`<div class="spec"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}
        </div>

        <div class="pdp-tabs">
          <button class="pdp-tab on" data-tab="about">Описание</button>
          <button class="pdp-tab" data-tab="coa">Сертификат</button>
          <button class="pdp-tab" data-tab="ship">Доставка и оплата</button>
        </div>
        <div id="tab-body">${tabAbout(p)}</div>
      </div>
    </div>

    ${same.length?`<section class="sec" style="padding-bottom:20px">
      <div class="sec-head"><h2 style="font-size:1.6rem">Похожие позиции</h2></div>
      <div class="grid-p">${same.map(productCard).join('')}</div>
    </section>`:''}
  </div>`;
}

const tabAbout = p => `<p class="muted" style="font-size:15px;line-height:1.75">${esc(p.about)}</p>
  <div class="note" style="margin-top:16px">${ic('warn')}
    <span>Реактив для лабораторных исследований (Research Use Only). Не является лекарственным средством, БАД или косметикой. Не для употребления человеком или животными.</span></div>`;

const tabCoa = p => `<div class="panel" style="padding:22px">
    <div class="panel-head"><h3>Партия ${p.coa.batch}</h3><span class="status s-done">${ic('check')} Проверено</span></div>
    <div class="kpis">
      <div class="kpi"><span>Чистота (HPLC-UV)</span><b style="color:var(--brand)">${p.coa.purity}</b></div>
      <div class="kpi"><span>Содержание</span><b>${p.coa.content}</b></div>
      <div class="kpi"><span>Дата анализа</span><b style="font-size:19px">${p.coa.date}</b></div>
      <div class="kpi"><span>Метод</span><b style="font-size:15px">${p.coa.method}</b></div>
    </div>
    <p class="dim" style="font-size:13px;margin-top:16px">Идентичность подтверждена LC-MS. Полный PDF-отчёт доступен в личном кабинете после оформления заказа и по запросу у менеджера.</p>
  </div>`;

const tabShip = p => `<div style="display:grid;gap:9px">
    ${SHIPPING.map(s=>`<div class="opt" style="cursor:default"><div class="opt-ic">${ic('truck')}</div>
      <div class="opt-txt"><b>${s.name}</b><span>${s.days}${s.free?` · бесплатно от ${rub(s.free)}`:''}</span></div>
      <span class="opt-r">${s.price?rub(s.price):'0 ₽'}</span></div>`).join('')}
  </div>
  <div class="note brand" style="margin-top:14px">${ic('snow')}
    <span>Все заказы с пептидами едут в термоконтейнере с хладоэлементами. Если посылка пришла тёплой — заменим за наш счёт по фото при получении.</span></div>`;

/* ---------- Корзина (страница) ---------- */
function viewCart() {
  const t = totals();
  if (!t.lines.length) return `<div class="view wrap sec"><div class="empty">${ic('cart')}
    <h3>Корзина пуста</h3><p class="muted" style="margin-top:8px">Загляните в каталог — там 23 позиции с подтверждённым CoA</p>
    <a href="#/catalog" class="btn btn-p" style="margin-top:20px">В каталог ${ic('arrow')}</a></div></div>`;

  return `<div class="view wrap" style="padding-top:30px">
    <div class="sec-head" style="margin-bottom:24px"><h2>Корзина</h2><p>${plural(cartCount(),'товар','товара','товаров')} на сумму ${rub(t.sub)}</p></div>
    <div style="display:grid;grid-template-columns:1fr 370px;gap:22px;align-items:start" class="cart-layout">
      <div class="panel">
        ${t.lines.map(l=>`<div class="citem">
          <div class="citem-img">${productArt(l,'')}</div>
          <div class="citem-info">
            <b>${esc(l.name)} ${esc(l.dose)}</b>
            <span>${rub(l.price)} за шт.${l.marketRu>l.price?` · <s>${rub(l.marketRu)}</s>`:''}</span>
            <div class="citem-bot">
              <div class="qty"><button data-q="-" data-id="${l.id}">${ic('minus')}</button><span>${l.q}</span><button data-q="+" data-id="${l.id}">${ic('plus')}</button></div>
              <b style="font:800 16px/1 var(--head)">${rub(l.sum)}</b>
              <button class="citem-del" data-del="${l.id}">${ic('trash')}</button>
            </div>
          </div>
        </div>`).join('')}
        <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
          <a href="#/catalog" class="btn btn-g btn-sm">${ic('arrow')} Продолжить покупки</a>
          <button class="btn btn-ghost btn-sm" id="clear-cart">${ic('trash')} Очистить корзину</button>
        </div>
      </div>
      <div class="panel">
        <h3 style="margin-bottom:16px">Итого</h3>
        ${promoBox()}
        <div class="sum-row"><span>Товары (${cartCount()})</span><b>${rub(t.sub)}</b></div>
        ${t.saved?`<div class="sum-row"><span>Выгода к рынку РФ</span><b class="save">−${rub(t.saved)}</b></div>`:''}
        ${t.disc?`<div class="sum-row"><span>Промокод ${S.promo}</span><b class="save">−${rub(t.disc)}</b></div>`:''}
        <div class="sum-row"><span>Доставка</span><b>${t.sub-t.disc>=15000?'бесплатно':'от 290 ₽'}</b></div>
        <div class="sum-row total"><span>К оплате</span><span>${rub(t.sub-t.disc)}</span></div>
        <p class="dim" style="font-size:12.5px;margin:10px 0 16px">Вернём ${rub(t.cashback)} бонусами на счёт в личном кабинете</p>
        <a href="#/checkout" class="btn btn-p btn-block">Оформить заказ ${ic('arrow')}</a>
        ${freeShipBar(t.sub-t.disc)}
      </div>
    </div>
  </div>`;
}

const promoBox = () => `<div style="display:flex;gap:8px;margin-bottom:14px">
    <input class="inp" id="promo" placeholder="Промокод" value="${S.promo||''}" style="height:44px">
    <button class="btn btn-g btn-sm" id="promo-go">ОК</button>
  </div>
  ${S.promo?`<p style="font-size:12.5px;color:var(--brand);margin:-6px 0 12px">${ic('check')} ${PROMOS[S.promo].desc}</p>`
   :`<p class="dim" style="font-size:12px;margin:-6px 0 12px">Попробуйте <b style="color:var(--accent);cursor:pointer" class="promo-hint">WELCOME10</b> — скидка 10% на первый заказ</p>`}`;

function freeShipBar(sum) {
  const need = 15000 - sum;
  if (need <= 0) return `<div class="note brand" style="margin-top:14px;padding:12px 14px;font-size:12.5px">${ic('check')}<span>Доставка по России бесплатно</span></div>`;
  return `<div class="progress-free" style="margin-top:16px">
    <p>До бесплатной доставки — <b style="color:var(--text)">${rub(need)}</b></p>
    <div class="bar"><i style="width:${Math.min(100, sum/15000*100)}%"></i></div></div>`;
}

/* ---------- Шторка-корзина ---------- */
function renderDrawer() {
  const t = totals();
  $('#drawer-body').innerHTML = t.lines.length
    ? t.lines.map(l => `<div class="citem">
        <div class="citem-img">${productArt(l,'')}</div>
        <div class="citem-info"><b>${esc(l.name)} ${esc(l.dose)}</b><span>${rub(l.price)} × ${l.q}</span>
          <div class="citem-bot">
            <div class="qty"><button data-q="-" data-id="${l.id}">${ic('minus')}</button><span>${l.q}</span><button data-q="+" data-id="${l.id}">${ic('plus')}</button></div>
            <b style="font:800 15px/1 var(--head)">${rub(l.sum)}</b>
            <button class="citem-del" data-del="${l.id}">${ic('trash')}</button>
          </div></div></div>`).join('')
    : `<div class="empty" style="padding:50px 10px">${ic('cart')}<h3 style="font-size:18px">Пока пусто</h3>
       <p class="muted" style="margin-top:8px;font-size:14px">Добавьте товары из каталога</p></div>`;

  $('#drawer-foot').innerHTML = t.lines.length ? `
    ${freeShipBar(t.sub - t.disc)}
    <div class="sum-row"><span>Товары</span><b>${rub(t.sub)}</b></div>
    ${t.saved?`<div class="sum-row"><span>Выгода</span><b class="save">−${rub(t.saved)}</b></div>`:''}
    <div class="sum-row total"><span>Итого</span><span>${rub(t.sub - t.disc)}</span></div>
    <a href="#/checkout" class="btn btn-p btn-block" style="margin-top:12px" data-close-drawer>Оформить заказ ${ic('arrow')}</a>
    <a href="#/cart" class="btn btn-ghost btn-block btn-sm" style="margin-top:6px" data-close-drawer>Перейти в корзину</a>`
    : `<a href="#/catalog" class="btn btn-p btn-block" data-close-drawer>В каталог</a>`;
}

/* ---------- Оформление ---------- */
const CH = { step: 1, shipId: 'cdek-pvz', payId: 'sbp', contact: {}, address: '' };

function viewCheckout() {
  if (!cartLines().length) { location.hash = '#/cart'; return ''; }
  const t = totals(CH.shipId);
  const u = S.user;
  return `<div class="view wrap" style="padding-top:30px">
    <div class="sec-head" style="margin-bottom:22px"><h2>Оформление заказа</h2>
      <p>Заполните три шага — на всё уходит около минуты. Регистрация не обязательна.</p></div>

    <div class="stepper">
      ${['Контакты','Доставка','Оплата'].map((n,i)=>`<div class="st ${CH.step>i+1?'done':CH.step===i+1?'on':''}">
        <div class="st-bar"><i></i></div><span>${i+1}. ${n}</span></div>`).join('')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 370px;gap:22px;align-items:start" class="cart-layout">
      <div class="panel" id="ch-body">${checkoutStep()}</div>
      <div class="panel">
        <h3 style="margin-bottom:14px">Ваш заказ</h3>
        ${t.lines.map(l=>`<div class="sum-row"><span>${esc(l.name)} ${esc(l.dose)} × ${l.q}</span><b style="color:var(--text)">${rub(l.sum)}</b></div>`).join('')}
        <div style="border-top:1px solid var(--line);margin:10px 0"></div>
        ${promoBox()}
        <div class="sum-row"><span>Подытог</span><b>${rub(t.sub)}</b></div>
        ${t.disc?`<div class="sum-row"><span>Скидка</span><b class="save">−${rub(t.disc)}</b></div>`:''}
        <div class="sum-row"><span>Доставка</span><b>${t.shipCost?rub(t.shipCost):'бесплатно'}</b></div>
        <div class="sum-row total"><span>К оплате</span><span>${rub(t.total)}</span></div>
        <p class="dim" style="font-size:12.5px;margin-top:10px">${ic('gift')} Бонусами вернётся ${rub(t.cashback)}</p>
        ${u?'':`<div class="note" style="margin-top:14px;font-size:12.5px">${ic('info')}<span>Войдите, чтобы копить бонусы и видеть трекинг в личном кабинете</span></div>`}
      </div>
    </div>
  </div>`;
}

function checkoutStep() {
  const u = S.user;
  if (CH.step === 1) return `
    <h3 style="margin-bottom:18px">Контактные данные</h3>
    <div class="row2">
      <div class="field"><label>Имя и фамилия <span class="req">*</span></label>
        <input class="inp" id="c-name" value="${esc(CH.contact.name||(u?u.name:''))}" placeholder="Иван Петров">
        <div class="err-msg">Укажите имя</div></div>
      <div class="field"><label>Телефон <span class="req">*</span></label>
        <input class="inp" id="c-phone" value="${esc(CH.contact.phone||(u?u.phone||'':''))}" placeholder="+7 999 123-45-67">
        <div class="err-msg">Введите телефон в формате +7…</div></div>
    </div>
    <div class="field"><label>E-mail <span class="req">*</span></label>
      <input class="inp" id="c-email" value="${esc(CH.contact.email||(u?u.email:''))}" placeholder="mail@example.com">
      <div class="err-msg">Проверьте адрес почты</div></div>
    <div class="field"><label>Telegram (не обязательно)</label>
      <input class="inp" id="c-tg" value="${esc(CH.contact.tg||'')}" placeholder="@username — пришлём трек-номер"></div>
    <label class="check"><input type="checkbox" id="c-agree" checked>
      <span>Мне есть 18 лет. Я подтверждаю, что приобретаю реактивы для лабораторных исследований и не для употребления человеком или животными.</span></label>
    <button class="btn btn-p btn-block" id="ch-next">Далее — доставка ${ic('arrow')}</button>`;

  if (CH.step === 2) return `
    <h3 style="margin-bottom:18px">Способ доставки</h3>
    ${SHIPPING.map(s=>`<label class="opt ${CH.shipId===s.id?'on':''}" data-ship="${s.id}">
      <input type="radio" name="ship" ${CH.shipId===s.id?'checked':''}>
      <div class="opt-ic">${ic(s.id==='pickup'?'pin':'truck')}</div>
      <div class="opt-txt"><b>${s.name}</b><span>${s.days}${s.free?` · бесплатно от ${rub(s.free)}`:''}</span></div>
      <span class="opt-r">${s.price?rub(s.price):'0 ₽'}</span></label>`).join('')}
    <div class="field" style="margin-top:16px"><label>Адрес или пункт выдачи <span class="req">*</span></label>
      <textarea class="inp" id="c-addr" placeholder="Город, улица, дом, квартира. Для ПВЗ — адрес пункта или его код">${esc(CH.address)}</textarea>
      <div class="err-msg">Укажите адрес доставки</div></div>
    <div class="field"><label>Комментарий к заказу</label>
      <input class="inp" id="c-comment" placeholder="Например: позвонить за час"></div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-g" id="ch-back">Назад</button>
      <button class="btn btn-p" style="flex:1" id="ch-next">Далее — оплата ${ic('arrow')}</button>
    </div>`;

  const t = totals(CH.shipId);
  return `
    <h3 style="margin-bottom:18px">Способ оплаты</h3>
    ${PAYMENTS.map(p=>`<label class="opt ${CH.payId===p.id?'on':''}" data-pay="${p.id}">
      <input type="radio" name="pay" ${CH.payId===p.id?'checked':''}>
      <div class="opt-ic">${ic(p.icon)}</div>
      <div class="opt-txt"><b>${p.name}</b><span>${p.desc}</span></div>
      ${p.badge?`<span class="mini-badge">${p.badge}</span>`:''}</label>`).join('')}
    <div class="note brand" style="margin:16px 0">${ic('lock')}
      <span>Соединение защищено. Реквизиты карты вводятся на стороне платёжного провайдера (PCI DSS) — магазин их не видит и не хранит.</span></div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-g" id="ch-back">Назад</button>
      <button class="btn btn-p" style="flex:1" id="ch-pay">${ic('lock')} Оплатить ${rub(t.total)}</button>
    </div>`;
}
