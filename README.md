# Bristol Bachata website

One-page static site: `index.html` plus a few small files.

## Files
- `index.html` – the page. Its `<style>` block holds all render-blocking CSS: site rules first, then the minified Tailwind build.
- `noncritical.css` / `noncritical.js` – below-the-fold styles and interactivity, loaded after first paint.
- `_headers` – cache rules. `robots.txt`, `sitemap.xml` – SEO.
- Images, `hero-video.mp4`, `logo.jpg` – loaded as referenced in `index.html`.
- `favicon.ico`, `icon-192.png`, `apple-touch-icon.png` – site icons made from the logo.
- `og-preview.webp` (and `og-preview.jpg` fallback) – 1200×630 social share preview.

## Changing the design
1. Edit the HTML, then rebuild Tailwind with your usual command plus `--minify`.
2. Replace the Tailwind part of the `<style>` block in `index.html` (the last line of the block) with the new output.

## Releasing
- If `noncritical.css` or `noncritical.js` changed, bump `?v=` on both references in `index.html`.
- Update `<lastmod>` in `sitemap.xml`.
- Images and video are cached for 7 days. Use a new file name when you replace one.
