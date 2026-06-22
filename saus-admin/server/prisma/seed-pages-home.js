/**
 * SAUS CMS — seed the editable "Home" page (idempotent).
 *
 * Upserts the Page with slug "home". All strings are extracted VERBATIM from
 * index.html #page-home (the live public Home page) so that, once the public
 * renderer (assets/saus-cms.js renderHomePage) is wired, the CMS-rendered
 * Home page is visually identical to the current hardcoded one.
 *
 * Icons / colours / CTA buttons / the logos marquee / the recent-statements
 * teaser are NOT in this JSON — they remain fixed visual chrome (or are
 * already CMS-managed news) in the static page.
 *
 * Run:  node prisma/seed-pages-home.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const title = 'Home';

const content = {
  hero: {
    ref: 'SAUS/OFFICIAL/2026 · National Representative Body',
    title: 'Empowering Student Voices. Advancing Higher Education.',
    lead: 'The South African Union of Students (SAUS) is the official representative body for students across all 26 public universities in the Republic of South Africa. Education is a constitutional right — we ensure it is treated as such.',
  },
  stats: [
    { num: '26', label: 'Public Universities Represented' },
    { num: '2006', label: 'Year of Establishment' },
    { num: '9th', label: 'National Executive Congress (2025)' },
    { num: '1M+', label: 'Students Represented' },
  ],
  mandate: {
    ref: 'SAUS/MANDATE/2026',
    title: 'What We Stand For',
    lead: 'SAUS was constituted to consolidate and strengthen student representation in governance of Higher Education and Training across all 26 public universities in South Africa.',
    pillars: [
      {
        title: 'Mission',
        text: "To consolidate and strengthen students' views in the governance of Higher Education and Training, ensuring equitable access for all students across the Republic.",
      },
      {
        title: 'Vision',
        text: 'A unified, equitable, non-sexist, non-racial, and democratic education system that is responsive to the needs of South Africa, Africa, and the world.',
      },
      {
        title: 'Equity & Justice',
        text: 'Advocating for fair, inclusive, and accessible education for all students regardless of socioeconomic background, race, or gender.',
      },
      {
        title: 'Unity & Solidarity',
        text: 'Building collective student strength through collaboration, structured activism, and shared purpose across all institutions.',
      },
    ],
    quote: {
      text: '"Education is a right, not a privilege — SAUS ensures every student, regardless of background, has access to affordable, quality, and inclusive higher education."',
      cite: 'South African Union of Students — Constitutional Mandate',
    },
  },
  campaigns: {
    ref: 'SAUS/CAMPAIGNS/2025–2026',
    title: 'Priority Campaign Areas',
    lead: 'The following campaigns represent the foremost policy advocacy priorities of the 9th National Executive Committee as resolved at the National Elective Congress, 2025.',
    cards: [
      {
        title: 'NSFAS Reform',
        text: 'Redesigning the National Student Financial Aid Scheme for sustainability, reliability, and strengthened communication to ensure no student is left without support.',
      },
      {
        title: 'Historical Debt Relief',
        text: 'Compelling government to clear historical student debt, beginning with deceased students and unemployed graduates unable to service their accounts.',
      },
      {
        title: 'GBV on Campuses',
        text: 'Investigating GBV and Femicide policies across all 26 institutions and setting minimum standards for security conduct in handling GBVF cases.',
      },
    ],
  },
  eventsCta: {
    ref: 'SAUS/EVENTS/2026',
    title: 'Upcoming Engagements',
    lead: 'National congresses, student leadership summits, policy town halls, and campus activations across the Republic of South Africa.',
  },
};

async function main() {
  await prisma.page.upsert({
    where: { slug: 'home' },
    update: { title, content },
    create: { slug: 'home', title, content },
  });
  console.log('✓ Seeded CMS page: slug="home" (' + title + ')');
}

main()
  .catch((e) => {
    console.error('Home page seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
