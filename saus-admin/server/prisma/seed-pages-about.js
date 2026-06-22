/**
 * SAUS CMS — seed the editable "About" page (idempotent).
 *
 * Upserts the Page with slug "about". All strings are extracted VERBATIM from
 * index.html #page-about (the live public About page) so that, once the public
 * renderer (assets/saus-cms.js renderAboutPage) is wired, the CMS-rendered
 * About page is visually identical to the current hardcoded one.
 *
 * Icons / colours / sidebar / CTA behaviour are NOT in this JSON — they remain
 * fixed visual chrome in the static page.
 *
 * Run:  node prisma/seed-pages-about.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const title = 'About SAUS';

const content = {
  hero: {
    ref: 'SAUS/ABOUT/2026 · Institutional Overview',
    title: 'About the South African Union of Students',
    lead: "A constitutional overview of SAUS — its establishment, mandate, institutional history, and continental standing as South Africa's official national student body.",
  },
  stats: [
    { num: '26', label: 'Public Universities Represented' },
    { num: '2006', label: 'Year of Establishment' },
    { num: '9th', label: 'National Executive Congress' },
    { num: '1M+', label: 'Students Represented' },
  ],
  profile: {
    ref: 'SAUS/PROFILE/2026',
    title: 'Institutional Profile',
    lead: 'SAUS is the only body mandated to represent all students across all 26 public universities in the Republic of South Africa.',
    rows: [
      { field: 'Full Designation', details: 'South African Union of Students (SAUS)' },
      { field: 'Date of Establishment', details: 'April 2006' },
      { field: 'Legal Status', details: 'Non-Profit National Student Representative Body' },
      { field: 'Current Congress', details: '9th National Executive Committee (2025–2026)' },
      { field: 'Institutional Coverage', details: 'All 26 Public Universities in the Republic of South Africa' },
      { field: 'Headquarters', details: 'Johannesburg, Gauteng, South Africa' },
      { field: 'Website', details: 'www.saus.org.za' },
      { field: 'General Correspondence', details: 'Secretariat@saus.org.za' },
      { field: 'Media Spokesperson', details: 'Thato Masekoa · +27 79 129 5948' },
      { field: 'Office Hours', details: 'Monday to Friday, 08:00 – 17:00' },
    ],
  },
  mission:
    "To consolidate and strengthen students' views in the governance and enhancement of Higher Education and Training in South Africa, ensuring every student has access to affordable, quality, and inclusive education — delivered within a system that is equitable, non-sexist, non-racial, and democratic.",
  vision:
    'A unified, equitable, non-sexist, non-racial, democratic, and well-governed education system that is appropriate and responsive to the needs of South Africa, Africa, and the world — providing a conducive environment for learning, teaching, research, and community service.',
  values: {
    ref: 'SAUS/VALUES/2026',
    title: 'Core Values',
    lead: "The values that govern SAUS's conduct, advocacy, and governance across all 26 institutions.",
    cards: [
      {
        title: 'Non-Racial',
        text: 'Opposing all forms of racial discrimination and working towards a higher education system free of racial barriers and inequities.',
      },
      {
        title: 'Non-Sexist',
        text: 'Championing gender equality across campuses and ensuring that all policies and practices are free from sexism in any form.',
      },
      {
        title: 'Democratic',
        text: 'Operating through democratic processes, structures, and elections that give every member institution an equal and meaningful voice.',
      },
      {
        title: 'Anti-Corruption',
        text: 'Upholding integrity, transparency, and accountability in all governance structures and financial management at every level.',
      },
      {
        title: 'Progressive',
        text: 'Advancing transformative change in higher education that addresses historical injustices and builds a more equitable future.',
      },
      {
        title: 'Pan-Africanist',
        text: 'Situating South African student struggles within the broader context of African liberation, solidarity, and continental development.',
      },
    ],
  },
  history: {
    ref: 'SAUS/HISTORY/2026',
    title: 'Historical Background',
    lead: 'SAUS represents a historic milestone in South African student politics — the first national union of students constituted since the dissolution of NUSAS in the late 1980s.',
    intro:
      'Students have played an instrumental role in South African education and politics since the 1960s, most notably during the 1976 Soweto Uprisings. The reconstitution of a national student body in 2006 marked a new chapter — one defined by democratic governance and constructive engagement with the post-apartheid higher education system.',
    timeline: [
      {
        year: '1960s',
        title: 'Emergence of Student Structures',
        body: 'Student organisations become instrumental in the education sector, laying the foundation for organised student resistance against apartheid education policies.',
      },
      {
        year: '16 June 1976',
        title: 'Soweto Student Uprisings',
        body: 'Students play a decisive role in the uprisings — a defining moment in the liberation struggle that established the student movement as a critical political force in South Africa. June 16 is now commemorated as Youth Day.',
      },
      {
        year: 'Late 1980s',
        title: 'Dissolution of NUSAS',
        body: 'The National Union of South African Students (NUSAS) is dissolved, creating a void in national student representation that would persist for nearly two decades.',
      },
      {
        year: 'Early 2000s',
        title: 'Higher Education Restructuring',
        body: 'The South African government restructures the higher education landscape through mergers and incorporations — creating a new landscape of universities and universities of technology that necessitated a unified national student voice.',
      },
      {
        year: 'April 2006',
        title: 'SAUS Founded',
        body: 'The South African Union of Students is officially constituted — uniting universities and universities of technology under one national student representative body for the first time since the 1980s.',
      },
      {
        year: '2015–2016',
        title: '#FeesMustFall Movement',
        body: 'SAUS plays a central coordinating role during the nationwide #FeesMustFall protests, which compelled government to announce fee freezes and ultimately the 2018 free higher education policy for qualifying students.',
      },
      {
        year: 'July–August 2025',
        title: '9th National Elective Congress',
        body: 'The 9th NEC is elected at Nelson Mandela University (Port Elizabeth) and Boontjieskraal (Kimberley) under the theme "Confronting the suppression of student activism and advancing transformative student governance."',
      },
    ],
  },
  continental: {
    ref: 'SAUS/CONTINENTAL/2026',
    title: 'Continental Presence',
    lead: 'SAUS situates South African student activism within the broader context of African solidarity and continental higher education development.',
    cards: [
      {
        title: 'Pan-African Solidarity',
        text: 'SAUS maintains bilateral relations with student representative bodies across the African continent, fostering solidarity on shared challenges in higher education access and funding.',
      },
      {
        title: 'SADC Engagement',
        text: 'Active participation in Southern African Development Community student forums, contributing to regional policy development on higher education access, mobility, and recognition of qualifications.',
      },
      {
        title: 'African Union Forums',
        text: "Engagement with African Union Commission structures on the Continental Education Strategy for Africa (CESA) and the African Continental Free Trade Area's implications for student mobility.",
      },
    ],
    quote: {
      text: '"The struggles of South African students are inseparable from the struggles of students across Africa. SAUS stands in solidarity with every student fighting for the right to quality, affordable education."',
      cite: 'SAUS 9th National Congress — Continental Solidarity Resolution, 2025',
    },
  },
};

async function main() {
  await prisma.page.upsert({
    where: { slug: 'about' },
    update: { title, content },
    create: { slug: 'about', title, content },
  });
  console.log('✓ Seeded CMS page: slug="about" (' + title + ')');
}

main()
  .catch((e) => {
    console.error('About page seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
