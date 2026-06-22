# Universities Data Verification — June 2026

Web-verified against official `.ac.za` sources (see per-field `_verified` blocks in each university’s `admissions.json`/`info.json`). 150 field corrections applied across 26 universities. Values with low/unconfirmed confidence were kept as-is and flagged.

> Source-of-truth note: the per-university JSON under `data/universities/` is now hand-verified. Do not blindly re-run `data/generate.js` (it will clobber these). Raw research kept in `data/_verif_batch*.json`.

## CPUT

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.cput.ac.za/apply" | "https://www.cput.ac.za/study-at-cput/undergraduate/apply" | medium |
| info.prospectus | "https://www.cput.ac.za/students/faculties" | "https://www.cput.ac.za/academic" | medium |
| faculties | 6 items | 6 items | high |
| admissions.applyUrl | "https://www.cput.ac.za/apply" | "https://www.cput.ac.za/study-at-cput/undergraduate/apply" | medium |
| applicationFee | 100 | 0 | medium |
| applicationOpens | "1 May 2026" | "11 May 2026" | medium |
| applicationCloses | "31 August 2026" | "30 September 2026" | medium |

## CUT

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.cut.ac.za/apply" | "https://www.cut.ac.za/application-process" | high |
| info.prospectus | "https://www.cut.ac.za/apply" | "https://www.cut.ac.za/programmes-offered" | medium |
| students | 15000 | 21000 | medium |
| faculties | 4 items | 4 items | high |
| admissions.applyUrl | "https://www.cut.ac.za/apply" | "https://www.cut.ac.za/application-process" | high |
| applicationFee | 100 | 0 | high |
| minimumAPS | 18 | 27 | high |

## DUT

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.dut.ac.za/admissions/" | "https://www.cao.ac.za" | medium |
| students | 25000 | 32000 | medium |
| faculties | 6 items | 6 items | high |
| admissions.applyUrl | "https://www.dut.ac.za/admissions/" | "https://www.cao.ac.za" | medium |
| applicationFee | 100 | 250 | medium |

## MUT

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.mut.ac.za/admissions" | "https://www.mut.ac.za/prospective-students/apply/" | high |
| info.prospectus | "https://www.mut.ac.za/admissions" | "https://www.mut.ac.za/prospective-students/apply/" | medium |
| students | 12000 | 14500 | medium |
| faculties | 3 items | 3 items | high |
| admissions.applyUrl | "https://www.mut.ac.za/admissions" | "https://www.mut.ac.za/prospective-students/apply/" | high |
| applicationFee | 100 | 250 | medium |
| minimumAPS | 18 | 25 | medium |
| applicationOpens | "1 January 2026" | "1 March 2026" | medium |

## NMU

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.mandela.ac.za/Study-at-Mandela/Undergraduate/Apply" | "https://applyonline.mandela.ac.za/" | high |
| info.prospectus | "https://www.mandela.ac.za/Study-at-Mandela/Undergraduate" | "https://www.mandela.ac.za/study-at-mandela/application" | medium |
| faculties | 7 items | 7 items | high |
| admissions.applyUrl | "https://www.mandela.ac.za/Study-at-Mandela/Undergraduate/Apply" | "https://applyonline.mandela.ac.za/" | high |
| applicationFee | 100 | 0 | high |

## NWU

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.nwu.ac.za/applying-for-studies" | "https://studies.nwu.ac.za/undergraduate-studies/application" | high |
| info.prospectus | "https://www.nwu.ac.za/applying-for-studies" | "https://studies.nwu.ac.za/undergraduate-studies/fields-study-2027" | medium |
| students | 65000 | 55000 | medium |
| faculties | 7 items | 8 items | high |
| admissions.applyUrl | "https://www.nwu.ac.za/applying-for-studies" | "https://studies.nwu.ac.za/undergraduate-studies/application" | high |
| applicationFee | 100 | 150 | high |
| applicationCloses | "30 September 2026" | "31 August 2026" | high |

## RU

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://applications.ru.ac.za/" | "https://ross.ru.ac.za/ugadmissions" | high |
| students | 8000 | 9000 | medium |
| admissions.applyUrl | "https://applications.ru.ac.za/" | "https://ross.ru.ac.za/ugadmissions" | high |

## SMU

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.smu.ac.za/admissions" | "https://www.smu.ac.za/students/apply/" | high |
| info.prospectus | "https://www.smu.ac.za/admissions" | "https://www.smu.ac.za/3d-flip-book/smu-prospectus-2025_2026/" | medium |
| students | 5000 | 6300 | medium |
| faculties | 4 items | 5 items | high |
| city | "Medunsa" | "Ga-Rankuwa" | high |
| admissions.applyUrl | "https://www.smu.ac.za/admissions" | "https://www.smu.ac.za/students/apply/" | high |
| applicationFee | 200 | 300 | high |

