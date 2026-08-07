# Quantum Plators Digital Platform
## Master Implementation Plan v5 — Complete Build Specification
Department of Physics, University of Jos — Class of 2024

This is the consolidated reference. It replaces v1 through v4 and folds every decision made so far into one document. Two changes from v4: the student spreadsheet link is confirmed, and FYB Week is now a completed event, so `/fyb-week` becomes a recap gallery instead of a forward-looking itinerary.

---

## 1. Confirmed Facts, Quick Reference

| Item | Value |
|---|---|
| Class | Quantum Plators, Physics Class of 2024, University of Jos |
| Today (at time of writing) | August 2, 2026 |
| Sign-out target | August 22, 2026, 00:00 WAT (`+01:00`), unless a specific time is confirmed |
| Dinner & Awards Night | Date not fixed. Shows "Coming Soon." |
| FYB Week theme | Quantum Leap 26, run by the Social Planning Committee |
| FYB Week dates | July 20 to July 25, 2026 — already completed as of today |
| Student data source | Google Sheet: `123L0bms0FDQcheS0O_46Nxc_XFj6-2xFXN7V2hvjsE4` |
| Finance data source | Google Sheet: `1q-1dAUPRYSgkHb1C4J2nk6BuToC7iNFkyqblSPZHsJo` |
| Mangset photos | Already exist at `/assets/images/prof` |
| Hosting | Netlify, auto-deploy on push |
| Voting | Offline. Payment confirmed manually, agent updates `data/awards.json` on instruction |
| Admin panel | None on the public site. All admin work happens through the codebase |

---

## 2. Tech Stack and Architecture

| Layer | Choice | Reasoning |
|---|---|---|
| Framework | Astro, hybrid rendering | Most pages prerender at build time for speed. `/students` and `/students/[slug]` render on request so they always reflect the live spreadsheet without needing a rebuild. |
| Styling | Tailwind CSS | Consistent design tokens, fast iteration. |
| Interactive islands | React, used only where needed | Search bar, live countdown, slideshow controls. Everything else stays static HTML for speed. |
| Student data | Google Sheet via Netlify Function proxy | Keeps the sheet off the client, allows short server-side caching. |
| Finance data | Google Sheet via Netlify Function proxy | Same pattern. |
| Awards data | `data/awards.json` in the repo | Small enough that a JSON file beats a database. Edited directly by the agent when a payment is confirmed. |
| FYB Week recap data | `data/fyb-week.json` in the repo | Static content describing a completed event, paired with the media folders. |
| Config | `data/config.json` in the repo | Single source of truth for countdown target dates and sheet IDs. |
| Media | Repo folders under `/assets/images/` and `/assets/videos/` | Version-controlled, no storage bill, matches your existing `/assets/images/prof` convention. |
| Hosting | Netlify | Auto-deploy on every push, free tier covers this project's traffic easily. |

No database. No Supabase. No CMS. Everything dynamic that needs to change often (student data, finance) comes from a spreadsheet you already control. Everything that changes occasionally (awards, FYB recap) lives in version-controlled JSON. Everything static (Mangset, design system) is just code.

---

## 3. Repository and Folder Structure

```
/src/pages/                                               Astro routes, one file or folder per route in Section 6
/src/components/                                          Shared UI: nav, footer, countdown, search, cards
/src/lib/                                                  Sheet-fetching helpers, matching logic, formatting utilities
/netlify/functions/get-students.ts                        Proxies the student spreadsheet
/netlify/functions/get-finance.ts                          Proxies the finance spreadsheet
/data/awards.json                                          Award categories, nominees, vote counts
/data/fyb-week.json                                        FYB Week recap content, per day
/data/config.json                                          Countdown targets, sheet IDs, other editable settings
/assets/images/prof/                                        Prof. E.W. Mangset — already populated
/assets/images/students/                                    Student profile photos, filename = matric number
/assets/images/events/fyb-week/2026-07-20-corporate-day/
/assets/images/events/fyb-week/2026-07-21-denim-on-denim/
/assets/images/events/fyb-week/2026-07-22-jersey-day/
/assets/images/events/fyb-week/2026-07-23-old-school-costume/
/assets/images/events/fyb-week/2026-07-24-cultural-day/
/assets/images/events/fyb-week/2026-07-25-class-picnic-signout/
/assets/images/events/dinner-night/
/assets/images/slideshow/                                    Homepage hero slideshow
/assets/videos/                                              Linked or embedded event video
```

