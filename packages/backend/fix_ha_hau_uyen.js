const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create the missing skill
  const skill = await prisma.skill.create({
    data: {
      slug: 'tuong-hanh-ky-tat-2',
      nameCn: '将行其疾',
      nameVi: 'Tướng Hành Kỳ Tật',
      typeId: 'unknown',
      quality: 'S',
      sourceType: 'innate',
      status: 'needs_update',
    }
  });
  console.log('Created skill:', skill.id, skill.nameCn, skill.nameVi);

  // Link to Hạ Hầu Uyên
  const general = await prisma.general.updateMany({
    where: { nameVi: 'Hạ Hầu Uyên' },
    data: { innateSkillId: skill.id }
  });
  console.log('Updated generals:', general.count);

  await prisma.$disconnect();
}

main();