## SPU

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.spu.ac.za/admissions" | "https://applications-prod.spu.ac.za/" | high |
| info.prospectus | "https://www.spu.ac.za/admissions" | "https://www.spu.ac.za/wp-content/uploads/2025/04/2026-Undergraduate-Prospectus.pdf" | high |
| students | 4000 | 7183 | high |
| faculties | 4 items | 4 items | high |
| admissions.applyUrl | "https://www.spu.ac.za/admissions" | "https://applications-prod.spu.ac.za/" | high |
| applicationFee | 100 | 0 | high |
| applicationOpens | "1 May 2026" | "11 May 2026" | medium |
| applicationCloses | "30 November 2026" | "31 October 2026" | medium |

## SU

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.sun.ac.za/english/student-affairs/Pages/Applications.aspx" | "https://www.su.ac.za/en/apply/undergrad" | high |
| info.prospectus | "https://www.sun.ac.za/english/student-affairs/Pages/Prospectus.aspx" | "https://files.su.ac.za/public/undergraduate-maties/documents/2026-01/su-admissions-booklet-2027.pdf" | high |
| faculties | 9 items | 9 items | high |
| admissions.applyUrl | "https://www.sun.ac.za/english/student-affairs/Pages/Applications.aspx" | "https://www.su.ac.za/en/apply/undergrad" | high |

## TUT

| field | old | new | confidence |
|---|---|---|---|
| info.prospectus | "https://www.tut.ac.za/apply" | "https://www.tut.ac.za/index.php/prospectus" | medium |
| faculties | 7 items | 7 items | high |
| applicationFee | 100 | 240 | high |
| applicationOpens | "3 April 2026" | "1 April 2026" | medium |
| applicationCloses | "31 July 2026" | "30 September 2026" | medium |

## UCT

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://myapps.uct.ac.za/" | "https://applyonline.uct.ac.za/" | high |
| info.prospectus | "https://www.uct.ac.za/apply/undergraduate/undergraduate-prospectus" | "https://www.uct.ac.za/students/prospective-students/undergraduate-prospectus" | high |
| faculties | 6 items | 6 items | high |
| admissions.applyUrl | "https://myapps.uct.ac.za/" | "https://applyonline.uct.ac.za/" | high |

## UFH

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.ufh.ac.za/admissions" | "https://www.ufh.ac.za/apply" | high |
| faculties | 6 items | 6 items | high |
| admissions.applyUrl | "https://www.ufh.ac.za/admissions" | "https://www.ufh.ac.za/apply" | high |
| applicationFee | 100 | 0 | high |
| minimumAPS | 18 | 26 | high |
| applicationCloses | "30 November 2026" | "31 October 2026" | medium |

## UFS

| field | old | new | confidence |
|---|---|---|---|
| info.prospectus | "https://www.ufs.ac.za/apply/prospectus" | "https://www.ufs.ac.za/docs/librariesprovider44/prospectus/ug-prospectus-2027.pdf" | high |
| students | 39000 | 40000 | medium |
| faculties | 7 items | 7 items | high |
| applicationFee | 200 | 0 | high |

## UJ

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.uj.ac.za/apply-to-uj/" | "https://www.uj.ac.za/admission-aid/apply/" | high |
| info.prospectus | "https://www.uj.ac.za/apply-to-uj/applications/undergraduate-admissions/prospectus/" | "https://www.uj.ac.za/study-uj-and-aid/undergraduate/undergraduate-prospectus-downloadable/" | high |
| students | 52000 | 50000 | medium |
| faculties | 8 items | 8 items | high |
| admissions.applyUrl | "https://www.uj.ac.za/apply-to-uj/" | "https://www.uj.ac.za/admission-aid/apply/" | high |
| applicationFee | 200 | 0 | high |

## UKZN

| field | old | new | confidence |
|---|---|---|---|
| info.prospectus | "https://www.ukzn.ac.za/ukzn-for-students/" | "https://applications.ukzn.ac.za/applications/online-applications/" | medium |
| faculties | 5 items | 4 items | high |
| applicationFee | 200 | 210 | medium |
| minimumAPS | 26 | 28 | medium |
| applicationOpens | "1 March 2026" | "1 April 2026" | high |

## UL

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.ul.ac.za/admissions" | "https://www.ul.ac.za/admissions/undergraduate-studies/" | high |
| info.prospectus | "https://www.ul.ac.za/admissions" | "https://www.ul.ac.za/wp-content/uploads/2025/03/Undergraduate-Prospectus-2027.pdf" | high |
| faculties | 3 items | 4 items | high |
| city | "Polokwane" | "Mankweng (Polokwane)" | high |
| admissions.applyUrl | "https://www.ul.ac.za/admissions" | "https://www.ul.ac.za/admissions/undergraduate-studies/" | high |
| applicationFee | 100 | 200 | high |

## UMP

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.ump.ac.za/admissions" | "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications" | high |
| info.prospectus | "https://www.ump.ac.za/admissions" | "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications" | medium |
| faculties | 3 items | 3 items | high |
| admissions.applyUrl | "https://www.ump.ac.za/admissions" | "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications" | high |
| applicationFee | 100 | 200 | high |

