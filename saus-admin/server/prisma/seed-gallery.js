/**
 * SAUS CMS — gallery seed (idempotent).
 * Migrates the hardcoded gallery images (index.html #page-gallery) into the CMS
 * so the CMS becomes the source of truth for the public Gallery page.
 *
 * Run FROM saus-admin/server so .env (DATABASE_URL) loads:
 *   node prisma/seed-gallery.js
 *
 * Idempotent: albums are matched by name, media items by url, and skipped if
 * they already exist. Safe to re-run.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function basename(p) {
  return String(p).split('/').filter(Boolean).pop();
}

// ── Content extracted VERBATIM from index.html #page-gallery ─────────────────

const ALBUMS = [
  { name: '9th National Elective Congress' },
  { name: 'Campus Activations' },
];

const MEDIA = [
  // 9th National Elective Congress (img1–img5)
  { url: '/gallery/galleryIMG/img1.jpg', alt: '9th National Congress', album: '9th National Elective Congress' },
  { url: '/gallery/galleryIMG/img2.jpg', alt: 'Congress delegates', album: '9th National Elective Congress' },
  { url: '/gallery/galleryIMG/img3.jpg', alt: 'Student leadership', album: '9th National Elective Congress' },
  { url: '/gallery/galleryIMG/img4.jpg', alt: 'Congress proceedings', album: '9th National Elective Congress' },
  { url: '/gallery/galleryIMG/img5.jpg', alt: 'NEC election', album: '9th National Elective Congress' },
  // Campus Activations (IMG6–IMG10)
  { url: '/gallery/galleryIMG/IMG6.jpg', alt: 'Campus activation', album: 'Campus Activations' },
  { url: '/gallery/galleryIMG/IMG7.jpg', alt: 'Student engagement', album: 'Campus Activations' },
  { url: '/gallery/galleryIMG/IMG8.jpg', alt: 'Campus outreach', album: 'Campus Activations' },
  { url: '/gallery/galleryIMG/IMG9.jpg', alt: 'National campaign', album: 'Campus Activations' },
  { url: '/gallery/galleryIMG/IMG10.jpg', alt: 'Student solidarity', album: 'Campus Activations' },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (!admin) throw new Error('No SUPER_ADMIN user found — run prisma/seed.js first.');

  const counts = {
    albums: { created: 0, skipped: 0 },
    media: { created: 0, skipped: 0 },
  };

  // ── Albums ─────────────────────────────────────────────────
  const albumByName = {};
  for (const a of ALBUMS) {
    let existing = await prisma.mediaAlbum.findFirst({ where: { name: a.name } });
    if (existing) {
      counts.albums.skipped++;
    } else {
      existing = await prisma.mediaAlbum.create({ data: { name: a.name } });
      counts.albums.created++;
    }
    albumByName[a.name] = existing.id;
  }

  // ── Media items ────────────────────────────────────────────
  for (const m of MEDIA) {
    const existing = await prisma.mediaItem.findFirst({ where: { url: m.url } });
    if (existing) {
      counts.media.skipped++;
      continue;
    }
    const name = basename(m.url);
    await prisma.mediaItem.create({
      data: {
        url: m.url,
        filename: name,
        originalName: name,
        mimeType: 'image/jpeg',
        size: 0,
        alt: m.alt,
        type: 'IMAGE',
        uploadedById: admin.id,
        albumId: albumByName[m.album],
      },
    });
    counts.media.created++;
  }

  console.log('── SAUS gallery seed ─────────────────────────────');
  console.log('Albums : created', counts.albums.created, '· skipped', counts.albums.skipped);
  console.log('Media  : created', counts.media.created, '· skipped', counts.media.skipped);
  console.log('──────────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Gallery seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
