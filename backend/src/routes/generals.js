const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Remove Vietnamese diacritics for search
function removeVietnameseDiacritics(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

// Check if name matches search term (with diacritics removed)
function matchesSearch(name, searchTerm) {
  if (!name || !searchTerm) return false;
  const normalizedName = removeVietnameseDiacritics(name);
  const normalizedSearch = removeVietnameseDiacritics(searchTerm);
  return normalizedName.includes(normalizedSearch);
}

// Transform skill to frontend format
function transformSkill(skill) {
  if (!skill) return null;
  return {
    id: skill.id,
    slug: skill.slug,
    name: { cn: skill.nameCn, vi: skill.nameVi },
    type: { id: skill.typeId, name: { cn: skill.typeNameCn, vi: skill.typeNameVi } },
    quality: skill.quality,
    trigger_rate: skill.triggerRate,
    effect: { cn: skill.effectCn, vi: skill.effectVi },
    target: skill.target,
    target_vi: skill.targetVi,
    army_types: skill.armyTypes,
  };
}

// GET all generals with filtering
router.get('/', async (req, res) => {
  try {
    const {
      search,
      factions,
      costs,
      minCost,
      maxCost,
      cavalry,
      shield,
      archer,
      spear,
      siege,
    } = req.query;

    const where = {};

    // Faction filter
    if (factions) {
      const factionList = factions.split(',');
      where.factionId = { in: factionList };
    }

    // Cost filter
    if (costs) {
      const costList = costs.split(',').map(c => parseInt(c));
      where.cost = { in: costList };
    } else if (minCost || maxCost) {
      where.cost = {};
      if (minCost) where.cost.gte = parseInt(minCost);
      if (maxCost) where.cost.lte = parseInt(maxCost);
    }

    // Troop compatibility filters (A or S grade)
    const troopFilters = [];
    if (cavalry === 'true') troopFilters.push({ cavalryGrade: { in: ['S', 'A'] } });
    if (shield === 'true') troopFilters.push({ shieldGrade: { in: ['S', 'A'] } });
    if (archer === 'true') troopFilters.push({ archerGrade: { in: ['S', 'A'] } });
    if (spear === 'true') troopFilters.push({ spearGrade: { in: ['S', 'A'] } });
    if (siege === 'true') troopFilters.push({ siegeGrade: { in: ['S', 'A'] } });

    if (troopFilters.length > 0) {
      where.AND = troopFilters;
    }

    let generals = await prisma.general.findMany({
      where,
      include: {
        innateSkill: true,
        inheritedSkill: true,
      },
      orderBy: { cost: 'desc' },
    });

    // Apply Vietnamese diacritics-insensitive search filter
    if (search) {
      generals = generals.filter(g =>
        matchesSearch(g.nameVi, search) || matchesSearch(g.nameCn, search)
      );
    }

    // Transform to match frontend expected format
    const transformed = generals.map((g, index) => ({
      index,
      id: g.id,
      slug: g.slug,
      name: { cn: g.nameCn, vi: g.nameVi },
      faction_id: g.factionId,
      cost: g.cost,
      wiki_url: g.wikiUrl,
      image: g.image,
      image_full: g.imageFull,
      tags: { cn: g.tagsCn, vi: g.tagsVi },
      troop_compatibility: {
        cavalry: { grade: g.cavalryGrade },
        shield: { grade: g.shieldGrade },
        archer: { grade: g.archerGrade },
        spear: { grade: g.spearGrade },
        siege: { grade: g.siegeGrade },
      },
      innate_skill: transformSkill(g.innateSkill),
      inherited_skill: transformSkill(g.inheritedSkill),
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching generals:', error);
    res.status(500).json({ error: 'Không thể tải danh sách tướng' });
  }
});

// GET general by ID, slug, or index
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const includeRelations = {
      innateSkill: true,
      inheritedSkill: true,
      // Also include reverse relations from skills
      innateSkillSources: {
        include: { skill: true }
      },
      inheritSkillSources: {
        include: { skill: true }
      },
    };

    let general;

    // Check if id is a number (index-based lookup)
    if (/^\d+$/.test(id)) {
      const index = parseInt(id);
      const generals = await prisma.general.findMany({
        include: includeRelations,
        orderBy: { cost: 'desc' },
      });
      general = generals[index] || null;
    } else {
      // Try slug lookup first
      general = await prisma.general.findUnique({
        where: { slug: id },
        include: includeRelations,
      });

      // If not found, try string ID lookup (Chinese name)
      if (!general) {
        general = await prisma.general.findUnique({
          where: { id: decodeURIComponent(id) },
          include: includeRelations,
        });
      }
    }

    if (!general) {
      return res.status(404).json({ error: 'Không tìm thấy tướng' });
    }

    // Get innate skill: prefer direct FK, then check reverse relation
    let innateSkill = general.innateSkill;
    if (!innateSkill && general.innateSkillSources.length > 0) {
      innateSkill = general.innateSkillSources[0].skill;
    }

    // Get inherited skill: prefer direct FK, then check reverse relation
    let inheritedSkill = general.inheritedSkill;
    if (!inheritedSkill && general.inheritSkillSources.length > 0) {
      inheritedSkill = general.inheritSkillSources[0].skill;
    }

    // Transform to match frontend expected format
    const transformed = {
      id: general.id,
      slug: general.slug,
      name: { cn: general.nameCn, vi: general.nameVi },
      faction_id: general.factionId,
      cost: general.cost,
      wiki_url: general.wikiUrl,
      image: general.image,
      image_full: general.imageFull,
      tags: { cn: general.tagsCn, vi: general.tagsVi },
      troop_compatibility: {
        cavalry: { grade: general.cavalryGrade },
        shield: { grade: general.shieldGrade },
        archer: { grade: general.archerGrade },
        spear: { grade: general.spearGrade },
        siege: { grade: general.siegeGrade },
      },
      innate_skill: transformSkill(innateSkill),
      inherited_skill: transformSkill(inheritedSkill),
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching general:', error);
    res.status(500).json({ error: 'Không thể tải thông tin tướng' });
  }
});

// GET total count
router.get('/stats/count', async (req, res) => {
  try {
    const count = await prisma.general.count();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Không thể đếm số tướng' });
  }
});

module.exports = router;