First build action, every time the agent starts a fresh phase of work: create every folder listed above if it does not already exist, then scan and report what has real content versus what is still empty.

---

## 4. Data Sources and Data Model

### 4.1 Student Spreadsheet
Source: `https://docs.google.com/spreadsheets/d/123L0bms0FDQcheS0O_46Nxc_XFj6-2xFXN7V2hvjsE4`

Fetched server-side through `netlify/functions/get-students.ts` using the sheet's `gviz/tq` JSON endpoint, never exposed to the client directly. Cached for 5 minutes server-side so repeated visits don't hit Google on every request.

The agent should read the actual column headers from the sheet during Phase 0 and map them to profile fields (expected candidates: Full Name, Nickname, Matric Number, State of Origin, Social Handles, Favorite Course, Toughest Level, Favorite Lecturer, Side Hustle, Hobbies, Motto, Parting Words). Whatever the real headers turn out to be, that becomes the mapping. A field with no value for a given student does not render on that student's profile.

Response shape returned by the function to the frontend:
```json
{
  "students": [
    { "matricNumber": "2020/04/1234", "fullName": "...", "slug": "...", "...": "only non-empty fields" }
  ],
  "fetchedAt": "ISO timestamp"
}
```

### 4.2 Finance Spreadsheet
Source: `https://docs.google.com/spreadsheets/d/1q-1dAUPRYSgkHb1C4J2nk6BuToC7iNFkyqblSPZHsJo`

Same fetch pattern through `netlify/functions/get-finance.ts`. The function computes totals against the ₦31,000-per-student target (₦9,000 Core Legacy, ₦1,000 Digital Platform, ₦21,000 Dinner Upgrade) and returns clean numbers, not raw sheet rows, so the frontend just renders a percentage and a breakdown.

### 4.3 `data/awards.json`
```json
{
  "categories": [
    {
      "id": "political-icon",
      "name": "Political Icon of the Year",
      "tier": "400L",
      "nominees": [
        { "name": "Yarima Nan'akyen", "votes": 0 },
        { "name": "Katbam Christopher Tohomdet", "votes": 0 },
        { "name": "Josiah Nnyia", "votes": 0 }
      ]
    }
  ]
}
```
Seed every category and nominee from the two shortlist flyers already shared. Nominee `name` gets matched against the spreadsheet's Full Name column (case-insensitive, trimmed) so a matched student's profile shows a "Nominated For" section. Unmatched names get logged for review, never guessed at.

### 4.4 `data/fyb-week.json`
FYB Week is over, so this file describes what happened, not what's coming.
```json
{
  "theme": "Quantum Leap 26",
  "committee": "Social Planning Committee",
  "days": [
    {
      "date": "2026-07-20",
      "dayName": "Monday",
      "title": "Corporate Day",
      "themeSubtitle": "The Activation Energy",
      "dressCode": "Corporate",
      "recap": "A short past-tense recap of what actually happened, once you confirm it.",
      "galleryFolder": "assets/images/events/fyb-week/2026-07-20-corporate-day"
    }
  ]
}
```
Six entries total, one per day from Section 1's table. The `recap` field should be written in past tense once real detail is available. Until then it stays out entirely, per the strict data rule, rather than filled with generic placeholder text.

### 4.5 `data/config.json`
```json
{
  "signOut": { "targetDate": "2026-08-22T00:00:00+01:00", "label": "Sign-Out" },
  "dinnerNight": { "targetDate": null, "label": "Dinner & Awards Night" },
  "sheets": {
    "students": "123L0bms0FDQcheS0O_46Nxc_XFj6-2xFXN7V2hvjsE4",
    "finance": "1q-1dAUPRYSgkHb1C4J2nk6BuToC7iNFkyqblSPZHsJo"
  }
}
```
Every date and every sheet ID lives here and nowhere else in the codebase. Updating this file is the only step needed to change the sign-out time, add the Dinner Night date, or point at a different sheet later.

---

## 5. Strict Data Rule

Nothing renders unless it is genuinely present in its source: the spreadsheet, `data/awards.json`, or `data/fyb-week.json`. No placeholder text, no invented bio details, no generic "recap coming soon" copy standing in for real content, no filler where a photo is missing. Empty fields are omitted entirely, not shown as blank labels. The one explicit exception is the Dinner Night countdown, which is allowed to show a properly designed "Coming Soon" state, since that is a real, honest status rather than fabricated content.

---

## 6. Site Map and Page-by-Page Specs

