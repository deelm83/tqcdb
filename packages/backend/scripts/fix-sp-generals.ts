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
  console.log('Starting SP generals fix...');

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

  // Find SP generals in DB that have wrong IDs (missing "sp" prefix)
  const spGeneralsInDb = dbGenerals.filter(g =>
    g.name.startsWith('SP ') || g.name.startsWith('S P ')
  );

  console.log(`Found ${spGeneralsInDb.length} SP generals in database`);

  // Map of Chinese non-SP ID to SP version
  const spIdMap: Record<string, string> = {};
  for (const sp of spGenerals) {
    // Extract the Chinese name without "sp" prefix
    const chineseName = sp.id.substring(2);
    spIdMap[chineseName] = sp.id;
    console.log(`SP mapping: ${chineseName} -> ${sp.id}`);
  }

  // Step 1: Fix SP general IDs in database
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
        // Use raw SQL to update the ID and cascade to relations
        await prisma.$transaction(async (tx) => {
          // Update foreign key references first
          await tx.$executeRaw`UPDATE skill_innate_generals SET general_id = ${correctId} WHERE general_id = ${dbGeneral.id}`;
          await tx.$executeRaw`UPDATE skill_inherit_generals SET general_id = ${correctId} WHERE general_id = ${dbGeneral.id}`;
          await tx.$executeRaw`UPDATE skill_exchange_generals SET general_id = ${correctId} WHERE general_id = ${dbGeneral.id}`;

          // Update the general ID
          await tx.$executeRaw`UPDATE generals SET id = ${correctId} WHERE id = ${dbGeneral.id}`;
        });

        console.log(`  -> Fixed successfully`);
      } catch (error) {
        console.error(`  -> Error fixing ${dbGeneral.id}:`, error);
      }
    } else {
      console.log(`No SP mapping found for: ${dbGeneral.id} (${dbGeneral.name})`);
    }
  }

  // Step 2: Restore missing non-SP generals
  console.log('\n--- Step 2: Restore missing non-SP generals ---');

  // Get updated list of DB generals
  const updatedDbGenerals = await prisma.general.findMany({
    select: { id: true }
  });
  const dbIds = new Set(updatedDbGenerals.map(g => g.id));

  let restored = 0;
  const usedSlugs = new Set(updatedDbGenerals.map(g => g.id));

  for (const general of nonSpGenerals) {
    if (!dbIds.has(general.id)) {
      console.log(`Restoring: ${general.id} (${general.name.vi || general.name.cn})`);

      try {
        let slug = generateSlug(general.name.vi);

        // Handle duplicate slugs
        if (usedSlugs.has(slug)) {
          let counter = 2;
          while (usedSlugs.has(`${slug}-${counter}`)) {
            counter++;
          }
          slug = `${slug}-${counter}`;
        }
        usedSlugs.add(slug);

        await prisma.general.create({
          data: {
            id: general.id,
            slug,
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
        console.log(`  -> Restored successfully with slug: ${slug}`);
      } catch (error) {
        console.error(`  -> Error restoring ${general.id}:`, error);
      }
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Fixed ${spGeneralsInDb.length} SP general IDs`);
  console.log(`Restored ${restored} non-SP generals`);

  // Final count
  const finalCount = await prisma.general.count();
  console.log(`Total generals in database: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
