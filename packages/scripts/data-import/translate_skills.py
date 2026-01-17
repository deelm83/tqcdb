#!/usr/bin/env python3
"""
Translate skill data from Chinese to Vietnamese.
"""

import json
import re

SKILLS_FILE = '../data/skills/all_skills.json'

# Game-specific translations (Chinese -> Vietnamese)
# Format: (pattern, replacement) - using tuples to preserve order
TRANSLATIONS = [
    # Combat damage terms
    ('伤害率', 'tỉ lệ sát thương '),
    ('兵刃攻击', 'sát thương vật lý'),
    ('谋略攻击', 'sát thương mưu lược'),
    ('兵刃伤害', 'sát thương vật lý'),
    ('谋略伤害', 'sát thương mưu lược'),
    ('伤害', 'sát thương'),
    ('攻击', 'tấn công'),
    ('防御', 'phòng ngự'),
    ('治疗', 'hồi phục'),
    ('恢复', 'hồi phục'),
    ('兵力', 'binh lực'),
    ('武力', 'vũ lực'),
    ('智力', 'trí lực'),
    ('统率', 'thống suất'),
    ('速度', 'tốc độ'),

    # Target terms
    ('敌军全体', 'toàn bộ địch '),
    ('敌军群体', 'nhóm địch '),
    ('敌军单体', 'đơn thể địch '),
    ('敌军随机', 'địch ngẫu nhiên '),
    ('敌军', 'địch '),
    ('我军全体', 'toàn bộ quân ta '),
    ('我军群体', 'nhóm quân ta '),
    ('我军单体', 'đơn thể quân ta '),
    ('我军', 'quân ta '),
    ('友军', 'đồng minh '),
    ('自身', 'bản thân '),
    ('全体', 'toàn bộ '),
    ('群体', 'nhóm '),
    ('单体', 'đơn thể '),
    ('随机', 'ngẫu nhiên '),

    # Status effects
    ('溃逃状态', 'trạng thái hoảng loạn'),
    ('混乱状态', 'trạng thái hỗn loạn'),
    ('犹豫状态', 'trạng thái do dự'),
    ('怯战状态', 'trạng thái khiếp chiến'),
    ('中毒状态', 'trạng thái trúng độc'),
    ('虚弱状态', 'trạng thái suy yếu'),
    ('计穷状态', 'trạng thái kế cùng'),
    ('休整状态', 'trạng thái nghỉ ngơi'),
    ('援护状态', 'trạng thái viện hộ'),
    ('洞察状态', 'trạng thái thấu thị'),
    ('规避状态', 'trạng thái né tránh'),
    ('先攻状态', 'trạng thái tiên công'),
    ('溃逃', 'hoảng loạn'),
    ('混乱', 'hỗn loạn'),
    ('犹豫', 'do dự'),
    ('怯战', 'khiếp chiến'),
    ('沙暴', 'bão cát'),
    ('火攻', 'hỏa công'),
    ('中毒', 'trúng độc'),
    ('暴走', 'bạo tẩu'),
    ('禁疗', 'cấm hồi máu'),
    ('缴械', 'tước vũ khí'),
    ('震慑', 'chấn nhiếp'),
    ('围困', 'vây khốn'),
    ('叛逃', 'phản bội'),
    ('虚弱', 'suy yếu'),
    ('计穷', 'kế cùng'),
    ('休整', 'nghỉ ngơi'),
    ('援护', 'viện hộ'),
    ('洞察', 'thấu thị'),
    ('奇谋', 'kỳ mưu'),
    ('规避', 'né tránh'),
    ('先攻', 'tiên công'),
    ('连击', 'liên kích'),
    ('反击', 'phản kích'),
    ('必中', 'chắc chắn trúng'),
    ('暴击', 'bạo kích'),
    ('破防', 'phá phòng'),
    ('嘲讽', 'khiêu khích'),
    ('眩晕', 'choáng váng'),
    ('状态', 'trạng thái'),

    # Duration and probability
    ('回合', ' lượt '),
    ('概率', ' xác suất '),
    ('持续', ' kéo dài '),
    ('准备', 'chuẩn bị '),
    ('释放', 'phát động'),
    ('发动', 'phát động'),
    ('触发', 'kích hoạt'),
    ('主动战法', 'chiến pháp chủ động'),
    ('被动战法', 'chiến pháp bị động'),
    ('指挥战法', 'chiến pháp chỉ huy'),
    ('追击战法', 'chiến pháp truy kích'),
    ('战法', 'chiến pháp'),
    ('主动', 'chủ động'),
    ('被动', 'bị động'),
    ('指挥', 'chỉ huy'),
    ('追击', 'truy kích'),

    # Effects
    ('造成', 'gây '),
    ('受到', 'chịu '),
    ('提高', 'tăng '),
    ('提升', 'tăng '),
    ('降低', 'giảm '),
    ('减少', 'giảm '),
    ('增加', 'tăng thêm '),
    ('无视', 'bỏ qua '),
    ('免疫', 'miễn dịch '),
    ('抵抗', 'kháng '),
    ('清除', 'xóa bỏ '),
    ('移除', 'loại bỏ '),
    ('叠加', 'cộng dồn'),
    ('每回合', 'mỗi lượt'),
    ('每', 'mỗi '),
    ('最多', 'tối đa '),
    ('至少', 'tối thiểu '),
    ('额外', 'thêm '),

    # Army types
    ('骑兵', 'kỵ binh'),
    ('盾兵', 'thuẫn binh'),
    ('弓兵', 'cung binh'),
    ('枪兵', 'thương binh'),
    ('器械', 'công thành'),

    # Other common terms
    ('效果', 'hiệu quả'),
    ('属性', 'thuộc tính'),
    ('影响', ' ảnh hưởng'),
    ('受', 'chịu '),
    ('并有', ', và có '),
    ('并', ', và '),
    ('或', ' hoặc '),
    ('若', 'nếu '),
    ('则', ' thì '),
    ('使', 'khiến '),
    ('对', 'đối với '),
    ('有', 'có '),
    ('无', 'không '),
    ('可', 'có thể '),
    ('不可', 'không thể '),
    ('不', 'không '),
    ('为', 'là '),
    ('与', ' và '),
    ('及', ' và '),
    ('等', ' v.v.'),
    ('人', ' người'),
    ('次', ' lần'),
    ('点', ' điểm'),
    ('层', ' tầng'),

    # Punctuation
    ('，', ', '),
    ('。', '. '),
    ('（', ' ('),
    ('）', ')'),
    ('：', ': '),
    ('；', '; '),

    # Internal/Politics skills
    ('武将', 'võ tướng'),
    ('委任', 'bổ nhiệm'),
    ('锻造官', 'quan rèn'),
    ('锻造', 'rèn'),
    ('装备', 'trang bị'),
    ('高阶', 'cao cấp'),
    ('几率', 'xác suất'),
    ('时', ' khi '),

    # More common terms
    ('之后', ', sau đó '),
    ('之前', ', trước đó '),
    ('自己', 'bản thân '),
    ('进入', 'rơi vào '),
    ('获得', 'nhận được '),
    ('目标', 'mục tiêu'),
    ('期间', 'trong thời gian'),
    ('开始', 'bắt đầu'),
    ('结束', 'kết thúc'),
    ('本次', 'lần này'),
    ('下次', 'lần sau'),
    ('首次', 'lần đầu'),
    ('再次', 'lần nữa'),
    ('同时', 'đồng thời'),
    ('立即', 'ngay lập tức'),
    ('直接', 'trực tiếp'),
    ('选择', 'chọn'),
    ('执行', 'thực hiện'),
    ('生效', 'có hiệu lực'),
    ('失效', 'mất hiệu lực'),
    ('无法', 'không thể '),
    ('可以', 'có thể '),
    ('能够', 'có thể '),
    ('需要', 'cần '),
    ('必须', 'phải '),
    ('已经', 'đã '),
    ('正在', 'đang '),
    ('将要', 'sẽ '),
    ('出', ' ra '),
    ('的', ' '),
    ('了', ' '),
    ('着', ' '),
    ('在', ' trong '),
    ('从', ' từ '),
    ('到', ' đến '),
    ('给', ' cho '),
    ('让', ' khiến '),
    ('把', ' '),
    ('被', ' bị '),
    ('比', ' so với '),
    ('更', ' hơn '),
    ('最', ' nhất '),
    ('也', ' cũng '),
    ('都', ' đều '),
    ('只', ' chỉ '),
    ('就', ' thì '),
    ('才', ' mới '),
    ('又', ' lại '),
    ('还', ' còn '),
    ('但', ' nhưng '),
    ('却', ' lại '),
    ('因', ' vì '),
    ('所以', ' nên '),
    ('如果', ' nếu '),
    ('虽然', ' tuy '),
    ('即使', ' dù '),
    ('除了', ' ngoài '),
    ('关于', ' về '),
    ('根据', ' theo '),
    ('通过', ' thông qua '),
    ('按照', ' theo '),
    ('基于', ' dựa trên '),

    # Numbers with context
    ('1回合', '1 lượt'),
    ('2回合', '2 lượt'),
    ('3回合', '3 lượt'),
    ('4回合', '4 lượt'),
    ('5回合', '5 lượt'),
    ('1人', '1 người'),
    ('2人', '2 người'),
    ('3人', '3 người'),
    ('1次', '1 lần'),
    ('2次', '2 lần'),
    ('3次', '3 lần'),
]

