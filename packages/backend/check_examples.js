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
  // Pick a few examples
  const examples = ['Tào Hồng', 'Liêu Hóa', 'Lưu Thiện', 'My Trúc'];

  // Get from DB
  const dbGenerals = await prisma.general.findMany({
    where: { nameVi: { in: examples } },
    select: { id: true, nameVi: true, nameCn: true, innateSkillId: true, innateSkillName: true }
  });

  // Get from JSON
  const jsonGenerals = JSON.parse(fs.readFileSync('/Users/ducle/codes/tqc/data/generals/all_generals.json', 'utf8'));

  console.log('=== Checking example generals ===\n');

  for (const name of examples) {
    console.log('--- ' + name + ' ---');

    // DB info
    const dbGen = dbGenerals.find(g => g.nameVi === name);
    if (dbGen) {
      console.log('DB: id=' + dbGen.id + ', nameCn=' + dbGen.nameCn);
      console.log('DB: innateSkillId=' + dbGen.innateSkillId + ', innateSkillName=' + dbGen.innateSkillName);
    } else {
      console.log('DB: NOT FOUND');
    }

    // JSON info - try multiple ways to find
    const normalized = normalizeVietnamese(name);
    let jsonGen = jsonGenerals.find(g => normalizeVietnamese(g.name.vi) === normalized);
    if (!jsonGen && dbGen) {
      jsonGen = jsonGenerals.find(g => g.id === dbGen.id || g.id === dbGen.nameCn || g.name.cn === dbGen.nameCn);
    }

    if (jsonGen) {
      console.log('JSON: id=' + jsonGen.id + ', name.vi=' + jsonGen.name.vi + ', name.cn=' + jsonGen.name.cn);
      console.log('JSON: innate_skill=' + (jsonGen.innate_skill?.name?.vi || 'NONE'));
    } else {
      console.log('JSON: NOT FOUND');
      console.log('JSON normalized search: "' + normalized + '"');

      // Show similar names in JSON
      const searchWord = normalized.split(' ')[0];
      const similar = jsonGenerals.filter(g => normalizeVietnamese(g.name.vi).includes(searchWord));
      if (similar.length > 0) {
        console.log('Similar in JSON (containing "' + searchWord + '"):');
        similar.slice(0, 5).forEach(g => console.log('  - ' + g.name.vi + ' (' + g.name.cn + ') [normalized: ' + normalizeVietnamese(g.name.vi) + ']'));
      }
    }
    console.log('');
  }

  await prisma.$disconnect();
}

main();
