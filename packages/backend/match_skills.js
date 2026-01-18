const { PrismaClient } = require('@prisma/client');
const fs = require("fs");
const prisma = new PrismaClient();

// Normalize Vietnamese by removing diacritics
function normalizeVietnamese(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

async function main() {
  const generalsJson = JSON.parse(fs.readFileSync("/Users/ducle/codes/tqc/data/generals/all_generals.json", "utf8"));

  // Create lookup maps from JSON by Vietnamese name (normalized)
  const jsonByNameVi = new Map();
  generalsJson.forEach(g => {
    const normalized = normalizeVietnamese(g.name.vi);
    jsonByNameVi.set(normalized, g);
  });

  // Get all skills from DB
  const skills = await prisma.skill.findMany({
    select: { id: true, nameCn: true, nameVi: true }
  });

  // Create skill lookup by normalized Vietnamese name
  const skillByNameVi = new Map();
  skills.forEach(s => {
    const normalized = normalizeVietnamese(s.nameVi);
    skillByNameVi.set(normalized, s);
  });

  // Get generals without innate skill ID
  const generalsWithoutSkillId = await prisma.general.findMany({
    where: { innateSkillId: null },
    select: {
      id: true,
      nameVi: true,
      nameCn: true,
    }
  });

  console.log(`Generals without innateSkillId in DB: ${generalsWithoutSkillId.length}`);
  console.log("\n=== MATCHING ANALYSIS (using Vietnamese names) ===\n");

  const matchable = [];
  const noJsonData = [];
  const noSkillMatch = [];

  for (const general of generalsWithoutSkillId) {
    // Try to find this general in JSON by normalized Vietnamese name
    const normalizedName = normalizeVietnamese(general.nameVi);
    const jsonGeneral = jsonByNameVi.get(normalizedName);

    if (!jsonGeneral) {
      noJsonData.push({ id: general.id, nameVi: general.nameVi });
      continue;
    }

    const skillNameVi = jsonGeneral.innate_skill?.name?.vi;
    const skillNameCn = jsonGeneral.innate_skill?.name?.cn;
    if (!skillNameVi) {
      noJsonData.push({ id: general.id, nameVi: general.nameVi, reason: "No skill in JSON" });
      continue;
    }

    // Try to match skill by normalized Vietnamese name
    const normalizedSkillName = normalizeVietnamese(skillNameVi);
    const skill = skillByNameVi.get(normalizedSkillName);

    if (skill) {
      matchable.push({
        generalId: general.id,
        generalName: general.nameVi,
        skillNameVi: skillNameVi,
        skillNameCn: skillNameCn,
        skillId: skill.id,
        matchedSkillVi: skill.nameVi
      });
    } else {
      noSkillMatch.push({
        generalId: general.id,
        generalName: general.nameVi,
        skillNameVi: skillNameVi,
        skillNameCn: skillNameCn,
        normalizedSkill: normalizedSkillName
      });
    }
  }

  console.log(`Matchable (JSON has skill + skill exists in DB): ${matchable.length}`);
  matchable.forEach(m => console.log(`  ${m.generalName}: "${m.skillNameVi}" -> Skill #${m.skillId} (${m.matchedSkillVi})`));

  console.log(`\nNo JSON data found: ${noJsonData.length}`);
  noJsonData.slice(0, 15).forEach(g => console.log(`  ${g.nameVi} (${g.id})${g.reason ? ' - ' + g.reason : ''}`));
  if (noJsonData.length > 15) console.log(`  ... and ${noJsonData.length - 15} more`);

  console.log(`\nHas skill name in JSON but skill not in DB: ${noSkillMatch.length}`);
  noSkillMatch.forEach(g => console.log(`  ${g.generalName}: "${g.skillNameVi}" (${g.skillNameCn}) [normalized: ${g.normalizedSkill}]`));

  // Apply updates if --update flag
  if (process.argv.includes("--update") && matchable.length > 0) {
    console.log("\n=== APPLYING UPDATES ===");
    for (const m of matchable) {
      await prisma.general.update({
        where: { id: m.generalId },
        data: { innateSkillId: m.skillId }
      });
      console.log(`  Updated ${m.generalName} -> Skill #${m.skillId}`);
    }
    console.log("Done!");
  } else if (matchable.length > 0) {
    console.log("\nRun with --update to apply these changes");
  }

  await prisma.$disconnect();
}

main();
