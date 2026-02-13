

## Rename "RoleSelection" to "HomePage"

The component inside `HomePage.tsx` is still named `RoleSelection`, and `App.tsx` imports it under that name. This is why the route dropdown shows `/` without a clear "HomePage" label. Two small naming updates will fix this:

### Changes

**1. `src/pages/HomePage.tsx`**
- Rename the component function from `RoleSelection` to `HomePage` (line 7)
- Update the default export at the bottom of the file

**2. `src/App.tsx`**
- Change import: `import HomePage from "./pages/HomePage"`
- Rename wrapper: `AuthAwareRoleSelection` to `AuthAwareHomePage`
- Update the `<RoleSelection />` reference inside the wrapper to `<HomePage />`
- Update the comment accordingly

No functionality changes -- just renaming so the component is properly identified as "HomePage".
