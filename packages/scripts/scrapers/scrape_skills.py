#!/usr/bin/env python3
"""
Scrape all skills (战法) from Bilibili wiki for Three Kingdoms Tactics
"""

import requests
import json
import time
import os
import re
from bs4 import BeautifulSoup

# Paths
OUTPUT_DIR = '../data/skills'
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'all_skills.json')

# Skill category URLs
SKILL_CATEGORIES = {
    'command': 'https://wiki.biligame.com/sgzzlb/指挥战法',      # 指挥战法
    'active': 'https://wiki.biligame.com/sgzzlb/主动战法',       # 主动战法
    'assault': 'https://wiki.biligame.com/sgzzlb/突击战法',      # 突击战法
    'passive': 'https://wiki.biligame.com/sgzzlb/被动战法',      # 被动战法
    'formation': 'https://wiki.biligame.com/sgzzlb/阵法战法',    # 阵法战法
    'troop': 'https://wiki.biligame.com/sgzzlb/兵种战法',        # 兵种战法
    'internal': 'https://wiki.biligame.com/sgzzlb/内政战法',     # 内政战法
}

# Vietnamese translations for skill types
SKILL_TYPE_VI = {
    'command': 'Chỉ huy',
    'active': 'Chủ động',
    'assault': 'Đột kích',
    'passive': 'Bị động',
    'formation': 'Trận pháp',
    'troop': 'Binh chủng',
    'internal': 'Nội chính',
}

