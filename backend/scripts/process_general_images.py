#!/usr/bin/env python3
"""
Process game screenshots of generals and extract data to JSON.
Uses Claude's vision API to extract structured data from images.

Usage:
    python process_general_images.py <input_folder> [--output output.json]

Example:
    python process_general_images.py ./screenshots --output generals_data.json
"""

import os
import sys
import json
import base64
import argparse
import re
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


def extract_general_data(client: anthropic.Anthropic, image_path: str) -> dict | None:
    """Use Claude vision to extract general data from a game screenshot."""

    image_data, media_type = encode_image(image_path)

    prompt = """Analyze this game screenshot of a general from 三国志战略版 (Three Kingdoms Strategy).

Extract the following information and return it as valid JSON:

{
    "id": "<Chinese name as shown, e.g. 典韦 or sp荀彧>",
    "slug": "<URL-safe slug, e.g. dien-vi or sp-tuan-uc>",
    "nameCn": "<Chinese name>",
    "nameVi": "<Vietnamese transliteration of the name>",
    "factionId": "<wei|shu|wu|qun based on the faction/color shown>",
    "cost": <number, the cost/points value>,
    "tagsCn": ["<tags in Chinese, e.g. 武, 盾, 弓, etc.>"],
    "tagsVi": ["<tags translated to Vietnamese>"],
    "cavalryGrade": "<S|A|B|C|null>",
    "shieldGrade": "<S|A|B|C|null>",
    "archerGrade": "<S|A|B|C|null>",
    "spearGrade": "<S|A|B|C|null>",
    "siegeGrade": "<S|A|B|C|null>",
    "innateSkillName": "<name of innate/fixed skill in Chinese>",
    "inheritedSkillName": "<name of inherited/传承 skill in Chinese, or null if not visible>",
    "status": "needs_update"
}

Notes:
- Faction colors: Wei (魏) = blue, Shu (蜀) = green, Wu (吴) = red, Qun (群) = yellow/brown
- For nameVi, transliterate Chinese to Vietnamese (e.g. 典韦 -> Điển Vi, 曹操 -> Tào Tháo)
- For slug, use lowercase Vietnamese without diacritics (e.g. dien-vi, tao-thao)
- Tags: 武=Võ, 盾=Thuẫn, 弓=Cung, 骑=Kỵ, 步=Bộ, 谋=Mưu
- Troop compatibility: 骑兵=cavalry, 盾兵=shield, 弓兵=archer, 枪兵=spear, 器械=siege
- If you cannot determine a value, use null

Return ONLY the JSON object, no other text."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
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
        # Sometimes the model wraps it in ```json ... ```
        json_match = re.search(r'```json\s*(.*?)\s*```', result_text, re.DOTALL)
        if json_match:
            result_text = json_match.group(1)

        data = json.loads(result_text)

        # Add the image path (relative)
        filename = Path(image_path).name
        data["image"] = f"/images/generals/{filename}"

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

    generals = []
    errors = []

    for i, image_file in enumerate(image_files, 1):
        print(f"[{i}/{len(image_files)}] Processing: {image_file.name}")

        data = extract_general_data(client, str(image_file))

        if data:
            generals.append(data)
        else:
            errors.append(str(image_file))

    print(f"\n{'='*50}")
    print(f"Processed: {len(generals)} generals")
    if errors:
        print(f"Errors: {len(errors)} files")
        for err in errors:
            print(f"  - {err}")

    # Write output
    output_path = Path(output_file)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(generals, f, ensure_ascii=False, indent=2)

    print(f"\nOutput written to: {output_path.absolute()}")

    return generals


def main():
    parser = argparse.ArgumentParser(
        description="Process game screenshots to extract general data"
    )
    parser.add_argument(
        "input_folder",
        help="Folder containing general screenshots"
    )
    parser.add_argument(
        "--output", "-o",
        default="generals_output.json",
        help="Output JSON file (default: generals_output.json)"
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
