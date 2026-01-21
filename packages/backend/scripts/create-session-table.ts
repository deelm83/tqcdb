import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create session table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS session (
      sid varchar NOT NULL COLLATE "default",
      sess json NOT NULL,
      expire timestamp(6) NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid)
    )
  `;

  // Create index
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire)
  `;

  console.log('Session table created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
