/* Idempotent seed for the remaining NEC members (initials-avatar, National Office)
 * and the site Announcement bar. Safe to re-run — skips rows that already exist. */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // ── 3 remaining NEC members (no photo → public renderer shows an initials avatar) ──
  const extra = [
    { name: 'Nomfundo Mbatha', position: 'International Relations Officer', university: 'National Office', order: 6 },
    { name: 'Thato Masekoa',   position: 'Spokesperson',                   university: 'National Office', order: 7 },
    { name: 'Olive Vilakazi',  position: 'National Organiser',             university: 'National Office', order: 8 },
  ];
  let lc = 0, ls = 0;
  for (const m of extra) {
    const exists = await prisma.leadershipProfile.findFirst({ where: { name: m.name } });
    if (exists) { ls++; continue; }
    await prisma.leadershipProfile.create({
      data: { name: m.name, position: m.position, university: m.university, order: m.order, photo: null, isActive: true, necYear: '2025-2026' },
    });
    lc++;
  }

  // ── Site announcement bar ──
  const msg = '9th National Executive Committee Elected — SAUS successfully concluded its 9th National Elective Congress at Nelson Mandela University & Kimberley, August 2025.';
  let ac = 0, as = 0;
  const annExists = await prisma.announcement.findFirst({ where: { message: msg } });
  if (annExists) { as++; }
  else { await prisma.announcement.create({ data: { message: msg, type: 'success', isActive: true } }); ac++; }

  console.log(`Leadership (extra NEC): created ${lc}, skipped ${ls}`);
  console.log(`Announcement: created ${ac}, skipped ${as}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
