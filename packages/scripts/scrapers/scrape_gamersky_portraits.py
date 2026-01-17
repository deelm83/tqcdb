#!/usr/bin/env python3
"""
Download high-resolution ROTK13 portraits from GamerSky
These portraits are used in 三国志战略版 (Three Kingdoms Tactics)
"""

import requests
import os
import time

# Output directory
OUTPUT_DIR = '../web/public/images/generals/hires'

def main():
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.gamersky.com/'
    })

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Image URL pattern from GamerSky
    # Images are numbered with odd numbers: 001, 003, 005, etc.
    # 11 pages x 8 images per page = ~88 images (up to image175)
    base_url = 'http://img1.gamersky.com/image2016/01/20160130_ax_156_7/'

    downloaded = 0
    failed = 0

    # Download images from 001 to 180 (odd numbers only)
    for i in range(1, 181, 2):
        filename = f'image{i:03d}.jpg'
        url = f'{base_url}{filename}'
        filepath = os.path.join(OUTPUT_DIR, filename)

        # Skip if already exists
        if os.path.exists(filepath) and os.path.getsize(filepath) > 10000:
            print(f"[{i:03d}] Already exists")
            downloaded += 1
            continue

        print(f"[{i:03d}] Downloading...", end=' ')

        try:
            response = session.get(url, timeout=30)
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                size_kb = len(response.content) / 1024
                print(f"OK ({size_kb:.0f} KB)")
                downloaded += 1
            else:
                print(f"HTTP {response.status_code}")
                failed += 1
        except Exception as e:
            print(f"Error: {e}")
            failed += 1

        time.sleep(0.3)

    print(f"\n{'='*50}")
    print(f"Downloaded: {downloaded}")
    print(f"Failed: {failed}")


if __name__ == '__main__':
    main()
