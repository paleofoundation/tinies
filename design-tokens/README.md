# Tinies design tokens (Refine Design)

- **tinies-design-tokens.json** — Source of truth (Refine Design export).
- **tinies-design-tokens.css** — CSS custom properties for use in `src/app/globals.css`.
- **tinies-design-tokens.ts** — Tailwind `theme.extend` snippet; use if you add a `tailwind.config.ts`.

**Fonts:** Body is **Roboto** (loaded via Next.js in `layout.tsx`). Heading is **GCentra**; it’s not on Google Fonts. To use it, self-host the font files and add a `@font-face` in `globals.css`, or swap `--font-heading` in `globals.css` to another font (e.g. `'DM Serif Display', serif`). Current fallback is Georgia.
