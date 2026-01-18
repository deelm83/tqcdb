#!/usr/bin/env python3
"""
Extract general information from game screenshots using Claude Vision API.

Usage:
    python extract_generals.py <image_path>
    python extract_generals.py --all  # Process all images in screenshots/generals/

Requires:
    - ANTHROPIC_API_KEY environment variable or .env file
    - pip install anthropic python-dotenv
"""

import anthropic
import base64
import json
import sys
import os
from pathlib import Path

# Load .env file if exists
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
    else:
        # Try root .env
        root_env = Path(__file__).parent.parent.parent.parent / '.env'
        if root_env.exists():
            load_dotenv(root_env)
except ImportError:
    pass  # dotenv not installed, rely on environment variable

# Output schema for generals
GENERAL_SCHEMA = {
    "name": {
        "cn": "Chinese name",
        "vi": "Vietnamese name"
    },
    "faction": "wei|shu|wu|qun",
    "cost": "1-7",
    "rarity": "N|R|SR|SSR|SP",
    "troop_compatibility": {
        "cavalry": "S|A|B|C",
        "shield": "S|A|B|C",
        "archer": "S|A|B|C",
        "spear": "S|A|B|C",
        "siege": "S|A|B|C"
    },
    "base_stats": {
        "attack": "base value (white number)",
        "command": "base value (white number)",
        "intelligence": "base value (white number)",
        "politics": "base value (white number)",
        "speed": "base value (white number)",
        "charm": "base value (white number)"
    },
    "stat_growth": {
        "attack": "growth per level (green number)",
        "command": "growth per level (green number)",
        "intelligence": "growth per level (green number)",
        "politics": "growth per level (green number)",
        "speed": "growth per level (green number)",
        "charm": "growth per level (green number)"
    },
    "innate_skill": {
        "name": "Skill name in Vietnamese",
        "type": "command|active|passive|pursuit|assault|troop|formation",
        "quality": "S|A|B|C"
    }
}

EXTRACTION_PROMPT = """Analyze this game screenshot of a general/character and extract the following information.

The screenshot shows a general's detail screen from a Three Kingdoms strategy game (Vietnamese version).

**Key elements to identify:**
1. **Name**: The general's name shown at bottom-left (Vietnamese name like "Tuấn Úc")
2. **Faction**: Look for colored badge - Ngụy (Wei/blue), Thục (Shu/green), Ngô (Wu/red), Quần (Qun/yellow)
3. **Cost**: Number shown in hexagon icon near top (labeled "COST")
4. **Rarity**: Badge like "SP", "SSR", "SR", "R", "N" shown on character portrait
5. **Troop Compatibility** (Binh chủng): Shows grades S/A/B/C for each troop type:
   - Kỵ = Cavalry
   - Khiên = Shield
   - Cung = Archer
   - Thương = Spear
   - Xe = Siege
6. **Base Stats** (white numbers on left side):
   - Võ = Attack
   - Thống = Command
   - Trí = Intelligence
   - Trị = Politics (may not be shown)
   - Tốc = Speed
   - Mị = Charm (may not be shown)
7. **Stat Growth** (green numbers in parentheses like +0.34):
   - These show how much the stat increases per level
8. **Innate Skill**: The skill shown with quality badge (S/A/B/C) and type (Chỉ huy=Command, Chủ động=Active, Bị động=Passive, etc.)

**Faction mapping:**
- Blue badge with "Ngụy" = wei
- Green badge with "Thục" = shu
- Red badge with "Ngô" = wu
- Yellow/brown badge with "Quần" = qun

**Important notes:**
- Base stats are the WHITE numbers (e.g., "20.46")
- Stat growth are the GREEN numbers in parentheses (e.g., "+0.34")
- Extract exact numerical values as shown
- If a field is not visible, use null

Return ONLY a valid JSON object with this structure:
{
    "name": {
        "cn": "<Chinese name if visible, otherwise null>",
        "vi": "<Vietnamese name>"
    },
    "faction": "<wei|shu|wu|qun>",
    "cost": <number 1-7>,
    "rarity": "<N|R|SR|SSR|SP>",
    "troop_compatibility": {
        "cavalry": "<S|A|B|C>",
        "shield": "<S|A|B|C>",
        "archer": "<S|A|B|C>",
        "spear": "<S|A|B|C>",
        "siege": "<S|A|B|C>"
    },
    "base_stats": {
        "attack": <number>,
        "command": <number>,
        "intelligence": <number>,
        "politics": <number or null>,
        "speed": <number>,
        "charm": <number or null>
    },
    "stat_growth": {
        "attack": <number>,
        "command": <number>,
        "intelligence": <number>,
        "politics": <number or null>,
        "speed": <number>,
        "charm": <number or null>
    },
    "innate_skill": {
        "name": "<skill name in Vietnamese>",
        "type": "<command|active|passive|pursuit|assault|troop|formation>",
        "quality": "<S|A|B|C>"
    }
}
"""


