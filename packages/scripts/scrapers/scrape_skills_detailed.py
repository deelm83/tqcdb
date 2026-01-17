#!/usr/bin/env python3
"""
Scrape detailed skill information from Bilibili wiki for Three Kingdoms Tactics.
This script enhances existing skill data with:
- Full effect description
- Applicable army types
- Acquisition method (inheritance from which general, or event exchange)
"""

import requests
import json
import time
import os
import re
from bs4 import BeautifulSoup

# Paths
SKILLS_FILE = '../data/skills/all_skills.json'
GENERALS_FILE = '../data/generals/all_generals.json'

# Army type mapping (Chinese to English)
ARMY_TYPES_CN = ['骑兵', '盾兵', '弓兵', '枪兵', '器械']
ARMY_TYPES_EN = ['cavalry', 'shield', 'archer', 'spear', 'siege']

ARMY_TYPE_VI = {
    'cavalry': 'Kỵ binh',
    'shield': 'Thuẫn binh',
    'archer': 'Cung binh',
    'spear': 'Thương binh',
    'siege': 'Công thành',
}


def scrape_skill_detail_page(url: str, session: requests.Session) -> dict:
    """Scrape detailed information from a skill's wiki page."""
    detail = {
        'effect': None,
        'army_types': [],
        'source_generals': [],
        'target': None,
    }

    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find the main info table
        table = soup.find('table')
        if not table:
            return detail

        rows = table.find_all('tr')

        for i, row in enumerate(rows):
            cells = row.find_all(['th', 'td'])
            if not cells:
                continue

            cell_texts = [c.get_text().strip() for c in cells]

            # Check for source generals row (来源武将)
            if len(cell_texts) >= 4 and i > 0:
                # Row with values after header row
                prev_row = rows[i-1] if i > 0 else None
                if prev_row:
                    prev_texts = [c.get_text().strip() for c in prev_row.find_all(['th', 'td'])]
                    if '来源武将' in prev_texts:
                        # This row has the values
                        source_idx = prev_texts.index('来源武将') if '来源武将' in prev_texts else -1
                        if source_idx >= 0 and source_idx < len(cell_texts):
                            generals_text = cell_texts[source_idx]
                            # Split by space to get individual general names
                            generals = [g.strip() for g in generals_text.split() if g.strip()]
                            detail['source_generals'] = generals

                    if '战法目标' in prev_texts:
                        target_idx = prev_texts.index('战法目标') if '战法目标' in prev_texts else -1
                        if target_idx >= 0 and target_idx < len(cell_texts):
                            detail['target'] = cell_texts[target_idx]

            # Check for army type row (骑兵, 盾兵, etc.)
            if cell_texts == ARMY_TYPES_CN:
                # Next row should have the checkmarks
                if i + 1 < len(rows):
                    next_row = rows[i + 1]
                    next_cells = [c.get_text().strip() for c in next_row.find_all(['th', 'td'])]
                    for j, check in enumerate(next_cells):
                        if check in ['√', '✓', '✔', '○']:
                            if check in ['√', '✓', '✔'] and j < len(ARMY_TYPES_EN):
                                detail['army_types'].append(ARMY_TYPES_EN[j])

            # Check for description row (满级战法描述 or 战法描述)
            if '战法描述' in ''.join(cell_texts):
                # Next row should have the description
                if i + 1 < len(rows):
                    next_row = rows[i + 1]
                    desc_cells = next_row.find_all(['th', 'td'])
                    if desc_cells:
                        detail['effect'] = desc_cells[0].get_text().strip()

    except Exception as e:
        print(f"    Error: {e}")

    return detail


def main():
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    })

    # Load existing skills
    with open(SKILLS_FILE, 'r', encoding='utf-8') as f:
        skills = json.load(f)

    # Load generals for reference
    with open(GENERALS_FILE, 'r', encoding='utf-8') as f:
        generals = json.load(f)

    # Create a map of generals and their skills
    general_skill_map = {}
    for g in generals:
        g_name = g.get('name', {}).get('cn', '')
        if not g_name:
            continue

        # Innate skill
        if g.get('innate_skill'):
            skill_name = g['innate_skill'].get('name', {}).get('cn', '')
            if skill_name:
                if skill_name not in general_skill_map:
                    general_skill_map[skill_name] = {'innate': [], 'inherited': []}
                general_skill_map[skill_name]['innate'].append(g_name)

        # Inherited skill
        if g.get('inherited_skill'):
            skill_name = g['inherited_skill'].get('name', {}).get('cn', '')
            if skill_name:
                if skill_name not in general_skill_map:
                    general_skill_map[skill_name] = {'innate': [], 'inherited': []}
                general_skill_map[skill_name]['inherited'].append(g_name)

    print(f"Loaded {len(skills)} skills")
    print(f"Built general-skill map with {len(general_skill_map)} skills")
    print("=" * 50)

    # Process each skill
    updated = 0
    for i, skill in enumerate(skills):
        skill_name = skill['name']['cn']
        wiki_url = skill.get('wiki_url')

        print(f"[{i+1}/{len(skills)}] {skill_name}...", end=' ')

        # Get details from wiki if URL exists
        if wiki_url:
            detail = scrape_skill_detail_page(wiki_url, session)

            if detail['effect']:
                skill['effect'] = {'cn': detail['effect']}

            if detail['army_types']:
                skill['army_types'] = detail['army_types']

            if detail['source_generals']:
                skill['inheritance_from'] = detail['source_generals']

            if detail['target']:
                skill['target'] = detail['target']

            time.sleep(0.3)

        # Supplement with general data
        if skill_name in general_skill_map:
            gmap = general_skill_map[skill_name]

            # Set innate generals
            if gmap['innate']:
                skill['innate_to'] = gmap['innate']

            # If no inheritance from wiki, use from generals data
            if gmap['inherited'] and 'inheritance_from' not in skill:
                skill['inheritance_from'] = gmap['inherited']

        # Determine acquisition type
        acquisition = []
        if skill.get('innate_to'):
            acquisition.append('innate')
        if skill.get('inheritance_from'):
            acquisition.append('inheritance')
        if skill.get('event_exchange'):
            acquisition.append('event')
        skill['acquisition'] = acquisition if acquisition else ['unknown']

        if skill.get('effect') or skill.get('army_types'):
            updated += 1
            print("OK")
        else:
            print("(no wiki details)")

    print("=" * 50)
    print(f"Updated {updated} skills with wiki details")

    # Save updated skills
    with open(SKILLS_FILE, 'w', encoding='utf-8') as f:
        json.dump(skills, f, ensure_ascii=False, indent=2)

    print(f"Saved to {SKILLS_FILE}")

    # Print summary
    with_effect = sum(1 for s in skills if s.get('effect'))
    with_army = sum(1 for s in skills if s.get('army_types'))
    with_inherit = sum(1 for s in skills if s.get('inheritance_from'))
    with_innate = sum(1 for s in skills if s.get('innate_to'))

    print(f"\nSummary:")
    print(f"  Skills with effect description: {with_effect}")
    print(f"  Skills with army types: {with_army}")
    print(f"  Skills with inheritance source: {with_inherit}")
    print(f"  Skills that are innate: {with_innate}")


if __name__ == '__main__':
    main()
