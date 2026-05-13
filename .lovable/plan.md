# Real-time Approval Celebrations

When a parent approves a task, the kid sees a full-screen celebration overlay — instantly via Realtime if their app is open, or on next dashboard load if offline.

## 1. Database migration

Two statements in one migration:

```sql
-- Add tracking column
ALTER TABLE public.tasks
ADD COLUMN celebration_seen boolean NOT NULL DEFAULT false;

-- Backfill: don't replay celebrations for tasks already completed
UPDATE public.tasks
SET celebration_seen = true
WHERE status = 'completed';
```

No RLS changes — column inherits existing `tasks` policies.

## 2. RPC: mark_celebration_seen

Kid's anonymous session can update its own tasks (RLS allows it), but we use a SECURITY DEFINER RPC for symmetry with `complete_kid_onboarding` and to keep the write narrow:

```sql
CREATE OR REPLACE FUNCTION public.mark_celebration_seen(task_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tasks
  SET celebration_seen = true
  WHERE id = task_id;
END;
$$;
```

## 3. KidDashboard.tsx changes

Single file edit. No new components, no new routes.

**Imports**
- Add `loopoCelebrate` from `@/assets/loopo-celebrate.png`
- Use existing `CoinIcon` from `@/components/mobile`

**State**
- `celebrationTask: { id, title, credits } | null`

**fetchData (catchup path)**
- Add a 4th query to `Promise.all`: latest task with `status = completed` and `celebration_seen = false`, limit 1, ordered by `completed_at desc`
- After resolve: if a row exists, set `celebrationTask`

**New useEffect (realtime path)**
- Subscribe to channel `task-approvals-${kidId}`
- Listen for `UPDATE` on `public.tasks` filtered by `kid_id=eq.${kidId}`
- When payload shows `status === 'completed'` and `!celebration_seen`: set `celebrationTask` and call `fetchData()` to refresh credits + missions
- Cleanup: `supabase.removeChannel(channel)`

**dismissCelebration**
- Clear `celebrationTask` immediately (instant UI), then `await supabase.rpc('mark_celebration_seen', { task_id })`
- If RPC fails: console.error only, don't block

**Overlay JSX** (placed before existing tour `AnimatePresence`)
- Full-screen `motion.div` with backdrop blur, gradient background
- 24 confetti particles using CSS variable colors only (`--accent-gold`, `--secondary`, `--success`, `--primary-foreground`), randomized positions/delays via framer-motion
- `loopoCelebrate` mascot with bounce animation
- Task title, `CoinIcon` + `+{credits} credits earned!`, "Your parent approved it!", "Keep going — more missions await!"
- "Keep earning!" `MobileButton` calling `dismissCelebration`

## Constraints

- No emoji, no new icons, no other files touched
- All colors via design tokens / CSS variables
- Channel name scoped per-kid for multi-kid families
- Optimistic dismiss (state cleared before RPC awaits)

## Verification

1. Open `/kid` as Lebron, in another session approve his task as parent → overlay appears live, credits refresh, "Keep earning!" dismisses it
2. Approve again on same task → no overlay (celebration_seen = true)
3. Manually reset `celebration_seen = false` and reload `/kid` → overlay appears on mount (offline catchup path)