def encode_image(image_path: str) -> tuple[str, str]:
    """Encode image to base64 and determine media type."""
    path = Path(image_path)
    suffix = path.suffix.lower()

    media_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }

    media_type = media_types.get(suffix, 'image/png')

    with open(image_path, 'rb') as f:
        image_data = base64.standard_b64encode(f.read()).decode('utf-8')

    return image_data, media_type


def extract_general_info(image_path: str) -> dict:
    """Extract general information from screenshot using Claude Vision."""
    client = anthropic.Anthropic()

    image_data, media_type = encode_image(image_path)

    message = client.messages.create(
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
                        "text": EXTRACTION_PROMPT
                    }
                ]
            }
        ]
    )

    response_text = message.content[0].text.strip()

    # Extract JSON from response
    if '```json' in response_text:
        json_str = response_text.split('```json')[1].split('```')[0].strip()
    elif '```' in response_text:
        json_str = response_text.split('```')[1].split('```')[0].strip()
    else:
        json_str = response_text

    try:
        result = json.loads(json_str)

        # Remove "Cấp X" (level indicator) from skill names
        if result.get('innate_skill') and result['innate_skill'].get('name'):
            import re
            result['innate_skill']['name'] = re.sub(r'\s*Cấp\s*\d+\s*$', '', result['innate_skill']['name']).strip()

        return result
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        print(f"Raw response:\n{response_text}")
        return None


def process_single_image(image_path: str):
    """Process a single image and print results."""
    print(f"Processing: {image_path}")
    print("-" * 50)

    result = extract_general_info(image_path)

    if result:
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return result
    else:
        print("Failed to extract information")
        return None


def process_all_images(input_dir: str, output_file: str = None):
    """Process all images in a directory."""
    input_path = Path(input_dir)

    if not input_path.exists():
        print(f"Directory not found: {input_dir}")
        return

    image_extensions = {'.png', '.jpg', '.jpeg', '.webp'}
    images = [f for f in input_path.iterdir()
              if f.suffix.lower() in image_extensions]

    print(f"Found {len(images)} images to process")
    print("=" * 50)

    results = []
    for i, image_path in enumerate(images, 1):
        print(f"\n[{i}/{len(images)}] Processing: {image_path.name}")
        print("-" * 50)

        result = extract_general_info(str(image_path))
        if result:
            result['_source_file'] = image_path.name
            results.append(result)
            print(f"  Name: {result.get('name', {}).get('vi', 'Unknown')}")
            print(f"  Faction: {result.get('faction', 'Unknown')}")
            print(f"  Cost: {result.get('cost', 'Unknown')}")
        else:
            print("  Failed to extract")

    # Save results
    if output_file:
        output_path = Path(output_file)
    else:
        output_path = input_path.parent / 'generals_extracted.json'

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 50}")
    print(f"Processed: {len(results)}/{len(images)} images")
    print(f"Results saved to: {output_path}")

    return results


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python extract_generals.py <image_path>")
        print("  python extract_generals.py --all [input_dir] [output_file]")
        sys.exit(1)

    if sys.argv[1] == '--all':
        input_dir = sys.argv[2] if len(sys.argv) > 2 else '../screenshots/generals'
        output_file = sys.argv[3] if len(sys.argv) > 3 else None
        process_all_images(input_dir, output_file)
    else:
        process_single_image(sys.argv[1])


if __name__ == '__main__':
    main()
