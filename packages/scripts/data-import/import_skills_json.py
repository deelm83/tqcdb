#!/usr/bin/env python3
"""
Import skills from JSON file to PostgreSQL database.

Usage:
    python import_skills_json.py <json_file> [--update]

Options:
    --update    Update existing skills (default: skip existing)
    --dry-run   Preview what would be imported without saving

Example:
    python import_skills_json.py skills_output.json --dry-run
    python import_skills_json.py skills_output.json
    python import_skills_json.py skills_output.json --update
"""

import os
import sys
import json
import argparse
from pathlib import Path

try:
    import psycopg2
    from psycopg2.extras import Json
except ImportError:
    print("Error: psycopg2 not installed")
    print("Install with: pip install psycopg2-binary")
    sys.exit(1)


def get_db_connection():
    """Get database connection from DATABASE_URL env var."""
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL environment variable not set")
        sys.exit(1)
    return psycopg2.connect(db_url)


def skill_exists(cursor, name_cn: str, slug: str) -> int | None:
    """Check if skill exists, return id if found."""
    if name_cn:
        cursor.execute("SELECT id FROM skills WHERE name_cn = %s", (name_cn,))
        result = cursor.fetchone()
        if result:
            return result[0]

    if slug:
        cursor.execute("SELECT id FROM skills WHERE slug = %s", (slug,))
        result = cursor.fetchone()
        if result:
            return result[0]

    return None


def import_skill(cursor, skill: dict, update_existing: bool) -> tuple[str, str]:
    """Import a single skill. Returns (action, name)."""
    name_cn = skill.get("nameCn", "")
    name_vi = skill.get("nameVi", "")
    slug = skill.get("slug")

    existing_id = skill_exists(cursor, name_cn, slug)

    if existing_id and not update_existing:
        return ("skipped", name_cn or name_vi)

    data = {
        "slug": slug,
        "name_cn": name_cn,
        "name_vi": name_vi,
        "type_id": skill.get("typeId", ""),
        "type_name_cn": skill.get("typeNameCn"),
        "type_name_vi": skill.get("typeNameVi"),
        "quality": skill.get("quality"),
        "trigger_rate": skill.get("triggerRate"),
        "source_type": skill.get("sourceType"),
        "wiki_url": skill.get("wikiUrl"),
        "effect_cn": skill.get("effectCn"),
        "effect_vi": skill.get("effectVi"),
        "target": skill.get("target"),
        "target_vi": skill.get("targetVi"),
        "army_types": skill.get("armyTypes", []),
        "innate_to_generals": skill.get("innateToGeneralNames", []),
        "inheritance_from_generals": skill.get("inheritanceFromGeneralNames", []),
        "acquisition_type": skill.get("acquisitionType"),
        "exchange_type": skill.get("exchangeType"),
        "exchange_generals": skill.get("exchangeGenerals", []),
        "exchange_count": skill.get("exchangeCount"),
        "status": skill.get("status", "needs_update"),
    }

    if existing_id:
        # Update
        set_clause = ", ".join(f"{k} = %s" for k in data.keys())
        cursor.execute(
            f"UPDATE skills SET {set_clause}, updated_at = NOW() WHERE id = %s",
            list(data.values()) + [existing_id]
        )
        return ("updated", name_cn or name_vi)
    else:
        # Insert
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["%s"] * len(data))
        cursor.execute(
            f"INSERT INTO skills ({columns}) VALUES ({placeholders})",
            list(data.values())
        )
        return ("created", name_cn or name_vi)


def main():
    parser = argparse.ArgumentParser(
        description="Import skills from JSON to database"
    )
    parser.add_argument(
        "json_file",
        help="JSON file containing skill data"
    )
    parser.add_argument(
        "--update",
        action="store_true",
        help="Update existing skills (default: skip)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview without saving"
    )

    args = parser.parse_args()

    # Load JSON
    json_path = Path(args.json_file)
    if not json_path.exists():
        print(f"Error: File not found: {args.json_file}")
        sys.exit(1)

    with open(json_path, "r", encoding="utf-8") as f:
        skills = json.load(f)

    print(f"\n=== Import Skills from JSON ===")
    print(f"File: {args.json_file}")
    print(f"Skills: {len(skills)}")
    print(f"Mode: {'DRY RUN' if args.dry_run else 'LIVE'}")
    print(f"Update existing: {'Yes' if args.update else 'No (skip)'}")
    print()

    if args.dry_run:
        # Just preview
        for i, skill in enumerate(skills, 1):
            name = skill.get("nameCn") or skill.get("nameVi") or "unknown"
            print(f"[{i}/{len(skills)}] Would import: {name}")
        print(f"\nTotal: {len(skills)} skills")
        return

    # Connect to database
    conn = get_db_connection()
    cursor = conn.cursor()

    results = {"created": 0, "updated": 0, "skipped": 0, "failed": 0}

    try:
        for i, skill in enumerate(skills, 1):
            try:
                action, name = import_skill(cursor, skill, args.update)
                results[action] += 1
                print(f"[{i}/{len(skills)}] {action.upper()}: {name}")
            except Exception as e:
                results["failed"] += 1
                name = skill.get("nameCn") or skill.get("nameVi") or "unknown"
                print(f"[{i}/{len(skills)}] FAILED: {name} - {e}")

        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"\nError: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

    print(f"\n=== Summary ===")
    print(f"Created: {results['created']}")
    print(f"Updated: {results['updated']}")
    print(f"Skipped: {results['skipped']}")
    print(f"Failed: {results['failed']}")


if __name__ == "__main__":
    main()
