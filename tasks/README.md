# Task Tracking System

This directory contains all tasks for the TQC Wiki project.

## Structure

```
.claude/tasks/
├── README.md                        # This file
├── counter.txt                      # Next task ID number
├── icebox/                          # Features in planning
│   └── TQC-XXX-feature-{name}/      # Folder per feature
│       ├── README.md                # Status tracker
│       ├── 1-analysis.md            # Requirements (analyst)
│       ├── 2-solution.md            # Architecture (architect)
│       ├── 3-tasks.md               # Task breakdown (architect)
│       ├── technical/               # Implementation plans
│       │   └── task-XX.md
│       ├── ui/                      # UI proposals
│       │   ├── task-XX-ui.md
│       │   └── wireframes/
│       └── mockups/                 # HTML prototypes
│           └── task-XX.html
├── backlog/                         # Approved, ready for dev
│   ├── TQC-XXX-feature-{name}.md    # Consolidated feature
│   └── TQC-XXX-bug-{sub}-{name}.md  # Bug tasks
└── done/                            # Completed tasks
```

## Planning Pipeline

Features go through a planning pipeline before reaching backlog:

```
┌──────────────────────────────────────────────────────────────┐
│                    PLANNING PIPELINE                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [User Request]                                               │
│       │                                                       │
│       ▼                                                       │
│  ┌──────────┐  Requirements, goals      ┌─────────────────┐  │
│  │ ANALYST  │ ─────────────────────────▶│ 1-analysis.md   │  │
│  └──────────┘                           └─────────────────┘  │
│       │                                                       │
│       ▼                                                       │
│  ┌──────────┐  Solution, tasks,         ┌─────────────────┐  │
│  │ ARCHITECT│ ─────────────────────────▶│ 2-solution.md   │  │
│  └──────────┘  technical plans          │ 3-tasks.md      │  │
│       │                                 │ technical/*.md  │  │
│       ▼                                 └─────────────────┘  │
│  ┌──────────┐  UI proposals,            ┌─────────────────┐  │
│  │ DESIGNER │ ─────────────────────────▶│ ui/*.md         │  │
│  └──────────┘  wireframes, mockups      │ mockups/*.html  │  │
│       │                                 └─────────────────┘  │
│       ▼                                                       │
│  [User Review] ◄──── Iterate until approved ────┐            │
│       │                                          │            │
│       ▼                                          │            │
│  ┌──────────┐                                    │            │
│  │ APPROVE  │ ──── Move to backlog ─────────────┘            │
│  └──────────┘                                                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Planning Stages

| Stage | Status | Agent | Output |
|-------|--------|-------|--------|
| 1 | `draft` | manager | README.md |
| 2 | `analyzing` | analyst | 1-analysis.md |
| 3 | `designing` | architect | 2-solution.md, 3-tasks.md, technical/*.md |
| 4 | `ui-design` | designer | ui/*.md, mockups/*.html |
| 5 | `review` | user | Feedback |
| 6 | `iterating` | any | Address feedback |
| 7 | `approved` | manager | Move to backlog |

### Starting Planning

Use the `/plan` command:
```
/plan [describe what you want to achieve]
```

Example:
```
/plan Add ability to crop profile images when uploading general photos
```

## Task Types

### Features
New functionality or enhancements.
- Created in: `icebox/` as a folder
- Goes through: Planning pipeline (analyst → architect → designer)
- When approved: Consolidated file moves to `backlog/`

### Bugs
Issues that need fixing. Must have a **subcategory**:
- Filename: `TQC-XXX-bug-{subcategory}-{name}.md`
- Created directly in: `backlog/` (no planning needed)
- Status: `planned` (immediately ready for dev)

#### Bug Subcategories

| Subcategory | Description | Example |
|-------------|-------------|---------|
| `aesthetic` | Visual/UI issues | Misaligned buttons, wrong colors |
| `functional` | Broken functionality | Form not submitting |
| `performance` | Slow loading, memory issues | Page takes 10s to load |
| `accessibility` | a11y issues | Missing alt text |

## Task ID System

Every task has a unique ID: `TQC-XXX`
- **TQC** = Project prefix
- **XXX** = Sequential number (001, 002, 003...)

### Creating Tasks
1. Read `counter.txt` for next ID
2. Create in correct location:
   - Feature: `icebox/TQC-{ID}-feature-{name}/` (folder)
   - Bug: `backlog/TQC-{ID}-bug-{subcategory}-{name}.md` (file)
3. Increment `counter.txt`

## Folder & Status Definitions

| Location | Status | Meaning |
|----------|--------|---------|
| `icebox/` | `draft` | Request captured |
| `icebox/` | `analyzing` | Analyst working |
| `icebox/` | `designing` | Architect working |
| `icebox/` | `ui-design` | Designer working |
| `icebox/` | `review` | Awaiting user review |
| `icebox/` | `iterating` | Addressing feedback |
| `icebox/` | `approved` | Ready to move |
| `backlog/` | `planned` | Ready for dev |
| `backlog/` | `in-progress` | Coder working |
| `backlog/` | `review` | Awaiting QA/UI review |
| `done/` | `done` | Completed |

## Dev Pickup Rules

The **coder** agent ONLY picks up tasks from `backlog/` that meet ALL criteria:

### Folder Check
- ✅ `backlog/` - Ready for development
- ❌ SKIP `icebox/` - Still in planning

### Status Check
- ✅ `status: planned` - Ready to start
- ✅ `status: in-progress` - Continuing work

### Dependency Check
- ✅ `Depends: none` - Can start immediately
- ✅ `Depends: TQC-XXX` - Only if TQC-XXX is in `done/`
- ❌ SKIP if any dependency is NOT resolved

### How to Check Dependencies
```bash
ls .claude/tasks/done/TQC-001*
```
If file exists → resolved. If not → skip task.

## Workflows

### Feature Workflow
1. User runs `/plan [request]`
2. **analyst** creates requirements analysis
3. **architect** designs solution & breaks into tasks
4. **designer** creates UI proposals & mockups
5. User reviews and provides feedback
6. Iterate until approved
7. **manager** moves consolidated task to `backlog/`
8. **coder** implements from backlog
9. **ui-ux-reviewer** and **qa-tester** review
10. When done → move to `done/`

### Bug Workflow
1. **manager/qa/ui-ux** creates bug in `backlog/`
2. **coder** picks up, implements fix
3. **qa-tester** verifies
4. When verified → move to `done/`

## Agents

| Agent | Role | When to Use |
|-------|------|-------------|
| `analyst` | Requirements analysis | `/plan` step 1 |
| `architect` | Solution & task design | `/plan` step 2 |
| `designer` | UI proposals & mockups | `/plan` step 3 |
| `manager` | Coordinate planning, manage backlog | Orchestration |
| `coder` | Implement tasks | `/dev` |
| `ui-ux-reviewer` | Review UI implementation | After dev |
| `qa-tester` | Test functionality | After dev |

## Quick Reference

```bash
# Start planning a feature
/plan [describe your feature]

# Start development cycle
/dev [task ID]

# List icebox (planning)
ls .claude/tasks/icebox/

# List backlog (ready for dev)
ls .claude/tasks/backlog/

# List completed
ls .claude/tasks/done/

# View mockups (open in browser)
open .claude/tasks/icebox/TQC-XXX-feature-{name}/mockups/

# Move approved feature to backlog
mv .claude/tasks/icebox/TQC-XXX-feature-{name}.md .claude/tasks/backlog/

# Move completed to done
mv .claude/tasks/backlog/TQC-XXX-*.md .claude/tasks/done/

# View next available ID
cat .claude/tasks/counter.txt
```
