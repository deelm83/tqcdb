#!/usr/bin/env python3
"""
Scrape generals from Bilibili wiki for Three Kingdoms Tactics
"""

import requests
import json
import time
import re
from urllib.parse import quote
from bs4 import BeautifulSoup
from typing import List, Dict

BILIBILI_WIKI_URL = "https://wiki.biligame.com/sgzzlb"

FACTION_PAGES = {
    "wei": "魏国武将",
    "shu": "蜀国武将",
    "wu": "吴国武将",
    "qun": "群雄武将",
}

# Sino-Vietnamese translation dictionary (extended)
HANVIET_DICT = {
    # SP prefix
    's': 'S', 'p': 'P', 'S': 'S', 'P': 'P',
    # Additional common characters
    '机': 'Cơ', '先': 'Tiên', '识': 'Thức', '竭': 'Kiệt', '力': 'Lực', '佐': 'Tá',
    '武': 'Võ', '名': 'Danh', '良': 'Lương', '上': 'Thượng', '等': 'Đẳng',
    '无': 'Vô', '双': 'Song', '猛': 'Mãnh', '烈': 'Liệt', '勇': 'Dũng',
    '古': 'Cổ', '之': 'Chi', '恶': 'Ác', '来': 'Lai', '毒': 'Độc', '士': 'Sĩ',
    '奸': 'Gian', '绝': 'Tuyệt', '伦': 'Luân', '冢': 'Trủng', '御': 'Ngự',
    '乱': 'Loạn', '世': 'Thế', '奸': 'Gian', '恶': 'Ác', '雄': 'Hùng',
    '算': 'Toán', '計': 'Kế', '计': 'Kế', '鬼': 'Quỷ', '眼': 'Nhãn',
    '生': 'Sinh', '死': 'Tử', '肉': 'Nhục', '骨': 'Cốt', '克': 'Khắc',
    '敌': 'Địch', '制': 'Chế', '胜': 'Thắng', '守': 'Thủ', '攻': 'Công',
    '合': 'Hợp', '一': 'Nhất', '二': 'Nhị', '三': 'Tam', '四': 'Tứ',
    '五': 'Ngũ', '六': 'Lục', '七': 'Thất', '八': 'Bát', '九': 'Cửu', '十': 'Thập',
    '百': 'Bách', '千': 'Thiên', '万': 'Vạn', '零': 'Linh',
    '将': 'Tướng', '帅': 'Soái', '令': 'Lệnh', '号': 'Hiệu',
    '破': 'Phá', '灭': 'Diệt', '杀': 'Sát', '除': 'Trừ', '歼': 'Tiêm',
    '援': 'Viện', '救': 'Cứu', '护': 'Hộ', '卫': 'Vệ', '防': 'Phòng',
    '锐': 'Nhuệ', '利': 'Lợi', '坚': 'Kiên', '固': 'Cố', '强': 'Cường',
    '弱': 'Nhược', '软': 'Nhuyễn', '硬': 'Ngạnh', '长': 'Trường', '短': 'Đoản',
    '增': 'Tăng', '减': 'Giảm', '加': 'Gia', '损': 'Tổn', '耗': 'Hao',
    '复': 'Phục', '恢': 'Khôi', '愈': 'Dũ', '治': 'Trị', '疗': 'Liệu',
    '毒': 'Độc', '害': 'Hại', '伤': 'Thương', '痛': 'Thống', '苦': 'Khổ',
    '怒': 'Nộ', '喜': 'Hỷ', '哀': 'Ai', '惧': 'Cụ', '爱': 'Ái',
    '恨': 'Hận', '忧': 'Ưu', '思': 'Tư', '念': 'Niệm', '想': 'Tưởng',
    '定': 'Định', '安': 'An', '稳': 'Ổn', '平': 'Bình', '宁': 'Ninh',
    '镇': 'Trấn', '压': 'Áp', '制': 'Chế', '控': 'Khống', '驭': 'Ngự',
    '逃': 'Đào', '避': 'Tỵ', '躲': 'Đóa', '藏': 'Tàng', '隐': 'Ẩn',
    '现': 'Hiện', '显': 'Hiển', '露': 'Lộ', '明': 'Minh', '暗': 'Ám',
    '清': 'Thanh', '浊': 'Trọc', '净': 'Tịnh', '污': 'Ô', '染': 'Nhiễm',
    '血': 'Huyết', '气': 'Khí', '神': 'Thần', '魂': 'Hồn', '魄': 'Phách',
    '心': 'Tâm', '身': 'Thân', '手': 'Thủ', '足': 'Túc', '头': 'Đầu',
    '目': 'Mục', '耳': 'Nhĩ', '口': 'Khẩu', '鼻': 'Tỵ', '舌': 'Thiệt',
    '牙': 'Nha', '齿': 'Xỉ', '发': 'Phát', '须': 'Tu', '眉': 'Mi',
    '面': 'Diện', '容': 'Dung', '颜': 'Nhan', '色': 'Sắc', '形': 'Hình',
    '状': 'Trạng', '态': 'Thái', '势': 'Thế', '位': 'Vị', '座': 'Tọa',
    '立': 'Lập', '坐': 'Tọa', '行': 'Hành', '走': 'Tẩu', '跑': 'Bào',
    '飞': 'Phi', '跳': 'Khiêu', '翔': 'Tường', '游': 'Du', '泳': 'Vịnh',
    '潜': 'Tiềm', '沉': 'Trầm', '浮': 'Phù', '漂': 'Phiêu', '流': 'Lưu',
    '注': 'Chú', '灌': 'Quán', '泼': 'Phát', '洒': 'Sái', '滴': 'Trích',
    '点': 'Điểm', '线': 'Tuyến', '面': 'Diện', '体': 'Thể', '圆': 'Viên',
    '方': 'Phương', '角': 'Giác', '尖': 'Tiêm', '锐': 'Nhuệ', '钝': 'Độn',
    '薄': 'Bạc', '厚': 'Hậu', '深': 'Thâm', '浅': 'Thiển', '高': 'Cao',
    '低': 'Đê', '远': 'Viễn', '近': 'Cận', '宽': 'Khoan', '窄': 'Trách',
    '空': 'Không', '满': 'Mãn', '实': 'Thực', '虚': 'Hư', '假': 'Giả',
    '真': 'Chân', '伪': 'Ngụy', '正': 'Chính', '邪': 'Tà', '善': 'Thiện',
    '恶': 'Ác', '美': 'Mỹ', '丑': 'Xú', '好': 'Hảo', '坏': 'Hoại',
    '新': 'Tân', '旧': 'Cựu', '老': 'Lão', '少': 'Thiếu', '幼': 'Ấu',
    '壮': 'Tráng', '衰': 'Suy', '盛': 'Thịnh', '枯': 'Khô', '荣': 'Vinh',
    '落': 'Lạc', '起': 'Khởi', '升': 'Thăng', '降': 'Giáng', '沉': 'Trầm',
    '浮': 'Phù', '开': 'Khai', '闭': 'Bế', '收': 'Thu', '放': 'Phóng',
    '取': 'Thủ', '舍': 'Xả', '得': 'Đắc', '失': 'Thất', '有': 'Hữu',
    '无': 'Vô', '存': 'Tồn', '亡': 'Vong', '生': 'Sinh', '死': 'Tử',
    '始': 'Thủy', '终': 'Chung', '首': 'Thủ', '尾': 'Vĩ', '本': 'Bản',
    '末': 'Mạt', '根': 'Căn', '叶': 'Diệp', '枝': 'Chi', '干': 'Cán',
    '花': 'Hoa', '果': 'Quả', '实': 'Thực', '种': 'Chủng', '苗': 'Miêu',
    '草': 'Thảo', '木': 'Mộc', '禾': 'Hòa', '麦': 'Mạch', '米': 'Mễ',
    '豆': 'Đậu', '瓜': 'Qua', '菜': 'Thái', '蔬': 'Sơ', '果': 'Quả',
    '肉': 'Nhục', '鱼': 'Ngư', '虾': 'Hà', '蟹': 'Giải', '贝': 'Bối',
    '鸟': 'Điểu', '兽': 'Thú', '虫': 'Trùng', '蛇': 'Xà', '龟': 'Quy',
    '曹': 'Tào', '操': 'Tháo', '刘': 'Lưu', '备': 'Bị', '孙': 'Tôn', '权': 'Quyền',
    '关': 'Quan', '羽': 'Vũ', '张': 'Trương', '飞': 'Phi', '赵': 'Triệu', '云': 'Vân',
    '诸': 'Gia', '葛': 'Cát', '亮': 'Lượng', '周': 'Chu', '瑜': 'Du', '司': 'Tư',
    '马': 'Mã', '懿': 'Ý', '吕': 'Lữ', '布': 'Bố', '袁': 'Viên', '绍': 'Thiệu',
    '术': 'Thuật', '典': 'Điển', '韦': 'Vi', '夏': 'Hạ', '侯': 'Hầu', '渊': 'Uyên',
    '惇': 'Đôn', '许': 'Hứa', '褚': 'Chử', '郭': 'Quách', '嘉': 'Gia', '荀': 'Tuân',
    '彧': 'Úc', '攸': 'Du', '程': 'Trình', '昱': 'Dục', '于': 'Vu', '禁': 'Cấm',
    '乐': 'Nhạc', '进': 'Tiến', '李': 'Lý', '典': 'Điển', '张': 'Trương', '辽': 'Liêu',
    '徐': 'Từ', '晃': 'Hoảng', '庞': 'Bàng', '德': 'Đức', '黄': 'Hoàng', '忠': 'Trung',
    '魏': 'Ngụy', '延': 'Diên', '姜': 'Khương', '维': 'Duy', '陆': 'Lục', '逊': 'Tốn',
    '甘': 'Cam', '宁': 'Ninh', '太': 'Thái', '史': 'Sử', '慈': 'Từ', '鲁': 'Lỗ',
    '肃': 'Túc', '凌': 'Lăng', '统': 'Thống', '董': 'Đổng', '卓': 'Trác', '貂': 'Điêu',
    '蝉': 'Thuyền', '华': 'Hoa', '佗': 'Đà', '陈': 'Trần', '宫': 'Cung', '高': 'Cao',
    '顺': 'Thuận', '颜': 'Nhan', '良': 'Lương', '文': 'Văn', '丑': 'Sửu', '公': 'Công',
    '孙': 'Tôn', '瓒': 'Toản', '严': 'Nghiêm', '白': 'Bạch', '马': 'Mã', '超': 'Siêu',
    '孟': 'Mạnh', '获': 'Hoạch', '祝': 'Chúc', '融': 'Dung', '兀': 'Ngột', '突': 'Đột',
    '骨': 'Cốt', '王': 'Vương', '平': 'Bình', '沙': 'Sa', '摩': 'Ma', '柯': 'Kha',
    '朵': 'Đóa', '思': 'Tư', '大': 'Đại', '何': 'Hà', '仪': 'Nghi', '钟': 'Chung',
    '会': 'Hội', '邓': 'Đặng', '艾': 'Ngải', '蒋': 'Tưởng', '琬': 'Uyển', '费': 'Phí',
    '祎': 'Y', '法': 'Pháp', '正': 'Chánh', '简': 'Giản', '雍': 'Ung', '刘': 'Lưu',
    '禅': 'Thiền', '吴': 'Ngô', '国': 'Quốc', '懿': 'Ý', '夫': 'Phu', '人': 'Nhân',
    '小': 'Tiểu', '乔': 'Kiều', '孙': 'Tôn', '尚': 'Thượng', '香': 'Hương', '步': 'Bộ',
    '练': 'Luyện', '师': 'Sư', '蔡': 'Thái', '瑁': 'Mạo', '马': 'Mã', '谡': 'Tốc',
    '关': 'Quan', '兴': 'Hưng', '索': 'Tác', '张': 'Trương', '苞': 'Bao', '星': 'Tinh',
    '彩': 'Thái', '霞': 'Hà', '伊': 'Y', '籍': 'Tịch', '笮': 'Tác', '融': 'Dung',
    '吴': 'Ngô', '班': 'Ban', '樊': 'Phàn', '氏': 'Thị', '潘': 'Phan', '濬': 'Tuấn',
    '曹': 'Tào', '洪': 'Hồng', '曹': 'Tào', '仁': 'Nhân', '乐': 'Nhạc', '进': 'Tiến',
    '臧': 'Tang', '霸': 'Bá', '满': 'Mãn', '宠': 'Sủng', '朱': 'Chu', '灵': 'Linh',
    '曹': 'Tào', '彰': 'Chương', '曹': 'Tào', '植': 'Thực', '毌': 'Quán', '丘': 'Khâu',
    '俭': 'Kiệm', '卞': 'Biện', '虎': 'Hổ', '将': 'Tướng', '军': 'Quân', '士': 'Sĩ',
    '冯': 'Phùng', '杨': 'Dương', '修': 'Tu', '蜀': 'Thục', '群': 'Quần', '雄': 'Hùng',
    '戏': 'Hí', '志': 'Chí', '才': 'Tài', '贾': 'Giả', '诩': 'Hu', '田': 'Điền',
    '丰': 'Phong', '郑': 'Trịnh', '浑': 'Hồn', '阚': 'Khám', '泽': 'Trạch', '水': 'Thủy',
    '镜': 'Kính', '管': 'Quản', '辂': 'Lộ', '华': 'Hoa', '歆': 'Hâm', '蒯': 'Khoái',
    '越': 'Việt', '邹': 'Trâu', '靖': 'Tĩnh', '金': 'Kim', '旋': 'Toàn', '韩': 'Hàn',
    '当': 'Đương', '遂': 'Toại', '审': 'Thẩm', '配': 'Phối', '沮': 'Thư', '授': 'Thụ',
    '眭': 'Tuy', '固': 'Cố', '纪': 'Kỷ', '灵': 'Linh', '祖': 'Tổ', '茂': 'Mậu',
    '智': 'Trí', '勇': 'Dũng', '敬': 'Kính', '业': 'Nghiệp', '皇': 'Hoàng', '甫': 'Phủ',
    '嵩': 'Tung', '城': 'Thành', '枪': 'Thương', '骑': 'Kỵ', '弓': 'Cung', '盾': 'Thuẫn',
    '兵': 'Binh', '器': 'Khí', '械': 'Giới', '指': 'Chỉ', '挥': 'Huy', '主': 'Chủ',
    '动': 'Động', '被': 'Bị', '追': 'Truy', '击': 'Kích', '阵': 'Trận', '战': 'Chiến',
    '突': 'Đột', '内': 'Nội', '政': 'Chánh', '种': 'Chủng', '坚': 'Kiên', '策': 'Sách',
    '瑾': 'Cẩn', '丁': 'Đinh', '奉': 'Phụng', '程': 'Trình', '普': 'Phổ', '朱': 'Chu',
    '桓': 'Hoàn', '全': 'Toàn', '琮': 'Tông', '综': 'Tống', '徐': 'Từ', '盛': 'Thịnh',
    '吾': 'Ngô', '粲': 'Xán', '韩': 'Hàn', '综': 'Tống', '虞': 'Ngu', '翻': 'Phiên',
    '翀': 'Xung', '贺': 'Hạ', '齐': 'Tề', '滕': 'Đằng', '胤': 'Dận', '留': 'Lưu',
    '赞': 'Tán', '潘': 'Phan', '璋': 'Chương', '峻': 'Tuấn', '骏': 'Tuấn', '恪': 'Khác',
    '休': 'Hưu', '景': 'Cảnh', '帝': 'Đế', '妃': 'Phi', '皇': 'Hoàng', '后': 'Hậu',
    '傅': 'Phó', '巽': 'Tốn', '伏': 'Phục', '完': 'Hoàn', '嗣': 'Tự', '儿': 'Nhi',
    '男': 'Nam', '女': 'Nữ', '子': 'Tử', '父': 'Phụ', '母': 'Mẫu', '弟': 'Đệ',
    '兄': 'Huynh', '叔': 'Thúc', '伯': 'Bá', '舅': 'Cữu', '甥': 'Sinh', '婿': 'Tế',
    '姑': 'Cô', '姨': 'Di', '从': 'Tùng', '堂': 'Đường', '表': 'Biểu', '亲': 'Thân',
    '戚': 'Thích', '家': 'Gia', '中': 'Trung', '外': 'Ngoại', '上': 'Thượng', '下': 'Hạ',
    '左': 'Tả', '右': 'Hữu', '前': 'Tiền', '后': 'Hậu', '东': 'Đông', '西': 'Tây',
    '南': 'Nam', '北': 'Bắc', '河': 'Hà', '江': 'Giang', '海': 'Hải', '湖': 'Hồ',
    '山': 'Sơn', '川': 'Xuyên', '原': 'Nguyên', '野': 'Dã', '林': 'Lâm', '森': 'Sâm',
    '天': 'Thiên', '地': 'Địa', '日': 'Nhật', '月': 'Nguyệt', '年': 'Niên', '时': 'Thời',
    '春': 'Xuân', '夏': 'Hạ', '秋': 'Thu', '冬': 'Đông', '晨': 'Thần', '暮': 'Mộ',
    '红': 'Hồng', '蓝': 'Lam', '青': 'Thanh', '绿': 'Lục', '紫': 'Tử', '金': 'Kim',
    '银': 'Ngân', '铜': 'Đồng', '铁': 'Thiết', '玉': 'Ngọc', '珠': 'Châu', '宝': 'Bảo',
    '神': 'Thần', '仙': 'Tiên', '鬼': 'Quỷ', '妖': 'Yêu', '龙': 'Long', '凤': 'Phụng',
    '麒': 'Kỳ', '麟': 'Lân', '法': 'Pháp', '术': 'Thuật', '道': 'Đạo', '儒': 'Nho',
    '佛': 'Phật', '僧': 'Tăng', '尼': 'Ni', '庙': 'Miếu', '寺': 'Tự', '殿': 'Điện',
    '宫': 'Cung', '府': 'Phủ', '院': 'Viện', '阁': 'Các', '楼': 'Lâu', '台': 'Đài',
    '亭': 'Đình', '榭': 'Tạ', '桥': 'Kiều', '塔': 'Tháp', '墙': 'Tường', '门': 'Môn',
    '窗': 'Song', '户': 'Hộ', '床': 'Sàng', '席': 'Tịch', '案': 'Án', '桌': 'Trác',
    '椅': 'Ỷ', '凳': 'Đẳng', '帘': 'Liêm', '帷': 'Vi', '幕': 'Mạc', '席': 'Tịch',
    '仲': 'Trọng', '达': 'Đạt', '谋': 'Mưu', '豪': 'Hào', '俊': 'Tuấn', '杰': 'Kiệt',
    '杨': 'Dương', '浩': 'Hạo', '泉': 'Tuyền', '涛': 'Đào', '巴': 'Ba', '淳': 'Thuần',
    '胜': 'Thắng', '晋': 'Tấn', '氐': 'Đê', '羌': 'Khương', '奴': 'Nô', '匈': 'Hung',
    '鲜': 'Tiên', '卑': 'Ti', '濮': 'Bộc', '睦': 'Mục', '乌': 'Ô', '桓': 'Hoàn',
    '丸': 'Hoàn', '轲': 'Kha', '比': 'Tỷ', '能': 'Năng', '难': 'Nan', '楼': 'Lâu',
    '烦': 'Phiền', '蹋': 'Đạp', '顿': 'Đốn', '彻': 'Triệt', '里': 'Lý', '吉': 'Cát',
    '卢': 'Lô', '芳': 'Phương', '毅': 'Nghị', '伦': 'Luân', '衡': 'Hành', '翼': 'Dực',
    '秀': 'Tú', '春': 'Xuân', '英': 'Anh', '美': 'Mỹ', '琦': 'Kỳ', '珺': 'Quân',
    '媛': 'Viện', '婉': 'Uyển', '娴': 'Nhàn', '妍': 'Nghiên', '婷': 'Đình', '姬': 'Cơ',
    '娥': 'Nga', '婵': 'Thiền', '嫣': 'Yên', '艳': 'Diễm', '丽': 'Lệ', '曼': 'Mạn',
    '云': 'Vân', '娟': 'Quyên', '倩': 'Thiến', '梅': 'Mai', '兰': 'Lan', '菊': 'Cúc',
    '竹': 'Trúc', '荷': 'Hà', '莲': 'Liên', '桃': 'Đào', '杏': 'Hạnh', '薇': 'Vi',
    '芝': 'Chi', '莹': 'Oánh', '雪': 'Tuyết', '冰': 'Băng', '玲': 'Linh', '珑': 'Lung',
    '诗': 'Thi', '词': 'Từ', '歌': 'Ca', '赋': 'Phú', '书': 'Thư', '画': 'Họa',
    '琴': 'Cầm', '棋': 'Kỳ', '音': 'Âm', '乐': 'Nhạc', '舞': 'Vũ', '剑': 'Kiếm',
    '刀': 'Đao', '枪': 'Thương', '弩': 'Nỏ', '戟': 'Kích', '斧': 'Phủ', '锤': 'Chùy',
    '鞭': 'Tiên', '锏': 'Giản', '矛': 'Mâu', '槊': 'Sóc', '钩': 'Câu', '叉': 'Xoa',
    '镗': 'Thang', '棍': 'Côn', '杖': 'Trượng', '钺': 'Việt', '戈': 'Qua', '殳': 'Thù',
    '甲': 'Giáp', '胄': 'Trụ', '盔': 'Khôi', '冠': 'Quan', '袍': 'Bào', '裳': 'Thường',
    '裙': 'Quần', '衫': 'Sam', '袄': 'Áo', '褂': 'Quải', '靴': 'Ngoa', '履': 'Lý',
    '袜': 'Vạt', '带': 'Đới', '巾': 'Cân', '帽': 'Mạo', '笠': 'Lạp', '扇': 'Phiến',
    '伞': 'Tán', '鉴': 'Giám', '承': 'Thừa', '皓': 'Hạo', '象': 'Tượng', '若': 'Nhược',
    '义': 'Nghĩa', '瑶': 'Dao', '舆': 'Dư', '遵': 'Tuân', '照': 'Chiếu', '猷': 'Du',
    '昂': 'Ngang', '奋': 'Phấn', '威': 'Uy', '震': 'Chấn', '烈': 'Liệt', '抗': 'Kháng',
    '节': 'Tiết', '质': 'Chất', '厚': 'Hậu', '廉': 'Liêm', '恭': 'Cung', '宽': 'Khoan',
    '信': 'Tín', '礼': 'Lễ', '智': 'Trí', '孝': 'Hiếu', '悌': 'Đễ', '慎': 'Thận',
}

