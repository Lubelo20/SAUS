import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

const ADMIN_ROLES = ['SUPER_ADMIN', 'SECRETARIAT'];

router.get('/', requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
  const { search } = req.query;
  const where: any = {};
  if (search) where.OR = [
    { name: { contains: String(search), mode: 'insensitive' } },
    { email: { contains: String(search), mode: 'insensitive' } },
  ];
  const users = await prisma.user.findMany({
    where, orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, department: true, isActive: true, lastLoginAt: true, createdAt: true },
  });
  return res.json({ data: users });
});

router.post('/', requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
  const { name, email, password, role, department } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, department },
    select: { id: true, name: true, email: true, role: true },
  });
  await prisma.activityLog.create({ data: { userId: req.user!.id, action: 'CREATE', resource: 'user', resourceId: user.id } });
  return res.status(201).json(user);
});

router.put('/:id', requireRole(...ADMIN_ROLES), async (req: AuthRequest, res: Response) => {
  const { name, role, department, isActive } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, role, department, isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  return res.json(user);
});

router.delete('/:id', requireRole('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  if (req.params.id === req.user!.id) return res.status(400).json({ error: 'Cannot delete your own account' });
  await prisma.user.delete({ where: { id: req.params.id } });
  return res.json({ message: 'User deleted' });
});

export default router;
