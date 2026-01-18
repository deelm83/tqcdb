const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

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
  // Get ALL generals without innateSkillId
  const dbGenerals = await prisma.general.findMany({
    where: { innateSkillId: null },
    select: { id: true, nameVi: true, nameCn: true, innateSkillId: true, innateSkillName: true }
  });

  // Get from JSON
  const jsonGenerals = JSON.parse(fs.readFileSync('/Users/ducle/codes/tqc/data/generals/all_generals.json', 'utf8'));

  // Get all skills from DB
  const skills = await prisma.skill.findMany({
    select: { id: true, nameCn: true, nameVi: true }
  });

  console.log('=== Generals without innateSkillId ===\n');
  console.log('Total:', dbGenerals.length);
  console.log('');

  for (const dbGen of dbGenerals.slice(0, 15)) {
    console.log('--- ' + dbGen.nameVi + ' ---');
    console.log('DB id: ' + dbGen.id);
    console.log('DB nameCn: ' + dbGen.nameCn);
    console.log('DB innateSkillName (legacy): ' + (dbGen.innateSkillName || 'NULL'));

    // Check JSON for this general
    const normalized = normalizeVietnamese(dbGen.nameVi);
    let jsonGen = jsonGenerals.find(g => normalizeVietnamese(g.name.vi) === normalized);
    if (!jsonGen) {
      jsonGen = jsonGenerals.find(g => g.id === dbGen.id || g.name.cn === dbGen.nameCn);
    }

    if (jsonGen) {
      const skillNameVi = jsonGen.innate_skill?.name?.vi;
      const skillNameCn = jsonGen.innate_skill?.name?.cn;
      console.log('JSON skill: ' + skillNameVi + ' (' + skillNameCn + ')');

      // Try to find matching skill in DB
      if (skillNameVi) {
        const normalizedSkill = normalizeVietnamese(skillNameVi);
        const matchedSkill = skills.find(s => normalizeVietnamese(s.nameVi) === normalizedSkill);
        if (matchedSkill) {
          console.log('MATCH FOUND: Skill #' + matchedSkill.id + ' ' + matchedSkill.nameVi);
        } else {
          console.log('No skill match for: "' + normalizedSkill + '"');
        }
      }
    } else {
      console.log('JSON: NOT IN SOURCE FILE');
    }
    console.log('');
  }

  await prisma.$disconnect();
}

main();
