const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(requireAuth);

// GET /api/admin/generals/skills/list - Get all skills for dropdown
// NOTE: This route must be defined BEFORE /:id to avoid being caught by the dynamic route
router.get('/skills/list', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      select: {
        id: true,
        nameCn: true,
        nameVi: true,
        typeId: true,
        quality: true,
      },
      orderBy: { nameCn: 'asc' },
    });

    const transformed = skills.map((s) => ({
      id: s.id,
      name: { cn: s.nameCn, vi: s.nameVi },
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
  destination: (req, file, cb) => {
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
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'));
    }
  },
});

// Helper to generate slug from Vietnamese name
function generateSlug(nameVi) {
  return nameVi
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /api/admin/generals - List all generals
router.get('/', async (req, res) => {
  try {
    const generals = await prisma.general.findMany({
      include: {
        innateSkill: true,
        inheritedSkill: true,
      },
      orderBy: { nameCn: 'asc' },
    });

    const transformed = generals.map((g) => ({
      id: g.id,
      slug: g.slug,
      name: { cn: g.nameCn, vi: g.nameVi },
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
      innate_skill: g.innateSkill ? { id: g.innateSkill.id, name: { cn: g.innateSkill.nameCn, vi: g.innateSkill.nameVi } } : null,
      inherited_skill: g.inheritedSkill ? { id: g.inheritedSkill.id, name: { cn: g.inheritedSkill.nameCn, vi: g.inheritedSkill.nameVi } } : null,
      status: g.status,
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching generals:', error);
    res.status(500).json({ error: 'Không thể tải danh sách tướng' });
  }
});

// GET /api/admin/generals/:id - Get single general
router.get('/:id', async (req, res) => {
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
    });

    if (!general) {
      return res.status(404).json({ error: 'Không tìm thấy tướng' });
    }

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
      innate_skill_id: general.innateSkillId,
      inherited_skill_id: general.inheritedSkillId,
      innate_skill: general.innateSkill ? { id: general.innateSkill.id, name: { cn: general.innateSkill.nameCn, vi: general.innateSkill.nameVi } } : null,
      inherited_skill: general.inheritedSkill ? { id: general.inheritedSkill.id, name: { cn: general.inheritedSkill.nameCn, vi: general.inheritedSkill.nameVi } } : null,
      status: general.status,
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching general:', error);
    res.status(500).json({ error: 'Không thể tải thông tin tướng' });
  }
});

// POST /api/admin/generals - Create general
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.name?.vi || data.nameCn);

    // Check for duplicate slug
    const existing = await prisma.general.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Slug đã tồn tại' });
    }

    const general = await prisma.general.create({
      data: {
        id: data.id || data.name?.cn || slug,
        slug,
        nameCn: data.name?.cn || data.nameCn,
        nameVi: data.name?.vi || data.nameVi,
        factionId: data.faction_id || data.factionId,
        cost: data.cost,
        wikiUrl: data.wiki_url || data.wikiUrl,
        image: data.image,
        imageFull: data.image_full || data.imageFull,
        tagsCn: data.tags?.cn || data.tagsCn || [],
        tagsVi: data.tags?.vi || data.tagsVi || [],
        cavalryGrade: data.troop_compatibility?.cavalry?.grade || data.cavalryGrade,
        shieldGrade: data.troop_compatibility?.shield?.grade || data.shieldGrade,
        archerGrade: data.troop_compatibility?.archer?.grade || data.archerGrade,
        spearGrade: data.troop_compatibility?.spear?.grade || data.spearGrade,
        siegeGrade: data.troop_compatibility?.siege?.grade || data.siegeGrade,
        innateSkillId: data.innate_skill_id || data.innateSkillId || null,
        inheritedSkillId: data.inherited_skill_id || data.inheritedSkillId || null,
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
router.put('/:id', async (req, res) => {
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
      return res.status(404).json({ error: 'Không tìm thấy tướng' });
    }

    const general = await prisma.general.update({
      where: { id: existing.id },
      data: {
        slug: data.slug || existing.slug,
        nameCn: data.name?.cn || data.nameCn || existing.nameCn,
        nameVi: data.name?.vi || data.nameVi || existing.nameVi,
        factionId: data.faction_id || data.factionId || existing.factionId,
        cost: data.cost ?? existing.cost,
        wikiUrl: data.wiki_url || data.wikiUrl || existing.wikiUrl,
        image: data.image || existing.image,
        imageFull: data.image_full || data.imageFull || existing.imageFull,
        tagsCn: data.tags?.cn || data.tagsCn || existing.tagsCn,
        tagsVi: data.tags?.vi || data.tagsVi || existing.tagsVi,
        cavalryGrade: data.troop_compatibility?.cavalry?.grade || data.cavalryGrade || existing.cavalryGrade,
        shieldGrade: data.troop_compatibility?.shield?.grade || data.shieldGrade || existing.shieldGrade,
        archerGrade: data.troop_compatibility?.archer?.grade || data.archerGrade || existing.archerGrade,
        spearGrade: data.troop_compatibility?.spear?.grade || data.spearGrade || existing.spearGrade,
        siegeGrade: data.troop_compatibility?.siege?.grade || data.siegeGrade || existing.siegeGrade,
        innateSkillId: data.innate_skill_id !== undefined ? data.innate_skill_id : (data.innateSkillId !== undefined ? data.innateSkillId : existing.innateSkillId),
        inheritedSkillId: data.inherited_skill_id !== undefined ? data.inherited_skill_id : (data.inheritedSkillId !== undefined ? data.inheritedSkillId : existing.inheritedSkillId),
        status: data.status ?? existing.status,
      },
    });

    res.json({ success: true, general });
  } catch (error) {
    console.error('Error updating general:', error);
    res.status(500).json({ error: 'Không thể cập nhật tướng' });
  }
});

// DELETE /api/admin/generals/:id - Delete general
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find existing general
    const existing = await prisma.general.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy tướng' });
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
router.post('/:id/image', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Không có file ảnh' });
    }

    // Find existing general
    const existing = await prisma.general.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy tướng' });
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

module.exports = router;
