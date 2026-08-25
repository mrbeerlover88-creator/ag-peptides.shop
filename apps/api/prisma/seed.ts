import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import bcrypt from 'bcryptjs';
import { PrismaClient, ProductForm } from '@prisma/client';

const prisma = new PrismaClient();
const root = resolve(import.meta.dirname, '../../..');
const legacyHtml = readFileSync(resolve(root, 'AG-Peptides.html'), 'utf8');

type LegacyProduct = {
  id: string;
  img: string;
  name: string;
  dose: string;
  form: 'pen' | 'vial' | 'water';
  cat: string;
  badge: string | null;
  price: number;
  marketRu?: number;
  originUsd?: number;
  tagline: string;
  about: string;
  specs: Record<string, string>;
  coa: { batch: string; purity?: string; content?: string; date?: string; method?: string };
  stock: number;
  rating?: number;
  reviews?: number;
};

function extractConst<T>(name: string): T {
  const marker = `const ${name} = `;
  const start = legacyHtml.indexOf(marker);
  if (start < 0) throw new Error(`Cannot find ${name} in AG-Peptides.html`);
  const fromValue = start + marker.length;
  const end = findDeclarationEnd(fromValue);
  const source = legacyHtml.slice(fromValue, end);
  return vm.runInNewContext(`(${source})`, {}, { timeout: 1000 }) as T;
}

function findDeclarationEnd(start: number) {
  let quote: string | null = null;
  let escaped = false;
  let curly = 0;
  let square = 0;

  for (let i = start; i < legacyHtml.length; i++) {
    const ch = legacyHtml[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{') curly++;
    if (ch === '}') curly--;
    if (ch === '[') square++;
    if (ch === ']') square--;
    if (ch === ';' && curly === 0 && square === 0) return i;
  }

  throw new Error('Cannot find declaration end');
}

function form(value: string) {
  return value.toUpperCase() as ProductForm;
}

function parseRuDate(value?: string) {
  if (!value) return null;
  const [day, month, year] = value.split('.').map(Number);
  if (!day || !month || !year) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  const categories = extractConst<Array<{ id: string; name: string; icon: string }>>('CATEGORIES')
    .filter((category) => category.id !== 'all');
  const products = extractConst<LegacyProduct[]>('PRODUCTS');
  const payments = extractConst<Array<{ id: string; name: string; desc: string; badge: string | null }>>('PAYMENTS');
  const shipping = extractConst<Array<{ id: string; name: string; days: string; price: number; free: number }>>('SHIPPING');
  const promos = extractConst<Record<string, { type: string; value: number; min?: number; desc: string }>>('PROMOS');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      create: category,
      update: { name: category.name, icon: category.icon }
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        categoryId: product.cat,
        name: product.name,
        dose: product.dose,
        form: form(product.form),
        badge: product.badge,
        price: product.price,
        marketPrice: product.marketRu,
        originUsd: product.originUsd,
        tagline: product.tagline,
        about: product.about,
        specs: product.specs,
        stock: product.stock,
        rating: product.rating,
        reviews: product.reviews ?? 0,
        imageKey: product.img,
        coa: {
          create: {
            batch: product.coa.batch,
            purity: product.coa.purity,
            content: product.coa.content,
            testedAt: parseRuDate(product.coa.date),
            method: product.coa.method
          }
        }
      },
      update: {
        categoryId: product.cat,
        name: product.name,
        dose: product.dose,
        form: form(product.form),
        badge: product.badge,
        price: product.price,
        marketPrice: product.marketRu,
        originUsd: product.originUsd,
        tagline: product.tagline,
        about: product.about,
        specs: product.specs,
        stock: product.stock,
        rating: product.rating,
        reviews: product.reviews ?? 0,
        imageKey: product.img,
        deleted: false,
        coa: {
          upsert: {
            create: {
              batch: product.coa.batch,
              purity: product.coa.purity,
              content: product.coa.content,
              testedAt: parseRuDate(product.coa.date),
              method: product.coa.method
            },
            update: {
              batch: product.coa.batch,
              purity: product.coa.purity,
              content: product.coa.content,
              testedAt: parseRuDate(product.coa.date),
              method: product.coa.method
            }
          }
        }
      }
    });
  }

  for (const method of payments) {
    await prisma.paymentMethod.upsert({
      where: { id: method.id },
      create: { id: method.id, name: method.name, desc: method.desc, badge: method.badge },
      update: { name: method.name, desc: method.desc, badge: method.badge, active: true }
    });
  }

  for (const method of shipping) {
    await prisma.shippingMethod.upsert({
      where: { id: method.id },
      create: { id: method.id, name: method.name, days: method.days, price: method.price, freeFromTotal: method.free || null },
      update: { name: method.name, days: method.days, price: method.price, freeFromTotal: method.free || null, active: true }
    });
  }

  for (const [code, promo] of Object.entries(promos)) {
    await prisma.promoCode.upsert({
      where: { code },
      create: { code, type: promo.type, value: promo.value, minTotal: promo.min ?? null, desc: promo.desc },
      update: { type: promo.type, value: promo.value, minTotal: promo.min ?? null, desc: promo.desc, active: true }
    });
  }

  if (!isProduction) {
    await prisma.user.upsert({
      where: { email: 'admin@agpeptides.ru' },
      create: {
        email: 'admin@agpeptides.ru',
        name: 'Администратор',
        role: 'ADMIN',
        passwordHash: await bcrypt.hash('admin', 12)
      },
      update: {
        role: 'ADMIN',
        passwordHash: await bcrypt.hash('admin', 12)
      }
    });

    await prisma.user.upsert({
      where: { email: 'demo@agpeptides.ru' },
      create: {
        email: 'demo@agpeptides.ru',
        name: 'Алексей Иванов',
        phone: '+7 999 123-45-67',
        bonus: 500,
        passwordHash: await bcrypt.hash('demo', 12)
      },
      update: {}
    });
  }

  console.log(`Seeded ${products.length} products, ${payments.length} payment methods, ${shipping.length} shipping methods.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
