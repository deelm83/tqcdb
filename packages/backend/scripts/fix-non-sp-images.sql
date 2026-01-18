-- Fix non-SP generals that incorrectly have SP images
-- Using correct data from JSON file

-- 荀彧 (Tuân Úc): has sp-tuan-uc.png and wrong name "Tuân Du"
-- Correct: name = "Tuân Úc", image = /images/generals/16_tuan_uc.jpg
UPDATE generals
SET image = '/images/generals/16_tuan_uc.jpg', name = 'Tuân Úc'
WHERE id = '荀彧';

-- 马超 (Mã Siêu): has sp-ma-sieu.png
-- Correct: image = /images/generals/35_ma_sieu.jpg
UPDATE generals
SET image = '/images/generals/35_ma_sieu.jpg'
WHERE id = '马超';

-- 田豐 (traditional Chinese for Điền Phong): has sp-dien-vi.png
-- Correct: image = /images/generals/91_dien_phong.jpg (same as 田丰)
UPDATE generals
SET image = '/images/generals/91_dien_phong.jpg'
WHERE id = '田豐';

-- Verify the updates
SELECT id, name, image FROM generals
WHERE id IN ('荀彧', '马超', '田豐', '田丰')
ORDER BY id;
