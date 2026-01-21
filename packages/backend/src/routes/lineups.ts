import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireUser } from '../middleware/userAuth';

const router = express.Router();
const prisma = new PrismaClient();

// Conflict detection types
interface GeneralConflict {
  generalId: string;
  generalName: string;
  formationIds: string[];
}

interface SkillConflict {
  skillId: number;
  skillName: string;
  formationIds: string[];
  resolved: boolean;
}

// Detect general conflicts (same general in multiple formations)
function detectGeneralConflicts(
  formations: Array<{
    id: string;
    generals: Array<{
      generalId: string;
      general: { id: string; name: string };
    }>;
  }>
): GeneralConflict[] {
  const generalUsage = new Map<string, { name: string; formationIds: string[] }>();

  formations.forEach(f => {
    f.generals.forEach(fg => {
      if (!generalUsage.has(fg.generalId)) {
        generalUsage.set(fg.generalId, {
          name: fg.general.name,
          formationIds: []
        });
      }
      generalUsage.get(fg.generalId)!.formationIds.push(f.id);
    });
  });

  return Array.from(generalUsage.entries())
    .filter(([_, data]) => data.formationIds.length > 1)
    .map(([generalId, data]) => ({
      generalId,
      generalName: data.name,
      formationIds: data.formationIds,
    }));
}

// Detect skill conflicts (same skill in multiple formations)
function detectSkillConflicts(
  formations: Array<{
    id: string;
    generals: Array<{
      skill1Id: number | null;
      skill2Id: number | null;
      skill1?: { id: number; name: string } | null;
      skill2?: { id: number; name: string } | null;
    }>;
  }>,
  resolutions: Array<{ skillId: number }>
): SkillConflict[] {
  const skillUsage = new Map<number, { name: string; formationIds: string[] }>();
  const resolvedSkills = new Set(resolutions.map(r => r.skillId));

  formations.forEach(f => {
    f.generals.forEach(fg => {
      // Check skill1
      if (fg.skill1Id && fg.skill1) {
        if (!skillUsage.has(fg.skill1Id)) {
          skillUsage.set(fg.skill1Id, {
            name: fg.skill1.name,
            formationIds: []
          });
        }
        if (!skillUsage.get(fg.skill1Id)!.formationIds.includes(f.id)) {
          skillUsage.get(fg.skill1Id)!.formationIds.push(f.id);
        }
      }

      // Check skill2
      if (fg.skill2Id && fg.skill2) {
        if (!skillUsage.has(fg.skill2Id)) {
          skillUsage.set(fg.skill2Id, {
            name: fg.skill2.name,
            formationIds: []
          });
        }
        if (!skillUsage.get(fg.skill2Id)!.formationIds.includes(f.id)) {
          skillUsage.get(fg.skill2Id)!.formationIds.push(f.id);
        }
      }
    });
  });

  return Array.from(skillUsage.entries())
    .filter(([_, data]) => data.formationIds.length > 1)
    .map(([skillId, data]) => ({
      skillId,
      skillName: data.name,
      formationIds: data.formationIds,
      resolved: resolvedSkills.has(skillId)
    }));
}

// GET all line-ups for the authenticated user
router.get('/', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const lineups = await prisma.lineUp.findMany({
      where: { userId },
      include: {
        formations: {
          include: {
            formation: {
              include: {
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
                }
              }
            }
          },
          orderBy: { position: 'asc' }
        },
        skillResolutions: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Transform to response format with conflict info
    const transformed = lineups.map(lineup => {
      const formations = lineup.formations.map(lf => lf.formation);
      const generalConflicts = detectGeneralConflicts(formations);
      const skillConflicts = detectSkillConflicts(formations, lineup.skillResolutions);

      return {
        id: lineup.id,
        name: lineup.name,
        createdAt: lineup.createdAt,
        updatedAt: lineup.updatedAt,
        formationCount: lineup.formations.length,
        generalConflicts: generalConflicts.length,
        skillConflicts: skillConflicts.length,
        unresolvedSkillConflicts: skillConflicts.filter(sc => !sc.resolved).length,
      };
    });

    res.json({ lineups: transformed });
  } catch (error) {
    console.error('Error fetching lineups:', error);
    res.status(500).json({ error: 'Không thể tải danh sách dàn trận' });
  }
});

