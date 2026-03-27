

## Plan: Wire ParentTaskDetail to Real Supabase Data

### Overview
Replace the mock data in `ParentTaskDetail.tsx` with real Supabase queries, and wire Approve/Deny/Delete actions to actual database updates.

### Changes — `src/pages/ParentTaskDetail.tsx`

#### 1. Data fetching (replace mock)
- Remove the entire `mockTasks` object and `Task` interface
- Add `useEffect` that fetches from Supabase on mount:
  - Query `tasks` table by `id` from URL params
  - Query `kids` table by `task.kid_id` to get `name` and `avatar`
- Add loading state (`isLoading`) — show a spinner/skeleton while fetching
- If no task found, show `EmptyState` component with "Task not found" message and a back button

#### 2. Wire Approve button
- Update `handleApprove` to:
  1. Update `tasks` row: set `status = 'completed'`, `completed_at = now()`, `parent_note = approveMessage` (if provided)
  2. Fetch current `kids.credits_balance` for `task.kid_id`
  3. Update `kids.credits_balance` by adding `task.credits_reward`
  4. On success: show toast, navigate back
  5. On error: show error toast, keep sheet open
- This matches the pattern already used in `ParentApprovals.tsx` (lines 188-203)

#### 3. Wire Deny button
- Update `handleDeny` to:
  1. Update `tasks` row: set `status = 'not_started'`, `parent_note = denyFeedback`
  2. On success: show toast, navigate back
  3. On error: show error toast

#### 4. Wire Delete button
- Update `handleDelete` to:
  1. Delete from `tasks` where `id = task.id`
  2. On success: show toast, navigate back

#### 5. Field mapping
Map DB columns to the existing UI:
- `credits_reward` → credits display
- `created_at` → formatted date string
- `deadline` → formatted or null
- `photo_url` → submitted photo
- `kid_note` → submitted note
- `submitted_at` → formatted
- `completed_at` → formatted
- `photo_required` → boolean
- Kid name/avatar from the joined kids query

### Technical details

- No database migrations needed — all tables and RLS policies already exist
- Credit increment uses the same fetch-then-update pattern from `ParentApprovals.tsx` (not atomic, but consistent with existing code)
- All queries go through the authenticated Supabase client, so RLS enforces parent ownership automatically
- Date formatting will use `format` from `date-fns` (already a project dependency)

