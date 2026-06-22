import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

const EDITABLE_ROLES = ['SUPER_ADMIN', 'SECRETARIAT', 'MARKETING', 'MEDIA', 'EDITOR'];

const pageSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.record(z.any()),
});

// GET /api/pages/:slug — the editable page (404 if absent)
router.get('/:slug', async (req: AuthRequest, res: Response) => {
  const page = await prisma.page.findUnique({ where: { slug: req.params.slug } });
  if (!page) return res.status(404).json({ error: 'Page not found' });
  return res.json(page);
});

// PUT /api/pages/:slug — upsert by slug
router.put('/:slug', requireRole(...EDITABLE_ROLES), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = pageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid request' });
    }
    const { title, content } = parsed.data;
    const slug = req.params.slug;

    const page = await prisma.page.upsert({
      where: { slug },
      update: { title, content },
      create: { slug, title, content },
    });

    await prisma.activityLog.create({
      data: { userId: req.user!.id, action: 'UPDATE', resource: 'page', resourceId: slug },
    });

    return res.json(page);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
