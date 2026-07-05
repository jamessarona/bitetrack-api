import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const nodeEnv = process.env.NODE_ENV ?? 'development';
for (const file of [`.env.${nodeEnv}`, '.env']) {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: false });
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed script.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: 'Taho', slug: 'taho' },
  { name: 'Ice Cream', slug: 'ice-cream' },
  { name: 'Street Food', slug: 'street-food' },
  { name: 'Coffee Cart', slug: 'coffee-cart' },
  { name: 'Food Truck', slug: 'food-truck' },
  { name: 'Fruit Vendor', slug: 'fruit-vendor' },
  { name: 'Fish & Meat', slug: 'fish-and-meat' },
  { name: 'Vegetables', slug: 'vegetables' },
];

async function main(): Promise<void> {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  const adminPassword = await argon2.hash('ChangeMe123!');
  await prisma.user.upsert({
    where: { email: 'admin@bitetrack.app' },
    update: {},
    create: {
      email: 'admin@bitetrack.app',
      passwordHash: adminPassword,
      role: 'ADMIN',
      firstName: 'Bite',
      lastName: 'Admin',
      emailVerifiedAt: new Date(),
    },
  });

  const tahoCategory = await prisma.category.findUnique({ where: { slug: 'taho' } });
  const demoPassword = await argon2.hash('ChangeMe123!');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@bitetrack.app' },
    update: {},
    create: {
      email: 'demo@bitetrack.app',
      passwordHash: demoPassword,
      role: 'CUSTOMER',
      firstName: 'Mang',
      lastName: 'Juan',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.business.upsert({
    where: { slug: 'mang-juans-taho' },
    update: {},
    create: {
      userId: demoUser.id,
      slug: 'mang-juans-taho',
      businessName: "Mang Juan's Taho",
      description: 'Fresh, warm taho every morning.',
      verificationStatus: 'VERIFIED',
      status: 'OFFLINE',
      ...(tahoCategory ? { categoryId: tahoCategory.id } : {}),
    },
  });

  console.log('Seed completed: categories, admin, and sample business.');
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
