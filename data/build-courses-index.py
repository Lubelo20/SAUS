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
    only when the name is inconclusive. Order matters: teaching qualifications and
    engineering are resolved before health/IT/commerce so e.g. 'Computer Science
    Education' -> education and 'Biomedical Engineering' -> science."""
    n, f = name.lower(), faculty.lower()
    # --- NAME-based, in priority order ---
    if re.search(r'\beducation\b|teaching|foundation phase|intermediate phase|senior phase|fet teaching|\bb\.?ed\b', n):
        return 'education'
    if 'engineering' in n:                      # computer/biomedical/etc engineering -> science
        return 'science'
    if re.search(r'\bhealth\b|audiolog|speech.?language|communication patholog|speech.?ther|physiother|occupational therap|biokinet|radiograph|radiother|sonograph|optometr|dietetic|\bnursing\b|\bnurs\b|pharmac|dental|\bdent\b|oral health|medical|medicine|mbchb|mbbch|veterin|emergency medical|clinical med|clinical technolog|midwif|chiropract|podiatr|paramedic|prosthet|homeop|homoeop', n):
        return 'health'
    if re.search(r'politic|philosoph', n) and not re.search(r'\bb\.?com\b|commerce|account', n):
        return 'humanities'                     # PPE etc. (but BCom Economics stays commerce)
    if re.search(r'\bcommerce\b|\bb\.?com\b|accountan|account|\bfinanc|\beconom|\bbusiness\b|\bmanagement\b|marketing|human resource|supply chain|logistic|\bbanking\b|taxation|entrepreneur|auditing|industrial psycholog|insurance|public admin', n):
        return 'commerce'
    if re.search(r'\bcomputer|informatic|information system|information tech|\bict\b|software|data scien|web develop|machine learning', n):
        return 'it'
    if re.search(r'\blaw\b|\bllb\b|\barts\b|social scien|psycholog|languag|theolog|relig|communicat|journalism|fine art|drama|\bmusic\b|heritage|anthropolog|sociolog|\bhistory\b|graphic design|jurisprud|social work|development studies|\bhumanit', n):
        return 'humanities'
    if re.search(r'scien|\bb\.?sc\b|agricultur|biolog|chemist|physic|mathemat|statist|geolog|environment|architect|construction|surveying|biotech|geograph|astronom|botany|zoolog', n):
        return 'science'
    # --- FACULTY-based fallback (name inconclusive) ---
    if 'education' in f: return 'education'
    if re.search(r'health|medic|pharmac|nursing|dent', f): return 'health'
    if re.search(r'engineer|built env', f): return 'science'
    if re.search(r'\blaw\b|humanit|\barts\b|social|theolog|human scien|design', f): return 'humanities'
    if re.search(r'commerce|management|account|finance|business|econom', f): return 'commerce'
    if re.search(r'scien|agricultur|natural|technolog', f): return 'science'
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
