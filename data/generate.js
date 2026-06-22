#!/usr/bin/env node
/* ⚠️ 2026-06: the per-university JSON in data/universities/ has been HAND-VERIFIED against
   official sources (see data/VERIFICATION-2026-06.md). Do NOT re-run this generator without
   first merging those corrections into the master objects below — it will clobber verified data. */
// Generates all university JSON data files into /data/universities/<ABBR>/
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, 'universities');

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

// ─── MASTER REGISTRY ─────────────────────────────────────────────────────────
const INDEX = {
  _version: '1.0.0', _updated: '2026-05-19', _total: 26,
  universities: [
    { abbr:'UCT',    name:'University of Cape Town',                    city:'Cape Town',        province:'Western Cape',   type:'Research University',          aps:'36–44+',  students:29000, founded:1829, logo:'uct.png',      website:'https://www.uct.ac.za',            apply:'https://myapps.uct.ac.za/',                          prospectus:'https://www.uct.ac.za/apply/undergraduate/undergraduate-prospectus' },
    { abbr:'WITS',   name:'University of the Witwatersrand',            city:'Johannesburg',     province:'Gauteng',        type:'Research University',          aps:'34–44+',  students:40000, founded:1922, logo:'wits.jpg',     website:'https://www.wits.ac.za',           apply:'https://www.wits.ac.za/application/',                 prospectus:'https://www.wits.ac.za/application/undergraduate/' },
    { abbr:'SU',     name:'Stellenbosch University',                    city:'Stellenbosch',     province:'Western Cape',   type:'Research University',          aps:'30–42+',  students:32000, founded:1918, logo:'su.jpg',       website:'https://www.sun.ac.za',            apply:'https://www.sun.ac.za/english/student-affairs/Pages/Applications.aspx', prospectus:'https://www.sun.ac.za/english/student-affairs/Pages/Prospectus.aspx' },
    { abbr:'UP',     name:'University of Pretoria',                     city:'Pretoria',         province:'Gauteng',        type:'Comprehensive University',     aps:'28–42+',  students:54000, founded:1908, logo:'up.png',       website:'https://www.up.ac.za',             apply:'https://www.up.ac.za/apply',                          prospectus:'https://www.up.ac.za/prospective-student' },
    { abbr:'UJ',     name:'University of Johannesburg',                 city:'Johannesburg',     province:'Gauteng',        type:'Comprehensive University',     aps:'24–38+',  students:52000, founded:2005, logo:'uj.png',       website:'https://www.uj.ac.za',             apply:'https://www.uj.ac.za/apply-to-uj/',                   prospectus:'https://www.uj.ac.za/apply-to-uj/applications/undergraduate-admissions/prospectus/' },
    { abbr:'UKZN',   name:'University of KwaZulu-Natal',                city:'Durban',           province:'KwaZulu-Natal',  type:'Comprehensive University',     aps:'26–42+',  students:47000, founded:2004, logo:'ukzn.png',     website:'https://www.ukzn.ac.za',           apply:'https://applications.ukzn.ac.za/',                    prospectus:'https://www.ukzn.ac.za/ukzn-for-students/' },
    { abbr:'RU',     name:'Rhodes University',                          city:'Makhanda',         province:'Eastern Cape',   type:'Traditional University',       aps:'28–36+',  students:8000,  founded:1904, logo:'ru.png',       website:'https://www.ru.ac.za',             apply:'https://applications.ru.ac.za/',                      prospectus:'https://www.ru.ac.za/institutionalplanning/registrar/applications/' },
    { abbr:'CPUT',   name:'Cape Peninsula University of Technology',    city:'Cape Town',        province:'Western Cape',   type:'University of Technology',     aps:'18–28+',  students:35000, founded:2005, logo:'cput.svg',     website:'https://www.cput.ac.za',           apply:'https://www.cput.ac.za/apply',                        prospectus:'https://www.cput.ac.za/students/faculties' },
    { abbr:'DUT',    name:'Durban University of Technology',            city:'Durban',           province:'KwaZulu-Natal',  type:'University of Technology',     aps:'18–26+',  students:25000, founded:2002, logo:'dut.jpg',      website:'https://www.dut.ac.za',            apply:'https://www.dut.ac.za/admissions/',                   prospectus:'https://www.dut.ac.za/admissions/how-to-apply/' },
    { abbr:'NMU',    name:'Nelson Mandela University',                  city:'Gqeberha',         province:'Eastern Cape',   type:'Comprehensive University',     aps:'22–36+',  students:27000, founded:2005, logo:'nmu.png',      website:'https://www.mandela.ac.za',        apply:'https://www.mandela.ac.za/Study-at-Mandela/Undergraduate/Apply', prospectus:'https://www.mandela.ac.za/Study-at-Mandela/Undergraduate' },
    { abbr:'UFS',    name:'University of the Free State',               city:'Bloemfontein',     province:'Free State',     type:'Comprehensive University',     aps:'22–38+',  students:39000, founded:1904, logo:'ufs.png',      website:'https://www.ufs.ac.za',            apply:'https://apply.ufs.ac.za/',                            prospectus:'https://www.ufs.ac.za/apply/prospectus' },
    { abbr:'UNISA',  name:'University of South Africa',                 city:'Pretoria',         province:'National',       type:'Distance University',          aps:'15–30+',  students:400000,founded:1873, logo:'unisa.jpg',    website:'https://www.unisa.ac.za',          apply:'https://my.unisa.ac.za/portal/',                      prospectus:'https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission/Undergraduate-prospectus' },
    { abbr:'UWC',    name:'University of the Western Cape',             city:'Bellville',        province:'Western Cape',   type:'Comprehensive University',     aps:'22–34+',  students:22000, founded:1960, logo:'uwc.svg',      website:'https://www.uwc.ac.za',            apply:'https://www.uwc.ac.za/apply',                         prospectus:'https://www.uwc.ac.za/study/all-programmes' },
    { abbr:'UFH',    name:'University of Fort Hare',                    city:'Alice',            province:'Eastern Cape',   type:'Traditional University',       aps:'18–28+',  students:12000, founded:1916, logo:'ufh.png',      website:'https://www.ufh.ac.za',            apply:'https://www.ufh.ac.za/admissions',                    prospectus:'https://www.ufh.ac.za/admissions' },
    { abbr:'WSU',    name:'Walter Sisulu University',                   city:'Mthatha',          province:'Eastern Cape',   type:'Comprehensive University',     aps:'18–28+',  students:28000, founded:2005, logo:'wsu.png',      website:'https://www.wsu.ac.za',            apply:'https://www.wsu.ac.za/admissions',                    prospectus:'https://www.wsu.ac.za/admissions' },
    { abbr:'NWU',    name:'North-West University',                      city:'Potchefstroom',    province:'North West',     type:'Comprehensive University',     aps:'20–34+',  students:65000, founded:2004, logo:'nwu.png',      website:'https://www.nwu.ac.za',            apply:'https://www.nwu.ac.za/applying-for-studies',          prospectus:'https://www.nwu.ac.za/applying-for-studies' },
    { abbr:'UniZ',   name:'University of Zululand',                     city:'KwaDlangezwa',     province:'KwaZulu-Natal',  type:'Traditional University',       aps:'18–26+',  students:16000, founded:1960, logo:'unizulu.png',  website:'https://www.unizulu.ac.za',        apply:'https://www.unizulu.ac.za/application',               prospectus:'https://www.unizulu.ac.za/prospectus' },
    { abbr:'UNIVEN', name:'University of Venda',                        city:'Thohoyandou',      province:'Limpopo',        type:'Traditional University',       aps:'18–26+',  students:15000, founded:1982, logo:'univen.png',   website:'https://www.univen.ac.za',         apply:'https://www.univen.ac.za/admissions',                 prospectus:'https://www.univen.ac.za/admissions' },
    { abbr:'UL',     name:'University of Limpopo',                      city:'Polokwane',        province:'Limpopo',        type:'Traditional University',       aps:'18–28+',  students:18000, founded:1959, logo:'ul.png',       website:'https://www.ul.ac.za',             apply:'https://www.ul.ac.za/admissions',                     prospectus:'https://www.ul.ac.za/admissions' },
    { abbr:'SMU',    name:'Sefako Makgatho Health Sciences University', city:'Medunsa',          province:'Gauteng',        type:'Health Sciences University',   aps:'34–44+',  students:5000,  founded:2015, logo:'smu.png',      website:'https://www.smu.ac.za',            apply:'https://www.smu.ac.za/admissions',                    prospectus:'https://www.smu.ac.za/admissions' },
    { abbr:'TUT',    name:'Tshwane University of Technology',           city:'Pretoria',         province:'Gauteng',        type:'University of Technology',     aps:'18–28+',  students:60000, founded:2004, logo:'tut.png',      website:'https://www.tut.ac.za',            apply:'https://www.tut.ac.za/apply',                         prospectus:'https://www.tut.ac.za/apply' },
    { abbr:'VUT',    name:'Vaal University of Technology',              city:'Vanderbijlpark',   province:'Gauteng',        type:'University of Technology',     aps:'18–26+',  students:20000, founded:1966, logo:'vut.png',      website:'https://www.vut.ac.za',            apply:'https://www.vut.ac.za/admissions',                    prospectus:'https://www.vut.ac.za/admissions' },
    { abbr:'MUT',    name:'Mangosuthu University of Technology',        city:'Umlazi',           province:'KwaZulu-Natal',  type:'University of Technology',     aps:'18–24+',  students:12000, founded:1979, logo:'mut.png',      website:'https://www.mut.ac.za',            apply:'https://www.mut.ac.za/admissions',                    prospectus:'https://www.mut.ac.za/admissions' },
    { abbr:'SPU',    name:'Sol Plaatje University',                     city:'Kimberley',        province:'Northern Cape',  type:'Comprehensive University',     aps:'22–30+',  students:4000,  founded:2014, logo:'spu.png',      website:'https://www.spu.ac.za',            apply:'https://www.spu.ac.za/admissions',                    prospectus:'https://www.spu.ac.za/admissions' },
    { abbr:'UMP',    name:'University of Mpumalanga',                   city:'Mbombela',         province:'Mpumalanga',     type:'Comprehensive University',     aps:'22–30+',  students:5000,  founded:2014, logo:'ump.png',      website:'https://www.ump.ac.za',            apply:'https://www.ump.ac.za/admissions',                    prospectus:'https://www.ump.ac.za/admissions' },
    { abbr:'CUT',    name:'Central University of Technology',           city:'Bloemfontein',     province:'Free State',     type:'University of Technology',     aps:'18–26+',  students:15000, founded:1981, logo:'cut.png',      website:'https://www.cut.ac.za',            apply:'https://www.cut.ac.za/apply',                         prospectus:'https://www.cut.ac.za/apply' },
  ]
};

