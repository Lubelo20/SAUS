import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// GET /api/dashboard/stats
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  const [
    totalNews, publishedNews, draftNews,
    totalEvents, upcomingEvents,
    totalCampaigns, activeCampaigns,
    totalDocuments, totalMedia, totalUsers,
    recentActivity,
  ] = await Promise.all([
    prisma.newsArticle.count(),
    prisma.newsArticle.count({ where: { status: 'PUBLISHED' } }),
    prisma.newsArticle.count({ where: { status: 'DRAFT' } }),
    prisma.event.count(),
    prisma.event.count({ where: { startDate: { gte: new Date() }, status: 'PUBLISHED' } }),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: 'PUBLISHED' } }),
    prisma.document.count(),
    prisma.mediaItem.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.activityLog.findMany({
      take: 10, orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, avatar: true } } },
    }),
  ]);

  const recentNews = await prisma.newsArticle.findMany({
    take: 5, orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, status: true, createdAt: true, author: { select: { name: true } } },
  });

  return res.json({
    stats: {
      news: { total: totalNews, published: publishedNews, draft: draftNews },
      events: { total: totalEvents, upcoming: upcomingEvents },
      campaigns: { total: totalCampaigns, active: activeCampaigns },
      documents: totalDocuments,
      media: totalMedia,
      users: totalUsers,
    },
    recentActivity,
    recentNews,
  });
});

export default router;
