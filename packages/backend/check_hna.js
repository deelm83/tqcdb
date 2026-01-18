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
  // Get all Hoàng Nguyệt Anh from DB
  const dbGenerals = await prisma.general.findMany({
    where: {
      OR: [
        { nameVi: { contains: 'Nguyệt Anh' } },
        { nameCn: { contains: '黄月英' } },
        { nameVi: { contains: 'Hoàng Nguyệt' } }
      ]
    },
    include: {
      innateSkill: { select: { id: true, nameCn: true, nameVi: true } }
    }
  });

  // Get from JSON
  const jsonGenerals = JSON.parse(fs.readFileSync('/Users/ducle/codes/tqc/data/generals/all_generals.json', 'utf8'));
  const jsonHNA = jsonGenerals.filter(g =>
    g.name.vi.includes('Nguyệt Anh') ||
    g.name.cn.includes('黄月英') ||
    g.id.includes('黄月英')
  );

  console.log('=== Hoàng Nguyệt Anh in DATABASE ===\n');
  for (const gen of dbGenerals) {
    console.log('DB Record:');
    console.log('  id:', gen.id);
    console.log('  nameVi:', gen.nameVi);
    console.log('  nameCn:', gen.nameCn);
    console.log('  normalized:', normalizeVietnamese(gen.nameVi));
    console.log('  innateSkillId:', gen.innateSkillId);
    console.log('  innateSkillName (legacy):', gen.innateSkillName);
    if (gen.innateSkill) {
      console.log('  innateSkill:', gen.innateSkill.nameVi, '(' + gen.innateSkill.nameCn + ')');
    }
    console.log('');
  }

  console.log('=== Hoàng Nguyệt Anh in JSON ===\n');
  for (const gen of jsonHNA) {
    console.log('JSON Record:');
    console.log('  id:', gen.id);
    console.log('  name.vi:', gen.name.vi);
    console.log('  name.cn:', gen.name.cn);
    console.log('  normalized:', normalizeVietnamese(gen.name.vi));
    console.log('  innate_skill.name.vi:', gen.innate_skill?.name?.vi);
    console.log('  innate_skill.name.cn:', gen.innate_skill?.name?.cn);
    console.log('');
  }

  // Check matching
  console.log('=== MATCHING ANALYSIS ===\n');
  for (const dbGen of dbGenerals) {
    const dbNormalized = normalizeVietnamese(dbGen.nameVi);
    const jsonMatch = jsonHNA.find(j => normalizeVietnamese(j.name.vi) === dbNormalized);

    console.log(dbGen.nameVi + ' (normalized: "' + dbNormalized + '")');
    if (jsonMatch) {
      console.log('  -> JSON MATCH: ' + jsonMatch.name.vi + ' (normalized: "' + normalizeVietnamese(jsonMatch.name.vi) + '")');
      console.log('  -> Skill: ' + jsonMatch.innate_skill?.name?.vi);
    } else {
      console.log('  -> NO JSON MATCH');
      // Show what's in JSON for comparison
      jsonHNA.forEach(j => {
        console.log('     JSON has: "' + normalizeVietnamese(j.name.vi) + '" (' + j.name.vi + ')');
      });
    }
    console.log('');
  }

  await prisma.$disconnect();
}

main();
