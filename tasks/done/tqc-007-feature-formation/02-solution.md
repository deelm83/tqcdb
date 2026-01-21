# TQC-007: Formation Feature - Technical Solution

## 1. Database Schema (Prisma)

### New Models

```prisma
// Army types for formations
enum ArmyType {
  CAVALRY   // Kỵ
  SHIELD    // Khiên
  ARCHER    // Cung
  SPEAR     // Thương
  SIEGE     // Xe
}

// Main formation entity
model Formation {
  id          String   @id @default(cuid())
  name        String
  description String?
  armyType    ArmyType @map("army_type")

  // Ownership & visibility
  userId      String?  @map("user_id")
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  isPublic    Boolean  @default(false) @map("is_public")
  isCurated   Boolean  @default(false) @map("is_curated") // admin-created for ranking

  // Ranking
  rankScore   Int      @default(0) @map("rank_score")
  voteCount   Int      @default(0) @map("vote_count")

  // Timestamps
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  generals    FormationGeneral[]
  votes       FormationVote[]
  lineUps     LineUpFormation[]

  @@index([userId])
  @@index([isPublic, isCurated])
  @@index([rankScore])
  @@map("formations")
}

// Junction: Formation <-> General with skill slots
model FormationGeneral {
  id          String   @id @default(cuid())
  formationId String   @map("formation_id")
  generalId   String   @map("general_id")
  position    Int      // 1, 2, or 3 (for ordering)

  // Extra skill slots (beyond innate)
  skill1Id    Int?     @map("skill_1_id")
  skill2Id    Int?     @map("skill_2_id")

  // Relations
  formation   Formation @relation(fields: [formationId], references: [id], onDelete: Cascade)
  general     General   @relation(fields: [generalId], references: [id], onDelete: Cascade)
  skill1      Skill?    @relation("FormationSkill1", fields: [skill1Id], references: [id], onDelete: SetNull)
  skill2      Skill?    @relation("FormationSkill2", fields: [skill2Id], references: [id], onDelete: SetNull)

  @@unique([formationId, position])
  @@unique([formationId, generalId])
  @@map("formation_generals")
}

// User votes on curated formations
model FormationVote {
  id          String    @id @default(cuid())
  formationId String    @map("formation_id")
  userId      String    @map("user_id")
  value       Int       // +1 (upvote) or -1 (downvote)
  createdAt   DateTime  @default(now()) @map("created_at")

  formation   Formation @relation(fields: [formationId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([formationId, userId])
  @@map("formation_votes")
}

// Line-up: collection of formations
model LineUp {
  id        String   @id @default(cuid())
  name      String
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  formations      LineUpFormation[]
  skillResolutions LineUpSkillResolution[]

  @@index([userId])
  @@map("line_ups")
}

// Junction: LineUp <-> Formation
model LineUpFormation {
  id          String    @id @default(cuid())
  lineUpId    String    @map("line_up_id")
  formationId String    @map("formation_id")
  position    Int       // ordering

  lineUp      LineUp    @relation(fields: [lineUpId], references: [id], onDelete: Cascade)
  formation   Formation @relation(fields: [formationId], references: [id], onDelete: Cascade)

  @@unique([lineUpId, formationId])
  @@unique([lineUpId, position])
  @@map("line_up_formations")
}

// Skill conflict resolution in line-ups
model LineUpSkillResolution {
  id        String   @id @default(cuid())
  lineUpId  String   @map("line_up_id")
  skillId   Int      @map("skill_id")
  resolved  Boolean  @default(true)
  note      String?  // e.g., "Season 3 duplicate available"

  lineUp    LineUp   @relation(fields: [lineUpId], references: [id], onDelete: Cascade)
  skill     Skill    @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@unique([lineUpId, skillId])
  @@map("line_up_skill_resolutions")
}
```

### Updates to Existing Models

