#!/usr/bin/env python3
"""
Scrape and download general images from Bilibili wiki
"""

import requests
import json
import time
import os
import re
from urllib.parse import unquote
from bs4 import BeautifulSoup
from typing import Optional

# Paths
DATA_FILE = '../data/generals/all_generals.json'
OUTPUT_DIR = '../web/public/images/generals'

def get_image_url(wiki_url: str, session: requests.Session) -> Optional[str]:
    """Fetch the portrait image URL from a general's wiki page."""
    try:
        response = session.get(wiki_url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Look for images with the portrait pattern in src or data-src
        images = soup.select('img')

        for img in images:
            # Check both src and data-src attributes
            src = img.get('src', '') or img.get('data-src', '')

            # Look for the standard portrait image pattern: contains '立绘' (portrait) in the URL
            # Pattern: https://patchwiki.biligame.com/images/sgzzlb/thumb/.../300px-立绘-普通-NAME.bmp.png
            if 'patchwiki.biligame.com/images/sgzzlb' in src and ('立绘' in src or '.bmp' in src):
                return src

        # Second pass: look for any character-specific image (not logo)
        for img in images:
            src = img.get('src', '') or img.get('data-src', '')
            if 'patchwiki.biligame.com/images/sgzzlb/thumb' in src and 'logo' not in src.lower():
                return src

        return None
    except Exception as e:
        print(f"  Error fetching {wiki_url}: {e}")
        return None


def download_image(url: str, filepath: str, session: requests.Session) -> bool:
    """Download an image and save it to filepath."""
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()

        with open(filepath, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        return False


def sanitize_filename(name: str) -> str:
    """Create a safe filename from the general's name."""
    # Remove special characters and spaces
    safe = re.sub(r'[^\w\-]', '_', name)
    return safe.lower()


def main():
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    })

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Load generals data
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        generals = json.load(f)

    print(f"Processing {len(generals)} generals...")

    success_count = 0
    failed = []

    for i, general in enumerate(generals):
        name_vi = general.get('name', {}).get('vi', f'general_{i}')
        name_cn = general.get('name', {}).get('cn', '')
        wiki_url = general.get('wiki_url')

        print(f"[{i+1}/{len(generals)}] {name_vi}...", end=' ')

        if not wiki_url:
            print("No wiki URL, skipping")
            failed.append(name_vi)
            continue

        # Generate filename
        filename = f"{i}_{sanitize_filename(name_vi)}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)

        # Skip if already downloaded
        if os.path.exists(filepath):
            print("Already exists")
            general['image'] = f"/images/generals/{filename}"
            success_count += 1
            continue

        # Get image URL from wiki page
        image_url = get_image_url(wiki_url, session)

        if not image_url:
            print("No image found")
            failed.append(name_vi)
            continue

        # Download image
        if download_image(image_url, filepath, session):
            print(f"OK")
            general['image'] = f"/images/generals/{filename}"
            success_count += 1
        else:
            print("Download failed")
            failed.append(name_vi)

        # Be polite to the server
        time.sleep(0.3)

    # Save updated generals data
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(generals, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"Downloaded: {success_count}/{len(generals)}")
    print(f"Failed: {len(failed)}")
    if failed:
        print(f"Failed generals: {', '.join(failed[:10])}{'...' if len(failed) > 10 else ''}")


if __name__ == '__main__':
    main()
