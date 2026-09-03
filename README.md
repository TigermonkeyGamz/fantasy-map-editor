# WorldForge — Web Map & World Layout Editor

A browser-based 2D world-building editor for towns, cities, game maps, terrain layouts, roads, fences, buildings, props and labels.

## What is implemented

- Infinite-feeling pan/zoom editor workspace
- PNG/JPG/WEBP/SVG asset importing
- Click-to-place assets
- Object movement, transform properties and deletion
- Multi-point path/road tool with live preview
- Multi-segment fence tool with live measurement
- Terrain brush strokes
- Contour lines
- Layers with visibility/locking
- Text labels
- Coordinate readout and measurement tool
- Grid visibility and snapping
- Undo/redo
- Local browser persistence + autosave
- Project JSON export/import
- PNG export with draggable crop rectangle and 1×/2×/4× scale
- Light/dark UI
- GitHub Pages deployment workflow
- Optional Supabase schema/config for accounts and cloud persistence

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Then open the local Vite URL.

Production build:

```bash
npm run build
npm run preview
```

## GitHub Pages

1. Push this repository to GitHub with the default branch named `main`.
2. Open **Settings → Pages**.
3. Set the source to **GitHub Actions**.
4. Push to `main`.
5. The workflow in `.github/workflows/deploy.yml` builds and deploys `dist`.

The Vite config uses a relative base so the generated app works under a project-page URL. The included workflow uses `npm install` so the repository works without requiring a checked-in lockfile.

## Offline/local mode

The editor works without any account or backend. Maps are stored in browser localStorage, and projects can be backed up as `.worldforge.json` files.

## Optional Supabase accounts

The starter includes `@supabase/supabase-js`, `.env.example`, and `supabase/schema.sql`.

1. Create a Supabase project.
2. Run `supabase/schema.sql`.
3. Enable your desired authentication providers in Supabase Auth.
4. Copy `.env.example` to `.env.local`.
5. Set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
6. For GitHub Actions, add the same two values as repository/environment secrets.

The editor is intentionally local-first: it does not require Supabase to function.

## Notes

This build keeps map content as structured data rather than flattening it into one screenshot. Image assets imported with object URLs are retained during the live session; project backups should be extended to package binary assets (for example with a ZIP format) before long-term asset portability is needed.

## Suggested next expansion

For a production-scale version, add IndexedDB-backed binary asset storage, true multi-device sync for map data/assets, editable path/fence control points, more advanced terrain elevation fields, asset folders, and a dedicated account modal. The current architecture keeps those features isolated so they can be added without turning the editor into one giant component.