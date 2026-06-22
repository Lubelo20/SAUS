/* Make public-site asset URLs absolute so the admin dashboard (a different
 * origin than the public site) can preview them. Idempotent: only rewrites
 * paths that are still site-relative (start with "/"). Base comes from
 * PUBLIC_SITE_URL (the public site origin), default http://localhost:8080. */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = (process.env.PUBLIC_SITE_URL || 'http://localhost:8080').split(',')[0].trim().replace(/\/$/, '');

async function main() {
  let mu = 0, lu = 0;
  for (const m of await prisma.mediaItem.findMany({ select: { id: true, url: true } })) {
    if (m.url && m.url.startsWith('/')) { await prisma.mediaItem.update({ where: { id: m.id }, data: { url: BASE + m.url } }); mu++; }
  }
  for (const l of await prisma.leadershipProfile.findMany({ select: { id: true, photo: true } })) {
    if (l.photo && l.photo.startsWith('/')) { await prisma.leadershipProfile.update({ where: { id: l.id }, data: { photo: BASE + l.photo } }); lu++; }
  }
  console.log(`Rewrote ${mu} media URLs + ${lu} leader photos to absolute (base: ${BASE})`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
