#!/usr/bin/env python3
"""
Import general images and update database.

Usage:
    python import_general_images.py [--dry-run]

This script:
1. Copies images from output/generals/images/ to frontend public folder
2. Updates generals in database with image paths
"""

import json
import shutil
import sys
import os
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values

# Paths
SCRIPT_DIR = Path(__file__).parent
MAPPING_FILE = SCRIPT_DIR.parent / "output" / "generals" / "generals_mapping.json"
SOURCE_IMAGES = SCRIPT_DIR.parent / "output" / "generals" / "images"
DEST_IMAGES = SCRIPT_DIR.parent.parent / "frontend" / "public" / "images" / "generals"

# Database connection
DB_URL = "postgresql://postgres:postgres@localhost:5432/tqc"


def slugify(name):
    """Convert Vietnamese name to slug."""
    replacements = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'đ': 'd',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    }

    result = name.lower()
    for viet, ascii_char in replacements.items():
        result = result.replace(viet, ascii_char)

    # Replace spaces with hyphens, remove special chars
    result = result.replace(' ', '-')
    result = ''.join(c for c in result if c.isalnum() or c == '-')
    result = '-'.join(filter(None, result.split('-')))  # Remove multiple hyphens

    return result


def main():
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        print("DRY RUN - No changes will be made")

    # Load mapping
    with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
        mapping = json.load(f)

    print(f"Loaded {len(mapping)} generals from mapping")

    # Ensure destination directory exists
    if not dry_run:
        DEST_IMAGES.mkdir(parents=True, exist_ok=True)

    # Copy images and prepare database records
    copied = 0
    records = []

    for key, data in mapping.items():
        name_vi = data['name_vi']
        name_cn = data.get('name_cn') or name_vi
        filename = data['filename']

        source_file = SOURCE_IMAGES / filename

        if not source_file.exists():
            print(f"  WARNING: Source file not found: {filename}")
            continue

        # Generate slug and ID
        slug = slugify(name_vi)
        general_id = name_cn if name_cn else slug

        # Destination filename (use slug for consistency)
        dest_filename = f"{slug}.png"
        dest_file = DEST_IMAGES / dest_filename
        image_path = f"/images/generals/{dest_filename}"

        # Copy image
        if not dry_run:
            shutil.copy2(source_file, dest_file)
        copied += 1

        records.append({
            'id': general_id,
            'slug': slug,
            'name_cn': name_cn,
            'name_vi': name_vi,
            'image': image_path,
        })

        print(f"  {name_vi} -> {dest_filename}")

    print(f"\nCopied {copied} images to {DEST_IMAGES}")

    if dry_run:
        print("\nDRY RUN - Database not updated")
        return

    # Update database
    print("\nUpdating database...")

    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        # Upsert generals (update image if exists, skip create for now)
        updated = 0
        created = 0

        for rec in records:
            # Try to update by name_vi or name_cn first
            cur.execute("""
                UPDATE generals
                SET image = %s, updated_at = NOW()
                WHERE name_vi = %s OR name_cn = %s OR slug = %s
                RETURNING id
            """, (rec['image'], rec['name_vi'], rec['name_cn'], rec['slug']))

            result = cur.fetchone()
            if result:
                updated += 1
            else:
                # Create new record with minimal data
                try:
                    cur.execute("""
                        INSERT INTO generals (id, slug, name_cn, name_vi, faction_id, cost, image, tags_cn, tags_vi, status, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, 'qun', 3, %s, '{}', '{}', 'needs_update', NOW(), NOW())
                        ON CONFLICT (id) DO UPDATE SET image = EXCLUDED.image, updated_at = NOW()
                    """, (rec['id'], rec['slug'], rec['name_cn'], rec['name_vi'], rec['image']))
                    created += 1
                except Exception as e:
                    print(f"  Skip {rec['name_vi']}: {e}")
                    conn.rollback()

        conn.commit()
        cur.close()
        conn.close()

        print(f"Database updated: {updated} updated, {created} created")

    except Exception as e:
        print(f"Database error: {e}")
        raise


if __name__ == "__main__":
    main()
