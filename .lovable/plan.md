# First-mission prompt screen

Final step of parent onboarding. Three file changes.

## 1. CREATE `src/pages/ParentFirstMission.tsx`

New standalone page. No ProgressIndicator, no back button. `bg-background`, `max-w-md mx-auto`, full screen flex column.

Sections (top → bottom):
- `pt-12` safe area
- Success badge pill: `bg-success/15 text-success border border-success/30`, CheckCircle + "Family setup complete"
- Mascot (`@/assets/loopo-mascot.png`, h-140), continuous float `y:[0,-8,0]` 2s easeInOut
- Title "Now let's make Loopo come alive" — display 26px
- Subtitle two-liner — muted, sm
- Preview card (`mt-8 mx-5`): Rocket tile + "Clean your room" + CoinIcon 14 + "500 credits" + ChevronRight; hint text below
- Bottom (`mt-auto pb-8 safe-area-bottom`):
  - MobileButton variant="gold" fullWidth → `navigate("/parent/add-task")`
  - Tappable text "Explore the dashboard first" → `navigate("/parent")`

framer-motion entrance delays per spec (0.1 → 0.9). Mascot combines initial scale/fade with continuous float animation.

Imports: react-router `useNavigate`, framer-motion `motion`, lucide `CheckCircle, Rocket, ChevronRight`, `MobileButton`, `CoinIcon` from `@/components/mobile`, mascot asset.

## 2. MODIFY `src/pages/ParentSignup.tsx`

In `handleCelebrationEnd`, change `navigate("/parent")` → `navigate("/parent/first-mission")`. `loginAsParent(...)` line unchanged.

## 3. MODIFY `src/App.tsx`

- Import `ParentFirstMission` with other page imports.
- Add `<Route path="/parent/first-mission" element={<ParentFirstMission />} />` near other `/parent/*` routes.

## Untouched
CelebrationScreen, ParentDashboard, ParentAddTask, all others.
