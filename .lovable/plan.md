# Tap-only kid login

Skip the PIN step entirely when a kid taps their avatar on the profile screen. PIN flow remains intact as a fallback path but is no longer triggered by the avatar tap.

## 1. `supabase/functions/kid-login/index.ts`

Insert a new `tap_login` action between `lookup_family` and `verify_pin`. Same anonymous-UID + magic-link pattern as `verify_pin`, but no PIN check and no rate limiting.

Returns:
```text
{ success, kid: { id, name, avatar, anonymous_uid }, hashed_token }
```

`lookup_family` and `verify_pin` are not modified.

## 2. `src/pages/KidLogin.tsx`

Three localized changes only.

- Add `tapError` state alongside existing `useState` declarations.
- Add `handleTapLogin(kid)` after `handleBack`. It:
  - Sets `selectedKid` and `isValidating`.
  - Invokes the `tap_login` edge action.
  - Saves parent session to `localStorage` (same as PIN flow).
  - Calls `supabase.auth.verifyOtp` with the returned `hashed_token`.
  - Calls `loginAsKid(...)`.
  - Shows the existing `showSuccess` screen (sets `step="pin"` to reuse it).
  - Checks `kids.onboarding_completed_at` to pick `/kid` vs `/kid/onboarding`.
  - Navigates after 1.5s.
  - On any error: surfaces `tapError`, clears `isValidating`.
- Update profile-step grid:
  - Avatar `onClick` becomes `handleTapLogin(kid)`.
  - `motion.button` gets `disabled={isValidating}`.
  - When validating: selected card shows spinning `Loader2` in the avatar circle; non-selected cards get `opacity-40`.
  - Replace the "Tap your picture!" hint with: error message when `tapError`, "Logging in..." when `isValidating`, original hint otherwise.

PIN step JSX, back-button behavior, and code/family-lookup steps are untouched.

## Untouched
- `lookup_family` and `verify_pin` blocks in the edge function
- PIN entry UI, success screen, keypad, and `handlePinDigit`
- All other files
