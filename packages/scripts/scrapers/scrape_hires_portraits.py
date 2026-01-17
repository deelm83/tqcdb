#!/usr/bin/env python3
"""
Download high-resolution portraits from GamerSky with character name mappings
and update the generals data with image_full paths.
"""

import requests
import json
import os
import time
import re

# Paths
DATA_FILE = '../data/generals/all_generals.json'
OUTPUT_DIR = '../web/public/images/generals/full'

# Character name to image URL mapping (from GamerSky)
PORTRAIT_MAPPING = {
    # Wei Kingdom
    "曹操": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image001.jpg",
    "张辽": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image002.jpg",
    "夏侯渊": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image003.jpg",
    "夏侯惇": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image004.jpg",
    "李典": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image005.jpg",
    "邓艾": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image006.jpg",
    "许褚": "http://img1.gamersky.com/image2016/01/20160108_xdj_187_6/image003.jpg",
    "典韦": "http://img1.gamersky.com/image2016/01/20160108_xdj_187_6/image004.jpg",
    "庞德": "http://img1.gamersky.com/image2016/01/20160108_xdj_187_6/image002.jpg",

    # Shu Kingdom
    "刘备": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image007.jpg",
    "关羽": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image008.jpg",
    "张飞": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image009.jpg",
    "赵云": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image010.jpg",
    "姜维": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image011.jpg",
    "关平": "http://img1.gamersky.com/image2016/01/20160108_xdj_187_7/gamersky_01origin_01_2016181241A71.jpg",
    "魏延": "http://img1.gamersky.com/image2016/01/20160108_xdj_187_5/image002.jpg",
    "黄忠": "http://img1.gamersky.com/image2016/01/20160108_xdj_187_5/image003.jpg",
    "马超": "http://img1.gamersky.com/image2016/01/20160108_xdj_187_5/image004.jpg",

    # Wu Kingdom
    "孙权": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image012.jpg",
    "孙策": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image013.jpg",
    "孙坚": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image014.jpg",
    "周瑜": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image015.jpg",
    "陆逊": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image016.jpg",
    "甘宁": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image017.jpg",
    "太史慈": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image018.jpg",
    "吕蒙": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image019.jpg",
    "凌统": "http://img1.gamersky.com/image2016/01/20160108_xdj_187_5/image001.jpg",

    # Qun / Other
    "吕布": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image020.jpg",
    "袁绍": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image021.jpg",
    "董卓": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image022.jpg",
    "何进": "http://img1.gamersky.com/image2015/10/20151024xdj_1/image023.jpg",
    "文丑": "http://img1.gamersky.com/image2016/01/20160108_xdj_187_7/gamersky_02origin_03_201618124122A.jpg",
    "颜良": "http://img1.gamersky.com/image2016/01/20160108_xdj_187_6/image001.jpg",
}


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
        print(f"  Error: {e}")
        return False


def main():
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.gamersky.com/'
    })

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Load generals data
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        generals = json.load(f)

    print(f"Processing {len(generals)} generals...")
    print(f"Portrait mappings available: {len(PORTRAIT_MAPPING)}")

    downloaded = 0
    matched = 0
    not_found = []

    for i, general in enumerate(generals):
        name_vi = general.get('name', {}).get('vi', f'general_{i}')
        name_cn = general.get('name', {}).get('cn', '')

        # Check if we have a portrait mapping for this general
        image_url = PORTRAIT_MAPPING.get(name_cn)

        if not image_url:
            not_found.append(name_cn or name_vi)
            continue

        matched += 1

        # Generate filename
        filename = f"{i}_{sanitize_filename(name_vi)}.jpg"
        filepath = os.path.join(OUTPUT_DIR, filename)

        # Skip if already exists and is large enough
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
    print(f"Not found: {len(not_found)}")
    if not_found[:20]:
        print(f"Missing portraits for: {', '.join(not_found[:20])}")


if __name__ == '__main__':
    main()
