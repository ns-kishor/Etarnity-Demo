# ETARNITY — Corporate Website Build Log

Shared worklog for all agents. Append your section after each task.

---

Task ID: 1
Agent: Main orchestrator (Z.ai Code)
Task: Foundation — design system, typography, content architecture, primitives, header/footer, hero + ETARNITY CORE canvas, stats, contact + API + Prisma, SEO.

Work Log:
- Searched the web for real ETARNITY data; no public entity found — content uses honest, restrained copy with TODO markers for real data (no fake awards/clients/metrics).
- Chose visual Direction D refined: deep black (`oklch(0.135 0.005 165)`) + ivory + muted emerald (`oklch(0.66 0.105 163)`) + subtle champagne (`oklch(0.78 0.075 88)`). Dark-only premium corporate identity.
- Typography: Inter (sans, `--font-inter`), Fraunces variable with opsz (editorial serif, `--font-editorial`, class `font-editorial`), JetBrains Mono (data/labels, `--font-mono-corp`, class `label-mono` / `font-mono`).
- Rewrote `src/app/globals.css` (full token set + utilities: `.label-mono`, `.hairline`, `.bg-noise`, `.bg-grid-faint`, `.rule-left`, `.scroll-area-corp`, `.text-emerald-corp`, `.text-champagne`, custom scrollbar, reduced-motion).
- Rewrote `src/app/layout.tsx`: fonts, full corporate SEO metadata, Organization JSON-LD, viewport theme color.
- Created `public/logo-mark.svg` (custom orbit-E mark) and generated `public/og.jpg` (1344x768 orbital core visual).
- Created `src/content/site.ts` — THE single source of truth for all copy (typed). Sections import from here: `hero`, `stats`, `whoWeAre`, `mission`, `vision`, `problems`, `businesses`, `ventures`, `industries`, `founders`, `people`, `technology`, `innovation`, `projects`, `impact`, `insights`, `insightCategories`, `news`, `careers`, `presence`, `contact`, `footer`, `site`, `navigation`.
- Created `src/components/primitives/corporate.tsx`: `Reveal` (scroll reveal w/ direction/distance/blur, respects reduced motion), `Stagger`/`StaggerItem`, `Counter` (rAF count-up), `SectionShell` (section wrapper w/ consistent container: max-w-[1280px] px-6 md:px-10 lg:px-14), `SectionHeading` (mono index champagne + kicker emerald + display title + lead), `Wordmark`.
- Created `src/components/layout/site-header.tsx` (fixed glass nav, scroll progress hairline, active section tracking, full-screen Menu overlay from `navigation.menuGroups`, escape/scroll-lock).
- Created `src/components/layout/site-footer.tsx` (5 link columns from `footer.columns`, giant ETARNITY signature, statement, legal).
- Created `src/components/sections/hero-visual.tsx` — the ETARNITY CORE: bespoke canvas 2D + manual 3D projection; nucleus + 5 inclined orbit rings + depth-shaded polylines + nodes with halos + dynamic inter-node connections + ambient dust + cursor parallax + scroll drift; DPR-capped, pauses offscreen/hidden, reduced-motion static frame.
- Created `src/components/sections/hero.tsx` (kicker, masked line-reveal headline with italic serif second line, CTAs, mono meta baseline, scroll cue, cinematic scroll exit).
- Created `src/components/sections/stats.tsx` (scale signals grid with Counter; serves as the canonical section exemplar).
- Created `src/components/sections/contact.tsx` (split layout: SectionHeading + channels; form with name/email/org/category Select/message; submit states; success panel; toast).
- Prisma schema extended: `ContactSubmission` (+ future-ready `Business`, `FounderProfile`, `Project`, `Article`, `JobOpening`); pushed with `bun run db:push`.
- Created `src/app/api/contact/route.ts` (zod validation, POST persists to SQLite, GET health).
- `src/app/page.tsx` interim: header + hero + stats + contact + footer inside `min-h-screen flex-col` wrapper (footer `mt-auto`).
- Added `src/app/sitemap.ts`, `src/app/robots.ts`.
- Dev server verified: GET / 200, fonts render, no compile errors.

Stage Summary:
- Design language locked: see globals.css + primitives/corporate.tsx. ALL sections MUST use SectionShell/SectionHeading/Reveal (or Stagger) and import copy from `@/content/site`.
- Section exemplar to follow: `src/components/sections/stats.tsx` (structure) and `contact.tsx` (form/interaction).
- Next: parallel section builds (Tasks 8-a..8-e), then integration in page.tsx (Task 9).
- Animation rules: subtle (12-28px movement), once:true reveals, no bounce, no glassmorphism cards, hover states via border-color/bg shifts. Icons: lucide-react only, size 4 (16px), stroke 1.5 default.
- Colors: emerald via `text-emerald-corp`/`bg-emerald-corp`, champagne sparse (indices, key nodes). No blue/indigo anywhere.

---

Task ID: 8-b
Agent: frontend-styling-expert
Task: Business ecosystem sections — Businesses (portfolio grid), Ventures & Investments (four modes), Industries (ecosystem map), Impact (commitments + honest closing).

Work Log:
- Read worklog, primitives (corporate.tsx), content module (site.ts), stats exemplar and globals.css before writing; confirmed tokens (emerald-corp/champagne/ivory), .label-mono, hairline-grid technique and section rhythm (py-20 md:py-28).
- Created `src/components/sections/businesses.tsx`: SectionShell id="businesses" + SectionHeading (index 06, inline framing strings per spec). Hairline grid (md:grid-cols-2, gap-px bg-border/60, cells bg-background) via Stagger/StaggerItem(as="article"). Cell anatomy: 12x12 bordered monogram (font-editorial, emerald, distinctive initial: T/D/M/L) + status pill with dot (Operating=emerald, Building=champagne, Early-stage=muted fallback), name (text-2xl ivory), industry (.label-mono), description, PURPOSE row (emerald mono label + italic quoted purpose in typographic quotes), footer mt-auto: relationship (mono /70) left + category tag (mono champagne) right. Conditional anchor only when url is non-null (all current urls are null → no dead links).
- Created `src/components/sections/ventures.tsx`: SectionHeading from `ventures` content (index 07). Four bordered panels (border border-border/60 rounded-sm, grid gap-4 md:grid-cols-2, p-6 md:p-7) instead of hairline grid per simplified spec; "Building" (id==="building") highlighted: border-emerald-corp/25 + bg-emerald-corp/[0.04] + "Focus today" emerald marker. Champagne mono mode numbers; per-item lists with Plus (highlighted) / ArrowUpRight (others) icons h-3.5 w-3.5 emerald, hairline top rule on lists. Hover: border-emerald-corp/40 + bg shift only.
- Created `src/components/sections/industries.tsx`: SectionHeading (index 08, inline framing). Ecosystem map: grid-cols-2 md:grid-cols-4 gap-px hairline grid, 8 cells bg-background p-5 hover:bg-card/50; stage marker row (dot + mono uppercase stage text: Operating=emerald, Building=champagne, Exploring=muted), name min-h-14 for alignment, 12.5px description. Below: legend row (three stage dots + mono notes) + closing italic font-editorial line "One ecosystem — each industry strengthens the others." in a border-t footer row.
- Created `src/components/sections/impact.tsx`: SectionHeading (serifTitle) from `impact` content (index 15). Six quiet panels (border border-border/60 rounded-sm p-6, md:2 / lg:3 cols, gap-4) each with one emerald lucide icon (Building2, Users, Compass, Network, Shield, Sprout mapped per area, h-4 w-4, aria-hidden), 15px title, 13.5px body. Closing statement block (border-t, py-8, md:flex baseline): mono champagne kicker "OUR STANDARD" + the honest "no numbers before they're real" line.
- Verified: `bunx eslint` on all 4 files → exit 0; `bunx tsc --noEmit` → no errors in these files (remaining project errors are pre-existing in examples/, skills/, layout.tsx).
- Did NOT touch page.tsx / globals.css / layout.tsx / primitives / header / footer / other agents' files.

