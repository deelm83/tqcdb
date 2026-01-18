#!/usr/bin/env python3
"""
Import general stats from extracted JSON into database.

This script:
1. Matches generals by name (exact first, then without diacritics)
2. Updates stats, troop grades, and reference screenshot
3. Matches innate skill with existing skills (exact first, then 90% fuzzy match)

Usage:
    python import_general_stats.py [--dry-run]
"""

import json
import sys
import re
from pathlib import Path
from difflib import SequenceMatcher
import psycopg2
from psycopg2.extras import RealDictCursor

# Paths
SCRIPT_DIR = Path(__file__).parent
EXTRACTED_JSON = SCRIPT_DIR.parent / "screenshots" / "generals_extracted.json"

# Database connection
DB_URL = "postgresql://postgres:postgres@localhost:5432/tqc"

# Vietnamese diacritics removal
VIETNAMESE_MAP = {
    'à':'a','á':'a','ả':'a','ã':'a','ạ':'a',
    'ă':'a','ằ':'a','ắ':'a','ẳ':'a','ẵ':'a','ặ':'a',
    'â':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a',
    'đ':'d',
    'è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e',
    'ê':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e',
    'ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i',
    'ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o',
    'ô':'o','ồ':'o','ố':'o','ổ':'o','ỗ':'o','ộ':'o',
    'ơ':'o','ờ':'o','ớ':'o','ở':'o','ỡ':'o','ợ':'o',
    'ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u',
    'ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u',
    'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y',
}

def remove_diacritics(text):
    """Remove Vietnamese diacritics from text."""
    if not text:
        return ''
    result = text.lower()
    for viet, ascii_char in VIETNAMESE_MAP.items():
        result = result.replace(viet, ascii_char)
    return result

def normalize_name(name):
    """Normalize name for matching: lowercase, remove diacritics, remove SP prefix."""
    if not name:
        return ''
    # Remove SP prefix variants
    name = re.sub(r'^sp[\s\-_]*', '', name, flags=re.IGNORECASE)
    return remove_diacritics(name).strip()

def similarity_ratio(a, b):
    """Calculate similarity ratio between two strings."""
    return SequenceMatcher(None, a, b).ratio()

def find_matching_general(name_vi, name_cn, generals_db):
    """
    Find matching general in database.
    1. Try exact match on name_vi
    2. Try exact match on name_cn
    3. Try match without diacritics
    """
    if not name_vi:
        return None

    name_vi_lower = name_vi.lower().strip()
    name_vi_normalized = normalize_name(name_vi)

    # 1. Exact match on name_vi
    for g in generals_db:
        if g['name_vi'] and g['name_vi'].lower().strip() == name_vi_lower:
            return g

    # 2. Exact match on name_cn (if provided)
    if name_cn:
        name_cn_lower = name_cn.lower().strip()
        for g in generals_db:
            if g['name_cn'] and g['name_cn'].lower().strip() == name_cn_lower:
                return g

    # 3. Match without diacritics
    for g in generals_db:
        g_vi_normalized = normalize_name(g['name_vi'])
        if g_vi_normalized == name_vi_normalized:
            return g

    # 4. Try matching with SP prefix handling
    for g in generals_db:
        g_vi_normalized = normalize_name(g['name_vi'])
        # Also try adding/removing SP prefix
        if g_vi_normalized == name_vi_normalized:
            return g
        # Check if one has SP and other doesn't
        if f"sp {g_vi_normalized}" == name_vi_normalized or g_vi_normalized == f"sp {name_vi_normalized}":
            return g

    return None

def find_matching_skill(skill_name, skill_type, skill_quality, skills_db):
    """
    Find matching skill in database.
    1. Try exact match on name_vi
    2. Try match without diacritics with 90% similarity
    """
    if not skill_name:
        return None

    skill_name_lower = skill_name.lower().strip()
    skill_name_normalized = normalize_name(skill_name)

    # 1. Exact match on name_vi
    for s in skills_db:
        if s['name_vi'] and s['name_vi'].lower().strip() == skill_name_lower:
            return s

    # 2. Match without diacritics (exact)
    for s in skills_db:
        s_vi_normalized = normalize_name(s['name_vi'])
        if s_vi_normalized == skill_name_normalized:
            return s

    # 3. Fuzzy match at 90% threshold
    best_match = None
    best_ratio = 0

    for s in skills_db:
        s_vi_normalized = normalize_name(s['name_vi'])
        ratio = similarity_ratio(skill_name_normalized, s_vi_normalized)
        if ratio >= 0.9 and ratio > best_ratio:
            best_ratio = ratio
            best_match = s

    if best_match:
        return best_match

    # 4. Try matching by type and quality as additional hints (lower threshold)
    for s in skills_db:
        s_vi_normalized = normalize_name(s['name_vi'])
        ratio = similarity_ratio(skill_name_normalized, s_vi_normalized)
        # If type and quality match, accept 80% name match
        if ratio >= 0.8:
            type_match = skill_type and s.get('type_id') and skill_type.lower() == s['type_id'].lower()
            quality_match = skill_quality and s.get('quality') and skill_quality.upper() == s['quality'].upper()
            if type_match or quality_match:
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_match = s

    return best_match