## UNISA

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://my.unisa.ac.za/portal/" | "https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission/Apply-for-admission-to-study:-application-tool" | high |
| info.prospectus | "https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission/Undergraduate-prospectus" | "https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission/Undergraduate-qualifications/Qualifications/All-qualifications" | medium |
| students | 400000 | 370000 | medium |
| faculties | 8 items | 8 items | high |
| admissions.applyUrl | "https://my.unisa.ac.za/portal/" | "https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission/Apply-for-admission-to-study:-application-tool" | high |
| applicationFee | 135 | 150 | medium |

## UNIVEN

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.univen.ac.za/admissions" | "https://admission.univen.ac.za/" | high |
| info.prospectus | "https://www.univen.ac.za/admissions" | "https://www.univen.ac.za/wp-content/uploads/2026/03/2027-Univen-Undergraduate-Prospectus.pdf" | high |
| faculties | 6 items | 4 items | high |
| admissions.applyUrl | "https://www.univen.ac.za/admissions" | "https://admission.univen.ac.za/" | high |
| applicationFee | 100 | 0 | high |
| minimumAPS | 18 | 26 | high |

## UP

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.up.ac.za/apply" | "https://www.up.ac.za/online-application/apply-online" | high |
| info.prospectus | "https://www.up.ac.za/prospective-student" | "https://www.up.ac.za/online-application" | medium |
| type | "Comprehensive University" | "Research University" | medium |
| faculties | 10 items | 9 items | high |
| admissions.applyUrl | "https://www.up.ac.za/apply" | "https://www.up.ac.za/online-application/apply-online" | high |
| applicationFee | 200 | 300 | high |

## UWC

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.uwc.ac.za/apply" | "https://www.uwc.ac.za/admission-and-financial-aid/apply" | high |
| info.prospectus | "https://www.uwc.ac.za/study/all-programmes" | "https://www.uwc.ac.za/study/faculties-and-programmes" | medium |
| students | 22000 | 23000 | medium |
| faculties | 8 items | 7 items | high |
| admissions.applyUrl | "https://www.uwc.ac.za/apply" | "https://www.uwc.ac.za/admission-and-financial-aid/apply" | high |
| applicationFee | 100 | 0 | high |

## UniZ

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.unizulu.ac.za/application" | "https://www.cao.ac.za" | high |
| info.prospectus | "https://www.unizulu.ac.za/prospectus" | "https://www.unizulu.ac.za/apply/" | medium |
| faculties | 4 items | 4 items | high |
| admissions.applyUrl | "https://www.unizulu.ac.za/application" | "https://www.cao.ac.za" | high |
| applicationFee | 100 | 250 | medium |
| applicationCloses | "31 October 2026" | "30 September 2026" | medium |

## VUT

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.vut.ac.za/admissions" | "https://www.vut.ac.za/how-to-apply/" | medium |
| info.prospectus | "https://www.vut.ac.za/admissions" | "https://www.vut.ac.za/undergraduate-studies/" | medium |
| students | 20000 | 21000 | high |
| faculties | 4 items | 4 items | high |
| admissions.applyUrl | "https://www.vut.ac.za/admissions" | "https://www.vut.ac.za/how-to-apply/" | medium |
| applicationFee | 100 | 110 | medium |
| minimumAPS | 18 | 20 | medium |
| applicationOpens | "1 April 2026" | "21 May 2026" | medium |
| applicationCloses | "30 September 2026" | "30 October 2026" | medium |

## WITS

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.wits.ac.za/application/" | "https://www.wits.ac.za/undergraduate/apply-to-wits/" | high |
| info.prospectus | "https://www.wits.ac.za/application/undergraduate/" | "https://www.wits.ac.za/undergraduate/guide-for-undergraduates/" | medium |
| faculties | 5 items | 5 items | high |
| admissions.applyUrl | "https://www.wits.ac.za/application/" | "https://www.wits.ac.za/undergraduate/apply-to-wits/" | high |

## WSU

| field | old | new | confidence |
|---|---|---|---|
| info.apply | "https://www.wsu.ac.za/admissions" | "https://applications.wsu.ac.za" | high |
| info.prospectus | "https://www.wsu.ac.za/admissions" | "https://wsu.ac.za/media/attachments/2026/05/27/2027-information-brochure-admission-requirements.pdf" | high |
| students | 28000 | 30000 | medium |
| faculties | 4 items | 7 items | high |
| admissions.applyUrl | "https://www.wsu.ac.za/admissions" | "https://applications.wsu.ac.za" | high |

## Flagged unconfirmed (value kept, verify before live)

- **UNISA** application open/close dates — distance university; 2027 Sem-1 dates not yet officially published.
- **CPUT** minimum APS — no single university-wide value; varies by programme.
