

## Plan: Wire KidMyRewards to Real Supabase Data

### Overview
Remove the mock rewards array and fetch real redemptions from the `redemptions` table, using `user.kidId` from auth context. Map DB status values to the existing UI sections. Wire the "Mark as Used" action to update Supabase.

### Changes -- src/pages/KidMyRewards.tsx

**1. Remove mock data, add imports**
- Delete the `mockRewards` array (lines 26-60)
- Delete the `Reward` interface and `RewardStatus` type (lines 11-24) -- replace with a simpler interface matching the `redemptions` table columns
- Import `supabase` from `@/integrations/supabase/client`
- Import `useAuth` from `@/contexts/AuthContext`
- Import `Loader2` from lucide-react for loading state

**2. Fetch redemptions on mount**
- Add `loading` state, `error` state
- In a `useEffect`, query: `supabase.from("redemptions").select("*").eq("kid_id", user.kidId).order("requested_at", { ascending: false })`
- Store results in `rewards` state

**3. Map DB status to UI sections**
- "Ready to Use": `status === "approved"` (these have `redemption_code` and `approved_at`)
- "Pending Approval": `status === "pending"`
- "Used": `status === "used"` (have `used_at`)

**4. Update renderRewardCard field mapping**
- `reward.name` -> `redemption.product_name`
- `reward.image` -> `redemption.product_image`
- `reward.creditCost` -> `redemption.cost_credits`
- `reward.code` -> `redemption.redemption_code`
- `reward.approvedAt` -> format `redemption.approved_at` as relative time
- `reward.usedAt` -> format `redemption.used_at` as relative time
- Remove `expiresIn` and `instructions` (not in DB schema)

**5. Wire "Mark as Used" to Supabase**
- `confirmMarkAsUsed`: call `supabase.from("redemptions").update({ status: "used", used_at: new Date().toISOString() }).eq("id", confirmUsedId)`
- On success, update local state to move the reward to the "Used" section
- On failure, show error toast

**6. Loading and empty states**
- Show a centered `Loader2` spinner while fetching
- Keep the existing Loopo mascot empty state for zero redemptions

### Technical details
- `user.kidId` is the `kids.id` value stored in auth context during kid login -- matches `redemptions.kid_id`
- No DB migrations needed -- all columns already exist on the `redemptions` table
- Only one file edited: `src/pages/KidMyRewards.tsx`

