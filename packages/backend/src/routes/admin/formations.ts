import express, { Request, Response } from 'express';
import { PrismaClient, ArmyType } from '@prisma/client';
import { requireAuth } from '../../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(requireAuth);

// Validate formation cost (max 21)
async function validateFormationCost(generals: { generalId: string }[]): Promise<{ valid: boolean; totalCost: number }> {
  const generalData = await prisma.general.findMany({
    where: { id: { in: generals.map(g => g.generalId) } },
    select: { id: true, cost: true }
  });

  const totalCost = generalData.reduce((sum, g) => sum + g.cost, 0);
  return { valid: totalCost <= 21, totalCost };
}

// GET /api/admin/formations - List all formations (including private)
interface AdminFormationsQuery {
  search?: string;
  armyType?: string;
  curated?: string;
  userId?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

router.get('/', async (req: Request<object, object, object, AdminFormationsQuery>, res: Response) => {
  try {
    const {
      search,
      armyType,
      curated,
      userId,
      sort = 'rank',
      page = '1',
      limit = '50'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause (admin sees all formations)
    const where: {
      isCurated?: boolean;
      armyType?: ArmyType;
      userId?: string;
    } = {};

    if (curated === 'true') {
      where.isCurated = true;
    }

    if (armyType && Object.values(ArmyType).includes(armyType as ArmyType)) {
      where.armyType = armyType as ArmyType;
    }

    if (userId) {
      where.userId = userId;
    }

    // Build orderBy
    let orderBy: object[] = [];
    switch (sort) {
      case 'rank':
        orderBy = [{ rankScore: 'desc' }, { voteCount: 'desc' }];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ createdAt: 'asc' }];
        break;
      default:
        orderBy = [{ rankScore: 'desc' }];
    }

    // Fetch formations
    let formations = await prisma.formation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          }
        },
        generals: {
          include: {
            general: {
              select: {
                id: true,
                name: true,
                image: true,
                cost: true,
              }
            },
            skill1: {
              select: {
                id: true,
                name: true,
              }
            },
            skill2: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { position: 'asc' }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: orderBy as any,
      skip,
      take: limitNum,
    });

    // Apply search filter (by general name)
    if (search) {
      const searchLower = search.toLowerCase();
      formations = formations.filter(f =>
        f.name.toLowerCase().includes(searchLower) ||
        f.generals.some(g =>
          g.general.name.toLowerCase().includes(searchLower)
        )
      );
    }

    // Get total count for pagination
    const total = await prisma.formation.count({ where });

    // Transform to response format
    const transformed = formations.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      armyType: f.armyType,
      isPublic: f.isPublic,
      isCurated: f.isCurated,
      rankScore: f.rankScore,
      voteCount: f.voteCount,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      user: f.user ? {
        id: f.user.id,
        displayName: f.user.displayName,
        avatarUrl: f.user.avatarUrl,
      } : null,
      generals: f.generals.map(fg => ({
        id: fg.id,
        position: fg.position,
        general: fg.general,
        skill1: fg.skill1,
        skill2: fg.skill2,
      })),
      totalCost: f.generals.reduce((sum, g) => sum + g.general.cost, 0),
    }));

    res.json({
      formations: transformed,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error('Error fetching admin formations:', error);
    res.status(500).json({ error: 'Không thể tải danh sách đội hình' });
  }
});

// POST /api/admin/formations - Create curated formation
interface CreateAdminFormationBody {
  name: string;
  description?: string;
  armyType: ArmyType;
  isPublic?: boolean;
  isCurated?: boolean;
  userId?: string | null; // optional: assign to specific user, or null for admin-owned
  generals: {
    generalId: string;
    position: number;
    skill1Id?: number;
    skill2Id?: number;
  }[];
}

