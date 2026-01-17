#!/usr/bin/env node

/**
 * Mass Import Skills from Images
 *
 * Usage:
 *   node scripts/import-skills.js /path/to/folder
 *
 * The script will:
 * 1. Scan the folder for image files (jpg, png, webp)
 * 2. Process each image using Claude AI to extract skill data
 * 3. Create or update skills in the database
 *
 * Options:
 *   --dry-run    Preview what would be imported without saving
 *   --update     Update existing skills if they exist (default: skip)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const Anthropic = require('@anthropic-ai/sdk').default;

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const folderPath = args.find(arg => !arg.startsWith('--'));
const dryRun = args.includes('--dry-run');
const updateExisting = args.includes('--update');

if (!folderPath) {
  console.error('Usage: node scripts/import-skills.js /path/to/folder [--dry-run] [--update]');
  console.error('');
  console.error('Options:');
  console.error('  --dry-run    Preview what would be imported without saving');
  console.error('  --update     Update existing skills if they exist (default: skip)');
  process.exit(1);
}

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Helper to generate slug from Vietnamese name
function generateSlug(nameVi) {
  if (!nameVi) return null;
  return nameVi
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Process a single image with Claude AI
async function processImage(anthropic, imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mediaType = ext === '.png' ? 'image/png' :
                    ext === '.webp' ? 'image/webp' : 'image/jpeg';

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Analyze this game skill screenshot and extract the skill information. Return ONLY a JSON object with the following structure (no markdown, no explanation):

{
  "name": {"cn": "Chinese name", "vi": "Vietnamese name"},
  "type": {"id": "type_id", "name": {"cn": "Chinese type", "vi": "Vietnamese type"}},
  "quality": "S/A/B/C",
  "trigger_rate": number or null,
  "target": "target_id",
  "target_vi": "Vietnamese target description",
  "army_types": ["cavalry", "shield", "archer", "spear", "siege"],
  "effect": {"cn": "Chinese effect text", "vi": "Vietnamese effect text"},
  "innate_to": ["general names who have this as innate skill"],
  "inheritance_from": ["general names who can pass this skill"]
}

SKILL TYPE - Look for skill type in TWO places:
1. In the header bar after skill name (e.g., "S | Skill Name | Type 100%")
2. Under "Loại hình:" label on the left side

Map the type text to these IDs:
- "command" = 指挥 / Chỉ huy / Chỉ Huy
- "active" = 主动 / Chủ động / Chủ Động
- "passive" = 被动 / Bị động / Bị Động
- "pursuit" = 追击 / Truy kích / Truy Kích
- "assault" = 突击 / Đột kích / Đột Kích
- "troop" = 兵种 / Binh chủng / Binh Chủng (for troop-specific skills)
- "internal" = 内政 / Nội chính / Nội Chính (for internal affairs skills)

IMPORTANT: If the type contains "Binh chủng" or "兵种", use id "troop".

ARMY TYPES - Look for "Thích hợp:" section with small icons. Extract which troop types can use this skill:
- "cavalry" = 骑 / Kỵ (horse icon)
- "shield" = 盾 / Thuẫn (shield icon)
- "archer" = 弓 / Cung (bow icon)
- "spear" = 枪 / Thương (spear icon)
- "siege" = 器 / Khí (wheel/siege icon)

Only include army_types that are shown/highlighted. If icons are grayed out or crossed, don't include them.

TARGET - Look for "Mục tiêu:" label. Map to these target IDs:
- "self" = 自身 / Bản thân (self only)
- "ally_1" = 1名友军 / 1 đồng minh
- "ally_2" = 2名友军 / 2 đồng minh
- "ally_all" = 全体友军/我军全体/Tất cả quân ta (all allies, 3 generals)
- "ally_1_2" = 1-2名友军 / 1-2 đồng minh
- "ally_2_3" = 2-3名友军 / 2-3 đồng minh
- "enemy_1" = 1名敌军 / 1 địch
- "enemy_2" = 2名敌军 / 2 địch
- "enemy_all" = 全体敌军/敌军全体/Tất cả địch (all enemies)
- "enemy_1_2" = 1-2名敌军 / 1-2 địch
- "enemy_2_3" = 2-3名敌军 / 2-3 địch

For "target" field, return the target ID (e.g., "ally_all", "enemy_2"). For "target_vi" field, return the Vietnamese label.

Extract all visible information. If a field is not visible, use null or empty array. For effect text, preserve the exact text including numbers and percentages.`,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response format');
  }

  // Parse JSON from response
  let jsonText = content.text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(jsonText);
}

// Save skill to database
async function saveSkill(skillData, updateExisting) {
  const slug = generateSlug(skillData.name?.vi);

  // Check if skill exists by Chinese name or slug
  let existing = null;
  if (skillData.name?.cn) {
    existing = await prisma.skill.findUnique({
      where: { nameCn: skillData.name.cn }
    });
  }
  if (!existing && slug) {
    existing = await prisma.skill.findUnique({
      where: { slug }
    });
  }

  if (existing && !updateExisting) {
    return { action: 'skipped', skill: existing, reason: 'already exists' };
  }

  const data = {
    slug,
    nameCn: skillData.name?.cn || '',
    nameVi: skillData.name?.vi || '',
    typeId: skillData.type?.id || '',
    typeNameCn: skillData.type?.name?.cn || null,
    typeNameVi: skillData.type?.name?.vi || null,
    quality: skillData.quality || null,
    triggerRate: skillData.trigger_rate || null,
    effectCn: skillData.effect?.cn || null,
    effectVi: skillData.effect?.vi || null,
    target: skillData.target || null,
    targetVi: skillData.target_vi || null,
    armyTypes: skillData.army_types || [],
    innateToGeneralNames: skillData.innate_to || [],
    inheritanceFromGeneralNames: skillData.inheritance_from || [],
    status: 'needs_update', // Mark as needs review after import
  };

  if (existing) {
    const updated = await prisma.skill.update({
      where: { id: existing.id },
      data,
    });
    return { action: 'updated', skill: updated };
  } else {
    const created = await prisma.skill.create({
      data,
    });
    return { action: 'created', skill: created };
  }
}

async function main() {
  console.log('');
  console.log('=== Mass Skill Import ===');
  console.log(`Folder: ${folderPath}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`Update existing: ${updateExisting ? 'Yes' : 'No (skip)'}`);
  console.log('');

  // Check folder exists
  if (!fs.existsSync(folderPath)) {
    console.error(`Error: Folder not found: ${folderPath}`);
    process.exit(1);
  }

  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY not set in environment');
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey });

  // Get all image files
  const files = fs.readdirSync(folderPath)
    .filter(f => SUPPORTED_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort();

  console.log(`Found ${files.length} image files`);
  console.log('');

  if (files.length === 0) {
    console.log('No images to process.');
    process.exit(0);
  }

  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(folderPath, file);
    const progress = `[${i + 1}/${files.length}]`;

    process.stdout.write(`${progress} ${file}... `);

    try {
      // Extract skill data from image
      const skillData = await processImage(anthropic, filePath);

      if (!skillData.name?.vi && !skillData.name?.cn) {
        console.log('FAILED (no name extracted)');
        results.failed++;
        continue;
      }

      const skillName = skillData.name?.vi || skillData.name?.cn;

      if (dryRun) {
        console.log(`OK - Would import: ${skillName}`);
        results.created++;
      } else {
        // Save to database
        const result = await saveSkill(skillData, updateExisting);

        if (result.action === 'created') {
          console.log(`CREATED: ${skillName}`);
          results.created++;
        } else if (result.action === 'updated') {
          console.log(`UPDATED: ${skillName}`);
          results.updated++;
        } else {
          console.log(`SKIPPED: ${skillName} (${result.reason})`);
          results.skipped++;
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.log(`FAILED: ${error.message}`);
      results.failed++;
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Created: ${results.created}`);
  console.log(`Updated: ${results.updated}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Failed: ${results.failed}`);
  console.log('');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
