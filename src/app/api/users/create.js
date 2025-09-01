import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
      }
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password, // In production, hash the password!
          role: role || 'USER',
        },
      });
      return res.status(201).json({ success: true, user });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
}
