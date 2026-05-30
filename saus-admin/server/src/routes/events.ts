import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  const { status, search, upcoming, page = 1, limit = 20 } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (search) where.title = { contains: search as string, mode: 'insensitive' };
  if (upcoming === 'true') where.startDate = { gte: new Date() };
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    prisma.event.findMany({ where, skip, take: Number(limit), orderBy: { startDate: 'asc' },
      include: { createdBy: { select: { id: true, name: true } }, category: true } }),
    prisma.event.count({ where }),
  ]);
  return res.json({ data, total });
});

router.get('/:id', async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id },
    include: { createdBy: { select: { id: true, name: true } }, category: true } });
  if (!event) return res.status(404).json({ error: 'Not found' });
  return res.json(event);
});

router.post('/', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'MARKETING', 'EDITOR'), async (req: AuthRequest, res: Response) => {
  const { title, description, shortDescription, bannerImage, venue, address, city, province,
    startDate, endDate, registrationUrl, rsvpEnabled, isFeatured, status, categoryId } = req.body;
  const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
  const event = await prisma.event.create({
    data: { title, slug, description, shortDescription, bannerImage, venue, address, city, province,
      startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null,
      registrationUrl, rsvpEnabled: rsvpEnabled || false, isFeatured: isFeatured || false,
      status: status || 'DRAFT', categoryId: categoryId || null, createdById: req.user!.id },
    include: { createdBy: { select: { id: true, name: true } }, category: true },
  });
  return res.status(201).json(event);
});

router.put('/:id', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'MARKETING', 'EDITOR'), async (req: AuthRequest, res: Response) => {
  const event = await prisma.event.update({ where: { id: req.params.id },
    data: { ...req.body, startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : null } });
  return res.json(event);
});

router.delete('/:id', requireRole('SUPER_ADMIN', 'SECRETARIAT'), async (_req, res) => {
  await prisma.event.delete({ where: { id: _req.params.id } });
  return res.json({ message: 'Event deleted' });
});

export default router;
