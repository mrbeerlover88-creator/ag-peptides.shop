import { useEffect, useMemo, useState } from 'react';
import { Check, FlaskConical, Lock, Minus, Plus, Search, ShoppingCart, Truck } from 'lucide-react';
import { createOrder, getCatalog, type CatalogResponse, type Product } from './api.js';

type CartLine = { productId: string; quantity: number };

const rub = (value: number) => new Intl.NumberFormat('ru-RU').format(Math.round(value)) + ' ₽';

export function App() {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [shippingMethodId, setShippingMethodId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCatalog()
      .then((data) => {
        setCatalog(data);
        setShippingMethodId(data.shippingMethods[0]?.id ?? '');
        setPaymentMethodId(data.paymentMethods[0]?.id ?? '');
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const productsById = useMemo(() => new Map(catalog?.products.map((product) => [product.id, product]) ?? []), [catalog]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return (catalog?.products ?? []).filter((product) => {
      const byCategory = category === 'all' || product.category.id === category;
      const byQuery = !q || `${product.name} ${product.dose} ${product.tagline}`.toLowerCase().includes(q);
      return byCategory && byQuery;
    });
  }, [catalog, category, query]);

  const lines = cart
    .map((line) => ({ product: productsById.get(line.productId), quantity: line.quantity }))
    .filter((line): line is { product: Product; quantity: number } => Boolean(line.product));
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const promo = catalog?.promos.find((item) => item.code === promoCode.trim().toUpperCase());
  const discount = promo?.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo?.type === 'fixed' ? promo.value : 0;
  const shipping = catalog?.shippingMethods.find((method) => method.id === shippingMethodId);
  const shippingCost = shipping && shipping.freeFromTotal && subtotal - discount >= shipping.freeFromTotal ? 0 : shipping?.price ?? 0;
  const total = Math.max(0, subtotal - discount) + shippingCost;

  function addToCart(productId: string) {
    setCart((current) => {
      const line = current.find((item) => item.productId === productId);
      if (!line) return [...current, { productId, quantity: 1 }];
      return current.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item));
    });
  }

  function changeQuantity(productId: string, delta: number) {
    setCart((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lines.length) return;
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError('');
    try {
      const order = await createOrder({
        contact: {
          name: String(form.get('name') ?? ''),
          email: String(form.get('email') ?? ''),
          phone: String(form.get('phone') ?? ''),
          telegram: String(form.get('telegram') ?? '')
        },
        shippingMethodId,
        paymentMethodId,
        address: String(form.get('address') ?? ''),
        comment: String(form.get('comment') ?? ''),
        promoCode: promoCode || undefined,
        items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity }))
      });
      setCart([]);
      setOrderId(order.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка оформления заказа');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (error && !catalog) return <main className="shell state">{error}</main>;
  if (!catalog) return <main className="shell state">Загружаем каталог...</main>;

  return (
    <main>
      <header className="hero">
        <nav className="nav shell">
          <strong>AG Peptides</strong>
          <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} в корзине</span>
        </nav>
        <section className="shell hero-grid">
          <div>
            <span className="eyebrow">Research Use Only</span>
            <h1>Исследовательские пептиды с CoA и доставкой по России</h1>
            <p>Первый рабочий перенос прототипа на frontend + API + PostgreSQL. Каталог и оформление заказа уже идут через сервер.</p>
          </div>
          <div className="hero-card">
            <FlaskConical size={42} />
            <b>{catalog.products.length} товаров</b>
            <span>seed из исходного HTML</span>
          </div>
        </section>
      </header>

      <section className="shell toolbar">
        <label className="search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по каталогу" />
        </label>
        <div className="chips">
          <button className={category === 'all' ? 'on' : ''} onClick={() => setCategory('all')}>Все</button>
          {catalog.categories.map((item) => (
            <button key={item.id} className={category === item.id ? 'on' : ''} onClick={() => setCategory(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
      </section>

      <section className="shell layout">
        <div className="grid">
          {filtered.map((product) => (
            <article className="card" key={product.id}>
              <div className="art">
                <FlaskConical />
                {product.badge && <span>{product.badge}</span>}
              </div>
              <h2>{product.name} <small>{product.dose}</small></h2>
              <p>{product.tagline}</p>
              <div className="meta">
                <span>{product.category.name}</span>
                <span>{product.coa?.purity ?? 'CoA'}</span>
              </div>
              <div className="buy">
                <strong>{rub(product.price)}</strong>
                <button onClick={() => addToCart(product.id)} disabled={product.stock <= 0}>
                  <ShoppingCart size={16} /> В корзину
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="checkout">
          <h2>Заказ</h2>
          {lines.length ? (
            <div className="cart-lines">
              {lines.map((line) => (
                <div className="cart-line" key={line.product.id}>
                  <div>
                    <b>{line.product.name}</b>
                    <span>{line.product.dose} · {rub(line.product.price)}</span>
                  </div>
                  <div className="qty">
                    <button onClick={() => changeQuantity(line.product.id, -1)}><Minus size={14} /></button>
                    <span>{line.quantity}</span>
                    <button onClick={() => changeQuantity(line.product.id, 1)}><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Корзина пока пустая.</p>
          )}

          <label className="field">
            Промокод
            <input value={promoCode} onChange={(event) => setPromoCode(event.target.value.toUpperCase())} placeholder="WELCOME10" />
          </label>

          <label className="field">
            Доставка
            <select value={shippingMethodId} onChange={(event) => setShippingMethodId(event.target.value)}>
              {catalog.shippingMethods.map((method) => (
                <option key={method.id} value={method.id}>{method.name} · {rub(method.price)}</option>
              ))}
            </select>
          </label>

          <label className="field">
            Оплата
            <select value={paymentMethodId} onChange={(event) => setPaymentMethodId(event.target.value)}>
              {catalog.paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>{method.name}</option>
              ))}
            </select>
          </label>

          <div className="totals">
            <span>Товары <b>{rub(subtotal)}</b></span>
            {discount > 0 && <span>Скидка <b>-{rub(discount)}</b></span>}
            <span>Доставка <b>{shippingCost ? rub(shippingCost) : 'бесплатно'}</b></span>
            <strong>Итого <b>{rub(total)}</b></strong>
          </div>

          <form onSubmit={submitOrder} className="order-form">
            <input name="name" required placeholder="Имя и фамилия" />
            <input name="phone" required placeholder="+7 999 123-45-67" />
            <input name="email" type="email" required placeholder="mail@example.com" />
            <input name="telegram" placeholder="@telegram" />
            <textarea name="address" required placeholder="Адрес или пункт выдачи" />
            <input name="comment" placeholder="Комментарий" />
            <button className="primary" disabled={!lines.length || isSubmitting}>
              <Lock size={16} /> {isSubmitting ? 'Оформляем...' : 'Оформить заказ'}
            </button>
          </form>

          {orderId && <div className="success"><Check size={18} /> Заказ {orderId} создан в PostgreSQL</div>}
          {error && <div className="error">{error}</div>}
          <p className="note"><Truck size={15} /> Реальная оплата пока не подключена: заказ создаётся как paid-demo.</p>
        </aside>
      </section>
    </main>
  );
}
