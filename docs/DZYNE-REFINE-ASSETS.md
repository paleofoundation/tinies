# Dzyne MCP & Refine Design assets

## Current setup

- **Design tokens** (Refine Design): `design-tokens/tinies-design-tokens.json`, `.css`, `.ts` are in the repo and wired into `src/app/globals.css`. The app uses `var(--color-primary)`, `var(--font-body)`, etc., so the live look is driven by those tokens.
- **Favicon / app icon**: Generated from tokens in `src/app/icon.tsx` and `src/app/apple-icon.tsx` (teal `#0A8080`, “t” mark). Replace with Dzyne/Refine outputs when the MCP gives you assets.

## When Dzyne MCP is connected

If the **Dzyne MCP** (from dzyne.app) is connected in Cursor, it can be run against this app using:

- The **CSS** variables in `src/app/globals.css` (and/or `design-tokens/tinies-design-tokens.css`)
- The **Tailwind**-friendly token slice in `design-tokens/tinies-design-tokens.ts` (for a future `tailwind.config`)
- The **JSON** tokens in `design-tokens/tinies-design-tokens.json`

Expected outputs from Dzyne (so the site looks less “AI default”):

- **Favicon** (and optionally apple touch icon)
- **General assets**: e.g. default OG image, logo, or other brand assets

## Where to put Dzyne/Refine assets

| Asset            | Put file here                    | Notes |
|------------------|-----------------------------------|--------|
| Favicon          | `src/app/icon.png` or `icon.ico`  | Replaces generated `app/icon.tsx` (you can remove the tsx). |
| Apple touch icon | `src/app/apple-icon.png`          | Replaces generated `app/apple-icon.tsx`. |
| Default OG image | `public/og-default.png` or `src/app/opengraph-image.png` | Used when sharing the site or pages without a page-specific OG image. |
| Logo (SVG/PNG)   | `public/logo.svg` or `public/logo.png` | Reference in Header/Footer as `/logo.svg` or `/logo.png`. |

After adding files under `src/app/`, Next.js will use them automatically for metadata; no code change needed unless you switch to a different path.

## Why the live site (tinies.app) might not match yet

1. **Deploy not updated**  
   Pushes to `main` only show on the live site after a new deploy. If you use Vercel, trigger a deploy from the Vercel dashboard (or rely on the GitHub integration after `git push`).

2. **CDN / browser cache**  
   Hard refresh (e.g. Cmd+Shift+R) or try in an incognito window. If you use a CDN, purge cache for the site.

3. **GCentra not loaded**  
   Tokens specify heading font “GCentra”, which isn’t on Google Fonts. The app falls back to Georgia. For the exact Refine look, either self-host GCentra and add `@font-face` in `globals.css` or change `--font-heading` to a Google Font (e.g. DM Serif Display).

4. **Dzyne assets not run yet**  
   Favicon and “general assets” are currently token-based placeholders. Running the Dzyne MCP on this repo (with the JSON/CSS/Tailwind tokens) should produce favicon and other assets; once you have the files, drop them into the locations above.

## Using Refine Design on the app (like refinedesign.ai on itself)

Yes, you can do that. Options:

- **Design tokens**: Already done — Refine Design tokens (JSON/CSS/TS) are in the repo and applied via `globals.css`.
- **Asset generation**: When Dzyne MCP is working the way you want, run it in Cursor against this project (with the same tokens) to get favicon and general assets, then add them as above.
- **Iteration**: After Dzyne improves (e.g. on refinedesign.ai), run it again on Tinies to regenerate or add assets and refresh the look.

Once the MCP is stable and you’ve run it here, replacing the generated `icon.tsx` / `apple-icon.tsx` with Dzyne’s favicon and adding a default OG image and logo will make tinies.app align with your Refine Design + Dzyne pipeline.
