const { PrismaClient } = require('@prisma/client');
const fs = require("fs");
const prisma = new PrismaClient();

async function main() {
  const skillsJson = JSON.parse(fs.readFileSync("/Users/ducle/codes/tqc/data/skills/all_skills.json", "utf8"));
  const dbSkills = await prisma.skill.findMany({
    select: { id: true, nameCn: true, nameVi: true }
  });

  console.log(`Skills in JSON: ${skillsJson.length}`);
  console.log(`Skills in DB: ${dbSkills.length}`);

  // Create maps
  const dbSkillNames = new Set(dbSkills.map(s => s.nameCn));
  const jsonSkillNames = new Set(skillsJson.map(s => s.name.cn));

  // Find skills in JSON but not in DB
  const inJsonNotDb = skillsJson.filter(s => !dbSkillNames.has(s.name.cn));
  console.log(`\nSkills in JSON but NOT in DB: ${inJsonNotDb.length}`);
  inJsonNotDb.forEach(s => console.log(`  - ${s.name.cn} (${s.name.vi})`));

  // Find skills in DB but not in JSON
  const inDbNotJson = dbSkills.filter(s => !jsonSkillNames.has(s.nameCn));
  console.log(`\nSkills in DB but NOT in JSON: ${inDbNotJson.length}`);
  inDbNotJson.slice(0, 20).forEach(s => console.log(`  - ${s.nameCn} (${s.nameVi})`));
  if (inDbNotJson.length > 20) console.log(`  ... and ${inDbNotJson.length - 20} more`);

  await prisma.$disconnect();
}

main();
