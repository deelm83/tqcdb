import express, { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '../../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(requireAuth);

// GET /api/admin/suggestions - List all suggestions with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, entityType, entityId, limit = '50', offset = '0' } = req.query;

    const where: Prisma.EditSuggestionWhereInput = {};

    if (status && typeof status === 'string') {
      where.status = status as 'PENDING' | 'ACCEPTED' | 'REJECTED';
    }

    if (entityType && typeof entityType === 'string') {
      where.entityType = entityType;
    }

    if (entityId && typeof entityId === 'string') {
      where.entityId = entityId;
    }

    const suggestions = await prisma.editSuggestion.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.editSuggestion.count({ where });

    const transformed = suggestions.map((s) => ({
      id: s.id,
      entity_type: s.entityType,
      entity_id: s.entityId,
      changes: s.changes,
      reason: s.reason,
      status: s.status,
      user: {
        id: s.user.id,
        display_name: s.user.displayName,
        avatar_url: s.user.avatarUrl,
        email: s.user.email,
      },
      reviewed_by: s.reviewedBy,
      reviewed_at: s.reviewedAt,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
    }));

    res.json({
      suggestions: transformed,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Không thể tải danh sách đề xuất' });
  }
});

// GET /api/admin/suggestions/:id - Get suggestion detail with entity data
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const suggestion = await prisma.editSuggestion.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    });

    if (!suggestion) {
      res.status(404).json({ error: 'Không tìm thấy đề xuất' });
      return;
    }

    // Fetch entity data
    let entity = null;
    if (suggestion.entityType === 'general') {
      entity = await prisma.general.findFirst({
        where: { OR: [{ id: suggestion.entityId }, { slug: suggestion.entityId }] },
        include: {
          innateSkill: true,
          inheritedSkill: true,
        },
      });
    } else if (suggestion.entityType === 'skill') {
      const numericId = parseInt(suggestion.entityId);
      entity = await prisma.skill.findFirst({
        where: {
          OR: [
            ...(isNaN(numericId) ? [] : [{ id: numericId }]),
            { slug: suggestion.entityId }
          ],
        },
      });
    }

    const transformed = {
      id: suggestion.id,
      entity_type: suggestion.entityType,
      entity_id: suggestion.entityId,
      changes: suggestion.changes,
      reason: suggestion.reason,
      status: suggestion.status,
      user: {
        id: suggestion.user.id,
        display_name: suggestion.user.displayName,
        avatar_url: suggestion.user.avatarUrl,
        email: suggestion.user.email,
      },
      reviewed_by: suggestion.reviewedBy,
      reviewed_at: suggestion.reviewedAt,
      created_at: suggestion.createdAt,
      updated_at: suggestion.updatedAt,
      entity,
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching suggestion:', error);
    res.status(500).json({ error: 'Không thể tải thông tin đề xuất' });
  }
});

