-- Fix SP general IDs by updating the generals table directly
-- Then update foreign key references

-- First, let's check which SP generals need fixing
SELECT id, slug, name FROM generals WHERE (name LIKE 'SP %' OR name LIKE 'S P %') AND id NOT LIKE 'sp%';

-- For each SP general with wrong ID, we need to:
-- 1. Create the correct ID version
-- 2. Update all foreign key references
-- 3. Delete the old record

-- Let's do this one by one for remaining generals:

-- SP 袁绍 (Viên Thiệu)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp袁绍' WHERE general_id = '袁绍';
UPDATE skill_inherit_generals SET general_id = 'sp袁绍' WHERE general_id = '袁绍';
UPDATE skill_exchange_generals SET general_id = 'sp袁绍' WHERE general_id = '袁绍';
UPDATE generals SET id = 'sp袁绍' WHERE id = '袁绍' AND name LIKE 'SP%';
COMMIT;

-- SP 关羽 (Quan Vũ)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp关羽' WHERE general_id = '关羽';
UPDATE skill_inherit_generals SET general_id = 'sp关羽' WHERE general_id = '关羽';
UPDATE skill_exchange_generals SET general_id = 'sp关羽' WHERE general_id = '关羽';
UPDATE generals SET id = 'sp关羽' WHERE id = '关羽' AND name LIKE 'SP%';
COMMIT;

-- SP 诸葛亮 (Gia Cát Lượng)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp诸葛亮' WHERE general_id = '诸葛亮';
UPDATE skill_inherit_generals SET general_id = 'sp诸葛亮' WHERE general_id = '诸葛亮';
UPDATE skill_exchange_generals SET general_id = 'sp诸葛亮' WHERE general_id = '诸葛亮';
UPDATE generals SET id = 'sp诸葛亮' WHERE id = '诸葛亮' AND name LIKE 'SP%';
COMMIT;

-- SP 吕蒙 (Lữ Mông)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp吕蒙' WHERE general_id = '吕蒙';
UPDATE skill_inherit_generals SET general_id = 'sp吕蒙' WHERE general_id = '吕蒙';
UPDATE skill_exchange_generals SET general_id = 'sp吕蒙' WHERE general_id = '吕蒙';
UPDATE generals SET id = 'sp吕蒙' WHERE id = '吕蒙' AND name LIKE 'SP%';
COMMIT;

-- SP 周瑜 (Chu Du)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp周瑜' WHERE general_id = '周瑜';
UPDATE skill_inherit_generals SET general_id = 'sp周瑜' WHERE general_id = '周瑜';
UPDATE skill_exchange_generals SET general_id = 'sp周瑜' WHERE general_id = '周瑜';
UPDATE generals SET id = 'sp周瑜' WHERE id = '周瑜' AND name LIKE 'SP%';
COMMIT;

-- SP 庞德 (Bàng Đức)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp庞德' WHERE general_id = '庞德';
UPDATE skill_inherit_generals SET general_id = 'sp庞德' WHERE general_id = '庞德';
UPDATE skill_exchange_generals SET general_id = 'sp庞德' WHERE general_id = '庞德';
UPDATE generals SET id = 'sp庞德' WHERE id = '庞德' AND name LIKE 'SP%';
COMMIT;

-- For SP generals without JSON mapping, create new IDs with "sp" prefix:
-- These are manually added SP generals

-- SP 黄月英 (Hoàng Nguyệt Anh)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp黄月英' WHERE general_id = '黄月英';
UPDATE skill_inherit_generals SET general_id = 'sp黄月英' WHERE general_id = '黄月英';
UPDATE skill_exchange_generals SET general_id = 'sp黄月英' WHERE general_id = '黄月英';
UPDATE generals SET id = 'sp黄月英' WHERE id = '黄月英' AND name LIKE 'SP%';
COMMIT;

-- SP 孫堅 (Tôn Kiên)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp孫堅' WHERE general_id = '孫堅';
UPDATE skill_inherit_generals SET general_id = 'sp孫堅' WHERE general_id = '孫堅';
UPDATE skill_exchange_generals SET general_id = 'sp孫堅' WHERE general_id = '孫堅';
UPDATE generals SET id = 'sp孫堅' WHERE id = '孫堅' AND name LIKE 'SP%';
COMMIT;

-- SP 皇甫嵩 (Hoàng Phổ Tung)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp皇甫嵩' WHERE general_id = '皇甫嵩';
UPDATE skill_inherit_generals SET general_id = 'sp皇甫嵩' WHERE general_id = '皇甫嵩';
UPDATE skill_exchange_generals SET general_id = 'sp皇甫嵩' WHERE general_id = '皇甫嵩';
UPDATE generals SET id = 'sp皇甫嵩' WHERE id = '皇甫嵩' AND name LIKE 'SP%';
COMMIT;

-- SP 许褚 (Hứa Chử)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp许褚' WHERE general_id = '许褚';
UPDATE skill_inherit_generals SET general_id = 'sp许褚' WHERE general_id = '许褚';
UPDATE skill_exchange_generals SET general_id = 'sp许褚' WHERE general_id = '许褚';
UPDATE generals SET id = 'sp许褚' WHERE id = '许褚' AND name LIKE 'SP%';
COMMIT;

-- SP 曹真 (Tào Chân)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp曹真' WHERE general_id = '曹真';
UPDATE skill_inherit_generals SET general_id = 'sp曹真' WHERE general_id = '曹真';
UPDATE skill_exchange_generals SET general_id = 'sp曹真' WHERE general_id = '曹真';
UPDATE generals SET id = 'sp曹真' WHERE id = '曹真' AND name LIKE 'SP%';
COMMIT;

-- SP 张良 (Trương Lương)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp张良' WHERE general_id = '张良';
UPDATE skill_inherit_generals SET general_id = 'sp张良' WHERE general_id = '张良';
UPDATE skill_exchange_generals SET general_id = 'sp张良' WHERE general_id = '张良';
UPDATE generals SET id = 'sp张良' WHERE id = '张良' AND name LIKE 'SP%';
COMMIT;

-- SP 劉曄 (Lưu Diệp)
BEGIN;
UPDATE skill_innate_generals SET general_id = 'sp劉曄' WHERE general_id = '劉曄';
UPDATE skill_inherit_generals SET general_id = 'sp劉曄' WHERE general_id = '劉曄';
UPDATE skill_exchange_generals SET general_id = 'sp劉曄' WHERE general_id = '劉曄';
UPDATE generals SET id = 'sp劉曄' WHERE id = '劉曄' AND name LIKE 'SP%';
COMMIT;

-- Verify the fix
SELECT id, slug, name FROM generals WHERE name LIKE 'SP %' OR name LIKE 'S P %' ORDER BY name;
