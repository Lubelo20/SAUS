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
    n, f = name.lower(), faculty.lower()
    if re.search(r'comput|informatic|information tech|information system|software|data scien|\bict\b|web develop|network engineer', n): return 'it'
    if re.search(r'medic|mbchb|nurs|pharm|physio|dent|veterin|clinical|radiograph|optometr|diet|biokinet|midwif|occupational therap|speech therap|emergency medical', n) or re.search(r'health|medic|dent|pharmac|wellness|nursing', f): return 'health'
    if re.search(r'educat|teaching|\bb\.?ed\b|foundation phase|intermediate phase|senior phase|fet teaching', n) or 'education' in f: return 'education'
    if re.search(r'\blaw\b|\bllb\b|\barts\b|social scien|psycholog|politic|philosoph|languag|theolog|relig|communicat|journalism|fine art|drama|\bmusic\b|heritage|anthropolog|sociolog|\bhistory\b|graphic design|jurisprud', n) or re.search(r'\blaw\b|humanit|\barts\b|social scien|theolog|human scien|communicat|design', f): return 'humanities'
    if re.search(r'commerce|\bb\.?com\b|account|finance|econom|business|\bmanagement\b|marketing|human resource|logistic|supply chain|entrepreneur|administration|banking|insurance|taxation|tourism|hospitality|retail|public admin', n) or re.search(r'commerce|management|econom|business|account|finance', f): return 'commerce'
    if re.search(r'scien|\bb\.?sc\b|engineer|\bb\.?eng\b|agricultur|biolog|chemist|physic|mathemat|statist|geolog|environment|architect|construction|surveying|biotech|geograph|astronom|botany|zoolog', n) or re.search(r'scien|engineer|agricultur|natural|technolog|built env', f): return 'science'
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