// GET line-up by ID with full details and conflict info
router.get('/:id', requireUser, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const lineup = await prisma.lineUp.findUnique({
      where: { id },
      include: {
        formations: {
          include: {
            formation: {
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
            }
          },
          orderBy: { position: 'asc' }
        },
        skillResolutions: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    if (!lineup) {
      res.status(404).json({ error: 'Không tìm thấy dàn trận' });
      return;
    }

    // Check ownership
    if (lineup.userId !== userId) {
      res.status(403).json({ error: 'Không có quyền xem dàn trận này' });
      return;
    }

    // Detect conflicts
    const formations = lineup.formations.map(lf => lf.formation);
    const generalConflicts = detectGeneralConflicts(formations);
    const skillConflicts = detectSkillConflicts(formations, lineup.skillResolutions);

    // Transform formations
    const transformedFormations = lineup.formations.map(lf => ({
      id: lf.formation.id,
      name: lf.formation.name,
      description: lf.formation.description,
      armyType: lf.formation.armyType,
      position: lf.position,
      user: lf.formation.user,
      generals: lf.formation.generals.map(fg => ({
        id: fg.id,
        position: fg.position,
        general: fg.general,
        skill1: fg.skill1,
        skill2: fg.skill2,
      })),
      totalCost: lf.formation.generals.reduce((sum, g) => sum + g.general.cost, 0),
    }));

    res.json({
      id: lineup.id,
      name: lineup.name,
      createdAt: lineup.createdAt,
      updatedAt: lineup.updatedAt,
      formations: transformedFormations,
      generalConflicts,
      skillConflicts,
      skillResolutions: lineup.skillResolutions.map(sr => ({
        skillId: sr.skillId,
        skillName: sr.skill.name,
        resolved: sr.resolved,
        note: sr.note,
      })),
    });
  } catch (error) {
    console.error('Error fetching lineup:', error);
    res.status(500).json({ error: 'Không thể tải dàn trận' });
  }
});

// POST create line-up
interface CreateLineUpBody {
  name: string;
  formationIds: string[];
}

router.post('/', requireUser, async (req: Request<object, object, CreateLineUpBody>, res: Response) => {
  try {
    const { name, formationIds } = req.body;
    const userId = req.user!.id;

    // Validation
    if (!name || !formationIds || formationIds.length === 0) {
      res.status(400).json({ error: 'Dữ liệu không hợp lệ. Cần có tên và ít nhất 1 đội hình.' });
      return;
    }

    // Validate formations exist and belong to user
    const formations = await prisma.formation.findMany({
      where: {
        id: { in: formationIds },
      },
      include: {
        generals: {
          include: {
            general: {
              select: {
                id: true,
                name: true,
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
          }
        }
      }
    });

    if (formations.length !== formationIds.length) {
      res.status(404).json({ error: 'Một số đội hình không tồn tại' });
      return;
    }

    // Check for general conflicts (hard block)
    const generalConflicts = detectGeneralConflicts(formations);
    if (generalConflicts.length > 0) {
      res.status(400).json({
        error: 'Có xung đột võ tướng. Không thể sử dụng cùng một võ tướng trong nhiều đội hình.',
        generalConflicts
      });
      return;
    }

    // Create line-up
    const lineup = await prisma.lineUp.create({
      data: {
        name,
        userId,
        formations: {
          create: formationIds.map((formationId, index) => ({
            formationId,
            position: index + 1,
          }))
        }
      },
      include: {
        formations: {
          include: {
            formation: {
              include: {
                generals: {
                  include: {
                    general: true,
                    skill1: true,
                    skill2: true,
                  },
                  orderBy: { position: 'asc' }
                }
              }
            }
          },
          orderBy: { position: 'asc' }
        },
        skillResolutions: true
      }
    });

    // Detect skill conflicts for response
    const skillConflicts = detectSkillConflicts(
      lineup.formations.map(lf => lf.formation),
      []
    );

    res.status(201).json({
      id: lineup.id,
      name: lineup.name,
      createdAt: lineup.createdAt,
      updatedAt: lineup.updatedAt,
      formationCount: lineup.formations.length,
      skillConflicts,
      message: skillConflicts.length > 0
        ? 'Dàn trận đã được tạo. Có xung đột chiến pháp cần giải quyết.'
        : 'Dàn trận đã được tạo thành công.'
    });
  } catch (error) {
    console.error('Error creating lineup:', error);
    res.status(500).json({ error: 'Không thể tạo dàn trận' });
  }
});

// PUT update line-up
interface UpdateLineUpBody {
  name?: string;
  formationIds?: string[];
}

router.put('/:id', requireUser, async (req: Request<{ id: string }, object, UpdateLineUpBody>, res: Response) => {
  try {
    const { id } = req.params;
    const { name, formationIds } = req.body;
    const userId = req.user!.id;

    // Check if lineup exists and user is owner
    const existingLineup = await prisma.lineUp.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingLineup) {
      res.status(404).json({ error: 'Không tìm thấy dàn trận' });
      return;
    }

    if (existingLineup.userId !== userId) {
      res.status(403).json({ error: 'Không có quyền chỉnh sửa dàn trận này' });
      return;
    }

    // If updating formations, validate
    if (formationIds && formationIds.length > 0) {
      // Validate formations exist
      const formations = await prisma.formation.findMany({
        where: {
          id: { in: formationIds },
        },
        include: {
          generals: {
            include: {
              general: {
                select: {
                  id: true,
                  name: true,
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
            }
          }
        }
      });

      if (formations.length !== formationIds.length) {
        res.status(404).json({ error: 'Một số đội hình không tồn tại' });
        return;
      }

      // Check for general conflicts (hard block)
      const generalConflicts = detectGeneralConflicts(formations);
      if (generalConflicts.length > 0) {
        res.status(400).json({
          error: 'Có xung đột võ tướng. Không thể sử dụng cùng một võ tướng trong nhiều đội hình.',
          generalConflicts
        });
        return;
      }
    }

    // Update line-up
    const lineup = await prisma.$transaction(async (tx) => {
      // Delete existing formations if updating
      if (formationIds) {
        await tx.lineUpFormation.deleteMany({
          where: { lineUpId: id }
        });

        // Clear skill resolutions that may no longer apply
        await tx.lineUpSkillResolution.deleteMany({
          where: { lineUpId: id }
        });
      }

      // Update lineup
      return await tx.lineUp.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(formationIds && {
            formations: {
              create: formationIds.map((formationId, index) => ({
                formationId,
                position: index + 1,
              }))
            }
          })
        },
        include: {
          formations: {
            include: {
              formation: {
                include: {
                  generals: {
                    include: {
                      general: true,
                      skill1: true,
                      skill2: true,
                    },
                    orderBy: { position: 'asc' }
                  }
                }
              }
            },
            orderBy: { position: 'asc' }
          },
          skillResolutions: true
        }
      });
    });

    // Detect conflicts for response
    const formationsData = lineup.formations.map(lf => lf.formation);
    const skillConflicts = detectSkillConflicts(formationsData, lineup.skillResolutions);

    res.json({
      id: lineup.id,
      name: lineup.name,
      createdAt: lineup.createdAt,
      updatedAt: lineup.updatedAt,
      formationCount: lineup.formations.length,
      skillConflicts,
      message: 'Dàn trận đã được cập nhật thành công.'
    });
  } catch (error) {
    console.error('Error updating lineup:', error);
    res.status(500).json({ error: 'Không thể cập nhật dàn trận' });
  }
});

// DELETE line-up
router.delete('/:id', requireUser, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if lineup exists and user is owner
    const existingLineup = await prisma.lineUp.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingLineup) {
      res.status(404).json({ error: 'Không tìm thấy dàn trận' });
      return;
    }

    if (existingLineup.userId !== userId) {
      res.status(403).json({ error: 'Không có quyền xóa dàn trận này' });
      return;
    }

    await prisma.lineUp.delete({
      where: { id }
    });

    res.json({ message: 'Đã xóa dàn trận thành công' });
  } catch (error) {
    console.error('Error deleting lineup:', error);
    res.status(500).json({ error: 'Không thể xóa dàn trận' });
  }
});