// ─── UNIVERSITY PROFILES ─────────────────────────────────────────────────────
const PROFILES = {
  UCT: {
    description: "Africa's leading research university, ranked #1 on the continent. UCT sits on the slopes of Devil's Peak in Cape Town with six faculties and world-class medical, engineering and law schools.",
    faculties: ['Commerce','Engineering & Built Env.','Health Sciences','Humanities','Law','Science'],
    motto: 'Spes bona (Good Hope)',
    languages: ['English'],
    campuses: ['Upper Campus','Middle Campus','Lower Campus','Health Sciences','Breakwater (GSB)'],
    nsfasAccredited: true
  },
  WITS: {
    description: "One of Africa's premier research universities, renowned for engineering, medicine and the arts. Located in Johannesburg's Braamfontein education hub with a strong legacy of academic activism.",
    faculties: ['Commerce, Law & Management','Engineering & Built Env.','Health Sciences','Humanities','Science'],
    motto: 'Scientia et Labor (Knowledge and Work)',
    languages: ['English'],
    campuses: ['East Campus','West Campus','Education Campus','Health Sciences (Parktown)'],
    nsfasAccredited: true
  },
  SU: {
    description: 'A bilingual Afrikaans/English research university in the scenic Winelands, renowned for engineering, agriculture, medicine and business. Consistently ranked among Africa\'s top 5 universities.',
    faculties: ['AgriSciences','Arts & Social Sciences','Economic & Mgmt Sciences','Education','Engineering','Law','Medicine & Health Sciences','Science','Theology'],
    motto: 'Pectora roborant cultus (Culture strengthens hearts)',
    languages: ['Afrikaans','English'],
    campuses: ['Stellenbosch','Tygerberg (Medical)','Saldanha (Military)'],
    nsfasAccredited: true
  },
  UP: {
    description: "South Africa's largest residential university with over 1,000 study programmes. Famous for its Veterinary Science, Medical and Engineering faculties on a stunning 650-hectare campus in Pretoria.",
    faculties: ['Economic & Mgmt Sciences','Education','Engineering, Built Env. & IT','Health Sciences','Humanities','IT','Law','Natural & Agricultural Sciences','Theology & Religion','Veterinary Science'],
    motto: 'Lampadem Tradam (I Will Hand on the Torch)',
    languages: ['Afrikaans','English'],
    campuses: ['Hatfield','Groenkloof','Onderstepoort (Vet)','Prinshof (Health Sciences)'],
    nsfasAccredited: true
  },
  UJ: {
    description: "One of South Africa's largest urban universities with four campuses across Johannesburg. Known for diverse offerings spanning arts, science, engineering and business with strong industry connections.",
    faculties: ['Art, Design & Architecture','Education','Engineering & Built Env.','Health Sciences','Humanities','Law','Management','Science'],
    motto: 'Transformation through Knowledge',
    languages: ['Afrikaans','English'],
    campuses: ['Auckland Park Kingsway','Auckland Park Bunting Road','Doornfontein','Soweto'],
    nsfasAccredited: true
  },
  UKZN: {
    description: 'Spread across five campuses in KwaZulu-Natal with strong health sciences, law and humanities programmes. A merger of the former University of Natal and University of Durban-Westville in 2004.',
    faculties: ['Agriculture, Engineering & Science','Health Sciences','Humanities','Law & Mgmt Studies','Science & Agriculture'],
    motto: 'Inspiring Greatness',
    languages: ['English','isiZulu'],
    campuses: ['Howard College (Durban)','Medical School (Durban)','Westville','Edgewood (Pinetown)','Pietermaritzburg'],
    nsfasAccredited: true
  },
  RU: {
    description: 'A small, selective university known for high academic standards and vibrant student life in Makhanda. Consistently among the top SA universities with outstanding journalism, law and science schools.',
    faculties: ['Commerce','Education','Humanities','Law','Pharmacy','Science'],
    motto: 'Where Leaders Learn',
    languages: ['English'],
    campuses: ['Main Campus (Makhanda)'],
    nsfasAccredited: true
  },
  CPUT: {
    description: 'The largest university of technology in the Western Cape, offering industry-linked diplomas and degrees. Six faculties spanning engineering, business, health, IT and design across two main campuses.',
    faculties: ['Applied Sciences','Business & Mgmt Sciences','Education','Engineering','Health & Wellness Sciences','Informatics & Design'],
    motto: 'Innovative Excellence',
    languages: ['Afrikaans','English'],
    campuses: ['Bellville','Cape Town City'],
    nsfasAccredited: true
  },
  DUT: {
    description: "KwaZulu-Natal's leading university of technology offering applied, vocational and career-focused programmes. Strong links to Durban's industrial and commercial sectors.",
    faculties: ['Accounting & Informatics','Applied Sciences','Arts & Design','Engineering & Built Env.','Health Sciences','Management Sciences'],
    motto: 'Inspiring Futures',
    languages: ['English'],
    campuses: ['Steve Biko (Durban)','ML Sultan','Riverside (Pietermaritzburg)'],
    nsfasAccredited: true
  },
  NMU: {
    description: "Named in honour of Nelson Mandela. A comprehensive university blending academic and technology programmes across seven faculties in Port Elizabeth (Gqeberha), Eastern Cape.",
    faculties: ['Arts','Business & Economic Sciences','Education','Engineering & Built Env.','Health Sciences','Law','Science'],
    motto: 'Change the World',
    languages: ['Afrikaans','English','isiXhosa'],
    campuses: ['South (Main)','North','Missionvale','George'],
    nsfasAccredited: true
  },
  UFS: {
    description: 'The only university in the Free State, offering programmes from foundation to doctoral level across three campuses. Strong medical school and a rich history of student activism.',
    faculties: ['Economic & Mgmt Sciences','Education','Health Sciences','Humanities','Law','Natural & Agricultural Sciences','Theology & Religion'],
    motto: 'In Limine Aurorae (At the Threshold of Dawn)',
    languages: ['Afrikaans','English','Sesotho'],
    campuses: ['Bloemfontein (Main)','South Campus','Qwaqwa'],
    nsfasAccredited: true
  },
  UNISA: {
    description: 'The largest university on the African continent by enrolment. Offers flexible distance education to over 400,000 students across South Africa and globally — study at your own pace.',
    faculties: ['Accounting Sciences','Agriculture & Env Sciences','Communication & Human Sciences','Economic & Mgmt Sciences','Education','Law','Science, Engineering & Technology','Theology & Religion'],
    motto: 'In Diebus Illis (In Those Days)',
    languages: ['Afrikaans','English','Sepedi','Sesotho','Setswana','isiZulu'],
    campuses: ['Distance Learning (National)'],
    nsfasAccredited: true
  },
  UWC: {
    description: 'A historically significant institution that became a leading academic university. Strong in dentistry, law and community health. Serves diverse students across the Western Cape.',
    faculties: ['Arts','Community & Health Sciences','Dentistry','Economic & Mgmt Sciences','Education','Law','Natural Sciences','Nursing'],
    motto: 'A place for learning, a place for growth',
    languages: ['Afrikaans','English','Xhosa'],
    campuses: ['Bellville (Main)'],
    nsfasAccredited: true
  },
  UFH: {
    description: "One of Africa's oldest historically Black universities — alma mater of Nelson Mandela, Oliver Tambo and many African leaders. A symbol of the African liberation movement.",
    faculties: ['Agriculture','Education','Law','Management & Commerce','Science & Agriculture','Social Sciences & Humanities'],
    motto: 'Lux in Tenebris (Light in Darkness)',
    languages: ['English','isiXhosa'],
    campuses: ['Alice (Main)','East London'],
    nsfasAccredited: true
  },
  WSU: {
    description: 'Named after liberation hero Walter Sisulu. A comprehensive university serving rural Eastern Cape communities with campuses across the region.',
    faculties: ['Business, Mgmt Sciences & Law','Education','Health Sciences','Natural Sciences, Engineering & Technology'],
    motto: 'Excellence and Relevance',
    languages: ['English','isiXhosa'],
    campuses: ['Mthatha (Main)','Butterworth','East London','Queenstown'],
    nsfasAccredited: true
  },
  NWU: {
    description: "South Africa's largest university by student numbers. Three campuses spanning Potchefstroom, Mahikeng and Vanderbijlpark with strong engineering, health and education faculties.",
    faculties: ['Commerce & Law','Education','Engineering','Health Sciences','Humanities','Natural Sciences','Theology'],
    motto: 'Ons bring mekaar verder / We take each other further',
    languages: ['Afrikaans','English','Setswana'],
    campuses: ['Potchefstroom','Mahikeng','Vanderbijlpark (Vaal Triangle)'],
    nsfasAccredited: true
  },
  UniZ: {
    description: 'A historically Black university serving rural KwaZulu-Natal. Strong in social work, theology and natural sciences with a growing health sciences faculty.',
    faculties: ['Arts','Commerce, Administration & Law','Education','Science & Agriculture'],
    motto: 'Excellence in Learning and Teaching',
    languages: ['English','isiZulu'],
    campuses: ['KwaDlangezwa (Main)','Richards Bay'],
    nsfasAccredited: true
  },
  UNIVEN: {
    description: 'Serves the rural Vhembe district in Limpopo. Known for environmental sciences, health sciences and agriculture, training professionals for remote and underserved communities.',
    faculties: ['Agriculture','Education','Health Sciences','Human Sciences','Law','Science, Engineering & Technology'],
    motto: 'Empowering Future Leaders',
    languages: ['English','Tshivenda','Xitsonga'],
    campuses: ['Thohoyandou (Main)'],
    nsfasAccredited: true
  },
  UL: {
    description: "Formerly the University of the North (Turfloop). A historically Black institution that produced many anti-apartheid activists. Especially strong in health sciences and law.",
    faculties: ['Humanities','Management & Law','Science & Agriculture'],
    motto: 'Touching Lives, Inspiring Hope',
    languages: ['English','Sepedi','Sesotho sa Leboa'],
    campuses: ['Polokwane (Turfloop)','Medunsa'],
    nsfasAccredited: true
  },
  SMU: {
    description: "South Africa's only dedicated health sciences university. Offers MBChB, dentistry, pharmacy and allied health programmes at the Dr George Mukhari Academic Hospital campus.",
    faculties: ['Dentistry','Health Sciences','Pharmacy','Preclinical Sciences'],
    motto: 'Excellence in Health Sciences Education',
    languages: ['English'],
    campuses: ['Medunsa, Ga-Rankuwa'],
    nsfasAccredited: true
  },
  TUT: {
    description: 'One of the largest universities of technology in South Africa. Campuses in Pretoria, Ga-Rankuwa and eMalahleni renowned for engineering, IT and design.',
    faculties: ['Arts & Design','Economics & Finance','Engineering & Built Env.','Humanities','IT','Management Sciences','Science'],
    motto: 'Transforming Lives through Quality Education',
    languages: ['Afrikaans','English'],
    campuses: ['Pretoria (Main)','Pretoria West','Ga-Rankuwa','eMalahleni'],
    nsfasAccredited: true
  },
  VUT: {
    description: 'Located in the industrial Vaal Triangle with strong links to automotive, steel and manufacturing industries. Offers career-focused applied programmes with work-integrated learning.',
    faculties: ['Applied & Computer Sciences','Engineering & Technology','Humanities','Management Sciences'],
    motto: 'Knowledge — Empowerment — Career',
    languages: ['Afrikaans','English'],
    campuses: ['Vanderbijlpark (Main)'],
    nsfasAccredited: true
  },
  MUT: {
    description: 'Named after Prince Mangosuthu Buthelezi. A small specialised technology university in Umlazi, Durban with strong process engineering, public management and nature conservation programmes.',
    faculties: ['Engineering','Management Sciences','Natural Sciences'],
    motto: 'Empowering the Community through Education',
    languages: ['English','isiZulu'],
    campuses: ['Umlazi, Durban'],
    nsfasAccredited: true
  },
  SPU: {
    description: "South Africa's newest traditional university (est. 2014), named after journalist and activist Sol Plaatje. Located in Kimberley, focusing on economic development and serving the Northern Cape.",
    faculties: ['Economic & Mgmt Sciences','Education','Humanities','Natural & Applied Sciences'],
    motto: 'Aspire. Achieve. Make a Difference.',
    languages: ['Afrikaans','English','Setswana'],
    campuses: ['Kimberley (Main)'],
    nsfasAccredited: true
  },
  UMP: {
    description: "Established in 2014 to serve Mpumalanga's higher education needs. Focuses on agriculture, education and hospitality — industries central to the province's economy.",
    faculties: ['Agriculture & Natural Sciences','Education','Hospitality & Tourism'],
    motto: 'Excellence in Teaching and Learning',
    languages: ['English','isiSwati','Xitsonga'],
    campuses: ['Mbombela (Main)','Siyabuswa'],
    nsfasAccredited: true
  },
  CUT: {
    description: 'The only university of technology in the Free State. Offers applied programmes in engineering, health, management and built environment across Bloemfontein and Welkom campuses.',
    faculties: ['Engineering & IT','Health & Environmental Sciences','Humanities','Management Sciences'],
    motto: 'Transforming Lives',
    languages: ['Afrikaans','English'],
    campuses: ['Bloemfontein (Main)','Welkom'],
    nsfasAccredited: true
  },
};

