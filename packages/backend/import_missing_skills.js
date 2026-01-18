const { PrismaClient } = require('@prisma/client');
const fs = require("fs");
const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function main() {
  const skillsJson = JSON.parse(fs.readFileSync("/Users/ducle/codes/tqc/data/skills/all_skills.json", "utf8"));
  const dbSkills = await prisma.skill.findMany({
    select: { nameCn: true }
  });

  const dbSkillNames = new Set(dbSkills.map(s => s.nameCn));
  const missingSkills = skillsJson.filter(s => !dbSkillNames.has(s.name.cn));

  console.log(`Skills in JSON: ${skillsJson.length}`);
  console.log(`Skills in DB: ${dbSkills.length}`);
  console.log(`Skills to import: ${missingSkills.length}`);

  const dryRun = !process.argv.includes("--import");

  if (dryRun) {
    console.log("\n=== DRY RUN - Skills that would be imported ===\n");
    missingSkills.slice(0, 20).forEach(s => {
      console.log(`  - ${s.name.cn} (${s.name.vi})`);
    });
    if (missingSkills.length > 20) {
      console.log(`  ... and ${missingSkills.length - 20} more`);
    }
    console.log("\nRun with --import to import these skills");
    await prisma.$disconnect();
    return;
  }

  console.log("\n=== IMPORTING SKILLS ===\n");

  let imported = 0;
  let errors = 0;

  for (const skill of missingSkills) {
    try {
      const slug = slugify(skill.name.vi);

      await prisma.skill.create({
        data: {
          slug: slug,
          nameCn: skill.name.cn,
          nameVi: skill.name.vi,
          typeId: skill.type?.id || 'unknown',
          typeNameCn: skill.type?.name?.cn || null,
          typeNameVi: skill.type?.name?.vi || null,
          quality: skill.quality || null,
          triggerRate: skill.trigger_rate || null,
          sourceType: skill.source_type || null,
          wikiUrl: skill.wiki_url || null,
          effectCn: skill.effect?.cn || null,
          effectVi: skill.effect?.vi || null,
          target: skill.target || null,
          targetVi: skill.target_vi || null,
          armyTypes: skill.army_types || [],
          acquisitionType: skill.acquisition?.[0] || null,
          innateToGeneralNames: skill.innate_to || [],
          inheritanceFromGeneralNames: skill.inheritance_from || [],
          status: 'needs_update',
        }
      });
      imported++;
      console.log(`  ✓ Imported: ${skill.name.cn} (${skill.name.vi})`);
    } catch (err) {
      errors++;
      if (err.code === 'P2002') {
        console.log(`  ~ Skipped (duplicate slug): ${skill.name.cn}`);
      } else {
        console.log(`  ✗ Error: ${skill.name.cn} - ${err.message}`);
      }
    }
  }

  console.log(`\nDone! Imported: ${imported}, Errors: ${errors}`);
  await prisma.$disconnect();
}

main();
