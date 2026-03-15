# Public assets

- **Favicon / app icon**: Served from `src/app/icon.tsx` and `src/app/apple-icon.tsx` (generated from design tokens). To use Dzyne/Refine outputs instead, add `icon.png` or `icon.ico` and `apple-icon.png` under `src/app/` and remove the `.tsx` generators.
- **Default OG image**: Add `og-default.png` here and reference in layout metadata, or add `src/app/opengraph-image.png` for the default share image.
- **Logo**: Add `logo.svg` or `logo.png` here and use `/logo.svg` or `/logo.png` in Header and Footer.

See `docs/DZYNE-REFINE-ASSETS.md` for the full Dzyne/Refine asset pipeline.
