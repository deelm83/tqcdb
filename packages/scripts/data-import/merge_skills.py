#!/usr/bin/env python3
"""
Merge skills from wiki scrape with skills extracted from generals data.
This ensures we have all skills that appear in the game.
"""

import json
import os

# Paths
GENERALS_FILE = '../data/generals/all_generals.json'
SKILLS_FILE = '../data/skills/all_skills.json'

# Sino-Vietnamese dictionary (same as scrape_skills.py)
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
    '鉴': 'Giám', '识': 'Thức', '无': 'Vô', '当': 'Đương', '熊': 'Hùng', '骑': 'Kỵ',
    '豹': 'Báo', '强': 'Cường', '攻': 'Công', '破': 'Phá', '甲': 'Giáp', '百': 'Bách',
    '精': 'Tinh', '士': 'Sĩ', '气': 'Khí', '势': 'Thế', '如': 'Như', '虹': 'Hồng',
    '雷': 'Lôi', '霆': 'Đình', '钧': 'Quân', '一': 'Nhất', '夫': 'Phu', '关': 'Quan',
    '大': 'Đại', '戟': 'Kích', '龙': 'Long', '胆': 'Đảm', '伦': 'Luân', '智': 'Trí',
    '计': 'Kế', '出': 'Xuất', '奇': 'Kỳ', '谋': 'Mưu', '定': 'Định', '后': 'Hậu',
    '动': 'Động', '料': 'Liệu', '事': 'Sự', '运': 'Vận', '筹': 'Trù', '帷': 'Duy',
    '幄': 'Ác', '里': 'Lý', '外': 'Ngoại', '王': 'Vương', '佐': 'Tá', '清': 'Thanh',
    '雅': 'Nhã', '望': 'Vọng', '步': 'Bộ', '诗': 'Thi', '戮': 'Lục', '力': 'Lực',
    '上': 'Thượng', '国': 'Quốc', '花': 'Hoa', '容': 'Dung', '月': 'Nguyệt', '貌': 'Mạo',
    '常': 'Thường', '云': 'Vân', '影': 'Ảnh', '从': 'Tùng', '济': 'Tế', '贫': 'Bần',
    '好': 'Hảo', '施': 'Thí', '瞋': 'Sân', '目': 'Mục', '矛': 'Mâu', '倾': 'Khuynh',
    '心': 'Tâm', '英': 'Anh', '门': 'Môn', '女': 'Nữ', '溯': 'Tố', '摇': 'Dao',
    '橹': 'Lỗ', '经': 'Kinh', '略': 'Lược', '争': 'Tranh', '赴': 'Phó', '晓': 'Hiểu',
    '知': 'Tri', '良': 'Lương', '木': 'Mộc', '持': 'Trì', '重': 'Trọng', '窃': 'Thiết',
    '幸': 'Hạnh', '宠': 'Sủng', '凌': 'Lăng', '盛': 'Thịnh', '避': 'Tỵ', '金': 'Kim',
    '城': 'Thành', '汤': 'Thang', '池': 'Trì', '跃': 'Dược', '马': 'Mã', '镇': 'Trấn',
    '扼': 'Ách', '拒': 'Cự', '垂': 'Thùy', '物': 'Vật', '昭': 'Chiêu', '仁': 'Nhân',
    '德': 'Đức', '载': 'Tái', '舌': 'Thiệt', '群': 'Quần', '儒': 'Nho', '锦': 'Cẩm',
    '竭': 'Kiệt', '度': 'Độ', '陈': 'Trần', '仓': 'Thương', '毅': 'Nghị', '淹': 'Yêm',
    '七': 'Thất', '杯': 'Bôi', '蛇': 'Xà', '鬼': 'Quỷ', '车': 'Xa', '五': 'Ngũ',
    '轰': 'Oanh', '顶': 'Đỉnh', '黄': 'Hoàng', '泰': 'Thái', '平': 'Bình', '贵': 'Quý',
    '若': 'Nhược', '面': 'Diện', '埋': 'Mai', '伏': 'Phục', '四': 'Tứ', '楚': 'Sở',
    '歌': 'Ca', '二': 'Nhị', '抬': 'Đài', '棺': 'Quan', '练': 'Luyện', '策': 'Sách',
    '数': 'Số', '骇': 'Hãi', '境': 'Cảnh', '环': 'Hoàn', '虞': 'Ngu',
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


def main():
    # Load existing skills from wiki scrape
    with open(SKILLS_FILE, 'r', encoding='utf-8') as f:
        skills = json.load(f)

    # Create set of existing skill names
    existing_names = {s['name']['cn'] for s in skills}
    print(f"Skills from wiki scrape: {len(existing_names)}")

    # Load generals to extract their skills
    with open(GENERALS_FILE, 'r', encoding='utf-8') as f:
        generals = json.load(f)

    # Extract skills from generals
    added = 0
    for general in generals:
        general_name = general.get('name', {}).get('cn', '')

        # Process innate skill
        if general.get('innate_skill'):
            skill_name = general['innate_skill'].get('name', {}).get('cn', '')
            skill_name_vi = general['innate_skill'].get('name', {}).get('vi', '')

            if skill_name and skill_name not in existing_names:
                skill = {
                    'name': {
                        'cn': skill_name,
                        'vi': skill_name_vi or to_hanviet(skill_name)
                    },
                    'type': {
                        'id': 'unknown',
                        'name': {
                            'cn': 'unknown',
                            'vi': 'Không xác định'
                        }
                    },
                    'quality': 'S',
                    'trigger_rate': None,
                    'source_type': 'innate',
                    'associated_generals': [general_name] if general_name else []
                }
                skills.append(skill)
                existing_names.add(skill_name)
                added += 1

        # Process inherited skill
        if general.get('inherited_skill'):
            skill_name = general['inherited_skill'].get('name', {}).get('cn', '')
            skill_name_vi = general['inherited_skill'].get('name', {}).get('vi', '')

            if skill_name and skill_name not in existing_names:
                skill = {
                    'name': {
                        'cn': skill_name,
                        'vi': skill_name_vi or to_hanviet(skill_name)
                    },
                    'type': {
                        'id': 'unknown',
                        'name': {
                            'cn': 'unknown',
                            'vi': 'Không xác định'
                        }
                    },
                    'quality': 'S',
                    'trigger_rate': None,
                    'source_type': 'inherited',
                    'associated_generals': [general_name] if general_name else []
                }
                skills.append(skill)
                existing_names.add(skill_name)
                added += 1

    print(f"Skills added from generals: {added}")
    print(f"Total skills: {len(skills)}")

    # Clean up associated_generals field (remove invalid entries)
    for skill in skills:
        if 'associated_generals' in skill:
            # Keep only valid general names (short, Chinese characters)
            valid_generals = []
            for g in skill.get('associated_generals', []):
                if g and len(g) <= 6 and not any(x in g for x in ['战法', '图鉴', '历史', '配置', '宝物', '缘分']):
                    valid_generals.append(g)
            skill['associated_generals'] = valid_generals

    # Sort skills by name
    skills.sort(key=lambda s: s['name']['cn'])

    # Save updated skills
    with open(SKILLS_FILE, 'w', encoding='utf-8') as f:
        json.dump(skills, f, ensure_ascii=False, indent=2)

    print(f"\nSaved {len(skills)} skills to {SKILLS_FILE}")

    # Print summary by type
    from collections import Counter
    types = Counter(s['type']['id'] for s in skills)
    print("\nSkills by type:")
    for t, count in types.most_common():
        print(f"  {t}: {count}")


if __name__ == '__main__':
    main()
