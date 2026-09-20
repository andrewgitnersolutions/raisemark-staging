# RaiseMark Website — Workspace Rules & Standing Constraints

These rules apply to all agent operations within the RaiseMark website codebase (`PaiR`).

---

## 1. Design System & Palette (§3.3)

Use only the defined CSS custom properties from `css/global.css`. **Never introduce a new hex literal.**

```css
--navy: #1B3A6B;          /* Primary. Headlines, titles, table headers */
--navy-mid: #2A5298;      /* Secondary structure, sub-headings */
--navy-light: #3663A8;
--crimson: #A8192E;       /* Accent only. Rules, labels, bullets, stripes */
--crimson-light: #F7E8EA; /* Callout backgrounds */
--near-white: #F0F2F5;
--light-grey: #E8ECF2;    /* Alternating rows, panels. Never text */
--text-dark: #1A1F2E;     /* Body copy. Never pure black */
--text-body: #4A5568;
--white: #FFFFFF;
--border: #CDD4E0;

--font-heading: 'Calibri', 'Inter', system-ui, -apple-system, sans-serif;
--font-body:    'Calibri', 'Inter', system-ui, -apple-system, sans-serif;

--shadow-sm / --shadow-md / --shadow-lg
--ease: 0.3s ease;
```

### Color Rules:
- **Crimson is an accent only:** Never use as a large background fill or for body text copy.
- **No crimson text on navy:** Contrast ratio fails WCAG AA below 24pt.
- **Never pure black (`#000000`)** for body text. Use `--text-dark` or `--text-body`.
- **Maintain WCAG AA contrast** (minimum 4.5:1 for normal text, 3:1 for large text) on all foreground/background pairs.

---

## 2. Navigation Synchronization (§3.5)

There is **no templating engine, build step, or server includes**. The primary navigation `<header>` block (`<ul class="nav-links">`) is duplicated across all main site pages.

### Rule:
Whenever a navigation item is added, modified, or removed:
1. Update the `<ul class="nav-links">` block across all HTML files containing the global site header.
2. Run the mandatory Python verification script to ensure byte-identity across all files (ignoring `class="...active..."`).
3. Report the total count of files verified in the commit / PR summary.

---

## 3. Logo Integrity (§3.6)

- Asset: `assets/raisemark-logo.png`.
- The lowercase **'i' is crimson (`#A8192E`) with an oversized circular dot** and is the brand signature.
- **Never** retype the wordmark in a font, recolor any letter, stretch/rotate/skew, apply drop shadows or filters, or render below 120px wide.
- Required `alt` text:
  *"The RaiseMark logo in deep navy bold lettering, with the lowercase i rendered in crimson including an oversized circular dot, above the tagline A Higher Standard in navy spaced capitals."*

---

## 4. Voice, Copy & Banned Words (§3.7)

- **House Voice:** The confidence of a practitioner, not the enthusiasm of a vendor. Evidence and numbers, not adjectives.
- **Banned Words — NEVER USE IN ANY COPY:**
  - `leverage`
  - `utilize`
  - `synergy`
  - `game-changing`
  - `revolutionary`
  - `exciting`
  - `amazing`
  - `incredible`
- **Brand Spelling:** Always **RaiseMark** (capital R and capital M).
- **AI Spelling:** Always **AI** (capitalized). Never "A.I." or "Ai".
- **Tagline:** *A Higher Standard* (title case in prose; all-caps in logo only).
- **Typography Layout:** All body text left-aligned, never justified. Minimize hyphenation.

---

## 5. Architectural Boundaries & Forbidden Actions (§7)

1. **No hosting migration:** Remains on GitHub Pages. Never migrate to Firebase, Cloud Run, Vercel, or Netlify.
2. **No build step, framework, or bundler:** No React, Vue, Next, Vite, Tailwind, or npm build dependencies. Pure HTML5, CSS3, and vanilla ES6 JS.
3. **No auto-generated 50-state tracker pages:** Tracker remains consolidated on `ai-policy-tracker.html`. Never auto-generate statutory compliance pages.
4. **No client names, logos, testimonials, or case studies:** Client work is subject to written approval that does not exist. Keep all proof points and references strictly de-identified.
5. **No unapproved pricing:** No public pricing is cleared for the live site. Never publish hourly rates, internal tiers, or retainer fees without explicit principal clearance.
6. **No invented or altered statistics:** Original data points from the RaiseMark tool library are verbatim-locked.
7. **No renaming repository or modifying `CNAME` / `robots.txt` / URLs.**

---

## 6. Safety Gates

- **Gate 1 (Pricing):** Public pricing requires explicit principal clearance. Entry engagement is the AI 360 Review.
- **Gate 2 (Articles):** Clearance required before publishing draft documents.
- **Gate 3 (Methodology):** Naming confirmation required before public rollout.

---

## 7. Staging & Production Deployment Protocol

### Working Branch:
- All interactive development in this Antigravity project workspace occurs on the `staging` branch.
- Changes on `staging` are deployed to the private, unindexed partner preview environment:
  `https://andrewgitnersolutions.github.io/raisemark-staging/`
- Run `./scripts/deploy-staging.sh` or push to `staging` to update the preview immediately.

### Production Promotion Action:
- To deploy approved changes to the public website, invoke `/raisemark-website-push-to-prod` (or run `./scripts/publish-to-public.sh`).
- Pipeline: `staging` &rarr; `public` &rarr; `main` &rarr; `https://raisemarkai.com`.
- This ensures partner review (Dwight Jones, Don Peterson) and safety gates are satisfied prior to open web release.
