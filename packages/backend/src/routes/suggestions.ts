import express, { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { requireUser } from '../middleware/userAuth';

const router = express.Router();
const prisma = new PrismaClient();

// Apply user auth middleware to all routes
router.use(requireUser);

interface CreateSuggestionBody {
  entityType: string;
  entityId: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  reason?: string;
}

// POST /api/suggestions - Create a new suggestion
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const body = req.body as CreateSuggestionBody;
    const { entityType, entityId, changes, reason } = body;

    // Validate input
    if (!entityType || !entityId || !changes || typeof changes !== 'object') {
      res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      return;
    }

    // Validate entityType
    if (entityType !== 'general' && entityType !== 'skill') {
      res.status(400).json({ error: 'entityType phải là "general" hoặc "skill"' });
      return;
    }

    // Verify entity exists
    if (entityType === 'general') {
      const general = await prisma.general.findFirst({
        where: { OR: [{ id: entityId }, { slug: entityId }] },
      });
      if (!general) {
        res.status(404).json({ error: 'Không tìm thấy tướng' });
        return;
      }
    } else if (entityType === 'skill') {
      const numericId = parseInt(entityId);
      const skill = await prisma.skill.findFirst({
        where: {
          OR: [
            ...(isNaN(numericId) ? [] : [{ id: numericId }]),
            { slug: entityId }
          ]
        },
      });
      if (!skill) {
        res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
        return;
      }
    }

    // Create suggestion
    const suggestion = await prisma.editSuggestion.create({
      data: {
        entityType,
        entityId,
        changes: changes as Prisma.InputJsonValue,
        reason,
        userId: user.id,
        status: 'PENDING',
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

    res.status(201).json({
      success: true,
      suggestion: {
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
        },
        created_at: suggestion.createdAt,
        updated_at: suggestion.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({ error: 'Không thể tạo đề xuất' });
  }
});

// GET /api/suggestions/mine - Get current user's suggestions
router.get('/mine', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { status, entityType, limit = '50', offset = '0' } = req.query;

    const where: Prisma.EditSuggestionWhereInput = {
      userId: user.id,
    };

    if (status && typeof status === 'string') {
      where.status = status as 'PENDING' | 'ACCEPTED' | 'REJECTED';
    }

    if (entityType && typeof entityType === 'string') {
      where.entityType = entityType;
    }

    const suggestions = await prisma.editSuggestion.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
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
    console.error('Error fetching user suggestions:', error);
    res.status(500).json({ error: 'Không thể tải danh sách đề xuất' });
  }
});

export default router;
