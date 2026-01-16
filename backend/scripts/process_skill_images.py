#!/usr/bin/env python3
"""
Process game screenshots of skills and extract data to JSON.
Uses Claude's vision API to extract structured data from images.

Usage:
    python process_skill_images.py <input_folder> [--output output.json]

Example:
    python process_skill_images.py ./skill_screenshots --output skills_data.json
"""

import os
import sys
import json
import base64
import argparse
import re
import unicodedata
from pathlib import Path
import anthropic


def encode_image(image_path: str) -> tuple[str, str]:
    """Read and encode image to base64, return (base64_data, media_type)."""
    with open(image_path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("utf-8")

    ext = Path(image_path).suffix.lower()
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp"
    }
    media_type = media_types.get(ext, "image/jpeg")
    return data, media_type


def generate_slug(name_vi: str) -> str | None:
    """Generate URL-safe slug from Vietnamese name."""
    if not name_vi:
        return None
    # Normalize and remove diacritics
    slug = unicodedata.normalize('NFD', name_vi)
    slug = ''.join(c for c in slug if unicodedata.category(c) != 'Mn')
    slug = slug.replace('đ', 'd').replace('Đ', 'D')
    slug = slug.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug


def extract_skill_data(client: anthropic.Anthropic, image_path: str) -> dict | None:
    """Use Claude vision to extract skill data from a game screenshot."""

    image_data, media_type = encode_image(image_path)

    prompt = """Analyze this game skill screenshot from 三国志战略版 (Three Kingdoms Strategy).

Extract the following information and return it as valid JSON:

{
    "nameCn": "<Skill name in Chinese>",
    "nameVi": "<Skill name in Vietnamese>",
    "typeId": "<command|active|passive|pursuit|assault|troop|internal>",
    "typeNameCn": "<Type name in Chinese, e.g. 指挥, 主动, 被动>",
    "typeNameVi": "<Type name in Vietnamese, e.g. Chỉ Huy, Chủ Động, Bị Động>",
    "quality": "<S|A|B|C or null>",
    "triggerRate": <number 0-100 or null if not shown>,
    "sourceType": "<innate|inherited or null>",
    "effectCn": "<Skill effect description in Chinese>",
    "effectVi": "<Skill effect description in Vietnamese>",
    "target": "<target_id>",
    "targetVi": "<Target description in Vietnamese>",
    "armyTypes": ["<cavalry|shield|archer|spear|siege>"],
    "innateToGeneralNames": ["<Chinese names of generals who have this as innate>"],
    "inheritanceFromGeneralNames": ["<Chinese names of generals who can pass this skill>"],
    "acquisitionType": "<inherit|innate|exchange or null>",
    "exchangeType": "<exact|any or null if not exchange skill>",
    "exchangeGenerals": ["<Chinese names of generals needed for exchange>"],
    "exchangeCount": <number of generals needed for "any" type, or null>,
    "wikiUrl": "<wiki URL if visible, or null>"
}

SKILL TYPE - Look for skill type in the header or under "Loại hình:" label:
- "command" = 指挥 / Chỉ huy / Chỉ Huy
- "active" = 主动 / Chủ động / Chủ Động
- "passive" = 被动 / Bị động / Bị Động
- "pursuit" = 追击 / Truy kích / Truy Kích
- "assault" = 突击 / Đột kích / Đột Kích
- "troop" = 兵种 / Binh chủng / Binh Chủng
- "internal" = 内政 / Nội chính / Nội Chính

ARMY TYPES - Look for "Thích hợp:" section with icons:
- "cavalry" = 骑 / Kỵ (horse icon)
- "shield" = 盾 / Thuẫn (shield icon)
- "archer" = 弓 / Cung (bow icon)
- "spear" = 枪 / Thương (spear icon)
- "siege" = 器 / Khí (wheel/siege icon)

Only include army types that are shown/highlighted (not grayed out).

TARGET - Look for "Mục tiêu:" label:
- "self" = 自身 / Bản thân
- "ally_1" = 1名友军 / 1 đồng minh
- "ally_2" = 2名友军 / 2 đồng minh
- "ally_all" = 全体友军 / Tất cả quân ta
- "ally_1_2" = 1-2名友军 / 1-2 đồng minh
- "ally_2_3" = 2-3名友军 / 2-3 đồng minh
- "enemy_1" = 1名敌军 / 1 địch
- "enemy_2" = 2名敌军 / 2 địch
- "enemy_all" = 全体敌军 / Tất cả địch
- "enemy_1_2" = 1-2名敌军 / 1-2 địch
- "enemy_2_3" = 2-3名敌军 / 2-3 địch

ACQUISITION - Look for how to obtain the skill:
- "innate" = only available as innate skill (天生/自带)
- "inherit" = can be inherited from a general (传承)
- "exchange" = obtained by exchanging generals (兑换)

For exchange skills:
- "exact" = need specific generals
- "any" = any generals from a pool, use exchangeCount for how many

Extract all visible information. If a field is not visible, use null or empty array.
Preserve exact text for effect descriptions including numbers and percentages.

Return ONLY the JSON object, no other text."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )

        result_text = response.content[0].text.strip()

        # Try to extract JSON from the response
        json_match = re.search(r'```json\s*(.*?)\s*```', result_text, re.DOTALL)
        if json_match:
            result_text = json_match.group(1)

        data = json.loads(result_text)

        # Generate slug from Vietnamese name
        data["slug"] = generate_slug(data.get("nameVi", ""))

        # Add default status
        data["status"] = "needs_update"

        # Ensure arrays are arrays
        for key in ["armyTypes", "innateToGeneralNames", "inheritanceFromGeneralNames", "exchangeGenerals"]:
            if key not in data or data[key] is None:
                data[key] = []

        print(f"  Extracted: {data.get('nameCn', 'unknown')} ({data.get('nameVi', '')})")
        return data

    except json.JSONDecodeError as e:
        print(f"  Error parsing JSON response: {e}")
        print(f"  Raw response: {result_text[:500]}")
        return None
    except Exception as e:
        print(f"  Error processing image: {e}")
        return None


def process_folder(input_folder: str, output_file: str):
    """Process all images in a folder and output JSON."""

    # Initialize Anthropic client
    client = anthropic.Anthropic()

    # Find all image files
    image_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    image_files = []

    input_path = Path(input_folder)
    if not input_path.exists():
        print(f"Error: Folder '{input_folder}' does not exist")
        sys.exit(1)

    for file in input_path.iterdir():
        if file.suffix.lower() in image_extensions:
            image_files.append(file)

    image_files.sort()

    if not image_files:
        print(f"No image files found in '{input_folder}'")
        sys.exit(1)

    print(f"Found {len(image_files)} images to process\n")

    skills = []
    errors = []

    for i, image_file in enumerate(image_files, 1):
        print(f"[{i}/{len(image_files)}] Processing: {image_file.name}")

        data = extract_skill_data(client, str(image_file))

        if data:
            skills.append(data)
        else:
            errors.append(str(image_file))

    print(f"\n{'='*50}")
    print(f"Processed: {len(skills)} skills")
    if errors:
        print(f"Errors: {len(errors)} files")
        for err in errors:
            print(f"  - {err}")

    # Write output
    output_path = Path(output_file)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(skills, f, ensure_ascii=False, indent=2)

    print(f"\nOutput written to: {output_path.absolute()}")

    return skills


def main():
    parser = argparse.ArgumentParser(
        description="Process game screenshots to extract skill data"
    )
    parser.add_argument(
        "input_folder",
        help="Folder containing skill screenshots"
    )
    parser.add_argument(
        "--output", "-o",
        default="skills_output.json",
        help="Output JSON file (default: skills_output.json)"
    )

    args = parser.parse_args()

    # Check for API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        print("Set it with: export ANTHROPIC_API_KEY='your-key-here'")
        sys.exit(1)

    process_folder(args.input_folder, args.output)


if __name__ == "__main__":
    main()
