import express, { Request, Response } from 'express';
import { PrismaClient, General, Skill } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(requireAuth);

// GET /api/admin/generals/skills/list - Get all skills for dropdown
// NOTE: This route must be defined BEFORE /:id to avoid being caught by the dynamic route
router.get('/skills/list', async (_req: Request, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      select: {
        id: true,
        name: true,
        typeId: true,
        quality: true,
      },
      orderBy: { name: 'asc' },
    });

    const transformed = skills.map((s) => ({
      id: s.id,
      name: s.name,
      type_id: s.typeId,
      quality: s.quality,
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Không thể tải danh sách chiến pháp' });
  }
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../../../web/public/images/generals');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const slug = req.params.id || 'new';
    cb(null, `${slug}${ext}`);
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

// Helper to generate slug from Vietnamese name
function generateSlug(nameVi: string): string {
  return nameVi
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type GeneralWithSkills = General & {
  innateSkill: Skill | null;
  inheritedSkill: Skill | null;
};

// GET /api/admin/generals - List all generals
router.get('/', async (_req: Request, res: Response) => {
  try {
    const generals = await prisma.general.findMany({
      include: {
        innateSkill: true,
        inheritedSkill: true,
      },
      orderBy: { cost: 'desc' },
    }) as GeneralWithSkills[];

    const transformed = generals.map((g) => ({
      id: g.id,
      slug: g.slug,
      name: g.name,
      faction_id: g.factionId,
      cost: g.cost,
      image: g.image,
      image_full: g.imageFull,
      troop_compatibility: {
        cavalry: { grade: g.cavalryGrade },
        shield: { grade: g.shieldGrade },
        archer: { grade: g.archerGrade },
        spear: { grade: g.spearGrade },
        siege: { grade: g.siegeGrade },
      },
      innate_skill_id: g.innateSkillId,
      inherited_skill_id: g.inheritedSkillId,
      innate_skill: g.innateSkill ? { id: g.innateSkill.id, name: g.innateSkill.name } : null,
      inherited_skill: g.inheritedSkill ? { id: g.inheritedSkill.id, name: g.inheritedSkill.name } : null,
      status: g.status,
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching generals:', error);
    res.status(500).json({ error: 'Không thể tải danh sách tướng' });
  }
});

// POST /api/admin/generals/bulk - Bulk create generals
// NOTE: This route must be defined BEFORE /:id to avoid being caught by the dynamic route
interface BulkGeneralInput {
  name: string;
  imageBase64: string;
}

interface BulkGeneralsBody {
  generals: BulkGeneralInput[];
}

router.post('/bulk', async (req: Request<object, object, BulkGeneralsBody>, res: Response) => {
  try {
    const { generals } = req.body;

    if (!generals || !Array.isArray(generals) || generals.length === 0) {
      res.status(400).json({ error: 'Cần cung cấp danh sách tướng' });
      return;
    }

    const created: string[] = [];
    const skipped: string[] = [];

    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, '../../../../web/public/images/generals');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const generalInput of generals) {
      try {
        const { name, imageBase64 } = generalInput;

        if (!name || !imageBase64) {
          skipped.push(name || 'Unknown');
          continue;
        }

        // Generate slug from name
        const slug = generateSlug(name);

        // Check for existing general
        const existing = await prisma.general.findUnique({ where: { slug } });
        if (existing) {
          skipped.push(name);
          continue;
        }

        // Save base64 image to file
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const imagePath = path.join(uploadDir, `${slug}.png`);
        fs.writeFileSync(imagePath, buffer);

        // Create general record
        await prisma.general.create({
          data: {
            id: slug,
            slug,
            name,
            factionId: '',
            cost: 0,
            image: `/images/generals/${slug}.png`,
            imageFull: null,
            tags: [],
            cavalryGrade: null,
            shieldGrade: null,
            archerGrade: null,
            spearGrade: null,
            siegeGrade: null,
            innateSkillId: null,
            inheritedSkillId: null,
            status: 'needs_update',
          },
        });

        created.push(name);
      } catch (error) {
        console.error(`Error creating general ${generalInput.name}:`, error);
        skipped.push(generalInput.name);
      }
    }

    res.json({ created, skipped });
  } catch (error) {
    console.error('Error bulk creating generals:', error);
    res.status(500).json({ error: 'Không thể tạo hàng loạt tướng' });
  }
});

// GET /api/admin/generals/:id - Get single general
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const general = await prisma.general.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
      },
      include: {
        innateSkill: true,
        inheritedSkill: true,
      },
    }) as GeneralWithSkills | null;

    if (!general) {
      res.status(404).json({ error: 'Không tìm thấy tướng' });
      return;
    }

    const transformed = {
      id: general.id,
      slug: general.slug,
      name: general.name,
      faction_id: general.factionId,
      cost: general.cost,
      wiki_url: general.wikiUrl,
      image: general.image,
      image_full: general.imageFull,
      tags: general.tags,
      troop_compatibility: {
        cavalry: { grade: general.cavalryGrade },
        shield: { grade: general.shieldGrade },
        archer: { grade: general.archerGrade },
        spear: { grade: general.spearGrade },
        siege: { grade: general.siegeGrade },
      },
      innate_skill_id: general.innateSkillId,
      inherited_skill_id: general.inheritedSkillId,
      innate_skill: general.innateSkill ? {
        id: general.innateSkill.id,
        slug: general.innateSkill.slug,
        name: general.innateSkill.name,
        type: { id: general.innateSkill.typeId, name: general.innateSkill.typeName },
        quality: general.innateSkill.quality,
        trigger_rate: general.innateSkill.triggerRate,
        effect: general.innateSkill.effect,
        target: general.innateSkill.target,
      } : null,
      inherited_skill: general.inheritedSkill ? {
        id: general.inheritedSkill.id,
        slug: general.inheritedSkill.slug,
        name: general.inheritedSkill.name,
        type: { id: general.inheritedSkill.typeId, name: general.inheritedSkill.typeName },
        quality: general.inheritedSkill.quality,
        trigger_rate: general.inheritedSkill.triggerRate,
        effect: general.inheritedSkill.effect,
        target: general.inheritedSkill.target,
      } : null,
      status: general.status,
      // Base stats
      base_attack: general.baseAttack,
      base_charm: general.baseCharm,
      base_command: general.baseCommand,
      base_intelligence: general.baseIntelligence,
      base_politics: general.basePolitics,
      base_speed: general.baseSpeed,
      // Growth stats
      growth_attack: general.growthAttack,
      growth_charm: general.growthCharm,
      growth_command: general.growthCommand,
      growth_intelligence: general.growthIntelligence,
      growth_politics: general.growthPolitics,
      growth_speed: general.growthSpeed,
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching general:', error);
    res.status(500).json({ error: 'Không thể tải thông tin tướng' });
  }
});

