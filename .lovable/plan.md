# Plan: Wire KidMissionDetail to Real Supabase Data

## File: `src/pages/KidMissionDetail.tsx` (full rewrite)

### 1. Remove mock data & imports
- Delete `MissionData` interface, `mockMission` object, `MissionStatus` type
- Remove imports: `uploadTaskPhoto`, `saveTaskPhotoUrl` from `@/lib/storage`
- Add imports: `supabase` from `@/integrations/supabase/client`, `useAuth` from `@/contexts/AuthContext`, `EmptyState` from `@/components/mobile`

### 2. New type & state
- `TaskStatus = "not_started" | "in_progress" | "pending" | "completed"` (DB values directly)
- `TaskData` interface matching DB columns: `id, title, description, credits_reward, status, photo_required, photo_url, kid_id, family_id, deadline, created_at, submitted_at, completed_at, kid_note, parent_note`
- State: `task: TaskData | null`, `isLoading`, `uploadedPhotoPreview`, `photoUploaded`, `isUploading`, `isSubmitting`, `uploadedFilePath`, `showConfirmDialog`, `showSuccessOverlay`

### 3. Fetch task on mount
- Query `supabase.from("tasks").select("*").eq("id", id).single()`
- Show Loader2 spinner while loading; EmptyState with back button if not found

### 4. handleStartMission — persist to DB
- `supabase.from("tasks").update({ status: "in_progress" }).eq("id", task.id)`

### 5. handleFileChange — immediate upload with real IDs
- Upload immediately on file select: `supabase.storage.from("task-photos").upload(filePath, file, { upsert: true })`
- Path: `${task.family_id}/${user.kidId}/${task.id}.jpg` (real IDs from task record and auth context)
- Track `photoUploaded` boolean; show spinner overlay while uploading, green check when done
- On failure: toast error, clear preview, keep submit disabled

### 6. renderActionButton — all DB statuses
- `not_started` → "Start Mission 🚀"
- `in_progress` + `!photo_required` → "Mark Complete ✓"
- `in_progress` + `photo_required` → "Submit for Approval ✓", **disabled** until `photoUploaded`
- `pending` → "⏳ Waiting for Review" disabled
- `completed` → "✓ Completed" disabled

### 7. handleConfirmSubmit
- Update: `status: "pending"`, `submitted_at: now()`, `photo_url: uploadedFilePath` (storage path, not signed URL)
- On success: success overlay → navigate `/kid` after 2s
- On error: toast, don't navigate

### 8. UI field mapping
- `mission.title` → `task.title`
- `mission.description` → `task.description || "Complete this mission!"`
- `mission.creditReward` → `task.credits_reward`
- `mission.requiresPhoto` → `task.photo_required`
- Status label: replace `pending_approval` with `pending`
