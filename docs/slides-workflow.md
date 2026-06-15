# Hosting talk slides + adding a "Slides" link to a publication

How to self-host a presentation (exported from Keynote as HTML) on this site and link it from the
Publications section, with animated GIFs rendering.

This file lives under `docs/`, which is in the `exclude:` list in `_config.yml`, so it is
version-controlled but **never published**.

## How it works (no new code needed)

- The publications template (`_layouts/publications.html`, lines ~74–92) already renders an arbitrary
  `links:` array with custom labels, styled by `.pub-links` in `_sass/pages/_publications.scss`.
  Adding a `Slides` link is therefore just a front-matter edit — no template or CSS change.
- A self-contained HTML folder hosts and deploys as-is. This is already proven by the CV at
  `assets/docs/cv/index.html` (its own `index.html` + relative links). A Keynote HTML export behaves
  identically: as long as the whole folder is hosted together and the link points at its
  `index.html`, the export's relative links resolve correctly.
- Jekyll copies everything under `assets/` verbatim. The export's `index.html` has no YAML front
  matter, so Jekyll treats the whole folder as static files and does **not** run Liquid on it (safe
  even if the bundled JS contains `{{ }}` or `{% %}`). With `baseurl: ""` and `cdn: ""`, paths like
  `/assets/slides/...` resolve at the domain root.

## Convention

One folder per talk under `assets/slides/`, named with a kebab-case slug:

```
assets/slides/<talk-slug>/
  index.html        <- entry point (what the Slides link targets)
  <asset subfolders> <- images, gifs, js, css from the export
```

Example slug: `wafr-2026-geodex`  →  `https://phonethk.com/assets/slides/wafr-2026-geodex/index.html`

## Per-deck steps

1. **Export from Keynote:** `File → Export To → HTML`. You get a folder with `index.html` plus an
   asset subfolder.

2. **Check GIFs survived the export — do this first.** Keynote's HTML export is image-based, so
   embedded animated GIFs are *not guaranteed* to keep animating; Keynote may flatten them into the
   slide image. Open the exported `index.html` directly in a browser (double-click it) and play
   through the GIF slides.
   - Quick diagnostic: look inside the export's asset folder. Real `.gif` files → they will likely
     animate. Every slide is a single `.png`/`.jpeg` and there are no `.gif` files → the GIF was
     flattened (it will be frozen on the web too).
   - If a GIF is frozen, pick a fallback for that slide:
     - Replace the static image in the exported HTML with the real animated `.gif`, or with a
       looping video: `<video autoplay loop muted playsinline src="clip.mp4"></video>`.
     - Or rebuild just that deck in a web-native tool (e.g. reveal.js), where GIFs always animate.
     - Or accept a static frame (fine when GIF motion is only a nice-to-have).

3. **Drop the folder in:** copy the entire export to `assets/slides/<talk-slug>/`, preserving its
   internal structure. Do not rename the internal asset folders.

4. **Add the Slides link** to the relevant publication's front matter in `_publications/00NN.md`.
   Use the `links:` array (add a `Slides` entry alongside Paper/Code). Example for the WAFR/geodex
   paper (`_publications/0012.md`):

   ```yaml
   links:
     - label: Paper
       url: https://arxiv.org/abs/2602.00992
     - label: Code
       url: https://github.com/utiasSTARS/geodex
     - label: Slides
       url: /assets/slides/wafr-2026-geodex/index.html
   ```

   Note: a relative `/assets/slides/...` URL opens in the **same** tab (the template only forces a
   new tab for URLs containing `://`). To open slides in a new tab, either use the full URL
   `https://phonethk.com/assets/slides/<slug>/index.html`, or apply the optional one-line template
   tweak below.

5. **Test, then push.** Pushing to `master` triggers `.github/workflows/pages-deploy.yml`, which
   builds and deploys automatically.

## Verify

1. **GIF check (no build):** open `assets/slides/<slug>/index.html` from disk; confirm GIF slides
   animate and arrow-key navigation works.
2. **Local site:** `npm run build` then `bundle exec jekyll serve`. Visit
   `http://localhost:4000/assets/slides/<slug>/index.html` (the folder serves correctly) and your
   Publications page (the **Slides** link appears next to Paper/Code and clicks through).
3. **Live:** after the deploy finishes, check
   `https://phonethk.com/assets/slides/<slug>/index.html` and the live Publications page.

## Caveats

- **Don't let the export contain top-level entries starting with `_`, `.`, `#`, or `~`.** Jekyll
  ignores those by default and there is no `include:` list in `_config.yml`. Keynote uses
  `index.html` + lowercase asset folders, so this is normally fine; if such a name appears, rename it
  or add an `include:` entry to `_config.yml`.
- **Case sensitivity:** GitHub Pages (Linux) is case-sensitive; macOS is not. Make sure the link's
  casing matches the exported filenames exactly, or it will 404 in production but work locally.
- **Size:** Keynote HTML + GIFs can be heavy. Keep decks reasonable — compress GIFs, or convert big
  ones to `<video>`. If a deck is large, optionally add `/assets/slides` to `pwa.cache.deny_paths`
  in `_config.yml` to keep it out of the PWA offline cache.

## Optional: open slides in a new tab (one-line template change)

To make local slide links open in a new tab (consistent with Paper/Code) while keeping portable
relative URLs, edit line ~78 of `_layouts/publications.html`:

```liquid
<a href="{{ l.url }}"{% if l.url contains '://' or l.url contains '/assets/slides/' %} target="_blank" rel="noopener"{% endif %}>
```

This is optional — without it, use the full `https://phonethk.com/...` URL to get new-tab behavior.
