/**
 * SAUS CMS — seed the editable "NSFAS" guide page (idempotent).
 *
 * Upserts the Page with slug "nsfas". All strings are extracted VERBATIM from
 * nsfas/index.html (the live standalone public NSFAS guide) so that, once the
 * public renderer (assets/saus-cms.js renderNsfasPage) is wired, the
 * CMS-rendered NSFAS page is visually identical to the current hardcoded one.
 *
 * Icons / colours / amounts-as-chrome / step numbers / links are NOT stored in
 * this JSON — they remain fixed visual chrome in the static page.
 *
 * Run:  node prisma/seed-pages-nsfas.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const title = 'NSFAS Guide';

const content = {
  hero: {
    ref: 'SAUS/NSFAS/GUIDE/2026 · Student Financial Aid',
    title: 'NSFAS Application Guide 2026/2027',
    lead: 'A clear, step-by-step guide to applying for financial aid through the National Student Financial Aid Scheme — brought to you by SAUS to help every qualifying student access higher education.',
  },
  covers: {
    ref: 'SAUS/NSFAS/COVERAGE/2026',
    title: 'What NSFAS Covers',
    lead: 'NSFAS is a full bursary — not a loan. Qualifying university students receive comprehensive support covering tuition and a range of allowances. There is nothing to repay.',
    items: [
      {
        title: 'Tuition & Registration',
        text: 'Full payment of registration and tuition fees, paid directly to your public university.',
      },
      {
        title: 'Accommodation',
        text: 'For students in university residence or accredited private accommodation. Capped per the annual NSFAS housing policy.',
      },
      {
        title: 'Living Allowance',
        text: 'A monthly allowance to help cover food, toiletries and day-to-day personal expenses while you study.',
      },
      {
        title: 'Transport Allowance',
        text: 'For non-residential students living within 40 km of campus, to assist with daily travel costs.',
      },
      {
        title: 'Learning Materials',
        text: 'For prescribed textbooks, study materials and an approved learning device, disbursed each academic year.',
      },
      {
        title: 'Personal Care',
        text: 'For students in catered residences and distance-learning students, towards personal care essentials.',
      },
    ],
  },
  qualify: {
    ref: 'SAUS/NSFAS/ELIGIBILITY/2026',
    title: 'Do You Qualify?',
    lead: 'Before applying, check that you meet NSFAS eligibility criteria. Both conditions — citizenship and income — must be satisfied.',
    items: [
      {
        title: 'You May Qualify If…',
        text: 'You are a South African citizen or permanent resident with a valid SA ID · Your combined household income is R350,000 or less per year (R600,000 for students with disabilities) · You are enrolled at or have been accepted to a public university · You have not exceeded the N+ rule for your qualification (standard duration plus 1 year) · You are a SASSA grant recipient’s dependent (automatic financial need qualification)',
      },
      {
        title: 'You Do Not Qualify If…',
        text: 'Your household income exceeds the applicable threshold · You are enrolled at a private institution (NSFAS only covers public institutions) · You have exceeded the N+1 rule and have not been granted an academic exception · You already hold a funded qualification at the same or higher level · You are not a South African citizen or permanent resident',
      },
    ],
  },
  documents: {
    ref: 'SAUS/NSFAS/DOCS/2026',
    title: 'Required Documents',
    lead: 'Gather all documents before you begin your application. Incomplete submissions are the leading cause of delays and rejections.',
    items: [
      {
        title: 'Certified Copy of South African ID',
        text: 'Green barcoded ID book or smart ID card. Must be certified within 3 months of application date.',
      },
      {
        title: 'Proof of Academic Registration or Acceptance',
        text: 'Acceptance letter from your institution, or proof of registration if already enrolled. Must show your student number and qualification.',
      },
      {
        title: 'Disability Letter',
        text: 'Letter from a registered medical professional confirming the nature of your disability. Only required if applying under the R600,000 threshold.',
      },
      {
        title: 'Certified Copies of Parent / Guardian IDs',
        text: 'Both parents or all guardians must provide certified copies of their SA IDs. Certified within 3 months of application.',
      },
      {
        title: 'Proof of Household Income',
        text: 'IRP5 or salary slip (employed) · SASSA letter (grant recipients) · Signed affidavit if unemployed · Pension slip if retired.',
      },
      {
        title: 'Death Certificates (Orphaned Students)',
        text: 'Certified copies of parent(s)’ death certificate(s), plus a sworn affidavit from your legal guardian confirming the arrangement.',
      },
    ],
  },
  steps: {
    ref: 'SAUS/NSFAS/STEPS/2026',
    title: 'Application Steps',
    lead: 'Follow each step in order. Do not skip ahead — NSFAS requires a complete application before it can be reviewed.',
    items: [
      {
        title: 'Confirm You Meet the Eligibility Requirements',
        text: 'Before anything else, use the eligibility checklist above to confirm you qualify. Check your citizenship status, household income, and institution type. This saves time and prevents a failed application.',
      },
      {
        title: 'Gather All Required Documents',
        text: 'Collect every document on the checklist before opening the application portal. Incomplete applications are a leading reason for delays. Get certified copies done early — certification queues at police stations can be long.',
      },
      {
        title: 'Register on the myNSFAS Portal',
        text: 'Visit the official NSFAS website at nsfas.org.za and click "Register". You will need your South African ID number, a valid email address, and a mobile number. Choose a secure password and store it safely.',
      },
      {
        title: 'Complete the Online Application Form',
        text: 'Log in to your myNSFAS account and click "Apply". Fill in all sections carefully — personal details, household information, income details, and your institution and qualification. Double-check every entry before moving to the next section.',
      },
      {
        title: 'Upload Your Supporting Documents',
        text: 'Scan or photograph each document clearly — good lighting, no shadows, all four corners visible. Upload in PDF or JPG format. Each file must be under the portal’s size limit. Name your files clearly (e.g. "MyName_ID.pdf").',
      },
      {
        title: 'Submit and Save Your Confirmation',
        text: 'Review your entire application one final time, then click "Submit". NSFAS will send a confirmation email and SMS to your registered details. Save or print your application reference number — you will need it for all future queries.',
      },
      {
        title: 'Track Your Application & Respond Promptly',
        text: 'Log in to myNSFAS regularly to check your application status. NSFAS may request additional documents — respond within the given timeframe or your application could lapse. If approved, you will be required to sign a Student Financial Aid Agreement (SFAA) online.',
      },
    ],
  },
  dates: {
    ref: 'SAUS/NSFAS/DATES/2026–2027',
    title: 'Important Dates',
    lead: 'Mark these dates in your calendar. Missing a deadline — especially the application deadline — means waiting a full year to reapply.',
    items: [
      {
        label: 'Applications Open',
        value: '1 August 2026 — The myNSFAS portal opens for 2027 academic year applications. Register your account early so you are ready to apply on day one.',
      },
      {
        label: 'Application Deadline',
        value: '30 November 2026 — All applications and supporting documents must be submitted by midnight. Late submissions will not be reviewed under any circumstances.',
      },
      {
        label: 'Preliminary Outcome Notifications',
        value: 'January 2027 — NSFAS begins notifying applicants of their preliminary outcome via email and SMS. Log in to myNSFAS to view your status and any action required.',
      },
      {
        label: 'Appeals Period',
        value: 'Feb – Mar 2027 — If your application was unsuccessful, you may appeal during this window. Submit your appeal through myNSFAS with supporting documentation explaining your grounds for appeal.',
      },
      {
        label: 'Funding Disbursement Begins',
        value: 'February 2027 — Approved students receive their first allowance payments. Sign your Student Financial Aid Agreement (SFAA) in myNSFAS as soon as you receive the prompt — unsigned agreements delay disbursement.',
      },
    ],
  },
  tips: {
    ref: 'SAUS/NSFAS/TIPS/2026',
    title: 'Tips & Common Mistakes',
    lead: 'Students who apply successfully share one thing in common: preparation. Avoid the pitfalls that cost thousands of students their funding each year.',
    items: [
      {
        text: 'Apply on the first day applications open — Early applicants receive earlier decisions and avoid system congestion near the deadline. Set a reminder for 1 August.',
      },
      {
        text: 'Keep copies of everything you submit — Save PDFs of every uploaded document and screenshot your confirmation page. If NSFAS requests resubmission, you have ready copies.',
      },
      {
        text: 'Use an email address you check daily — All NSFAS correspondence goes to your registered email. A missed request for additional documents can invalidate your application.',
      },
      {
        text: 'Get certifications done before August — Police stations get extremely busy in August as thousands of students rush to certify documents. Go in July while queues are short.',
      },
      {
        text: 'Visit your institution’s financial aid office — Many universities have dedicated NSFAS liaison staff who can help you complete your application and flag potential issues before you submit.',
      },
      {
        text: 'Submitting without all required documents — Incomplete applications are automatically flagged and may be rejected outright. NSFAS will not chase you for missing documents.',
      },
      {
        text: 'Using uncertified or expired photocopies — All copies must be certified within 3 months of your application date. Old certifications — even from a previous application — are not accepted.',
      },
      {
        text: 'Incorrect or understated household income — Fraudulent income declarations are a criminal offence. NSFAS cross-references income with SARS. Discrepancies lead to disqualification and potential prosecution.',
      },
      {
        text: 'Ignoring status updates after submission — Applications are not automatically finalised. NSFAS often requests additional information. Ignoring these requests causes your application to lapse.',
      },
      {
        text: 'Missing the appeals window — If your application is unsuccessful, you have a narrow appeals window. Missing it means waiting the full year. Set a reminder for February 2027.',
      },
    ],
  },
  help: {
    ref: 'SAUS/NSFAS/SUPPORT/2026',
    title: 'Get Help',
    lead: 'You are not alone. Multiple support channels exist to help you through the process — use them.',
    items: [
      {
        title: 'NSFAS Contact Centre',
        text: '0800 067 327 — Toll-free from any South African network. Mon – Fri · 08:00 – 16:30',
      },
      {
        title: 'Email NSFAS',
        text: 'info@nsfas.org.za — For general queries, document resubmission, and status follow-ups. Include your SA ID number and application reference in all emails.',
      },
      {
        title: 'SAUS Student Support',
        text: 'Secretariat@saus.org.za — SAUS can assist with escalations, campus referrals, and advocacy support if your application is being unfairly handled. Mon – Fri · 08:00 – 17:00',
      },
    ],
  },
};

async function main() {
  await prisma.page.upsert({
    where: { slug: 'nsfas' },
    update: { title, content },
    create: { slug: 'nsfas', title, content },
  });
  console.log('✓ Seeded CMS page: slug="nsfas" (' + title + ')');
}

main()
  .catch((e) => {
    console.error('NSFAS page seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
