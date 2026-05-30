import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

const EDITABLE_ROLES = ['SUPER_ADMIN', 'SECRETARIAT', 'MARKETING', 'MEDIA', 'EDITOR'];

// GET /api/news
router.get('/', async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, status, search, category } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {};
  if (status) where.status = status;
  if (category) where.categoryId = category;
  if (search) where.OR = [
    { title: { contains: String(search), mode: 'insensitive' } },
    { excerpt: { contains: String(search), mode: 'insensitive' } },
  ];
  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where, skip, take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, avatar: true } }, category: true, tags: true },
    }),
    prisma.newsArticle.count({ where }),
  ]);
  return res.json({ data: articles, total, page: Number(page), limit: Number(limit) });
});

// GET /api/news/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const article = await prisma.newsArticle.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { id: true, name: true, avatar: true } }, category: true, tags: true },
  });
  if (!article) return res.status(404).json({ error: 'Article not found' });
  return res.json(article);
});

// POST /api/news
router.post('/', requireRole(...EDITABLE_ROLES), async (req: AuthRequest, res: Response) => {
  try {
    const { title, excerpt, content, coverImage, status, isFeatured, scheduledAt,
            seoTitle, seoDescription, seoKeywords, categoryId, tagIds } = req.body;
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
    const readTimeMinutes = Math.ceil(content.split(' ').length / 200);

    const article = await prisma.newsArticle.create({
      data: {
        title, slug, excerpt, content, coverImage, readTimeMinutes,
        status: status || 'DRAFT',
        isFeatured: isFeatured || false,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        seoTitle, seoDescription, seoKeywords,
        authorId: req.user!.id,
        categoryId: categoryId || null,
        tags: tagIds?.length ? { connect: tagIds.map((id: string) => ({ id })) } : undefined,
      },
      include: { author: { select: { id: true, name: true } }, category: true, tags: true },
    });

    await prisma.activityLog.create({
      data: { userId: req.user!.id, action: 'CREATE', resource: 'news', resourceId: article.id },
    });

    return res.status(201).json(article);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/news/:id
router.put('/:id', requireRole(...EDITABLE_ROLES), async (req: AuthRequest, res: Response) => {
  try {
    const { title, excerpt, content, coverImage, status, isFeatured, scheduledAt,
            seoTitle, seoDescription, seoKeywords, categoryId, tagIds } = req.body;
    const existing = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Article not found' });

    const article = await prisma.newsArticle.update({
      where: { id: req.params.id },
      data: {
        title, excerpt, content, coverImage,
        status: status || existing.status,
        isFeatured,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
        readTimeMinutes: Math.ceil((content || '').split(' ').length / 200),
        seoTitle, seoDescription, seoKeywords,
        categoryId: categoryId || null,
        tags: tagIds ? { set: tagIds.map((id: string) => ({ id })) } : undefined,
      },
      include: { author: { select: { id: true, name: true } }, category: true, tags: true },
    });

    await prisma.activityLog.create({
      data: { userId: req.user!.id, action: 'UPDATE', resource: 'news', resourceId: article.id },
    });

    return res.json(article);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/news/:id
router.delete('/:id', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'EDITOR'), async (req: AuthRequest, res: Response) => {
  await prisma.newsArticle.delete({ where: { id: req.params.id } });
  await prisma.activityLog.create({
    data: { userId: req.user!.id, action: 'DELETE', resource: 'news', resourceId: req.params.id },
  });
  return res.json({ message: 'Article deleted' });
});

// GET /api/news/categories/all
router.get('/categories/all', async (_req, res) => {
  const categories = await prisma.newsCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  });
  return res.json(categories);
});

// POST /api/news/categories
router.post('/categories', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'EDITOR'), async (req: AuthRequest, res: Response) => {
  const { name, description, color } = req.body;
  const slug = slugify(name, { lower: true, strict: true });
  const cat = await prisma.newsCategory.create({ data: { name, slug, description, color } });
  return res.status(201).json(cat);
});

// DELETE /api/news/categories/:id
router.delete('/categories/:id', requireRole('SUPER_ADMIN', 'SECRETARIAT', 'EDITOR'), async (req, res) => {
  await prisma.newsCategory.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Category deleted' });
});

export default router;
