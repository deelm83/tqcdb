const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const searchTerm = process.argv[2] || 'cong than';

  console.log('Searching PostgreSQL database for: "' + searchTerm + '"\n');

  // Raw SQL query with unaccent-like search
  const results = await prisma.$queryRaw`
    SELECT id, slug, name_vi, name_cn
    FROM skills
    WHERE LOWER(
      TRANSLATE(name_vi,
        'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ[]',
        'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyydAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD'
      )
    ) LIKE ${'%' + searchTerm.toLowerCase() + '%'}
    LIMIT 20
  `;

  console.log('Results from PostgreSQL:');
  results.forEach(r => {
    console.log('  #' + r.id + ' [' + r.slug + ']: ' + r.name_vi + ' (' + r.name_cn + ')');
  });

  await prisma.$disconnect();
}

main();