def translate_to_vietnamese(chinese_text: str) -> str:
    """Translate Chinese text to Sino-Vietnamese."""
    result = []
    for char in chinese_text:
        if char in HANVIET_DICT:
            result.append(HANVIET_DICT[char])
        else:
            result.append(f'[{char}]')
    return ' '.join(result).replace('  ', ' ').strip()


def get_generals_from_bilibili(faction: str = None) -> List[Dict]:
    """Fetch generals from Bilibili wiki by faction."""
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    })

    all_generals = []
    factions_to_fetch = [faction] if faction else list(FACTION_PAGES.keys())

    for fac in factions_to_fetch:
        page_name = FACTION_PAGES.get(fac)
        if not page_name:
            print(f"Unknown faction: {fac}")
            continue

        print(f"Fetching {page_name} ({fac})...")
        url = f"{BILIBILI_WIKI_URL}/{quote(page_name)}"

        try:
            response = session.get(url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            table = soup.select_one('table.wikitable')
            if not table:
                print(f"No table found for {page_name}")
                continue

            generals = parse_general_table(table, fac)
            all_generals.extend(generals)
            print(f"  Found {len(generals)} {fac} generals")

            time.sleep(0.5)

        except requests.exceptions.RequestException as e:
            print(f"Error fetching {page_name}: {e}")
            continue

    print(f"Total generals fetched: {len(all_generals)}")
    return all_generals


def parse_general_table(table, faction_id: str) -> List[Dict]:
    """Parse general table from Bilibili wiki."""
    generals = []
    rows = table.select('tr')

    if not rows:
        return generals

    headers = [th.text.strip() for th in rows[0].select('th')]

    col_map = {}
    for i, header in enumerate(headers):
        if '武将姓名' in header or '姓名' in header:
            col_map['name'] = i
        elif '武将品质' in header or '品质' in header:
            col_map['quality'] = i
        elif '统御' in header:
            col_map['cost'] = i  # 统御 (Command) is the actual cost value
        elif '武将标签' in header or '标签' in header:
            col_map['tags'] = i
        elif '自带战法' in header:
            col_map['innate_skill'] = i
        elif '传承战法' in header:
            col_map['inherited_skill'] = i
        elif '骑兵' in header:
            col_map['cavalry'] = i
        elif '盾兵' in header:
            col_map['shield'] = i
        elif '弓兵' in header:
            col_map['archer'] = i
        elif '枪兵' in header:
            col_map['spear'] = i
        elif '器械' in header:
            col_map['siege'] = i

    for row in rows[1:]:
        cells = row.select('td')
        if not cells:
            continue

        try:
            general_data = {'faction_id': faction_id}

            # Name
            if 'name' in col_map and col_map['name'] < len(cells):
                name_cell = cells[col_map['name']]
                link = name_cell.select_one('a')
                name_cn = name_cell.text.strip()
                general_data['id'] = name_cn
                general_data['name'] = {
                    'cn': name_cn,
                    'vi': translate_to_vietnamese(name_cn)
                }
                if link and link.get('href'):
                    general_data['wiki_url'] = f"https://wiki.biligame.com{link['href']}"

            # Cost (from 统御 column - the command/cost value)
            if 'cost' in col_map and col_map['cost'] < len(cells):
                cost_cell = cells[col_map['cost']]
                cost_text = cost_cell.text.strip()
                try:
                    general_data['cost'] = int(cost_text)
                except ValueError:
                    general_data['cost'] = 5  # Default if parsing fails

            # Tags
            if 'tags' in col_map and col_map['tags'] < len(cells):
                tags_text = cells[col_map['tags']].text.strip()
                tags_cn = [t.strip() for t in tags_text.split('、') if t.strip()]
                general_data['tags'] = {
                    'cn': tags_cn,
                    'vi': [translate_to_vietnamese(t) for t in tags_cn]
                }

            # Innate skill
            if 'innate_skill' in col_map and col_map['innate_skill'] < len(cells):
                skill_cell = cells[col_map['innate_skill']]
                skill_name = skill_cell.text.strip()
                if skill_name:
                    general_data['innate_skill'] = {
                        'name': {
                            'cn': skill_name,
                            'vi': translate_to_vietnamese(skill_name)
                        },
                        'type': {'id': 'unknown', 'name': {'cn': '', 'vi': ''}}
                    }

            # Inherited skill
            if 'inherited_skill' in col_map and col_map['inherited_skill'] < len(cells):
                skill_cell = cells[col_map['inherited_skill']]
                skill_name = skill_cell.text.strip()
                if skill_name and skill_name != '-':
                    general_data['inherited_skill'] = {
                        'name': {
                            'cn': skill_name,
                            'vi': translate_to_vietnamese(skill_name)
                        },
                        'type': {'id': 'unknown', 'name': {'cn': '', 'vi': ''}}
                    }

            # Troop compatibility
            troop_compat = {}
            for troop in ['cavalry', 'shield', 'archer', 'spear', 'siege']:
                if troop in col_map and col_map[troop] < len(cells):
                    grade = cells[col_map[troop]].text.strip().upper()
                    if grade in ['S', 'A', 'B', 'C']:
                        troop_compat[troop] = {'grade': grade}

            if troop_compat:
                general_data['troop_compatibility'] = troop_compat

            if general_data.get('name'):
                generals.append(general_data)

        except Exception as e:
            print(f"Error parsing row: {e}")
            continue

    return generals


def generate_slug(name_vi):
    """Generate URL-friendly slug from Vietnamese name."""
    if not name_vi:
        return ''
    slug = removeVietnameseDiacritics(name_vi)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')


def removeVietnameseDiacritics(s):
    """Remove Vietnamese diacritics for slug generation."""
    import unicodedata
    if not s:
        return ''
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('đ', 'd').replace('Đ', 'D')
    return s.lower()


def add_image_paths(generals, images_dir):
    """Add image paths to generals by matching slugs with existing image files."""
    import os

    # Get all image files
    if not os.path.exists(images_dir):
        print(f"Images directory not found: {images_dir}")
        return

    image_files = [f for f in os.listdir(images_dir) if f.endswith('.jpg')]

    # Build a map of slug -> image file
    slug_to_image = {}
    for img in image_files:
        # Extract slug from filename like "0_s_p_tuan_uc.jpg" -> "s-p-tuan-uc"
        name_part = img.rsplit('.', 1)[0]  # Remove extension
        parts = name_part.split('_', 1)  # Split on first underscore
        if len(parts) > 1:
            slug = parts[1].replace('_', '-')
            slug_to_image[slug] = img

    # Match generals with images
    matched = 0
    for i, general in enumerate(generals):
        slug = generate_slug(general['name']['vi'])
        if slug in slug_to_image:
            general['image'] = f"/images/generals/{slug_to_image[slug]}"
            matched += 1
        else:
            general['image'] = None

    print(f"Matched {matched}/{len(generals)} generals with images")


if __name__ == '__main__':
    generals = get_generals_from_bilibili()

    # Add image paths
    images_dir = '../web/public/images/generals'
    add_image_paths(generals, images_dir)

    output_path = '../data/generals/all_generals.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(generals, f, ensure_ascii=False, indent=2)

    print(f"\nSaved {len(generals)} generals to {output_path}")
