"""
Official Database Scraper for Three Kingdoms Tactics
Scrapes data from https://sgzzlb.lingxigames.com/station/
"""

import requests
import time
import json
import re
from urllib.parse import quote
from typing import List, Dict, Optional, Any
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service


class OfficialDBScraper:
    """
    Scraper for the official Three Kingdoms Tactics database
    """

    BASE_URL = "https://sgzzlb.lingxigames.com"
    STATION_URL = f"{BASE_URL}/station/"
    BILIBILI_WIKI_URL = "https://wiki.biligame.com/sgzzlb"

    SKILL_TYPE_PAGES = {
        "指挥": "指挥战法",
        "主动": "主动战法",
        "被动": "被动战法",
        "突击": "突击战法",
        "追击": "追击战法",
        "兵种": "兵种战法",
        "阵法": "阵法战法",
        "内政": "内政战法",
    }

    FACTION_PAGES = {
        "wei": "魏国武将",
        "shu": "蜀国武将",
        "wu": "吴国武将",
        "qun": "群雄武将",
    }

    # Sino-Vietnamese translation dictionary
    HANVIET_DICT = {
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

    def __init__(self, headless: bool = True, timeout: int = 30):
        """
        Initialize the scraper

        Args:
            headless: Whether to run browser in headless mode
            timeout: Default timeout for page loads in seconds
        """
        self.headless = headless
        self.timeout = timeout
        self.driver = None
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': self.STATION_URL
        })

    def _init_driver(self) -> webdriver.Chrome:
        """
        Initialize Selenium WebDriver

        Returns:
            Configured Chrome WebDriver instance
        """
        if self.driver is not None:
            return self.driver

        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument(f'user-agent={self.session.headers["User-Agent"]}')

        self.driver = webdriver.Chrome(options=chrome_options)
        return self.driver

    def _close_driver(self):
        """Close the WebDriver instance"""
        if self.driver:
            self.driver.quit()
            self.driver = None

    def get_api_data(self, endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """
        Make API request to the backend

        Args:
            endpoint: API endpoint path
            params: Query parameters

        Returns:
            JSON response data or None if failed
        """
        try:
            url = f"{self.BASE_URL}{endpoint}"
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {endpoint}: {e}")
            return None

    def scrape_with_selenium(self, url: str, wait_selector: str = None) -> Optional[str]:
        """
        Scrape page content using Selenium

        Args:
            url: URL to scrape
            wait_selector: CSS selector to wait for before extracting content

        Returns:
            Page HTML content or None if failed
        """
        try:
            driver = self._init_driver()
            driver.get(url)

            if wait_selector:
                WebDriverWait(driver, self.timeout).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, wait_selector))
                )
            else:
                time.sleep(3)  # Wait for dynamic content to load

            return driver.page_source
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None

    def extract_data_from_js(self, html: str, variable_name: str) -> Optional[Any]:
        """
        Extract data from JavaScript variables in HTML

        Args:
            html: HTML content
            variable_name: JavaScript variable name to extract

        Returns:
            Extracted data or None if not found
        """
        try:
            soup = BeautifulSoup(html, 'html.parser')
            scripts = soup.find_all('script')

            for script in scripts:
                if script.string and variable_name in script.string:
                    # Find the variable assignment
                    lines = script.string.split('\n')
                    for line in lines:
                        if f'{variable_name} =' in line or f'{variable_name}=' in line:
                            # Extract JSON data
                            start = line.find('=') + 1
                            end = line.rfind(';')
                            if end == -1:
                                end = len(line)
                            json_str = line[start:end].strip()
                            return json.loads(json_str)
            return None
        except Exception as e:
            print(f"Error extracting {variable_name}: {e}")
            return None

    def get_all_generals(self) -> List[Dict]:
        """
        Fetch all generals from the official database

        Returns:
            List of general data dictionaries
        """
        print("Fetching generals data...")

        # Try API approach first
        api_data = self.get_api_data('/api/generals')
        if api_data:
            return api_data.get('data', [])

        # Fallback to Selenium scraping
        print("API not available, using Selenium...")
        html = self.scrape_with_selenium(
            f"{self.STATION_URL}#/general",
            wait_selector='.general-list'
        )

        if not html:
            return []

        generals = []
        soup = BeautifulSoup(html, 'html.parser')

        # Extract general cards from the page
        general_cards = soup.select('.general-card, .hero-card, .character-item')

        for card in general_cards:
            try:
                general_data = self._parse_general_card(card)
                if general_data:
                    generals.append(general_data)
            except Exception as e:
                print(f"Error parsing general card: {e}")
                continue

        print(f"Found {len(generals)} generals")
        return generals

    def _parse_general_card(self, card) -> Optional[Dict]:
        """
        Parse a general card element to extract data

        Args:
            card: BeautifulSoup element representing a general card

        Returns:
            Dictionary with general data or None
        """
        try:
            # This is a template - actual selectors need to be updated based on real HTML structure
            name = card.select_one('.name, .general-name')
            faction = card.select_one('.faction, .camp')
            rarity = card.select_one('.rarity, .star-level')

            if not name:
                return None

            return {
                'name_cn': name.text.strip() if name else '',
                'faction': faction.text.strip() if faction else '',
                'rarity': self._parse_rarity(rarity.text) if rarity else 0,
                # Add more fields as needed
            }
        except Exception as e:
            print(f"Error parsing card: {e}")
            return None

    def _parse_rarity(self, rarity_text: str) -> int:
        """Convert rarity text to integer"""
        if not rarity_text:
            return 0
        # Count stars or extract number
        return rarity_text.count('★') or rarity_text.count('⭐') or 0

    def get_general_details(self, general_id: str) -> Optional[Dict]:
        """
        Fetch detailed information for a specific general

        Args:
            general_id: Unique identifier for the general

        Returns:
            Dictionary with detailed general data
        """
        print(f"Fetching details for general {general_id}...")

        # Try API first
        api_data = self.get_api_data(f'/api/generals/{general_id}')
        if api_data:
            return api_data.get('data')

        # Fallback to Selenium
        html = self.scrape_with_selenium(
            f"{self.STATION_URL}#/general/{general_id}",
            wait_selector='.general-detail'
        )

        if not html:
            return None

        soup = BeautifulSoup(html, 'html.parser')
        # Parse detailed information
        # This needs to be customized based on actual page structure

        return {}

    def get_all_skills(self) -> List[Dict]:
        """
        Fetch all skills from the official database

        Returns:
            List of skill data dictionaries
        """
        print("Fetching skills data...")

        # Try API approach first
        api_data = self.get_api_data('/api/skills')
        if api_data:
            return api_data.get('data', [])

        # Fallback to Selenium
        html = self.scrape_with_selenium(
            f"{self.STATION_URL}#/skill",
            wait_selector='.skill-list'
        )

        if not html:
            return []

        skills = []
        soup = BeautifulSoup(html, 'html.parser')

        # Extract skill cards
        skill_cards = soup.select('.skill-card, .tactic-card, .ability-item')

        for card in skill_cards:
            try:
                skill_data = self._parse_skill_card(card)
                if skill_data:
                    skills.append(skill_data)
            except Exception as e:
                print(f"Error parsing skill card: {e}")
                continue

        print(f"Found {len(skills)} skills")
        return skills

    def _parse_skill_card(self, card) -> Optional[Dict]:
        """
        Parse a skill card element to extract data

        Args:
            card: BeautifulSoup element representing a skill card

        Returns:
            Dictionary with skill data or None
        """
        try:
            name = card.select_one('.name, .skill-name')
            skill_type = card.select_one('.type, .skill-type')
            quality = card.select_one('.quality, .grade')

            if not name:
                return None

            return {
                'name_cn': name.text.strip() if name else '',
                'type': skill_type.text.strip() if skill_type else '',
                'quality': quality.text.strip() if quality else '',
                # Add more fields as needed
            }
        except Exception as e:
            print(f"Error parsing skill card: {e}")
            return None

    def translate_to_vietnamese(self, chinese_text: str) -> str:
        """
        Translate Chinese text to Sino-Vietnamese using character-by-character mapping.

        Args:
            chinese_text: Chinese text to translate

        Returns:
            Sino-Vietnamese translation
        """
        result = []
        for char in chinese_text:
            if char in self.HANVIET_DICT:
                result.append(self.HANVIET_DICT[char])
            else:
                result.append(f'[{char}]')  # Mark untranslated characters
        return ' '.join(result).replace('  ', ' ').strip()

    def get_generals_from_bilibili(self, faction: str = None) -> List[Dict]:
        """
        Fetch generals from Bilibili wiki by faction.

        Args:
            faction: Faction ID (wei, shu, wu, qun). If None, fetches all factions.

        Returns:
            List of general data dictionaries
        """
        all_generals = []
        factions_to_fetch = [faction] if faction else list(self.FACTION_PAGES.keys())

        for fac in factions_to_fetch:
            page_name = self.FACTION_PAGES.get(fac)
            if not page_name:
                print(f"Unknown faction: {fac}")
                continue

            print(f"Fetching {page_name} ({fac})...")
            url = f"{self.BILIBILI_WIKI_URL}/{quote(page_name)}"

            try:
                response = self.session.get(url, timeout=self.timeout)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')

                # Find the generals table
                table = soup.select_one('table.wikitable')
                if not table:
                    print(f"No table found for {page_name}")
                    continue

                generals = self._parse_bilibili_general_table(table, fac)
                all_generals.extend(generals)
                print(f"  Found {len(generals)} {fac} generals")

                time.sleep(0.5)  # Be polite to the server

            except requests.exceptions.RequestException as e:
                print(f"Error fetching {page_name}: {e}")
                continue

        print(f"Total generals fetched: {len(all_generals)}")
        return all_generals

    def _parse_bilibili_general_table(self, table, faction_id: str) -> List[Dict]:
        """
        Parse general table from Bilibili wiki.

        Args:
            table: BeautifulSoup table element
            faction_id: The faction ID (wei, shu, wu, qun)

        Returns:
            List of general dictionaries
        """
        generals = []
        rows = table.select('tr')

        if not rows:
            return generals

        # Find header row to determine column indices
        headers = [th.text.strip() for th in rows[0].select('th')]

        # Map column names to indices
        col_map = {}
        for i, header in enumerate(headers):
            if '武将姓名' in header or '姓名' in header:
                col_map['name'] = i
            elif '武将品质' in header or '品质' in header:
                col_map['cost'] = i
            elif '统御' in header:
                col_map['command'] = i
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

        # Parse data rows
        for row in rows[1:]:
            cells = row.select('td')
            if not cells:
                continue

            try:
                general_data = {
                    'faction_id': faction_id,
                }

                # Extract name and wiki URL
                if 'name' in col_map and col_map['name'] < len(cells):
                    name_cell = cells[col_map['name']]
                    link = name_cell.select_one('a')
                    name_cn = name_cell.text.strip()
                    general_data['id'] = name_cn
                    general_data['name'] = {
                        'cn': name_cn,
                        'vi': self.translate_to_vietnamese(name_cn)
                    }
                    if link and link.get('href'):
                        general_data['wiki_url'] = f"https://wiki.biligame.com{link['href']}"

                # Extract cost (stars)
                if 'cost' in col_map and col_map['cost'] < len(cells):
                    cost_text = cells[col_map['cost']].text.strip()
                    # Count stars or extract number
                    stars = cost_text.count('★') or cost_text.count('⭐')
                    if not stars:
                        # Try to extract number
                        match = re.search(r'(\d+)', cost_text)
                        stars = int(match.group(1)) if match else 0
                    general_data['cost'] = stars

                # Extract tags
                if 'tags' in col_map and col_map['tags'] < len(cells):
                    tags_text = cells[col_map['tags']].text.strip()
                    tags_cn = [t.strip() for t in tags_text.split('、') if t.strip()]
                    general_data['tags'] = {
                        'cn': tags_cn,
                        'vi': [self.translate_to_vietnamese(t) for t in tags_cn]
                    }

                # Extract innate skill
                if 'innate_skill' in col_map and col_map['innate_skill'] < len(cells):
                    skill_cell = cells[col_map['innate_skill']]
                    skill_link = skill_cell.select_one('a')
                    skill_name = skill_cell.text.strip()
                    if skill_name:
                        general_data['innate_skill'] = {
                            'name': {
                                'cn': skill_name,
                                'vi': self.translate_to_vietnamese(skill_name)
                            },
                            'type': {'id': 'unknown', 'name': {'cn': '', 'vi': ''}}
                        }
                        if skill_link and skill_link.get('href'):
                            general_data['innate_skill']['wiki_url'] = f"https://wiki.biligame.com{skill_link['href']}"

                # Extract inherited skill
                if 'inherited_skill' in col_map and col_map['inherited_skill'] < len(cells):
                    skill_cell = cells[col_map['inherited_skill']]
                    skill_name = skill_cell.text.strip()
                    if skill_name and skill_name != '-':
                        general_data['inherited_skill'] = {
                            'name': {
                                'cn': skill_name,
                                'vi': self.translate_to_vietnamese(skill_name)
                            },
                            'type': {'id': 'unknown', 'name': {'cn': '', 'vi': ''}}
                        }

                # Extract troop compatibility
                troop_compat = {}
                troop_types = ['cavalry', 'shield', 'archer', 'spear', 'siege']
                for troop in troop_types:
                    if troop in col_map and col_map[troop] < len(cells):
                        grade = cells[col_map[troop]].text.strip().upper()
                        if grade in ['S', 'A', 'B', 'C']:
                            troop_compat[troop] = {'grade': grade}

                if troop_compat:
                    general_data['troop_compatibility'] = troop_compat

                if general_data.get('name'):
                    generals.append(general_data)

            except Exception as e:
                print(f"Error parsing general row: {e}")
                continue

        return generals

    def get_skills_from_bilibili(self, skill_type: str = None) -> List[Dict]:
        """
        Fetch skills from Bilibili wiki

        Args:
            skill_type: Optional skill type to filter (指挥, 主动, 被动, etc.)
                       If None, fetches all skill types

        Returns:
            List of skill data dictionaries
        """
        all_skills = []

        types_to_fetch = [skill_type] if skill_type else self.SKILL_TYPE_PAGES.keys()

        for stype in types_to_fetch:
            page_name = self.SKILL_TYPE_PAGES.get(stype)
            if not page_name:
                print(f"Unknown skill type: {stype}")
                continue

            print(f"Fetching {page_name}...")
            url = f"{self.BILIBILI_WIKI_URL}/{quote(page_name)}"

            try:
                response = self.session.get(url, timeout=self.timeout)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')

                # Find the skills table
                table = soup.select_one('table.wikitable')
                if not table:
                    print(f"No table found for {page_name}")
                    continue

                skills = self._parse_bilibili_skill_table(table, stype)
                all_skills.extend(skills)
                print(f"  Found {len(skills)} {stype} skills")

                time.sleep(0.5)  # Be polite to the server

            except requests.exceptions.RequestException as e:
                print(f"Error fetching {page_name}: {e}")
                continue

        print(f"Total skills fetched: {len(all_skills)}")
        return all_skills

    def _parse_bilibili_skill_table(self, table, skill_type: str) -> List[Dict]:
        """
        Parse skill table from Bilibili wiki

        Args:
            table: BeautifulSoup table element
            skill_type: The type of skill (指挥, 主动, etc.)

        Returns:
            List of skill dictionaries
        """
        skills = []
        rows = table.select('tr')

        # Find header row to determine column indices
        header_row = rows[0] if rows else None
        if not header_row:
            return skills

        headers = [th.text.strip() for th in header_row.select('th')]

        # Map column names to indices
        col_map = {}
        for i, header in enumerate(headers):
            if '战法名称' in header or '名称' in header:
                col_map['name'] = i
            elif '品质' in header:
                col_map['quality'] = i
            elif '来源' in header and '武将' not in header:
                col_map['source_type'] = i
            elif '武将' in header:
                col_map['source_general'] = i
            elif '发动几率' in header or '几率' in header:
                col_map['activation_rate'] = i
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

        # Parse data rows
        for row in rows[1:]:
            cells = row.select('td')
            if not cells:
                continue

            try:
                skill_data = {
                    'type': skill_type,
                    'type_cn': self.SKILL_TYPE_PAGES.get(skill_type, skill_type),
                }

                # Extract name and link
                if 'name' in col_map and col_map['name'] < len(cells):
                    name_cell = cells[col_map['name']]
                    link = name_cell.select_one('a')
                    skill_data['name_cn'] = name_cell.text.strip()
                    if link and link.get('href'):
                        skill_data['wiki_url'] = f"https://wiki.biligame.com{link['href']}"

                # Extract quality
                if 'quality' in col_map and col_map['quality'] < len(cells):
                    skill_data['quality'] = cells[col_map['quality']].text.strip()

                # Extract source type
                if 'source_type' in col_map and col_map['source_type'] < len(cells):
                    skill_data['source_type'] = cells[col_map['source_type']].text.strip()

                # Extract source general
                if 'source_general' in col_map and col_map['source_general'] < len(cells):
                    general_cell = cells[col_map['source_general']]
                    generals = [a.text.strip() for a in general_cell.select('a')]
                    skill_data['source_generals'] = generals if generals else [general_cell.text.strip()]

                # Extract activation rate (for active skills)
                if 'activation_rate' in col_map and col_map['activation_rate'] < len(cells):
                    rate_text = cells[col_map['activation_rate']].text.strip()
                    match = re.search(r'(\d+)', rate_text)
                    if match:
                        skill_data['activation_rate'] = int(match.group(1))

                # Extract troop compatibility
                troop_compat = {}
                for troop in ['cavalry', 'shield', 'archer', 'spear', 'siege']:
                    if troop in col_map and col_map[troop] < len(cells):
                        cell_text = cells[col_map[troop]].text.strip()
                        troop_compat[troop] = cell_text in ['√', '✓', '○', '是']
                if troop_compat:
                    skill_data['troop_compatibility'] = troop_compat

                if skill_data.get('name_cn'):
                    skills.append(skill_data)

            except Exception as e:
                print(f"Error parsing row: {e}")
                continue

        return skills

    def get_skill_details(self, skill_name: str) -> Optional[Dict]:
        """
        Fetch detailed information for a specific skill from Bilibili wiki

        Args:
            skill_name: Chinese name of the skill

        Returns:
            Dictionary with detailed skill data
        """
        print(f"Fetching details for skill: {skill_name}")
        url = f"{self.BILIBILI_WIKI_URL}/{quote(skill_name)}"

        try:
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            skill_data = {
                'name_cn': skill_name,
                'wiki_url': url,
            }

            # Parse the wikitable - headers in first row, values in second row
            table = soup.select_one('table.wikitable')
            if table:
                rows = table.select('tr')
                if len(rows) >= 2:
                    headers = [th.text.strip() for th in rows[0].select('th, td')]
                    values = [td.text.strip() for td in rows[1].select('th, td')]

                    for h, v in zip(headers, values):
                        if '类型' in h:
                            skill_data['type'] = v
                        elif '品质' in h:
                            skill_data['quality'] = v
                        elif '来源' in h and '武将' not in h:
                            skill_data['source_type'] = v
                        elif '武将' in h:
                            skill_data['source_general'] = v
                        elif '目标' in h:
                            skill_data['target'] = v
                        elif '准备' in h:
                            skill_data['preparation'] = v
                        elif '冷却' in h:
                            skill_data['cooldown'] = v

                # Parse troop compatibility from rows 3-4
                if len(rows) >= 5:
                    troop_headers = [td.text.strip() for td in rows[3].select('th, td')]
                    troop_values = [td.text.strip() for td in rows[4].select('th, td')]
                    troop_compat = {}
                    troop_map = {
                        '骑兵': 'cavalry',
                        '盾兵': 'shield',
                        '弓兵': 'archer',
                        '枪兵': 'spear',
                        '器械': 'siege'
                    }
                    for h, v in zip(troop_headers, troop_values):
                        if h in troop_map:
                            troop_compat[troop_map[h]] = v == '√'
                    if troop_compat:
                        skill_data['troop_compatibility'] = troop_compat

            # Find effect description from page content
            content = soup.select_one('.mw-parser-output')
            if content:
                full_text = content.get_text(separator='\n', strip=True)
                lines = full_text.split('\n')
                effect_keywords = ['伤害', '几率', '回合', '效果', '发动', '治疗', '增加', '降低', '恢复', '提高']
                skip_keywords = ['WIKI', '编辑', '收藏', '按右上角', '如果是第一次']

                for line in lines:
                    if len(line) > 30 and any(kw in line for kw in effect_keywords):
                        if not any(skip in line for skip in skip_keywords):
                            skill_data['effect'] = line.strip()
                            break

            return skill_data

        except requests.exceptions.RequestException as e:
            print(f"Error fetching skill details: {e}")
            return None

    def scrape_all_skill_details(self, skills: List[Dict] = None, delay: float = 0.5) -> List[Dict]:
        """
        Fetch detailed information for multiple skills

        Args:
            skills: List of skill dictionaries with 'name_cn' key.
                   If None, fetches skill list first.
            delay: Delay between requests in seconds

        Returns:
            List of skills with detailed information
        """
        if skills is None:
            skills = self.get_skills_from_bilibili()

        detailed_skills = []
        total = len(skills)

        for i, skill in enumerate(skills):
            name = skill.get('name_cn')
            if not name:
                continue

            print(f"[{i+1}/{total}] Fetching details for: {name}")

            details = self.get_skill_details(name)
            if details:
                # Merge with existing data
                merged = {**skill, **details}
                detailed_skills.append(merged)
            else:
                detailed_skills.append(skill)

            time.sleep(delay)

        return detailed_skills

    def get_all_equipment(self) -> List[Dict]:
        """
        Fetch all equipment from the official database

        Returns:
            List of equipment data dictionaries
        """
        print("Fetching equipment data...")

        # Try API approach first
        api_data = self.get_api_data('/api/equipment')
        if api_data:
            return api_data.get('data', [])

        # Fallback to Selenium
        html = self.scrape_with_selenium(
            f"{self.STATION_URL}#/equipment",
            wait_selector='.equipment-list'
        )

        if not html:
            return []

        equipment = []
        soup = BeautifulSoup(html, 'html.parser')

        # Extract equipment items
        equipment_cards = soup.select('.equipment-card, .item-card')

        for card in equipment_cards:
            try:
                equipment_data = self._parse_equipment_card(card)
                if equipment_data:
                    equipment.append(equipment_data)
            except Exception as e:
                print(f"Error parsing equipment card: {e}")
                continue

        print(f"Found {len(equipment)} equipment items")
        return equipment

    def _parse_equipment_card(self, card) -> Optional[Dict]:
        """Parse equipment card data"""
        try:
            name = card.select_one('.name, .equipment-name')
            eq_type = card.select_one('.type, .equipment-type')
            quality = card.select_one('.quality, .grade')

            if not name:
                return None

            return {
                'name_cn': name.text.strip() if name else '',
                'type': eq_type.text.strip() if eq_type else '',
                'quality': quality.text.strip() if quality else '',
            }
        except Exception as e:
            print(f"Error parsing equipment card: {e}")
            return None

    def scrape_all(self, output_dir: str = './data') -> Dict[str, List[Dict]]:
        """
        Scrape all data from the official database

        Args:
            output_dir: Directory to save the scraped data

        Returns:
            Dictionary containing all scraped data
        """
        print("Starting comprehensive scrape of official database...")

        try:
            data = {
                'generals': self.get_all_generals(),
                'skills': self.get_all_skills(),
                'equipment': self.get_all_equipment()
            }

            # Save to files
            from .utils import save_json
            save_json(data['generals'], f'{output_dir}/generals/all_generals.json')
            save_json(data['skills'], f'{output_dir}/skills/all_skills.json')
            save_json(data['equipment'], f'{output_dir}/equipment.json')

            print(f"\nScraping complete!")
            print(f"  - Generals: {len(data['generals'])}")
            print(f"  - Skills: {len(data['skills'])}")
            print(f"  - Equipment: {len(data['equipment'])}")

            return data
        finally:
            self._close_driver()

    def __enter__(self):
        """Context manager entry"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - cleanup resources"""
        self._close_driver()


if __name__ == '__main__':
    # Example usage
    with OfficialDBScraper(headless=False) as scraper:
        # Fetch skills from Bilibili wiki
        print("=" * 50)
        print("Fetching skills from Bilibili Wiki")
        print("=" * 50)

        # Fetch all skill types
        skills = scraper.get_skills_from_bilibili()
        print(f"\nTotal skills found: {len(skills)}")

        # Show sample
        if skills:
            print("\nSample skill data:")
            print(json.dumps(skills[0], ensure_ascii=False, indent=2))

        # Fetch details for first few skills
        print("\n" + "=" * 50)
        print("Fetching skill details")
        print("=" * 50)

        sample_skills = skills[:3] if len(skills) >= 3 else skills
        detailed = scraper.scrape_all_skill_details(sample_skills, delay=1.0)

        for skill in detailed:
            print(f"\n{skill.get('name_cn', 'Unknown')}:")
            print(f"  Type: {skill.get('type', 'N/A')}")
            print(f"  Quality: {skill.get('quality', 'N/A')}")
            print(f"  Effect: {skill.get('effect', 'N/A')[:100]}...")
