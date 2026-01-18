import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface GeneralData {
  id: string;
  name: { cn: string; vi?: string };
  faction_id: string;
  cost?: number;
  wiki_url?: string;
  image?: string;
  image_full?: string;
  tags?: { cn?: string[]; vi?: string[] };
  troop_compatibility?: {
    cavalry?: { grade?: string };
    shield?: { grade?: string };
    archer?: { grade?: string };
    spear?: { grade?: string };
    siege?: { grade?: string };
  };
  innate_skill?: { name?: { cn?: string } };
  inherited_skill?: { name?: { cn?: string } };
}

// Remove Vietnamese diacritics
function removeVietnameseDiacritics(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

// Generate URL-friendly slug from Vietnamese name
function generateSlug(nameVi: string | null | undefined): string {
  if (!nameVi) return '';
  return removeVietnameseDiacritics(nameVi)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('Starting SP generals fix v2...');

  // Load JSON data
  const generalsPath = path.join(__dirname, '../../../data/generals/all_generals.json');
  const generalsData: GeneralData[] = JSON.parse(fs.readFileSync(generalsPath, 'utf-8'));

  // Find SP generals in JSON (have "sp" prefix in id)
  const spGenerals = generalsData.filter(g => g.id.toLowerCase().startsWith('sp'));
  // Find non-SP generals in JSON (no "sp" prefix)
  const nonSpGenerals = generalsData.filter(g => !g.id.toLowerCase().startsWith('sp') && g.id !== 'unknown');

  console.log(`Found ${spGenerals.length} SP generals in JSON`);
  console.log(`Found ${nonSpGenerals.length} non-SP generals in JSON`);

  // Get current database state
  const dbGenerals = await prisma.general.findMany({
    select: { id: true, slug: true, name: true }
  });

  // Map of Chinese non-SP ID to SP version
  const spIdMap: Record<string, string> = {};
  for (const sp of spGenerals) {
    // Extract the Chinese name without "sp" prefix
    const chineseName = sp.id.substring(2);
    spIdMap[chineseName] = sp.id;
  }

  // Find SP generals in DB that still have wrong IDs (missing "sp" prefix)
  const spGeneralsInDb = dbGenerals.filter(g =>
    (g.name.startsWith('SP ') || g.name.startsWith('S P ')) &&
    !g.id.startsWith('sp')
  );

  console.log(`Found ${spGeneralsInDb.length} SP generals in database with wrong IDs`);

  // Step 1: Fix SP general IDs using raw SQL with deferred constraints
  console.log('\n--- Step 1: Fix SP general IDs ---');

  for (const dbGeneral of spGeneralsInDb) {
    const correctId = spIdMap[dbGeneral.id];

    if (correctId) {
      console.log(`Fixing: ${dbGeneral.id} (${dbGeneral.name}) -> ${correctId}`);

      // Check if the correct ID already exists
      const existing = await prisma.general.findUnique({ where: { id: correctId } });
      if (existing) {
        console.log(`  -> Skipping: correct ID ${correctId} already exists`);
        continue;
      }

      try {
        // Use raw SQL - first update the general, then update relations
        // This requires deferring FK constraints
        await prisma.$executeRaw`
          -- Temporarily disable FK check
          SET CONSTRAINTS skill_innate_generals_general_id_fkey DEFERRED;
          SET CONSTRAINTS skill_inherit_generals_general_id_fkey DEFERRED;
          SET CONSTRAINTS skill_exchange_generals_general_id_fkey DEFERRED;
        `;

        // Update the general ID first
        await prisma.$executeRaw`UPDATE generals SET id = ${correctId} WHERE id = ${dbGeneral.id}`;

        // Then update relations
        await prisma.$executeRaw`UPDATE skill_innate_generals SET general_id = ${correctId} WHERE general_id = ${dbGeneral.id}`;
        await prisma.$executeRaw`UPDATE skill_inherit_generals SET general_id = ${correctId} WHERE general_id = ${dbGeneral.id}`;
        await prisma.$executeRaw`UPDATE skill_exchange_generals SET general_id = ${correctId} WHERE general_id = ${dbGeneral.id}`;

        await prisma.$executeRaw`
          SET CONSTRAINTS skill_innate_generals_general_id_fkey IMMEDIATE;
          SET CONSTRAINTS skill_inherit_generals_general_id_fkey IMMEDIATE;
          SET CONSTRAINTS skill_exchange_generals_general_id_fkey IMMEDIATE;
        `;

        console.log(`  -> Fixed successfully`);
      } catch (error: any) {
        console.error(`  -> Error fixing ${dbGeneral.id}:`, error.message);
      }
    } else {
      console.log(`No SP mapping found for: ${dbGeneral.id} (${dbGeneral.name})`);
    }
  }

  // Step 2: Restore missing non-SP generals
  console.log('\n--- Step 2: Restore missing non-SP generals ---');

  // Get updated list of DB generals
  const updatedDbGenerals = await prisma.general.findMany({
    select: { id: true, slug: true }
  });
  const dbIds = new Set(updatedDbGenerals.map(g => g.id));
  const existingSlugs = new Set(updatedDbGenerals.map(g => g.slug));

  let restored = 0;

  for (const general of nonSpGenerals) {
    if (!dbIds.has(general.id)) {
      console.log(`Restoring: ${general.id} (${general.name.vi || general.name.cn})`);

      try {
        let slug = generateSlug(general.name.vi);

        // Handle empty slug
        if (!slug) {
          slug = `general-${general.id}`;
        }

        // Handle duplicate slugs
        let finalSlug = slug;
        let counter = 2;
        while (existingSlugs.has(finalSlug)) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
        existingSlugs.add(finalSlug);

        await prisma.general.create({
          data: {
            id: general.id,
            slug: finalSlug,
            name: general.name.vi || general.name.cn,
            factionId: general.faction_id,
            cost: general.cost || 0,
            wikiUrl: general.wiki_url || null,
            image: general.image || null,
            imageFull: general.image_full || null,
            tags: general.tags?.vi || general.tags?.cn || [],
            cavalryGrade: general.troop_compatibility?.cavalry?.grade || null,
            shieldGrade: general.troop_compatibility?.shield?.grade || null,
            archerGrade: general.troop_compatibility?.archer?.grade || null,
            spearGrade: general.troop_compatibility?.spear?.grade || null,
            siegeGrade: general.troop_compatibility?.siege?.grade || null,
            innateSkillName: general.innate_skill?.name?.cn || null,
            inheritedSkillName: general.inherited_skill?.name?.cn || null,
            status: 'needs_update',
          },
        });

        restored++;
        console.log(`  -> Restored successfully with slug: ${finalSlug}`);
      } catch (error: any) {
        console.error(`  -> Error restoring ${general.id}:`, error.message);
      }
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Fixed SP general IDs: attempted ${spGeneralsInDb.length}`);
  console.log(`Restored ${restored} non-SP generals`);

  // Final count
  const finalCount = await prisma.general.count();
  console.log(`Total generals in database: ${finalCount}`);

  // Show remaining SP generals with wrong IDs
  const remainingWrong = await prisma.general.findMany({
    where: {
      OR: [
        { name: { startsWith: 'SP ' } },
        { name: { startsWith: 'S P ' } },
      ],
      NOT: { id: { startsWith: 'sp' } }
    },
    select: { id: true, name: true }
  });

  if (remainingWrong.length > 0) {
    console.log(`\nRemaining SP generals with wrong IDs:`);
    for (const g of remainingWrong) {
      console.log(`  - ${g.id}: ${g.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
