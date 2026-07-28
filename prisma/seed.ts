import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pipelinex.dev' },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      email: 'admin@pipelinex.dev',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Seed Standard User
  const user = await prisma.user.upsert({
    where: { email: 'user@pipelinex.dev' },
    update: { passwordHash, role: 'USER' },
    create: {
      email: 'user@pipelinex.dev',
      passwordHash,
      role: 'USER',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('🔑 Admin User:', admin.email);
  console.log('🔑 Standard User:', user.email);
  console.log('🔒 Default Password for both:', 'Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