# Target translations (exact matches)
TARGET_TRANSLATIONS = {
    '敌军群体（3人）': 'Nhóm địch (3 người)',
    '敌军群体（2人）': 'Nhóm địch (2 người)',
    '敌军全体': 'Toàn bộ địch',
    '敌军单体': 'Đơn thể địch',
    '敌军单体（2次）': 'Đơn thể địch (2 lần)',
    '敌军随机': 'Địch ngẫu nhiên',
    '敌军随机（2人）': 'Địch ngẫu nhiên (2 người)',
    '敌军随机（3人）': 'Địch ngẫu nhiên (3 người)',
    '我军全体': 'Toàn bộ quân ta',
    '我军群体（2人）': 'Nhóm quân ta (2 người)',
    '我军单体': 'Đơn thể quân ta',
    '自身': 'Bản thân',
    '友军单体': 'Đơn thể đồng minh',
    '友军群体': 'Nhóm đồng minh',
    '敌军群体': 'Nhóm địch',
    '我军群体': 'Nhóm quân ta',
}


def translate_text(text: str) -> str:
    """Translate Chinese text to Vietnamese using dictionary."""
    if not text:
        return text

    result = text

    # Sort translations by length (longer first) to avoid partial replacements
    sorted_translations = sorted(TRANSLATIONS, key=lambda x: len(x[0]), reverse=True)

    # Apply translations in order
    for cn, vi in sorted_translations:
        result = result.replace(cn, vi)

    # Clean up multiple spaces and punctuation
    result = re.sub(r' +', ' ', result)
    result = re.sub(r', +,', ',', result)
    result = re.sub(r' +,', ',', result)
    result = re.sub(r'\) +', ') ', result)
    result = re.sub(r'\)([a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])', r') \1', result)
    result = result.strip()

    return result


