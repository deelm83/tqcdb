const { PrismaClient } = require('@prisma/client');

async function migrateSkillRelations() {
  // Use raw SQL since we need to work with old schema
  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tqc',
  });

  await client.connect();

  try {
    console.log('Starting skill relation migration...');

    // Step 1: Add new columns if they don't exist
    console.log('Adding new columns...');
    await client.query(`
      ALTER TABLE generals
      ADD COLUMN IF NOT EXISTS innate_skill_id INTEGER,
      ADD COLUMN IF NOT EXISTS inherited_skill_id INTEGER
    `);

    // Step 2: Get all generals with their skill names
    console.log('Fetching generals...');
    const generalsResult = await client.query(`
      SELECT id, innate_skill_name, inherited_skill_name FROM generals
    `);

    // Step 3: Get all skills
    console.log('Fetching skills...');
    const skillsResult = await client.query(`
      SELECT id, name_cn FROM skills
    `);

    // Create a map of skill name (CN) to skill ID
    const skillMap = new Map();
    for (const skill of skillsResult.rows) {
      skillMap.set(skill.name_cn, skill.id);
    }

    console.log(`Found ${skillMap.size} skills`);

    // Step 4: Update each general with skill IDs
    let updated = 0;
    let notFound = [];

    for (const general of generalsResult.rows) {
      const innateSkillId = general.innate_skill_name ? skillMap.get(general.innate_skill_name) : null;
      const inheritedSkillId = general.inherited_skill_name ? skillMap.get(general.inherited_skill_name) : null;

      if (general.innate_skill_name && !innateSkillId) {
        notFound.push({ general: general.id, skill: general.innate_skill_name, type: 'innate' });
      }
      if (general.inherited_skill_name && !inheritedSkillId) {
        notFound.push({ general: general.id, skill: general.inherited_skill_name, type: 'inherited' });
      }

      if (innateSkillId || inheritedSkillId) {
        await client.query(`
          UPDATE generals
          SET innate_skill_id = $1, inherited_skill_id = $2
          WHERE id = $3
        `, [innateSkillId, inheritedSkillId, general.id]);
        updated++;
      }
    }

    console.log(`Updated ${updated} generals with skill relations`);

    if (notFound.length > 0) {
      console.log('\nSkills not found:');
      notFound.forEach(n => console.log(`  - General ${n.general}: ${n.type} skill "${n.skill}"`));
    }

    // Step 5: Add foreign key constraints
    console.log('\nAdding foreign key constraints...');

    // Check if constraints already exist
    const constraintsResult = await client.query(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = 'generals' AND constraint_type = 'FOREIGN KEY'
    `);

    const existingConstraints = constraintsResult.rows.map(r => r.constraint_name);

    if (!existingConstraints.includes('generals_innate_skill_id_fkey')) {
      await client.query(`
        ALTER TABLE generals
        ADD CONSTRAINT generals_innate_skill_id_fkey
        FOREIGN KEY (innate_skill_id) REFERENCES skills(id) ON DELETE SET NULL
      `);
    }

    if (!existingConstraints.includes('generals_inherited_skill_id_fkey')) {
      await client.query(`
        ALTER TABLE generals
        ADD CONSTRAINT generals_inherited_skill_id_fkey
        FOREIGN KEY (inherited_skill_id) REFERENCES skills(id) ON DELETE SET NULL
      `);
    }

    // Step 6: Optionally drop old columns (keeping them for now as backup)
    // await client.query(`
    //   ALTER TABLE generals
    //   DROP COLUMN IF EXISTS innate_skill_name,
    //   DROP COLUMN IF EXISTS inherited_skill_name
    // `);

    console.log('\nMigration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

migrateSkillRelations().catch(console.error);