// POST /api/admin/suggestions/:id/accept - Accept and apply suggestion
router.post('/:id/accept', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?.role || 'admin';

    const suggestion = await prisma.editSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      res.status(404).json({ error: 'Không tìm thấy đề xuất' });
      return;
    }

    if (suggestion.status !== 'PENDING') {
      res.status(400).json({ error: 'Đề xuất đã được xử lý' });
      return;
    }

    // Apply changes based on entity type
    const changes = suggestion.changes as Record<string, { old: unknown; new: unknown }>;

    if (suggestion.entityType === 'general') {
      const general = await prisma.general.findFirst({
        where: { OR: [{ id: suggestion.entityId }, { slug: suggestion.entityId }] },
      });

      if (!general) {
        res.status(404).json({ error: 'Không tìm thấy tướng' });
        return;
      }

      // Build update data from changes
      const updateData: Prisma.GeneralUpdateInput = {};

      for (const [field, change] of Object.entries(changes)) {
        const newValue = change.new;

        // Map snake_case to camelCase for Prisma
        const fieldMap: Record<string, string> = {
          faction_id: 'factionId',
          wiki_url: 'wikiUrl',
          image_full: 'imageFull',
          cavalry_grade: 'cavalryGrade',
          shield_grade: 'shieldGrade',
          archer_grade: 'archerGrade',
          spear_grade: 'spearGrade',
          siege_grade: 'siegeGrade',
          // Map troop_ fields from frontend to _grade fields
          troop_cavalry: 'cavalryGrade',
          troop_shield: 'shieldGrade',
          troop_archer: 'archerGrade',
          troop_spear: 'spearGrade',
          troop_siege: 'siegeGrade',
          innate_skill_id: 'innateSkillId',
          inherited_skill_id: 'inheritedSkillId',
          base_attack: 'baseAttack',
          base_charm: 'baseCharm',
          base_command: 'baseCommand',
          base_intelligence: 'baseIntelligence',
          base_politics: 'basePolitics',
          base_speed: 'baseSpeed',
          growth_attack: 'growthAttack',
          growth_charm: 'growthCharm',
          growth_command: 'growthCommand',
          growth_intelligence: 'growthIntelligence',
          growth_politics: 'growthPolitics',
          growth_speed: 'growthSpeed',
        };

        const prismaField = fieldMap[field] || field;
        updateData[prismaField as keyof Prisma.GeneralUpdateInput] = newValue as never;
      }

      // Update the general
      await prisma.general.update({
        where: { id: general.id },
        data: updateData,
      });

      // Handle skill relation updates if needed
      if (changes.innate_skill_id || changes.innateSkillId) {
        const newInnateSkillId = (changes.innate_skill_id?.new || changes.innateSkillId?.new) as number | null;
        if (newInnateSkillId !== general.innateSkillId) {
          // Remove old relation
          if (general.innateSkillId) {
            await prisma.skillInnateGeneral.deleteMany({
              where: { skillId: general.innateSkillId, generalId: general.id },
            });
          }
          // Add new relation
          if (newInnateSkillId) {
            await prisma.skillInnateGeneral.upsert({
              where: { skillId_generalId: { skillId: newInnateSkillId, generalId: general.id } },
              update: {},
              create: { skillId: newInnateSkillId, generalId: general.id },
            });
          }
        }
      }

      if (changes.inherited_skill_id || changes.inheritedSkillId) {
        const newInheritedSkillId = (changes.inherited_skill_id?.new || changes.inheritedSkillId?.new) as number | null;
        if (newInheritedSkillId !== general.inheritedSkillId) {
          // Remove old relation
          if (general.inheritedSkillId) {
            await prisma.skillInheritGeneral.deleteMany({
              where: { skillId: general.inheritedSkillId, generalId: general.id },
            });
          }
          // Add new relation
          if (newInheritedSkillId) {
            await prisma.skillInheritGeneral.upsert({
              where: { skillId_generalId: { skillId: newInheritedSkillId, generalId: general.id } },
              update: {},
              create: { skillId: newInheritedSkillId, generalId: general.id },
            });
          }
        }
      }
    } else if (suggestion.entityType === 'skill') {
      const numericId = parseInt(suggestion.entityId);
      const skill = await prisma.skill.findFirst({
        where: {
          OR: [
            ...(isNaN(numericId) ? [] : [{ id: numericId }]),
            { slug: suggestion.entityId }
          ],
        },
      });

      if (!skill) {
        res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
        return;
      }

      // Build update data from changes
      const updateData: Prisma.SkillUpdateInput = {};

      for (const [field, change] of Object.entries(changes)) {
        const newValue = change.new;

        // Map snake_case to camelCase for Prisma
        const fieldMap: Record<string, string> = {
          type_id: 'typeId',
          type_name: 'typeName',
          trigger_rate: 'triggerRate',
          source_type: 'sourceType',
          wiki_url: 'wikiUrl',
          army_types: 'armyTypes',
          acquisition_type: 'acquisitionType',
          exchange_type: 'exchangeType',
          exchange_generals: 'exchangeGenerals',
          exchange_count: 'exchangeCount',
        };

        const prismaField = fieldMap[field] || field;
        updateData[prismaField as keyof Prisma.SkillUpdateInput] = newValue as never;
      }

      // Update the skill
      await prisma.skill.update({
        where: { id: skill.id },
        data: updateData,
      });
    }

    // Mark suggestion as accepted
    const updatedSuggestion = await prisma.editSuggestion.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json({
      success: true,
      suggestion: {
        id: updatedSuggestion.id,
        entity_type: updatedSuggestion.entityType,
        entity_id: updatedSuggestion.entityId,
        changes: updatedSuggestion.changes,
        reason: updatedSuggestion.reason,
        status: updatedSuggestion.status,
        reviewed_by: updatedSuggestion.reviewedBy,
        reviewed_at: updatedSuggestion.reviewedAt,
      },
    });
  } catch (error) {
    console.error('Error accepting suggestion:', error);
    res.status(500).json({ error: 'Không thể chấp nhận đề xuất' });
  }
});

// POST /api/admin/suggestions/:id/reject - Reject suggestion
router.post('/:id/reject', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?.role || 'admin';

    const suggestion = await prisma.editSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      res.status(404).json({ error: 'Không tìm thấy đề xuất' });
      return;
    }

    if (suggestion.status !== 'PENDING') {
      res.status(400).json({ error: 'Đề xuất đã được xử lý' });
      return;
    }

    // Mark suggestion as rejected
    const updatedSuggestion = await prisma.editSuggestion.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json({
      success: true,
      suggestion: {
        id: updatedSuggestion.id,
        entity_type: updatedSuggestion.entityType,
        entity_id: updatedSuggestion.entityId,
        changes: updatedSuggestion.changes,
        reason: updatedSuggestion.reason,
        status: updatedSuggestion.status,
        reviewed_by: updatedSuggestion.reviewedBy,
        reviewed_at: updatedSuggestion.reviewedAt,
      },
    });
  } catch (error) {
    console.error('Error rejecting suggestion:', error);
    res.status(500).json({ error: 'Không thể từ chối đề xuất' });
  }
});

