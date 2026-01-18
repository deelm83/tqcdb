import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface SkillData {
  name: { cn: string; vi?: string };
  type?: { id?: string; name?: { cn?: string; vi?: string } };
  quality?: string;
  trigger_rate?: number;
  source_type?: string;
  wiki_url?: string;
  effect?: { cn?: string; vi?: string };
  target?: string;
  target_vi?: string;
  army_types?: string[];
  innate_to?: string[];
  inheritance_from?: string[];
  acquisition?: string[];
}

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
  console.log('Starting seed...');

  // Load JSON data
  const generalsPath = path.join(__dirname, '../../../data/generals/all_generals.json');
  const skillsPath = path.join(__dirname, '../../../data/skills/all_skills.json');

  const generalsData: GeneralData[] = JSON.parse(fs.readFileSync(generalsPath, 'utf-8'));
  const skillsData: SkillData[] = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'));

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.general.deleteMany();
  await prisma.skill.deleteMany();

  // Seed skills first
  console.log(`Seeding ${skillsData.length} skills...`);
  for (const skill of skillsData) {
    await prisma.skill.create({
      data: {
        nameCn: skill.name.cn,
        nameVi: skill.name.vi || null,
        typeId: skill.type?.id || 'unknown',
        typeNameCn: skill.type?.name?.cn || null,
        typeNameVi: skill.type?.name?.vi || null,
        quality: skill.quality || null,
        triggerRate: skill.trigger_rate || null,
        sourceType: skill.source_type || null,
        wikiUrl: skill.wiki_url || null,
        effectCn: skill.effect?.cn || null,
        effectVi: skill.effect?.vi || null,
        target: skill.target || null,
        targetVi: skill.target_vi || null,
        armyTypes: skill.army_types || [],
        innateToGeneralNames: skill.innate_to || [],
        inheritanceFromGeneralNames: skill.inheritance_from || [],
        acquisitionType: skill.acquisition?.[0] || null,
      },
    });
  }
  console.log('Skills seeded successfully!');

  // Seed generals
  console.log(`Seeding ${generalsData.length} generals...`);
  const usedSlugs = new Set<string>();
  for (const general of generalsData) {
    let slug = generateSlug(general.name.vi);
    // Handle duplicate slugs by appending a counter
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
        nameCn: general.name.cn,
        nameVi: general.name.vi || null,
        factionId: general.faction_id,
        cost: general.cost || 0,
        wikiUrl: general.wiki_url || null,
        image: general.image || null,
        imageFull: general.image_full || null,
        tagsCn: general.tags?.cn || [],
        tagsVi: general.tags?.vi || [],
        cavalryGrade: general.troop_compatibility?.cavalry?.grade || null,
        shieldGrade: general.troop_compatibility?.shield?.grade || null,
        archerGrade: general.troop_compatibility?.archer?.grade || null,
        spearGrade: general.troop_compatibility?.spear?.grade || null,
        siegeGrade: general.troop_compatibility?.siege?.grade || null,
        innateSkillName: general.innate_skill?.name?.cn || null,
        inheritedSkillName: general.inherited_skill?.name?.cn || null,
      },
    });
  }
  console.log('Generals seeded successfully!');

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
