-- Fix remaining SP general IDs
-- First, let's see which SP generals still need fixing
SELECT id, slug, name FROM generals WHERE (name LIKE 'SP %' OR name LIKE 'S P %') AND id NOT LIKE 'sp%';

-- Drop and recreate FK constraints as DEFERRABLE
ALTER TABLE skill_innate_generals DROP CONSTRAINT IF EXISTS skill_innate_generals_general_id_fkey;
ALTER TABLE skill_inherit_generals DROP CONSTRAINT IF EXISTS skill_inherit_generals_general_id_fkey;
ALTER TABLE skill_exchange_generals DROP CONSTRAINT IF EXISTS skill_exchange_generals_general_id_fkey;

-- Now update the general IDs first, then relations

-- SP 袁绍 (Viên Thiệu)
UPDATE generals SET id = 'sp袁绍' WHERE id = '袁绍' AND name LIKE 'SP%';
UPDATE skill_innate_generals SET general_id = 'sp袁绍' WHERE general_id = '袁绍';
UPDATE skill_inherit_generals SET general_id = 'sp袁绍' WHERE general_id = '袁绍';
UPDATE skill_exchange_generals SET general_id = 'sp袁绍' WHERE general_id = '袁绍';

-- SP 关羽 (Quan Vũ)
UPDATE generals SET id = 'sp关羽' WHERE id = '关羽' AND name LIKE 'SP%';
UPDATE skill_innate_generals SET general_id = 'sp关羽' WHERE general_id = '关羽';
UPDATE skill_inherit_generals SET general_id = 'sp关羽' WHERE general_id = '关羽';
UPDATE skill_exchange_generals SET general_id = 'sp关羽' WHERE general_id = '关羽';

-- SP 诸葛亮 (Gia Cát Lượng)
UPDATE generals SET id = 'sp诸葛亮' WHERE id = '诸葛亮' AND name LIKE 'SP%';
UPDATE skill_innate_generals SET general_id = 'sp诸葛亮' WHERE general_id = '诸葛亮';
UPDATE skill_inherit_generals SET general_id = 'sp诸葛亮' WHERE general_id = '诸葛亮';
UPDATE skill_exchange_generals SET general_id = 'sp诸葛亮' WHERE general_id = '诸葛亮';

-- SP 吕蒙 (Lữ Mông)
UPDATE generals SET id = 'sp吕蒙' WHERE id = '吕蒙' AND name LIKE 'SP%';
UPDATE skill_innate_generals SET general_id = 'sp吕蒙' WHERE general_id = '吕蒙';
UPDATE skill_inherit_generals SET general_id = 'sp吕蒙' WHERE general_id = '吕蒙';
UPDATE skill_exchange_generals SET general_id = 'sp吕蒙' WHERE general_id = '吕蒙';

-- SP 周瑜 (Chu Du)
UPDATE generals SET id = 'sp周瑜' WHERE id = '周瑜' AND name LIKE 'SP%';
UPDATE skill_innate_generals SET general_id = 'sp周瑜' WHERE general_id = '周瑜';
UPDATE skill_inherit_generals SET general_id = 'sp周瑜' WHERE general_id = '周瑜';
UPDATE skill_exchange_generals SET general_id = 'sp周瑜' WHERE general_id = '周瑜';

-- SP 庞德 (Bàng Đức)
UPDATE generals SET id = 'sp庞德' WHERE id = '庞德' AND name LIKE 'SP%';
UPDATE skill_innate_generals SET general_id = 'sp庞德' WHERE general_id = '庞德';
UPDATE skill_inherit_generals SET general_id = 'sp庞德' WHERE general_id = '庞德';
UPDATE skill_exchange_generals SET general_id = 'sp庞德' WHERE general_id = '庞德';

-- SP 黄月英 (Hoàng Nguyệt Anh)
UPDATE generals SET id = 'sp黄月英' WHERE id = '黄月英' AND name LIKE 'SP%';
UPDATE skill_innate_generals SET general_id = 'sp黄月英' WHERE general_id = '黄月英';
UPDATE skill_inherit_generals SET general_id = 'sp黄月英' WHERE general_id = '黄月英';
UPDATE skill_exchange_generals SET general_id = 'sp黄月英' WHERE general_id = '黄月英';

-- SP 许褚 (Hứa Chử)
UPDATE generals SET id = 'sp许褚' WHERE id = '许褚' AND name LIKE 'SP%';
UPDATE skill_innate_generals SET general_id = 'sp许褚' WHERE general_id = '许褚';
UPDATE skill_inherit_generals SET general_id = 'sp许褚' WHERE general_id = '许褚';
UPDATE skill_exchange_generals SET general_id = 'sp许褚' WHERE general_id = '许褚';

-- Recreate FK constraints
ALTER TABLE skill_innate_generals ADD CONSTRAINT skill_innate_generals_general_id_fkey
    FOREIGN KEY (general_id) REFERENCES generals(id) ON DELETE CASCADE;
ALTER TABLE skill_inherit_generals ADD CONSTRAINT skill_inherit_generals_general_id_fkey
    FOREIGN KEY (general_id) REFERENCES generals(id) ON DELETE CASCADE;
ALTER TABLE skill_exchange_generals ADD CONSTRAINT skill_exchange_generals_general_id_fkey
    FOREIGN KEY (general_id) REFERENCES generals(id) ON DELETE CASCADE;

-- Verify the fix
SELECT id, slug, name FROM generals WHERE name LIKE 'SP %' OR name LIKE 'S P %' ORDER BY name;
