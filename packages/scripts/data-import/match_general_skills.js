#!/usr/bin/env node
/**
 * Match generals' innate/inherited skill names with skills in the database.
 * This script finds generals that have skill names but no skill IDs linked,
 * then attempts to match and link them.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeAndMatch() {
  console.log('Fetching generals and skills from database...\n');

  // Get all generals
  const generals = await prisma.general.findMany({
    select: {
      id: true,
      nameVi: true,
      nameCn: true,
      innateSkillId: true,
      innateSkillName: true,
      inheritedSkillId: true,
      inheritedSkillName: true,
    }
  });

  // Get all skills
  const skills = await prisma.skill.findMany({
    select: {
      id: true,
      nameCn: true,
      nameVi: true,
    }
  });

  console.log(`Found ${generals.length} generals and ${skills.length} skills\n`);

  // Create skill name to ID maps (by Chinese name since that's more reliable)
  const skillByCn = new Map();
  const skillByVi = new Map();
  for (const skill of skills) {
    skillByCn.set(skill.nameCn.trim(), skill);
    skillByVi.set(skill.nameVi.trim(), skill);
  }

  // Analyze generals
  const stats = {
    totalGenerals: generals.length,
    withInnateId: 0,
    withInnateName: 0,
    innateMatchable: [],
    innateUnmatchable: [],
    withInheritedId: 0,
    withInheritedName: 0,
    inheritedMatchable: [],
    inheritedUnmatchable: [],
  };

  for (const general of generals) {
    // Innate skill analysis
    if (general.innateSkillId) {
      stats.withInnateId++;
    } else if (general.innateSkillName) {
      stats.withInnateName++;
      const match = skillByCn.get(general.innateSkillName.trim()) ||
                    skillByVi.get(general.innateSkillName.trim());
      if (match) {
        stats.innateMatchable.push({
          generalId: general.id,
          generalName: general.nameVi,
          skillName: general.innateSkillName,
          matchedSkillId: match.id,
          matchedSkillName: match.nameVi,
        });
      } else {
        stats.innateUnmatchable.push({
          generalId: general.id,
          generalName: general.nameVi,
          skillName: general.innateSkillName,
        });
      }
    }

    // Inherited skill analysis
    if (general.inheritedSkillId) {
      stats.withInheritedId++;
    } else if (general.inheritedSkillName) {
      stats.withInheritedName++;
      const match = skillByCn.get(general.inheritedSkillName.trim()) ||
                    skillByVi.get(general.inheritedSkillName.trim());
      if (match) {
        stats.inheritedMatchable.push({
          generalId: general.id,
          generalName: general.nameVi,
          skillName: general.inheritedSkillName,
          matchedSkillId: match.id,
          matchedSkillName: match.nameVi,
        });
      } else {
        stats.inheritedUnmatchable.push({
          generalId: general.id,
          generalName: general.nameVi,
          skillName: general.inheritedSkillName,
        });
      }
    }
  }

  // Print results
  console.log('=== INNATE SKILLS ===');
  console.log(`Already linked: ${stats.withInnateId}`);
  console.log(`Has name but no ID: ${stats.withInnateName}`);
  console.log(`  - Matchable: ${stats.innateMatchable.length}`);
  console.log(`  - Not matchable: ${stats.innateUnmatchable.length}`);

  if (stats.innateMatchable.length > 0) {
    console.log('\nMatchable innate skills:');
    for (const m of stats.innateMatchable.slice(0, 10)) {
      console.log(`  ${m.generalName}: "${m.skillName}" -> Skill #${m.matchedSkillId} (${m.matchedSkillName})`);
    }
    if (stats.innateMatchable.length > 10) {
      console.log(`  ... and ${stats.innateMatchable.length - 10} more`);
    }
  }

  if (stats.innateUnmatchable.length > 0) {
    console.log('\nUnmatchable innate skills:');
    for (const m of stats.innateUnmatchable.slice(0, 10)) {
      console.log(`  ${m.generalName}: "${m.skillName}"`);
    }
    if (stats.innateUnmatchable.length > 10) {
      console.log(`  ... and ${stats.innateUnmatchable.length - 10} more`);
    }
  }

  console.log('\n=== INHERITED SKILLS ===');
  console.log(`Already linked: ${stats.withInheritedId}`);
  console.log(`Has name but no ID: ${stats.withInheritedName}`);
  console.log(`  - Matchable: ${stats.inheritedMatchable.length}`);
  console.log(`  - Not matchable: ${stats.inheritedUnmatchable.length}`);

  if (stats.inheritedMatchable.length > 0) {
    console.log('\nMatchable inherited skills:');
    for (const m of stats.inheritedMatchable.slice(0, 10)) {
      console.log(`  ${m.generalName}: "${m.skillName}" -> Skill #${m.matchedSkillId} (${m.matchedSkillName})`);
    }
    if (stats.inheritedMatchable.length > 10) {
      console.log(`  ... and ${stats.inheritedMatchable.length - 10} more`);
    }
  }

  if (stats.inheritedUnmatchable.length > 0) {
    console.log('\nUnmatchable inherited skills:');
    for (const m of stats.inheritedUnmatchable.slice(0, 10)) {
      console.log(`  ${m.generalName}: "${m.skillName}"`);
    }
    if (stats.inheritedUnmatchable.length > 10) {
      console.log(`  ... and ${stats.inheritedUnmatchable.length - 10} more`);
    }
  }

  return stats;
}

async function updateMatches(stats, dryRun = true) {
  console.log(`\n=== ${dryRun ? 'DRY RUN' : 'UPDATING'} ===`);

  let innateUpdated = 0;
  let inheritedUpdated = 0;

  // Update innate skills
  for (const match of stats.innateMatchable) {
    if (!dryRun) {
      await prisma.general.update({
        where: { id: match.generalId },
        data: { innateSkillId: match.matchedSkillId }
      });
    }
    innateUpdated++;
  }

  // Update inherited skills
  for (const match of stats.inheritedMatchable) {
    if (!dryRun) {
      await prisma.general.update({
        where: { id: match.generalId },
        data: { inheritedSkillId: match.matchedSkillId }
      });
    }
    inheritedUpdated++;
  }

  console.log(`Innate links ${dryRun ? 'to update' : 'updated'}: ${innateUpdated}`);
  console.log(`Inherited links ${dryRun ? 'to update' : 'updated'}: ${inheritedUpdated}`);
}

async function main() {
  try {
    const stats = await analyzeAndMatch();

    const args = process.argv.slice(2);
    const shouldUpdate = args.includes('--update');

    if (stats.innateMatchable.length > 0 || stats.inheritedMatchable.length > 0) {
      if (shouldUpdate) {
        await updateMatches(stats, false);
        console.log('\nDone! Skills have been linked.');
      } else {
        await updateMatches(stats, true);
        console.log('\nTo apply these updates, run with --update flag');
      }
    } else {
      console.log('\nNo skills to match.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