```
/                       Home: 8 sections, Section 8
/students               Directory with search by name or matric number
/students/[slug]        Profile page, only fields present in the sheet, "Nominated For" if matched
/mangset                Prof. E.W. Mangset memorial
/awards                 Public award standings, read-only, by category
/fyb-week               Quantum Leap 26 recap gallery, day by day, Section 7
/gallery                Full media vault, all events including FYB Week and Dinner Night
/finance                Full funding breakdown
/opportunities          Job, seminar, and scholarship board
```

No `/admin` route. No login anywhere on the public site.

**`/students`** — search bar at the top, filtering by name or matric number against the live data from `get-students`. Results as a card grid, matric number visible on every card.

**`/students/[slug]`** — full profile, only non-empty fields, "Nominated For" section when the student matches an `awards.json` nominee, profile photo from `/assets/images/students/` if a matching filename exists, otherwise a clean text-only layout with no broken image icon.

**`/mangset`** — static content, images from `/assets/images/prof`, written tribute text once supplied.

**`/awards`** — one section per category from `data/awards.json`, nominee names, photos where matched, current vote counts. Read-only. No voting UI, since voting happens offline.

**`/fyb-week`** — see Section 7.

**`/gallery`** — every event folder under `/assets/images/events/`, including the six FYB Week days and Dinner Night once it happens, each as its own grouped section.

**`/finance`** — full breakdown by category (Core Legacy, Digital Platform, Dinner Upgrade), each with its own progress indicator, sourced from `get-finance`.

**`/opportunities`** — list of postings from a small data source you supply, filterable by type (job, seminar, scholarship), automatically dropping anything past its expiry date.

---

## 7. `/fyb-week`: Recap Gallery Spec

FYB Week already happened, so this page's job changed from "here's what's coming" to "here's what happened." Structure:

- Page header: "Quantum Leap 26 — FYB Week Recap," theme framing pulled from `data/fyb-week.json`.
- Six day sections in chronological order, each showing: the date and day name, the title and theme subtitle (for example "Corporate Day — The Activation Energy"), the dress code as a small tag, the past-tense recap text once available, and the actual photos or videos from that day's folder.
- Where a day's folder is still empty, that section shows the day's identity (date, title, theme) without a broken gallery grid, since the strict data rule means no fabricated recap text and no placeholder images either.
- Link out to the fuller `/gallery` page for anyone who wants everything in one place rather than day-by-day.

This page is now one of the more content-rich pages on the site once photos start arriving, since it is the primary place classmates go to relive a week that already happened.

---

## 8. Homepage: 8 Sections

1. **Hero slideshow** — auto-advancing, built from `/assets/images/slideshow/`, gold Quantum Plators mark overlaid.
2. **Countdown** — live, per-second, sign-out target from `data/config.json`. This is one of the two most carefully designed elements on the site (see Section 10).
3. **Funding progress** — single live bar against the ₦31,000 target, linking to `/finance`.
4. **Award standings snapshot** — leading nominees across a few headline categories, linking to `/awards`.
5. **Student directory preview** — search bar, a handful of featured cards, linking to `/students`.
6. **FYB Week recap highlight** — a short teaser pulling from `/fyb-week`, since it's the most recently completed thing the class did together. Framed in past tense: what happened, not what's coming.
7. **Mangset memorial teaser** — short excerpt and portrait, linking to `/mangset`.
8. **Opportunities and footer** — a couple of live postings plus standard footer links.

---

## 9. Countdown System

**Single source of truth:** `data/config.json`. No date is hardcoded anywhere else in the codebase, including inside any component file.

**Live behavior:** recalculates every second on the client from the visitor's real current time to `targetDate`, showing days, hours, minutes, and seconds. This is a ticking value, not a static day count computed once at build time.

**Two states:**
- `targetDate` present (sign-out, live now): full ticking countdown.
- `targetDate` null (Dinner Night, today): a fully designed "Coming Soon" state, not a lesser fallback.

**A note on the exam timetable HTML you shared earlier:** that file has its own hardcoded dates for a different purpose (an exam schedule) and is not wired into this countdown system, since it's a separate design reference rather than a data source. If you want that exam schedule live on the site, scope it as its own small section rather than folding it into `data/config.json`.

---

## 10. Design System

**Color tokens**
- `--ink-950: #0B0B0D` primary background
- `--gold-500: #C9A24B` primary accent
- `--gold-300: #E8D28C` hover and highlight states
- `--plum-600: #4B2E5C` departmental purple, secondary accent
- `--paper-50: #F5F2EC` light text blocks and cards
- `--signal-green: #4CAF6D` funding progress only

