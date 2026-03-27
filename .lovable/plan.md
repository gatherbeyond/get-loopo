

## Plan: Real-time Task Refresh for Kid Views

### Problem
KidDashboard fetches tasks once on mount. KidMissions uses hardcoded mock data entirely. Neither re-fetches when the user navigates back, so parent-side status changes (approve/deny) aren't reflected.

### Changes

#### 1. `src/pages/KidDashboard.tsx` — Add refetch on window focus and navigation
- Add a `visibilitychange` event listener that re-runs the fetch when the tab/page becomes visible again
- Move the fetch logic into a standalone `fetchData` function so it can be called from both `useEffect` (mount) and the visibility listener
- This covers both tab-switching and in-app navigation (React Router doesn't remount the component but the page regains visibility)

#### 2. `src/pages/KidMissions.tsx` — Replace mock data with real Supabase queries
- Remove the entire `mockMissions` array
- Add the same data-fetching pattern as KidDashboard: query `tasks` where `kid_id = user.kidId`, map DB status values to UI status using the same `mapStatus` helper
- Include all statuses (including `completed`) since this page has a "Completed" filter tab
- Add the same `visibilitychange` refetch listener
- Wire `handleMissionAction` to call Supabase (update status to `in_progress` or `pending`) instead of only updating local state — same pattern as KidDashboard's `handleMissionAction`
- Add loading state with skeleton/spinner on initial load

### Technical details

**Visibility listener pattern** (both files):
```typescript
const fetchData = useCallback(async () => { /* query supabase */ }, [user?.kidId]);

useEffect(() => { fetchData(); }, [fetchData]);

useEffect(() => {
  const onVisibility = () => {
    if (document.visibilityState === "visible") fetchData();
  };
  document.addEventListener("visibilitychange", onVisibility);
  return () => document.removeEventListener("visibilitychange", onVisibility);
}, [fetchData]);
```

**Status mapping for KidMissions** (same as KidDashboard):
- `not_started` / `denied` → `not_started`
- `in_progress` → `in_progress`
- `pending` → `pending_approval`
- `completed` → `completed`

**No database or migration changes needed.**

