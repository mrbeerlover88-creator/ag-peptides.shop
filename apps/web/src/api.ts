const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export type Product = {
  id: string;
  name: string;
  dose: string;
  form: 'PEN' | 'VIAL' | 'WATER';
  badge: string | null;
  price: number;
  marketPrice: number | null;
  tagline: string;
  about: string;
  specs: Record<string, string>;
  stock: number;
  rating: number | null;
  reviews: number;
  imageKey: string | null;
  category: { id: string; name: string; icon: string | null };
  coa: { batch: string; purity: string | null; content: string | null; method: string | null } | null;
};

export type ShippingMethod = {
  id: string;
  name: string;
  days: string;
  price: number;
  freeFromTotal: number | null;
};

export type PaymentMethod = {
  id: string;
  name: string;
  desc: string;
  badge: string | null;
};

export type Promo = {
  code: string;
  type: string;
  value: number;
  minTotal: number | null;
  desc: string;
};

export type CatalogResponse = {
  categories: Array<{ id: string; name: string; icon: string | null }>;
  products: Product[];
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  promos: Promo[];
};

export async function getCatalog(): Promise<CatalogResponse> {
  const res = await fetch(`${API_URL}/catalog`);
  if (!res.ok) throw new Error('Не удалось загрузить каталог');
  return res.json();
}

export async function createOrder(payload: unknown) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Не удалось оформить заказ');
  return body.order as { id: string; total: number; trackingCode: string };
}