def map_skill_type(type_name):
    """Map Vietnamese skill type to type_id."""
    type_map = {
        'command': 'command',
        'active': 'active',
        'passive': 'passive',
        'pursuit': 'pursuit',
        'assault': 'assault',
        'troop': 'troop',
        'formation': 'formation',
        'chỉ huy': 'command',
        'chủ động': 'active',
        'bị động': 'passive',
    }
    if not type_name:
        return None
    return type_map.get(type_name.lower(), type_name.lower())


def main():
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        print("DRY RUN - No changes will be made")

    # Load extracted data
    with open(EXTRACTED_JSON, 'r', encoding='utf-8') as f:
        extracted_data = json.load(f)

    print(f"Loaded {len(extracted_data)} generals from extracted JSON")

    # Connect to database
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Get all generals from database
    cur.execute("SELECT id, slug, name_cn, name_vi FROM generals")
    generals_db = cur.fetchall()
    print(f"Found {len(generals_db)} generals in database")

    # Get all skills from database
    cur.execute("SELECT id, slug, name_cn, name_vi, type_id, quality FROM skills")
    skills_db = cur.fetchall()
    print(f"Found {len(skills_db)} skills in database")

    print("\n" + "=" * 60)

    # Process each extracted general
    matched = 0
    unmatched = []
    skill_matched = 0
    skill_unmatched = []

    for item in extracted_data:
        name_vi = item.get('name', {}).get('vi', '')
        name_cn = item.get('name', {}).get('cn', '')
        source_file = item.get('_source_file', '')

        # Find matching general
        general = find_matching_general(name_vi, name_cn, generals_db)

        if not general:
            unmatched.append(name_vi)
            continue

        matched += 1

        # Find matching skill
        innate_skill = item.get('innate_skill', {})
        skill_name = innate_skill.get('name', '')
        skill_type = map_skill_type(innate_skill.get('type', ''))
        skill_quality = innate_skill.get('quality', '')

        skill = find_matching_skill(skill_name, skill_type, skill_quality, skills_db)
        skill_id = skill['id'] if skill else None

        if skill:
            skill_matched += 1
            skill_info = f"-> Skill: {skill['name_vi']} (id={skill['id']})"
        else:
            if skill_name:
                skill_unmatched.append(f"{name_vi}: {skill_name}")
            skill_info = f"-> Skill NOT FOUND: {skill_name}" if skill_name else "-> No skill"

        print(f"[MATCH] {name_vi} -> {general['name_vi']} (id={general['id']})")
        print(f"        {skill_info}")

        if dry_run:
            continue

        # Prepare update data
        troop = item.get('troop_compatibility', {})
        base_stats = item.get('base_stats', {})
        stat_growth = item.get('stat_growth', {})

        # Update general
        cur.execute("""
            UPDATE generals SET
                faction_id = %s,
                cost = %s,
                rarity = %s,
                cavalry_grade = %s,
                shield_grade = %s,
                archer_grade = %s,
                spear_grade = %s,
                siege_grade = %s,
                base_attack = %s,
                base_command = %s,
                base_intelligence = %s,
                base_politics = %s,
                base_speed = %s,
                base_charm = %s,
                growth_attack = %s,
                growth_command = %s,
                growth_intelligence = %s,
                growth_politics = %s,
                growth_speed = %s,
                growth_charm = %s,
                innate_skill_id = COALESCE(%s, innate_skill_id),
                ref_screenshot = %s,
                updated_at = NOW()
            WHERE id = %s
        """, (
            item.get('faction'),
            item.get('cost'),
            item.get('rarity'),
            troop.get('cavalry'),
            troop.get('shield'),
            troop.get('archer'),
            troop.get('spear'),
            troop.get('siege'),
            base_stats.get('attack'),
            base_stats.get('command'),
            base_stats.get('intelligence'),
            base_stats.get('politics'),
            base_stats.get('speed'),
            base_stats.get('charm'),
            stat_growth.get('attack'),
            stat_growth.get('command'),
            stat_growth.get('intelligence'),
            stat_growth.get('politics'),
            stat_growth.get('speed'),
            stat_growth.get('charm'),
            skill_id,
            source_file,
            general['id']
        ))

    if not dry_run:
        conn.commit()

    cur.close()
    conn.close()

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Generals matched: {matched}/{len(extracted_data)}")
    print(f"Skills matched: {skill_matched}/{matched}")

    if unmatched:
        print(f"\nUnmatched generals ({len(unmatched)}):")
        for name in unmatched[:20]:
            print(f"  - {name}")
        if len(unmatched) > 20:
            print(f"  ... and {len(unmatched) - 20} more")

    if skill_unmatched:
        print(f"\nUnmatched skills ({len(skill_unmatched)}):")
        for info in skill_unmatched[:20]:
            print(f"  - {info}")
        if len(skill_unmatched) > 20:
            print(f"  ... and {len(skill_unmatched) - 20} more")

    if dry_run:
        print("\nDRY RUN - No changes were made")
    else:
        print(f"\nUpdated {matched} generals in database")


if __name__ == "__main__":
    main()
