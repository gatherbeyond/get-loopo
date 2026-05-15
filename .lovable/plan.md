# Two cosmetic fixes

Cosmetic only. No logic, schema, or auth changes.

## 1. `src/components/signup/AddKidStep.tsx` — inline avatar grid

**Remove:**
- `showAvatarPicker` state
- The 120x120 circular trigger button + "Tap to choose avatar" helper text
- The `<AvatarPicker ... />` rendered at the bottom
- Default import of `AvatarPicker` (keep named `avatars` import)
- `User` import from `lucide-react`

**Replace avatar section with a 2-column grid:**
- `grid grid-cols-2 gap-3` containing every entry in `avatars`
- Each tile: `w-full aspect-square rounded-full flex items-center justify-center text-5xl cursor-pointer transition-all` plus the avatar's `bg` class
- Selected: `ring-[3px] ring-primary ring-offset-2`
- Unselected: no ring, `opacity-70`
- Tap → `onUpdate({ avatar: avatarItem.id })`
- The mount `useEffect` that pre-selects `avatars[0].id` stays as-is

**Untouched:** header, mascot, name input, age picker, COPPA notice, bottom CTA.
**Not modified:** `AvatarPicker.tsx`.

### Open question
The instructions say "all 6 avatars", but `AvatarPicker.tsx` exports 20 avatars (lion, panda, unicorn, dragon, fox, owl, penguin, koala, bunny, cat, dog, bear, monkey, tiger, elephant, giraffe, dolphin, butterfly, star, rocket). Plan as written renders all 20 in the 2-col grid. If you want only the first 6, say so and I'll slice `avatars.slice(0, 6)`.

## 2. `src/components/signup/InterestCaptureStep.tsx` — pill styling

Update the pill button conditional classes only. Layout, sizing, spacing, font size unchanged.

- Unselected: `border-2 border-primary text-primary bg-transparent`
- Selected: `border-2 border-primary bg-primary text-primary-foreground`

Nothing else in the file changes.
