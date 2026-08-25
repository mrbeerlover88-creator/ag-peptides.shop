import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || 'Администратор';

if (!email || !password) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before creating the administrator.');
}

if (password.length < 12) {
  throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
}

const prisma = new PrismaClient();

try {
  await prisma.user.upsert({
    where: { email },
    create: { email, name, role: 'ADMIN', passwordHash: await bcrypt.hash(password, 12) },
    update: { name, role: 'ADMIN', passwordHash: await bcrypt.hash(password, 12) }
  });
  console.log(`Administrator ${email} is ready.`);
} finally {
  await prisma.$disconnect();
}