# Sino-Vietnamese dictionary for skill names
HANVIET_DICT = {
    '神': 'Thần', '机': 'Cơ', '莫': 'Mạc', '测': 'Trắc', '伪': 'Ngụy', '书': 'Thư',
    '相': 'Tương', '间': 'Gian', '沉': 'Trầm', '沙': 'Sa', '决': 'Quyết', '水': 'Thủy',
    '万': 'Vạn', '箭': 'Tiễn', '齐': 'Tề', '发': 'Phát', '焰': 'Diễm', '逐': 'Trục',
    '风': 'Phong', '飞': 'Phi', '兵': 'Binh', '锋': 'Phong', '威': 'Uy', '震': 'Chấn',
    '华': 'Hoa', '夏': 'Hạ', '横': 'Hoành', '扫': 'Tảo', '千': 'Thiên', '军': 'Quân',
    '临': 'Lâm', '战': 'Chiến', '先': 'Tiên', '登': 'Đăng', '所': 'Sở', '向': 'Hướng',
    '披': 'Phi', '靡': 'Mỹ', '乱': 'Loạn', '世': 'Thế', '奸': 'Gian', '雄': 'Hùng',
    '梦': 'Mộng', '中': 'Trung', '弑': 'Thí', '臣': 'Thần', '古': 'Cổ', '之': 'Chi',
    '恶': 'Ác', '来': 'Lai', '鹰': 'Ưng', '视': 'Thị', '狼': 'Lang', '顾': 'Cố',
    '用': 'Dụng', '武': 'Vũ', '通': 'Thông', '十': 'Thập', '胜': 'Thắng', '败': 'Bại',
    '江': 'Giang', '天': 'Thiên', '长': 'Trường', '南': 'Nam', '蛮': 'Man', '渠': 'Cừ',
    '魁': 'Khôi', '挫': 'Tỏa', '锐': 'Nhuệ', '守': 'Thủ', '而': 'Nhi', '必': 'Tất',
    '固': 'Cố', '妙': 'Diệu', '算': 'Toán', '折': 'Chiết', '冲': 'Xung', '御': 'Ngự',
    '侮': 'Vũ', '将': 'Tướng', '行': 'Hành', '其': 'Kỳ', '疾': 'Tật', '勇': 'Dũng',
    '者': 'Giả', '得': 'Đắc', '前': 'Tiền', '成': 'Thành', '虑': 'Lự', '克': 'Khắc',
    '敌': 'Địch', '制': 'Chế', '速': 'Tốc', '乘': 'Thừa', '利': 'Lợi', '射': 'Xạ',
    '陷': 'Hãm', '阵': 'Trận', '突': 'Đột', '袭': 'Tập', '虎': 'Hổ', '痴': 'Si',
    '死': 'Tử', '不': 'Bất', '退': 'Thoái', '忠': 'Trung', '义': 'Nghĩa', '烈': 'Liệt',
    '文': 'Văn', '双': 'Song', '全': 'Toàn', '魅': 'Mị', '惑': 'Hoặc', '驱': 'Khu',
    '直': 'Trực', '入': 'Nhập', '合': 'Hợp', '聚': 'Tụ', '众': 'Chúng', '刚': 'Cương',
    '屈': 'Khuất', '绝': 'Tuyệt', '地': 'Địa', '反': 'Phản', '击': 'Kích', '槊': 'Sóc',
    '血': 'Huyết', '纵': 'Túng', '才': 'Tài', '辩': 'Biện', '捷': 'Tiệp', '火': 'Hỏa',
    '烧': 'Thiêu', '连': 'Liên', '营': 'Doanh', '草': 'Thảo', '船': 'Thuyền', '借': 'Tá',
    '东': 'Đông', '赤': 'Xích', '壁': 'Bích', '怒': 'Nộ', '鞭': 'Tiên', '断': 'Đoạn',
    '流': 'Lưu', '以': 'Dĩ', '治': 'Trị', '工': 'Công', '整': 'Chỉnh', '暗': 'Ám',
    '难': 'Nan', '防': 'Phòng', '诱': 'Dụ', '深': 'Thâm', '符': 'Phù', '命': 'Mệnh',
    '自': 'Tự', '立': 'Lập', '白': 'Bạch', '毦': 'Nhị', '弓': 'Cung', '腰': 'Yêu',
    '姬': 'Cơ', '青': 'Thanh', '囊': 'Nang', '围': 'Vi', '师': 'Sư', '阙': 'Khuyết',
    '鉴': 'Giám', '识': 'Thức', '无': 'Vô', '当': 'Đương', '飞': 'Phi', '熊': 'Hùng',
    '虎': 'Hổ', '骑': 'Kỵ', '豹': 'Báo', '强': 'Cường', '攻': 'Công', '破': 'Phá',
    '甲': 'Giáp', '百': 'Bách', '战': 'Chiến', '精': 'Tinh', '锐': 'Nhuệ', '士': 'Sĩ',
    '气': 'Khí', '势': 'Thế', '如': 'Như', '虹': 'Hồng', '雷': 'Lôi', '霆': 'Đình',
    '万': 'Vạn', '钧': 'Quân', '一': 'Nhất', '夫': 'Phu', '关': 'Quan', '大': 'Đại',
    '戟': 'Kích', '无': 'Vô', '双': 'Song', '龙': 'Long', '胆': 'Đảm', '义': 'Nghĩa',
    '绝': 'Tuyệt', '伦': 'Luân', '智': 'Trí', '计': 'Kế', '百': 'Bách', '出': 'Xuất',
    '奇': 'Kỳ', '谋': 'Mưu', '定': 'Định', '后': 'Hậu', '动': 'Động', '料': 'Liệu',
    '事': 'Sự', '如': 'Như', '神': 'Thần', '运': 'Vận', '筹': 'Trù', '帷': 'Duy',
    '幄': 'Ác', '决': 'Quyết', '胜': 'Thắng', '里': 'Lý', '外': 'Ngoại',
}


def to_hanviet(chinese_text):
    """Convert Chinese text to Sino-Vietnamese (Hán-Việt)."""
    result = []
    for char in chinese_text:
        if char in HANVIET_DICT:
            result.append(HANVIET_DICT[char])
        else:
            result.append(char)
    return ' '.join(result)


