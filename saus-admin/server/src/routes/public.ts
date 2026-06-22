import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Public, UNAUTHENTICATED read endpoints for the static SAUS website.
// Returns ONLY published content and only safe, public fields — no drafts,
// no author emails or internal metadata. Bounded by the global /api rate limit.

// GET /api/public/news — published news articles, newest first.
router.get('/news', async (_req, res) => {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    });
    return res.json({ data: articles });
  } catch (err: any) {
    console.error('[public/news] failed:', err?.message || err);
    return res.status(500).json({ error: 'Could not load news' });
  }
});

// GET /api/public/leadership — active NEC profiles, in display order.
router.get('/leadership', async (_req, res) => {
  try {
    const profiles = await prisma.leadershipProfile.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        position: true,
        university: true,
        photo: true,
        bio: true,
        email: true,
        necYear: true,
      },
    });
    return res.json({ data: profiles });
  } catch (err: any) {
    console.error('[public/leadership] failed:', err?.message || err);
    return res.status(500).json({ error: 'Could not load leadership' });
  }
});

// GET /api/public/events — published events, newest first.
router.get('/events', async (_req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { startDate: 'desc' },
      take: 24,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        bannerImage: true,
        venue: true,
        city: true,
        province: true,
        startDate: true,
        endDate: true,
        registrationUrl: true,
      },
    });
    return res.json({ data: events });
  } catch (err: any) {
    console.error('[public/events] failed:', err?.message || err);
    return res.status(500).json({ error: 'Could not load events' });
  }
});

// GET /api/public/campaigns — published campaigns, newest first.
router.get('/campaigns', async (_req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 24,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        graphic: true,
        ctaLabel: true,
        ctaUrl: true,
        startDate: true,
        endDate: true,
      },
    });
    return res.json({ data: campaigns });
  } catch (err: any) {
    console.error('[public/campaigns] failed:', err?.message || err);
    return res.status(500).json({ error: 'Could not load campaigns' });
  }
});

// GET /api/public/media — gallery images, grouped by album, oldest first.
router.get('/media', async (_req, res) => {
  try {
    const media = await prisma.mediaItem.findMany({
      where: { type: 'IMAGE' },
      orderBy: [{ albumId: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        url: true,
        alt: true,
        caption: true,
        album: { select: { name: true } },
      },
    });
    return res.json({ data: media });
  } catch (err: any) {
    console.error('[public/media] failed:', err?.message || err);
    return res.status(500).json({ error: 'Could not load media' });
  }
});

// GET /api/public/announcement — the current active site announcement (or null).
router.get('/announcement', async (_req, res) => {
  try {
    const ann = await prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, message: true, type: true, ctaLabel: true, ctaUrl: true },
    });
    return res.json({ data: ann });
  } catch (err: any) {
    console.error('[public/announcement] failed:', err?.message || err);
    return res.status(500).json({ error: 'Could not load announcement' });
  }
});

export default router;
