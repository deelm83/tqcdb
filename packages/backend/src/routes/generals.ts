import express, { Request, Response } from 'express';
import { PrismaClient, Skill, General } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Remove Vietnamese diacritics for search
function removeVietnameseDiacritics(str: string | null): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

// Check if name matches search term (with diacritics removed)
function matchesSearch(name: string | null, searchTerm: string): boolean {
  if (!name || !searchTerm) return false;
  const normalizedName = removeVietnameseDiacritics(name);
  const normalizedSearch = removeVietnameseDiacritics(searchTerm);
  return normalizedName.includes(normalizedSearch);
}

// Transform skill to frontend format
function transformSkill(skill: Skill | null) {
  if (!skill) return null;
  return {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    type: { id: skill.typeId, name: skill.typeName },
    quality: skill.quality,
    trigger_rate: skill.triggerRate,
    effect: skill.effect,
    target: skill.target,
    army_types: skill.armyTypes,
  };
}

interface GeneralsQuery {
  search?: string;
  factions?: string;
  costs?: string;
  minCost?: string;
  maxCost?: string;
  cavalry?: string;
  shield?: string;
  archer?: string;
  spear?: string;
  siege?: string;
}

// GET all generals with filtering
router.get('/', async (req: Request<object, object, object, GeneralsQuery>, res: Response) => {
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

    const where: {
      factionId?: { in: string[] };
      cost?: { in?: number[]; gte?: number; lte?: number };
      AND?: object[];
    } = {};

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
    const troopFilters: object[] = [];
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
      generals = generals.filter(g => matchesSearch(g.name, search));
    }

    // Transform to match frontend expected format
    const transformed = generals.map((g, index) => ({
      index,
      id: g.id,
      slug: g.slug,
      name: g.name,
      faction_id: g.factionId,
      cost: g.cost,
      wiki_url: g.wikiUrl,
      image: g.image,
      image_full: g.imageFull,
      tags: g.tags,
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

type GeneralWithRelations = General & {
  innateSkill: Skill | null;
  inheritedSkill: Skill | null;
  innateSkillSources: { skill: Skill }[];
  inheritSkillSources: { skill: Skill }[];
};

// GET general by ID, slug, or index
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
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

    let general: GeneralWithRelations | null = null;

    // Check if id is a number (index-based lookup)
    if (/^\d+$/.test(id)) {
      const index = parseInt(id);
      const generals = await prisma.general.findMany({
        include: includeRelations,
        orderBy: { cost: 'desc' },
      }) as GeneralWithRelations[];
      general = generals[index] || null;
    } else {
      // Try slug lookup first
      general = await prisma.general.findUnique({
        where: { slug: id },
        include: includeRelations,
      }) as GeneralWithRelations | null;

      // If not found, try string ID lookup (Chinese name)
      if (!general) {
        general = await prisma.general.findUnique({
          where: { id: decodeURIComponent(id) },
          include: includeRelations,
        }) as GeneralWithRelations | null;
      }
    }

    if (!general) {
      res.status(404).json({ error: 'Không tìm thấy tướng' });
      return;
    }

    // Get innate skill: prefer direct FK, then check reverse relation
    let innateSkill: Skill | null = general.innateSkill;
    if (!innateSkill && general.innateSkillSources.length > 0) {
      innateSkill = general.innateSkillSources[0].skill;
    }

    // Get inherited skill: prefer direct FK, then check reverse relation
    let inheritedSkill: Skill | null = general.inheritedSkill;
    if (!inheritedSkill && general.inheritSkillSources.length > 0) {
      inheritedSkill = general.inheritSkillSources[0].skill;
    }

    // Transform to match frontend expected format
    const transformed = {
      id: general.id,
      slug: general.slug,
      name: general.name,
      faction_id: general.factionId,
      cost: general.cost,
      rarity: general.rarity,
      wiki_url: general.wikiUrl,
      image: general.image,
      image_full: general.imageFull,
      tags: general.tags,
      // Stats
      base_attack: general.baseAttack,
      base_command: general.baseCommand,
      base_intelligence: general.baseIntelligence,
      base_politics: general.basePolitics,
      base_speed: general.baseSpeed,
      base_charm: general.baseCharm,
      growth_attack: general.growthAttack,
      growth_command: general.growthCommand,
      growth_intelligence: general.growthIntelligence,
      growth_politics: general.growthPolitics,
      growth_speed: general.growthSpeed,
      growth_charm: general.growthCharm,
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
router.get('/stats/count', async (_req: Request, res: Response) => {
  try {
    const count = await prisma.general.count();
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Không thể đếm số tướng' });
  }
});

export default router;
