-- Fix SP general images to use correct SP-specific images
-- The SP generals currently have non-SP general images

-- sp关羽: quan-vu.png → sp-quan-vu.png
UPDATE generals SET image = '/images/generals/sp-quan-vu.png' WHERE id = 'sp关羽';

-- sp劉曄: luu-diep.png → sp-luu-diep.png
UPDATE generals SET image = '/images/generals/sp-luu-diep.png' WHERE id = 'sp劉曄';

-- sp吕蒙: already correct (sp-lu-mong.png)
-- UPDATE generals SET image = '/images/generals/sp-lu-mong.png' WHERE id = 'sp吕蒙';

-- sp周瑜: chu-du.png → sp-chu-du.png
UPDATE generals SET image = '/images/generals/sp-chu-du.png' WHERE id = 'sp周瑜';

-- sp孫堅: already correct (sp-ton-kien.png)
-- UPDATE generals SET image = '/images/generals/sp-ton-kien.png' WHERE id = 'sp孫堅';

-- sp庞德: bang-duc.png → sp-bang-duc.png
UPDATE generals SET image = '/images/generals/sp-bang-duc.png' WHERE id = 'sp庞德';

-- sp张良: truong-luong.png → sp-truong-luong.png
UPDATE generals SET image = '/images/generals/sp-truong-luong.png' WHERE id = 'sp张良';

-- sp曹真: tao-chan.png → sp-tao-chan.png
UPDATE generals SET image = '/images/generals/sp-tao-chan.png' WHERE id = 'sp曹真';

-- sp朱儁: chu-tuan.png → sp-chu-tuan.png
UPDATE generals SET image = '/images/generals/sp-chu-tuan.png' WHERE id = 'sp朱儁';

-- sp皇甫嵩: already correct (sp-hoang-pho-tung.png)
-- UPDATE generals SET image = '/images/generals/sp-hoang-pho-tung.png' WHERE id = 'sp皇甫嵩';

-- sp袁绍: vien-thieu.png → sp-vien-thieu.png
UPDATE generals SET image = '/images/generals/sp-vien-thieu.png' WHERE id = 'sp袁绍';

-- sp许褚: already correct (sp-hua-chu.png)
-- UPDATE generals SET image = '/images/generals/sp-hua-chu.png' WHERE id = 'sp许褚';

-- sp诸葛亮: gia-cat-luong.png → sp-gia-cat-luong.png
UPDATE generals SET image = '/images/generals/sp-gia-cat-luong.png' WHERE id = 'sp诸葛亮';

-- sp郭嘉: quach-gia.png → sp-quach-gia.png
UPDATE generals SET image = '/images/generals/sp-quach-gia.png' WHERE id = 'sp郭嘉';

-- sp黄月英: already correct (sp-hoang-nguyet-anh.png)
-- UPDATE generals SET image = '/images/generals/sp-hoang-nguyet-anh.png' WHERE id = 'sp黄月英';

-- Verify the updates
SELECT id, name, image FROM generals WHERE id LIKE 'sp%' ORDER BY id;
