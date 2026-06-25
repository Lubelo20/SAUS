#!/usr/bin/env python3
"""Build data/universities/_courses.json — a single combined dataset of every
course across all 26 universities, used by the apply-page APS matcher
("Find Courses You Qualify For").

Derived from the per-university courses.json files (the web-verified source of
truth) + _index.json (uni name + province). Re-run after the per-uni data
changes:  python3 data/build-courses-index.py

Each entry: {name, qual, uni, abbr, province, aps, field, faculty, duration, desc}
`field` is computed from the course name + faculty into one of the matcher's
interest categories: it | health | education | humanities | commerce | science.
"""
import json, glob, re, os

HERE = os.path.dirname(os.path.abspath(__file__))
UNI_DIR = os.path.join(HERE, 'universities')

idx = json.load(open(os.path.join(UNI_DIR, '_index.json')))
arr = idx if isinstance(idx, list) else idx.get('universities', [])
meta = {u['abbr']: u for u in arr}

def classify(name, faculty):
    """Map a course to a matcher interest field. NAME signals take priority over
    FACULTY (a degree's own title is the strongest signal); faculty is a fallback
    only when the name is inconclusive. Fine-grained taxonomy (10 fields):
    it, engineering, science, agriculture, health, commerce, law, arts, humanities,
    education. Order matters (e.g. 'Computer Science Education' -> education;
    'Biomedical Engineering' -> engineering; 'BCom Information Systems' -> commerce)."""
    n, f = name.lower(), faculty.lower()
    # --- NAME-based, in priority order ---
    if re.search(r'\beducation\b|teaching|foundation phase|intermediate phase|senior phase|fet teaching|\bb\.?ed\b', n):
        return 'education'
    if re.search(r'engineering|\barchitect|quantity survey|construction (manage|studies|economic)|urban (and regional )?planning|town and regional|built environment|geomatics|\bsurveying\b', n):
        return 'engineering'
    if re.search(r'\bhealth\b|audiolog|speech.?language|communication patholog|speech.?ther|physiother|occupational therap|biokinet|radiograph|radiother|sonograph|optometr|dietetic|nutrition|\bnursing\b|\bnurs\b|pharmac|dental|\bdent\b|oral health|medical|medicine|mbchb|mbbch|veterin|emergency medical|clinical med|clinical technolog|midwif|chiropract|podiatr|paramedic|prosthet|homeop|homoeop', n):
        return 'health'
    if re.search(r'\bcomputer|informatic|information system|information tech|\bict\b|software|data scien|web develop|machine learning', n) and not re.search(r'\bb\.?com\b|commerce', n):
        return 'it'
    if re.search(r'agricultur|agribusiness|\banimal (scien|product|health)|crop|soil scien|horticultur|forestry|game rang|wildlife|aquacultur|viticultur|oenolog|plant (scien|patholog|production)|environmental scien|environmental manage', n):
        return 'agriculture'
    if re.search(r'\bcommerce\b|\bb\.?com\b|accountan|account|\bfinanc|\beconom|\bbusiness\b|\bmanagement\b|marketing|human resource|supply chain|logistic|\bbanking\b|taxation|entrepreneur|auditing|industrial psycholog|insurance|public admin|tourism|hospitality|\bretail\b', n) and not re.search(r'politic|philosoph', n):
        return 'commerce'
    if re.search(r'\bllb\b|bachelor of laws|jurisprud|\blaw\b', n):
        return 'law'
    if re.search(r'fine art|visual art|performing art|graphic design|interior design|\bdesign\b|\bmusic\b|\bdrama\b|theatre|theater|\bfilm\b|\bmedia\b|journalism|photograph|fashion|\bdance\b|\bjazz\b|animation|creative writing|motion picture|sound (engineering|technolog|design)', n):
        return 'arts'
    if re.search(r'\barts\b|\bb\.?a\b|social scien|psycholog|politic|philosoph|languag|theolog|relig|communicat|heritage|anthropolog|sociolog|\bhistory\b|social work|development studies|\bhumanit|geograph|international stud|gender|policing|criminolog', n):
        return 'humanities'
    if re.search(r'scien|\bb\.?sc\b|biolog|chemist|physic|mathemat|statist|geolog|environment|biotech|astronom|botany|zoolog|microbiolog|biochem|genetic', n):
        return 'science'
    # --- FACULTY-based fallback (name inconclusive) ---
    if 'education' in f: return 'education'
    if re.search(r'engineer|built env', f): return 'engineering'
    if re.search(r'health|medic|pharmac|nursing|dent', f): return 'health'
    if re.search(r'agricultur', f): return 'agriculture'
    if re.search(r'\blaw\b', f) and not re.search(r'manage|commerce', f): return 'law'
    if re.search(r'\barts\b|design', f): return 'arts'
    if re.search(r'commerce|management|account|finance|business|econom', f): return 'commerce'
    if re.search(r'humanit|social|theolog|human scien', f): return 'humanities'
    if re.search(r'scien|natural|technolog', f): return 'science'
    return 'science'

out = []
for path in sorted(glob.glob(os.path.join(UNI_DIR, '*', 'courses.json'))):
    abbr = os.path.basename(os.path.dirname(path))
    m = meta.get(abbr, {})
    for c in json.load(open(path)):
        out.append({
            'name': c.get('name', ''), 'qual': c.get('qual', ''),
            'uni': m.get('name', abbr), 'abbr': abbr,
            'province': m.get('province', 'Other'),
            'aps': c.get('aps', 0),
            'field': classify(c.get('name', ''), c.get('faculty', '')),
            'faculty': c.get('faculty', ''),
            'duration': c.get('duration', '3 Years'),
            'desc': c.get('desc', 'Accredited South African higher-education qualification.'),
        })

json.dump(out, open(os.path.join(UNI_DIR, '_courses.json'), 'w'),
          ensure_ascii=False, separators=(',', ':'))
print(f'wrote _courses.json: {len(out)} courses across {len(set(x["abbr"] for x in out))} universities')
