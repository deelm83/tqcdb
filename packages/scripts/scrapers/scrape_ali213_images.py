#!/usr/bin/env python3
"""
Download general images from ali213.net for missing images
"""

import requests
import json
import time
import os
import re

# Paths
DATA_FILE = '../data/generals/all_generals.json'
OUTPUT_DIR = '../web/public/images/generals'

# Image mapping from ali213.net (Chinese name -> image URL)
ALI213_IMAGES = {
    "郝昭": "http://img1.ali213.net/glpic/upload/20200529/846478CA.jpg",
    "鲁肃": "http://img1.ali213.net/glpic/upload/20200529/434EE137.jpg",
    "贾诩": "http://img1.ali213.net/glpic/upload/20200529/170E76EF.jpg",
    "张飞": "http://img1.ali213.net/glpic/upload/20200529/EBBC65F2.jpg",
    "关羽": "http://img1.ali213.net/glpic/upload/20200529/B4B69F9B.jpg",
    "刘备": "http://img1.ali213.net/glpic/upload/20200529/A0F5C2C3.jpg",
    "孙权": "http://img1.ali213.net/glpic/upload/20200529/47DA805B.jpg",
    "曹操": "http://imgs.ali213.net/Spe/newzt/2020-08-06/4a2ae471-9c48-93af-244f-481effd83a49.jpg",
    "荀攸": "http://img1.ali213.net/glpic/upload/20200529/9487EA21.jpg",
    "姜维": "http://img1.ali213.net/glpic/upload/20200529/BD944802.jpg",
    "高览": "http://img1.ali213.net/glpic/upload/20200529/DAAD91F4.jpg",
    "张春华": "http://img1.ali213.net/glpic/upload/20200529/A58F829D.jpg",
    "严颜": "http://img1.ali213.net/glpic/upload/20200529/108FE1D7.jpg",
    "袁术": "http://img1.ali213.net/glpic/upload/20200529/4E7F5336.jpg",
    "吕布": "http://img1.ali213.net/glpic/upload/20200529/3B1F7253.jpg",
    "赵云": "http://img1.ali213.net/glpic/upload/20200529/42A2AD11.jpg",
    "诸葛亮": "http://img1.ali213.net/glpic/upload/20200529/2250F1B9.jpg",
    "陆逊": "http://img1.ali213.net/glpic/upload/20200529/476F0A85.jpg",
    "周泰": "http://img1.ali213.net/glpic/upload/20200529/22130845.jpg",
    "陆抗": "http://img1.ali213.net/glpic/upload/20200529/E3CB69B7.jpg",
    "蒋琬": "http://img1.ali213.net/glpic/upload/20200529/544417C8.jpg",
    "凌统": "http://img1.ali213.net/glpic/upload/20200529/1D23C251.jpg",
    "木鹿大王": "http://img1.ali213.net/glpic/upload/20200529/120F0A4E.jpg",
    "司马懿": "http://img1.ali213.net/glpic/upload/20200529/AA684427.jpg",
    "庞统": "http://img1.ali213.net/glpic/upload/20200529/12875CF1.jpg",
    "孙尚香": "http://img1.ali213.net/glpic/upload/20200529/B9945E1B.jpg",
    "张纮": "http://img1.ali213.net/glpic/upload/20200529/878F5996.jpg",
    "马云禄": "http://img1.ali213.net/glpic/upload/20200529/D54A01BC.jpg",
    "张姬": "http://img1.ali213.net/glpic/upload/20200529/1ED88E3D.jpg",
    "陈宫": "http://img1.ali213.net/glpic/upload/20200529/6732E5F5.jpg",
    "张辽": "http://img1.ali213.net/glpic/upload/20200529/9E956C23.jpg",
    "周瑜": "http://img1.ali213.net/glpic/upload/20200529/F34E5244.jpg",
    "张昭": "http://img1.ali213.net/glpic/upload/20200601/56029296.jpg",
    "董卓": "http://img1.ali213.net/glpic/upload/20200601/6A4DB6FE.jpg",
    "马超": "http://img1.ali213.net/glpic/upload/20200529/07F83C9A.jpg",
    "庞德": "http://img1.ali213.net/glpic/upload/20200529/A1946558.jpg",
    "钟会": "http://img1.ali213.net/glpic/upload/20200529/D8B09174.jpg",
    "郭嘉": "http://img1.ali213.net/glpic/upload/20200529/4C51C9B4.jpg",
    "吕蒙": "http://img1.ali213.net/glpic/upload/20200529/7260C745.jpg",
    "太史慈": "http://img1.ali213.net/glpic/upload/20200529/D2B3E869.jpg",
    "孙策": "http://img1.ali213.net/glpic/upload/20200529/6E02C029.jpg",
    "孙坚": "http://img1.ali213.net/glpic/upload/20200529/699C1D15.jpg",
    "黄忠": "http://img1.ali213.net/glpic/upload/20200601/3E0BC2DE.jpg",
    "甘宁": "http://img1.ali213.net/glpic/upload/20200601/F51EA732.jpg",
    "夏侯惇": "http://img1.ali213.net/glpic/upload/20200601/B5916293.jpg",
    "大乔": "http://img1.ali213.net/glpic/upload/20200601/A0324C84.jpg",
    "左慈": "http://img1.ali213.net/glpic/upload/20200601/5204F0B9.jpg",
    "张角": "http://img1.ali213.net/glpic/upload/20200601/1D40C95E.jpg",
    "于吉": "http://img1.ali213.net/glpic/upload/20200601/B06B0DF1.jpg",
    "司马徽": "http://img1.ali213.net/glpic/upload/20200601/12F34D4C.jpg",
    "颜良": "http://img1.ali213.net/glpic/upload/20200601/EE379F23.jpg",
    "华佗": "http://img1.ali213.net/glpic/upload/20200601/58DC3B11.jpg",
    "黄月英": "http://img1.ali213.net/glpic/upload/20200601/748D01EF.jpg",
    "法正": "http://img1.ali213.net/glpic/upload/20200601/64F837D0.jpg",
    "典韦": "http://img1.ali213.net/glpic/upload/20200601/918809B9.jpg",
    "徐晃": "http://img1.ali213.net/glpic/upload/20200601/4F1CA0F0.jpg",
    "袁绍": "http://img1.ali213.net/glpic/upload/20200601/FF091E83.jpg",
    "貂蝉": "http://img1.ali213.net/glpic/upload/20200601/6C8F17B2.jpg",
    "蔡文姬": "http://img1.ali213.net/glpic/upload/20200601/34A06670.jpg",
    "孟获": "http://img1.ali213.net/glpic/upload/20200601/D7B31699.jpg",
    "文丑": "http://img1.ali213.net/glpic/upload/20200601/96166DBA.jpg",
    "王平": "http://img1.ali213.net/glpic/upload/20200601/B8E80BC9.jpg",
    "公孙瓒": "http://img1.ali213.net/glpic/upload/20200601/7F2D9385.jpg",
    "马腾": "http://img1.ali213.net/glpic/upload/20200601/EF978F4A.jpg",
    "曹纯": "http://img1.ali213.net/glpic/upload/20200601/F250C646.jpg",
    "陈到": "http://img1.ali213.net/glpic/upload/20200601/FFF649CD.jpg",
    "徐庶": "http://img1.ali213.net/glpic/upload/20200601/FFC70163.jpg",
    "甄姬": "http://img1.ali213.net/glpic/upload/20200601/BC42DB58.jpg",
    "张郃": "http://img1.ali213.net/glpic/upload/20200601/7ADEFCD9.jpg",
    "小乔": "http://img1.ali213.net/glpic/upload/20200601/1C2E08BD.jpg",
    "许褚": "http://img1.ali213.net/glpic/upload/20200601/4A05E936.jpg",
    "华雄": "http://img1.ali213.net/glpic/upload/20200601/875B581D.jpg",
    "荀彧": "http://img1.ali213.net/glpic/upload/20200601/F82EA9BB.jpg",
    "程昱": "http://img1.ali213.net/glpic/upload/20200601/ED2A804E.jpg",
    "程普": "http://img1.ali213.net/glpic/upload/20200601/B101ACF9.jpg",
    "夏侯渊": "http://img1.ali213.net/glpic/upload/20200601/61A2BEE9.jpg",
    "曹仁": "http://img1.ali213.net/glpic/upload/20200601/7070F2B9.jpg",
    "邓艾": "http://img1.ali213.net/glpic/upload/20200601/3BEF1310.jpg",
    "乐进": "http://img1.ali213.net/glpic/upload/20200601/2B2FD3DE.jpg",
    "于禁": "http://img1.ali213.net/glpic/upload/20200601/5BE82ACA.jpg",
    "吕绮玲": "http://img1.ali213.net/glpic/upload/20200601/DC7AC8E9.jpg",
    "祝融夫人": "http://img1.ali213.net/glpic/upload/20200601/7BB35588.jpg",
    "李儒": "http://img1.ali213.net/glpic/upload/20200601/B98E048D.jpg",
    "黄盖": "http://img1.ali213.net/glpic/upload/20200601/D7FB5FD0.jpg",
    "陈群": "http://img1.ali213.net/glpic/upload/20200601/1087879D.jpg",
    "曹植": "http://img1.ali213.net/glpic/upload/20200601/7B554490.jpg",
    "曹丕": "http://img1.ali213.net/glpic/upload/20200601/4C29BD75.jpg",
    "高顺": "http://img1.ali213.net/glpic/upload/20200601/282824E5.jpg",
    "兀突骨": "http://img1.ali213.net/glpic/upload/20200601/5A5E0EF5.jpg",
    "田丰": "http://img1.ali213.net/glpic/upload/20200601/B78EA911.jpg",
    "魏延": "http://img1.ali213.net/glpic/upload/20200601/23F90A73.jpg",
    "沮授": "http://img1.ali213.net/glpic/upload/20200601/F2391DF4.jpg",
    "关兴": "http://img1.ali213.net/glpic/upload/20200601/C7E82514.jpg",
    "张苞": "http://img1.ali213.net/glpic/upload/20200601/8D20AF47.jpg",
    "关银屏": "http://img1.ali213.net/glpic/upload/20200601/F8A0E5E1.jpg",
    "朵思大王": "http://img1.ali213.net/glpic/upload/20200601/E4D9C531.jpg",
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
        print(f"  Error downloading: {e}")
        return False


def main():
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    })

    # Load generals data
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        generals = json.load(f)

    print(f"Processing {len(generals)} generals...")

    downloaded = 0
    already_have = 0
    not_found = 0

    for i, general in enumerate(generals):
        name_vi = general.get('name', {}).get('vi', f'general_{i}')
        name_cn = general.get('name', {}).get('cn', '')

        # Skip if already has image
        if general.get('image'):
            filepath = f"../{general['image'].lstrip('/')}"
            if os.path.exists(filepath.replace('../web/public', OUTPUT_DIR.replace('../web/public', '..'))):
                already_have += 1
                continue

        # Check if we have this general in ali213 mapping
        image_url = ALI213_IMAGES.get(name_cn)

        if not image_url:
            # Try without SP prefix
            if name_cn.startswith('sp') or name_cn.startswith('SP'):
                base_name = name_cn[2:]
                image_url = ALI213_IMAGES.get(base_name)

        if not image_url:
            print(f"[{i+1}] {name_vi} - No image in ali213")
            not_found += 1
            continue

        # Generate filename
        filename = f"{i}_{sanitize_filename(name_vi)}.jpg"
        filepath = os.path.join(OUTPUT_DIR, filename)

        print(f"[{i+1}] {name_vi}...", end=' ')

        if download_image(image_url, filepath, session):
            print("OK")
            general['image'] = f"/images/generals/{filename}"
            downloaded += 1
        else:
            print("Failed")
            not_found += 1

        time.sleep(0.2)

    # Save updated generals data
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(generals, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"Already had: {already_have}")
    print(f"Downloaded: {downloaded}")
    print(f"Not found: {not_found}")


if __name__ == '__main__':
    main()
