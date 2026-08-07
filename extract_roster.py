import zipfile
import xml.etree.ElementTree as ET
import json
import re

docx_path = 'C:/Users/DELL/.gemini/antigravity/scratch/quantum/PHY 400 LEVEL.docx'
z = zipfile.ZipFile(docx_path)
root = ET.fromstring(z.read('word/document.xml'))
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

roster = []
seen = set()

for tr in root.findall('.//w:tr', ns):
    cells = [''.join(t.text for t in tc.findall('.//w:t', ns) if t.text).strip() for tc in tr.findall('.//w:tc', ns)]
    if len(cells) >= 3:
        mat = cells[1].strip()
        name = cells[2].strip()
        
        # In case matric is missing and name shifted or vice versa
        if not name and len(cells) > 2:
            name = cells[1].strip()
            mat = ''
            
        if name and 'NAME' not in name.upper() and 'LEVEL' not in name.upper() and 'DEPARTMENT' not in name.upper() and name != 'S/N':
            # Clean up smart quotes and special characters
            name = name.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"').strip()
            mat = mat.replace('\u2019', "'").replace('\u2018', "'").strip()
            
            slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
            
            # Avoid duplicates if table header repeated
            key = (slug, mat)
            if key not in seen and slug:
                seen.add(key)
                roster.append({
                  'slug': slug,
                  'matricNumber': mat,
                  'fullName': name
                })

with open('data/students-roster.json', 'w', encoding='utf-8') as f:
    json.dump(roster, f, indent=2)

print(f"Successfully extracted {len(roster)} student records to data/students-roster.json")
