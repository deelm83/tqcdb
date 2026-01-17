#!/usr/bin/env node
/**
 * Import skills from JSON file into database
 *
 * Usage:
 *   node import-skills-json.js <json_file>
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importSkills(jsonFile) {
  const filePath = path.resolve(jsonFile);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File '${jsonFile}' does not exist`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  console.log(`Found ${data.length} skills to import\n`);

  let imported = 0;
  let errors = [];

  for (const skill of data) {
    try {
      await prisma.skill.create({
        data: {
          slug: skill.slug,
          nameCn: skill.nameCn,
          nameVi: skill.nameVi,
          typeId: skill.typeId || 'passive',
          typeNameCn: skill.typeNameCn,
          typeNameVi: skill.typeNameVi,
          quality: skill.quality,
          triggerRate: skill.triggerRate,
          sourceType: skill.sourceType,
          wikiUrl: skill.wikiUrl,
          effectCn: skill.effectCn,
          effectVi: skill.effectVi,
          target: skill.target,
          targetVi: skill.targetVi,
          armyTypes: skill.armyTypes || [],
          innateToGeneralNames: skill.innateToGeneralNames || [],
          inheritanceFromGeneralNames: skill.inheritanceFromGeneralNames || [],
          acquisitionType: skill.acquisitionType,
          exchangeType: skill.exchangeType,
          exchangeGenerals: skill.exchangeGenerals || [],
          exchangeCount: skill.exchangeCount,
          status: skill.status || 'needs_update',
          screenshots: skill.screenshots || [],
        }
      });

      imported++;
      console.log(`[${imported}] Imported: ${skill.nameCn} (${skill.nameVi})`);
    } catch (error) {
      if (error.code === 'P2002') {
        // Duplicate key error
        console.log(`[SKIP] Duplicate: ${skill.nameCn} (${skill.nameVi})`);
      } else {
        console.error(`[ERROR] ${skill.nameCn}: ${error.message}`);
        errors.push({ skill: skill.nameCn, error: error.message });
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Summary:`);
  console.log(`  Total in file: ${data.length}`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log(`\nErrors:`);
    errors.forEach(e => console.log(`  - ${e.skill}: ${e.error}`));
  }

  await prisma.$disconnect();
}

// Get JSON file from command line
const jsonFile = process.argv[2];

if (!jsonFile) {
  console.log('Usage: node import-skills-json.js <json_file>');
  process.exit(1);
}

importSkills(jsonFile);
