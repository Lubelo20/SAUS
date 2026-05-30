import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

router.get('/', async (_req, res) => {
  const settings = await prisma.siteSetting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  const grouped = settings.reduce((acc: any, s) => {
    if (!acc[s.group]) acc[s.group] = {};
    acc[s.group][s.key] = s.value;
    return acc;
  }, {});
  return res.json(grouped);
});

router.put('/', requireRole('SUPER_ADMIN', 'SECRETARIAT'), async (req: AuthRequest, res: Response) => {
  const updates: { key: string; value: string; group?: string }[] = req.body.settings;
  for (const { key, value, group = 'general' } of updates) {
    await prisma.siteSetting.upsert({
      where: { key }, update: { value },
      create: { key, value, group },
    });
  }
  await prisma.activityLog.create({ data: { userId: req.user!.id, action: 'UPDATE', resource: 'settings' } });
  return res.json({ message: 'Settings saved' });
});

// ── Announcements ──
router.get('/announcements', async (_req, res) => {
  const items = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(items);
});

router.post('/announcements', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'MARKETING'), async (req: AuthRequest, res: Response) => {
  const item = await prisma.announcement.create({ data: req.body });
  return res.status(201).json(item);
});

router.put('/announcements/:id', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'MARKETING'), async (req: AuthRequest, res: Response) => {
  const item = await prisma.announcement.update({ where: { id: req.params.id }, data: req.body });
  return res.json(item);
});

router.delete('/announcements/:id', requireRole('SUPER_ADMIN', 'SECRETARIAT'), async (req, res) => {
  await prisma.announcement.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Deleted' });
});

export default router;
