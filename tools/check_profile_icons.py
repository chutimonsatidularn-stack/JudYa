#!/usr/bin/env python3
"""Safety/format check for profile-icon SVGs. Exit code 1 if anything fails.
usage: python3 tools/check_profile_icons.py [dir]  (default docs/design/assets/profile-icons)"""
import sys, json, re, pathlib, xml.etree.ElementTree as ET
root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'docs/design/assets/profile-icons')
NS = '{http://www.w3.org/2000/svg}'
ok = True
def fail(m):
    global ok; ok = False; print('FAIL', m)
data = json.loads((root / 'profiles.json').read_text(encoding='utf-8'))
for it in data['items']:
    p = root / it['svg']
    if not p.exists(): fail(f'{p} missing'); continue
    if not (root / it['png512']).exists(): fail(f"{it['png512']} missing")
    t = ET.parse(p).getroot()
    if t.attrib.get('viewBox') != '0 0 1000 1000': fail(f'{p.name} viewBox')
    for el in t.iter():
        tag = el.tag.replace(NS, '')
        if tag not in ('svg', 'g', 'path'): fail(f'{p.name} forbidden element <{tag}>')
        for a in el.attrib:
            if a.lower().startswith('on') or a in ('style', 'stroke', 'filter', 'clip-path', 'mask', 'href', '{http://www.w3.org/1999/xlink}href'):
                fail(f'{p.name} forbidden attribute {a}')
        if el.attrib.get('fill', '').startswith('url'): fail(f'{p.name} gradient')
    ids = [e.attrib['id'] for e in t.iter() if 'id' in e.attrib]
    if len(ids) != len(set(ids)): fail(f'{p.name} duplicate ids')
print('OK' if ok else 'FAILED', len(data['items']), 'icons')
sys.exit(0 if ok else 1)
