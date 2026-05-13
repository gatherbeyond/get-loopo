# Signup flow cosmetic cleanups

Three files, cosmetic only. No logic, schema, auth, or orchestrator changes.

## 1. `src/components/signup/CelebrationScreen.tsx`

- Add `Sparkles` to the `lucide-react` import.
- Replace the `🎉 You're All Set!` `<h1>` with a centered flex row (`gap-3`) containing `<Sparkles className="w-9 h-9 text-accent-gold" />` and the text `You're All Set!`. Heading styling unchanged.
- Everything else (mascot, confetti, gradient, Get Started button, 4s auto-navigate, all animation timings) untouched.

## 2. `src/components/signup/AddKidStep.tsx`

- (a) Remove the trailing `🔒` emoji from the COPPA notice text. Keep the `Lock` icon and the rest of the line.
- (b) Delete the standalone text "Back" button above the MobileButton CTA. Top `ArrowLeft` button stays.
- (c) Change MobileButton label from `Complete Setup` to `Continue`. Loading state stays `Saving...`.
- (d) Import `avatars` as a named export from `./AvatarPicker` (alongside the existing default import). Add a `useEffect` running once on mount: if `data.avatar` is null, call `onUpdate({ avatar: avatars[0].id })`.

## 3. `src/components/signup/FamilySetupStep.tsx`

- Delete the standalone text "Back" button above the MobileButton CTA. Top `ArrowLeft` button stays. CTA unchanged.

## Out of scope

`ParentSignup.tsx`, `ProgressIndicator.tsx`, `AvatarPicker.tsx`, animation timings, and all other files remain untouched.
