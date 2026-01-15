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

    // Note: Search filter is applied in JavaScript after fetching
    // to support Vietnamese diacritics-insensitive search

    // Faction filter
    if (factions) {
      const factionList = factions.split(',');
      where.factionId = { in: factionList };
    }

    // Cost filter - supports both costs array and minCost/maxCost range
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
      innate_skill: g.innateSkillName ? { name: { cn: g.innateSkillName, vi: '' } } : null,
      inherited_skill: g.inheritedSkillName ? { name: { cn: g.inheritedSkillName, vi: '' } } : null,
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

    let general;

    // Check if id is a number (index-based lookup)
    if (/^\d+$/.test(id)) {
      const index = parseInt(id);
      // Get all generals ordered by cost desc (same as list), then find by index
      const generals = await prisma.general.findMany({
        orderBy: { cost: 'desc' },
      });
      general = generals[index] || null;
    } else {
      // Try slug lookup first
      general = await prisma.general.findUnique({
        where: { slug: id },
      });

      // If not found, try string ID lookup (Chinese name)
      if (!general) {
        general = await prisma.general.findUnique({
          where: { id: decodeURIComponent(id) },
        });
      }
    }

    if (!general) {
      return res.status(404).json({ error: 'Không tìm thấy tướng' });
    }

    // Get skill details
    let innateSkill = null;
    let inheritedSkill = null;

    if (general.innateSkillName) {
      innateSkill = await prisma.skill.findUnique({
        where: { nameCn: general.innateSkillName },
      });
    }

    if (general.inheritedSkillName) {
      inheritedSkill = await prisma.skill.findUnique({
        where: { nameCn: general.inheritedSkillName },
      });
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
      innate_skill: innateSkill ? {
        name: { cn: innateSkill.nameCn, vi: innateSkill.nameVi },
        type: { id: innateSkill.typeId, name: { cn: innateSkill.typeNameCn, vi: innateSkill.typeNameVi } },
        quality: innateSkill.quality,
        trigger_rate: innateSkill.triggerRate,
        effect: { cn: innateSkill.effectCn, vi: innateSkill.effectVi },
        target: innateSkill.target,
        target_vi: innateSkill.targetVi,
        army_types: innateSkill.armyTypes,
      } : null,
      inherited_skill: inheritedSkill ? {
        name: { cn: inheritedSkill.nameCn, vi: inheritedSkill.nameVi },
        type: { id: inheritedSkill.typeId, name: { cn: inheritedSkill.typeNameCn, vi: inheritedSkill.typeNameVi } },
        quality: inheritedSkill.quality,
        trigger_rate: inheritedSkill.triggerRate,
        effect: { cn: inheritedSkill.effectCn, vi: inheritedSkill.effectVi },
        target: inheritedSkill.target,
        target_vi: inheritedSkill.targetVi,
        army_types: inheritedSkill.armyTypes,
      } : null,
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