interface SummarizeSuggestionsBody {
  suggestionIds: string[];
}

// POST /api/admin/suggestions/summarize - AI consolidation using Anthropic
router.post('/summarize', async (req: Request<object, object, SummarizeSuggestionsBody>, res: Response) => {
  try {
    const { suggestionIds } = req.body;

    if (!suggestionIds || !Array.isArray(suggestionIds) || suggestionIds.length === 0) {
      res.status(400).json({ error: 'Cần cung cấp danh sách ID đề xuất' });
      return;
    }

    // Fetch all suggestions
    const suggestions = await prisma.editSuggestion.findMany({
      where: {
        id: { in: suggestionIds },
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (suggestions.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy đề xuất nào' });
      return;
    }

    // Verify all suggestions are for the same entity
    const firstEntityType = suggestions[0].entityType;
    const firstEntityId = suggestions[0].entityId;
    const allSameEntity = suggestions.every(
      (s) => s.entityType === firstEntityType && s.entityId === firstEntityId
    );

    if (!allSameEntity) {
      res.status(400).json({ error: 'Tất cả đề xuất phải thuộc cùng một đối tượng' });
      return;
    }

    // Fetch current entity data
    let entity = null;
    if (firstEntityType === 'general') {
      entity = await prisma.general.findFirst({
        where: { OR: [{ id: firstEntityId }, { slug: firstEntityId }] },
      });
    } else if (firstEntityType === 'skill') {
      const numericId = parseInt(firstEntityId);
      entity = await prisma.skill.findFirst({
        where: {
          OR: [
            ...(isNaN(numericId) ? [] : [{ id: numericId }]),
            { slug: firstEntityId }
          ],
        },
      });
    }

    if (!entity) {
      res.status(404).json({ error: 'Không tìm thấy đối tượng' });
      return;
    }

    // Prepare data for AI
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'ANTHROPIC_API_KEY chưa được cấu hình' });
      return;
    }

    const anthropic = new Anthropic({ apiKey });

    // Format suggestions for AI
    const suggestionsText = suggestions
      .map((s, i) => {
        const changes = s.changes as Record<string, { old: unknown; new: unknown }>;
        const changesText = Object.entries(changes)
          .map(([field, change]) => `  - ${field}: "${change.old}" → "${change.new}"`)
          .join('\n');
        return `Đề xuất ${i + 1} (từ ${s.user.displayName}):\n${changesText}\nLý do: ${s.reason || 'Không có'}`;
      })
      .join('\n\n');

    const prompt = `Bạn là trợ lý quản trị wiki game Tam Quốc Chí. Nhiều người dùng đã đề xuất các thay đổi cho cùng một ${firstEntityType === 'general' ? 'tướng' : 'chiến pháp'}.

Dữ liệu hiện tại:
${JSON.stringify(entity, null, 2)}

Các đề xuất từ người dùng:
${suggestionsText}

Nhiệm vụ của bạn:
1. Phân tích tất cả các đề xuất
2. Xác định các thay đổi có sự đồng thuận (nhiều người đề xuất giống nhau)
3. Giải quyết các xung đột (các đề xuất khác nhau cho cùng một trường)
4. Đề xuất bộ thay đổi tốt nhất dựa trên:
   - Số lượng người đề xuất giống nhau
   - Chất lượng lý do giải thích
   - Tính logic và nhất quán của dữ liệu

Trả về JSON với format sau (KHÔNG dùng markdown, chỉ JSON thuần):
{
  "recommended_changes": {
    "field_name": {
      "old": "giá trị cũ",
      "new": "giá trị được đề xuất",
      "confidence": "high|medium|low",
      "reason": "Giải thích tại sao chọn giá trị này"
    }
  },
  "conflicts": [
    {
      "field": "tên trường",
      "suggestions": [
        { "value": "giá trị 1", "count": 2, "users": ["user1", "user2"] },
        { "value": "giá trị 2", "count": 1, "users": ["user3"] }
      ],
      "recommendation": "Nên chọn giá trị nào và tại sao"
    }
  ],
  "summary": "Tóm tắt tổng quan về các đề xuất"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse AI response
    const content = response.content[0];
    if (content.type !== 'text') {
      res.status(500).json({ error: 'Định dạng phản hồi không hợp lệ' });
      return;
    }

    let summary;
    try {
      let jsonText = content.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      summary = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse AI response:', content.text);
      res.status(500).json({
        error: 'Không thể phân tích phản hồi từ AI',
        raw: content.text,
      });
      return;
    }

    res.json({
      success: true,
      entity_type: firstEntityType,
      entity_id: firstEntityId,
      suggestions_count: suggestions.length,
      summary,
    });
  } catch (error) {
    console.error('Error summarizing suggestions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Không thể tổng hợp đề xuất: ' + errorMessage });
  }
});

export default router;
