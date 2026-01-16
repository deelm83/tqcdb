const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(requireAuth);

// Helper to generate slug from Vietnamese name
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

// GET /api/admin/skills - List all skills
router.get('/', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { nameCn: 'asc' },
    });

    const transformed = skills.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: { cn: s.nameCn, vi: s.nameVi },
      type: {
        id: s.typeId,
        name: { cn: s.typeNameCn, vi: s.typeNameVi },
      },
      quality: s.quality,
      trigger_rate: s.triggerRate,
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Không thể tải danh sách chiến pháp' });
  }
});

// GET /api/admin/skills/:id - Get single skill
router.get('/:id', async (req, res) => {
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
    });

    if (!skill) {
      const numId = parseInt(id);
      if (!isNaN(numId)) {
        skill = await prisma.skill.findUnique({
          where: { id: numId },
          include: includeRelations
        });
      }
    }

    if (!skill) {
      return res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
    }

    // Get general IDs from relations
    const exchangeGeneralIds = skill.exchangeGeneralRelations.map(r => r.general.id);
    const innateGeneralIds = skill.innateGeneralRelations.map(r => r.general.id);
    const inheritGeneralIds = skill.inheritGeneralRelations.map(r => r.general.id);

    const transformed = {
      id: skill.id,
      slug: skill.slug,
      name: { cn: skill.nameCn, vi: skill.nameVi },
      type: {
        id: skill.typeId,
        name: { cn: skill.typeNameCn, vi: skill.typeNameVi },
      },
      quality: skill.quality,
      trigger_rate: skill.triggerRate,
      source_type: skill.sourceType,
      wiki_url: skill.wikiUrl,
      effect: (skill.effectCn || skill.effectVi) ? { cn: skill.effectCn, vi: skill.effectVi } : null,
      target: skill.target,
      target_vi: skill.targetVi,
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
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({ error: 'Không thể tải thông tin chiến pháp' });
  }
});

// POST /api/admin/skills - Create skill
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.name?.vi || data.nameVi);

    // Check for duplicate slug if provided
    if (slug) {
      const existing = await prisma.skill.findUnique({ where: { slug } });
      if (existing) {
        return res.status(400).json({ error: 'Slug đã tồn tại' });
      }
    }

    // Check for duplicate Chinese name
    const nameCn = data.name?.cn || data.nameCn;
    const existingName = await prisma.skill.findUnique({ where: { nameCn } });
    if (existingName) {
      return res.status(400).json({ error: 'Tên chiến pháp (CN) đã tồn tại' });
    }

    // Get general IDs if provided
    const exchangeGeneralIds = data.exchange_general_ids || [];
    const innateGeneralIds = data.innate_general_ids || [];
    const inheritGeneralIds = data.inherit_general_ids || [];

    const skill = await prisma.skill.create({
      data: {
        slug,
        nameCn,
        nameVi: data.name?.vi || data.nameVi,
        typeId: data.type?.id || data.typeId,
        typeNameCn: data.type?.name?.cn || data.typeNameCn,
        typeNameVi: data.type?.name?.vi || data.typeNameVi,
        quality: data.quality,
        triggerRate: data.trigger_rate || data.triggerRate,
        sourceType: data.source_type || data.sourceType,
        wikiUrl: data.wiki_url || data.wikiUrl,
        effectCn: data.effect?.cn || data.effectCn,
        effectVi: data.effect?.vi || data.effectVi,
        target: data.target,
        targetVi: data.target_vi || data.targetVi,
        armyTypes: data.army_types || data.armyTypes || [],
        innateToGeneralNames: data.innate_to || data.innateToGenerals || [],
        inheritanceFromGeneralNames: data.inheritance_from || data.inheritanceFromGenerals || [],
        acquisitionType: data.acquisition_type || data.acquisitionType || null,
        exchangeType: data.exchange_type || data.exchangeType || null,
        exchangeGenerals: data.exchange_generals || data.exchangeGenerals || [],
        exchangeCount: data.exchange_count ?? data.exchangeCount ?? null,
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

    res.status(201).json({ success: true, skill });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Không thể tạo chiến pháp' });
  }
});

