

## Change Home Page Route to `/home`

### Changes

**`src/App.tsx`**
- Change the HomePage route from `path="/"` to `path="/home"`
- Add a new route: `<Route path="/" element={<Navigate to="/home" replace />} />` so visiting `/` automatically redirects to `/home`
- Update the `AuthAwareHomePage` redirect logic (it already redirects authenticated users, no change needed there)

Single file, two small edits.

