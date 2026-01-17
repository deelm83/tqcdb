#!/usr/bin/env python3
"""
Scrape all character portraits from GamerSky's ROTK13 encyclopedia (148 pages)
and match them to our generals database.
"""

import requests
import json
import os
import time
import re
from bs4 import BeautifulSoup

# Paths
DATA_FILE = '../data/generals/all_generals.json'
OUTPUT_DIR = '../web/public/images/generals/full'
MAPPING_FILE = 'portrait_mapping.json'

BASE_URL = 'https://www.gamersky.com/handbook/201601/710878'


def get_character_info(page_num: int, session: requests.Session) -> tuple:
    """Fetch character name and image URL from encyclopedia page."""
    if page_num == 1:
        url = f"{BASE_URL}.shtml"
    else:
        url = f"{BASE_URL}_{page_num}.shtml"

    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'  # Force UTF-8 encoding
        html = response.text

        # Get character name from title - usually in format: 《三国志13》武将图鉴 三国群英一览_XXX-游民星空
        match = re.search(r'<title>[^_]+_([^-<]+)-游民星空', html)
        if match:
            char_name = match.group(1).strip()
        else:
            char_name = None

        # Find portrait image URL using regex
        img_match = re.search(r'(img1\.gamersky\.com/image2016[^"\']+image\d+\.jpg)', html)
        if img_match:
            image_url = 'http://' + img_match.group(1)
            # Remove _S suffix if present (thumbnail)
            image_url = re.sub(r'_S\.jpg$', '.jpg', image_url)
        else:
            image_url = None

        return char_name, image_url

    except Exception as e:
        print(f"  Error on page {page_num}: {e}")
        return None, None


def sanitize_filename(name: str) -> str:
    """Create a safe filename from the general's name."""
    safe = re.sub(r'[^\w\-]', '_', name)
    return safe.lower()


def download_image(url: str, filepath: str, session: requests.Session) -> bool:
    """Download an image and save it to filepath."""
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
        with open(filepath, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"  Download error: {e}")
        return False


def main():
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.gamersky.com/'
    })

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Step 1: Build character-to-image mapping by scraping all pages
    print("Step 1: Building portrait mapping from encyclopedia...")

    # Try to load existing mapping
    mapping = {}
    if os.path.exists(MAPPING_FILE):
        with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
            mapping = json.load(f)
        print(f"  Loaded {len(mapping)} existing mappings")

    # Scrape pages we haven't seen yet
    for page in range(1, 149):
        if any(v.get('page') == page for v in mapping.values()):
            continue  # Skip already processed pages

        char_name, image_url = get_character_info(page, session)

        if char_name and image_url:
            mapping[char_name] = {'url': image_url, 'page': page}
            print(f"  Page {page}: {char_name}")
        else:
            print(f"  Page {page}: No character found")

        time.sleep(0.2)

        # Save mapping periodically
        if page % 20 == 0:
            with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
                json.dump(mapping, f, ensure_ascii=False, indent=2)

    # Save final mapping
    with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)

    print(f"\nTotal mappings: {len(mapping)}")

    # Step 2: Match to our generals and download
    print("\nStep 2: Matching to generals and downloading...")

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        generals = json.load(f)

    downloaded = 0
    matched = 0

    for i, general in enumerate(generals):
        name_vi = general.get('name', {}).get('vi', f'general_{i}')
        name_cn = general.get('name', {}).get('cn', '')

        # Skip if already has full image
        if general.get('image_full'):
            filepath = f"../{general['image_full'].lstrip('/')}"
            if os.path.exists(filepath.replace('../web/public', OUTPUT_DIR.replace('../web/public', '..'))):
                matched += 1
                continue

        # Check if we have a mapping for this character
        char_mapping = mapping.get(name_cn)
        if not char_mapping:
            continue

        image_url = char_mapping['url']
        matched += 1

        # Generate filename
        filename = f"{i}_{sanitize_filename(name_vi)}.jpg"
        filepath = os.path.join(OUTPUT_DIR, filename)

        # Skip if already exists
        if os.path.exists(filepath) and os.path.getsize(filepath) > 50000:
            print(f"[{i+1}] {name_vi}... Already exists")
            general['image_full'] = f"/images/generals/full/{filename}"
            downloaded += 1
            continue

        print(f"[{i+1}] {name_vi} ({name_cn})...", end=' ')

        if download_image(image_url, filepath, session):
            size_kb = os.path.getsize(filepath) / 1024
            print(f"OK ({size_kb:.0f} KB)")
            general['image_full'] = f"/images/generals/full/{filename}"
            downloaded += 1
        else:
            print("Failed")

        time.sleep(0.3)

    # Save updated generals data
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(generals, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"Matched: {matched}/{len(generals)}")
    print(f"Downloaded: {downloaded}")


if __name__ == '__main__':
    main()
