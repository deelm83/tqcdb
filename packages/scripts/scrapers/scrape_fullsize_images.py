#!/usr/bin/env python3
"""
Download full-size general images from Bilibili wiki for detail pages
"""

import requests
import json
import time
import os
import re
from urllib.parse import unquote
from bs4 import BeautifulSoup

# Paths
DATA_FILE = '../data/generals/all_generals.json'
OUTPUT_DIR = '../web/public/images/generals'

def get_fullsize_image_url(wiki_url: str, session: requests.Session) -> tuple:
    """Fetch the full-size portrait image URL from a general's wiki page."""
    try:
        response = session.get(wiki_url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find thumbnail images
        images = soup.select('img')

        for img in images:
            src = img.get('src', '') or img.get('data-src', '')

            # Look for the portrait thumbnail pattern
            if 'patchwiki.biligame.com/images/sgzzlb/thumb' in src and ('立绘' in src or '.bmp' in src):
                # Convert thumbnail URL to full-size URL
                # Thumbnail: .../thumb/d/d3/hash.bmp/300px-name.bmp.png
                # Full-size: .../d/d3/hash.bmp

                # Extract the path before /thumb/ and after /thumb/
                match = re.search(r'(https://patchwiki\.biligame\.com/images/sgzzlb)/thumb/([a-z0-9]/[a-z0-9]+/[a-z0-9]+\.bmp)', src)
                if match:
                    base_url = match.group(1)
                    path = match.group(2)
                    fullsize_url = f"{base_url}/{path}"
                    return fullsize_url, src  # Return both full-size and thumbnail

        return None, None
    except Exception as e:
        print(f"  Error: {e}")
        return None, None


def download_image(url: str, filepath: str, session: requests.Session) -> bool:
    """Download an image and save it to filepath."""
    try:
        response = session.get(url, timeout=60)  # Longer timeout for larger files
        response.raise_for_status()

        with open(filepath, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"  Download error: {e}")
        return False


def sanitize_filename(name: str) -> str:
    """Create a safe filename from the general's name."""
    safe = re.sub(r'[^\w\-]', '_', name)
    return safe.lower()


def main():
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    })

    # Create output directory for full-size images
    fullsize_dir = os.path.join(OUTPUT_DIR, 'full')
    os.makedirs(fullsize_dir, exist_ok=True)

    # Load generals data
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        generals = json.load(f)

    print(f"Processing {len(generals)} generals for full-size images...")

    success_count = 0
    failed = []

    for i, general in enumerate(generals):
        name_vi = general.get('name', {}).get('vi', f'general_{i}')
        wiki_url = general.get('wiki_url')

        # Generate filename
        filename = f"{i}_{sanitize_filename(name_vi)}.bmp"
        filepath = os.path.join(fullsize_dir, filename)

        # Skip if already downloaded
        if os.path.exists(filepath) and os.path.getsize(filepath) > 100000:  # > 100KB
            print(f"[{i+1}/{len(generals)}] {name_vi}... Already exists")
            general['image_full'] = f"/images/generals/full/{filename}"
            success_count += 1
            continue

        print(f"[{i+1}/{len(generals)}] {name_vi}...", end=' ')

        if not wiki_url:
            print("No wiki URL")
            failed.append(name_vi)
            continue

        # Get full-size image URL
        fullsize_url, thumb_url = get_fullsize_image_url(wiki_url, session)

        if not fullsize_url:
            print("No full-size image found")
            failed.append(name_vi)
            continue

        # Download full-size image
        if download_image(fullsize_url, filepath, session):
            size_kb = os.path.getsize(filepath) / 1024
            print(f"OK ({size_kb:.0f} KB)")
            general['image_full'] = f"/images/generals/full/{filename}"
            success_count += 1
        else:
            print("Failed")
            failed.append(name_vi)

        time.sleep(0.5)  # Be polite

    # Save updated generals data
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(generals, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"Downloaded: {success_count}/{len(generals)}")
    print(f"Failed: {len(failed)}")
    if failed:
        print(f"Failed: {', '.join(failed[:10])}{'...' if len(failed) > 10 else ''}")


if __name__ == '__main__':
    main()
