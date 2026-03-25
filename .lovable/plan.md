

## Plan: Wire KidDashboard to Real Supabase Data

### Overview
Replace mock missions and hardcoded credits in `KidDashboard.tsx` with real Supabase queries, using `user.kidId` from the auth context (set during kid login) instead of `auth.uid()`.

### Changes (single file: `src/pages/KidDashboard.tsx`)

1. **Remove mock data** -- Delete the `mockMissions` array (lines 15-45) and the hardcoded `credits` initial value of `2450`.

2. **Add Supabase imports** -- Import `supabase` client and `EmptyState` component.

3. **Add data fetching with useEffect** -- On mount (and when `user.kidId` changes):
   - **Tasks query**: `supabase.from('tasks').select('*').eq('kid_id', user.kidId).neq('status', 'completed')` -- map results to the `Mission` type (mapping `credits_reward` to `creditReward`, `status` values like `'pending'` to `'pending_approval'`).
   - **Credits query**: `supabase.from('kids').select('credits_balance').eq('id', user.kidId).single()` -- set credits from the result.
   - Add a `loading` state to show a loading indicator during fetch.

4. **Update mission actions to use Supabase** -- When kid starts or completes a mission, update the task status in Supabase (`not_started` → `in_progress`, `in_progress` → `pending` with `submitted_at: new Date()`) then update local state on success.

5. **Handle empty state** -- If no tasks exist after loading, the existing `MissionCarousel` already renders an `EmptyMissions` component with the Loopo mascot, so no additional empty state is needed.

6. **Guard against no kid session** -- If `user?.kidId` is not set, show credits as 0 and missions as empty array (graceful fallback).

### Status mapping
Database `status` values → Mission component `status` values:
- `not_started` → `not_started`
- `in_progress` → `in_progress`  
- `pending` → `pending_approval`
- `denied` → `not_started` (so kid can retry)

### No database or RLS changes needed
The kid dashboard is accessed by parents (authenticated users) whose RLS policies already allow reading tasks and kids in their family. The kid login flow uses the parent's Supabase session, so queries will work.

