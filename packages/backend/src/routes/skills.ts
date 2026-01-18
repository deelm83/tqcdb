import express, { Request, Response } from 'express';
import { PrismaClient, Skill } from '@prisma/client';

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

interface SkillsQuery {
  search?: string;
  type?: string;
}

type SkillWithRelations = Skill & {
  innateGeneralRelations: { general: { name: string } }[];
  inheritGeneralRelations: { general: { name: string } }[];
  exchangeGeneralRelations: { general: { name: string } }[];
};

// GET all skills with filtering
router.get('/', async (req: Request<object, object, object, SkillsQuery>, res: Response) => {
  try {
    const { search, type } = req.query;

    const where: { typeId?: string } = {};

    // Type filter
    if (type && type !== 'all') {
      where.typeId = type;
    }

    let skills = await prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        innateGeneralRelations: {
          include: { general: { select: { name: true } } }
        },
        inheritGeneralRelations: {
          include: { general: { select: { name: true } } }
        },
        exchangeGeneralRelations: {
          include: { general: { select: { name: true } } }
        },
      },
    }) as SkillWithRelations[];

    // Apply Vietnamese diacritics-insensitive search filter
    if (search) {
      skills = skills.filter(s => matchesSearch(s.name, search));
    }

    // Transform to match frontend expected format
    const transformed = skills.map((s) => {
      // Prefer relation data, fall back to legacy arrays
      const innateGenerals = s.innateGeneralRelations.length > 0
        ? s.innateGeneralRelations.map(r => r.general.name)
        : s.innateToGeneralNames;
      const inheritGenerals = s.inheritGeneralRelations.length > 0
        ? s.inheritGeneralRelations.map(r => r.general.name)
        : s.inheritanceFromGeneralNames;
      const exchangeGenerals = s.exchangeGeneralRelations.length > 0
        ? s.exchangeGeneralRelations.map(r => r.general.name)
        : s.exchangeGenerals;

      return {
        id: s.id,
        slug: s.slug,
        name: s.name,
        type: {
          id: s.typeId,
          name: s.typeName,
        },
        quality: s.quality,
        trigger_rate: s.triggerRate,
        source_type: s.sourceType,
        wiki_url: s.wikiUrl,
        effect: s.effect,
        target: s.target,
        army_types: s.armyTypes,
        innate_to: innateGenerals,
        inheritance_from: inheritGenerals,
        acquisition_type: s.acquisitionType,
        exchange_type: s.exchangeType,
        exchange_generals: exchangeGenerals,
        exchange_count: s.exchangeCount,
      };
    });

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Không thể tải danh sách chiến pháp' });
  }
});

// GET skill type counts
router.get('/stats/type-counts', async (_req: Request, res: Response) => {
  try {
    const counts = await prisma.skill.groupBy({
      by: ['typeId'],
      _count: { typeId: true },
    });

    const total = await prisma.skill.count();

    const result: Record<string, number> = {
      all: total,
    };

    for (const item of counts) {
      if (item.typeId) {
        result[item.typeId] = item._count.typeId;
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching skill counts:', error);
    res.status(500).json({ error: 'Không thể đếm chiến pháp' });
  }
});

// GET generals map (for linking in frontend)
router.get('/generals-map', async (_req: Request, res: Response) => {
  try {
    const generals = await prisma.general.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    const map: Record<string, { id: string; name: string }> = {};
    generals.forEach((g) => {
      map[g.name] = {
        id: g.slug || g.id,
        name: g.name,
      };
    });

    res.json(map);
  } catch (error) {
    console.error('Error fetching generals map:', error);
    res.status(500).json({ error: 'Không thể tải danh sách tướng' });
  }
});

// GET skill by slug or id (MUST be last to not catch other routes)
router.get('/:identifier', async (req: Request<{ identifier: string }>, res: Response) => {
  try {
    const { identifier } = req.params;

    const includeRelations = {
      innateGeneralRelations: {
        include: { general: { select: { name: true } } }
      },
      inheritGeneralRelations: {
        include: { general: { select: { name: true } } }
      },
      exchangeGeneralRelations: {
        include: { general: { select: { name: true } } }
      },
    };

    // Try to find by slug first, then by id
    let skill = await prisma.skill.findUnique({
      where: { slug: identifier },
      include: includeRelations,
    }) as SkillWithRelations | null;

    if (!skill) {
      // Try by id
      const id = parseInt(identifier);
      if (!isNaN(id)) {
        skill = await prisma.skill.findUnique({
          where: { id },
          include: includeRelations,
        }) as SkillWithRelations | null;
      }
    }

    if (!skill) {
      res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
      return;
    }

    // Prefer relation data, fall back to legacy arrays
    const innateGenerals = skill.innateGeneralRelations.length > 0
      ? skill.innateGeneralRelations.map(r => r.general.name)
      : skill.innateToGeneralNames;
    const inheritGenerals = skill.inheritGeneralRelations.length > 0
      ? skill.inheritGeneralRelations.map(r => r.general.name)
      : skill.inheritanceFromGeneralNames;
    const exchangeGenerals = skill.exchangeGeneralRelations.length > 0
      ? skill.exchangeGeneralRelations.map(r => r.general.name)
      : skill.exchangeGenerals;

    // Transform to match frontend expected format
    const transformed = {
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      type: {
        id: skill.typeId,
        name: skill.typeName,
      },
      quality: skill.quality,
      trigger_rate: skill.triggerRate,
      source_type: skill.sourceType,
      wiki_url: skill.wikiUrl,
      effect: skill.effect,
      target: skill.target,
      army_types: skill.armyTypes,
      innate_to: innateGenerals,
      inheritance_from: inheritGenerals,
      acquisition_type: skill.acquisitionType,
      exchange_type: skill.exchangeType,
      exchange_generals: exchangeGenerals,
      exchange_count: skill.exchangeCount,
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({ error: 'Không thể tải thông tin chiến pháp' });
  }
});

export default router;
