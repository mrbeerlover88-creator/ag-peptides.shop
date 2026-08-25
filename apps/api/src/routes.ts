import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from './db.js';
import { authOptional, hashPassword, requireAdmin, requireAuth, signToken, verifyPassword } from './auth.js';

export const router = Router();

router.use(authOptional);

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.get('/catalog', async (_req, res) => {
  const [categories, products, shippingMethods, paymentMethods, promos] = await Promise.all([
    db.category.findMany({ orderBy: { name: 'asc' } }),
    db.product.findMany({
      where: { deleted: false },
      include: { category: true, coa: true },
      orderBy: { name: 'asc' }
    }),
    db.shippingMethod.findMany({ where: { active: true } }),
    db.paymentMethod.findMany({ where: { active: true } }),
    db.promoCode.findMany({ where: { active: true } })
  ]);

  res.json({ categories, products, shippingMethods, paymentMethods, promos });
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6)
});

router.post('/auth/register', async (req, res) => {
  const input = registerSchema.parse(req.body);
  const email = input.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const user = await db.user.create({
    data: {
      email,
      name: input.name,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
      bonus: 500
    }
  });

  res.status(201).json({
    token: signToken({ id: user.id, email: user.email, role: user.role }),
    user: publicUser(user)
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/auth/login', async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await db.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    token: signToken({ id: user.id, email: user.email, role: user.role }),
    user: publicUser(user)
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await db.user.findUnique({
    where: { id: req.user!.id },
    include: { addresses: true, orders: { include: { items: true }, orderBy: { createdAt: 'desc' } } }
  });
  res.json({ user: user ? publicUser(user) : null });
});

const orderSchema = z.object({
  contact: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    telegram: z.string().optional()
  }),
  shippingMethodId: z.string().min(1),
  paymentMethodId: z.string().min(1),
  address: z.string().optional(),
  comment: z.string().optional(),
  promoCode: z.string().optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1)
});

router.post('/orders', async (req, res) => {
  const input = orderSchema.parse(req.body);
  const products = await db.product.findMany({
    where: { id: { in: input.items.map((item) => item.productId) }, deleted: false },
    include: { coa: true }
  });
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines = input.items.map((item) => {
    const product = byId.get(item.productId);
    if (!product) throw new Error(`Unknown product: ${item.productId}`);
    if (item.quantity > product.stock) throw new Error(`Not enough stock for ${product.name}`);
    return { product, quantity: item.quantity, total: product.price * item.quantity };
  });
  const requestedQuantities = new Map<string, number>();
  for (const item of input.items) {
    requestedQuantities.set(item.productId, (requestedQuantities.get(item.productId) ?? 0) + item.quantity);
  }
  for (const [productId, quantity] of requestedQuantities) {
    const product = byId.get(productId)!;
    if (quantity > product.stock) throw new Error(`Not enough stock for ${product.name}`);
  }

  const [shipping, payment, promo] = await Promise.all([
    db.shippingMethod.findUnique({ where: { id: input.shippingMethodId } }),
    db.paymentMethod.findUnique({ where: { id: input.paymentMethodId } }),
    input.promoCode ? db.promoCode.findUnique({ where: { code: input.promoCode.toUpperCase() } }) : null
  ]);
  if (!shipping || !payment) return res.status(400).json({ error: 'Invalid shipping or payment method' });

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const discount = discountFor(subtotal, promo);
  const shippingCost = shipping.freeFromTotal && subtotal - discount >= shipping.freeFromTotal ? 0 : shipping.price;
  const total = Math.max(0, subtotal - discount) + shippingCost;
  const cashback = Math.round(total * 0.05);
  const orderId = `AG-${randomUUID().slice(0, 8).toUpperCase()}`;

  const order = await db.$transaction(async (tx) => {
    for (const line of lines) {
      const update = await tx.product.updateMany({
        where: { id: line.product.id, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } }
      });
      if (update.count !== 1) throw new Error(`Not enough stock for ${line.product.name}`);
    }

    return tx.order.create({
      data: {
        id: orderId,
        userId: req.user?.id,
        contactName: input.contact.name,
        contactEmail: input.contact.email,
        contactPhone: input.contact.phone,
        contactTelegram: input.contact.telegram,
        shippingMethodId: shipping.id,
        paymentMethodId: payment.id,
        address: input.address,
        comment: input.comment,
        promoCode: promo?.code,
        subtotal,
        discount,
        shippingCost,
        total,
        cashback,
        status: 'NEW',
        trackingCode: `RU${Math.floor(100000000 + Math.random() * 900000000)}AG`,
        items: {
          create: lines.map(({ product, quantity, total }) => ({
            productId: product.id,
            name: product.name,
            dose: product.dose,
            form: product.form,
            price: product.price,
            quantity,
            total,
            coaBatch: product.coa?.batch
          }))
        }
      },
      include: { items: true }
    });
  });

  res.status(201).json({ order });
});

router.get('/admin/orders', requireAdmin, async (_req, res) => {
  const orders = await db.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  res.json({ orders });
});

router.get('/admin/customers', requireAdmin, async (_req, res) => {
  const customers = await db.user.findMany({
    where: { role: 'CLIENT' },
    select: { id: true, email: true, name: true, phone: true, bonus: true, createdAt: true }
  });
  res.json({ customers });
});

function discountFor(subtotal: number, promo: { type: string; value: number; minTotal: number | null } | null) {
  if (!promo || (promo.minTotal && subtotal < promo.minTotal)) return 0;
  if (promo.type === 'percent') return Math.round((subtotal * promo.value) / 100);
  if (promo.type === 'fixed') return promo.value;
  return 0;
}

function publicUser<T extends { passwordHash?: string }>(user: T) {
  const copy = { ...user };
  delete copy.passwordHash;
  return copy;
}

export function errorHandler(err: unknown, _req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }, _next: unknown) {
  if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation error', details: err.flatten() });
  if (err instanceof Prisma.PrismaClientKnownRequestError) return res.status(400).json({ error: err.message });
  if (err instanceof Error) return res.status(400).json({ error: err.message });
  return res.status(500).json({ error: 'Internal server error' });
}
