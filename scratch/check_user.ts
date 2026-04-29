import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@cinelix.com' },
    select: {
      id: true,
      email: true,
      isPremium: true,
      premiumUntil: true,
      role: true
    }
  });

  console.log('User Status:', JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

checkUser();
