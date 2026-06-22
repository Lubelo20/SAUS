/**
 * SAUS CMS — content seed (idempotent).
 * Migrates the existing hardcoded public-site content (index.html) into the CMS
 * so the CMS becomes the source of truth for Leadership, News, Events, Campaigns.
 *
 * Run FROM saus-admin/server so .env (DATABASE_URL) loads:
 *   node prisma/seed-content.js
 *
 * Idempotent: each row is checked by natural key (name / title) and skipped if it
 * already exists. Safe to re-run. Also removes throwaway demo/test rows.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readTime(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── Content extracted VERBATIM from index.html ───────────────────────────────

const LEADERSHIP = [
  {
    name: 'Siyabonga Moses Nkambako',
    position: 'President — 9th National Executive Committee',
    university: 'University of KwaZulu-Natal (UKZN)',
    photo: '/leadership/LeadersIMG/nkambako.jpg',
    bio: 'President Nkambako leads the 9th NEC with a mandate to confront the suppression of student activism and advance transformative student governance across South African higher education institutions. Elected at the 9th National Elective Congress, he represents the aspirations of over one million students.',
    email: null,
  },
  {
    name: 'Mcntosh Khasembe',
    position: 'Deputy President',
    university: 'University of the Western Cape',
    photo: '/leadership/LeadersIMG/khasembe.jpg',
    bio: null,
    email: null,
  },
  {
    name: 'Nhlonipho Nxumalo',
    position: 'Secretary General',
    university: 'University of the Witwatersrand',
    photo: '/leadership/LeadersIMG/nxumalo.jpg',
    bio: null,
    email: null,
  },
  {
    name: 'Jemina Mokoena',
    position: '1st Deputy Secretary General',
    university: 'Central University of Technology',
    photo: '/leadership/LeadersIMG/mokoena.jpg',
    bio: null,
    email: null,
  },
  {
    name: 'Martin Mnyaka',
    position: '2nd Deputy Secretary General',
    university: 'University of the Free State',
    photo: '/leadership/LeadersIMG/nyaka.jpg',
    bio: null,
    email: null,
  },
  {
    name: 'Nkosinathi Mabilane',
    position: 'Treasurer General',
    university: 'University of South Africa',
    photo: '/leadership/LeadersIMG/mabilane.jpg',
    bio: null,
    email: null,
  },
];

const NEWS = [
  {
    title: 'Post-9th National Congress Statement: SAUS 9th NEC Elected',
    excerpt:
      'Following the successful conclusion of the 9th National Elective Congress in two stages — Nelson Mandela University (July 2025) and Boontjieskraal, Kimberley (August 2025) — SAUS announces the election of the 9th National Executive Committee under the theme: "Confronting the suppression of student activism and advancing transformative student governance."',
    content:
      'Following the successful conclusion of the 9th National Elective Congress in two stages — Nelson Mandela University (July 2025) and Boontjieskraal, Kimberley (August 2025) — SAUS announces the election of the 9th National Executive Committee under the theme: "Confronting the suppression of student activism and advancing transformative student governance."',
    date: '2025-08-01',
  },
  {
    title: 'SAUS Calls for Complete NSFAS Redesign — Students Cannot Wait',
    excerpt:
      'SAUS demands immediate intervention by the Department of Higher Education and Training to overhaul the National Student Financial Aid Scheme, citing chronic disbursement failures and a breakdown in student communication.',
    content:
      'SAUS demands immediate intervention by the Department of Higher Education and Training to overhaul the National Student Financial Aid Scheme, citing chronic disbursement failures and a breakdown in student communication.',
    date: '2025-07-14',
  },
  {
    title: 'SAUS Categorically Opposes National Credit Act Amendments',
    excerpt:
      'SAUS rejects proposed amendments to the National Credit Act that would list outstanding student debt with credit bureaus, describing the proposal as a punitive measure that will irreparably harm an entire generation of graduates.',
    content:
      'SAUS rejects proposed amendments to the National Credit Act that would list outstanding student debt with credit bureaus, describing the proposal as a punitive measure that will irreparably harm an entire generation of graduates.',
    date: '2025-06-02',
  },
  {
    title: 'SAUS Mandates GBV Policy Review Across All 26 Universities',
    excerpt:
      'The NEC has been mandated to investigate whether all institutions have fit-for-purpose GBVF policies and to develop minimum standards for campus security conduct in handling gender-based violence cases.',
    content:
      'The NEC has been mandated to investigate whether all institutions have fit-for-purpose GBVF policies and to develop minimum standards for campus security conduct in handling gender-based violence cases.',
    date: '2025-05-19',
  },
  {
    title: 'SAUS Campaigns for Full Historical Student Debt Write-off',
    excerpt:
      'SAUS announces a formal campaign compelling government to clear all historical student debt, with priority given to deceased students and unemployed graduates.',
    content:
      'SAUS announces a formal campaign compelling government to clear all historical student debt, with priority given to deceased students and unemployed graduates.',
    date: '2025-04-03',
  },
];

const EVENTS = [
  {
    title: 'National Student Leadership Summit 2026',
    shortDescription: 'Annual gathering of SRC leaders from all 26 universities.',
    description:
      'Annual gathering of SRC leaders from all 26 universities to align on national student priorities, share governance best practices, and engage directly with NEC leadership on the 2026 advocacy agenda.',
    venue: 'University of Johannesburg',
    city: null,
    province: null,
    startDate: '2026-09-15',
  },
  {
    title: 'NSFAS Reform Town Hall — KwaZulu-Natal Region',
    shortDescription: 'Regional town hall on the state of NSFAS reform.',
    description:
      'Regional town hall enabling students to engage directly with SAUS leadership on the state of NSFAS reform, share testimonials, and contribute to the national advocacy submission.',
    venue: 'Durban University of Technology',
    city: null,
    province: 'KwaZulu-Natal',
    startDate: '2026-10-02',
  },
  {
    title: 'GBV Awareness Month — National Campus Activation Tour',
    shortDescription: 'National campus activations throughout October.',
    description:
      'SAUS activates across multiple campuses throughout October as part of the GBV Awareness Month campaign — distributing resources, gathering testimonials, and advancing institutional accountability on GBVF policy.',
    venue: 'Campuses Nationwide',
    city: null,
    province: null,
    startDate: '2026-10-16',
  },
  {
    title: '9th NEC Mid-Term Review & Policy Workshop',
    shortDescription: '9th NEC mid-term review and policy workshop.',
    description:
      'The 9th NEC mid-term review to assess progress on congress resolutions, review campaign outcomes, and develop the working paper on AI in higher education. Attendance restricted to NEC members and invitees.',
    venue: 'Pretoria',
    city: 'Pretoria',
    province: 'Gauteng',
    startDate: '2026-11-08',
  },
  {
    title: '9th National Elective Congress — Day 2 (Completed)',
    shortDescription: 'Final session — 9th NEC elected and key resolutions adopted.',
    description:
      'Final session — 9th NEC elected and key resolutions adopted on NSFAS, student debt, GBV, and AI in education.',
    venue: 'Boontjieskraal, Kimberley, Northern Cape',
    city: 'Kimberley',
    province: 'Northern Cape',
    startDate: '2025-08-23',
  },
  {
    title: '9th National Elective Congress — Day 1 (Completed)',
    shortDescription: 'Opening of the 9th Congress.',
    description:
      'Opening of the 9th Congress. Delegates from all 26 universities convened to debate the future of student governance in South Africa.',
    venue: 'Nelson Mandela University, Port Elizabeth',
    city: 'Port Elizabeth',
    province: 'Eastern Cape',
    startDate: '2025-07-10',
  },
];

const CAMPAIGNS = [
  {
    title: 'NSFAS Reform & Redesign',
    description:
      'SAUS resolves to campaign for the complete redesign of the National Student Financial Aid Scheme (NSFAS) to ensure sustainability, reliability, and the establishment of a strengthened communication system between the scheme and beneficiary students.\n\nSAUS further resolves to develop an alternative, sustainable funding model that centres student dignity and guarantees that no qualifying student is denied support mid-academic year. This includes addressing the chronic failures in disbursement timelines and the lack of transparent student communication protocols.',
  },
  {
    title: 'Historical Student Debt Relief',
    description:
      'SAUS resolves to actively campaign for the government to clear all historical student debt, commencing with deceased students and unemployed graduates who have demonstrated inability to service outstanding balances.\n\nSAUS further resolves to initiate a lobbying campaign against proposed amendments to the National Credit Act that would list student debt with credit bureaus — a punitive measure that would close future financial opportunities for an entire generation of graduates.',
  },
  {
    title: 'Missing Middle & Postgraduate Funding',
    description:
      'SAUS resolves to develop a sustainable, dedicated funding scheme for "missing middle" students, postgraduate students, and N+ students who have exceeded the standard funded period. This scheme must be developed in consultation with the Department of Higher Education and Training and relevant Treasury officials.',
  },
  {
    title: 'GBV & Campus Safety Standards',
    description:
      'SAUS mandates the NEC to investigate whether all institutions have fit-for-purpose Gender-Based Violence and Femicide (GBVF) policies, and to propose minimum standards for the appointment and conduct of private and institutional security personnel in relation to the handling of GBVF cases and student protests.',
  },
  {
    title: 'Abolition of Application Fees',
    description:
      'SAUS resolves to campaign actively for the abolition of application fees at all public higher education institutions in South Africa. Application fees constitute an unjust barrier that prevents the most economically vulnerable students from accessing the right to apply for a university place.',
  },
  {
    title: 'Artificial Intelligence in Higher Education',
    description:
      'The 9th Congress resolves that SAUS must develop a comprehensive working paper on the role of Artificial Intelligence in strengthening and broadening academic and administrative support for students across the higher education sector. The paper must address equity implications for students from under-resourced backgrounds.',
  },
];

const NEC_YEAR = '2025-2026';

async function main() {
  const author = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (!author) throw new Error('No SUPER_ADMIN user found — run prisma/seed.js first.');

  const counts = {
    leadership: { created: 0, skipped: 0 },
    news: { created: 0, skipped: 0 },
    events: { created: 0, skipped: 0 },
    campaigns: { created: 0, skipped: 0 },
  };

  // ── Leadership ─────────────────────────────────────────────
  for (let i = 0; i < LEADERSHIP.length; i++) {
    const l = LEADERSHIP[i];
    const existing = await prisma.leadershipProfile.findFirst({ where: { name: l.name } });
    if (existing) {
      counts.leadership.skipped++;
      continue;
    }
    await prisma.leadershipProfile.create({
      data: {
        name: l.name,
        position: l.position,
        university: l.university,
        photo: l.photo,
        bio: l.bio,
        email: l.email,
        order: i,
        isActive: true,
        necYear: NEC_YEAR,
      },
    });
    counts.leadership.created++;
  }

  // ── News ───────────────────────────────────────────────────
  for (let i = 0; i < NEWS.length; i++) {
    const n = NEWS[i];
    const existing = await prisma.newsArticle.findFirst({ where: { title: n.title } });
    if (existing) {
      counts.news.skipped++;
      continue;
    }
    await prisma.newsArticle.create({
      data: {
        title: n.title,
        slug: slugify(n.title) + '-' + i,
        excerpt: n.excerpt,
        content: n.content,
        coverImage: null,
        status: 'PUBLISHED',
        publishedAt: new Date(n.date),
        authorId: author.id,
        readTimeMinutes: readTime(n.content),
      },
    });
    counts.news.created++;
  }

  // ── Events ─────────────────────────────────────────────────
  for (let i = 0; i < EVENTS.length; i++) {
    const e = EVENTS[i];
    const existing = await prisma.event.findFirst({ where: { title: e.title } });
    if (existing) {
      counts.events.skipped++;
      continue;
    }
    await prisma.event.create({
      data: {
        title: e.title,
        slug: slugify(e.title) + '-' + i,
        description: e.description,
        shortDescription: e.shortDescription,
        venue: e.venue,
        city: e.city,
        province: e.province,
        startDate: new Date(e.startDate),
        endDate: null,
        bannerImage: null,
        status: 'PUBLISHED',
        createdById: author.id,
      },
    });
    counts.events.created++;
  }

  // ── Campaigns ──────────────────────────────────────────────
  for (let i = 0; i < CAMPAIGNS.length; i++) {
    const c = CAMPAIGNS[i];
    const existing = await prisma.campaign.findFirst({ where: { title: c.title } });
    if (existing) {
      counts.campaigns.skipped++;
      continue;
    }
    await prisma.campaign.create({
      data: {
        title: c.title,
        slug: slugify(c.title) + '-' + i,
        description: c.description,
        graphic: null,
        ctaLabel: null,
        ctaUrl: null,
        status: 'PUBLISHED',
        createdById: author.id,
      },
    });
    counts.campaigns.created++;
  }

  // ── Cleanup: throwaway demo / test rows ────────────────────
  const demo = await prisma.newsArticle.deleteMany({
    where: { title: 'SAUS Welcomes 2027 University Applications' },
  });
  const testMsgs = await prisma.contactMessage.deleteMany({
    where: { email: { in: ['student@example.com', 'thabo@example.com'] } },
  });

  console.log('── SAUS content seed ─────────────────────────────');
  console.log('Leadership : created', counts.leadership.created, '· skipped', counts.leadership.skipped);
  console.log('News       : created', counts.news.created, '· skipped', counts.news.skipped);
  console.log('Events     : created', counts.events.created, '· skipped', counts.events.skipped);
  console.log('Campaigns  : created', counts.campaigns.created, '· skipped', counts.campaigns.skipped);
  console.log('Cleanup    : demo article deleted', demo.count, '· test messages deleted', testMsgs.count);
  console.log('──────────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Content seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
