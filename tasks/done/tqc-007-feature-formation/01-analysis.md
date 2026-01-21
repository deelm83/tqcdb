# TQC-007: Formation Feature - Requirements Analysis

## 1. Business Context

### Problem Statement
Users want to share and discover optimal team compositions (formations) for Three Kingdoms Tactics. Currently, there's no way for users to:
- Create and visualize team compositions
- Share formations with the community
- Discover highly-rated formations
- Manage multiple formations in a line-up

### Goals
1. Enable formation creation and sharing
2. Build a community-driven ranking system
3. Provide line-up management with conflict detection
4. Support both visitors and registered users with different capabilities

---

## 2. Core Concepts

### Formation (Đội Hình)
A single team composition with:
- **Generals**: 1-3 generals
- **Cost Limit**: Maximum total cost of 21
- **Army Type**: Required selection (Kỵ, Khiên, Cung, Thương, Xe)
- **Skills**: Each general can equip 2 additional skills beyond their innate skill

### Line-up (Dàn Trận)
A collection of multiple formations for battle planning:
- Contains multiple formations
- **General Constraint**: A general can only appear in ONE formation
- **Skill Constraint**: Skills can be reused but flagged as "in-use"
- **Resolution System**: Users can mark skill conflicts as "resolved" (for seasonal duplicate skills)

---

## 3. User Roles & Capabilities

### Visitor (Not Logged In)
| Capability | Description |
|------------|-------------|
| View formations | Browse community formations ordered by rank |
| Search formations | Search by general name |
| Create formation | Build formation in browser (not saved) |
| Export as image | Capture formation canvas to save locally |

### Registered User
| Capability | Description |
|------------|-------------|
| All visitor capabilities | Plus the following... |
| Save formations | Persist formations to account |
| Edit formations | Update saved formations |
| Share publicly | Make formation visible to community |
| Copy formations | Clone another user's public formation |
| Create line-ups | Build multi-formation line-ups |
| Rank formations | Vote on admin-created formations |

### Admin
| Capability | Description |
|------------|-------------|
| Create curated formations | Featured formations for community ranking |
| Manage formations | Edit/delete any formation |
| View analytics | See ranking statistics |

---

## 4. Functional Requirements

### FR-1: Formation CRUD
- FR-1.1: Create formation with 1-3 generals
- FR-1.2: Validate total cost <= 21
- FR-1.3: Require army type selection
- FR-1.4: Assign up to 2 skills per general (beyond innate)
- FR-1.5: Save formation (registered users only)
- FR-1.6: Edit/delete own formations
- FR-1.7: Copy other users' public formations

### FR-2: Formation Discovery
- FR-2.1: List formations ordered by community rank
- FR-2.2: Search formations by general name
- FR-2.3: Filter by army type
- FR-2.4: View formation detail with all generals and skills

### FR-3: Sharing & Export
- FR-3.1: Capture formation as image (canvas-based)
- FR-3.2: Download image to local device
- FR-3.3: Share formation publicly (toggle visibility)
- FR-3.4: Generate shareable link

### FR-4: Ranking System
- FR-4.1: Admin creates formations for ranking
- FR-4.2: Users vote on formations (upvote/downvote or star rating)
- FR-4.3: Display formations sorted by rank score
- FR-4.4: Show rank position and vote count

### FR-5: Line-up System
- FR-5.1: Create line-up with multiple formations
- FR-5.2: Detect general conflicts (same general in multiple teams)
- FR-5.3: Flag skills used in multiple formations
- FR-5.4: Mark skill conflicts as "resolved"
- FR-5.5: Validate line-up before saving (no general duplicates)

---

## 5. Non-Functional Requirements

### NFR-1: Performance
- Formation list should load within 500ms
- Image export should complete within 2 seconds

### NFR-2: Usability
- Formation builder should be drag-and-drop intuitive
- Mobile-responsive design
- Vietnamese language support

### NFR-3: Data Integrity
- Formations cannot exceed cost limit
- Line-ups cannot have duplicate generals
- Orphan formations handled when generals/skills deleted

---

## 6. Edge Cases & Constraints

### Skill Assignment Rules
- Each general has 1 innate skill (cannot be changed)
- Can assign 0, 1, or 2 additional skills
- Skills can be assigned to multiple generals in same formation
- Same skill can appear in different formations (with warning in line-up)

### Cost Calculation
- Sum of all generals' costs must be <= 21
- If adding a general exceeds limit, show warning
- Support partial formations (1-2 generals) under limit

### Line-up Conflict Resolution
- **Hard Conflict**: Same general in multiple formations (BLOCKED)
- **Soft Conflict**: Same skill in multiple formations (WARNING + resolution option)
- Resolution marks skill as "duplicate available this season"

---

## 7. Data Entities

### Formation
```
- id
- name
- description
- armyType (Kỵ, Khiên, Cung, Thương, Xe)
- createdBy (User or Admin)
- isPublic
- isCurated (admin-created for ranking)
- rankScore
- voteCount
- createdAt
- updatedAt
```

### FormationGeneral (Junction)
```
- formationId
- generalId
- position (1, 2, 3)
- skill1Id (optional extra skill)
- skill2Id (optional extra skill)
```

### LineUp
```
- id
- name
- userId
- createdAt
- updatedAt
```

### LineUpFormation (Junction)
```
- lineUpId
- formationId
- position
```

### LineUpSkillResolution
```
- lineUpId
- skillId
- resolved (boolean)
```

### FormationVote
```
- formationId
- userId
- value (+1 or -1, or 1-5 star)
- createdAt
```

---

## 8. Open Questions

1. **Ranking Algorithm**: Simple upvote/downvote or star rating (1-5)?
2. **Formation Limit**: Max formations per user?
3. **Line-up Limit**: Max formations per line-up?
4. **Skill Search**: Search skills when assigning to generals?
5. **Formation Comments**: Allow users to comment on formations?
6. **Version History**: Track changes to formations?
