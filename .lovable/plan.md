## Plan: Restore Anonymous Supabase Session for Kid Login

### Overview
After PIN verification, the edge function generates a magic link token for the kid's anonymous user and returns it. The frontend uses `verifyOtp` to establish a real Supabase session where `auth.uid()` equals the kid's `anonymous_uid`. Parent sessions are saved/restored around the switch.

### Changes

#### 1. Edge Function (`supabase/functions/kid-login/index.ts`)

**Update `createUser` call** to include a deterministic email and confirm it:
```typescript
supabase.auth.admin.createUser({
  email: `kid-${kidId}@loopo.internal`,
  email_confirm: true,
  user_metadata: { role: "kid", kid_id: kidId },
})
```

**After anonymous_uid is resolved**, before returning success:
- Ensure the anonymous user has an email (for existing users created without one, call `updateUserById` to add it)
- Call `supabase.auth.admin.generateLink({ type: 'magiclink', email: `kid-${kidId}@loopo.internal` })`
- Extract `hashed_token` from the response
- Include `hashed_token` in the success JSON response
- Graceful fallback: if token generation fails, still return success without `hashed_token`

#### 2. Frontend (`src/pages/KidLogin.tsx`)

Update the PIN success handler:
1. Before setting the kid session, save any existing parent session:
   ```typescript
   const { data: { session: parentSession } } = await supabase.auth.getSession();
   if (parentSession) {
     localStorage.setItem('loopo_parent_session', JSON.stringify({
       access_token: parentSession.access_token,
       refresh_token: parentSession.refresh_token,
     }));
   }
   ```
2. If `data.hashed_token` exists, call:
   ```typescript
   await supabase.auth.verifyOtp({ token_hash: data.hashed_token, type: 'email' });
   ```
3. Then call `loginAsKid(...)` as before

#### 3. Auth Context (`src/contexts/AuthContext.tsx`)

**Update `logout`**:
- If user role is `kid`: restore parent session from `loopo_parent_session` via `supabase.auth.setSession()`, then remove the stored session
- If user role is `parent`: sign out normally

**Update session check**:
- Skip the "session expired → clear state" logic when `user?.role === "kid"`

### Security
- `@loopo.internal` is non-routable; no real emails sent
- `generateLink` with service role bypasses email delivery
- `hashed_token` is single-use and short-lived
- PIN verification is still the gatekeeper

### Next Steps
- RLS policy changes for anonymous kid users (kids table, tasks, redemptions, products)
