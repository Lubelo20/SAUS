import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { pick } from '../utils/pick';

const router = Router();
const prisma = new PrismaClient();

// Client-settable fields for a leadership profile (mass-assignment allowlist).
const LEADERSHIP_FIELDS = ['name', 'position', 'university', 'photo', 'bio', 'email', 'order', 'isActive', 'necYear'];

router.get('/', async (_req, res) => {
  const profiles = await prisma.leadershipProfile.findMany({
    where: { isActive: true }, orderBy: { order: 'asc' },
  });
  return res.json(profiles);
});

router.post('/', authenticate, requireRole('SUPER_ADMIN', 'SECRETARIAT'), async (req: AuthRequest, res: Response) => {
  const profile = await prisma.leadershipProfile.create({ data: pick(req.body, LEADERSHIP_FIELDS) });
  return res.status(201).json(profile);
});

router.put('/:id', authenticate, requireRole('SUPER_ADMIN', 'SECRETARIAT'), async (req: AuthRequest, res: Response) => {
  const profile = await prisma.leadershipProfile.update({ where: { id: req.params.id }, data: pick(req.body, LEADERSHIP_FIELDS) });
  return res.json(profile);
});

router.delete('/:id', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  await prisma.leadershipProfile.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Profile deleted' });
});

export default router;