```prisma
// Add to User model
model User {
  // ... existing fields ...
  formations Formation[]
  formationVotes FormationVote[]
  lineUps LineUp[]
}

// Add to General model
model General {
  // ... existing fields ...
  formationGenerals FormationGeneral[]
}

// Add to Skill model
model Skill {
  // ... existing fields ...
  formationSkill1 FormationGeneral[] @relation("FormationSkill1")
  formationSkill2 FormationGeneral[] @relation("FormationSkill2")
  lineUpResolutions LineUpSkillResolution[]
}
```

---

## 2. API Endpoints

### Formation Endpoints

```
GET    /api/formations              # List formations (public, paginated, sorted by rank)
GET    /api/formations/:id          # Get formation details
POST   /api/formations              # Create formation (auth required)
PUT    /api/formations/:id          # Update formation (owner only)
DELETE /api/formations/:id          # Delete formation (owner only)
POST   /api/formations/:id/copy     # Copy formation to own account (auth required)
POST   /api/formations/:id/vote     # Vote on curated formation (auth required)

# Query params for GET /api/formations:
# - search: general name search
# - armyType: filter by army type
# - curated: true/false (show only admin formations)
# - userId: filter by user (for "my formations")
# - sort: rank, newest, oldest
# - page, limit: pagination
```

### Line-up Endpoints

```
GET    /api/lineups                 # List user's line-ups (auth required)
GET    /api/lineups/:id             # Get line-up details with conflicts
POST   /api/lineups                 # Create line-up (auth required)
PUT    /api/lineups/:id             # Update line-up (owner only)
DELETE /api/lineups/:id             # Delete line-up (owner only)
POST   /api/lineups/:id/resolve     # Mark skill conflict as resolved
DELETE /api/lineups/:id/resolve/:skillId # Unresolve skill conflict
```

### Admin Endpoints

```
GET    /api/admin/formations        # List all formations
POST   /api/admin/formations        # Create curated formation
PUT    /api/admin/formations/:id    # Update any formation
DELETE /api/admin/formations/:id    # Delete any formation
```

---

## 3. Backend Implementation

### Route Files Structure

```
src/routes/
├── formations.ts          # Public formation endpoints
├── lineups.ts             # Line-up endpoints
└── admin/
    └── formations.ts      # Admin formation management
```

### Key Business Logic

#### Cost Validation
```typescript
async function validateFormationCost(generals: { generalId: string }[]): Promise<boolean> {
  const generalData = await prisma.general.findMany({
    where: { id: { in: generals.map(g => g.generalId) } },
    select: { id: true, cost: true }
  });

  const totalCost = generalData.reduce((sum, g) => sum + g.cost, 0);
  return totalCost <= 21;
}
```

#### General Conflict Detection (Line-up)
```typescript
function detectGeneralConflicts(formations: FormationWithGenerals[]): string[] {
  const generalCounts = new Map<string, number>();

  formations.forEach(f => {
    f.generals.forEach(fg => {
      const count = generalCounts.get(fg.generalId) || 0;
      generalCounts.set(fg.generalId, count + 1);
    });
  });

  return Array.from(generalCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([generalId]) => generalId);
}
```

#### Skill Conflict Detection (Line-up)
```typescript
function detectSkillConflicts(
  formations: FormationWithGenerals[],
  resolutions: { skillId: number }[]
): { skillId: number; formations: string[] }[] {
  const skillUsage = new Map<number, string[]>();
  const resolvedSkills = new Set(resolutions.map(r => r.skillId));

  formations.forEach(f => {
    f.generals.forEach(fg => {
      // Check skill1 and skill2
      [fg.skill1Id, fg.skill2Id].filter(Boolean).forEach(skillId => {
        if (!skillUsage.has(skillId!)) {
          skillUsage.set(skillId!, []);
        }
        skillUsage.get(skillId!)!.push(f.id);
      });
    });
  });

  return Array.from(skillUsage.entries())
    .filter(([skillId, fIds]) => fIds.length > 1 && !resolvedSkills.has(skillId))
    .map(([skillId, formations]) => ({ skillId, formations }));
}
```