**Type**
- Display face: a serif or slab with real weight, headings and the countdown
- Body face: a clean grotesk
- Data face: a monospace, for matric numbers, vote counts, and countdown digits

**Signature element:** a thin gold orbit ring, used as loading indicator, section divider, and countdown frame, consistently across every page.

**The countdown and `/fyb-week` get an extra design pass.** The countdown because it's the first thing a returning visitor checks: ticking digits, the gold orbit frame, a genuinely designed "Coming Soon" state, restrained and precise motion, never bouncy. `/fyb-week` because it's now a memory-keeping page rather than a utility page, so its photo layout deserves real editorial care, not a generic grid.

**Quality floor everywhere else:** responsive down to mobile, visible keyboard focus states, respect for reduced-motion preferences. Not optional polish, a baseline.

---

## 11. Content and Data Operations Workflow

**Award payment confirmed** → tell the agent, it edits `data/awards.json`, commits, pushes, Netlify redeploys automatically.

**Spreadsheet row changes** (student data or finance) → nothing to do. Both are fetched live through their Netlify Functions, so an edit shows up on next page load, within the 5-minute cache window.

**FYB Week photos or recap text arrive** → drop files into the matching `/assets/images/events/fyb-week/[day-folder]/`, update the `recap` field in `data/fyb-week.json`, tell the agent, it optimizes and indexes the images, commits, pushes.

**Dinner Night date confirmed** → tell the agent, it sets `dinnerNight.targetDate` in `data/config.json`, the countdown switches from "Coming Soon" to a live tick automatically.

**Student profile photo arrives** → drop it into `/assets/images/students/` named by matric number. Build matching handles the rest, flags anything unmatched.

---

## 12. Netlify Functions: Detail

Both functions follow the same pattern:
1. Read the target sheet ID from `data/config.json`.
2. Fetch `https://docs.google.com/spreadsheets/d/{sheetId}/gviz/tq?tqx=out:json`.
3. Strip the `google.visualization.Query.setResponse(` wrapper Google adds to that endpoint's response and parse the remaining JSON.
4. Transform rows into the clean shapes described in Sections 4.1 and 4.2.
5. Set `Cache-Control: public, max-age=300` so Netlify's edge caches the response for 5 minutes.
6. Return JSON to the frontend.

Neither function ever receives or needs a Google API key, since a published sheet's `gviz/tq` endpoint is public by design once the sheet is shared correctly. Confirm both sheets are shared as "Anyone with the link can view" so this endpoint resolves without an auth error.

---

## 13. Performance, SEO, and Accessibility

- Images from every `/assets/images/` folder go through Astro's built-in image optimization (responsive sizes, modern formats) rather than being served at raw upload resolution.
- Each page gets a real title and description, not a repeated site-wide default, especially `/students/[slug]` where the title should include the student's name.
- Every interactive element (search, countdown, gallery lightbox) is keyboard-operable and has a visible focus state.
- Motion respects `prefers-reduced-motion`, including the countdown's tick animation and the hero slideshow's auto-advance.
- Color contrast between gold text and the dark background gets checked against WCAG AA at minimum, not just eyeballed.

---

## 14. Always-On Skills

Applied across every phase, not selectively:

- **taste** — overall quality judgment on every screen shipped
- **impeccable** — execution polish, no rough edges left "for later"
- **front-end design** — visual and typography decisions, every page
- **nexus** — cross-page architecture and state consistency
- **ui-ux-promax** — interaction and usability quality
- **web accessibility** — keyboard, contrast, and screen-reader compliance, every component
- **emil-design-eng** — engineering-to-design handoff quality
- **21st.dev MCP** — component reference, always, every phase

---

## 15. Master Build Prompt for Google Antigravity