def scrape_skill_list(url: str, category: str, session: requests.Session) -> list:
    """Scrape skill list from a category page."""
    skills = []

    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find skill table
        tables = soup.find_all('table')

        for table in tables:
            rows = table.find_all('tr')

            for row in rows[1:]:  # Skip header row
                cells = row.find_all(['td', 'th'])
                if len(cells) < 3:
                    continue

                # Extract skill name - usually in first or second cell
                name_cell = None
                for cell in cells[:3]:
                    link = cell.find('a')
                    if link and link.get('title'):
                        name_cell = cell
                        break

                if not name_cell:
                    continue

                link = name_cell.find('a')
                skill_name = link.get('title', '').strip() if link else ''
                skill_url = link.get('href', '') if link else ''

                if not skill_name:
                    continue

                # Try to extract quality/rarity
                quality = 'S'  # Default
                for cell in cells:
                    text = cell.get_text().strip()
                    if text in ['S', 'A', 'B', 'C']:
                        quality = text
                        break

                # Try to extract trigger rate
                trigger_rate = None
                for cell in cells:
                    text = cell.get_text().strip()
                    match = re.search(r'(\d+)%', text)
                    if match:
                        trigger_rate = int(match.group(1))
                        break

                # Try to extract source type (innate/inherited)
                source_type = 'unknown'
                for cell in cells:
                    text = cell.get_text().strip()
                    if '自带' in text or '固有' in text:
                        source_type = 'innate'
                        break
                    elif '传承' in text or '继承' in text:
                        source_type = 'inherited'
                        break

                skill = {
                    'name': {
                        'cn': skill_name,
                        'vi': to_hanviet(skill_name)
                    },
                    'type': {
                        'id': category,
                        'name': {
                            'cn': category,
                            'vi': SKILL_TYPE_VI.get(category, category)
                        }
                    },
                    'quality': quality,
                    'trigger_rate': trigger_rate,
                    'source_type': source_type,
                    'wiki_url': f"https://wiki.biligame.com{skill_url}" if skill_url.startswith('/') else skill_url
                }

                # Avoid duplicates
                if not any(s['name']['cn'] == skill_name for s in skills):
                    skills.append(skill)
                    print(f"    {skill_name} ({skill['name']['vi']})")

    except Exception as e:
        print(f"  Error scraping {url}: {e}")

    return skills


def scrape_skill_details(skill: dict, session: requests.Session) -> dict:
    """Scrape detailed information for a skill from its wiki page."""
    if not skill.get('wiki_url'):
        return skill

    try:
        response = session.get(skill['wiki_url'], timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')

        # Try to find description
        desc_patterns = ['效果', '描述', '说明']
        for pattern in desc_patterns:
            header = soup.find(['th', 'td'], string=re.compile(pattern))
            if header:
                next_cell = header.find_next_sibling('td')
                if next_cell:
                    skill['description'] = {
                        'cn': next_cell.get_text().strip()
                    }
                    break

        # Try to find associated generals
        generals = []
        general_links = soup.select('a[href*="/sgzzlb/"]')
        for link in general_links:
            href = link.get('href', '')
            if '/sgzzlb/' in href and '战法' not in href:
                general_name = link.get_text().strip()
                if general_name and len(general_name) <= 5:  # Filter out non-general links
                    generals.append(general_name)

        if generals:
            skill['associated_generals'] = list(set(generals))[:10]  # Limit to 10

    except Exception as e:
        pass  # Silently skip errors for detail pages

    return skill


def main():
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    })

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    all_skills = []

    print("Scraping skills from Bilibili Wiki...")
    print("=" * 50)

    for category, url in SKILL_CATEGORIES.items():
        print(f"\n[{SKILL_TYPE_VI[category]}] {category}...")
        skills = scrape_skill_list(url, category, session)
        all_skills.extend(skills)
        print(f"  Found {len(skills)} skills")
        time.sleep(0.5)

    print(f"\n{'=' * 50}")
    print(f"Total skills scraped: {len(all_skills)}")

    # Optionally scrape details for each skill
    print("\nScraping skill details...")
    for i, skill in enumerate(all_skills):
        if i % 20 == 0:
            print(f"  Processing {i}/{len(all_skills)}...")
        scrape_skill_details(skill, session)
        time.sleep(0.2)

    # Save to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_skills, f, ensure_ascii=False, indent=2)

    print(f"\nSaved {len(all_skills)} skills to {OUTPUT_FILE}")


if __name__ == '__main__':
    main()
