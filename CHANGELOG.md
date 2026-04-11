# Changelog

All notable changes to Quaternuli are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [0.2.0] — 2026-04-11

### Added

**Export formats**
- PDF export — text-based, searchable, Unicode-safe via embedded Inter TTF font
- DOCX (Word) export — structured document with Quaternuli branding
- Both formats match the existing HTML export aesthetic: bold title, red phase accent, tag borders, footer

**Seed import**
- Import seeds from `.json`, `.md`, and `.txt` files — all three existing export formats
- Drag-and-drop or file picker in the sidebar
- Multi-file import supported; errors reported per file without blocking successful imports
- Non-Quaternuli JSON files (arrays, mismatched schemas) are rejected with a clear error message

**Responsive layout**
- Full mobile layout for Notebook mode: single-panel view with Seeds / Editor / Gardener bottom nav
- Full mobile layout for Code mode: single-panel view with Files / Editor / Gardener bottom nav
- Tablet layout for both modes: two-panel view with toggleable Gardener slide-in panel
- Desktop layout unchanged: classic three-panel view

### Changed

- TopBar: logo icon only on mobile, short wordmark on sm, full wordmark on md+
- TopBar: API key button shows gear icon only on mobile to prevent header overflow
- API key dropdown panel is full-width on mobile, fixed width on larger screens
- Sidebar: New Seed and Import Seeds buttons are more compact, giving the seed list more vertical space
- Import button renders in a slim single-row layout inside the sidebar
- FileSidebar (Code mode): dark background fills full panel height, eliminating white void on mobile
- GardenerPanel and CodeGardener: fill full height on tablet, fixing scroll and empty space issues

### Fixed

- PDF export: Unicode characters (Slovenian diacritics, arrows, em-dashes) now render correctly
- PDF export: switched from woff2 to TTF font loading; Inter Regular and Bold served from `/public/fonts/`
- Import: non-Quaternuli JSON files no longer create silent empty seeds
- Code mode: all three panels now accessible on mobile via bottom navigation
- Tablet Gardener panel: scrollable and fills full height without whitespace below content

### Infrastructure

- Landing page (`quaternuli.xyz`) migrated from Netlify to Vercel
- DNS updated in GoDaddy: A record and CNAME pointing to Vercel
- Netlify `_redirects` replaced with `vercel.json` redirects
- Inter TTF fonts (Regular + Bold) added to `public/fonts/` for PDF export

---

## [0.1.0] — 2026-04-02

Initial public release.

- Capture → Tend → Harvest seed lifecycle
- The Gardener AI assistant powered by Claude (claude-sonnet-4-20250514) with streaming
- Export to Markdown, Plain Text, Styled HTML, JSON
- Code editor with syntax highlighting (8 languages) and Gardener code review
- Local-first storage via IndexedDB
- Swiss International Style design system
- Vercel deployment at `quaternuli.vercel.app`
