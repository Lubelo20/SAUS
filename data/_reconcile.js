#!/usr/bin/env node
/* One-shot reconciliation: applies web-verified corrections (data/_verif_batch*.json)
 * to the per-university JSON + _index.json, adds _verified metadata, and prints a
 * change report. Rule: apply high/medium confidence values; KEEP existing for
 * low/unconfirmed. Run: node data/_reconcile.js   (re-runnable / idempotent-ish) */
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, 'universities');
const DATE = '2026-06-21';

const batches = fs.readdirSync(__dirname).filter(f => /^_verif_batch\d+\.json$/.test(f));
const verifs = batches.flatMap(f => JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8')));

const idxPath = path.join(DIR, '_index.json');
const index = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
const idxByAbbr = Object.fromEntries(index.universities.map(u => [u.abbr, u]));

const apply = (conf) => conf === 'high' || conf === 'medium';
const changes = [];
let filesWritten = 0;

function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJSON(p, o) { fs.writeFileSync(p, JSON.stringify(o, null, 2) + '\n'); filesWritten++; }
function setIf(obj, key, f, abbr, label) {
  if (apply(f.confidence) && f.value != null && obj[key] !== f.value) {
    changes.push({ abbr, field: label, old: JSON.stringify(obj[key]), new: JSON.stringify(f.value), conf: f.confidence, source: f.source });
    obj[key] = f.value;
  }
}

for (const v of verifs) {
  const abbr = v.abbr, f = v.fields;
  const uDir = path.join(DIR, abbr);
  if (!fs.existsSync(uDir)) { console.warn('MISSING DIR', abbr); continue; }
  const info = readJSON(path.join(uDir, 'info.json'));
  const adm = readJSON(path.join(uDir, 'admissions.json'));
  const idx = idxByAbbr[abbr];

  // --- info.json ---
  if (f.website) setIf(info, 'website', f.website, abbr, 'website');
  if (f.applyUrl) setIf(info, 'apply', f.applyUrl, abbr, 'info.apply');
  if (f.prospectusUrl) setIf(info, 'prospectus', f.prospectusUrl, abbr, 'info.prospectus');
  if (f.type) setIf(info, 'type', f.type, abbr, 'type');
  if (f.students) setIf(info, 'students', f.students, abbr, 'students');
  if (f.founded) setIf(info, 'established', f.founded, abbr, 'founded');
  if (f.faculties && apply(f.faculties.confidence) && f.faculties.value) {
    if (JSON.stringify(info.faculties) !== JSON.stringify(f.faculties.value)) {
      changes.push({ abbr, field: 'faculties', old: (info.faculties||[]).length + ' items', new: f.faculties.value.length + ' items', conf: f.faculties.confidence, source: f.faculties.source });
      info.faculties = f.faculties.value;
    }
  }
  if (f.city && apply(f.city.confidence) && f.city.value && info.location) setIf(info.location, 'city', f.city, abbr, 'city');
  if (f.province && apply(f.province.confidence) && f.province.value && info.location) setIf(info.location, 'province', f.province, abbr, 'province');

  // --- admissions.json ---
  if (f.applyUrl) setIf(adm, 'applyUrl', f.applyUrl, abbr, 'admissions.applyUrl');
  if (f.applicationFee) setIf(adm, 'applicationFee', f.applicationFee, abbr, 'applicationFee');
  if (f.minimumAPS) setIf(adm, 'minimumAPS', f.minimumAPS, abbr, 'minimumAPS');
  if (adm.applicationPeriod) {
    if (f.applicationOpens) setIf(adm.applicationPeriod, 'opens', f.applicationOpens, abbr, 'applicationOpens');
    if (f.applicationCloses) setIf(adm.applicationPeriod, 'closes', f.applicationCloses, abbr, 'applicationCloses');
  }

  // --- _verified metadata (records confidence + source for every researched field) ---
  const vfields = {};
  for (const [k, fl] of Object.entries(f)) {
    vfields[k] = { confidence: fl.confidence, source: fl.source || null };
    if (fl.note) vfields[k].note = fl.note;
  }
  const verifiedBlock = { date: DATE, method: 'official-site-research', fields: vfields };
  adm._verified = verifiedBlock;
  info._verified = { date: DATE, method: 'official-site-research' };
  adm._datesUpdated = DATE + ' (web-verified, 2027 intake)';

  // --- _index.json mirror (cards) ---
  if (idx) {
    if (f.website && apply(f.website.confidence)) idx.website = f.website.value;
    if (f.applyUrl && apply(f.applyUrl.confidence)) idx.apply = f.applyUrl.value;
    if (f.prospectusUrl && apply(f.prospectusUrl.confidence)) idx.prospectus = f.prospectusUrl.value;
    if (f.type && apply(f.type.confidence)) idx.type = f.type.value;
    if (f.students && apply(f.students.confidence)) idx.students = f.students.value;
    if (f.founded && apply(f.founded.confidence)) idx.founded = f.founded.value;
    if (f.city && apply(f.city.confidence)) idx.city = f.city.value;
    if (f.province && apply(f.province.confidence)) idx.province = f.province.value;
  }

  writeJSON(path.join(uDir, 'info.json'), info);
  writeJSON(path.join(uDir, 'admissions.json'), adm);

  // --- courses.json marker ---
  const cPath = path.join(uDir, 'courses.json');
  if (fs.existsSync(cPath)) {
    const courses = readJSON(cPath);
    // courses.json is an array; wrap marker via a sibling file to avoid changing the array shape the portal expects
    // Instead, write the marker into a parallel _coursesVerified.json so we don't break the array consumer.
    writeJSON(path.join(uDir, '_coursesVerified.json'), { abbr, note: 'faculty-level + flagship sample (2026-06)', date: DATE });
  }
}

index._verified = DATE;
writeJSON(idxPath, index);

console.log('Universities processed:', verifs.length);
console.log('Files written:', filesWritten);
console.log('Field changes applied:', changes.length);
fs.writeFileSync(path.join(__dirname, '_reconcile-changes.json'), JSON.stringify(changes, null, 2) + '\n');
console.log('Change list -> data/_reconcile-changes.json');
