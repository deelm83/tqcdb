---
description: Start planning a new feature
argument-hint: [what you want to build]
---

# Planning Workflow

**Request**: $ARGUMENTS

## Step 1: Quick Summary

Present a brief summary for early feedback:

```markdown
## Feature: [Name]

### What
[2-3 sentences]

### Approach
- [Bullet 1]
- [Bullet 2]

### Tasks (rough)
1. [Task]
2. [Task]

### Questions
- [Any clarifications needed?]
```

**Wait for user feedback before proceeding.**

## Step 2: Create Planning Files

Once direction approved, create folder in `icebox/`:

```
icebox/tqc-XXX-feature-{name}/
├── README.md        # Overview + task table
├── 01-analysis.md   # Requirements (user reviews this most)
├── 02-solution.md   # Technical approach
├── 03-ui.md         # UI specs (if has UI)
└── mockups/
    └── *.html       # Interactive mockups (if has UI)
```

### File Guidelines

**README.md** (~30 lines)
- Status, priority, depends
- Overview (2-3 sentences)
- User flow (numbered steps)
- Task table (name, type, estimate)
- List of other files

**01-analysis.md** (~50 lines) - User feedback focus
- Problem statement
- Goals (3-5 bullets)
- Requirements: Must Have / Should Have / Won't Have
- Success criteria (checkboxes)
- Assumptions

**02-solution.md** (~60 lines)
- Approach (1 paragraph)
- Library/tool choices (brief rationale)
- Components to create (name, location, key props/functions)
- Data flow (simple diagram)

**03-ui.md** (~50 lines) - Only if feature has UI
- ASCII wireframe
- Tailwind styling notes
- States (default, loading, error)
- Vietnamese text table

**mockups/*.html** - Only if feature has UI
- Standalone HTML with Tailwind CDN
- Dark theme matching app
- Interactive states

## Step 3: Review & Iterate

Present files to user. Focus feedback on:
1. `01-analysis.md` - Are requirements correct?
2. `03-ui.md` + mockups - Does it look right?

Iterate until approved.

## Step 4: Move to Backlog

When user approves:
1. Update README.md status to `approved`
2. Create `backlog/tqc-XXX-feature-{name}.md` (consolidated)
3. Increment counter.txt

## Principles

- **Summary first** - Get direction before detailed work
- **Analysis for feedback** - Users review requirements, not code
- **Keep files short** - 30-60 lines each, not essays
- **Iterate fast** - Better to revise than perfect first time
