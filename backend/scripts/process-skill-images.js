#!/usr/bin/env node
/**
 * Process game screenshots of skills and extract data to JSON.
 * Uses Claude's vision API to extract structured data from images.
 *
 * Features:
 * - Detects duplicate skills (multiple images for same skill)
 * - Renames image files to Vietnamese slug format
 * - Stores list of screenshots for each skill
 *
 * Usage:
 *   node process-skill-images.js <input_folder> [--output output.json] [--rename]
 *
 * Example:
 *   node process-skill-images.js ../data/skills/import --output ../data/skills/import_output.json --rename
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk').default;

// Parse command line arguments
const args = process.argv.slice(2);
let inputFolder = null;
let outputFile = 'skills_output.json';
let shouldRename = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' || args[i] === '-o') {
    outputFile = args[++i];
  } else if (args[i] === '--rename' || args[i] === '-r') {
    shouldRename = true;
  } else if (!inputFolder) {
    inputFolder = args[i];
  }
}

if (!inputFolder) {
  console.log('Usage: node process-skill-images.js <input_folder> [--output output.json] [--rename]');
  console.log('');
  console.log('Options:');
  console.log('  --output, -o    Output JSON file (default: skills_output.json)');
  console.log('  --rename, -r    Rename image files to Vietnamese slug format');
  process.exit(1);
}

// Check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable not set');
  process.exit(1);
}

const anthropic = new Anthropic();

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

async function extractSkillData(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  const ext = path.extname(imagePath).toLowerCase();
  const mediaTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  const mediaType = mediaTypes[ext] || 'image/jpeg';

  const prompt = `Analyze this game skill screenshot from 三国志战略版 (Three Kingdoms Strategy).

Extract the following information and return it as valid JSON:

{
    "nameCn": "<Skill name in Chinese>",
    "nameVi": "<Skill name in Vietnamese>",
    "typeId": "<command|active|passive|pursuit|assault|troop|internal>",
    "typeNameCn": "<Type name in Chinese, e.g. 指挥, 主动, 被动>",
    "typeNameVi": "<Type name in Vietnamese, e.g. Chỉ Huy, Chủ Động, Bị Động>",
    "quality": "<S|A|B|C or null>",
    "triggerRate": <number 0-100 or null if not shown>,
    "sourceType": "<innate|inherited or null>",
    "effectCn": "<Skill effect description in Chinese>",
    "effectVi": "<Skill effect description in Vietnamese>",
    "target": "<target_id>",
    "targetVi": "<Target description in Vietnamese>",
    "armyTypes": ["<cavalry|shield|archer|spear|siege>"],
    "innateToGeneralNames": ["<Chinese names of generals who have this as innate>"],
    "inheritanceFromGeneralNames": ["<Chinese names of generals who can pass this skill>"],
    "acquisitionType": "<inherit|innate|exchange or null>",
    "exchangeType": "<exact|any or null if not exchange skill>",
    "exchangeGenerals": ["<Chinese names of generals needed for exchange>"],
    "exchangeCount": <number of generals needed for "any" type, or null>,
    "wikiUrl": "<wiki URL if visible, or null>"
}

SKILL TYPE - Look for skill type in the header or under "Loại hình:" label:
- "command" = 指挥 / Chỉ huy / Chỉ Huy
- "active" = 主动 / Chủ động / Chủ Động
- "passive" = 被动 / Bị động / Bị Động
- "pursuit" = 追击 / Truy kích / Truy Kích
- "assault" = 突击 / Đột kích / Đột Kích
- "troop" = 兵种 / Binh chủng / Binh Chủng
- "internal" = 内政 / Nội chính / Nội Chính

ARMY TYPES - Look for "Thích hợp:" section with icons:
- "cavalry" = 骑 / Kỵ (horse icon)
- "shield" = 盾 / Thuẫn (shield icon)
- "archer" = 弓 / Cung (bow icon)
- "spear" = 枪 / Thương (spear icon)
- "siege" = 器 / Khí (wheel/siege icon)

Only include army types that are shown/highlighted (not grayed out).

TARGET - Look for "Mục tiêu:" label:
- "self" = 自身 / Bản thân
- "ally_1" = 1名友军 / 1 đồng minh
- "ally_2" = 2名友军 / 2 đồng minh
- "ally_all" = 全体友军 / Tất cả quân ta
- "ally_1_2" = 1-2名友军 / 1-2 đồng minh
- "ally_2_3" = 2-3名友军 / 2-3 đồng minh
- "enemy_1" = 1名敌军 / 1 địch
- "enemy_2" = 2名敌军 / 2 địch
- "enemy_all" = 全体敌军 / Tất cả địch
- "enemy_1_2" = 1-2名敌军 / 1-2 địch
- "enemy_2_3" = 2-3名敌军 / 2-3 địch

ACQUISITION - Look for how to obtain the skill:
- "innate" = only available as innate skill (天生/自带)
- "inherit" = can be inherited from a general (传承)
- "exchange" = obtained by exchanging generals (兑换)

For exchange skills:
- "exact" = need specific generals
- "any" = any generals from a pool, use exchangeCount for how many

Extract all visible information. If a field is not visible, use null or empty array.
Preserve exact text for effect descriptions including numbers and percentages.

Return ONLY the JSON object, no other text.`;

  try {
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
                data: base64Image
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    });

    let resultText = response.content[0].text.trim();

    // Extract JSON from markdown code blocks if present
    const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      resultText = jsonMatch[1];
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const data = JSON.parse(resultText);

    // Generate slug from Vietnamese name
    data.slug = generateSlug(data.nameVi);

    // Add default status
    data.status = 'needs_update';

    // Ensure arrays are arrays
    for (const key of ['armyTypes', 'innateToGeneralNames', 'inheritanceFromGeneralNames', 'exchangeGenerals']) {
      if (!data[key]) {
        data[key] = [];
      }
    }

    return data;

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`  Error parsing JSON response: ${error.message}`);
    } else {
      console.error(`  Error processing image: ${error.message}`);
    }
    return null;
  }
}

async function processFolder(inputFolder, outputFile, shouldRename) {
  const inputPath = path.resolve(inputFolder);

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Folder '${inputFolder}' does not exist`);
    process.exit(1);
  }

  const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
  const files = fs.readdirSync(inputPath)
    .filter(f => imageExtensions.has(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.log(`No image files found in '${inputFolder}'`);
    process.exit(1);
  }

  console.log(`Found ${files.length} images to process\n`);

  // Map to store skills by Chinese name (for deduplication)
  const skillsMap = new Map();
  // Track original file -> extracted data
  const fileDataMap = new Map();
  const errors = [];

  // Phase 1: Extract data from all images
  console.log('Phase 1: Extracting skill data from images...\n');

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`[${i + 1}/${files.length}] Processing: ${file}`);

    const data = await extractSkillData(path.join(inputPath, file));

    if (data) {
      console.log(`  Extracted: ${data.nameCn || 'unknown'} (${data.nameVi || ''})`);
      fileDataMap.set(file, data);

      // Group by Chinese name for deduplication
      const key = data.nameCn;
      if (!skillsMap.has(key)) {
        skillsMap.set(key, {
          data: data,
          originalFiles: [file]
        });
      } else {
        // Duplicate found - add to existing skill's file list
        console.log(`  -> Duplicate detected, merging with existing skill`);
        skillsMap.get(key).originalFiles.push(file);
      }
    } else {
      errors.push(file);
    }
  }

  // Phase 2: Rename files and build final skill list
  console.log('\n' + '='.repeat(50));
  console.log('Phase 2: Processing duplicates and renaming files...\n');

  const skills = [];
  const renameMap = new Map(); // oldName -> newName

  for (const [nameCn, skillInfo] of skillsMap) {
    const { data, originalFiles } = skillInfo;
    const slug = data.slug || generateSlug(data.nameVi) || 'unknown';
    const ext = path.extname(originalFiles[0]).toLowerCase();

    // Generate new filenames
    const newFilenames = [];

    for (let i = 0; i < originalFiles.length; i++) {
      const oldFile = originalFiles[i];
      const oldExt = path.extname(oldFile).toLowerCase();

      // If multiple images for same skill, add index
      const newFilename = originalFiles.length > 1
        ? `${slug}-${i + 1}${oldExt}`
        : `${slug}${oldExt}`;

      newFilenames.push(newFilename);
      renameMap.set(oldFile, newFilename);

      console.log(`  ${oldFile} -> ${newFilename}`);
    }

    // Add screenshots array to skill data
    data.screenshots = newFilenames;
    skills.push(data);
  }

  // Phase 3: Actually rename files if --rename flag is set
  if (shouldRename) {
    console.log('\nPhase 3: Renaming files...\n');

    // First, rename to temp names to avoid conflicts
    const tempRenames = [];
    for (const [oldName, newName] of renameMap) {
      const tempName = `_temp_${Date.now()}_${oldName}`;
      const oldPath = path.join(inputPath, oldName);
      const tempPath = path.join(inputPath, tempName);

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, tempPath);
        tempRenames.push({ tempName, newName });
      }
    }

    // Then rename from temp to final names
    for (const { tempName, newName } of tempRenames) {
      const tempPath = path.join(inputPath, tempName);
      const newPath = path.join(inputPath, newName);

      // Handle case where target already exists
      if (fs.existsSync(newPath)) {
        const baseName = path.basename(newName, path.extname(newName));
        const ext = path.extname(newName);
        let counter = 1;
        let uniquePath = newPath;
        while (fs.existsSync(uniquePath)) {
          uniquePath = path.join(inputPath, `${baseName}-${counter}${ext}`);
          counter++;
        }
        fs.renameSync(tempPath, uniquePath);
        console.log(`  Renamed (with conflict resolution): ${tempName} -> ${path.basename(uniquePath)}`);
      } else {
        fs.renameSync(tempPath, newPath);
        console.log(`  Renamed: ${tempName.replace(/^_temp_\d+_/, '')} -> ${newName}`);
      }
    }
  } else {
    console.log('\nSkipping file rename (use --rename flag to rename files)');
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Summary:`);
  console.log(`  Total images processed: ${files.length}`);
  console.log(`  Unique skills extracted: ${skills.length}`);
  console.log(`  Duplicates merged: ${files.length - errors.length - skills.length}`);

  if (errors.length > 0) {
    console.log(`  Errors: ${errors.length} files`);
    errors.forEach(err => console.log(`    - ${err}`));
  }

  // Write output
  const outputPath = path.resolve(outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(skills, null, 2), 'utf-8');
  console.log(`\nOutput written to: ${outputPath}`);

  return skills;
}

// Run
processFolder(inputFolder, outputFile, shouldRename);
