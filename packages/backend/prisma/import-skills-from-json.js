// Use raw SQL via pg since Prisma client has stale schema
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/tqc',
  });
  await client.connect();

  // Read the import_output.json file
  const importPath = path.join(__dirname, '../../../data/skills/import_output.json');
  const skills = JSON.parse(fs.readFileSync(importPath, 'utf8'));

  console.log(`Found ${skills.length} skills to import`);

  // Clear all existing skills (and related join tables via cascade)
  console.log('Clearing existing skills...');
  await client.query('DELETE FROM skill_exchange_generals');
  await client.query('DELETE FROM skill_innate_generals');
  await client.query('DELETE FROM skill_inherit_generals');
  await client.query('DELETE FROM skills');
  console.log('Cleared all skills');

  // Reset the sequence
  await client.query('ALTER SEQUENCE skills_id_seq RESTART WITH 1');

  // Import skills
  console.log('Importing skills...');
  let imported = 0;
  let errors = 0;
  const usedSlugs = new Set();

  for (const skill of skills) {
    try {
      // Handle duplicate slugs by appending a number
      let slug = skill.slug || null;
      if (slug && usedSlugs.has(slug)) {
        let counter = 2;
        while (usedSlugs.has(`${skill.slug}-${counter}`)) {
          counter++;
        }
        slug = `${skill.slug}-${counter}`;
        console.log(`  Renamed duplicate slug: ${skill.slug} -> ${slug} (${skill.nameCn})`);
      }
      if (slug) usedSlugs.add(slug);

      await client.query(
        `INSERT INTO skills (
          slug, name_cn, name_vi, type_id, type_name_cn, type_name_vi,
          quality, trigger_rate, source_type, wiki_url,
          effect_cn, effect_vi, target, target_vi, army_types,
          innate_to_generals, inheritance_from_generals,
          acquisition_type, exchange_type, exchange_generals, exchange_count,
          status, screenshots, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17,
          $18, $19, $20, $21,
          $22, $23, NOW()
        )`,
        [
          slug,
          skill.nameCn,
          skill.nameVi || skill.nameCn,
          skill.typeId || 'unknown',
          skill.typeNameCn || null,
          skill.typeNameVi || null,
          skill.quality || null,
          skill.triggerRate || null,
          skill.sourceType || null,
          skill.wikiUrl || null,
          skill.effectCn || null,
          skill.effectVi || null,
          skill.target || null,
          skill.targetVi || null,
          skill.armyTypes || [],
          skill.innateToGeneralNames || [],
          skill.inheritanceFromGeneralNames || [],
          skill.acquisitionType || null,
          skill.exchangeType || null,
          skill.exchangeGenerals || [],
          skill.exchangeCount || null,
          skill.status || 'needs_update',
          skill.screenshots || [],
        ]
      );
      imported++;
    } catch (err) {
      console.error(`Error importing skill "${skill.nameCn}": ${err.message}`);
      errors++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Errors: ${errors}`);

  // Verify count
  const result = await client.query('SELECT COUNT(*) FROM skills');
  console.log(`  Total skills in database: ${result.rows[0].count}`);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