```
PROJECT: Quantum Plators Digital Platform (Department of Physics, University of Jos, Class of 2024)

ROLE: Act as lead engineer and design lead for this build, covering the complete specification below end to end.

ALWAYS-ON SKILLS, applied across every phase: the taste skill and the impeccable skill for overall quality judgment, the front-end design skill for visual and typography decisions, the nexus skill for cross-page architecture and state consistency, the ui-ux-promax skill for interaction and usability quality, the web accessibility skill for keyboard, contrast, and screen-reader compliance, and the emil-design-eng skill for engineering-to-design handoff quality. Always use the 21st.dev MCP for component reference, every phase.

STANDING DESIGN RULE: Every page must be neat, consistent, and deliberately designed. The countdown and the /fyb-week recap gallery each get an extra design pass beyond the rest of the site. The countdown needs ticking digits inside the gold orbit motif and a fully designed "Coming Soon" state for Dinner Night. /fyb-week needs genuine editorial photo layout, since it documents a completed event, not a utility listing.

AUTONOMY: Run setup, installs, and terminal commands yourself, end to end, without waiting for me to paste each one. Report what you ran and what happened after each phase.

FIRST ACTION: Create the full folder scaffold in Section 3 of the attached plan, then scan it and report exactly what already has content versus what is empty, before writing any page code.

STRICT DATA RULE: Nothing renders unless it is genuinely present in its source (spreadsheet, data/awards.json, or data/fyb-week.json). No placeholder text, no invented detail, no filler recap copy. Empty fields are omitted, not shown blank. The only allowed "not yet available" state is the Dinner Night countdown's designed "Coming Soon" state.

COUNTDOWN: Single source of truth is data/config.json, no hardcoded dates anywhere else. Recalculate live, every second, from the visitor's real current time. Sign-out targetDate is 2026-08-22T00:00:00+01:00, live now. Dinner Night targetDate is null until I provide a value.

STACK: Astro (hybrid rendering, on-demand for /students and /students/[slug]), Tailwind CSS, React islands only where interactivity is needed, Netlify Functions, deployed to Netlify with auto-deploy on push.

DATA SOURCES: exactly as specified in Section 4 of the attached plan, including the confirmed student sheet at 123L0bms0FDQcheS0O_46Nxc_XFj6-2xFXN7V2hvjsE4 and the finance sheet at 1q-1dAUPRYSgkHb1C4J2nk6BuToC7iNFkyqblSPZHsJo, both proxied through Netlify Functions with 5-minute server-side caching, never exposed client-side.

SITE MAP: Build exactly the routes in Section 6, including /fyb-week as a recap gallery for a completed event, not a forward-looking itinerary. No /admin route and no login anywhere on the public site.

HOMEPAGE: Build the 8 sections in Section 8, in that order.

STUDENT-NOMINATION LINKING: Match awards.json nominee names against the spreadsheet's Full Name column. Where matched, show a "Nominated For" section on that student's profile. Where unmatched, log it for review.

MEDIA MATCHING: Match files in /assets/images/students/ to spreadsheet rows by matric number in the filename. Flag any unmatched file rather than skipping it silently.

PERFORMANCE AND ACCESSIBILITY: Follow Section 13 of the attached plan exactly, including image optimization, per-page metadata, keyboard operability, and WCAG AA contrast at minimum.

DELIVERABLE PER PHASE: Build and deploy each phase, give me a live preview link, and update the "What's Missing" checklist based on what you actually found in the asset folders.
```

---

## 16. Phased Build Plan

**Phase 0** — Folder scaffold created and audited, Tailwind tokens, Netlify project connected, both Netlify Functions stubbed out, `data/config.json` in place, actual spreadsheet headers confirmed and mapped.
**Phase 1** — Core static shell: homepage with all 8 sections wired to whatever real data exists, Mangset memorial fully live off `/assets/images/prof`, the live per-second countdown working end to end with its design pass.
**Phase 2** — Live student directory and profile pages wired to the real spreadsheet, global nav search working, text-only cards where photos are missing.
**Phase 3** — `data/awards.json` seeded from the two flyers, `/awards` page live, nomination linking on profile pages.
**Phase 4** — `data/fyb-week.json` seeded, `/fyb-week` recap gallery live, empty-safe per day until real photos and recap text arrive.
**Phase 5** — Finance dashboard wired to the live sheet, homepage progress bar, `/finance` full breakdown.
**Phase 6** — Full `/gallery` page, slideshow wired up but empty-safe, opportunities board built the same way.
**Phase 7** — Full QA pass (mobile, keyboard, reduced motion, contrast), production deploy, final "What's Missing" report.

---

## 17. Still Open, Checklist

- Sign-out exact time on August 22, if it's more specific than midnight.
- Dinner and Awards Night date, once fixed.
- FYB Week: photos and videos for each of the six day folders, plus past-tense recap text for `data/fyb-week.json`.
- Homepage slideshow images.
- Student profile photos beyond what already exists for Mangset.
- Opportunities board content (real postings).
- Written Mangset tribute text, if it exists anywhere beyond the photos.
- Confirmation that both Google Sheets are shared as "Anyone with the link can view," required for the `gviz/tq` endpoint to work without an API key.
- Whether the exam timetable content should become its own small section on the site.