// POST mark skill conflict as resolved
interface ResolveSkillBody {
  skillId: number;
  note?: string;
}

router.post('/:id/resolve', requireUser, async (req: Request<{ id: string }, object, ResolveSkillBody>, res: Response) => {
  try {
    const { id } = req.params;
    const { skillId, note } = req.body;
    const userId = req.user!.id;

    // Validation
    if (!skillId) {
      res.status(400).json({ error: 'Thiếu skillId' });
      return;
    }

    // Check if lineup exists and user is owner
    const lineup = await prisma.lineUp.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!lineup) {
      res.status(404).json({ error: 'Không tìm thấy dàn trận' });
      return;
    }

    if (lineup.userId !== userId) {
      res.status(403).json({ error: 'Không có quyền chỉnh sửa dàn trận này' });
      return;
    }

    // Verify skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skillId }
    });

    if (!skill) {
      res.status(404).json({ error: 'Không tìm thấy chiến pháp' });
      return;
    }

    // Create or update resolution
    await prisma.lineUpSkillResolution.upsert({
      where: {
        lineUpId_skillId: {
          lineUpId: id,
          skillId
        }
      },
      update: {
        resolved: true,
        note
      },
      create: {
        lineUpId: id,
        skillId,
        resolved: true,
        note
      }
    });

    res.json({ message: 'Đã đánh dấu xung đột chiến pháp đã giải quyết' });
  } catch (error) {
    console.error('Error resolving skill conflict:', error);
    res.status(500).json({ error: 'Không thể giải quyết xung đột chiến pháp' });
  }
});

// DELETE unresolve skill conflict
router.delete('/:id/resolve/:skillId', requireUser, async (req: Request<{ id: string; skillId: string }>, res: Response) => {
  try {
    const { id, skillId } = req.params;
    const userId = req.user!.id;
    const skillIdNum = parseInt(skillId);

    if (isNaN(skillIdNum)) {
      res.status(400).json({ error: 'skillId không hợp lệ' });
      return;
    }

    // Check if lineup exists and user is owner
    const lineup = await prisma.lineUp.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!lineup) {
      res.status(404).json({ error: 'Không tìm thấy dàn trận' });
      return;
    }

    if (lineup.userId !== userId) {
      res.status(403).json({ error: 'Không có quyền chỉnh sửa dàn trận này' });
      return;
    }

    // Delete resolution
    await prisma.lineUpSkillResolution.delete({
      where: {
        lineUpId_skillId: {
          lineUpId: id,
          skillId: skillIdNum
        }
      }
    });

    res.json({ message: 'Đã bỏ đánh dấu giải quyết xung đột chiến pháp' });
  } catch (error) {
    console.error('Error unresolving skill conflict:', error);
    res.status(500).json({ error: 'Không thể bỏ đánh dấu giải quyết xung đột chiến pháp' });
  }
});

export default router;
