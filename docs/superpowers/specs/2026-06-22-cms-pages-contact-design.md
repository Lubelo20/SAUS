# CMS Pages — Contact — Design

**Date:** 2026-06-22
Third CMS-Pages sub-project. Reuses the generic `Page` model + routes (PR #4). Small page: only the hero + contact details + spokesperson are editable content (the enquiry form already posts to the CMS; social links + staff-portal are chrome).

## Data contract — `content` JSON for slug "contact"

```json
{
  "hero": { "ref": "SAUS/CONTACT/2026 · Secretariat",
            "title": "Contact the Secretariat",
            "lead": "Direct correspondence for students, officials, media representatives, and institutional partners. All enquiries are acknowledged within two business days." },
  "secretariat": { "email": "Secretariat@saus.org.za",
                   "phone": "+27 79 129 5948",
                   "whatsapp": "+27 79 129 5948",
                   "location": "Johannesburg, Gauteng, South Africa",
                   "officeHours": "Mon–Fri · 08:00–17:00" },
  "spokesperson": { "name": "Thato Masekoa",
                    "role": "SAUS Official Spokesperson",
                    "phone": "+27 79 129 5948" }
}
```
All strings extracted **verbatim** from `index.html` `#page-contact` (lines ~1117–1199). The enquiry form, social-channel links, and Staff-Portal panel are NOT in the JSON.

## Deliverables

### A — Server seed
`saus-admin/server/prisma/seed-pages-contact.js` — idempotent upsert of slug `contact` (`title:'Contact'`, content = JSON above). Mirror `seed-pages-about.js`.

### B — Dashboard editor
- `saus-admin/client/src/app/dashboard/pages/contact/page.tsx` — bespoke editor mirroring the About/Home editors (collapsible sections, `GET/PUT /api/pages/contact`, Bearer token, react-hot-toast, `normalize()`), fields: hero {ref,title,lead}, secretariat {email,phone,whatsapp,location,officeHours}, spokesperson {name,role,phone}. (No repeatables — all flat text fields.)
- `saus-admin/client/src/app/dashboard/pages/page.tsx` — make **Contact** a live link to `/dashboard/pages/contact` (`ready:true`); NSFAS stays "Coming soon".

### C — Public wiring
- `index.html` `#page-contact` — add `data-cms` on the hero (`hero.ref/title/lead`) and the sidebar values: the Secretariat contact-row `.contact-value` nodes (`secretariat.email`, `secretariat.phone`, `secretariat.whatsapp`, `secretariat.location`, `secretariat.officeHours`) and the spokesperson name/role/phone (`spokesperson.name`, `spokesperson.role`, `spokesperson.phone`). No repeatable containers. (For email/phone the value sits in an `<a>` — set its `textContent`; leave the `mailto:`/`tel:` href as static chrome.)
- `assets/saus-cms.js` `renderContactPage()` — same pattern as `renderAboutPage`: guard on `#page-contact`; fetch `/public/page/contact`; set `textContent` of `[data-cms]` singletons via `getPath`; no repeatables; no-op on failure. Call in `init()`.

## Verification
1. `node prisma/seed-pages-contact.js` → `/api/public/page/contact` returns the JSON.
2. Dashboard → Pages → Contact: loads values; edit hero lead + office hours → Save → reload public Contact → changes show; form/social unchanged; console clean.

## Success criteria
Contact hero + details editable in CMS; public Contact renders from CMS with fallback; no regression.
