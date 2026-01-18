import express, { Request, Response } from 'express';
import { PrismaClient, Prisma, Skill, General } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for skill image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../../../web/public/images/skills');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const slug = req.params.id || 'new';
    cb(null, `${slug}-${timestamp}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'));
    }
  },
});

// Apply auth middleware to all routes
router.use(requireAuth);

// Helper to generate slug from Vietnamese name
function generateSlug(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper to generate unique slug (checks for conflicts)
async function generateUniqueSlug(baseSlug: string, excludeId: number | null = null): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.skill.findUnique({
      where: { slug },
      select: { id: true }
    });

    // No conflict, or it's the same skill we're updating
    if (!existing || existing.id === excludeId) {
      return slug;
    }

    // Conflict - append counter
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

type SkillWithRelations = Skill & {
  exchangeGeneralRelations: { general: General }[];
  innateGeneralRelations: { general: General }[];
  inheritGeneralRelations: { general: General }[];
};

// GET /api/admin/skills - List all skills
router.get('/', async (_req: Request, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' },
      include: {
        innateGeneralRelations: { select: { generalId: true } },
        inheritGeneralRelations: { select: { generalId: true } },
        exchangeGeneralRelations: { select: { generalId: true } },
      },
    });

    const transformed = skills.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      type: {
        id: s.typeId,
        name: s.typeName,
      },
      quality: s.quality,
      trigger_rate: s.triggerRate,
      target: s.target,
      acquisition_type: s.acquisitionType,
      innate_general_ids: s.innateGeneralRelations.map(r => r.generalId),
      inherit_general_ids: s.inheritGeneralRelations.map(r => r.generalId),
      exchange_general_ids: s.exchangeGeneralRelations.map(r => r.generalId),
      exchange_count: s.exchangeCount,
      status: s.status,
      updated_at: s.updatedAt,
      screenshots: s.screenshots || [],
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Không thể tải danh sách chiến pháp' });
  }
});

// GET /api/admin/skills/:id - Get single skill
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const includeRelations = {
      exchangeGeneralRelations: {
        include: { general: true }
      },
      innateGeneralRelations: {
        include: { general: true }
      },
      inheritGeneralRelations: {
        include: { general: true }
      }
    };

    // Try by slug first, then by id
    let skill = await prisma.skill.findUnique({
      where: { slug: id },
      include: includeRelations
    }) as SkillWithRelations | null;

    if (!skill) {
      const numId = parseInt(id);
      if (!isNaN(numId)) {
        skill = await prisma.skill.findUnique({
          where: { id: numId },
          include: includeRelations
        }) as SkillWithRelations | null;
      }
    }

    if (!skill) {
      res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
      return;
    }

    // Get general IDs from relations
    const exchangeGeneralIds = skill.exchangeGeneralRelations.map(r => r.general.id);
    const innateGeneralIds = skill.innateGeneralRelations.map(r => r.general.id);
    const inheritGeneralIds = skill.inheritGeneralRelations.map(r => r.general.id);

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
      innate_to: skill.innateToGeneralNames, // Legacy string array
      inheritance_from: skill.inheritanceFromGeneralNames, // Legacy string array
      innate_general_ids: innateGeneralIds, // Proper relation IDs
      inherit_general_ids: inheritGeneralIds, // Proper relation IDs
      acquisition_type: skill.acquisitionType,
      exchange_type: skill.exchangeType,
      exchange_generals: skill.exchangeGenerals, // Legacy string array
      exchange_general_ids: exchangeGeneralIds, // Proper relation IDs
      exchange_count: skill.exchangeCount,
      status: skill.status,
      updated_at: skill.updatedAt,
      screenshots: skill.screenshots || [],
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({ error: 'Không thể tải thông tin chiến pháp' });
  }
});

interface CreateSkillBody {
  slug?: string;
  name?: string;
  type?: { id?: string; name?: string };
  typeId?: string;
  typeName?: string;
  quality?: string;
  trigger_rate?: number;
  triggerRate?: number;
  source_type?: string;
  sourceType?: string;
  wiki_url?: string;
  wikiUrl?: string;
  effect?: string;
  target?: string;
  army_types?: string[];
  armyTypes?: string[];
  innate_to?: string[];
  innateToGenerals?: string[];
  inheritance_from?: string[];
  inheritanceFromGenerals?: string[];
  acquisition_type?: string;
  acquisitionType?: string;
  exchange_type?: string;
  exchangeType?: string;
  exchange_generals?: string[];
  exchangeGenerals?: string[];
  exchange_count?: number;
  exchangeCount?: number;
  exchange_general_ids?: string[];
  innate_general_ids?: string[];
  inherit_general_ids?: string[];
  status?: string;
  screenshots?: string[];
}

// POST /api/admin/skills - Create skill
router.post('/', async (req: Request<object, object, CreateSkillBody>, res: Response) => {
  try {
    const data = req.body;

    // Generate slug if not provided
    const name = data.name || '';
    const slug = data.slug || generateSlug(name);

    // Check for duplicate slug if provided
    if (slug) {
      const existing = await prisma.skill.findUnique({ where: { slug } });
      if (existing) {
        res.status(400).json({ error: 'Slug đã tồn tại' });
        return;
      }
    }

    // Get general IDs if provided
    const exchangeGeneralIds = data.exchange_general_ids || [];
    const innateGeneralIds = data.innate_general_ids || [];
    const inheritGeneralIds = data.inherit_general_ids || [];

    const skill = await prisma.$transaction(async (tx) => {
      const createdSkill = await tx.skill.create({
        data: {
          slug,
          name,
          typeId: data.type?.id || data.typeId || 'unknown',
          typeName: data.type?.name || data.typeName || null,
          quality: data.quality || null,
          triggerRate: data.trigger_rate || data.triggerRate || null,
          sourceType: data.source_type || data.sourceType || null,
          wikiUrl: data.wiki_url || data.wikiUrl || null,
          effect: data.effect || null,
          target: data.target || null,
          armyTypes: data.army_types || data.armyTypes || [],
          innateToGeneralNames: data.innate_to || data.innateToGenerals || [],
          inheritanceFromGeneralNames: data.inheritance_from || data.inheritanceFromGenerals || [],
          acquisitionType: data.acquisition_type || data.acquisitionType || null,
          exchangeType: data.exchange_type || data.exchangeType || null,
          exchangeGenerals: data.exchange_generals || data.exchangeGenerals || [],
          exchangeCount: data.exchange_count ?? data.exchangeCount ?? null,
          status: data.status || 'needs_update',
          // Create general relations if provided
          exchangeGeneralRelations: exchangeGeneralIds.length > 0 ? {
            create: exchangeGeneralIds.map(generalId => ({ generalId }))
          } : undefined,
          innateGeneralRelations: innateGeneralIds.length > 0 ? {
            create: innateGeneralIds.map(generalId => ({ generalId }))
          } : undefined,
          inheritGeneralRelations: inheritGeneralIds.length > 0 ? {
            create: inheritGeneralIds.map(generalId => ({ generalId }))
          } : undefined,
        },
      });

      // Update generals' innateSkillId field
      for (const generalId of innateGeneralIds) {
        await tx.general.update({
          where: { id: generalId },
          data: {
            innateSkillId: createdSkill.id,
            innateSkillName: createdSkill.name,
          }
        });
      }

      // Update generals' inheritedSkillId field
      for (const generalId of inheritGeneralIds) {
        await tx.general.update({
          where: { id: generalId },
          data: {
            inheritedSkillId: createdSkill.id,
            inheritedSkillName: createdSkill.name,
          }
        });
      }

      return createdSkill;
    });

    res.status(201).json({ success: true, skill });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Không thể tạo chiến pháp' });
  }
});

// PUT /api/admin/skills/:id - Update skill
router.put('/:id', async (req: Request<{ id: string }, object, CreateSkillBody>, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Find existing skill
    let existing = await prisma.skill.findUnique({
      where: { slug: id },
    });

    if (!existing) {
      const numId = parseInt(id);
      if (!isNaN(numId)) {
        existing = await prisma.skill.findUnique({
          where: { id: numId },
        });
      }
    }

    if (!existing) {
      res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
      return;
    }

    // Get general IDs if provided
    const exchangeGeneralIds = data.exchange_general_ids || [];
    const innateGeneralIds = data.innate_general_ids || [];
    const inheritGeneralIds = data.inherit_general_ids || [];

    // Fetch general names to sync legacy arrays when relations are updated
    let innateGeneralNames = data.innate_to ?? data.innateToGenerals;
    let inheritGeneralNames = data.inheritance_from ?? data.inheritanceFromGenerals;
    let exchangeGeneralNames = data.exchange_generals;

    // If relation IDs are provided, fetch the names to sync legacy arrays
    if (data.innate_general_ids !== undefined && innateGeneralIds.length > 0) {
      const generals = await prisma.general.findMany({
        where: { id: { in: innateGeneralIds } },
        select: { name: true }
      });
      innateGeneralNames = generals.map(g => g.name);
    } else if (data.innate_general_ids !== undefined) {
      innateGeneralNames = []; // Clear if empty array was passed
    }

    if (data.inherit_general_ids !== undefined && inheritGeneralIds.length > 0) {
      const generals = await prisma.general.findMany({
        where: { id: { in: inheritGeneralIds } },
        select: { name: true }
      });
      inheritGeneralNames = generals.map(g => g.name);
    } else if (data.inherit_general_ids !== undefined) {
      inheritGeneralNames = []; // Clear if empty array was passed
    }

    if (data.exchange_general_ids !== undefined && exchangeGeneralIds.length > 0) {
      const generals = await prisma.general.findMany({
        where: { id: { in: exchangeGeneralIds } },
        select: { name: true }
      });
      exchangeGeneralNames = generals.map(g => g.name);
    } else if (data.exchange_general_ids !== undefined) {
      exchangeGeneralNames = []; // Clear if empty array was passed
    }

    // Use transaction to update skill and relations
    const skill = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete existing relations if we're updating them
      if (data.exchange_general_ids !== undefined) {
        await tx.skillExchangeGeneral.deleteMany({
          where: { skillId: existing!.id }
        });
      }
      if (data.innate_general_ids !== undefined) {
        // Clear innateSkillId from generals that previously had this skill as innate
        const oldInnateRelations = await tx.skillInnateGeneral.findMany({
          where: { skillId: existing!.id },
          select: { generalId: true }
        });
        for (const rel of oldInnateRelations) {
          await tx.general.update({
            where: { id: rel.generalId },
            data: { innateSkillId: null, innateSkillName: null }
          });
        }
        await tx.skillInnateGeneral.deleteMany({
          where: { skillId: existing!.id }
        });
      }
      if (data.inherit_general_ids !== undefined) {
        // Clear inheritedSkillId from generals that previously had this skill as inherited
        const oldInheritRelations = await tx.skillInheritGeneral.findMany({
          where: { skillId: existing!.id },
          select: { generalId: true }
        });
        for (const rel of oldInheritRelations) {
          await tx.general.update({
            where: { id: rel.generalId },
            data: { inheritedSkillId: null, inheritedSkillName: null }
          });
        }
        await tx.skillInheritGeneral.deleteMany({
          where: { skillId: existing!.id }
        });
      }

      // Generate slug if not provided and doesn't exist
      const name = data.name ?? existing!.name;
      const baseSlug = data.slug || existing!.slug || generateSlug(name);
      const newSlug = await generateUniqueSlug(baseSlug, existing!.id);

      // Update skill
      const updatedSkill = await tx.skill.update({
        where: { id: existing!.id },
        data: {
          slug: newSlug,
          name: data.name ?? existing!.name,
          typeId: data.type?.id ?? data.typeId ?? existing!.typeId,
          typeName: data.type?.name ?? data.typeName ?? existing!.typeName,
          quality: data.quality ?? existing!.quality,
          triggerRate: data.trigger_rate ?? data.triggerRate ?? existing!.triggerRate,
          sourceType: data.source_type ?? data.sourceType ?? existing!.sourceType,
          wikiUrl: data.wiki_url ?? data.wikiUrl ?? existing!.wikiUrl,
          effect: data.effect ?? existing!.effect,
          target: data.target ?? existing!.target,
          armyTypes: data.army_types ?? data.armyTypes ?? existing!.armyTypes,
          innateToGeneralNames: innateGeneralNames ?? existing!.innateToGeneralNames,
          inheritanceFromGeneralNames: inheritGeneralNames ?? existing!.inheritanceFromGeneralNames,
          acquisitionType: data.acquisition_type ?? data.acquisitionType ?? existing!.acquisitionType,
          exchangeType: data.exchange_type ?? data.exchangeType ?? existing!.exchangeType,
          exchangeGenerals: exchangeGeneralNames ?? existing!.exchangeGenerals,
          exchangeCount: data.exchange_count ?? data.exchangeCount ?? existing!.exchangeCount,
          status: data.status ?? existing!.status,
          screenshots: data.screenshots ?? existing!.screenshots,
        },
      });

      // Create new relations if provided
      if (exchangeGeneralIds.length > 0) {
        await tx.skillExchangeGeneral.createMany({
          data: exchangeGeneralIds.map(generalId => ({
            skillId: existing!.id,
            generalId
          }))
        });
      }
      if (innateGeneralIds.length > 0) {
        await tx.skillInnateGeneral.createMany({
          data: innateGeneralIds.map(generalId => ({
            skillId: existing!.id,
            generalId
          }))
        });
        // Also update the general's innateSkillId field
        for (const generalId of innateGeneralIds) {
          await tx.general.update({
            where: { id: generalId },
            data: {
              innateSkillId: existing!.id,
              innateSkillName: updatedSkill.name,
            }
          });
        }
      }
      if (inheritGeneralIds.length > 0) {
        await tx.skillInheritGeneral.createMany({
          data: inheritGeneralIds.map(generalId => ({
            skillId: existing!.id,
            generalId
          }))
        });
        // Also update the general's inheritedSkillId field
        for (const generalId of inheritGeneralIds) {
          await tx.general.update({
            where: { id: generalId },
            data: {
              inheritedSkillId: existing!.id,
              inheritedSkillName: updatedSkill.name,
            }
          });
        }
      }

      return updatedSkill;
    });

    res.json({ success: true, skill });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Không thể cập nhật chiến pháp' });
  }
});

// DELETE /api/admin/skills/:id - Delete skill
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // Find existing skill
    let existing = await prisma.skill.findUnique({
      where: { slug: id },
    });

    if (!existing) {
      const numId = parseInt(id);
      if (!isNaN(numId)) {
        existing = await prisma.skill.findUnique({
          where: { id: numId },
        });
      }
    }

    if (!existing) {
      res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
      return;
    }

    await prisma.skill.delete({
      where: { id: existing.id },
    });

    res.json({ success: true, message: 'Đã xóa chiến pháp' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Không thể xóa chiến pháp' });
  }
});

// POST /api/admin/skills/:id/image - Upload skill image
router.post('/:id/image', upload.single('image'), async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({ error: 'Không có file ảnh' });
      return;
    }

    // Find existing skill by slug or id
    let existing = await prisma.skill.findUnique({
      where: { slug: id },
    });

    if (!existing) {
      const numId = parseInt(id);
      if (!isNaN(numId)) {
        existing = await prisma.skill.findUnique({
          where: { id: numId },
        });
      }
    }

    if (!existing) {
      res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
      return;
    }

    const filename = req.file.filename;

    // Add to screenshots array
    const screenshots = [...(existing.screenshots || []), filename];

    await prisma.skill.update({
      where: { id: existing.id },
      data: { screenshots },
    });

    res.json({ success: true, filename, screenshots });
  } catch (error) {
    console.error('Error uploading skill image:', error);
    res.status(500).json({ error: 'Không thể upload ảnh' });
  }
});

export default router;
