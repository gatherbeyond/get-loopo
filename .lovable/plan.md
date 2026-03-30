

## Plan: Fix Edit Task Button + Show Denial Feedback to Kids

### Bug 1: Edit Task button in ParentTaskDetail.tsx

**Problem**: The "Edit Task" button (line 395) is a plain `<button>` with no `onClick` handler.

**Fix**: Add an edit modal (Dialog) that opens when the button is clicked, pre-populated with the task's current title, description, and credit reward. On save, update the `tasks` table via Supabase. The button and modal only appear when status is `not_started` or `in_progress`.

**Changes to `src/pages/ParentTaskDetail.tsx`**:
- Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from UI components, plus `Input`, `Textarea`, `Label`
- Add state: `showEditModal`, `editTitle`, `editDescription`, `editCredits`, `isSaving`
- Add `handleOpenEdit` — opens modal, populates fields from current task
- Add `handleSaveEdit` — calls `supabase.from("tasks").update({ title, description, credits_reward }).eq("id", task.id)`, then refreshes task state and closes modal
- Wire the existing "Edit Task" button with `onClick={handleOpenEdit}`
- Only render the Edit Task button when `task.status === "not_started" || task.status === "in_progress"`
- Add the edit Dialog markup with three fields and Save/Cancel buttons

### Bug 2: Parent denial feedback not shown in KidMissionDetail.tsx

**Problem**: When a parent denies a task, status resets to `not_started` and `parent_note` is saved, but KidMissionDetail doesn't fetch or display `parent_note`.

**Fix**:
- Add `parent_note` to the `TaskData` interface in KidMissionDetail.tsx
- Include `parent_note` in the Supabase select query (it already uses `select("*")` so data is fetched — just not typed or displayed)
- When `task.status === "not_started"` and `task.parent_note` is not null, render a feedback banner above the action button area showing: "Your parent said: [note]"
- Style it with a subtle warning/info color so it's noticeable but not alarming

### Technical details

- No database or migration changes needed — all columns already exist
- Only two files modified: `ParentTaskDetail.tsx` and `KidMissionDetail.tsx`
- The edit modal uses existing shadcn Dialog, Input, Textarea, and Label components