Stage Summary:
- Files created: src/components/sections/businesses.tsx (export `Businesses`), src/components/sections/ventures.tsx (export `Ventures`), src/components/sections/industries.tsx (export `Industries`), src/components/sections/impact.tsx (export `Impact`).
- Section ids: businesses (06), ventures (07), industries (08), impact (15) — indexes align with the content module's numbering; aria-labels set on every SectionShell.
- All entity/area data strictly from `@/content/site` (`businesses`, `ventures`, `industries`, `impact`); only section framing strings are inline (as permitted by spec).
- Decisions: business monograms use the distinctive initial after "ETARNITY " (T/D/M/M→L) rather than a repeated "E"; status map includes an "Early-stage" muted fallback for future data; ventures uses bordered-panel grid (spec's simplified option) with the Building panel visually emphasized; icons mapped 1:1 to impact areas with modulo guard.
- Ready for Task 9 integration: import and place in order Businesses → Ventures → Industries (→ per surrounding plan) → Impact inside page.tsx.

---

Task ID: 8-a
Agent: frontend-styling-expert
Task: Company narrative sections — Who We Are, Mission, Vision, Problems.

Work Log:
- Read worklog, primitives (`corporate.tsx`), `content/site.ts`, stats exemplar, globals.css before writing; reused SectionShell/SectionHeading/Reveal language exactly.
- `who-we-are.tsx`: SectionHeading (index 02, no lead) → 12-col editorial grid. Left col-span-7: 3 profile paragraphs (first `text-xl md:text-2xl font-light text-ivory/90`, rest `text-[15px] text-muted-foreground`) as sequential Reveals (delay 0.1 + i*0.1). Right col-span-5 with `lg:rule-left lg:pl-10` (left col gets `lg:pr-14`, `lg:gap-0` so the hairline sits asymmetrically editorial): 4 pillars as `ul` → `Reveal as="li"` rows (`border-t border-border/60 py-6`, champagne mono id, ivory title, muted body), staggered 0.18 + i*0.08.
- `mission.tsx`: manual centered kicker (champagne index 03 + emerald label-mono, mirroring SectionHeading's structure since its title prop is required), then `mission.statement` as the display `h2` (font-editorial light, text-3xl→lg:text-[3.2rem], leading-[1.15]) inside `<Reveal blur>`; lead centered max-w-2xl; 3 focus blocks as md:grid-cols-3 with top hairlines + mono uppercase ivory titles; 4 principles as sm:grid-cols-2 quiet panels (`border border-border/60 rounded-sm p-5`, champagne id, hover border→emerald-corp/40 + bg-card/40); faint emerald radial glow (oklch /0.07, blur-2xl) behind statement, pointer-events-none, section `overflow-hidden`.
- `vision.tsx`: cinematic peak — centered kicker (04), statement at `text-3xl sm:text-4xl md:text-5xl lg:text-[4.2rem] leading-[1.08]` with `<Reveal blur duration={1.15}>` and py-16 md:py-24 whitespace. "global ecosystem" emphasized via `VisionStatement()` — deterministic indexOf split with plain-statement fallback (SSR/hydration-safe). Supporting paragraph centered. Horizon: `grid md:grid-cols-3 md:divide-x md:divide-border/60` + top hairline, champagne mono Near/Mid/Long labels, mobile rows stack via per-item border-t (first:border-t-0). Backgrounds: masked `bg-grid-faint` overlay (radial mask, fades at edges) + low-center emerald radial glow (oklch 0.42/0.14, blur-3xl); content wrapper `relative` so it paints above positioned overlays.
- `problems.tsx`: SectionHeading (serifTitle, index 05 + lead). 7 areas as an editorial ledger — `ul` of `Reveal as="li"` rows: `group grid gap-4 md:grid-cols-12 md:items-baseline border-t border-border/60 py-7 md:py-8`; columns 1/3/4/4 = champagne mono id, title (group-hover:text-emerald-corp), body, response block ("Our Response" mono label in text-emerald-corp/70 + text-foreground/80). Row hover: `hover:bg-card/40` + 2px padding settle (`px-4→px-[18px]`, `md:px-6→md:px-[26px]` via `transition-[padding,background-color]`), rows bleed with -mx-4/md:-mx-6, transform-free. Closes with `<div className="hairline" />` in a fade-only Reveal.
- All copy imported from `@/content/site` (no invented text beyond the brief-specified "Our Response" UI label). Semantic HTML: section/ul/li/h2/h3, ariaLabels set, headings text-balance, leads text-pretty. Icons: none needed.
- `bunx eslint` on the 4 files: exit 0, zero warnings. `bunx tsc --noEmit`: no errors in these files (remaining project errors pre-exist in examples/, skills/, layout.tsx).

Stage Summary:
- Files created (exports): `src/components/sections/who-we-are.tsx` → `WhoWeAre`; `src/components/sections/mission.tsx` → `Mission`; `src/components/sections/vision.tsx` → `Vision`; `src/components/sections/problems.tsx` → `Problems`.
- All four are `"use client"`, use SectionShell (ids: company / mission / vision / problems) with inner `py-20 md:py-28`, and reveal via Reveal only (14–24px movement, small delays) — no Stagger needed since `ul > Reveal as="li"` keeps valid list semantics.
- Decisions: mission & vision statements rendered as the section `h2` (display treatment + document outline) with manually built centered kickers, because SectionHeading requires a title prop and its left-aligned layout; mono champagne labels standardized at `text-champagne/80` to match the stats/SectionHeading exemplar; decorative radial/mask backgrounds use explicit oklch token values (Tailwind arbitrary values, spaces as underscores).
- Ready for page.tsx integration (Task 9) in order: hero → stats → WhoWeAre (company) → Mission (mission) → Vision (vision) → Problems (problems) → …

---

Task ID: 8-c
Agent: frontend-styling-expert
Task: People sections — Founders, People & Culture, Careers (3 section components, Task 8-c).

Work Log:
- Read worklog, primitives (corporate.tsx), content module (site.ts), stats.tsx exemplar, globals.css before writing; confirmed shapes: founders[2] (both linkedin null), people.values[6]/org[6], careers.openRoles EMPTY + emptyState + process[3].
- Created src/components/sections/founders.tsx: SectionShell id="founders" ariaLabel="The people behind ETARNITY" + SectionHeading (index "09", kicker "Founders", inline framing lead; person data from content module). Two panels lg:grid-cols-2 gap-4; each panel IS a Reveal (blur, 24px, duration 1.05, delay i*0.14 — the elegant founder reveal moment) carrying border border-border/60 rounded-sm p-6 md:p-8 flex col→row gap-7/9. Portrait: honest typographic monogram (initialsOf: "Ayaan Rahman"→AR, "Nafis Chowdhury"→NC) font-editorial font-light text-6xl text-emerald-corp on aspect-[4/5] frame with radial emerald tint + bg-card/40, role="img" + aria-label "Portrait placeholder for …", inner "PORTRAIT" mono caption aria-hidden. Body: name, emerald label-mono role, mono focus pills (rounded-full border-border), bio, italic serif blockquote with curly quotes + border-l-2 emerald rule, LinkedIn link ONLY when truthy (rendered null-safe — no fake links).
- Created src/components/sections/people.tsx: SectionHeading from people.* (serifTitle). Subsection A "HOW WE WORK": champagne label-mono sub-kicker + 6 values via Stagger grid sm:grid-cols-2 lg:grid-cols-3, quiet panels border border-border/60 rounded-sm p-5, hover = border-emerald-corp/40 + bg-card/40 shift. Subsection B "THE ORGANIZATION": champagne sub-kicker + inline intro "A deliberately small structure…" + 6 org rows as system map (Stagger rows: border-t border-border/60 py-4 grid sm:grid-cols-12 items-baseline group hover:bg-card/40; area sm:col-span-4 group-hover:text-emerald-corp; scope sm:col-span-7; ArrowRight h-3.5 w-3.5 text-emerald-corp/60 aria-hidden, sm:justify-self-end, hidden on mobile), closed with bottom hairline. No stock photography, no fake team photos.
- Created src/components/sections/careers.tsx: SectionHeading from careers.* (serifTitle). openRoles.length === 0 → honest empty state in dashed panel (border-dashed border-border/70 p-8 md:p-10 text-center): label-mono "OPEN ROLES", title/body from emptyState, CTA a[href=#contact] h-11 emerald-bordered bg-emerald-corp/10 hover:bg-emerald-corp/20 with ArrowUpRight h-4 w-4 aria-hidden. Below: "HOW WE HIRE" champagne sub-kicker + 3 process steps (champagne mono step numbers, border-t rules, stacked rows on mobile → md:grid-cols-3). Included a minimal quiet roles-row branch that activates automatically once openRoles has data (no invented data now).
- Verification: bunx eslint on the 3 files → clean (zero warnings/errors); bunx tsc --noEmit → zero errors in my files (remaining errors are pre-existing in examples/, skills/, src/app/layout.tsx); SSR smoke render (react-dom/server via temp bun script, deleted afterwards) → ids/aria/monograms/quotes/values/org/empty-state/CTA/process all assert true, no linkedin.com output.
- Design-system compliance: emerald accent via text-emerald-corp + border/bg-emerald-corp utilities; champagne SPARSE (sub-kickers + step numbers only); lucide-react icons h-4/h-3.5; borders border-border/60 with emerald/40 hover shifts; NO scale/rotate hover, no glassmorphism, no blue; semantic headings h2→h3, ul for chips/roles, aria-hidden decoratives; reduced-motion handled by Reveal primitives.

Stage Summary:
- src/components/sections/founders.tsx — export Founders (section id="founders").
- src/components/sections/people.tsx — export People (section id="people").
- src/components/sections/careers.tsx — export Careers (section id="careers").
- Decisions: org rows use sm:col-span-4/7/1 (scope 8→7, minor spec deviation) so the ArrowRight sits as its own right-aligned grid cell at sm+ instead of wrapping to a second row; arrow hidden below sm. Founder portrait = typographic monogram placeholder (photography later). careers has a dormant open-roles branch (renders nothing today) for future data. Vertical rhythm py-20 md:py-28 with default bordered shells, matching contact.tsx.
- Ready for Task 9 integration: import { Founders, People, Careers } from "@/components/sections/…"; place per section indices 09/10/18 (founders+people in the company block, careers before presence/contact).

---

Task ID: 8-e
Agent: frontend-styling-expert
Task: Build the Insights (knowledge platform), News (corporate timeline) and Presence (honest single-HQ) sections using the shared corporate primitives and content module.

Work Log:
- Read worklog.md, src/components/primitives/corporate.tsx, src/content/site.ts, stats.tsx exemplar and globals.css before writing anything; only created the 3 assigned files, touched nothing else.
- Created `src/components/sections/insights.tsx`: SectionHeading index "16" / kicker "Insights" / "How we think." + specified lead; interactive category filter row (real useState) — mono chips for "All" + `insightCategories`, `aria-pressed`, active = emerald border/tint, inactive = border-border muted with color/border hover shift; grid wrapped in `aria-live="polite"`; articles rendered as non-interactive `<article>` records (no fake URLs — no role=link, no cursor-pointer) with mono category/readTime top row, title (group-hover:text-emerald-corp), excerpt, `<time>` mono date footer + decorative ArrowUpRight (h-3.5 w-3.5, aria-hidden); honest mono empty state when a category has no pieces; no pagination.
- Created `src/components/sections/news.tsx`: SectionHeading index "17" / "ETARNITY updates." + specified lead; timeline ledger (not cards) — each item `Reveal as="article"` with border-t, `md:grid-cols-12` (date + champagne type pill in col-span-3, title/summary in col-span-9), `<time>` mono dates, sequential reveal delays (i * 0.08), closing bottom hairline.
- Created `src/components/sections/presence.tsx`: SectionHeading from `presence` content (serifTitle, index "19"); SectionShell with `bg-card/30 overflow-hidden` + absolute `bg-grid-faint` overlay masked with radial ellipse + faint emerald `bg-[radial-gradient(circle,oklch(...))]` glow behind the HQ card (both aria-hidden, pointer-events-none); left column mono definition list (`.label-mono` / mono ivory values, closing hairline); right column HQ coordinates card (`border-border/60 bg-background/60`): champagne mono kicker from `presence.hq.label`, large city, country, MapPin + coordinates in emerald mono, minimal 3-ring emerald radar with `animate-pulse` center dot; editorial italic closing line over `.hairline`.
- Verified: `bunx eslint` clean on all three files; `bunx tsc --noEmit` shows no errors in the new files (remaining project errors are pre-existing in examples/ and layout.tsx); additionally compiled globals.css through the project's Tailwind v4 postcss pipeline and confirmed the risky classes actually generate CSS (mask-image radial mask, oklch radial glow, champagne/emerald opacity utilities, inset-[17%], md:col-span-*, animate-pulse).

Stage Summary:
- Files created: `src/components/sections/insights.tsx` (export `Insights`), `src/components/sections/news.tsx` (export `News`), `src/components/sections/presence.tsx` (export `Presence`).
- All sections are "use client", wrapped in SectionShell (ids insights/news/presence with aria-labels) and take data exclusively from `@/content/site` named exports (`insights`, `insightCategories`, `news`, `presence`); hardcoded only the heading copy explicitly mandated by the brief (indices 16/17, titles, leads, presence closing line) since the content module has no heading wrappers for insights/news.
- Decisions: article cards are non-interactive records (no real URLs yet — ArrowUpRight purely decorative); title hover implemented via `group-hover` (hovering the card = the brief's hover:text-emerald-corp); the "Innovation" chip honestly produces the empty state; all decorative overlays (grid, glow, radar) are aria-hidden + pointer-events-none; radar scales h-16 → md:h-24 to avoid kicker overlap on narrow screens; right HQ card reveals direction="left", left column via SectionHeading's internal reveals + Reveal for the ledger.
- Next (Task 9 integration): import Insights/News/Presence into page.tsx in index order — insights (16) → news (17) → careers (18) → presence (19) → contact (20).

---

Task ID: 8-d
Agent: frontend-styling-expert
Task: Build the Technology, Innovation and Selected Work sections (3 files) for the ETARNITY corporate site.

Work Log:
- Read worklog.md, primitives (corporate.tsx), content (site.ts), stats.tsx exemplar, globals.css, plus businesses.tsx + hero.tsx to match established status-pill / useScroll / py-20 md:py-28 patterns.
- Created `src/components/sections/technology.tsx` — SectionShell id="technology"; full-bleed `bg-grid-faint` atmosphere overlay (pointer-events-none, radial mask fading edges, positioned against the section via static inner container) behind a `relative` content wrapper; SectionHeading from `technology` with serifTitle; 8 capabilities as a semantic `ul` hairline grid (`gap-px bg-border/60`, cells `bg-background` via Reveal as="li", emerald lucide icon above each title, hover:bg-card/50); "How we build" champagne mono sub-kicker row with hairline + "Idea → Scale" progress label; the 7-step pipeline as an `ol`: desktop = 7-column grid with per-li hairline connectors running node→node (terminating at "Scale", which uses champagne border/bg as the horizon) + mono 01–07 indices; mobile = vertical rail (`border-l` + absolutely-positioned nodes at -left-[5px]); both wrapped in Reveal with 0.08 delay after the kicker.
- Created `src/components/sections/innovation.tsx` — SectionShell id="innovation"; SectionHeading from `innovation` with serifTitle; 4 Labs tracks as Stagger/StaggerItem articles in `md:grid-cols-2 gap-4` bordered panels (hover: border-emerald-corp/40 + bg-card/50, no transform hovers); status pills exactly matching businesses.tsx (mono 10px uppercase pill + dot; Active = emerald, "In exploration" = champagne); lucide icons per track (BrainCircuit / Wrench / Lightbulb / Telescope — Toolbox is not exported by lucide-react 0.525, used Wrench per spec alternative); footer line with champagne "Labs Principle" kicker + italic font-editorial statement.
- Created `src/components/sections/selected-work.tsx` — SectionShell id="work"; SectionHeading (index 14, inline lead per spec); per-project internal `ProjectBlock` component using framer-motion `useScroll` (target ref, offset start-end→end-center) + `useTransform` for a 1px emerald progress hairline (origin-left scaleX, aria-hidden) on each block's top border; sticky identity column (`lg:col-span-5 lg:sticky lg:top-24 lg:self-start`: champagne index + muted year mono, text-3xl/4xl name, emerald label-mono sector, mono stack chips, conditional "View project" link w/ ArrowUpRight only when url is non-null — all current projects have url null so no dead links); narrative fields as a semantic `dl` in `lg:col-span-7` with mono emerald field labels and 4 Reveal rows (direction up, distance 20, delays 0/0.08/0.16/0.24, border-t rhythm between rows); mobile stacks naturally (no sticky below lg).
- Verified lucide-react 0.525 exports for every icon used; `bunx eslint` on all three files → clean; `bunx tsc --noEmit` → zero errors in my files (remaining errors are pre-existing in examples/, skills/, and layout.tsx from other agents); dev server still 200.

Stage Summary:
- Files created (only these 3, nothing else touched):
  - `src/components/sections/technology.tsx` — exports `Technology` (id="technology").
  - `src/components/sections/innovation.tsx` — exports `Innovation` (id="innovation").
  - `src/components/sections/selected-work.tsx` — exports `SelectedWork` (id="work").
- Decisions: pipeline connectors implemented as per-li absolute hairlines (grid, no gaps) so the line terminates exactly at the "Scale" horizon node instead of running past it; pipeline rendered as both "IDEA → SCALE" label and per-step mono 01–07 indices; "5 narrative fields" resolved as 4 dt/dd rows (Problem / The Idea / Design / Outcome) with technology rendered as chips in the identity column, matching the 4 given sequential delays; serifTitle applied to the Selected Work heading for chapter continuity (12–15 all serif); innovation status dot rendered for both statuses (bg-current colors) to match businesses.tsx pill anatomy.
- All copy (except the inline heading/lead explicitly allowed for Selected Work and the dictated "How we build" / "Labs Principle" micro-labels) imported from `@/content/site`.
- Ready for page.tsx integration (Task 9): import Technology, Innovation, SelectedWork — suggested order after ventures/businesses: technology → innovation → selected-work (ids: technology, innovation, work).

---
Task ID: 9-11 (integration, lint, browser verification)
Agent: Main orchestrator (Z.ai Code)
Task: Integrate all agent sections into page.tsx, renumber section indices to the final narrative order, lint, and end-to-end browser verification.

Work Log:
- Integrated all 20 sections into src/app/page.tsx in the PRD §44 journey order: Hero → Stats → WhoWeAre → Mission → Problems → Businesses → Ventures → Industries → Founders → People → Technology → Innovation → SelectedWork → Impact → Insights → News → Careers → Presence → Vision → Contact (+ footer).
- Renumbered section indices (content module + 6 hardcoded agent files) to a continuous 01–19 sequence matching page order; Vision moved to the pre-contact emotional peak (index 18).
- `bun run lint` → clean (zero errors/warnings).
- Agent-browser end-to-end verification (desktop 1440px + mobile 390px):
  - Page renders fully: all 18 section ids present with expected content (DOM check), 1 h1, 0 dead anchor links.
  - Hero: headline + italic serif accent + ETARNITY CORE canvas visual confirmed via VLM screenshot analysis; nav + CTAs correct.
  - Stats count-up grid, businesses 2x2 entity grid, founders panels, technology capabilities + Idea→Scale pipeline (Scale in champagne), selected work sticky blocks, insights grid — all render clean.
  - Contact golden path: filled form, selected "Partnership" category, submitted → POST /api/contact 201 → success panel + toast → row persisted in SQLite (verified via direct sqlite3 query: correct name/email/organization/category/status).
  - Insights filter: "AI" → 1 article; "Innovation" → honest empty state; "All" restore.
  - Menu overlay: dialog role, 18 links, scroll-lock while open, Escape closes + unlocks.
  - Nav anchor click → scrolls correctly; scroll progress hairline active.
  - Mobile: no horizontal overflow; hero/problems/contact all pass VLM checks.
  - Footer: 5 columns, giant ETARNITY signature, statement, legal, flush at bottom (mt-auto flex column).
  - No page errors in console or dev.log (only benign framer-motion container-position warning).

Stage Summary:
- The ETARNITY corporate website is complete and browser-verified end-to-end.
- All PRD sections implemented with honest content (TODO markers in src/content/site.ts flag placeholder data: founders, stats, projects, insights, news — replace with real company data there; no fake trust signals anywhere).
- Backend: Prisma ContactSubmission pipeline live (zod-validated POST /api/contact). Future-ready CMS models (Business, FounderProfile, Project, Article, JobOpening) already in schema.
- SEO: Organization JSON-LD, OpenGraph with generated og.jpg, sitemap.ts, robots.ts, semantic headings.

---
Task ID: 12
Agent: Main orchestrator (Z.ai Code)
Task: Convert the entire ETARNITY site UI to black & white (monochrome) per user request.

Work Log:
- globals.css: redefined every design token to zero-chroma grayscale — --emerald-corp → oklch(0.99 0 0) (pure white accent), --champagne/--accent → oklch(0.74 0 0) (light gray), base/background/card/border/muted/ivory all chroma 0; ring/focus → white; charts → grayscale ramp. Updated ::selection (inverted white-on-black), scrollbar, focus-visible, .label-mono, .hairline, .bg-grid-faint, .rule-left, .scroll-area-corp to neutral values. Token NAMES kept (emerald-corp/champagne/ivory) so all utility classes across 20+ components convert automatically. --destructive intentionally kept red (semantic error color).
- hero-visual.tsx (ETARNITY CORE canvas): renamed hue system to monochrome "tone" tiers (bright/soft/faint → TONES map: [245,245,245]/[172,172,172]/[210,210,210]); nucleus glow + shells + connections → white; dust + outer atmosphere ring → neutral gray; all green/champagne rgba values removed.
- Raw gradient neutralization: hero.tsx readability overlay rgba(10,13,11)→rgba(10,10,10); contact.tsx + founders.tsx emerald tints → white tints; mission.tsx/vision.tsx/presence.tsx oklch chroma gradients → grayscale; stale "emerald" comments updated.
- layout.tsx themeColor #0a0d0b → #0a0a0a. public/logo-mark.svg: E strokes #EDEEE8→#F2F2F2, orbit #5BBF8E→#FFFFFF, node #C9A86A→#ABABAB (favicon + header logo + schema logo now monochrome; logo.svg was already B&W).
- Fixed latent mobile defect found during verification: pre-reveal framer-motion transforms caused 8px horizontal overflow → added `overflow-x: clip` on body (user can no longer pan horizontally; sticky columns unaffected — verified).
- Verification: bun run lint clean (exit 0); agent-browser desktop 1440px + mobile 390px; VLM confirmed pure B&W with zero color tints across hero/stats/businesses/founders/technology/contact/footer/mobile/work; contact golden path re-verified (POST /api/contact 201, row persisted via Prisma); no console/page errors in dev.log.

Stage Summary:
- The ETARNITY site is now strictly monochrome: white = single accent, grays carry hierarchy, no chroma anywhere in UI, canvas visual, logo, or favicon.
- og.jpg (social preview image) is a raster asset and was NOT regenerated — it may still contain the old green tint; regenerate separately if needed.
- All token names unchanged, so future palette work is a single-file (globals.css) change.

---
Task ID: 13
Agent: Main orchestrator (Z.ai Code)
Task: Add dark mood / white mood toggle (next-themes) and professional polish pass.

Work Log:
- globals.css: split `:root,.dark` into a symmetric two-mood system — :root = WHITE MOOD (paper oklch(0.975) ground, ink 0.16 accent, graphite 0.44 metadata, card=white, border 0.885), .dark = DARK MOOD (previous black/white tokens). Added color-scheme light/dark, mood-scoped vars: --glow-faint/--glow-deep (decorative glows), --scrollbar-thumb(-hover), --hairline, --grid-line. Utilities now var-driven (label-mono, hairline, rule-left, bg-grid-faint, scrollbars, ::selection, :focus-visible); new .hero-vignette utility (paper wash light / ink wash dark). body: soft 0.4s bg/color cross-fade on mood change; overflow-x clip retained.
- layout.tsx: removed hardcoded html class="dark"; wrapped children in next-themes ThemeProvider (attribute="class", defaultTheme="dark", enableSystem=false, themes=[dark,light]). Favicon icons now media-split: logo-mark-light.svg (ink strokes, NEW file) for prefers-light, logo-mark.svg for dark.
- NEW src/components/theme-toggle.tsx — MoodToggle: segmented radiogroup (Moon/Sun, aria-checked, title labels "Dark mood"/"White mood"), framer-motion layoutId sliding indicator (spring 500/38, reduced-motion safe), bg-emerald-corp/12 active pill, mounted-guard against hydration mismatch, syncs meta[name=theme-color] (#0a0a0a/#f8f8f8) with resolvedTheme.
- site-header.tsx: MoodToggle integrated in right cluster (before Contact CTA); scroll-progress comment updated to "ink".
- corporate.tsx Wordmark: replaced <img logo-mark.svg> with inline currentColor SVG mark (mood-aware strokes: ink on white mood, white on dark; node at 0.55 opacity); text-ivory moved to the wrapping span.
- hero-visual.tsx: per-frame mood detection (documentElement.classList) + getPalette(dark) — white structure (bright 245/soft 172/faint 210/core 255) vs ink structure (26/128/64/17), mood-scaled glow alphas (0.14→0.06) and shell alphas; canvas repaints instantly on live toggle without remount.
- hero.tsx: vignette → .hero-vignette class; primary CTA hover → bg-emerald-corp/85 + text-primary-foreground (feedback in both moods). contact.tsx submit button same fix.
- Decorative glows converted to var(--glow-faint)/var(--glow-deep): mission, vision, presence, founders, contact (Tailwind arbitrary values with var() — no spaces).
- Verification: lint exit 0; agent-browser desktop+mobile. Default dark confirmed (html.dark, meta #0a0a0a, near-black body). Toggle→light: html.light, meta #f8f8f8, lab(97.1) paper body, canvas pixel-check shows ink strokes; VLM verified light hero/stats/founders/work/contact/footer — strict monochrome, excellent contrast, zero defects. Toggle→dark + reload: mood persists via localStorage. Mobile light: toggle reachable, no horizontal pan. Canvas pixel audit in dark: 1043/11470 bright pixels (rings/nodes drawing) + targeted VLM YES/YES. No console/page errors.

Stage Summary:
- Two-mood monochrome system live: dark (default, brand identity) and white — perfectly inverted palettes, zero chroma in both.
- Every surface adapts: tokens, canvas visual, logo, favicon, scrollbar, selection, focus rings, glows, vignette.
- MoodToggle = premium segmented control (radiogroup semantics, sliding spring indicator, meta theme-color sync, localStorage persistence).
- Note: og.jpg still the old green-tinted generated asset (not regenerated — not requested).

---
Task ID: 14
Agent: Main orchestrator (Z.ai Code)
Task: MachinaFusion redesign foundation — PRD "Ultra-Modern Minimalist UI Redesign" (new brand, light-first, floating capsules, kinetic scroll, GSAP+Lenis).

Work Log:
- Installed gsap@3.15.0, lenis@1.3.26, sharp@0.35.5.
- Generated 5 AI image assets (z-ai CLI) + cutout to transparent PNGs via custom sharp flood-fill script (scripts/ deleted after use): public/images/hand-human.png (900x389, fingers→right), hand-robot.png (900x505, fingers→right), device-1.png (440x1012), device-2.png (533x1034, regenerated once — first had sketch artifacts), device-3.png (405x988). All VLM-verified clean on light/dark/orange backgrounds. public/og.jpg regenerated (human+robot hands, 1344x768).
- Cutout pipeline lessons: sharp blur on 1-channel raw outputs 3 channels — sample channel 0; per-image background criteria (neutral-chroma for warm skin, near-white for white bg, neutral-gray≥128/90/55 tiers for soft drop shadows); despeckle removes enclosed white pockets; hole-close refills interior eaten regions.
- src/content/machina.ts — new single source of truth (nav, hero, tunnel, metrics 97%/12K/30+, stack+partners, newsroom (data-mapped from old news+insights), contact, footer). PRD marketing figures flagged as needing audit.
- globals.css REWRITTEN: MachinaFusion tokens — light mood default (#F4F4F6 ground, #111 ink, #FFF cards, #0A0A0C dark panels, #16C784 neon green accent, tunnel blue #38BDF8), dark mood full inversion; --radius 1.75rem (pills + 28px cards); utilities: display-hero/section/footer (Space Grotesk, -0.04em), label-tag (mono uppercase), glass-float, panel-dark, shadow-ambient(-lg)/panel, orb-*, status-dot (pulsing neon), holo-sphere/sheen, bg-noise, editorial-accent (Fraunces italic); scrollbar + selection + reduced-motion; legacy token names (emerald-corp→accent) kept mapped for transition.
- layout.tsx REWRITTEN: Inter + Space_Grotesk + Fraunces (editorial italic accents) + JetBrains_Mono; MachinaFusion SEO metadata, Organization JSON-LD, og.jpg; ThemeProvider defaultTheme="light" (PRD light-first; dark mood retained via toggle); favicon mf-mark.svg / mf-mark-dark.svg.
- src/components/providers/smooth-scroll-provider.tsx — Lenis (lerp 0.11) driven by gsap.ticker, ScrollTrigger.update on lenis scroll, reduced-motion opt-out, exports getLenis() + scrollToHash() (offset -96).
- src/components/machina/mf-primitives.tsx — shared language: LogoMark (inline currentColor SVG M+orbit+neon node), MfSection, Kicker (mono index+label+hairline), SectionTitle, Reveal (framer whileInView, blur+y, reduced-motion safe), FloatCard (28px white card ambient shadow), Pill, MonoLabel.
- src/components/layout/capsule-header.tsx — floating pill nav: fixed top-4 centered, glass-float + backdrop-blur(16), brand left / pill toggles center (layoutId spring active indicator, IntersectionObserver tracking) / status-dot "Available Positions" CTA right; mobile menu expansion panel; MoodToggle restyled round.
- src/components/theme-toggle.tsx — retokened for new palette (theme-color #f4f4f6/#0a0a0c, rounded-full).
- src/components/layout/mf-footer.tsx — oversized typography footer (display-footer sign-off with editorial-accent "human intuition", mission, Download/Recruits pills, domain, legal strip, mt-auto sticky-bottom semantics).
- public/mf-mark.svg + mf-mark-dark.svg — geometric M + orbit + green node favicon/logo.

Stage Summary:
- Full design system + layout shell live (light-first, dark mood inversion).
- Assets ready in public/images; old ETARNITY section files still on disk (unused after page swap — cleanup at integration).
- Next: Kinetic Hero (me, exemplar), then delegate tunnel/metrics/stack/newsroom+contact to frontend-styling-expert agents, then integrate page.tsx + verify.

---
Task ID: 16-a
Agent: frontend-styling-expert
Task: Dynamic Metrics & KPI grid section (PRD Section 4)

Work Log:
- Read worklog Task 14 foundation, mf-primitives, kinetic-hero exemplar, metrics content, globals tokens, tooltip — then built ONE new file.
- Created src/components/sections/metrics-grid.tsx exporting `MetricsGrid` ("use client"): MfSection id="metrics", Kicker index "02"/label metrics.kicker, Reveal + SectionTitle (metrics.title), 3 FloatCards in grid-cols-1 md:grid-cols-3 gap-4 md:gap-6, entrance stagger delay i*0.1 via shared Reveal.
- Number: GSAP count-up 0→value on ScrollTrigger once:true start "top 80%" (tween on a {v:0} object, onUpdate textContent, Math.round, power3.out 1.6s); text-6xl md:text-7xl font-display tracking-[-0.04em] tabular-nums leading-none, min-w-[2ch] so the suffix never shifts mid-count; suffix (%) in text-[var(--accent)] at text-4xl/5xl, baseline-aligned. Label text-[15px] font-medium muted-foreground.
- SSR-first animation strategy: JSX renders the FINAL state (real number, filled tracks) so no-JS/crawlers/reduced-motion see honest values; the motion branch (gsap.matchMedia "(prefers-reduced-motion: no-preference)") resets to zero and tweens back; cleanup + mm.revert() restore the server-rendered final state. Reduced motion = zero JS animation, fills render at final fill instantly.
- Pulse button: h-9 w-9 rounded-full border bg-card with .status-dot (green dot + pulsing halo, scale-150) inside; hover/open ring via shadow-[0_0_0_5px_var(--orb-neon)] + border-accent/50; aria-label "More about this metric: …", aria-expanded, aria-haspopup="dialog".
- Popover: framer-motion AnimatePresence, absolute above the button (bottom-full right-0, transformOrigin bottom right), rounded-2xl bg-popover border shadow-ambient-lg p-4 w-60, MonoLabel accent header + detail text-[12px] leading-relaxed. Closes on Escape (focus returns to trigger), on toggle, and on outside click — transparent fixed scrim portaled to document.body (z-10) PLUS a document-level pointerdown listener (needed because the shared Reveal leaves filter:blur(0px) which creates a stacking context; cards get relative z-20 via Reveal className so the panel z-30 stays above the scrim while the header z-50 stays clickable). Focus moves to the dialog on open (tabIndex -1, role=dialog, aria-modal=false) and restores to the button on close.
- Pill-slider track: vertical (md+, w-1.5 h-24 rounded-full bg-muted) and horizontal (mobile, h-1.5 w-full) variants, trackLabel in .label-tag at 10px (inline fontSize because .label-tag is unlayered CSS that beats layered Tailwind utilities), tracks aria-hidden with an sr-only "…track indicates N percent." description. Fill bar animates scaleX/scaleY (origin-left/bottom) 0→trackFill% in 1.2s power3.out on ScrollTrigger once; thumb dot (h-3 w-3 rounded-full bg-[var(--accent)] with var(--glow) shadow) rides the fill end via xPercent/yPercent of an inset-0 wrapper (percent-of-own-size trick — no px math, resize-safe). Card hover re-pulses cheaply: fill opacity-90→100 + thumb glow intensify (CSS transitions only).
- Verification: `bunx eslint src/components/sections/metrics-grid.tsx` → 0 errors/warnings (exit 0); `bunx tsc --noEmit | grep metrics-grid` → no matches (only pre-existing errors in examples/, skills/, layout.tsx); `curl localhost:3000/` → 200.

Stage Summary:
- File: src/components/sections/metrics-grid.tsx — export `MetricsGrid` (named). No other file touched.
- Integrator notes: import { MetricsGrid } from "@/components/sections/metrics-grid" and mount after the tunnel section (Kicker index "02" assumes tunnel is "01"). Popover scrim is z-10 at body level; metric cards carry z-20 on their Reveal wrappers — keep any fixed/sticky overlays at z-50+ (capsule header already is). Numbers are PRD marketing placeholders already flagged in src/content/machina.ts — no caveats rendered in UI.
- Deviations: shadcn tooltip not used (custom click-popover per recommendation); track label size 10px set via inline style instead of text-[10px] (cascade-layer precedence); outside-click = body-ported transparent scrim + document pointerdown listener (stacking-context-proof).

---
Task ID: 17
Agent: frontend-styling-expert
Task: Newsroom + Contact sections (MachinaFusion redesign, PRD Task 17)

Work Log:
- Read Task 14 foundation entry + mf-primitives, kinetic-hero exemplar, machina.ts content, globals.css tokens/utilities, /api/contact route contract, toast system, shadcn Input/Textarea/Label.
- Created src/components/sections/newsroom.tsx ("use client", export `Newsroom`): MfSection id="newsroom", Kicker "04 / News & Insights", SectionTitle "Signal over *noise*." (editorial-accent on "noise"), honest mono entry count. Category filter = pill chips built on the shared `Pill` primitive (as="button", aria-pressed; active = bg-primary text-primary-foreground border-transparent, inactive = border-border text-muted-foreground hover:text-foreground). Grid sm:grid-cols-2 lg:grid-cols-3 gap-4, aria-live="polite" + sr-only count announcement, lg:max-h-[32rem] lg:overflow-y-auto (PRD long-list rule; global custom scrollbar; mobile flows naturally). Cards = FloatCard hover + group (equal-height flex col): accent mono category tag + date, font-display lg title with hover text/slide shift, line-clamp-3 summary, optional readTime as dot + mono footer. Non-interactive records (no links, no cursor affordances). Honest empty state "Nothing in this lane yet." + mono tag. Entrance = Reveal stagger.
- Created src/components/sections/contact-machina.tsx ("use client", export `ContactMachina`): MfSection id="contact", Kicker "05 / Contact", SectionTitle "Introduce *yourself*." + contact.lead. Soft orb-neon glow behind section (aria-hidden, -z-10). lg:grid-cols-12 layout — LEFT col-span-7: form in FloatCard p-6 md:p-8; RIGHT col-span-5: channels dl (mono dt / value dd, Email = mailto link with accent hover) + panel-dark rounded-[22px] status card (status-dot, "Available positions", "We read every introduction — tell us what you want to build.").
- Form wiring: fetch POST "/api/contact" (relative), JSON {name,email,organization,category,message}; client validation mirrors the zod schema exactly (name ≥2, email regex, message ≥10, maxLength attrs 120/200/160/5000); per-field inline errors (aria-invalid + aria-describedby), focus first invalid field on failed validation. Category = real radiogroup (role="radiogroup"/role="radio", aria-checked, roving tabindex, Arrow/Home-free circular arrow-key nav, Tab+Enter/Space native). Submit = rounded-full bg-primary pill with Send icon, disabled + "Transmitting…" while pending. On 201: form replaced by success panel (check icon, contact.form.successTitle/successBody, mono "Received" tag, focus moved to panel via role="status" tabIndex=-1) + success toast; "Send another" restores form and focuses name input. On 422/500/network: inline role="alert" (contact.form.error) + destructive toast (description offers site.email). useToast from @/hooks/use-toast (Toaster already mounted in layout).
- Verification: eslint both files exit 0 (zero errors/warnings); tsc --noEmit → no errors in either file (pre-existing errors only in untouched examples/, skills/, layout.tsx); page still 200. POST endpoint NOT tested (orchestrator verifies golden path). All custom utilities cross-checked against a fresh Tailwind v4.3.3 CLI compile of globals.css (line-clamp-3, lg:max-h-[32rem], group-hover:translate-x-1, bg-accent/10, border-accent/40, text-panel-muted, divide-border, dark:bg-card, hover:shadow-lg/md, sr-only all generated; .editorial-accent retained by the compiler — dev-server CSS chunk currently serves a stale pre-07:49 transform that drops it, which equally affects the hero/Kicker; a dev-server restart/HMR catch-up resolves it and a production build includes it).

Stage Summary:
- Files: src/components/sections/newsroom.tsx (export `Newsroom`), src/components/sections/contact-machina.tsx (export `ContactMachina`). No other file touched.
- Integrator notes: import Newsroom and mount after the stack/metrics sections (Kicker index "04"; satisfies nav pill [News] → #newsroom) and ContactMachina last before footer (Kicker "05"; satisfies header CTA "Available Positions" + footer "Recruits" → #contact). Both are "use client". Form posts to the existing /api/contact with exact schema; no new API surface. Shared FloatCard/Pill/MfSection/Kicker/SectionTitle/Reveal/MonoLabel used as the design language; no GSAP needed (Reveal stagger only).
- Deviations: Pill primitive used for newsroom filter chips (as="button" — outside any form so default button type is safe); contact radio chips are plain buttons because Pill's prop type omits `type` and chips sit inside the form. Submit button hover uses hover:shadow-lg (guaranteed utility) rather than the custom shadow-ambient class (variants don't apply to plain CSS classes). Dev-server CSS staleness re: .editorial-accent is pre-existing, not caused by these files.

---
Task ID: 16-b
Agent: frontend-styling-expert
Task: Isometric product stack + partner wall section

Work Log:
- Read worklog (Task 14 foundation), mf-primitives, kinetic-hero exemplar, machina.ts stack content, globals.css tokens/utilities.
- Created src/components/sections/product-stack.tsx exporting ProductStack ("use client") — single file, no other file touched.
- Headline banner: Kicker (index "03", label stack.kicker) → SectionTitle "Touching [editorial-accent]tomorrow,[/] today" (mixed Space Grotesk / Fraunces italic) → muted lead max-w-xl, each in shared Reveal.
- Isometric architecture: stage div (relative h-[420px] md:h-[560px], [perspective:1400px], [transform-style:preserve-3d]). To reproduce CSS `rotateX(52deg) rotateZ(-38deg)` WITHOUT GSAP matrix-decomposition ambiguity, each device = wrapper (GSAP: xPercent/yPercent centering, rotationX 52, translateZ 0/90/180 via z) > inner plane (GSAP rotation -38) > next/image (natural 440x1012 / 533x1034 / 405x988, explicit width/height, drop-shadow filter). Nested Rx(Rz) == CSS transform:rotateX rotateZ — verified order math.
- GSAP matchMedia "(min-width: 768px) and (prefers-reduced-motion: no-preference)": scrub 0.5 timeline, trigger stage, start "top 80%" end "bottom 40%", invalidateOnRefresh. Fan-out: One x -fanX()/y -140 (upper-left), Lens x +fanX()/y +40 (right), Pod x 0/y +150 (lower-center); fanX() = clamp(110, 280, stageHalf - 230) as function value so md viewports never clip. Inner planes rotate -38 → -30 (readable screens), floor shadow scaleX 1→1.55, captions autoAlpha/y fade at t=0.72 of scrub (reversible — collapse hides them). Cleanup kills ScrollTrigger + timeline + clearProps:"all" (exemplar pattern).
- CSS-only branch switching (no JS race): stage = "hidden motion-safe:md:block", static flow = "md:motion-safe:hidden" — verified against compiled Tailwind 4.1.18 output that nested media variants AND correctly and cascade order beats base hidden/flex.
- Mobile/reduced-motion: vertical stacked-deck flow, images w-48 md:w-56 centered, -mt-4 overlap tuck, DeviceCaption (FloatCard rounded-[20px] p-4 max-w-[220px]: MonoLabel role / font-display name / copy) under each, plain Reveal fades. Device wrappers carry opacity-0 to suppress pre-hydration straight-on flash (gsap.set autoAlpha 1).
- Partner wall: border-t pt-10/12, MonoLabel label muted centered, minimalist pills (rounded-full border-border bg-card px-5 py-2.5 font-display text-sm tracking-tight muted → hover:text-foreground), aria-label "Partner ecosystem".
- Decorative layers (orbs, blurred elliptical floor shadow) aria-hidden + pointer-events-none; images have descriptive alt "Name — role".
- Verified: bunx eslint → 0 errors/warnings; bunx tsc --noEmit → no errors in product-stack.tsx (remaining project errors pre-exist in examples/, skills/, layout.tsx); curl / → 200; all component classes present in dev-served Tailwind CSS (incl. stacked motion-safe variants + [perspective:1400px]).
- Note: served CSS briefly lacked .editorial-accent due to a stale dev chunk; resolved after recompile — no action needed.

Stage Summary:
- File: src/components/sections/product-stack.tsx — export ProductStack (client). Integrator: import and place after Metrics, before Newsroom in page.tsx (`<ProductStack />`); section id="stack" matches nav "Explore AI" anchor.
- Deviations (tuned per spec's "tune so it reads as a fan-out"): device-3 fan y +260 → +150 (contained in 560px stage, avoids overlapping the partner wall hairline); desktop slab widths 172/196/168px; captions fade inside the same scrub (reversible) rather than once:true; mobile overlap -mt-4 (slight, avoids covering caption text).
- Refs for future tuning: LIFT / REST / FAN / CAPTION_POS arrays at top of file.

---
Task ID: 15-b
Agent: frontend-styling-expert
Task: 3D Tunnel Zoom showcase section

Work Log:
- Read worklog Task 14 foundation entry, mf-primitives, kinetic-hero exemplar (GSAP matchMedia + scrub + cleanup pattern), metrics-grid (SSR-first animation strategy), tunnel content, globals.css tokens.
- Created src/components/sections/tunnel-showcase.tsx exporting `TunnelShowcase` ("use client") — single file, no other file touched.
- Structure: MfSection id="tunnel" → Reveal(Kicker index "01" / tunnel.kicker) on the light ground → centered dark card: panel-dark + rounded-[32px] + shadow-panel + overflow-hidden + mx-auto, max-w-5xl lg:max-w-6xl, aspect-[4/5] sm:aspect-[4/3] md:aspect-[16/10] (mobile gets taller ratios so the overlay copy fits).
- Tunnel: stage div [perspective:900px] → rib wrapper [transform-style:preserve-3d] will-change-transform containing 16 concentric ribs. Each rib is an absolutely centered flat plane with inline `transform: translate(-50%,-50%) translateZ(-z px)` (z = 58×(i+1)); the browser's own projection supplies the receding scale (size × 900/(900+z)) — no manual scale math, and GSAP only ever animates the single wrapper. Ribs: 1-2px rgba(56,189,248,α) borders (α 0.5→0.14 with depth) + box-shadow glow (26/18px, α 0.22→0.06), opacity 0.92→0.14; the 3 nearest ribs are larger pill frames (88/84.5/81% of card, border-radius 48px, 2px border), deeper ribs 78% / 26px. All decorative layers aria-hidden + pointer-events-none.
- Rest state = fixed mid-zoom: wrapper carries literal Tailwind class [transform:translateZ(240px)] so mobile / reduced-motion / no-JS all render a mid-dive tunnel (nearest rib just breaking the card edges) with zero JS; the desktop GSAP branch overrides it inline.
- Vanishing point: blurred radial-gradient div (w-[38%] aspect-square, blur-2xl, z-[1]) that grows 0.7→1.25 scale + 0.5→1 opacity during the scrub; plus bg-noise 4% texture and a radial vignette (z-[2]) to deepen the black.
- Desktop scrub (gsap.matchMedia "(min-width: 768px) and (prefers-reduced-motion: no-preference)"): timeline scrub 0.5, trigger card, start "top 80%" end "bottom 30%". Flies the rib stack toward the viewer (wrapper z 0→480 — nearest rib projects ~0.94×→1.88×, sweeping past the frame), card scales 1→1.15, wrapper rotationX 2.5°→0 (depth-parallax tilt), glow grows. Overlay text appears DURING the scrub: h2 "NEXT GEN ENGINEERING" (font-display uppercase, clamp(2rem,5vw,4.5rem), tracking -0.02em, text-panel-foreground, dual blue/white text-shadow) is split into per-letter spans (words whitespace-nowrap, h2 md:whitespace-nowrap so the wide-tracking phase never wraps mid-scrub; aria-label carries the full title, letter spans aria-hidden); letters stagger in (autoAlpha+yPercent, stagger 0.03) while letter-spacing tweens 0.25em→-0.02em; subtext (max-w-md text-balance text-panel-muted) at t=0.45; the 3 bullets as mono pill tags (MonoLabel, border rgba(56,189,248,0.22), cyan dot bg-[var(--tunnel)] with glow) stagger at t=0.6. All initial states set via gsap.set inside the branch — markup defaults are fully visible (SSR/no-JS safe, no flash: section sits below the 210vh hero).
- Mobile / reduced-motion branch ("(max-width: 767px), (prefers-reduced-motion: reduce)"): fully static — no scrub, tunnel at the CSS mid-zoom, all text visible; reduced-motion returns immediately (zero animation); mobile gets a gsap.fromTo fade-up entrance (once:true, start "top 85%") matching the Reveal look. Cleanup everywhere: scrollTrigger kill + timeline kill + clearProps "all", mm.revert() on unmount — markup state always restored.
- Verification: `bunx eslint src/components/sections/tunnel-showcase.tsx` → 0 errors/warnings (exit 0); `bunx tsc --noEmit | grep tunnel-showcase` → no matches (pre-existing errors only in untouched files); `curl localhost:3000/` → 200. Bonus: dev-served Tailwind CSS chunk confirmed to contain every custom class (perspective: 900px, translateZ(240px), transform-style: preserve-3d, aspect 4/5 + 16/10, clamp(2rem,5vw,4.5rem), text-shadow stack, tunnel-blue gradients #38bdf8…, blur-2xl, white-space: nowrap, letter-spacing -.02em).

Stage Summary:
- File: src/components/sections/tunnel-showcase.tsx — export `TunnelShowcase` (named, "use client"). No other file touched.
- Integrator notes: `import { TunnelShowcase } from "@/components/sections/tunnel-showcase"` and mount FIRST in the section sequence (Kicker index "01" — Metrics is "02"), directly after KineticHero in page.tsx; section id="tunnel" satisfies the nav pill "Cutting-Edge Tech" → #tunnel. Plain (non-sticky) section; card scale 1.15 during scrub stays inside the section's py-20/28 padding, no neighbor overlap. All animation is transform/opacity only (compositor-friendly); ribs keep static CSS transforms — only one wrapper + card + glow are tweened.
- Deviations from the brief: (1) mobile card entrance is a gsap.fromTo fade-up inside the mobile matchMedia branch (the exemplar kinetic-hero's own mobile pattern) instead of the framer `Reveal` wrapper — wrapping the card in Reveal would double-animate on desktop (framer fades the whole card mid-scrub since its -80px trigger fires after the scrub's "top 80%" start); the shared Reveal IS used for the Kicker entrance, and the reduced-motion path is 100% static as specified. (2) FloatCard/SectionTitle intentionally unused — FloatCard is the white-card primitive (wrong surface for the dark panel) and SectionTitle's .display-section is unlayered CSS that beats layered Tailwind size overrides, so the in-tunnel h2 is hand-built with the exact clamp/tracking/glow the PRD specifies. (3) Card aspect is 4/5 → 4/3 → 16/10 across breakpoints (16/10-only would leave the overlay copy overflowing on small screens). (4) The 0.25em→tight letter-spacing tween is per-letter-staggered on a nowrap (md+) headline so the line count never snaps mid-scrub.

---
Task ID: 18 (integration + verification)
Agent: Main orchestrator (Z.ai Code)
Task: Integrate all sections into page.tsx, PDF asset, cleanup, lint, agent-browser end-to-end verification.

Work Log:
- page.tsx final structure: CapsuleHeader → KineticHero (#top) → TunnelShowcase (#tunnel, 01) → MetricsGrid (#metrics, 02) → ProductStack (#stack, 03) → Newsroom (#newsroom, 04) → ContactMachina (#contact, 05) → MfFooter (mt-auto sticky bottom).
- Generated public/MachinaFusion-Company-Snapshot.pdf via hand-rolled minimal PDF script (A4, Helvetica family, green accent bar + node dot): mission, metrics, hardware, ecosystem, contact; served 200 application/pdf; footer Download pill uses <a download>.
- sitemap.ts + robots.ts updated to machinafusiongroup.com.
- CLEANUP: deleted all 21 old ETARNITY section files + site-header/site-footer/corporate primitives + src/content/site.ts + old logo SVGs. prisma schema + /api/contact untouched (pipeline preserved).
- Fixed mobile horizontal overflow (scrollWidth 648→390): added overflow-x-clip to MfSection (decorative orbs extended past section bounds; tunnel ribs were already clipped by the card's overflow-hidden).
- bun run lint → exit 0, zero warnings.
- AGENT-BROWSER E2E (desktop 1440 + mobile 390):
  * Hero: headline/sphere/capsule-nav/callout/pills verified by VLM; hands converge on scroll (Creation of Adam), green spark at meeting point, clean cutouts both moods.
  * Tunnel: blue perspective rib tunnel zooms on scrub; "NEXT GEN ENGINEERING" per-letter assembly mid-scrub (confirmed intentional), FULL text + 3 cyan-dot bullets at scrub end.
  * Metrics: 97/12/30 count-up; pulse button opens "WHY IT MATTERS" popover; Escape closes (verified).
  * Stack: isometric fan-out + caption cards + partner pills verified.
  * Newsroom: AI filter → "Showing 1 of 6 entries" with the single AI article.
  * Contact GOLDEN PATH: filled form, category=Investment, submit → success panel "Transmission received" + row persisted (Prisma query: Ayaan Rahman / ayaan@machinafusiongroup.com / Investment / new).
  * Footer: oversized display type w/ italic "human intuition", mission, Download/Recruits pills, domain, legal strip, flush bottom.
  * Dark mode: html.dark, bg rgb(10,10,12), all sections adapt, hands/sphere/capsule clean (VLM verified); light default restored + persists via localStorage.
  * Mobile: hero fits, hands in static flow below headline, menu panel + anchor nav (newsroom top at 96px offset), no horizontal overflow (390=390), stack + footer clean.
  * Fonts loaded: Inter, Space Grotesk, Fraunces, JetBrains Mono (document.fonts).
  * Console clean (only benign LCP advisory for device-3.png); dev.log stale font error from a transient edit state — current compiles clean.
  * 1 h1, all 6 section ids, radiogroups/aria labels correct in a11y tree.

Stage Summary:
- MACHINAFUSION redesign COMPLETE and browser-verified end-to-end (light-first ultra-modern minimalist system, kinetic scroll, dark mood inversion, working contact pipeline).
- All PRD sections implemented: capsule header, kinetic hero, 3D tunnel, metrics, isometric stack + partners, oversized footer, + data-mapped newsroom/contact.
- Content honesty: metrics + partners are PRD-specified marketing figures (flagged in machina.ts + PDF footnote); newsroom items adapted from prior site content.
- Known advisory: Next Image LCP hint for device-3.png (below fold, advisory only).