interface CreateGeneralBody {
  id?: string;
  slug?: string;
  name?: string;
  faction_id?: string;
  factionId?: string;
  cost?: number;
  wiki_url?: string;
  wikiUrl?: string;
  image?: string;
  image_full?: string;
  imageFull?: string;
  tags?: string[];
  troop_compatibility?: {
    cavalry?: { grade?: string };
    shield?: { grade?: string };
    archer?: { grade?: string };
    spear?: { grade?: string };
    siege?: { grade?: string };
  };
  cavalryGrade?: string;
  shieldGrade?: string;
  archerGrade?: string;
  spearGrade?: string;
  siegeGrade?: string;
  innate_skill_id?: number | null;
  innateSkillId?: number | null;
  inherited_skill_id?: number | null;
  inheritedSkillId?: number | null;
  status?: string;
  // Base stats
  base_attack?: number | null;
  baseAttack?: number | null;
  base_charm?: number | null;
  baseCharm?: number | null;
  base_command?: number | null;
  baseCommand?: number | null;
  base_intelligence?: number | null;
  baseIntelligence?: number | null;
  base_politics?: number | null;
  basePolitics?: number | null;
  base_speed?: number | null;
  baseSpeed?: number | null;
  // Growth stats
  growth_attack?: number | null;
  growthAttack?: number | null;
  growth_charm?: number | null;
  growthCharm?: number | null;
  growth_command?: number | null;
  growthCommand?: number | null;
  growth_intelligence?: number | null;
  growthIntelligence?: number | null;
  growth_politics?: number | null;
  growthPolitics?: number | null;
  growth_speed?: number | null;
  growthSpeed?: number | null;
}