// PUT /api/admin/skills/:id - Update skill
router.put('/:id', async (req, res) => {
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
      return res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
    }

    // Get general IDs if provided
    const exchangeGeneralIds = data.exchange_general_ids || [];
    const innateGeneralIds = data.innate_general_ids || [];
    const inheritGeneralIds = data.inherit_general_ids || [];

    // Use transaction to update skill and relations
    const skill = await prisma.$transaction(async (tx) => {
      // Delete existing relations if we're updating them
      if (data.exchange_general_ids !== undefined) {
        await tx.skillExchangeGeneral.deleteMany({
          where: { skillId: existing.id }
        });
      }
      if (data.innate_general_ids !== undefined) {
        await tx.skillInnateGeneral.deleteMany({
          where: { skillId: existing.id }
        });
      }
      if (data.inherit_general_ids !== undefined) {
        await tx.skillInheritGeneral.deleteMany({
          where: { skillId: existing.id }
        });
      }

      // Generate slug if not provided and doesn't exist
      const nameVi = data.name?.vi ?? data.nameVi ?? existing.nameVi;
      const newSlug = data.slug || existing.slug || generateSlug(nameVi);

      // Update skill - use ?? for fields that should preserve null/empty values
      const updatedSkill = await tx.skill.update({
        where: { id: existing.id },
        data: {
          slug: newSlug,
          nameCn: data.name?.cn ?? data.nameCn ?? existing.nameCn,
          nameVi: data.name?.vi ?? data.nameVi ?? existing.nameVi,
          typeId: data.type?.id ?? data.typeId ?? existing.typeId,
          typeNameCn: data.type?.name?.cn ?? data.typeNameCn ?? existing.typeNameCn,
          typeNameVi: data.type?.name?.vi ?? data.typeNameVi ?? existing.typeNameVi,
          quality: data.quality ?? existing.quality,
          triggerRate: data.trigger_rate ?? data.triggerRate ?? existing.triggerRate,
          sourceType: data.source_type ?? data.sourceType ?? existing.sourceType,
          wikiUrl: data.wiki_url ?? data.wikiUrl ?? existing.wikiUrl,
          effectCn: data.effect?.cn ?? data.effectCn ?? existing.effectCn,
          effectVi: data.effect?.vi ?? data.effectVi ?? existing.effectVi,
          target: data.target ?? existing.target,
          targetVi: data.target_vi ?? data.targetVi ?? existing.targetVi,
          armyTypes: data.army_types ?? data.armyTypes ?? existing.armyTypes,
          innateToGeneralNames: data.innate_to ?? data.innateToGenerals ?? existing.innateToGeneralNames,
          inheritanceFromGeneralNames: data.inheritance_from ?? data.inheritanceFromGenerals ?? existing.inheritanceFromGeneralNames,
          acquisitionType: data.acquisition_type ?? data.acquisitionType ?? existing.acquisitionType,
          exchangeType: data.exchange_type ?? data.exchangeType ?? existing.exchangeType,
          exchangeGenerals: data.exchange_generals ?? data.exchangeGenerals ?? existing.exchangeGenerals,
          exchangeCount: data.exchange_count ?? data.exchangeCount ?? existing.exchangeCount,
        },
      });

      // Create new relations if provided
      if (exchangeGeneralIds.length > 0) {
        await tx.skillExchangeGeneral.createMany({
          data: exchangeGeneralIds.map(generalId => ({
            skillId: existing.id,
            generalId
          }))
        });
      }
      if (innateGeneralIds.length > 0) {
        await tx.skillInnateGeneral.createMany({
          data: innateGeneralIds.map(generalId => ({
            skillId: existing.id,
            generalId
          }))
        });
      }
      if (inheritGeneralIds.length > 0) {
        await tx.skillInheritGeneral.createMany({
          data: inheritGeneralIds.map(generalId => ({
            skillId: existing.id,
            generalId
          }))
        });
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
router.delete('/:id', async (req, res) => {
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
      return res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
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

module.exports = router;
