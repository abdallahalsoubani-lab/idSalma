import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create default system settings
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      faceMatchThreshold: 85,
      ocrMinConfidence: 70,
      livenessThreshold: 90,
      retentionDays: 7,
    },
  });

  console.log('System settings created');

  // Create admin user
  const passwordHash = await hash('admin123', 10);

  await prisma.admin.upsert({
    where: { email: 'admin@salmaaiid.com' },
    update: {},
    create: {
      email: 'admin@salmaaiid.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log('Admin user created');
  console.log('Email: admin@salmaaiid.com');
  console.log('Password: admin123');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
