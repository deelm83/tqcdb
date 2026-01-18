const { PrismaClient } = require('@prisma/client');
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
  const searchTerm = process.argv[2] || 'cong than';
  const normalized = normalizeVietnamese(searchTerm);

  console.log('Searching for: "' + searchTerm + '"');
  console.log('Normalized: "' + normalized + '"\n');

  const skills = await prisma.skill.findMany({
    select: { id: true, nameCn: true, nameVi: true, quality: true, typeId: true }
  });

  const matches = skills.filter(s => {
    const skillNormalized = normalizeVietnamese(s.nameVi);
    return skillNormalized.includes(normalized) || normalized.includes(skillNormalized);
  });

  console.log('Matching skills:');
  matches.forEach(s => {
    const skillNormalized = normalizeVietnamese(s.nameVi);
    console.log('  #' + s.id + ': ' + s.nameVi + ' [' + skillNormalized + '] - ' + s.nameCn);
  });

  await prisma.$disconnect();
}

main();
