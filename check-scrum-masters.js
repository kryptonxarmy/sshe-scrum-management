// Quick test script to check SCRUM_MASTER users
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkScrumMasters() {
  try {
    const scrumMasters = await prisma.user.findMany({
      where: { 
        role: 'SCRUM_MASTER',
        isActive: true 
      }
    });
    
    console.log('SCRUM_MASTER users found:', scrumMasters.length);
    scrumMasters.forEach(sm => {
      console.log(`- ${sm.name} (${sm.email}) - ID: ${sm.id}`);
    });
    
    if (scrumMasters.length === 0) {
      console.log('\nNo SCRUM_MASTER users found. Creating one...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const newScrumMaster = await prisma.user.create({
        data: {
          name: 'Test Scrum Master',
          email: 'scrummaster@test.com',
          password: hashedPassword,
          role: 'SCRUM_MASTER',
          isActive: true,
        }
      });
      
      console.log('Created SCRUM_MASTER:', newScrumMaster.name, newScrumMaster.email);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkScrumMasters();