router.post('/', async (req: Request<object, object, CreateAdminFormationBody>, res: Response) => {
  try {
    const { name, description, armyType, isPublic = true, isCurated = true, userId = null, generals } = req.body;

    // Validation
    if (!name || !armyType || !generals || generals.length < 1 || generals.length > 3) {
      res.status(400).json({ error: 'Dữ liệu không hợp lệ. Đội hình cần có 1-3 tướng.' });
      return;
    }

    // Validate army type
    if (!Object.values(ArmyType).includes(armyType)) {
      res.status(400).json({ error: 'Loại binh không hợp lệ' });
      return;
    }

    // Validate positions are unique and 1-3
    const positions = generals.map(g => g.position);
    if (new Set(positions).size !== positions.length || positions.some(p => p < 1 || p > 3)) {
      res.status(400).json({ error: 'Vị trí tướng không hợp lệ' });
      return;
    }

    // Validate general IDs are unique
    const generalIds = generals.map(g => g.generalId);
    if (new Set(generalIds).size !== generalIds.length) {
      res.status(400).json({ error: 'Không thể thêm tướng trùng lặp' });
      return;
    }

    // Validate cost
    const costValidation = await validateFormationCost(generals);
    if (!costValidation.valid) {
      res.status(400).json({
        error: `Tổng chi phí vượt quá 21. Chi phí hiện tại: ${costValidation.totalCost}`
      });
      return;
    }

    // Create formation
    const formation = await prisma.formation.create({
      data: {
        name,
        description,
        armyType,
        isPublic,
        isCurated,
        userId,
        generals: {
          create: generals.map(g => ({
            generalId: g.generalId,
            position: g.position,
            skill1Id: g.skill1Id,
            skill2Id: g.skill2Id,
          }))
        }
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          }
        },
        generals: {
          include: {
            general: true,
            skill1: true,
            skill2: true,
          },
          orderBy: { position: 'asc' }
        }
      }
    });

    res.status(201).json({
      id: formation.id,
      name: formation.name,
      description: formation.description,
      armyType: formation.armyType,
      isPublic: formation.isPublic,
      isCurated: formation.isCurated,
      rankScore: formation.rankScore,
      voteCount: formation.voteCount,
      createdAt: formation.createdAt,
      updatedAt: formation.updatedAt,
      user: formation.user,
      generals: formation.generals,
      totalCost: costValidation.totalCost,
    });
  } catch (error) {
    console.error('Error creating admin formation:', error);
    res.status(500).json({ error: 'Không thể tạo đội hình' });
  }
});

// PUT /api/admin/formations/:id - Update any formation
router.put('/:id', async (req: Request<{ id: string }, object, CreateAdminFormationBody>, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, armyType, isPublic, isCurated, userId, generals } = req.body;

    // Check if formation exists
    const existingFormation = await prisma.formation.findUnique({
      where: { id }
    });

    if (!existingFormation) {
      res.status(404).json({ error: 'Không tìm thấy đội hình' });
      return;
    }

    // Validation if updating generals
    if (generals) {
      if (generals.length < 1 || generals.length > 3) {
        res.status(400).json({ error: 'Dữ liệu không hợp lệ. Đội hình cần có 1-3 tướng.' });
        return;
      }

      // Validate positions
      const positions = generals.map(g => g.position);
      if (new Set(positions).size !== positions.length || positions.some(p => p < 1 || p > 3)) {
        res.status(400).json({ error: 'Vị trí tướng không hợp lệ' });
        return;
      }

      // Validate general IDs are unique
      const generalIds = generals.map(g => g.generalId);
      if (new Set(generalIds).size !== generalIds.length) {
        res.status(400).json({ error: 'Không thể thêm tướng trùng lặp' });
        return;
      }

      // Validate cost
      const costValidation = await validateFormationCost(generals);
      if (!costValidation.valid) {
        res.status(400).json({
          error: `Tổng chi phí vượt quá 21. Chi phí hiện tại: ${costValidation.totalCost}`
        });
        return;
      }
    }

    // Build update data
    const updateData: {
      name?: string;
      description?: string | null;
      armyType?: ArmyType;
      isPublic?: boolean;
      isCurated?: boolean;
      userId?: string | null;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (armyType !== undefined) updateData.armyType = armyType;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (isCurated !== undefined) updateData.isCurated = isCurated;
    if (userId !== undefined) updateData.userId = userId;

    // Update formation
    const formation = await prisma.$transaction(async (tx) => {
      // Delete existing generals if updating
      if (generals) {
        await tx.formationGeneral.deleteMany({
          where: { formationId: id }
        });
      }

      // Update formation
      return await tx.formation.update({
        where: { id },
        data: {
          ...updateData,
          ...(generals && {
            generals: {
              create: generals.map(g => ({
                generalId: g.generalId,
                position: g.position,
                skill1Id: g.skill1Id,
                skill2Id: g.skill2Id,
              }))
            }
          })
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            }
          },
          generals: {
            include: {
              general: true,
              skill1: true,
              skill2: true,
            },
            orderBy: { position: 'asc' }
          }
        }
      });
    });

    res.json({
      id: formation.id,
      name: formation.name,
      description: formation.description,
      armyType: formation.armyType,
      isPublic: formation.isPublic,
      isCurated: formation.isCurated,
      rankScore: formation.rankScore,
      voteCount: formation.voteCount,
      createdAt: formation.createdAt,
      updatedAt: formation.updatedAt,
      user: formation.user,
      generals: formation.generals,
      totalCost: formation.generals.reduce((sum, g) => sum + g.general.cost, 0),
    });
  } catch (error) {
    console.error('Error updating admin formation:', error);
    res.status(500).json({ error: 'Không thể cập nhật đội hình' });
  }
});

// DELETE /api/admin/formations/:id - Delete any formation
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // Check if formation exists
    const existingFormation = await prisma.formation.findUnique({
      where: { id }
    });

    if (!existingFormation) {
      res.status(404).json({ error: 'Không tìm thấy đội hình' });
      return;
    }

    await prisma.formation.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Đã xóa đội hình thành công' });
  } catch (error) {
    console.error('Error deleting admin formation:', error);
    res.status(500).json({ error: 'Không thể xóa đội hình' });
  }
});

export default router;