def translate_target(target: str) -> str:
    """Translate target description."""
    if not target:
        return target

    # Check for exact match first
    if target in TARGET_TRANSLATIONS:
        return TARGET_TRANSLATIONS[target]

    # Try partial translation
    return translate_text(target)


def main():
    # Load skills
    with open(SKILLS_FILE, 'r', encoding='utf-8') as f:
        skills = json.load(f)

    print(f"Translating {len(skills)} skills...")

    translated_effects = 0
    translated_targets = 0

    for skill in skills:
        # Translate effect
        if skill.get('effect', {}).get('cn'):
            vi_effect = translate_text(skill['effect']['cn'])
            skill['effect']['vi'] = vi_effect
            translated_effects += 1

        # Translate target
        if skill.get('target'):
            skill['target_vi'] = translate_target(skill['target'])
            translated_targets += 1

    # Save updated skills
    with open(SKILLS_FILE, 'w', encoding='utf-8') as f:
        json.dump(skills, f, ensure_ascii=False, indent=2)

    print(f"Translated {translated_effects} effects and {translated_targets} targets")
    print(f"Saved to {SKILLS_FILE}")

    # Show a sample
    print("\nSample translations:")
    count = 0
    for skill in skills:
        if skill.get('effect', {}).get('vi') and count < 3:
            print(f"\n{skill['name']['vi']}:")
            print(f"  CN: {skill['effect']['cn']}")
            print(f"  VI: {skill['effect']['vi']}")
            if skill.get('target_vi'):
                print(f"  Mục tiêu: {skill['target_vi']}")
            count += 1


if __name__ == '__main__':
    main()
