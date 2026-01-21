# Formation API Testing Guide

## Overview
This document describes how to test the Formation API endpoints implemented in Phase 1.

## Endpoints Implemented

### 1. GET /api/formations
List formations with pagination, filtering, and sorting.

**Query Parameters:**
- `search` - Search by general name
- `armyType` - Filter by army type (CAVALRY, SHIELD, ARCHER, SPEAR, SIEGE)
- `curated` - Filter curated formations (true/false)
- `userId` - Filter by user ID
- `sort` - Sort by: rank, newest, oldest (default: rank)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Test:**
```bash
# List all public formations
curl http://localhost:3001/api/formations

# Filter by army type
curl http://localhost:3001/api/formations?armyType=CAVALRY

# Search by general name
curl http://localhost:3001/api/formations?search=Quan

# Sort by newest
curl http://localhost:3001/api/formations?sort=newest

# Pagination
curl http://localhost:3001/api/formations?page=2&limit=10
```

### 2. GET /api/formations/:id
Get formation details by ID.

**Test:**
```bash
curl http://localhost:3001/api/formations/{formation_id}
```

### 3. POST /api/formations
Create a new formation (requires authentication).

**Request Body:**
```json
{
  "name": "Đội Hình Kỵ Binh",
  "description": "Đội hình tấn công nhanh với kỵ binh",
  "armyType": "CAVALRY",
  "isPublic": true,
  "generals": [
    {
      "generalId": "关羽",
      "position": 1,
      "skill1Id": 1,
      "skill2Id": 2
    },
    {
      "generalId": "张飞",
      "position": 2,
      "skill1Id": 3,
      "skill2Id": 4
    }
  ]
}
```

**Validation Rules:**
- Name is required
- Army type must be one of: CAVALRY, SHIELD, ARCHER, SPEAR, SIEGE
- Must have 1-3 generals
- Positions must be unique and between 1-3
- General IDs must be unique
- Total cost must be <= 21
- Requires user authentication

**Test:**
```bash
# Note: Requires authentication cookie/session
curl -X POST http://localhost:3001/api/formations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Formation",
    "armyType": "CAVALRY",
    "isPublic": true,
    "generals": [
      {
        "generalId": "关羽",
        "position": 1
      }
    ]
  }'
```

### 4. PUT /api/formations/:id
Update formation (owner only).

**Test:**
```bash
curl -X PUT http://localhost:3001/api/formations/{formation_id} \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Updated Formation Name",
    "isPublic": false
  }'
```

### 5. DELETE /api/formations/:id
Delete formation (owner only).

**Test:**
```bash
curl -X DELETE http://localhost:3001/api/formations/{formation_id} \
  -b cookies.txt
```

### 6. POST /api/formations/:id/copy
Copy formation to own account (requires authentication).

**Test:**
```bash
curl -X POST http://localhost:3001/api/formations/{formation_id}/copy \
  -b cookies.txt
```

### 7. POST /api/formations/:id/vote
Vote on curated formation (requires authentication).

**Request Body:**
```json
{
  "value": 1  // +1 for upvote, -1 for downvote
}
```

**Test:**
```bash
curl -X POST http://localhost:3001/api/formations/{formation_id}/vote \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"value": 1}'
```

## Database Models

### ArmyType Enum
```
CAVALRY   // Kỵ
SHIELD    // Khiên
ARCHER    // Cung
SPEAR     // Thương
SIEGE     // Xe
```

### Formation
- id: String (cuid)
- name: String
- description: String?
- armyType: ArmyType
- userId: String?
- isPublic: Boolean (default: false)
- isCurated: Boolean (default: false)
- rankScore: Int (default: 0)
- voteCount: Int (default: 0)
- createdAt: DateTime
- updatedAt: DateTime

### FormationGeneral
- id: String (cuid)
- formationId: String
- generalId: String
- position: Int (1-3)
- skill1Id: Int?
- skill2Id: Int?

### FormationVote
- id: String (cuid)
- formationId: String
- userId: String
- value: Int (+1 or -1)
- createdAt: DateTime

### LineUp, LineUpFormation, LineUpSkillResolution
These models are prepared but not yet implemented in API routes (Phase 5).

## Success Indicators

✅ All endpoints return proper JSON responses
✅ Authentication is properly enforced
✅ Cost validation works (max 21)
✅ Filters and pagination work correctly
✅ Vote calculation updates rankScore correctly
✅ Formation copying works
✅ Owner-only operations are protected

## Next Steps (Not in Phase 1)

- Phase 2: Frontend UI for formation builder
- Phase 3: Image export feature
- Phase 4: Admin routes for curated formations
- Phase 5: Line-up system with conflict detection
