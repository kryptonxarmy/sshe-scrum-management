const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10); // Ganti password sesuai kebutuhan
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
      department: 'IT',
      isActive: true,
    },
  });
  console.log('SUPERADMIN user created!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
