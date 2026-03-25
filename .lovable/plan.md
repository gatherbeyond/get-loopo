

## Plan: Add Anonymous UID Create-or-Reuse Logic for Kid Login

### Overview
After PIN verification succeeds, the edge function checks if the kid has an `anonymous_uid`. If not, it creates a new anonymous Supabase user and stores the UID. The frontend stores the returned `anonymous_uid` in the auth context. No session restoration yet.

### Changes

#### 1. Edge Function (`supabase/functions/kid-login/index.ts`)
- Change kid SELECT to include `anonymous_uid` in the fields
- After PIN is valid, add create-or-reuse block:
  - If `kid.anonymous_uid` is null: call `supabase.auth.admin.createUser({ user_metadata: { role: 'kid', kid_id: kidId } })`, then update `kids.anonymous_uid`
  - If exists: use as-is
  - Graceful fallback if creation fails (login still succeeds, just no anonymous_uid)
- Include `anonymous_uid` in the success response

#### 2. Auth Context (`src/contexts/AuthContext.tsx`)
- Add `anonymousUid?: string` to `AuthUser` interface
- Update `loginAsKid` signature to accept `anonymousUid?: string` and persist it

#### 3. Frontend (`src/pages/KidLogin.tsx`)
- Pass `data.kid.anonymous_uid` to `loginAsKid()` call

### No migration needed
The `anonymous_uid` column already exists on the `kids` table.

### Not included (next step)
- No client-side `signInAnonymously()` or session restoration
- No RLS policy changes

