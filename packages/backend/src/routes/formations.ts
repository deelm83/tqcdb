import express, { Request, Response } from 'express';
import { PrismaClient, ArmyType } from '@prisma/client';
import { requireUser, optionalUser } from '../middleware/userAuth';

const router = express.Router();
const prisma = new PrismaClient();

// Validate formation cost (max 21)
async function validateFormationCost(generals: { generalId: string }[]): Promise<{ valid: boolean; totalCost: number }> {
  const generalData = await prisma.general.findMany({
    where: { id: { in: generals.map(g => g.generalId) } },
    select: { id: true, cost: true }
  });

  const totalCost = generalData.reduce((sum, g) => sum + g.cost, 0);
  return { valid: totalCost <= 21, totalCost };
}

// GET all formations with filtering, pagination
interface FormationsQuery {
  search?: string;
  armyType?: string;
  curated?: string;
  userId?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

router.get('/', optionalUser, async (req: Request<object, object, object, FormationsQuery>, res: Response) => {
  try {
    const {
      search,
      armyType,
      curated,
      userId,
      sort = 'rank',
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: {
      isPublic?: boolean;
      isCurated?: boolean;
      armyType?: ArmyType;
      userId?: string;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        generals?: { some: { general: { name: { contains: string; mode: 'insensitive' } } } };
      }>;
    } = {};

    // Only show public formations unless viewing own formations
    if (userId && req.user && req.user.id === userId) {
      // Show all formations for the user (public and private)
      where.userId = userId;
    } else if (userId) {
      // Show only public formations for other users
      where.userId = userId;
      where.isPublic = true;
    } else {
      // Show only public formations
      where.isPublic = true;
    }

    if (curated === 'true') {
      where.isCurated = true;
    }

    if (armyType && Object.values(ArmyType).includes(armyType as ArmyType)) {
      where.armyType = armyType as ArmyType;
    }

    // Add search filter to Prisma query instead of filtering after fetch
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { generals: { some: { general: { name: { contains: search, mode: 'insensitive' } } } } }
      ];
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

    // Get total count for pagination (with search filter applied)
    const total = await prisma.formation.count({ where });

    // Fetch formations
    const formations = await prisma.formation.findMany({
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
        votes: req.user ? {
          where: {
            userId: req.user.id
          },
          select: {
            value: true
          }
        } : false,
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
      userVote: req.user && f.votes && f.votes.length > 0 ? f.votes[0].value : null,
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
    console.error('Error fetching formations:', error);
    res.status(500).json({ error: 'Không thể tải danh sách đội hình' });
  }
});

// GET formation by ID
router.get('/:id', optionalUser, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const formation = await prisma.formation.findUnique({
      where: { id },
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
        },
        votes: req.user ? {
          where: {
            userId: req.user.id
          },
          select: {
            value: true
          }
        } : false,
        _count: {
          select: {
            votes: true
          }
        }
      }
    });

    if (!formation) {
      res.status(404).json({ error: 'Không tìm thấy đội hình' });
      return;
    }

    // Check if user can view this formation
    if (!formation.isPublic && (!req.user || req.user.id !== formation.userId)) {
      res.status(403).json({ error: 'Không có quyền xem đội hình này' });
      return;
    }

    const transformed = {
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
      user: formation.user ? {
        id: formation.user.id,
        displayName: formation.user.displayName,
        avatarUrl: formation.user.avatarUrl,
      } : null,
      generals: formation.generals.map(fg => ({
        id: fg.id,
        position: fg.position,
        general: fg.general,
        skill1: fg.skill1,
        skill2: fg.skill2,
      })),
      userVote: req.user && formation.votes && formation.votes.length > 0 ? formation.votes[0].value : null,
      totalCost: formation.generals.reduce((sum, g) => sum + g.general.cost, 0),
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching formation:', error);
    res.status(500).json({ error: 'Không thể tải đội hình' });
  }
});

// POST create formation (auth required)
interface CreateFormationBody {
  name: string;
  description?: string;
  armyType: ArmyType;
  isPublic?: boolean;
  generals: {
    generalId: string;
    position: number;
    skill1Id?: number;
    skill2Id?: number;
  }[];
}