// POST /api/admin/generals - Create general
router.post('/', async (req: Request<object, object, CreateGeneralBody>, res: Response) => {
  try {
    const data = req.body;

    // Generate slug if not provided
    const name = data.name || '';
    const slug = data.slug || generateSlug(name);

    // Check for duplicate slug
    const existing = await prisma.general.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ error: 'Slug đã tồn tại' });
      return;
    }

    const general = await prisma.general.create({
      data: {
        id: data.id || slug,
        slug,
        name,
        factionId: data.faction_id || data.factionId || '',
        cost: data.cost || 0,
        wikiUrl: data.wiki_url || data.wikiUrl || null,
        image: data.image || null,
        imageFull: data.image_full || data.imageFull || null,
        tags: data.tags || [],
        cavalryGrade: data.troop_compatibility?.cavalry?.grade || data.cavalryGrade || null,
        shieldGrade: data.troop_compatibility?.shield?.grade || data.shieldGrade || null,
        archerGrade: data.troop_compatibility?.archer?.grade || data.archerGrade || null,
        spearGrade: data.troop_compatibility?.spear?.grade || data.spearGrade || null,
        siegeGrade: data.troop_compatibility?.siege?.grade || data.siegeGrade || null,
        innateSkillId: data.innate_skill_id ?? data.innateSkillId ?? null,
        inheritedSkillId: data.inherited_skill_id ?? data.inheritedSkillId ?? null,
        status: data.status || 'needs_update',
      },
    });

    res.status(201).json({ success: true, general });
  } catch (error) {
    console.error('Error creating general:', error);
    res.status(500).json({ error: 'Không thể tạo tướng' });
  }
});