#### Vote & Rank Calculation
```typescript
async function updateFormationRank(formationId: string) {
  const votes = await prisma.formationVote.findMany({
    where: { formationId }
  });

  const rankScore = votes.reduce((sum, v) => sum + v.value, 0);
  const voteCount = votes.length;

  await prisma.formation.update({
    where: { id: formationId },
    data: { rankScore, voteCount }
  });
}
```

---

## 4. Frontend Implementation

### New Pages

```
src/app/
├── formations/
│   ├── page.tsx              # Formation list (browse, search, filter)
│   ├── [id]/
│   │   └── page.tsx          # Formation detail view
│   ├── create/
│   │   └── page.tsx          # Formation builder
│   └── my/
│       └── page.tsx          # My formations (auth required)
├── lineups/
│   ├── page.tsx              # My line-ups list
│   ├── [id]/
│   │   └── page.tsx          # Line-up detail with conflict view
│   └── create/
│       └── page.tsx          # Line-up builder
```

### New Components

```
src/components/
├── formations/
│   ├── FormationCard.tsx        # Formation preview card
│   ├── FormationBuilder.tsx     # Main builder component
│   ├── GeneralSlot.tsx          # Drag target for general
│   ├── SkillSlot.tsx            # Skill assignment slot
│   ├── ArmyTypeSelector.tsx     # Army type picker
│   ├── CostIndicator.tsx        # Cost display with limit warning
│   ├── FormationCanvas.tsx      # Canvas for image export
│   ├── VoteButtons.tsx          # Upvote/downvote UI
│   └── ShareButton.tsx          # Share/export options
├── lineups/
│   ├── LineUpCard.tsx           # Line-up preview
│   ├── LineUpBuilder.tsx        # Multi-formation builder
│   ├── ConflictIndicator.tsx    # General/skill conflict UI
│   └── SkillResolutionModal.tsx # Mark conflicts as resolved
```

### Canvas Image Export

```typescript
// Using html2canvas library
import html2canvas from 'html2canvas';

async function exportFormationAsImage(elementId: string): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const canvas = await html2canvas(element, {
    backgroundColor: '#1a1a1a', // Match site theme
    scale: 2 // Higher quality
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}
```

### State Management

```typescript
// Formation builder state
interface FormationBuilderState {
  name: string;
  description: string;
  armyType: ArmyType | null;
  generals: {
    position: 1 | 2 | 3;
    general: General | null;
    skill1: Skill | null;
    skill2: Skill | null;
  }[];
  totalCost: number;
  isValid: boolean;
}

// Line-up builder state
interface LineUpBuilderState {
  name: string;
  formations: Formation[];
  generalConflicts: string[]; // general IDs
  skillConflicts: { skillId: number; resolved: boolean }[];
}
```

---

## 5. Implementation Phases

### Phase 1: Database & Core API
1. Add Prisma models
2. Run migration
3. Implement formation CRUD endpoints
4. Add cost validation

### Phase 2: Formation Builder UI
1. Create formation list page
2. Build formation detail page
3. Implement formation builder with drag-drop
4. Add skill assignment UI

### Phase 3: Sharing & Export
1. Implement canvas-based image export
2. Add share button with download/copy options
3. Implement public/private toggle
4. Add copy formation feature

### Phase 4: Ranking System
1. Add vote endpoints
2. Implement vote UI (upvote/downvote)
3. Add sorting by rank
4. Admin: create curated formations

### Phase 5: Line-up System
1. Add line-up models & endpoints
2. Build line-up builder UI
3. Implement conflict detection
4. Add skill resolution system

---

## 6. Dependencies

### New NPM Packages

**Frontend:**
```json
{
  "html2canvas": "^1.4.1",       // Canvas export
  "@dnd-kit/core": "^6.1.0",     // Drag and drop
  "@dnd-kit/sortable": "^8.0.0"  // Sortable lists
}
```

### External Services
- None required (all local processing)

---

## 7. Testing Strategy

### Unit Tests
- Cost validation logic
- Conflict detection algorithms
- Vote calculation

### Integration Tests
- Formation CRUD operations
- Line-up with conflict scenarios
- Vote + rank update flow

### E2E Tests
- Formation builder flow
- Image export
- Copy formation flow
- Line-up creation with conflicts
