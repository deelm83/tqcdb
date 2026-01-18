-- Remove Chinese fields and rename Vietnamese fields

-- Generals table
ALTER TABLE generals RENAME COLUMN name_vi TO name;
ALTER TABLE generals DROP COLUMN IF EXISTS name_cn;
ALTER TABLE generals RENAME COLUMN tags_vi TO tags;
ALTER TABLE generals DROP COLUMN IF EXISTS tags_cn;

-- Skills table
ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_name_cn_key;
ALTER TABLE skills RENAME COLUMN name_vi TO name;
ALTER TABLE skills DROP COLUMN IF EXISTS name_cn;
ALTER TABLE skills RENAME COLUMN type_name_vi TO type_name;
ALTER TABLE skills DROP COLUMN IF EXISTS type_name_cn;
ALTER TABLE skills RENAME COLUMN effect_vi TO effect;
ALTER TABLE skills DROP COLUMN IF EXISTS effect_cn;
ALTER TABLE skills DROP COLUMN IF EXISTS target_vi;