// PUT /api/admin/generals/:id - Update general
router.put('/:id', async (req: Request<{ id: string }, object, CreateGeneralBody>, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Find existing general
    const existing = await prisma.general.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Không tìm thấy tướng' });
      return;
    }

    const newInnateSkillId = data.innate_skill_id !== undefined ? data.innate_skill_id : (data.innateSkillId !== undefined ? data.innateSkillId : existing.innateSkillId);
    const newInheritedSkillId = data.inherited_skill_id !== undefined ? data.inherited_skill_id : (data.inheritedSkillId !== undefined ? data.inheritedSkillId : existing.inheritedSkillId);

    const general = await prisma.general.update({
      where: { id: existing.id },
      data: {
        slug: data.slug || existing.slug,
        name: data.name || existing.name,
        factionId: data.faction_id || data.factionId || existing.factionId,
        cost: data.cost ?? existing.cost,
        wikiUrl: data.wiki_url || data.wikiUrl || existing.wikiUrl,
        image: data.image || existing.image,
        imageFull: data.image_full || data.imageFull || existing.imageFull,
        tags: data.tags || existing.tags,
        cavalryGrade: data.troop_compatibility?.cavalry?.grade || data.cavalryGrade || existing.cavalryGrade,
        shieldGrade: data.troop_compatibility?.shield?.grade || data.shieldGrade || existing.shieldGrade,
        archerGrade: data.troop_compatibility?.archer?.grade || data.archerGrade || existing.archerGrade,
        spearGrade: data.troop_compatibility?.spear?.grade || data.spearGrade || existing.spearGrade,
        siegeGrade: data.troop_compatibility?.siege?.grade || data.siegeGrade || existing.siegeGrade,
        innateSkillId: newInnateSkillId,
        inheritedSkillId: newInheritedSkillId,
        status: data.status ?? existing.status,
        // Base stats
        baseAttack: data.base_attack ?? data.baseAttack ?? existing.baseAttack,
        baseCharm: data.base_charm ?? data.baseCharm ?? existing.baseCharm,
        baseCommand: data.base_command ?? data.baseCommand ?? existing.baseCommand,
        baseIntelligence: data.base_intelligence ?? data.baseIntelligence ?? existing.baseIntelligence,
        basePolitics: data.base_politics ?? data.basePolitics ?? existing.basePolitics,
        baseSpeed: data.base_speed ?? data.baseSpeed ?? existing.baseSpeed,
        // Growth stats
        growthAttack: data.growth_attack ?? data.growthAttack ?? existing.growthAttack,
        growthCharm: data.growth_charm ?? data.growthCharm ?? existing.growthCharm,
        growthCommand: data.growth_command ?? data.growthCommand ?? existing.growthCommand,
        growthIntelligence: data.growth_intelligence ?? data.growthIntelligence ?? existing.growthIntelligence,
        growthPolitics: data.growth_politics ?? data.growthPolitics ?? existing.growthPolitics,
        growthSpeed: data.growth_speed ?? data.growthSpeed ?? existing.growthSpeed,
      },
    });

    // Update skill_innate_generals relation table
    if (newInnateSkillId !== existing.innateSkillId) {
      // Remove old relation if exists
      if (existing.innateSkillId) {
        await prisma.skillInnateGeneral.deleteMany({
          where: { skillId: existing.innateSkillId, generalId: existing.id },
        });
      }
      // Add new relation if skill is set
      if (newInnateSkillId) {
        await prisma.skillInnateGeneral.upsert({
          where: { skillId_generalId: { skillId: newInnateSkillId, generalId: existing.id } },
          update: {},
          create: { skillId: newInnateSkillId, generalId: existing.id },
        });
      }
    }

    // Update skill_inherit_generals relation table
    if (newInheritedSkillId !== existing.inheritedSkillId) {
      // Remove old relation if exists
      if (existing.inheritedSkillId) {
        await prisma.skillInheritGeneral.deleteMany({
          where: { skillId: existing.inheritedSkillId, generalId: existing.id },
        });
      }
      // Add new relation if skill is set
      if (newInheritedSkillId) {
        await prisma.skillInheritGeneral.upsert({
          where: { skillId_generalId: { skillId: newInheritedSkillId, generalId: existing.id } },
          update: {},
          create: { skillId: newInheritedSkillId, generalId: existing.id },
        });
        // Also update the skill's acquisitionType to 'inherit' (prefer inherit over innate)
        await prisma.skill.update({
          where: { id: newInheritedSkillId },
          data: { acquisitionType: 'inherit' },
        });
      }
    }

    // Update innate skill's acquisitionType if not already set to inherit
    if (newInnateSkillId && newInnateSkillId !== existing.innateSkillId) {
      const skill = await prisma.skill.findUnique({
        where: { id: newInnateSkillId },
        select: { acquisitionType: true },
      });
      // Only set to 'innate' if acquisitionType is not already 'inherit'
      if (!skill?.acquisitionType || skill.acquisitionType !== 'inherit') {
        await prisma.skill.update({
          where: { id: newInnateSkillId },
          data: { acquisitionType: 'innate' },
        });
      }
    }

    res.json({ success: true, general });
  } catch (error) {
    console.error('Error updating general:', error);
    res.status(500).json({ error: 'Không thể cập nhật tướng' });
  }
});

// DELETE /api/admin/generals/:id - Delete general
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // Find existing general
    const existing = await prisma.general.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Không tìm thấy tướng' });
      return;
    }

    await prisma.general.delete({
      where: { id: existing.id },
    });

    res.json({ success: true, message: 'Đã xóa tướng' });
  } catch (error) {
    console.error('Error deleting general:', error);
    res.status(500).json({ error: 'Không thể xóa tướng' });
  }
});

// POST /api/admin/generals/:id/image - Upload image
router.post('/:id/image', upload.single('image'), async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({ error: 'Không có file ảnh' });
      return;
    }

    // Find existing general
    const existing = await prisma.general.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Không tìm thấy tướng' });
      return;
    }

    const imagePath = `/images/generals/${req.file.filename}`;

    // Update general with new image path
    await prisma.general.update({
      where: { id: existing.id },
      data: { image: imagePath },
    });

    res.json({ success: true, image: imagePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Không thể upload ảnh' });
  }
});

export default router;