// ─── ADMISSION DATES & REQUIREMENTS ──────────────────────────────────────────
const ADMISSIONS = {
  UCT:    { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:true,  minAPS:36, note:'Health Sciences closes 30 June. NBT required for most faculties.' },
  WITS:   { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:true,  minAPS:34, note:'Engineering and Health Sciences close earlier. Check faculty pages.' },
  SU:     { opens:'1 March 2026',    closes:'31 July 2026',      fee:100,  feeWaiver:false, minAPS:30, note:'Medicine closes 31 May. Some faculties close as early as 30 April.' },
  UP:     { opens:'1 April 2026',    closes:'30 June 2026',      fee:200,  feeWaiver:true,  minAPS:28, note:'Health Sciences and Veterinary Science close 30 April.' },
  UJ:     { opens:'1 April 2026',    closes:'30 September 2026', fee:200,  feeWaiver:false, minAPS:24, note:'Applications on a first-come, first-served basis.' },
  UKZN:   { opens:'1 April 2026',    closes:'30 September 2026', fee:200,  feeWaiver:false, minAPS:26, note:'Health Sciences closes 30 June. Apply early for competitive programmes.' },
  RU:     { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:true,  minAPS:28, note:'Pharmacy closes 31 July. Rolling admissions — apply early.' },
  CPUT:   { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:18, note:'Some programmes have earlier closing dates. Check website.' },
  DUT:    { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:18, note:'Health Sciences closes 31 July. Applications processed on rolling basis.' },
  NMU:    { opens:'1 April 2026',    closes:'31 October 2026',   fee:100,  feeWaiver:true,  minAPS:22, note:'Extended closing date for most programmes. Health Sciences closes earlier.' },
  UFS:    { opens:'1 April 2026',    closes:'31 August 2026',    fee:200,  feeWaiver:false, minAPS:22, note:'Medicine closes 30 April. Qwaqwa Campus has separate closing dates.' },
  UNISA:  { opens:'1 January 2026',  closes:'Rolling',           fee:135,  feeWaiver:false, minAPS:15, note:'Semester 1 registration: January–February. Semester 2: July–August.' },
  UWC:    { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:22, note:'Dentistry closes 30 June. Applications assessed on ongoing basis.' },
  UFH:    { opens:'1 March 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:18, note:'East London campus has different intake dates for some programmes.' },
  WSU:    { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:18, note:'Health Sciences closes 31 July. Space is limited — apply early.' },
  NWU:    { opens:'1 April 2026',    closes:'30 June 2026',      fee:100,  feeWaiver:false, minAPS:20, note:'Earlier closing than most universities. Potchefstroom is most competitive.' },
  UniZ:   { opens:'1 March 2026',    closes:'31 August 2026',    fee:100,  feeWaiver:false, minAPS:18, note:'Richards Bay Campus may have separate closing dates for some programmes.' },
  UNIVEN: { opens:'1 March 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:18, note:'Health Sciences programmes close 31 May. Space limited — apply early.' },
  UL:     { opens:'1 March 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:18, note:'Health Sciences programmes close 30 June. Medunsa campus has limited space.' },
  SMU:    { opens:'1 March 2026',    closes:'31 May 2026',       fee:200,  feeWaiver:false, minAPS:34, note:'Dedicated health sciences university — all programmes extremely competitive.' },
  TUT:    { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:18, note:'Ga-Rankuwa and eMalahleni campuses may have separate intakes.' },
  VUT:    { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:18, note:'Applications on a first-come, first-served basis per programme.' },
  MUT:    { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:18, note:'Small institution — limited spaces per programme. Apply early.' },
  SPU:    { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:22, note:'New university with growing intake. Community development focus.' },
  UMP:    { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:22, note:'Siyabuswa campus focuses on education and agriculture programmes.' },
  CUT:    { opens:'1 April 2026',    closes:'30 September 2026', fee:100,  feeWaiver:false, minAPS:18, note:'Welkom campus focuses on engineering and management sciences.' },
};

const REQUIRED_DOCS = [
  'Certified copy of South African ID or valid passport',
  'Certified copy of matric certificate or statement of results',
  'Grade 11 and Grade 12 school report',
  'Proof of residence (not older than 3 months)',
  'Completed application form',
];

// ─── CONTACT DETAILS ─────────────────────────────────────────────────────────
const CONTACTS = {
  UCT:    { phone:'+27 21 650 9111', email:'registrar@uct.ac.za',       admissionsEmail:'ugadmissions@uct.ac.za',    admissionsPhone:'+27 21 650 2128', financialAidEmail:'financial.aid@uct.ac.za',    financialAidPhone:'+27 21 650 3545', address:'University of Cape Town, Private Bag X3, Rondebosch, Cape Town, 7701',             facebook:'https://www.facebook.com/UCT.ac.za',           twitter:'https://twitter.com/UCT_news',         instagram:'https://www.instagram.com/uct_official' },
  WITS:   { phone:'+27 11 717 1000', email:'admission@wits.ac.za',      admissionsEmail:'admission@wits.ac.za',      admissionsPhone:'+27 11 717 1888', financialAidEmail:'sas@wits.ac.za',             financialAidPhone:'+27 11 717 9030', address:'University of the Witwatersrand, 1 Jan Smuts Ave, Braamfontein, 2000',             facebook:'https://www.facebook.com/WitsUniversity',      twitter:'https://twitter.com/WitsUniversity',   instagram:'https://www.instagram.com/witsuniversity' },
  SU:     { phone:'+27 21 808 9111', email:'info@sun.ac.za',            admissionsEmail:'undergraduate@sun.ac.za',   admissionsPhone:'+27 21 808 9227', financialAidEmail:'finaid@sun.ac.za',           financialAidPhone:'+27 21 808 4982', address:'Stellenbosch University, Private Bag X1, Matieland, Stellenbosch, 7602',          facebook:'https://www.facebook.com/StellenboschUni',     twitter:'https://twitter.com/StellenboschUni',  instagram:'https://www.instagram.com/stellenboschuni' },
  UP:     { phone:'+27 12 420 3111', email:'csc@up.ac.za',              admissionsEmail:'csc@up.ac.za',              admissionsPhone:'+27 12 420 3111', financialAidEmail:'financialaid@up.ac.za',      financialAidPhone:'+27 12 420 4555', address:'University of Pretoria, Private Bag X20, Hatfield, Pretoria, 0028',               facebook:'https://www.facebook.com/universityofpretoria', twitter:'https://twitter.com/UPTuks',           instagram:'https://www.instagram.com/universityofpretoria' },
  UJ:     { phone:'+27 11 559 4555', email:'info@uj.ac.za',             admissionsEmail:'undergrad@uj.ac.za',        admissionsPhone:'+27 11 559 4555', financialAidEmail:'financialaid@uj.ac.za',      financialAidPhone:'+27 11 559 2407', address:'University of Johannesburg, PO Box 524, Auckland Park, Johannesburg, 2006',       facebook:'https://www.facebook.com/UJuniversity',        twitter:'https://twitter.com/UJReporter',       instagram:'https://www.instagram.com/ujuniversity' },
  UKZN:   { phone:'+27 31 260 2212', email:'registrar@ukzn.ac.za',      admissionsEmail:'applications@ukzn.ac.za',   admissionsPhone:'+27 31 260 2212', financialAidEmail:'ssc@ukzn.ac.za',             financialAidPhone:'+27 31 260 2111', address:'UKZN, Postal Bag X54001, Durban, 4000',                                           facebook:'https://www.facebook.com/UKZNonline',          twitter:'https://twitter.com/UKZNonline',       instagram:'https://www.instagram.com/ukznonline' },
  RU:     { phone:'+27 46 603 8111', email:'admissions@ru.ac.za',       admissionsEmail:'admissions@ru.ac.za',       admissionsPhone:'+27 46 603 8523', financialAidEmail:'financialaid@ru.ac.za',      financialAidPhone:'+27 46 603 8399', address:'Rhodes University, PO Box 94, Makhanda, Eastern Cape, 6140',                      facebook:'https://www.facebook.com/RhodesUniversity',    twitter:'https://twitter.com/RhodesUniversity',  instagram:'https://www.instagram.com/rhodesuniversity' },
  CPUT:   { phone:'+27 21 959 6767', email:'info@cput.ac.za',           admissionsEmail:'admissions@cput.ac.za',     admissionsPhone:'+27 21 959 6767', financialAidEmail:'financialaid@cput.ac.za',    financialAidPhone:'+27 21 959 6040', address:'CPUT, PO Box 652, Cape Town, 8000',                                               facebook:'https://www.facebook.com/CPUTofficial',        twitter:'https://twitter.com/CPUT',             instagram:'https://www.instagram.com/cput_official' },
  DUT:    { phone:'+27 31 373 2000', email:'info@dut.ac.za',            admissionsEmail:'admissions@dut.ac.za',      admissionsPhone:'+27 31 373 2000', financialAidEmail:'sas@dut.ac.za',              financialAidPhone:'+27 31 373 2537', address:'Durban University of Technology, PO Box 1334, Durban, 4000',                     facebook:'https://www.facebook.com/DurbanUniversityofTechnology', twitter:'https://twitter.com/DUT4life', instagram:'https://www.instagram.com/dut_sa' },
  NMU:    { phone:'+27 41 504 1111', email:'info@mandela.ac.za',        admissionsEmail:'admissions@mandela.ac.za',  admissionsPhone:'+27 41 504 2262', financialAidEmail:'financialaid@mandela.ac.za', financialAidPhone:'+27 41 504 2072', address:'Nelson Mandela University, PO Box 77000, Gqeberha, 6031',                        facebook:'https://www.facebook.com/MandelaUni',          twitter:'https://twitter.com/MandelaUni',       instagram:'https://www.instagram.com/mandelauni' },
  UFS:    { phone:'+27 51 401 9111', email:'info@ufs.ac.za',            admissionsEmail:'admissions@ufs.ac.za',      admissionsPhone:'+27 51 401 2009', financialAidEmail:'financialaid@ufs.ac.za',     financialAidPhone:'+27 51 401 2799', address:'University of the Free State, PO Box 339, Bloemfontein, 9300',                   facebook:'https://www.facebook.com/ufs.ac.za',           twitter:'https://twitter.com/ufsacademic',      instagram:'https://www.instagram.com/ufsacademic' },
  UNISA:  { phone:'+27 12 429 3111', email:'study-info@unisa.ac.za',    admissionsEmail:'study-info@unisa.ac.za',    admissionsPhone:'+27 12 429 3111', financialAidEmail:'financialaid@unisa.ac.za',   financialAidPhone:'+27 12 429 6211', address:'UNISA, PO Box 392, Pretoria, 0003',                                               facebook:'https://www.facebook.com/UnisaSA',             twitter:'https://twitter.com/UnisaSA',          instagram:'https://www.instagram.com/unisa_sa' },
  UWC:    { phone:'+27 21 959 2911', email:'studinfo@uwc.ac.za',        admissionsEmail:'studinfo@uwc.ac.za',        admissionsPhone:'+27 21 959 2911', financialAidEmail:'financialaid@uwc.ac.za',     financialAidPhone:'+27 21 959 2938', address:'University of the Western Cape, Private Bag X17, Bellville, Cape Town, 7535',     facebook:'https://www.facebook.com/UWCofficial',         twitter:'https://twitter.com/UWCofficial',      instagram:'https://www.instagram.com/uwc_official' },
  UFH:    { phone:'+27 40 602 2011', email:'registrar@ufh.ac.za',       admissionsEmail:'admissions@ufh.ac.za',      admissionsPhone:'+27 40 602 2011', financialAidEmail:'financialaid@ufh.ac.za',     financialAidPhone:'+27 40 602 2346', address:'University of Fort Hare, Private Bag X1314, Alice, Eastern Cape, 5700',           facebook:'https://www.facebook.com/UFHfortHare',         twitter:'https://twitter.com/FortHareUni',      instagram:'https://www.instagram.com/forthareuiversity' },
  WSU:    { phone:'+27 47 502 2111', email:'admissions@wsu.ac.za',      admissionsEmail:'admissions@wsu.ac.za',      admissionsPhone:'+27 47 502 2111', financialAidEmail:'financialaid@wsu.ac.za',     financialAidPhone:'+27 47 502 2388', address:'Walter Sisulu University, Private Bag X1, Mthatha, Eastern Cape, 5117',           facebook:'https://www.facebook.com/WalterSisuluUniversity', twitter:'https://twitter.com/WSUcoza',        instagram:'https://www.instagram.com/wsucoza' },
  NWU:    { phone:'+27 18 299 1111', email:'admissions@nwu.ac.za',      admissionsEmail:'admissions@nwu.ac.za',      admissionsPhone:'+27 18 299 4444', financialAidEmail:'financialaid@nwu.ac.za',     financialAidPhone:'+27 18 299 2222', address:'North-West University, Private Bag X6001, Potchefstroom, 2520',                   facebook:'https://www.facebook.com/nwuac',               twitter:'https://twitter.com/nwuac',            instagram:'https://www.instagram.com/nwuac' },
  UniZ:   { phone:'+27 35 902 6000', email:'registrar@unizulu.ac.za',   admissionsEmail:'admissions@unizulu.ac.za',  admissionsPhone:'+27 35 902 6000', financialAidEmail:'financialaid@unizulu.ac.za', financialAidPhone:'+27 35 902 6232', address:'University of Zululand, Private Bag X1001, KwaDlangezwa, 3886',                   facebook:'https://www.facebook.com/UniZululand',         twitter:'https://twitter.com/UniZululand',      instagram:'https://www.instagram.com/unizululand' },
  UNIVEN: { phone:'+27 15 962 8000', email:'registrar@univen.ac.za',    admissionsEmail:'admissions@univen.ac.za',   admissionsPhone:'+27 15 962 8000', financialAidEmail:'financialaid@univen.ac.za',  financialAidPhone:'+27 15 962 8219', address:'University of Venda, Private Bag X5050, Thohoyandou, Limpopo, 0950',              facebook:'https://www.facebook.com/UniVenda',            twitter:'https://twitter.com/univen_za',        instagram:'https://www.instagram.com/univen_za' },
  UL:     { phone:'+27 15 268 2400', email:'registrar@ul.ac.za',        admissionsEmail:'admissions@ul.ac.za',       admissionsPhone:'+27 15 268 2400', financialAidEmail:'financialaid@ul.ac.za',      financialAidPhone:'+27 15 268 2400', address:'University of Limpopo, Private Bag X1106, Sovenga, Polokwane, 0727',              facebook:'https://www.facebook.com/ULimpopo',            twitter:'https://twitter.com/ULimpopo',         instagram:'https://www.instagram.com/ulimpopo' },
  SMU:    { phone:'+27 12 521 4444', email:'admissions@smu.ac.za',      admissionsEmail:'admissions@smu.ac.za',      admissionsPhone:'+27 12 521 4444', financialAidEmail:'financialaid@smu.ac.za',     financialAidPhone:'+27 12 521 4500', address:'Sefako Makgatho Health Sciences University, PO Box 218, Medunsa, Pretoria, 0204', facebook:'https://www.facebook.com/SMUMedunsa',          twitter:'https://twitter.com/SMUMedunsa',       instagram:'https://www.instagram.com/smu_medunsa' },
  TUT:    { phone:'+27 12 382 4911', email:'contact@tut.ac.za',         admissionsEmail:'applications@tut.ac.za',    admissionsPhone:'+27 12 382 5614', financialAidEmail:'financialaid@tut.ac.za',     financialAidPhone:'+27 12 382 5151', address:'Tshwane University of Technology, Private Bag X680, Pretoria, 0001',              facebook:'https://www.facebook.com/TUTsa',               twitter:'https://twitter.com/TUTsa',            instagram:'https://www.instagram.com/tut_sa' },
  VUT:    { phone:'+27 16 950 9000', email:'infocenter@vut.ac.za',      admissionsEmail:'admissions@vut.ac.za',      admissionsPhone:'+27 16 950 9000', financialAidEmail:'financialaid@vut.ac.za',     financialAidPhone:'+27 16 950 9200', address:'Vaal University of Technology, Private Bag X021, Vanderbijlpark, 1900',           facebook:'https://www.facebook.com/VaalUniversityofTechnology', twitter:'https://twitter.com/VUT_official', instagram:'https://www.instagram.com/vut_official' },
  MUT:    { phone:'+27 31 907 7000', email:'registrar@mut.ac.za',       admissionsEmail:'admissions@mut.ac.za',      admissionsPhone:'+27 31 907 7000', financialAidEmail:'financialaid@mut.ac.za',     financialAidPhone:'+27 31 907 7111', address:'Mangosuthu University of Technology, PO Box 12363, Jacobs, Durban, 4026',        facebook:'https://www.facebook.com/MangosuthuUT',        twitter:'https://twitter.com/MangosuthuUT',     instagram:'https://www.instagram.com/mangosuthuut' },
  SPU:    { phone:'+27 53 491 0000', email:'info@spu.ac.za',            admissionsEmail:'admissions@spu.ac.za',      admissionsPhone:'+27 53 491 0000', financialAidEmail:'financialaid@spu.ac.za',     financialAidPhone:'+27 53 491 0111', address:'Sol Plaatje University, Private Bag X5008, Kimberley, Northern Cape, 8301',       facebook:'https://www.facebook.com/SolPlaatjeUniversity', twitter:'https://twitter.com/SPU_official',    instagram:'https://www.instagram.com/spu_official' },
  UMP:    { phone:'+27 13 002 0000', email:'admissions@ump.ac.za',      admissionsEmail:'admissions@ump.ac.za',      admissionsPhone:'+27 13 002 0000', financialAidEmail:'financialaid@ump.ac.za',     financialAidPhone:'+27 13 002 0111', address:'University of Mpumalanga, Private Bag X11283, Mbombela, Mpumalanga, 1200',       facebook:'https://www.facebook.com/UniMpumalanga',       twitter:'https://twitter.com/UMpumalanga',      instagram:'https://www.instagram.com/umpumalanga' },
  CUT:    { phone:'+27 51 507 3911', email:'info@cut.ac.za',            admissionsEmail:'admissions@cut.ac.za',      admissionsPhone:'+27 51 507 3911', financialAidEmail:'financialaid@cut.ac.za',     financialAidPhone:'+27 51 507 4011', address:'Central University of Technology, Private Bag X20539, Bloemfontein, Free State, 9300', facebook:'https://www.facebook.com/CUTfreestate', twitter:'https://twitter.com/CUTfreestate',   instagram:'https://www.instagram.com/cut_freestate' },
};

// ─── COURSES ─────────────────────────────────────────────────────────────────
const COURSES = {
  UCT:[
    {name:'Bachelor of Science in Computer Science',qual:'BSc',type:'Degree',faculty:'Science',aps:42,duration:'3 Years',desc:'Algorithms, software systems, AI and machine learning.'},
    {name:'Bachelor of Engineering (Civil)',qual:'BEng',type:'Degree',faculty:'Engineering & Built Env.',aps:42,duration:'4 Years',desc:'Structural engineering, construction and environmental systems.'},
    {name:'Bachelor of Engineering (Electrical)',qual:'BEng',type:'Degree',faculty:'Engineering & Built Env.',aps:42,duration:'4 Years',desc:'Power systems, electronics, control systems and telecommunications.'},
    {name:'MBChB — Bachelor of Medicine & Surgery',qual:'MBChB',type:'Degree',faculty:'Health Sciences',aps:44,duration:'6 Years',desc:'Comprehensive medical training from basic sciences to clinical rotations.'},
    {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Law',aps:38,duration:'4 Years',desc:'Constitutional, commercial, criminal and international law.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Commerce',aps:38,duration:'3 Years',desc:'Financial accounting, auditing, taxation towards CA(SA).'},
    {name:'BCom Finance',qual:'BCom',type:'Degree',faculty:'Commerce',aps:38,duration:'3 Years',desc:'Corporate finance, investments and financial markets.'},
    {name:'BCom Business Science',qual:'BCom',type:'Degree',faculty:'Commerce',aps:42,duration:'4 Years',desc:'Integrated business, management, economics and quantitative skills.'},
    {name:'BSc Data Science',qual:'BSc',type:'Degree',faculty:'Science',aps:38,duration:'3 Years',desc:'Statistics, machine learning, big data analytics and AI applications.'},
    {name:'Bachelor of Social Science',qual:'BSocSci',type:'Degree',faculty:'Humanities',aps:38,duration:'3 Years',desc:'Psychology, sociology, political science and communication.'},
    {name:'Bachelor of Architecture',qual:'BArch',type:'Degree',faculty:'Engineering & Built Env.',aps:40,duration:'5 Years',desc:'Architectural design, urban planning and environmental design.'},
    {name:'BSc Pharmacy',qual:'BPharm',type:'Degree',faculty:'Health Sciences',aps:38,duration:'4 Years',desc:'Pharmaceutical sciences, pharmacology and patient care.'},
    {name:'BA Film & Media Studies',qual:'BA',type:'Degree',faculty:'Humanities',aps:34,duration:'3 Years',desc:'Film production, media analysis and communication theory.'},
    {name:'BSc Mechanical Engineering',qual:'BScEng',type:'Degree',faculty:'Engineering & Built Env.',aps:42,duration:'4 Years',desc:'Thermodynamics, fluid mechanics, manufacturing and materials science.'},
  ],
  WITS:[
    {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science',aps:40,duration:'3 Years',desc:'Programming, data structures, systems design and software engineering.'},
    {name:'BEng Electrical Engineering',qual:'BEng',type:'Degree',faculty:'Engineering & Built Env.',aps:40,duration:'4 Years',desc:'Power systems, electronics and signal processing.'},
    {name:'BEng Chemical Engineering',qual:'BEng',type:'Degree',faculty:'Engineering & Built Env.',aps:40,duration:'4 Years',desc:'Process design, chemical reactions and industrial systems.'},
    {name:'MBChB — Bachelor of Medicine',qual:'MBChB',type:'Degree',faculty:'Health Sciences',aps:42,duration:'6 Years',desc:"One of Africa's leading medical schools with state-of-the-art training."},
    {name:'BDS — Bachelor of Dental Surgery',qual:'BDS',type:'Degree',faculty:'Health Sciences',aps:42,duration:'5 Years',desc:'Oral health, dental surgery and patient care.'},
    {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Commerce, Law & Management',aps:36,duration:'4 Years',desc:'South African and international law with a focus on commercial practice.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Commerce, Law & Management',aps:36,duration:'3 Years',desc:'Accounting, auditing and financial reporting.'},
    {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Commerce, Law & Management',aps:34,duration:'3 Years',desc:'Micro and macroeconomics, economic policy and quantitative methods.'},
    {name:'BA Political Science',qual:'BA',type:'Degree',faculty:'Humanities',aps:30,duration:'3 Years',desc:'Government, international relations, public policy and political theory.'},
    {name:'BA Journalism & Media Studies',qual:'BA',type:'Degree',faculty:'Humanities',aps:32,duration:'3 Years',desc:'Multimedia journalism, digital media and communication ethics.'},
    {name:'BSc Physics',qual:'BSc',type:'Degree',faculty:'Science',aps:38,duration:'3 Years',desc:'Classical and quantum mechanics, astrophysics and condensed matter.'},
    {name:'BSc Mathematics',qual:'BSc',type:'Degree',faculty:'Science',aps:38,duration:'3 Years',desc:'Pure and applied mathematics, statistics and mathematical modelling.'},
  ],
  SU:[
    {name:'BEng Mechanical Engineering',qual:'BEng',type:'Degree',faculty:'Engineering',aps:38,duration:'4 Years',desc:'Thermodynamics, fluid mechanics, manufacturing and design.'},
    {name:'BEng Civil Engineering',qual:'BEng',type:'Degree',faculty:'Engineering',aps:38,duration:'4 Years',desc:'Structural, geotechnical, environmental and water engineering.'},
    {name:'MBChB — Bachelor of Medicine',qual:'MBChB',type:'Degree',faculty:'Medicine & Health Sciences',aps:42,duration:'6 Years',desc:'Clinical medicine training on the Tygerberg campus.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:38,duration:'3 Years',desc:'Financial accounting, auditing and taxation.'},
    {name:'BCom International Business',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:36,duration:'3 Years',desc:'International trade, business strategy and economics.'},
    {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science',aps:36,duration:'3 Years',desc:'Software engineering, AI and data science.'},
    {name:'BSc Data Science',qual:'BSc',type:'Degree',faculty:'Science',aps:38,duration:'3 Years',desc:'Statistics, machine learning and business intelligence.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Law',aps:36,duration:'4 Years',desc:'South African private and public law in English and Afrikaans.'},
    {name:'BAgric Agricultural Sciences',qual:'BAgric',type:'Degree',faculty:'AgriSciences',aps:32,duration:'4 Years',desc:'Crop science, livestock, soil science and agribusiness.'},
    {name:'BEd Foundation Phase Teaching',qual:'BEd',type:'Degree',faculty:'Education',aps:30,duration:'4 Years',desc:'Teaching Grades R–3 with focus on early childhood literacy.'},
    {name:'BA (Humanities)',qual:'BA',type:'Degree',faculty:'Arts & Social Sciences',aps:34,duration:'3 Years',desc:'Languages, history, philosophy, sociology and cultural studies.'},
    {name:'BTh Theology',qual:'BTh',type:'Degree',faculty:'Theology',aps:28,duration:'3 Years',desc:'Biblical studies, systematic theology and church history.'},
  ],
  UP:[
    {name:'BVSc — Bachelor of Veterinary Science',qual:'BVSc',type:'Degree',faculty:'Veterinary Science',aps:42,duration:'6 Years',desc:'Animal health, surgery, large and small animal medicine.'},
    {name:'MBChB — Bachelor of Medicine',qual:'MBChB',type:'Degree',faculty:'Health Sciences',aps:42,duration:'6 Years',desc:'Comprehensive medical training at the Steve Biko Academic Hospital.'},
    {name:'BDent — Bachelor of Dentistry',qual:'BDent',type:'Degree',faculty:'Health Sciences',aps:40,duration:'5 Years',desc:'Oral health, dental surgery and patient management.'},
    {name:'BEng Civil Engineering',qual:'BEng',type:'Degree',faculty:'Engineering',aps:34,duration:'4 Years',desc:'Infrastructure, structural, water and transportation engineering.'},
    {name:'BEng Computer Engineering',qual:'BEng',type:'Degree',faculty:'Engineering',aps:34,duration:'4 Years',desc:'Embedded systems, hardware design and computer architecture.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:34,duration:'3 Years',desc:'Financial accounting, auditing and taxation towards CA(SA).'},
    {name:'BCom Financial Sciences',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:32,duration:'3 Years',desc:'Investment, corporate finance and financial risk management.'},
    {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'IT',aps:34,duration:'3 Years',desc:'Software development, data structures and system design.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Law',aps:32,duration:'4 Years',desc:'Contract, constitutional, criminal and commercial law.'},
    {name:'BSc Physiotherapy',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:34,duration:'4 Years',desc:'Rehabilitation, sports medicine and neurological therapy.'},
    {name:'BSc Pharmacy',qual:'BPharm',type:'Degree',faculty:'Health Sciences',aps:32,duration:'4 Years',desc:'Pharmaceutical sciences, drug dispensing and clinical pharmacy.'},
    {name:'BEd Education',qual:'BEd',type:'Degree',faculty:'Education',aps:28,duration:'4 Years',desc:'Foundation, intermediate and senior phase teaching.'},
    {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Natural & Agricultural Sciences',aps:28,duration:'4 Years',desc:'Crop production, agribusiness, soil science and animal science.'},
    {name:'BA Music',qual:'BA',type:'Degree',faculty:'Humanities',aps:28,duration:'3 Years',desc:'Music theory, performance, composition and music history.'},
    {name:'BSc Information Science',qual:'BSc',type:'Degree',faculty:'IT',aps:28,duration:'3 Years',desc:'Information management, knowledge systems and libraries.'},
  ],
  UJ:[
    {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science',aps:30,duration:'3 Years',desc:'Programming, data structures, networks and software engineering.'},
    {name:'BEng Industrial Engineering',qual:'BEng',type:'Degree',faculty:'Engineering & Built Env.',aps:34,duration:'4 Years',desc:'Manufacturing systems, operations research and supply chain.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Management',aps:32,duration:'3 Years',desc:'Financial accounting, auditing and taxation.'},
    {name:'BCom General',qual:'BCom',type:'Degree',faculty:'Management',aps:28,duration:'3 Years',desc:'Economics, management, accounting and business law fundamentals.'},
    {name:'BCom Marketing',qual:'BCom',type:'Degree',faculty:'Management',aps:28,duration:'3 Years',desc:'Marketing management, consumer behaviour and brand strategy.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Law',aps:30,duration:'4 Years',desc:'Constitutional, commercial and criminal law.'},
    {name:'BA Journalism & Media Studies',qual:'BA',type:'Degree',faculty:'Humanities',aps:28,duration:'3 Years',desc:'Multimedia journalism, digital media production and writing.'},
    {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:26,duration:'4 Years',desc:'Early childhood development, literacy and numeracy teaching.'},
    {name:'BA Fine Arts',qual:'BA',type:'Degree',faculty:'Art, Design & Architecture',aps:26,duration:'3 Years',desc:'Drawing, painting, sculpture and contemporary art practice.'},
    {name:'BSc Nursing',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:28,duration:'4 Years',desc:'Professional nursing, midwifery and community health.'},
    {name:'BSc Physics',qual:'BSc',type:'Degree',faculty:'Science',aps:30,duration:'3 Years',desc:'Classical mechanics, electromagnetism and quantum physics.'},
    {name:'Diploma in Public Relations',qual:'Diploma',type:'Diploma',faculty:'Humanities',aps:24,duration:'3 Years',desc:'Corporate communication, media relations and event management.'},
  ],
  UKZN:[
    {name:'MBChB — Bachelor of Medicine',qual:'MBChB',type:'Degree',faculty:'Health Sciences',aps:40,duration:'6 Years',desc:'Medical training with community health focus across KZN hospitals.'},
    {name:'BPharm — Bachelor of Pharmacy',qual:'BPharm',type:'Degree',faculty:'Health Sciences',aps:32,duration:'4 Years',desc:'Pharmaceutical sciences and clinical pharmacy practice.'},
    {name:'BSc Physiotherapy',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:34,duration:'4 Years',desc:'Rehabilitation, sports medicine and musculoskeletal therapy.'},
    {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:30,duration:'3 Years',desc:'Programming, algorithms and systems analysis.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Law & Mgmt Studies',aps:30,duration:'3 Years',desc:'Financial accounting, auditing and management accounting.'},
    {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Law & Mgmt Studies',aps:28,duration:'3 Years',desc:'Economic theory, policy analysis and econometrics.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Law & Mgmt Studies',aps:30,duration:'4 Years',desc:'South African law with emphasis on commercial and constitutional law.'},
    {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:26,duration:'4 Years',desc:'Teaching Grades R–3, early childhood development.'},
    {name:'BA Sociology',qual:'BA',type:'Degree',faculty:'Humanities',aps:26,duration:'3 Years',desc:'Social theory, research methods, development and gender studies.'},
    {name:'BSocSci Social Work',qual:'BSocSci',type:'Degree',faculty:'Humanities',aps:26,duration:'4 Years',desc:'Community development, counselling and social welfare practice.'},
    {name:'BSc Agricultural Sciences',qual:'BSc',type:'Degree',faculty:'Agriculture, Engineering & Science',aps:26,duration:'4 Years',desc:'Crop production, livestock, soil science and food security.'},
    {name:'BSc Chemistry',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:30,duration:'3 Years',desc:'Organic, inorganic and physical chemistry.'},
  ],
  RU:[
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Commerce',aps:30,duration:'3 Years',desc:'Accounting, auditing, taxation and financial management.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Law',aps:32,duration:'4 Years',desc:'Highly rated law school with strong moot court programme.'},
    {name:'BA Journalism & Media Studies',qual:'BA',type:'Degree',faculty:'Humanities',aps:30,duration:'3 Years',desc:'Multimedia journalism, documentary production and media ethics.'},
    {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science',aps:30,duration:'3 Years',desc:'Software engineering, networks and computer theory.'},
    {name:'BA Psychology',qual:'BA',type:'Degree',faculty:'Humanities',aps:28,duration:'3 Years',desc:'Research methods, developmental, clinical and organisational psychology.'},
    {name:'BPharm — Bachelor of Pharmacy',qual:'BPharm',type:'Degree',faculty:'Pharmacy',aps:30,duration:'4 Years',desc:'Pharmaceutical sciences, pharmacology and patient care.'},
    {name:'BSc Biochemistry',qual:'BSc',type:'Degree',faculty:'Science',aps:28,duration:'3 Years',desc:'Molecular biology, enzymology and cellular metabolism.'},
    {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Commerce',aps:28,duration:'3 Years',desc:'Micro and macroeconomics, econometrics and policy.'},
    {name:'BEd Teaching',qual:'BEd',type:'Degree',faculty:'Education',aps:26,duration:'4 Years',desc:'Curriculum studies, educational psychology and teaching practice.'},
    {name:'BA Fine Art',qual:'BA',type:'Degree',faculty:'Humanities',aps:26,duration:'3 Years',desc:'Contemporary art practice, drawing, painting and digital art.'},
  ],
  CPUT:[
    {name:'Diploma in Information Technology',qual:'Diploma',type:'Diploma',faculty:'Informatics & Design',aps:20,duration:'3 Years',desc:'Software development, networking, databases and web technologies.'},
    {name:'Diploma in Business Management',qual:'Diploma',type:'Diploma',faculty:'Business & Mgmt Sciences',aps:20,duration:'3 Years',desc:'Entrepreneurship, marketing, HR and financial management.'},
    {name:'Diploma in Graphic Design',qual:'Diploma',type:'Diploma',faculty:'Informatics & Design',aps:20,duration:'3 Years',desc:'Visual communication, typography, branding and digital design.'},
    {name:'BTech Civil Engineering',qual:'BTech',type:'Degree',faculty:'Engineering',aps:22,duration:'1 Year (after Diploma)',desc:'Advanced structural, water and transportation engineering.'},
    {name:'BTech Electrical Engineering',qual:'BTech',type:'Degree',faculty:'Engineering',aps:22,duration:'1 Year (after Diploma)',desc:'Power systems, industrial electronics and control technology.'},
    {name:'BTech Chemical Engineering',qual:'BTech',type:'Degree',faculty:'Engineering',aps:22,duration:'1 Year (after Diploma)',desc:'Process plant design, industrial chemistry and quality control.'},
    {name:'Diploma in Food Technology',qual:'Diploma',type:'Diploma',faculty:'Applied Sciences',aps:22,duration:'3 Years',desc:'Food processing, quality assurance and nutrition science.'},
    {name:'Diploma in Environmental Health',qual:'Diploma',type:'Diploma',faculty:'Health & Wellness Sciences',aps:22,duration:'3 Years',desc:'Environmental health practice, food safety and occupational health.'},
    {name:'Diploma in Nursing',qual:'Diploma',type:'Diploma',faculty:'Health & Wellness Sciences',aps:22,duration:'4 Years',desc:'Professional nursing practice and community health care.'},
    {name:'Diploma in Hospitality Management',qual:'Diploma',type:'Diploma',faculty:'Business & Mgmt Sciences',aps:20,duration:'3 Years',desc:'Hotel operations, food and beverage management, event planning.'},
    {name:'Diploma in Public Relations Management',qual:'Diploma',type:'Diploma',faculty:'Business & Mgmt Sciences',aps:20,duration:'3 Years',desc:'Corporate communication, media relations and stakeholder management.'},
    {name:'Advanced Diploma in Education',qual:'Adv. Diploma',type:'Certificate',faculty:'Education',aps:24,duration:'1 Year',desc:'Professional development for practising teachers.'},
  ],
  DUT:[
    {name:'Diploma in Information Technology',qual:'Diploma',type:'Diploma',faculty:'Accounting & Informatics',aps:18,duration:'3 Years',desc:'Software development, networking, databases and web development.'},
    {name:'Diploma in Accounting',qual:'Diploma',type:'Diploma',faculty:'Accounting & Informatics',aps:18,duration:'3 Years',desc:'Financial accounting, cost accounting and auditing fundamentals.'},
    {name:'Diploma in Civil Engineering',qual:'Diploma',type:'Diploma',faculty:'Engineering & Built Env.',aps:20,duration:'3 Years',desc:'Structural design, surveying, water and construction management.'},
    {name:'Diploma in Mechanical Engineering',qual:'Diploma',type:'Diploma',faculty:'Engineering & Built Env.',aps:20,duration:'3 Years',desc:'Mechanical design, manufacturing processes and maintenance.'},
    {name:'Diploma in Biomedical Technology',qual:'Diploma',type:'Diploma',faculty:'Health Sciences',aps:22,duration:'3 Years',desc:'Medical laboratory technology and clinical diagnostics.'},
    {name:'Diploma in Pharmacy',qual:'Diploma',type:'Diploma',faculty:'Health Sciences',aps:22,duration:'3 Years',desc:'Pharmacy practice, drug preparation and community health.'},
    {name:'Diploma in Fashion Design',qual:'Diploma',type:'Diploma',faculty:'Arts & Design',aps:18,duration:'3 Years',desc:'Garment construction, fashion illustration and textile design.'},
    {name:'Diploma in Public Relations',qual:'Diploma',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Communication strategy, media and corporate relations.'},
    {name:'Diploma in Tourism Management',qual:'Diploma',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Tourism planning, eco-tourism and hospitality operations.'},
    {name:'BTech Operations Management',qual:'BTech',type:'Degree',faculty:'Management Sciences',aps:22,duration:'1 Year (after Diploma)',desc:'Production management, quality control and logistics.'},
  ],
  NMU:[
    {name:'BSc Civil Engineering',qual:'BSc',type:'Degree',faculty:'Engineering & Built Env.',aps:30,duration:'4 Years',desc:'Structural, water, geotechnical and transportation engineering.'},
    {name:'BCom Business Management',qual:'BCom',type:'Degree',faculty:'Business & Economic Sciences',aps:24,duration:'3 Years',desc:'Management, entrepreneurship, marketing and HR.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Business & Economic Sciences',aps:28,duration:'3 Years',desc:'Financial accounting, auditing and taxation.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Law',aps:30,duration:'4 Years',desc:'Constitutional, commercial and criminal law.'},
    {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science',aps:28,duration:'3 Years',desc:'Software development, data structures and networks.'},
    {name:'BA Journalism',qual:'BA',type:'Degree',faculty:'Arts',aps:26,duration:'3 Years',desc:'Print, broadcast and digital journalism.'},
    {name:'BSc Environmental Science',qual:'BSc',type:'Degree',faculty:'Science',aps:26,duration:'3 Years',desc:'Environmental management, ecology and conservation.'},
    {name:'BSocSci Social Work',qual:'BSocSci',type:'Degree',faculty:'Arts',aps:24,duration:'4 Years',desc:'Community development, counselling and welfare services.'},
    {name:'BA Psychology',qual:'BA',type:'Degree',faculty:'Arts',aps:26,duration:'3 Years',desc:'Human behaviour, developmental and social psychology.'},
    {name:'BEd Education',qual:'BEd',type:'Degree',faculty:'Education',aps:26,duration:'4 Years',desc:'Foundation, intermediate and senior phase teaching.'},
    {name:'Diploma in Engineering (Electrical)',qual:'Diploma',type:'Diploma',faculty:'Engineering & Built Env.',aps:22,duration:'3 Years',desc:'Electrical installation, industrial electronics and automation.'},
    {name:'Diploma in IT',qual:'Diploma',type:'Diploma',faculty:'Science',aps:20,duration:'3 Years',desc:'Networking, systems administration and application development.'},
  ],
  UFS:[
    {name:'MBChB — Bachelor of Medicine',qual:'MBChB',type:'Degree',faculty:'Health Sciences',aps:38,duration:'6 Years',desc:'Medical training with clinical placement at Universitas Academic Hospital.'},
    {name:'BSc Pharmacy',qual:'BPharm',type:'Degree',faculty:'Health Sciences',aps:30,duration:'4 Years',desc:'Pharmaceutical sciences, pharmacology and community pharmacy.'},
    {name:'BSc Nutrition & Dietetics',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:28,duration:'4 Years',desc:'Clinical nutrition, dietetic counselling and public health nutrition.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Law',aps:30,duration:'4 Years',desc:'South African law with campuses in Bloemfontein and Qwaqwa.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:28,duration:'3 Years',desc:'Financial accounting, auditing and management reporting.'},
    {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:26,duration:'3 Years',desc:'Economic theory, development economics and quantitative methods.'},
    {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Natural & Agricultural Sciences',aps:28,duration:'3 Years',desc:'Software development, algorithms and database systems.'},
    {name:'BSc Agricultural Sciences',qual:'BSc',type:'Degree',faculty:'Natural & Agricultural Sciences',aps:24,duration:'4 Years',desc:'Plant production, animal science and agricultural economics.'},
    {name:'BA Political Science',qual:'BA',type:'Degree',faculty:'Humanities',aps:26,duration:'3 Years',desc:'Government, public policy and international relations.'},
    {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Humanities',aps:24,duration:'4 Years',desc:'Community development, counselling and social welfare.'},
    {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:24,duration:'4 Years',desc:'Early childhood development and primary school teaching.'},
    {name:'BTh Theology',qual:'BTh',type:'Degree',faculty:'Theology & Religion',aps:22,duration:'3 Years',desc:'Biblical studies, systematic theology and pastoral ministry.'},
  ],
  UNISA:[
    {name:'BCom Accounting (Distance)',qual:'BCom',type:'Degree',faculty:'Accounting Sciences',aps:20,duration:'3 Years',desc:'Financial accounting, auditing and taxation via distance learning.'},
    {name:'BCom Economics (Distance)',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:20,duration:'3 Years',desc:'Economic theory and policy analysis via distance learning.'},
    {name:'BCom Financial Management (Distance)',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:20,duration:'3 Years',desc:'Corporate finance, budgeting and financial planning.'},
    {name:'BCom Human Resource Management (Distance)',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:20,duration:'3 Years',desc:'Labour law, HR strategy, organisational behaviour.'},
    {name:'LLB — Bachelor of Laws (Distance)',qual:'LLB',type:'Degree',faculty:'Law',aps:22,duration:'4 Years',desc:'South African law offered fully via distance learning.'},
    {name:'BA (Distance)',qual:'BA',type:'Degree',faculty:'Human Sciences',aps:18,duration:'3 Years',desc:'Arts and social sciences including language, history and philosophy.'},
    {name:'BA Communication Science (Distance)',qual:'BA',type:'Degree',faculty:'Communication & Human Sciences',aps:20,duration:'3 Years',desc:'Media studies, communication theory and public relations.'},
    {name:'BA Public Administration (Distance)',qual:'BA',type:'Degree',faculty:'Human Sciences',aps:18,duration:'3 Years',desc:'Government administration, public policy and local government.'},
    {name:'BEd Education (Distance)',qual:'BEd',type:'Degree',faculty:'Education',aps:20,duration:'4 Years',desc:'Teacher professional development offered by distance learning.'},
    {name:'BSc Computer Science (Distance)',qual:'BSc',type:'Degree',faculty:'Science, Engineering & Technology',aps:22,duration:'3 Years',desc:'Programming, algorithms and information systems.'},
    {name:'BSc Environmental Science (Distance)',qual:'BSc',type:'Degree',faculty:'Agriculture & Env Sciences',aps:20,duration:'3 Years',desc:'Environmental management and conservation science.'},
    {name:'BSc Agriculture (Distance)',qual:'BSc',type:'Degree',faculty:'Agriculture & Env Sciences',aps:20,duration:'4 Years',desc:'Crop and animal production, agribusiness management.'},
    {name:'BTh Theology (Distance)',qual:'BTh',type:'Degree',faculty:'Theology & Religion',aps:18,duration:'3 Years',desc:'Biblical studies and systematic theology.'},
    {name:'Diploma in Policing (Distance)',qual:'Diploma',type:'Diploma',faculty:'Law',aps:15,duration:'3 Years',desc:'Law enforcement, criminology and community policing.'},
    {name:'Advanced Certificate in Education (Distance)',qual:'ACE',type:'Certificate',faculty:'Education',aps:18,duration:'1 Year',desc:'Professional teacher development and specialisation.'},
  ],
  UWC:[
    {name:'BDS — Bachelor of Dental Surgery',qual:'BDS',type:'Degree',faculty:'Dentistry',aps:32,duration:'5 Years',desc:"Oral health, dental surgery and patient care. One of SA's top dental schools."},
    {name:'BPharm — Bachelor of Pharmacy',qual:'BPharm',type:'Degree',faculty:'Arts',aps:28,duration:'4 Years',desc:'Pharmaceutical sciences, pharmacology and dispensing.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Law',aps:28,duration:'4 Years',desc:'Constitutional, commercial and public interest law.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:26,duration:'3 Years',desc:'Financial accounting, auditing and management accounting.'},
    {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:24,duration:'3 Years',desc:'Economic theory, development economics and policy.'},
    {name:'BSc Natural Sciences',qual:'BSc',type:'Degree',faculty:'Natural Sciences',aps:24,duration:'3 Years',desc:'Chemistry, physics, biology and mathematics.'},
    {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Natural Sciences',aps:26,duration:'3 Years',desc:'Programming, data structures and software engineering.'},
    {name:'BNurs Nursing',qual:'BNurs',type:'Degree',faculty:'Community & Health Sciences',aps:26,duration:'4 Years',desc:'Professional nursing, midwifery and community health.'},
    {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Community & Health Sciences',aps:24,duration:'4 Years',desc:'Community development, counselling and social services.'},
    {name:'BA History',qual:'BA',type:'Degree',faculty:'Arts',aps:22,duration:'3 Years',desc:'South African, African and world history.'},
  ],
  UFH:[
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Law',aps:22,duration:'4 Years',desc:'Constitutional, commercial and customary law.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Management & Commerce',aps:20,duration:'3 Years',desc:'Financial accounting and management accounting.'},
    {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Management & Commerce',aps:20,duration:'3 Years',desc:'Economic theory and policy analysis.'},
    {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Social Sciences & Humanities',aps:20,duration:'4 Years',desc:'Community development, social welfare and counselling.'},
    {name:'BA Computer Science',qual:'BA',type:'Degree',faculty:'Social Sciences & Humanities',aps:20,duration:'3 Years',desc:'Software development, databases and information systems.'},
    {name:'BSc Human Biology',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:22,duration:'3 Years',desc:'Human anatomy, physiology and pre-health sciences.'},
    {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Agriculture',aps:20,duration:'4 Years',desc:'Crop production, livestock and soil science.'},
    {name:'BEd Education',qual:'BEd',type:'Degree',faculty:'Education',aps:20,duration:'4 Years',desc:'Foundation, intermediate and senior phase teaching.'},
    {name:'BA Political Science',qual:'BA',type:'Degree',faculty:'Social Sciences & Humanities',aps:22,duration:'3 Years',desc:'Government, public policy and political theory.'},
    {name:'BTh Theology',qual:'BTh',type:'Degree',faculty:'Social Sciences & Humanities',aps:20,duration:'3 Years',desc:'Biblical studies and church ministry.'},
  ],
  WSU:[
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Business, Mgmt Sciences & Law',aps:20,duration:'3 Years',desc:'Financial accounting, auditing and taxation.'},
    {name:'BCom Business Management',qual:'BCom',type:'Degree',faculty:'Business, Mgmt Sciences & Law',aps:20,duration:'3 Years',desc:'Management, entrepreneurship and business strategy.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Business, Mgmt Sciences & Law',aps:22,duration:'4 Years',desc:'Constitutional, commercial and customary law.'},
    {name:'BSc Nursing',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:22,duration:'4 Years',desc:'Professional nursing, midwifery and community health.'},
    {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Health Sciences',aps:20,duration:'4 Years',desc:'Community development, counselling and social welfare.'},
    {name:'BA Communication',qual:'BA',type:'Degree',faculty:'Health Sciences',aps:20,duration:'3 Years',desc:'Media studies, corporate communication and journalism.'},
    {name:'BEd Education',qual:'BEd',type:'Degree',faculty:'Education',aps:20,duration:'4 Years',desc:'Primary and secondary school teacher education.'},
    {name:'BSc Natural Sciences',qual:'BSc',type:'Degree',faculty:'Natural Sciences, Engineering & Technology',aps:20,duration:'3 Years',desc:'Chemistry, biology, physics and mathematics.'},
    {name:'Diploma in Engineering',qual:'Diploma',type:'Diploma',faculty:'Natural Sciences, Engineering & Technology',aps:18,duration:'3 Years',desc:'Civil or electrical engineering technology.'},
    {name:'Diploma in IT',qual:'Diploma',type:'Diploma',faculty:'Natural Sciences, Engineering & Technology',aps:18,duration:'3 Years',desc:'Networking, systems administration and application development.'},
  ],
  NWU:[
    {name:'BEng Chemical Engineering',qual:'BEng',type:'Degree',faculty:'Engineering',aps:30,duration:'4 Years',desc:'Process design, industrial chemistry and quality control.'},
    {name:'BSc Pharmacy',qual:'BPharm',type:'Degree',faculty:'Health Sciences',aps:30,duration:'4 Years',desc:'Pharmaceutical sciences, drug dispensing and community pharmacy.'},
    {name:'BNurs Nursing',qual:'BNurs',type:'Degree',faculty:'Health Sciences',aps:26,duration:'4 Years',desc:'Professional nursing and midwifery.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Commerce & Law',aps:26,duration:'3 Years',desc:'Financial accounting, auditing and taxation.'},
    {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Commerce & Law',aps:26,duration:'3 Years',desc:'Economic theory, development and policy analysis.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Commerce & Law',aps:28,duration:'4 Years',desc:'South African private, public and commercial law.'},
    {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Natural Sciences',aps:26,duration:'3 Years',desc:'Programming, data science and software engineering.'},
    {name:'BSc Mathematics',qual:'BSc',type:'Degree',faculty:'Natural Sciences',aps:26,duration:'3 Years',desc:'Pure and applied mathematics, statistics and operations research.'},
    {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:24,duration:'4 Years',desc:'Early childhood development and foundation phase teaching.'},
    {name:'BA (Humanities)',qual:'BA',type:'Degree',faculty:'Humanities',aps:22,duration:'3 Years',desc:'Languages, history, philosophy and social sciences.'},
    {name:'BTh Theology',qual:'BTh',type:'Degree',faculty:'Theology',aps:22,duration:'3 Years',desc:'Biblical studies, systematic theology and ministry.'},
    {name:'BSocSci Social Work',qual:'BSocSci',type:'Degree',faculty:'Humanities',aps:22,duration:'4 Years',desc:'Community development, counselling and social services.'},
  ],
  UniZ:[
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Commerce, Administration & Law',aps:22,duration:'4 Years',desc:'Constitutional, commercial and customary law.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Commerce, Administration & Law',aps:20,duration:'3 Years',desc:'Financial accounting and management accounting.'},
    {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Arts',aps:20,duration:'4 Years',desc:'Community development, counselling and social welfare.'},
    {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:20,duration:'4 Years',desc:'Crop production, animal science and soil science.'},
    {name:'BSc Natural Sciences',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:20,duration:'3 Years',desc:'Biology, chemistry, physics and mathematics.'},
    {name:'BEd Education',qual:'BEd',type:'Degree',faculty:'Education',aps:20,duration:'4 Years',desc:'Foundation, intermediate and senior phase teacher training.'},
    {name:'BTh Theology',qual:'BTh',type:'Degree',faculty:'Arts',aps:18,duration:'3 Years',desc:'Biblical studies and church ministry.'},
    {name:'BA Communication',qual:'BA',type:'Degree',faculty:'Arts',aps:18,duration:'3 Years',desc:'Media studies, journalism and communication theory.'},
  ],
  UNIVEN:[
    {name:'BSc Environmental Science',qual:'BSc',type:'Degree',faculty:'Science, Engineering & Technology',aps:20,duration:'3 Years',desc:'Environmental management, conservation and ecology.'},
    {name:'BSc Human Biology',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:22,duration:'3 Years',desc:'Human anatomy, physiology and pre-clinical sciences.'},
    {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Agriculture',aps:20,duration:'4 Years',desc:'Crop science, livestock and agricultural management.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Law',aps:22,duration:'4 Years',desc:'Constitutional, customary and environmental law.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Human Sciences',aps:20,duration:'3 Years',desc:'Financial accounting and management accounting.'},
    {name:'BSocSci Social Work',qual:'BSocSci',type:'Degree',faculty:'Human Sciences',aps:20,duration:'4 Years',desc:'Community development and social welfare.'},
    {name:'BEd Education',qual:'BEd',type:'Degree',faculty:'Education',aps:20,duration:'4 Years',desc:'Primary and secondary school teacher training.'},
    {name:'BA (Humanities)',qual:'BA',type:'Degree',faculty:'Human Sciences',aps:18,duration:'3 Years',desc:'Languages, communication and social sciences.'},
  ],
  UL:[
    {name:'BSc Nursing',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:22,duration:'4 Years',desc:'Professional nursing, midwifery and community health nursing.'},
    {name:'LLB — Bachelor of Laws',qual:'LLB',type:'Degree',faculty:'Management & Law',aps:22,duration:'4 Years',desc:'Constitutional, commercial and customary law.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Management & Law',aps:22,duration:'3 Years',desc:'Financial accounting, auditing and taxation.'},
    {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Management & Law',aps:20,duration:'3 Years',desc:'Economic theory, development and policy.'},
    {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:20,duration:'4 Years',desc:'Crop production, livestock and soil science.'},
    {name:'BSocSci Social Work',qual:'BSocSci',type:'Degree',faculty:'Humanities',aps:20,duration:'4 Years',desc:'Community development and social welfare services.'},
    {name:'BA (Humanities)',qual:'BA',type:'Degree',faculty:'Humanities',aps:18,duration:'3 Years',desc:'Languages, history and social sciences.'},
    {name:'BEd Education',qual:'BEd',type:'Degree',faculty:'Management & Law',aps:20,duration:'4 Years',desc:'Foundation and intermediate phase teacher education.'},
  ],
  SMU:[
    {name:'MBChB — Bachelor of Medicine & Surgery',qual:'MBChB',type:'Degree',faculty:'Health Sciences',aps:44,duration:'6 Years',desc:'Medical training at the Dr George Mukhari Academic Hospital.'},
    {name:'BChD — Bachelor of Dental Surgery',qual:'BChD',type:'Degree',faculty:'Dentistry',aps:44,duration:'5 Years',desc:'Oral health, dental surgery and patient management.'},
    {name:'BPharm — Bachelor of Pharmacy',qual:'BPharm',type:'Degree',faculty:'Pharmacy',aps:36,duration:'4 Years',desc:'Pharmaceutical sciences, drug dispensing and clinical pharmacy.'},
    {name:'BSc Physiotherapy',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:34,duration:'4 Years',desc:'Rehabilitation, sports and neurological physiotherapy.'},
    {name:'BSc Occupational Therapy',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:34,duration:'4 Years',desc:'Rehabilitation for physical, mental and social health conditions.'},
    {name:'BSc Radiography',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:32,duration:'4 Years',desc:'Diagnostic imaging, radiation therapy and nuclear medicine.'},
    {name:'BSc Nursing',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:30,duration:'4 Years',desc:'Professional nursing, midwifery and community health.'},
    {name:'BSc Clinical Associate',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:30,duration:'3 Years',desc:'Mid-level clinical practice and primary health care delivery.'},
  ],
  TUT:[
    {name:'Diploma in Information Technology',qual:'Diploma',type:'Diploma',faculty:'IT',aps:20,duration:'3 Years',desc:'Software development, networking and database management.'},
    {name:'Diploma in Civil Engineering',qual:'Diploma',type:'Diploma',faculty:'Engineering & Built Env.',aps:20,duration:'3 Years',desc:'Structural, water and construction engineering.'},
    {name:'Diploma in Electrical Engineering',qual:'Diploma',type:'Diploma',faculty:'Engineering & Built Env.',aps:20,duration:'3 Years',desc:'Electrical installation, power systems and industrial electronics.'},
    {name:'BTech Metallurgical Engineering',qual:'BTech',type:'Degree',faculty:'Engineering & Built Env.',aps:22,duration:'1 Year (after Diploma)',desc:'Materials science, metals processing and quality control.'},
    {name:'Diploma in Agriculture Management',qual:'Diploma',type:'Diploma',faculty:'Science',aps:18,duration:'3 Years',desc:'Farm management, crop production and agribusiness.'},
    {name:'Diploma in Environmental Health',qual:'Diploma',type:'Diploma',faculty:'Science',aps:22,duration:'3 Years',desc:'Environmental health practice, food safety and occupational health.'},
    {name:'Diploma in Accounting',qual:'Diploma',type:'Diploma',faculty:'Economics & Finance',aps:20,duration:'3 Years',desc:'Financial accounting, cost accounting and auditing.'},
    {name:'Diploma in Public Management',qual:'Diploma',type:'Diploma',faculty:'Humanities',aps:18,duration:'3 Years',desc:'Local government, public administration and policy.'},
    {name:'Diploma in Hospitality Management',qual:'Diploma',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Hotel operations, food and beverage management.'},
    {name:'Diploma in Interior Design',qual:'Diploma',type:'Diploma',faculty:'Arts & Design',aps:20,duration:'3 Years',desc:'Interior spatial design, materials and project management.'},
    {name:'BTech Marketing',qual:'BTech',type:'Degree',faculty:'Management Sciences',aps:22,duration:'1 Year (after Diploma)',desc:'Marketing strategy, digital marketing and brand management.'},
    {name:'Diploma in Fashion Design',qual:'Diploma',type:'Diploma',faculty:'Arts & Design',aps:18,duration:'3 Years',desc:'Garment construction, fashion illustration and textile design.'},
  ],
  VUT:[
    {name:'Diploma in Mechanical Engineering',qual:'Diploma',type:'Diploma',faculty:'Engineering & Technology',aps:18,duration:'3 Years',desc:'Machine design, manufacturing processes and maintenance.'},
    {name:'Diploma in Chemical Engineering',qual:'Diploma',type:'Diploma',faculty:'Engineering & Technology',aps:20,duration:'3 Years',desc:'Process plant design, industrial chemistry and quality.'},
    {name:'BTech Industrial Engineering',qual:'BTech',type:'Degree',faculty:'Engineering & Technology',aps:22,duration:'1 Year (after Diploma)',desc:'Production management, operations research and systems.'},
    {name:'BTech Computer Systems',qual:'BTech',type:'Degree',faculty:'Applied & Computer Sciences',aps:22,duration:'1 Year (after Diploma)',desc:'Advanced programming, systems design and networks.'},
    {name:'Diploma in IT',qual:'Diploma',type:'Diploma',faculty:'Applied & Computer Sciences',aps:18,duration:'3 Years',desc:'Software development, networking and database systems.'},
    {name:'Diploma in Accounting',qual:'Diploma',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Financial and management accounting fundamentals.'},
    {name:'Diploma in Public Management',qual:'Diploma',type:'Diploma',faculty:'Humanities',aps:18,duration:'3 Years',desc:'Public administration, governance and local government.'},
    {name:'Diploma in Hospitality & Tourism',qual:'Diploma',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Hotel management, tourism operations and event planning.'},
  ],
  MUT:[
    {name:'Diploma in Chemical Engineering',qual:'Diploma',type:'Diploma',faculty:'Engineering',aps:20,duration:'3 Years',desc:'Process design, industrial chemistry and quality assurance.'},
    {name:'Diploma in Mechanical Engineering',qual:'Diploma',type:'Diploma',faculty:'Engineering',aps:18,duration:'3 Years',desc:'Machine design, manufacturing and maintenance.'},
    {name:'BTech Process Engineering',qual:'BTech',type:'Degree',faculty:'Engineering',aps:22,duration:'1 Year (after Diploma)',desc:'Advanced process design and industrial plant engineering.'},
    {name:'Diploma in Nature Conservation',qual:'Diploma',type:'Diploma',faculty:'Natural Sciences',aps:18,duration:'3 Years',desc:'Wildlife management, conservation ecology and ecotourism.'},
    {name:'Diploma in Aquaculture',qual:'Diploma',type:'Diploma',faculty:'Natural Sciences',aps:18,duration:'3 Years',desc:'Fish farming, marine biology and aquatic resource management.'},
    {name:'Diploma in Environmental Health',qual:'Diploma',type:'Diploma',faculty:'Natural Sciences',aps:20,duration:'3 Years',desc:'Environmental health practice and food safety management.'},
    {name:'Diploma in IT',qual:'Diploma',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Software development, networks and database management.'},
    {name:'Diploma in Public Management',qual:'Diploma',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Public administration, local government and governance.'},
  ],
  SPU:[
    {name:'BCom Business Administration',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:24,duration:'3 Years',desc:'Management, entrepreneurship, marketing and finance.'},
    {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:24,duration:'3 Years',desc:'Financial accounting, auditing and taxation.'},
    {name:'BA Education (Foundation Phase)',qual:'BA',type:'Degree',faculty:'Education',aps:22,duration:'4 Years',desc:'Early childhood development and primary school teaching.'},
    {name:'BA Curriculum Studies',qual:'BA',type:'Degree',faculty:'Education',aps:24,duration:'4 Years',desc:'Curriculum design, educational psychology and teaching practice.'},
    {name:'BSc Natural Sciences',qual:'BSc',type:'Degree',faculty:'Natural & Applied Sciences',aps:22,duration:'3 Years',desc:'Chemistry, biology, physics and environmental science.'},
    {name:'BSc Environmental Science',qual:'BSc',type:'Degree',faculty:'Natural & Applied Sciences',aps:24,duration:'3 Years',desc:'Environmental management, conservation and ecology.'},
    {name:'BA Languages',qual:'BA',type:'Degree',faculty:'Humanities',aps:22,duration:'3 Years',desc:'English, indigenous languages and communication studies.'},
    {name:'BA Humanities',qual:'BA',type:'Degree',faculty:'Humanities',aps:22,duration:'3 Years',desc:'History, philosophy, social sciences and cultural studies.'},
  ],
  UMP:[
    {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Agriculture & Natural Sciences',aps:22,duration:'4 Years',desc:'Crop production, livestock management and agribusiness.'},
    {name:'BSc Environmental Science',qual:'BSc',type:'Degree',faculty:'Agriculture & Natural Sciences',aps:24,duration:'3 Years',desc:'Environmental management, conservation and sustainability.'},
    {name:'BSc Natural Sciences',qual:'BSc',type:'Degree',faculty:'Agriculture & Natural Sciences',aps:22,duration:'3 Years',desc:'Biology, chemistry, ecology and environmental systems.'},
    {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:22,duration:'4 Years',desc:'Early childhood development and Grade R–3 teaching.'},
    {name:'BEd Intermediate Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:22,duration:'4 Years',desc:'Grades 4–7 curriculum design and teaching practice.'},
    {name:'BCom Hospitality Management',qual:'BCom',type:'Degree',faculty:'Hospitality & Tourism',aps:22,duration:'3 Years',desc:'Hotel operations, food service management and events.'},
    {name:'Diploma in Tourism',qual:'Diploma',type:'Diploma',faculty:'Hospitality & Tourism',aps:20,duration:'3 Years',desc:'Tourism planning, eco-tourism and cultural heritage.'},
    {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Agriculture & Natural Sciences',aps:22,duration:'3 Years',desc:'Economic theory, policy and development economics.'},
  ],
  CUT:[
    {name:'Diploma in Civil Engineering',qual:'Diploma',type:'Diploma',faculty:'Engineering & IT',aps:20,duration:'3 Years',desc:'Structural, water and construction engineering technology.'},
    {name:'Diploma in Electrical Engineering',qual:'Diploma',type:'Diploma',faculty:'Engineering & IT',aps:20,duration:'3 Years',desc:'Electrical installation, power systems and automation.'},
    {name:'BTech Electrical Engineering',qual:'BTech',type:'Degree',faculty:'Engineering & IT',aps:22,duration:'1 Year (after Diploma)',desc:'Advanced power systems and industrial automation.'},
    {name:'Diploma in IT',qual:'Diploma',type:'Diploma',faculty:'Engineering & IT',aps:18,duration:'3 Years',desc:'Software development, networking and systems administration.'},
    {name:'Diploma in Environmental Health',qual:'Diploma',type:'Diploma',faculty:'Health & Environmental Sciences',aps:20,duration:'3 Years',desc:'Environmental health, food safety and occupational health.'},
    {name:'Diploma in Nursing',qual:'Diploma',type:'Diploma',faculty:'Health & Environmental Sciences',aps:22,duration:'4 Years',desc:'Professional nursing and community health care.'},
    {name:'BTech Food Technology',qual:'BTech',type:'Degree',faculty:'Health & Environmental Sciences',aps:20,duration:'1 Year (after Diploma)',desc:'Advanced food processing and quality management.'},
    {name:'Diploma in Accounting',qual:'Diploma',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Financial and management accounting fundamentals.'},
    {name:'BTech Operations Management',qual:'BTech',type:'Degree',faculty:'Management Sciences',aps:22,duration:'1 Year (after Diploma)',desc:'Production management, quality control and supply chain.'},
    {name:'Diploma in Public Administration',qual:'Diploma',type:'Diploma',faculty:'Humanities',aps:18,duration:'3 Years',desc:'Public administration, governance and local government.'},
  ],
};

// ─── INSTITUTIONAL BURSARIES & SCHOLARSHIPS ──────────────────────────────────
const ADDITIONAL_FUNDING = {
  UCT: [
    { name:"UCT Academic Excellence Scholarship", type:"merit",  value:"Full tuition + R50,000 stipend/yr", criteria:"Matric aggregate 90%+ or APS 44+; South African citizens",            url:"https://www.uct.ac.za/apply/fees-funding/scholarships" },
    { name:"UCT Vice-Chancellor's Scholarship",   type:"merit",  value:"Full tuition + accommodation",      criteria:"Exceptional academic and leadership record; top 0.1% matric cohort",  url:"https://www.uct.ac.za/apply/fees-funding/scholarships" },
    { name:"UCT Sports Excellence Award",         type:"sports", value:"Up to 50% tuition reduction",       criteria:"National or provincial colours; must maintain academic standing",        url:"https://www.uct.ac.za/apply/fees-funding/scholarships" },
    { name:"UCT Equity Scholarship",              type:"need-based", value:"Partial tuition support",       criteria:"Historically disadvantaged South African students with financial need",  url:"https://www.uct.ac.za/apply/fees-funding/scholarships" },
  ],
  WITS: [
    { name:"Wits Chancellor's Scholarship",      type:"merit",  value:"Full tuition + R48,000 stipend/yr",  criteria:"90%+ matric average; APS 44+; South African citizens",                url:"https://www.wits.ac.za/fees-and-funding/bursaries/" },
    { name:"Wits Academic Merit Award",          type:"merit",  value:"25%–100% tuition reduction",         criteria:"APS 40+ and subject-specific requirements per faculty",               url:"https://www.wits.ac.za/fees-and-funding/bursaries/" },
    { name:"Wits Sports Scholarship",            type:"sports", value:"Up to 50% tuition support",          criteria:"National / provincial representation; maintained academic pass rate",  url:"https://www.wits.ac.za/fees-and-funding/bursaries/" },
    { name:"Wits Equity Advancement Bursary",   type:"need-based", value:"Partial fees and living costs",  criteria:"Historically disadvantaged South Africans; household income < R350,000", url:"https://www.wits.ac.za/fees-and-funding/bursaries/" },
  ],
  SU: [
    { name:"SU Rector's Award",           type:"merit",  value:"Full tuition + accommodation",       criteria:"Exceptional matric (90%+); subject requirements per faculty",              url:"https://www.sun.ac.za/english/student-affairs/Pages/Bursaries.aspx" },
    { name:"SU Merit Bursary",            type:"merit",  value:"25%–75% tuition reduction",          criteria:"APS 38+; strong academic record in relevant subjects",                    url:"https://www.sun.ac.za/english/student-affairs/Pages/Bursaries.aspx" },
    { name:"SU Sport Bursary",            type:"sports", value:"Up to 40% tuition reduction",        criteria:"National colours or Maties team representative",                          url:"https://www.sun.ac.za/english/student-affairs/Pages/Bursaries.aspx" },
    { name:"SU Equity Bursary",           type:"need-based", value:"Partial tuition and living costs", criteria:"Black African, Coloured or Indian students with financial need",         url:"https://www.sun.ac.za/english/student-affairs/Pages/Bursaries.aspx" },
  ],
  UP: [
    { name:"UP Top Achiever Bursary",     type:"merit",  value:"Full tuition for first year",        criteria:"Top 5 learners per province in matric NSC",                               url:"https://www.up.ac.za/bursaries" },
    { name:"UP Vice-Chancellor's Bursary",type:"merit",  value:"Full tuition + R36,000 stipend/yr", criteria:"APS 40+ and 90%+ aggregate; exceptional leadership record",               url:"https://www.up.ac.za/bursaries" },
    { name:"UP Merit Bursary",            type:"merit",  value:"25%–50% tuition reduction",          criteria:"APS 34+ and strong subject performance in relevant field",               url:"https://www.up.ac.za/bursaries" },
    { name:"UP Sport Bursary",            type:"sports", value:"Up to 50% tuition support",          criteria:"National or Tuks varsity sport representation",                           url:"https://www.up.ac.za/bursaries" },
    { name:"UP Disability Bursary",       type:"need-based", value:"Full tuition support",           criteria:"Students with documented disabilities; financial need assessment",         url:"https://www.up.ac.za/bursaries" },
  ],
  UJ: [
    { name:"UJ Vice-Chancellor's Award",  type:"merit",  value:"Full tuition + R30,000 stipend",    criteria:"Top matric results (90%+); all provinces considered",                     url:"https://www.uj.ac.za/financial-aid/" },
    { name:"UJ Academic Merit Bursary",   type:"merit",  value:"25%–100% tuition reduction",        criteria:"APS 34+; subject-specific requirements by faculty",                       url:"https://www.uj.ac.za/financial-aid/" },
    { name:"UJ Sport Bursary",            type:"sports", value:"Up to 40% tuition reduction",       criteria:"National, provincial or UJ varsity sport team representation",             url:"https://www.uj.ac.za/financial-aid/" },
    { name:"UJ Equity Bursary",           type:"need-based", value:"Partial tuition and accommodation", criteria:"Students from designated groups with proven financial need",          url:"https://www.uj.ac.za/financial-aid/" },
  ],
  UKZN: [
    { name:"UKZN Vice-Chancellor's Award",type:"merit",  value:"Full tuition + R24,000 allowance",  criteria:"Top matric results; strong academic and leadership profile",              url:"https://www.ukzn.ac.za/bursaries-scholarships/" },
    { name:"UKZN Academic Merit Award",   type:"merit",  value:"25%–50% tuition reduction",         criteria:"APS 32+; demonstrated academic excellence per faculty",                   url:"https://www.ukzn.ac.za/bursaries-scholarships/" },
    { name:"UKZN Sport Bursary",          type:"sports", value:"Partial tuition support",            criteria:"Provincial or national representative in recognised sports code",         url:"https://www.ukzn.ac.za/bursaries-scholarships/" },
    { name:"UKZN Foundation Bursary",     type:"need-based", value:"Partial tuition and meals",     criteria:"Disadvantaged students with financial need; South African citizens",       url:"https://www.ukzn.ac.za/bursaries-scholarships/" },
  ],
  RU: [
    { name:"Rhodes Trust Scholarship",    type:"merit",  value:"Full tuition + accommodation + stipend", criteria:"Top matric achievers nationally; strong community engagement record", url:"https://www.ru.ac.za/admissions/financialassistance/" },
    { name:"Rhodes Vice-Chancellor's Award",type:"merit",value:"Full tuition + R20,000 allowance",  criteria:"90%+ matric; subject excellence and leadership activities",               url:"https://www.ru.ac.za/admissions/financialassistance/" },
    { name:"Rhodes Merit Bursary",        type:"merit",  value:"25%–75% tuition reduction",         criteria:"APS 32+; all faculties considered",                                       url:"https://www.ru.ac.za/admissions/financialassistance/" },
    { name:"Rhodes Sport Bursary",        type:"sports", value:"Partial tuition support",            criteria:"National or provincial representative athlete",                           url:"https://www.ru.ac.za/admissions/financialassistance/" },
  ],
  CPUT: [
    { name:"CPUT Academic Merit Award",   type:"merit",  value:"25%–50% tuition reduction",         criteria:"Top matric results (80%+); APS 26+",                                      url:"https://www.cput.ac.za/financial-aid/bursaries" },
    { name:"CPUT Sport Bursary",          type:"sports", value:"Partial tuition support",            criteria:"Provincial or national sport representation",                             url:"https://www.cput.ac.za/financial-aid/bursaries" },
    { name:"CPUT Equity Bursary",         type:"need-based", value:"Partial tuition and books",     criteria:"Historically disadvantaged students; financial need; South African citizens", url:"https://www.cput.ac.za/financial-aid/bursaries" },
  ],
  DUT: [
    { name:"DUT Vice-Chancellor's Award", type:"merit",  value:"Full tuition for first year",       criteria:"Top 5 matric achievers per province; APS 28+",                            url:"https://www.dut.ac.za/admissions/financial-aid/" },
    { name:"DUT Merit Bursary",           type:"merit",  value:"25%–50% tuition reduction",         criteria:"APS 26+; strong subject results in chosen field",                         url:"https://www.dut.ac.za/admissions/financial-aid/" },
    { name:"DUT Sport Bursary",           type:"sports", value:"Partial tuition support",            criteria:"National or provincial sport colours",                                    url:"https://www.dut.ac.za/admissions/financial-aid/" },
  ],
  NMU: [
    { name:"NMU Vice-Chancellor's Award", type:"merit",  value:"Full tuition + R24,000 stipend",    criteria:"Top matric results (85%+); APS 38+; leadership record",                  url:"https://www.mandela.ac.za/Study-at-Mandela/Financial-Aid" },
    { name:"NMU Merit Bursary",           type:"merit",  value:"25%–75% tuition reduction",         criteria:"APS 30+ and relevant subject performance",                               url:"https://www.mandela.ac.za/Study-at-Mandela/Financial-Aid" },
    { name:"NMU Sport Bursary",           type:"sports", value:"Partial tuition support",            criteria:"National or provincial sport representation",                             url:"https://www.mandela.ac.za/Study-at-Mandela/Financial-Aid" },
    { name:"NMU Equity Scholarship",      type:"need-based", value:"Partial tuition and accommodation", criteria:"Designated group students with financial need",                      url:"https://www.mandela.ac.za/Study-at-Mandela/Financial-Aid" },
  ],
  UFS: [
    { name:"UFS Chancellor's Scholarship",type:"merit",  value:"Full tuition + R30,000 stipend/yr", criteria:"Top matric achievers; APS 40+; all provinces",                           url:"https://www.ufs.ac.za/apply/funding/bursaries" },
    { name:"UFS Rector's Academic Award", type:"merit",  value:"50%–100% tuition reduction",        criteria:"APS 36+; 85%+ matric aggregate",                                         url:"https://www.ufs.ac.za/apply/funding/bursaries" },
    { name:"UFS Sport Bursary",           type:"sports", value:"Up to 40% tuition reduction",       criteria:"National colours; Kovsies varsity sport team member",                     url:"https://www.ufs.ac.za/apply/funding/bursaries" },
    { name:"UFS Language Bursary",        type:"faculty",value:"Partial tuition support",            criteria:"Students studying Sesotho, Afrikaans or isiZulu as major subject",        url:"https://www.ufs.ac.za/apply/funding/bursaries" },
  ],
  UNISA: [
    { name:"UNISA Merit Bursary",         type:"merit",  value:"Partial module fee reduction",       criteria:"60%+ average in first year; continuing students only",                    url:"https://www.unisa.ac.za/sites/corporate/default/Financial-Aid" },
    { name:"UNISA Disability Bursary",    type:"need-based", value:"Full module fees",               criteria:"Students with documented disabilities; any study level",                   url:"https://www.unisa.ac.za/sites/corporate/default/Financial-Aid" },
    { name:"UNISA Staff Bursary",         type:"need-based", value:"Full tuition support",           criteria:"UNISA employees and direct dependants",                                   url:"https://www.unisa.ac.za/sites/corporate/default/Financial-Aid" },
  ],
  UWC: [
    { name:"UWC Chancellor's Award",      type:"merit",  value:"Full tuition + accommodation",       criteria:"Top matric results (85%+); APS 36+; all provinces",                      url:"https://www.uwc.ac.za/financial-aid" },
    { name:"UWC Merit Bursary",           type:"merit",  value:"25%–75% tuition reduction",          criteria:"APS 30+; strong performance in relevant subjects",                       url:"https://www.uwc.ac.za/financial-aid" },
    { name:"UWC Sport Bursary",           type:"sports", value:"Partial tuition support",             criteria:"Western Province or national sport representative",                       url:"https://www.uwc.ac.za/financial-aid" },
    { name:"UWC Equity Bursary",          type:"need-based", value:"Partial tuition and books",      criteria:"Black, Coloured or Indian students; financial need assessment required",   url:"https://www.uwc.ac.za/financial-aid" },
  ],
  UFH: [
    { name:"UFH Vice-Chancellor's Award", type:"merit",  value:"Full tuition for first year",        criteria:"Top matric results; APS 30+; Eastern Cape preferred",                    url:"https://www.ufh.ac.za/financial-aid" },
    { name:"UFH Merit Bursary",           type:"merit",  value:"25%–50% tuition reduction",          criteria:"APS 26+; demonstrated academic excellence",                              url:"https://www.ufh.ac.za/financial-aid" },
    { name:"UFH Rural Development Bursary",type:"need-based",value:"Partial tuition and accommodation", criteria:"Students from rural Eastern Cape communities",                       url:"https://www.ufh.ac.za/financial-aid" },
  ],
  WSU: [
    { name:"WSU Vice-Chancellor's Award", type:"merit",  value:"Full tuition for first year",        criteria:"Top matric results; APS 28+; Walter Sisulu service ethos",               url:"https://www.wsu.ac.za/admissions/financial-aid" },
    { name:"WSU Merit Bursary",           type:"merit",  value:"Partial tuition reduction",          criteria:"APS 24+; strong subject performance in chosen field",                    url:"https://www.wsu.ac.za/admissions/financial-aid" },
    { name:"WSU Rural Community Bursary", type:"need-based", value:"Partial tuition and accommodation", criteria:"Students from rural Eastern Cape; financial need",                   url:"https://www.wsu.ac.za/admissions/financial-aid" },
  ],
  NWU: [
    { name:"NWU Chancellor's Medal",      type:"merit",  value:"Full tuition + R24,000 allowance",  criteria:"Top matric achievers; APS 36+; any of the three campuses",               url:"https://www.nwu.ac.za/bursaries" },
    { name:"NWU Merit Bursary",           type:"merit",  value:"25%–75% tuition reduction",         criteria:"APS 30+; relevant subject performance per faculty",                       url:"https://www.nwu.ac.za/bursaries" },
    { name:"NWU Sport Bursary",           type:"sports", value:"Up to 40% tuition reduction",       criteria:"National or provincial sport representation; Pukke/Eagles team member",   url:"https://www.nwu.ac.za/bursaries" },
    { name:"NWU Language Bursary",        type:"faculty",value:"Partial tuition support",            criteria:"Students studying Setswana, Afrikaans or isiZulu as main language",       url:"https://www.nwu.ac.za/bursaries" },
  ],
  UniZ: [
    { name:"UniZ Vice-Chancellor's Award",type:"merit",  value:"Full tuition for first year",        criteria:"Top matric results; APS 26+; KwaZulu-Natal focus",                       url:"https://www.unizulu.ac.za/financial-aid" },
    { name:"UniZ Merit Bursary",          type:"merit",  value:"Partial tuition reduction",          criteria:"APS 22+; maintained academic performance",                               url:"https://www.unizulu.ac.za/financial-aid" },
    { name:"UniZ Sport Bursary",          type:"sports", value:"Partial tuition support",            criteria:"Provincial or national sport representation",                             url:"https://www.unizulu.ac.za/financial-aid" },
    { name:"UniZ Community Bursary",      type:"need-based", value:"Partial tuition and books",     criteria:"Students from KZN rural communities; financial need",                     url:"https://www.unizulu.ac.za/financial-aid" },
  ],
  UNIVEN: [
    { name:"UNIVEN Vice-Chancellor's Award",type:"merit",value:"Full tuition for first year",        criteria:"Top matric results; APS 26+; Limpopo province preference",               url:"https://www.univen.ac.za/financial-aid" },
    { name:"UNIVEN Merit Bursary",        type:"merit",  value:"Partial tuition reduction",          criteria:"APS 22+; strong subject performance in chosen programme",                url:"https://www.univen.ac.za/financial-aid" },
    { name:"UNIVEN Rural Health Bursary", type:"faculty",value:"Partial tuition and accommodation",  criteria:"Students in Health Sciences committed to rural community service",        url:"https://www.univen.ac.za/financial-aid" },
  ],
  UL: [
    { name:"UL Vice-Chancellor's Award",  type:"merit",  value:"Full tuition for first year",        criteria:"Top matric results; APS 26+; Limpopo students preferred",                url:"https://www.ul.ac.za/financial-aid" },
    { name:"UL Merit Bursary",            type:"merit",  value:"Partial tuition reduction",          criteria:"APS 22+; consistent academic performance",                               url:"https://www.ul.ac.za/financial-aid" },
    { name:"UL Turfloop Heritage Bursary",type:"need-based", value:"Partial tuition and accommodation", criteria:"Students from historically disadvantaged communities in Limpopo",    url:"https://www.ul.ac.za/financial-aid" },
  ],
  SMU: [
    { name:"SMU Academic Excellence Award",type:"merit", value:"Full tuition + stipend",             criteria:"Top matric results; APS 44+; exceptional performance in life sciences and maths", url:"https://www.smu.ac.za/admissions" },
    { name:"SMU Health Sciences Bursary", type:"faculty",value:"Partial tuition support",            criteria:"Students in health-critical disciplines; South African citizens",         url:"https://www.smu.ac.za/admissions" },
    { name:"SMU Rural Service Commitment Bursary",type:"need-based",value:"Partial tuition",          criteria:"Students who commit to rural/underserved community service post-graduation", url:"https://www.smu.ac.za/admissions" },
  ],
  TUT: [
    { name:"TUT Vice-Chancellor's Award", type:"merit",  value:"Full tuition for first year",        criteria:"Top matric results; APS 28+; any TUT campus",                            url:"https://www.tut.ac.za/financial-aid" },
    { name:"TUT Merit Bursary",           type:"merit",  value:"25%–50% tuition reduction",          criteria:"APS 24+; demonstrated academic potential",                               url:"https://www.tut.ac.za/financial-aid" },
    { name:"TUT Sport Bursary",           type:"sports", value:"Partial tuition support",            criteria:"National or provincial sport colours; maintained academic standing",      url:"https://www.tut.ac.za/financial-aid" },
    { name:"TUT Engineering Bursary",     type:"faculty",value:"Partial tuition and equipment",      criteria:"Students in Engineering & Built Environment; APS 24+",                   url:"https://www.tut.ac.za/financial-aid" },
  ],
  VUT: [
    { name:"VUT Vice-Chancellor's Award", type:"merit",  value:"Full tuition for first year",        criteria:"Top matric results; APS 24+",                                            url:"https://www.vut.ac.za/admissions/financial-aid" },
    { name:"VUT Merit Bursary",           type:"merit",  value:"Partial tuition reduction",          criteria:"APS 22+; maintained academic performance",                               url:"https://www.vut.ac.za/admissions/financial-aid" },
    { name:"VUT Industrial Partnership Bursary",type:"faculty",value:"Full tuition + stipend",       criteria:"Engineering students with Vaal industrial partner sponsorships",           url:"https://www.vut.ac.za/admissions/financial-aid" },
  ],
  MUT: [
    { name:"MUT Academic Award",          type:"merit",  value:"Full tuition for first year",        criteria:"Top matric results; APS 24+; KZN students preferred",                    url:"https://www.mut.ac.za/admissions/financial-aid" },
    { name:"MUT Merit Bursary",           type:"merit",  value:"Partial tuition reduction",          criteria:"APS 20+; demonstrated academic potential",                               url:"https://www.mut.ac.za/admissions/financial-aid" },
    { name:"MUT Community Upliftment Bursary",type:"need-based",value:"Partial tuition and accommodation", criteria:"Students from Umlazi and surrounding communities; financial need",  url:"https://www.mut.ac.za/admissions/financial-aid" },
  ],
  SPU: [
    { name:"SPU Chancellor's Award",      type:"merit",  value:"Full tuition for first year",        criteria:"Top matric results; APS 28+; Northern Cape students preferred",           url:"https://www.spu.ac.za/admissions/financial-aid" },
    { name:"SPU Merit Bursary",           type:"merit",  value:"Partial tuition reduction",          criteria:"APS 24+; maintained academic performance each year",                     url:"https://www.spu.ac.za/admissions/financial-aid" },
    { name:"SPU Northern Cape Bursary",   type:"need-based", value:"Partial tuition and accommodation", criteria:"Students from Northern Cape; financial need",                        url:"https://www.spu.ac.za/admissions/financial-aid" },
  ],
  UMP: [
    { name:"UMP Vice-Chancellor's Award", type:"merit",  value:"Full tuition for first year",        criteria:"Top matric results; APS 28+; Mpumalanga students preferred",             url:"https://www.ump.ac.za/admissions/financial-aid" },
    { name:"UMP Merit Bursary",           type:"merit",  value:"Partial tuition reduction",          criteria:"APS 24+; demonstrated academic potential",                               url:"https://www.ump.ac.za/admissions/financial-aid" },
    { name:"UMP Agricultural Bursary",    type:"faculty",value:"Full tuition + stipend",             criteria:"Agriculture students committed to Mpumalanga rural development",           url:"https://www.ump.ac.za/admissions/financial-aid" },
  ],
  CUT: [
    { name:"CUT Vice-Chancellor's Award", type:"merit",  value:"Full tuition for first year",        criteria:"Top matric results; APS 26+; Free State students preferred",             url:"https://www.cut.ac.za/financial-aid" },
    { name:"CUT Merit Bursary",           type:"merit",  value:"25%–50% tuition reduction",          criteria:"APS 22+; maintained academic standing per year",                         url:"https://www.cut.ac.za/financial-aid" },
    { name:"CUT Sport Bursary",           type:"sports", value:"Partial tuition support",            criteria:"National or provincial sport representation",                             url:"https://www.cut.ac.za/financial-aid" },
    { name:"CUT Engineering Bursary",     type:"faculty",value:"Partial tuition and equipment",      criteria:"Engineering & IT students; APS 22+; Welkom or Bloemfontein campus",      url:"https://www.cut.ac.za/financial-aid" },
  ],
};

// ─── GENERATE FILES ───────────────────────────────────────────────────────────
// _index.json
write(path.join(BASE, '_index.json'), INDEX);

for (const uni of INDEX.universities) {
  const { abbr } = uni;
  const dir = path.join(BASE, abbr);
  const profile = PROFILES[abbr] || {};
  const adm = ADMISSIONS[abbr] || {};
  const ct = CONTACTS[abbr] || {};

  // info.json
  write(path.join(dir, 'info.json'), {
    abbr,
    name: uni.name,
    type: uni.type,
    established: uni.founded,
    students: uni.students,
    aps: uni.aps,
    location: { city: uni.city, province: uni.province },
    website: uni.website,
    apply: uni.apply,
    prospectus: uni.prospectus,
    logo: uni.logo,
    description: profile.description || '',
    faculties: profile.faculties || [],
    motto: profile.motto || '',
    languages: profile.languages || ['English'],
    campuses: profile.campuses || [],
    nsfasAccredited: profile.nsfasAccredited !== false,
  });

  // admissions.json
  write(path.join(dir, 'admissions.json'), {
    abbr,
    applicationPeriod: {
      opens: adm.opens || 'April 2026',
      closes: adm.closes || 'September 2026',
    },
    applicationFee: adm.fee || 100,
    feeWaiver: adm.feeWaiver || false,
    minimumAPS: adm.minAPS || 18,
    apsNote: adm.note || '',
    applyUrl: uni.apply,
    requiredDocuments: REQUIRED_DOCS,
    internationalStudents: {
      accepted: true,
      note: 'International applicants require SAQA evaluation of qualifications.',
    },
  });

  // contact.json
  write(path.join(dir, 'contact.json'), {
    abbr,
    general: { phone: ct.phone || '', email: ct.email || '' },
    admissions: { phone: ct.admissionsPhone || '', email: ct.admissionsEmail || '' },
    financialAid: { phone: ct.financialAidPhone || '', email: ct.financialAidEmail || '' },
    address: ct.address || '',
    social: {
      facebook: ct.facebook || '',
      twitter: ct.twitter || '',
      instagram: ct.instagram || '',
    },
  });

  // nsfas.json
  write(path.join(dir, 'nsfas.json'), {
    abbr,
    accredited: profile.nsfasAccredited !== false,
    financialAidOffice: ct.financialAidEmail ? 'Financial Aid Office' : '',
    email: ct.financialAidEmail || '',
    phone: ct.financialAidPhone || '',
    applicationNote: 'Apply through the myNSFAS portal at www.nsfas.org.za before the national closing date.',
    additionalFunding: ADDITIONAL_FUNDING[abbr] || [],
  });

  // courses.json
  write(path.join(dir, 'courses.json'), COURSES[abbr] || []);
}

console.log('✅  Generated', INDEX.universities.length, 'university profiles into', BASE);
