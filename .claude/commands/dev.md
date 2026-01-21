# Dev Cycle

Run the development cycle: implement tasks, review, test, and loop until done.

## Workflow

### Step 1: Scan Backlog
Read `.claude/tasks/backlog/` to find tasks ready for development.
- If `$ARGUMENTS` specifies a task ID (e.g., "TQC-001"), work on that task
- Otherwise, pick the highest priority task from backlog

**Task must meet ALL criteria:**
1. Located in `backlog/` folder (NOT `icebox/`)
2. `status: planned` or `status: in-progress`
3. `Depends: none` OR all dependencies are in `done/` folder

**SKIP tasks if:**
- ❌ In `icebox/` folder - needs user approval first
- ❌ Has unresolved dependencies - check `ls .claude/tasks/done/TQC-XXX*`

### Step 2: Implement (Coder)
Use the **coder** agent:
"Read the task file for [TASK-ID]. Implement all pending tasks (unchecked boxes). Update the task file: check completed items `[x]`, set status to `in-progress`. Test your changes work."

Repeat until all implementation tasks are checked.

### Step 3: UI/UX Review
Update task status to `review`, then use the **ui-ux-reviewer** agent:
"Review the changes for [TASK-ID]. Check UI consistency, accessibility, and Vietnamese localization. Report any issues."

### Step 4: QA Test
Use the **qa-tester** agent:
"Test the implementation for [TASK-ID]. Check functionality, edge cases, and error handling. Report any bugs."

### Step 5: Handle Issues
If UI/UX or QA found issues:
- Use the **manager** agent: "Add these issues to [TASK-ID] or create new tasks: [list issues]"
- Go back to Step 2

If no issues found:
- Update task status to `done`
- Move file from `todo/` to `done/`
- Report completion to user

### Step 6: Continue
Ask user: "Task [TASK-ID] complete. Continue with next task?"
- If yes, go to Step 1
- If no, stop

## Quick Reference

```
Scan todo → Coder implements → UI/UX reviews → QA tests
                ↑                                  ↓
                └──── Manager adds issues ←────────┘
```
