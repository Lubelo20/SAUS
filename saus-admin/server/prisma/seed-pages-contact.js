/**
 * SAUS CMS — seed the editable "Contact" page (idempotent).
 *
 * Upserts the Page with slug "contact". All strings are extracted VERBATIM from
 * index.html #page-contact (the live public Contact page) so that, once the
 * public renderer (assets/saus-cms.js renderContactPage) is wired, the
 * CMS-rendered Contact page is visually identical to the current hardcoded one.
 *
 * Only the hero + secretariat contact details + spokesperson are editable
 * content. The enquiry form, official-channel links, and Staff-Portal panel are
 * NOT in this JSON — they remain fixed visual chrome in the static page.
 *
 * Run:  node prisma/seed-pages-contact.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const title = 'Contact';

const content = {
  hero: {
    ref: 'SAUS/CONTACT/2026 · Secretariat',
    title: 'Contact the Secretariat',
    lead: 'Direct correspondence for students, officials, media representatives, and institutional partners. All enquiries are acknowledged within two business days.',
  },
  secretariat: {
    email: 'Secretariat@saus.org.za',
    phone: '+27 79 129 5948',
    whatsapp: '+27 79 129 5948',
    location: 'Johannesburg, Gauteng, South Africa',
    officeHours: 'Mon–Fri · 08:00–17:00',
  },
  spokesperson: {
    name: 'Thato Masekoa',
    role: 'SAUS Official Spokesperson',
    phone: '+27 79 129 5948',
  },
};

async function main() {
  await prisma.page.upsert({
    where: { slug: 'contact' },
    update: { title, content },
    create: { slug: 'contact', title, content },
  });
  console.log('✓ Seeded CMS page: slug="contact" (' + title + ')');
}

main()
  .catch((e) => {
    console.error('Contact page seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
