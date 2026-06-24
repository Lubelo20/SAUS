import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { pick } from '../utils/pick';

const router = Router();

// Client-settable fields for a campaign update (mass-assignment allowlist).
const CAMPAIGN_FIELDS = ['title', 'description', 'graphic', 'ctaLabel', 'ctaUrl', 'startDate', 'endDate', 'isFeatured', 'status', 'categoryId'];
const prisma = new PrismaClient();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (search) where.title = { contains: search as string, mode: 'insensitive' };
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    prisma.campaign.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true } }, category: true } }),
    prisma.campaign.count({ where }),
  ]);
  return res.json({ data, total });
});

router.get('/:id', async (req, res) => {
  const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id },
    include: { createdBy: { select: { id: true, name: true } }, category: true } });
  if (!campaign) return res.status(404).json({ error: 'Not found' });
  return res.json(campaign);
});

router.post('/', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'MARKETING'), async (req: AuthRequest, res: Response) => {
  const { title, description, graphic, ctaLabel, ctaUrl, startDate, endDate, isFeatured, status, categoryId } = req.body;
  const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
  const campaign = await prisma.campaign.create({
    data: { title, slug, description, graphic, ctaLabel, ctaUrl, isFeatured: isFeatured || false,
      startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null,
      status: status || 'DRAFT', categoryId: categoryId || null, createdById: req.user!.id },
    include: { createdBy: { select: { id: true, name: true } } },
  });
  return res.status(201).json(campaign);
});

router.put('/:id', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'MARKETING'), async (req: AuthRequest, res: Response) => {
  const data = pick(req.body, CAMPAIGN_FIELDS);
  if (data.startDate !== undefined) data.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) data.endDate = data.endDate ? new Date(data.endDate) : null;
  const campaign = await prisma.campaign.update({ where: { id: req.params.id }, data });
  return res.json(campaign);
});

router.delete('/:id', requireRole('SUPER_ADMIN', 'SECRETARIAT'), async (req, res) => {
  await prisma.campaign.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Campaign deleted' });
});

export default router;
