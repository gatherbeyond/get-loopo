

## Plan: Create reset-pin Edge Function and Wire Up Frontend

### Overview
Create a dedicated `reset-kid-pin` edge function that accepts a kid ID and new PIN, hashes it server-side with bcrypt, and updates `kids.pin_hash`. Update `confirmResetPin` in `ParentFamilyInfo.tsx` to call this function.

### Changes

#### 1. New Edge Function: `supabase/functions/reset-kid-pin/index.ts`
- Accept `{ kidId, pin }` in request body
- Authenticate parent via JWT (`getUser()`)
- Validate PIN is exactly 4 digits
- Use service role client to verify the kid belongs to a family owned by the authenticated parent (join `kids.family_id` → `families.parent_id = auth.uid()`)
- Hash PIN with `bcrypt.hashSync(pin)`
- Update `kids.pin_hash` where `id = kidId`
- Return `{ success: true }`

#### 2. Frontend: `src/pages/ParentFamilyInfo.tsx`
Update `confirmResetPin` (lines 136-145):
- Call `supabase.functions.invoke("reset-kid-pin", { body: { kidId: showResetPin.id, pin: newPin } })`
- On success: update local state, show success toast
- On error: show error toast, keep modal open
- Add loading state to the Reset button during the API call

### Technical details

**Edge function structure** mirrors `add-kid` — same auth pattern, same bcrypt import, same CORS headers. The ownership check query:
```sql
SELECT kids.id FROM kids
JOIN families ON kids.family_id = families.id
WHERE kids.id = :kidId AND families.parent_id = :userId
```

**No database migration needed** — only updating an existing column (`pin_hash`).