router.post('/', requireUser, async (req: Request<object, object, CreateFormationBody>, res: Response) => {
  try {
    const { name, description, armyType, isPublic = false, generals } = req.body;
    const userId = req.user!.id;

    // Validation - name is optional
    if (!armyType || !generals || generals.length < 1 || generals.length > 3) {
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
    console.error('Error creating formation:', error);
    res.status(500).json({ error: 'Không thể tạo đội hình' });
  }
});

// PUT update formation (owner only)
router.put('/:id', requireUser, async (req: Request<{ id: string }, object, CreateFormationBody>, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, armyType, isPublic, generals } = req.body;
    const userId = req.user!.id;

    // Check if formation exists and user is owner
    const existingFormation = await prisma.formation.findUnique({
      where: { id },
      select: { userId: true, isCurated: true }
    });

    if (!existingFormation) {
      res.status(404).json({ error: 'Không tìm thấy đội hình' });
      return;
    }

    if (existingFormation.userId !== userId) {
      res.status(403).json({ error: 'Không có quyền chỉnh sửa đội hình này' });
      return;
    }

    // Cannot edit curated formations' content, only visibility
    if (existingFormation.isCurated && generals) {
      res.status(403).json({ error: 'Không thể chỉnh sửa nội dung đội hình được quản trị' });
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
      description?: string;
      armyType?: ArmyType;
      isPublic?: boolean;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (armyType !== undefined) updateData.armyType = armyType;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

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
    console.error('Error updating formation:', error);
    res.status(500).json({ error: 'Không thể cập nhật đội hình' });
  }
});

// DELETE formation (owner only)
router.delete('/:id', requireUser, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if formation exists and user is owner
    const existingFormation = await prisma.formation.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingFormation) {
      res.status(404).json({ error: 'Không tìm thấy đội hình' });
      return;
    }

    if (existingFormation.userId !== userId) {
      res.status(403).json({ error: 'Không có quyền xóa đội hình này' });
      return;
    }

    await prisma.formation.delete({
      where: { id }
    });

    res.json({ message: 'Đã xóa đội hình thành công' });
  } catch (error) {
    console.error('Error deleting formation:', error);
    res.status(500).json({ error: 'Không thể xóa đội hình' });
  }
});

// POST copy formation (auth required)
router.post('/:id/copy', requireUser, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get original formation
    const originalFormation = await prisma.formation.findUnique({
      where: { id },
      include: {
        generals: true
      }
    });

    if (!originalFormation) {
      res.status(404).json({ error: 'Không tìm thấy đội hình' });
      return;
    }

    // Check if formation is public or owned by user
    if (!originalFormation.isPublic && originalFormation.userId !== userId) {
      res.status(403).json({ error: 'Không có quyền sao chép đội hình này' });
      return;
    }

    // Create copy
    const copiedFormation = await prisma.formation.create({
      data: {
        name: `${originalFormation.name} (Sao chép)`,
        description: originalFormation.description,
        armyType: originalFormation.armyType,
        isPublic: false, // Copies are private by default
        userId,
        generals: {
          create: originalFormation.generals.map(g => ({
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
      id: copiedFormation.id,
      name: copiedFormation.name,
      description: copiedFormation.description,
      armyType: copiedFormation.armyType,
      isPublic: copiedFormation.isPublic,
      isCurated: copiedFormation.isCurated,
      rankScore: copiedFormation.rankScore,
      voteCount: copiedFormation.voteCount,
      createdAt: copiedFormation.createdAt,
      updatedAt: copiedFormation.updatedAt,
      user: copiedFormation.user,
      generals: copiedFormation.generals,
      totalCost: copiedFormation.generals.reduce((sum, g) => sum + g.general.cost, 0),
    });
  } catch (error) {
    console.error('Error copying formation:', error);
    res.status(500).json({ error: 'Không thể sao chép đội hình' });
  }
});

// POST vote on formation (auth required, curated only)
interface VoteBody {
  value: number; // +1 or -1
}

router.post('/:id/vote', requireUser, async (req: Request<{ id: string }, object, VoteBody>, res: Response) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    const userId = req.user!.id;

    // Validate vote value
    if (value !== 1 && value !== -1) {
      res.status(400).json({ error: 'Giá trị vote không hợp lệ. Chỉ chấp nhận +1 hoặc -1' });
      return;
    }

    // Check if formation exists and is curated
    const formation = await prisma.formation.findUnique({
      where: { id },
      select: { isCurated: true }
    });

    if (!formation) {
      res.status(404).json({ error: 'Không tìm thấy đội hình' });
      return;
    }

    if (!formation.isCurated) {
      res.status(400).json({ error: 'Chỉ có thể vote cho đội hình được quản trị' });
      return;
    }

    // Upsert vote
    await prisma.formationVote.upsert({
      where: {
        formationId_userId: {
          formationId: id,
          userId
        }
      },
      update: {
        value
      },
      create: {
        formationId: id,
        userId,
        value
      }
    });

    // Recalculate rank score
    const votes = await prisma.formationVote.findMany({
      where: { formationId: id }
    });

    const rankScore = votes.reduce((sum, v) => sum + v.value, 0);
    const voteCount = votes.length;

    await prisma.formation.update({
      where: { id },
      data: { rankScore, voteCount }
    });

    res.json({
      message: 'Đã vote thành công',
      rankScore,
      voteCount,
      userVote: value
    });
  } catch (error) {
    console.error('Error voting on formation:', error);
    res.status(500).json({ error: 'Không thể vote cho đội hình' });
  }
});

export default router;
