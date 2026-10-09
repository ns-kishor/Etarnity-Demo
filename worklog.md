# ETARNITY — Shared Worklog

Project: ETARNITY corporate website (single-route SPA at `/` with hash-based routing, per sandbox constraint).
Stack: Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn/ui, framer-motion, Prisma+SQLite, three.js (installed: three@0.186, @react-three/fiber@9, @react-three/drei@10).

---
Task ID: 1
Agent: orchestrator (main)
Task: Foundation — dependencies, config, database schema, shared libs, contracts

Work Log:
- Installed three, @react-three/fiber, @react-three/drei via bun.
- next.config.ts: added allowedDevOrigins for *.space-z.ai.
- layout.tsx: ETARNITY metadata (title template, OG, twitter), Geist Sans/Mono fonts kept, viewport themeColor #15171B.
- app/icon.svg: orbit-mark favicon.
- prisma/schema.prisma: full schema (Role, User, Session, CompanyProfile, Principle, Milestone, TechnologyArea, JobPosition, Business, Project, ProjectAsset, Person, Article, MediaItem, ContactInquiry, SiteSetting, AuditLog). Pushed with db:push.
- src/lib/types.ts: ALL shared API types (single source of truth — import from here, never redefine).
- src/lib/password.ts: scrypt hash/verify + generateToken.
- src/lib/auth.ts: session cookie auth (httpOnly `etarnity_session`), requireAdmin(req, minRole), AuthError, authErrorResponse(), audit().
- src/lib/rate-limit.ts: in-memory sliding window rateLimit(key, limit, windowMs) + getClientIp(req).
- src/lib/storage.ts: db/uploads storage — saveUpload(file), readUpload(key), deleteUpload(key), MAX 5MB, allowed: png/jpeg/webp/gif/svg.
- src/lib/queries.ts: server data access with serializers — getCompanyProfile, getPublishedBusinesses, getBusinessBySlug, getPublishedProjects, getProjectBySlug, getPublicPeople, getPersonBySlug, getPublishedArticles, getArticleBySlug, getTechnologyAreas, getJobPositions, getHomePayload. Use these in API routes AND server components.

Stage Summary:
- Database ready and pushed. Shared libs complete. Types are the contract — see below.

---

## ARCHITECTURE CONTRACTS (all agents must follow)

### Route constraint
ONLY `/` exists (src/app/page.tsx). ALL "pages" are client components under `src/components/site/pages/` switched by a hash router (`#/company`, `#/businesses/slug` …). Admin lives at `#/admin` (its own full-screen chrome, no public header/footer).

### File ownership map (DO NOT edit files you don't own)
- orchestrator: src/lib/* (done), prisma/*, src/app/layout.tsx, src/app/icon.svg, next.config.ts
- 2-a: src/app/page.tsx, src/app/globals.css, src/lib/router.tsx, src/hooks/use-api.ts, src/components/site/{header.tsx, footer.tsx, mobile-nav.tsx, logo.tsx, page-header.tsx, section.tsx, reveal.tsx, status-chip.tsx, states.tsx}, src/components/site/pages/*.tsx (STUBS only — 3-a/3-b will overwrite), src/app/robots.ts, src/app/sitemap.ts
- 2-b: src/components/site/chrome-orbit.tsx (+ index in same file only)
- 2-c: src/app/api/**/route.ts (all API routes)
- 3-a: src/components/site/pages/{home.tsx, company.tsx, mission-vision.tsx, technology.tsx}
- 3-b: src/components/site/pages/{businesses.tsx, business-detail.tsx, work.tsx, project-detail.tsx, people.tsx, person-detail.tsx, insights.tsx, article-detail.tsx, careers.tsx, contact.tsx, privacy.tsx, terms.tsx, not-found.tsx}
- 4: src/components/admin/** (all admin files)

### Router contract (2-a implements, all pages use)
```tsx
// src/lib/router.tsx — "use client"
export interface RouteState { path: string; segments: string[] } // path like "/businesses/etar-ai", segments=[...parts]
export function useRouter(): { path: string; segments: string[]; navigate: (to: string) => void }
export function Link({ to, children, className, ...rest }: { to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) // renders <a href={`#${to}`}>
```
Routes (App in page.tsx matches):
- `/` HomePage · `/company` CompanyPage · `/company/mission-vision` MissionVisionPage
- `/businesses` BusinessesPage · `/businesses/:slug` BusinessDetailPage (prop slug)
- `/technology` TechnologyPage · `/work` WorkPage · `/work/:slug` ProjectDetailPage (prop slug)
- `/people` PeoplePage · `/people/:slug` PersonDetailPage (prop slug)
- `/insights` InsightsPage · `/insights/:slug` ArticlePage (prop slug)
- `/careers` CareersPage · `/contact` ContactPage · `/privacy-policy` PrivacyPage · `/terms` TermsPage
- `/admin...` AdminApp — renders standalone (no header/footer)
- fallback NotFoundPage
Each page component signature: `export default function XPage() {}` or `({ slug }: { slug: string })`.
Page transitions: framer-motion AnimatePresence fade+8px rise, 0.35s. Scroll to top on route change. Update document.title per route (e.g. "Company — ETARNITY").

### Data hook contract (2-a implements in src/hooks/use-api.ts)
```tsx
export function useApi<T>(url: string | null): { data: T | undefined; loading: boolean; error: string | null; refresh: () => void }
```
Simple in-memory cache Map keyed by url, dedupes in-flight fetches, `url: null` = idle. Pages call e.g. `useApi<Business[]>("/api/public/businesses")`.

### API contract (2-c implements; endpoints return JSON; errors: { error: string })
PUBLIC:
- GET /api/public/company → CompanyProfile
- GET /api/public/businesses → Business[]
- GET /api/public/businesses/[slug] → Business | 404
- GET /api/public/projects → Project[]
- GET /api/public/projects/[slug] → Project | 404
- GET /api/public/people → Person[]
- GET /api/public/people/[slug] → Person | 404
- GET /api/public/articles → Article[]
- GET /api/public/articles/[slug] → Article | 404
- GET /api/public/technology → TechnologyArea[]
- GET /api/public/careers → JobPosition[]
- POST /api/public/contact (body ContactFormPayload) → { ok: true } | 400 { error } | 429
- GET /api/media/[id] → image file (from db/uploads, content-type from DB, Cache-Control immutable)
ADMIN (require session; mutations check Origin):
- POST /api/admin/login { email, password } → sets httpOnly cookie `etarnity_session`; { user: AdminUser } | 401 (rate limited 5/15min per ip+email)
- POST /api/admin/logout → { ok: true }
- GET /api/admin/me → { user: AdminUser } | 401
- GET /api/admin/dashboard → DashboardStats
- GET /api/admin/businesses → Business[] (all, incl. unpublished) · POST {fields} → created
- PUT /api/admin/businesses/[id] {fields} → updated · DELETE → { ok }
- GET /api/admin/projects → Project[] · POST → created · PUT/DELETE /api/admin/projects/[id]
- GET /api/admin/people → Person[] · POST → created · PUT/DELETE /api/admin/people/[id]
- GET /api/admin/articles → Article[] (all statuses) · POST → created · PUT/DELETE /api/admin/articles/[id]
- GET /api/admin/media → MediaItem[] · POST (multipart "file") → MediaItem · PUT /api/admin/media/[id] { altText } · DELETE
- GET /api/admin/inquiries → ContactInquiry[] · PUT /api/admin/inquiries/[id] { status?, internalNotes? } · DELETE
- GET /api/admin/company → { profile, principles, milestones } · PUT /api/admin/company { profile fields, principles[], milestones[] } (replace-all strategy)
- GET /api/admin/users → AdminUser[] · POST { name, email, password, role } · PUT /api/admin/users/[id] { name?, email?, role?, status?, password? } · DELETE (SUPER_ADMIN only; cannot delete self)
Business/Project/Person/Article create/update bodies use the public type shapes (logo/cover/portrait as `logoMediaId?: number`, `coverMediaId?: number`, `profileMediaId?: number`, `authorId?: number`; stack/expertise/requirements/links as arrays — routes serialize to JSON strings).
Role guards: content entities → CONTENT_MANAGER; users → SUPER_ADMIN; inquiries/media → CONTENT_MANAGER; VIEWER read-only.
Every admin mutation writes audit() entries.

### Design system spec (bind to this exactly)
Colors (use hex directly or the tokens 2-a defines in globals.css):
- Page bg #F8F8F6 (warm white) · ink #15171B (deep graphite) · secondary text #646B76
- Hairlines/borders #E8E9EC · card bg #FFFFFF · dark sections #15171B (text #F8F8F6, secondary on dark #A6ACB8)
- Electric blue accent #526BFF (sparingly: eyebrows, links, focus rings, small dots) · periwinkle #AAB7FF (dark-section accents/glows)
- Tailwind 4: 2-a adds to @theme: `--color-electric:#526BFF; --color-periwinkle:#AAB7FF; --color-graphite:#15171B; --color-warmwhite:#F8F8F6; --color-hairline:#E8E9EC; --color-ink-soft:#646B76; --color-ink-dark-soft:#A6ACB8;` → utilities like text-electric, bg-graphite etc. Keep existing shadcn vars mapped to this palette (background #F8F8F6, foreground #15171B, primary #15171B, secondary #E8E9EC, muted #E8E9EC, muted-foreground #646B76, border #E8E9EC, ring #526BFF, card #FFFFFF).
Typography (Geist Sans/Mono already loaded via layout.tsx as --font-geist-sans / --font-geist-mono):
- Eyebrow/labels: font-mono text-[11px] uppercase tracking-[0.22em] text-electric, format "01 / SECTION"
- H1: text-4xl sm:text-5xl lg:text-[4.25rem] font-semibold tracking-[-0.03em] leading-[1.04]
- Section H2: text-3xl md:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1]
- Body/lede: text-base md:text-lg leading-relaxed text-[#646B76]
- Container: `mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-12`
- Sections: py-20 md:py-28, separated by border-t border-hairline
- Cards: rounded-xl border border-hairline bg-white, hover: -translate-y-0.5 + shadow-[0_12px_40px_rgba(21,23,27,0.07)] transition
- Buttons: primary `rounded-full bg-graphite px-6 py-3 text-sm font-medium text-white hover:bg-[#23262D]`; outline `rounded-full border border-hairline bg-white px-6 py-3 text-sm hover:border-graphite`; on dark: bg-white text-graphite hover:bg-[#E8E9EC]; text-link: text-electric underline-offset-4 hover:underline
- Motion (Reveal component): initial {opacity:0, y:16} whileInView {opacity:1,y:0}, viewport {once:true, margin:"-80px"}, transition {duration:0.6, ease:[0.22,1,0.36,1]}; stagger 0.08s
- Focus: focus-visible:ring-2 ring-electric ring-offset-2 ring-offset-warmwhite
- Reduced motion: respect prefers-reduced-motion in framer (useReducedMotion) and Chrome Orbit
- Status chips (StatusChip component): rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em]; ACTIVE=emerald-700 border-emerald-700/25 bg-emerald-50; IN_DEVELOPMENT=text-electric border-electric/25 bg-electric/[0.06]; PLANNED=#646B76 border-hairline bg-white; LIVE=emerald like ACTIVE; DRAFT=#646B76 dashed border; ARCHIVED=neutral dashed; EXPERIMENT=violet-700 border-violet-700/25 bg-violet-50; DEMONSTRATION=#B45309 border-amber-600/25 bg-amber-50; INTERNAL_PRODUCT=#0E7490 border-cyan-700/25 bg-cyan-50; CLIENT_PROJECT=#6B7280…
- Long lists: max-h-96 overflow-y-auto with custom thin scrollbar (2-a adds global scrollbar CSS)

### Copy tone
Concise, professional, honest. No fabricated metrics/testimonials. Statuses labeled truthfully. Company: ETARNITY, founded 2025, HQ Dhaka, Bangladesh. Tagline: "Building What Comes Next."

---
Task ID: 2-a
Agent: general-purpose
Task: Design system foundation + SPA application shell (globals.css tokens, hash router, useApi, site primitives, header/mobile-nav/footer chrome, app shell with route switching, stub pages, admin stub, robots/sitemap)

Work Log:
- globals.css: rewrote with ETARNITY palette (shadcn vars bound to #F8F8F6/#15171B/#E8E9EC/#526BFF ring, --radius 0.75rem; .dark inverted graphite) + custom tokens in @theme inline (electric/periwinkle/graphite/warmwhite/hairline/ink-soft/ink-dark-soft → utilities like text-electric, bg-graphite, border-hairline). Added: Geist font-feature-settings ("ss01","cv11") on body, electric ::selection (20%), global :focus-visible outline 2px #526BFF, thin custom scrollbar on .overflow-y-auto (8px, #C9CDD4 thumb), `.container-site` (max-w 1440px, px-6/sm:8/lg:12) in @layer components, prefers-reduced-motion global kill-switch.
- IMPORTANT FIX: added `font-sans` to the base body rule — Tailwind v4 resolves --default-font-family at :root where next/font's --font-geist-sans (declared on <body>) doesn't exist, so body text silently fell back to system-ui. Verified Geist now loads/renders.
- router.tsx: useRouter {path,segments,navigate} (state seeded "/" → SSR-safe, syncs real hash post-mount), Link (hash anchor, full anchor-props passthrough), useRouteActive (exact "/", prefix match otherwise), document.title updates via map + longest-prefix fallback for detail routes ("/businesses/x" → "Businesses — ETARNITY").
- use-api.ts: useApi<T>(url|null) with module-level Map cache + in-flight dedupe, refresh() bypasses cache, non-2xx reads { error } json or statusText. `url: null` = idle.
- Primitives: Logo (orbit mark from icon.svg with useId-unique gradient + wordmark, variant light/dark), Reveal (fade-up 16px/0.6s/EASE, whileInView once -80px, useReducedMotion → renders static tag; exports EASE tuple), Section (container-site, py-20/28, bordered?, dark?, asymmetric header), PageHeader (pt-28/36 pb-14/20, mono electric eyebrow, h1 4xl→3.5rem, lede, backTo, Reveal stagger), StatusChip (dot+label mapping: ACTIVE/LIVE/PUBLISHED/RESOLVED emerald · IN_DEVELOPMENT/SCHEDULED/NEW/IN_PROGRESS electric · PLANNED neutral · DRAFT/ARCHIVED dashed · EXPERIMENT/PERSONAL_PROJECT violet · DEMONSTRATION/MAINTENANCE amber · INTERNAL_PRODUCT cyan · CLIENT_PROJECT/PARTNER #6B7280 solid · neutral fallback), states.tsx (LoadingState 3 pulse rows / ErrorState AlertTriangle+retry / EmptyState dashed card).
- Chrome: Header (sticky, transparent→bg-warmwhite/85+blur+hairline after 8px scroll, nav w/ electric active dot + aria-current, Contact pill, skip-link, 44px menu button), MobileNav (fixed graphite overlay, AnimatePresence, 01–06 mono-index big links stagger 0.05s, Contact pill, bottom tagline bar, X close autofocus + focus restore + Escape + scroll lock), Footer (graphite, 12-col grid: brand/EXPLORE/BUSINESSES via useApi with "Ecosystem forming" fallback/CONNECT, bottom © bar).
- app.tsx SiteApp: Header + <main id="main-content"> + Footer flex shell; AnimatePresence mode="wait" keyed motion.div (opacity+y 8, 0.3s in / 0.18s out); scroll-to-top on path change; AdminApp standalone for /admin*; exact static routes + first-segment slug matching; NotFound fallback.
- 17 stub pages created (3-a/3-b overwrite): all PageHeader + centered EmptyState; home stub renders eyebrow "ETARNITY / TECHNOLOGY COMPANY" + "ETARNITY — Building What Comes Next." hero using company overview from initialData.
- admin-app.tsx stub (agent 4 replaces), page.tsx (thin server → getHomePayload → SiteApp), robots.ts + sitemap.ts (single entry).
- Removed leftover template public/robots.txt — it conflicted with src/app/robots.ts and 500'd /robots.txt.
- Verified: lint clean, dev.log clean, browser-tested every route + deep links + titles + mobile nav (open/link/Escape) + admin + 404 + active states + computed styles (body #F8F8F6/#15171B, eyebrow #526BFF, sticky header, Geist + Geist Mono loaded).

Stage Summary:
Design system + SPA shell complete and verified in-browser. /api/public/businesses currently 404s (2-c pending) — footer + useApi degrade gracefully.

FINAL EXPORT SIGNATURES (rely on these):

Router — src/lib/router.tsx ("use client"):
- export interface RouteState { path: string; segments: string[] }
- export function useRouter(): { path: string; segments: string[]; navigate: (to: string) => void }
- export function Link({ to, ...rest }: { to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) — also default export
- export function useRouteActive(target: string): boolean

Data — src/hooks/use-api.ts:
- export function useApi<T>(url: string | null): { data: T | undefined; loading: boolean; error: string | null; refresh: () => void }

Components — src/components/site/ (named exports; logo/reveal/section/page-header/status-chip/header/footer/mobile-nav also have default exports):
- Logo({ variant?: "light" | "dark"; withWordmark?: boolean; className?: string; onClick?: () => void })
- Reveal({ delay?: number; as?: keyof React.JSX.IntrinsicElements; className?: string; children?: React.ReactNode }) · export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
- Section({ eyebrow?: string; title?: string; lede?: string; dark?: boolean; bordered?: boolean; id?: string; className?: string; children?: React.ReactNode })
- PageHeader({ eyebrow: string; title: string; lede?: string; backTo?: { to: string; label: string }; className?: string })
- StatusChip({ status: string; className?: string })
- LoadingState({ label?: string; className?: string }) · ErrorState({ message?: string; onRetry?: () => void; className?: string }) · EmptyState({ title: string; description?: string; icon?: React.ReactNode; className?: string }) — states.tsx named exports only
- Header() · Footer({ email?: string }) · MobileNav({ open: boolean; onClose: () => void }) — controlled by Header, do not mount yourself
- export default function SiteApp({ initialData }: { initialData: HomePayload }) — app.tsx (import type HomePayload from "@/lib/queries", type-only)

Pages — src/components/site/pages/*.tsx (all default exports; 3-a owns home/company/mission-vision/technology, 3-b owns the rest):
- HomePage({ initialData }: { initialData: HomePayload })
- CompanyPage() · MissionVisionPage() · TechnologyPage() · BusinessesPage() · WorkPage() · PeoplePage() · InsightsPage() · CareersPage() · ContactPage() · PrivacyPage() · TermsPage() · NotFoundPage()
- BusinessDetailPage({ slug }: { slug: string }) · ProjectDetailPage({ slug }: { slug: string }) · PersonDetailPage({ slug }: { slug: string }) · ArticlePage({ slug }: { slug: string })  ← article-detail.tsx

Admin — src/components/admin/admin-app.tsx: export default function AdminApp() (agent 4 replaces entire file)

CSS tokens available as utilities: text-electric/bg-electric/border-electric(/25,/[0.06]), text-periwinkle, bg-graphite, text-graphite, bg-warmwhite, text-warmwhite, border-hairline, text-ink-soft, text-ink-dark-soft, plus .container-site. Body already bg-warmwhite text-graphite font-sans.

Deviations from spec (all minor, noted for transparency):
1. body rule includes `font-sans` (spec only said bg/text) — required to actually apply Geist (see fix above).
2. Reveal under prefers-reduced-motion renders the plain tag with className (not literally unwrapped children) to avoid layout shift.
3. Footer takes optional email prop (defaults hello@etarnity.com); SiteApp passes company.contactEmail when present.
4. Logo takes optional className/onClick (used by MobileNav); Section border-t is opt-in via `bordered` prop (default false) so pages control separators and avoid doubled hairlines under PageHeader.
5. StatusChip adds extra mappings beyond the listed ones (MAINTENANCE, PUBLISHED/SCHEDULED, NEW/IN_PROGRESS/RESOLVED, PERSONAL_PROJECT) with a neutral fallback — safe supersets for admin reuse.
6. Removed template public/robots.txt (conflicted with src/app/robots.ts → 500 on /robots.txt).

---
Task ID: 2-b
Agent: general-purpose
Task: Chrome Orbit component (hero signature 3D visual)

Work Log:
- STEP 0: attempted `bunx --bun shadcn@latest add @reactbits-starter/chrome-orbit-tw` — failed (registry not configured for reactbits). Fell through to hand-implementation as planned; no files were added by the attempt.
- Built `src/components/site/chrome-orbit.tsx` (only file created/owned): full React-Bits-style chrome gyroscope on three@0.186 / @react-three/fiber@9 / @react-three/drei@10.
- Scene: central chrome sphere r=1 (48×48, physical mat #d7dce5, metalness 1, roughness .08, clearcoat 1/.1, envMapIntensity 1.6); 4 torus bands R 1.45/1.75/2.05/2.35, tube = R × bandWidth; chrome #c9cdd6, metalness 1, roughness .15, envMapIntensity 1.4. Each band in its own group with distinct static tilt (±0.30–0.95 rad combos around x/y/z — no two coplanar; verified pairwise normal angles 21.7°–72.5°).
- Satellites on bands 2–4 (1/1/2, r .06–.07): constant angular speeds 0.25–0.42 rad/s, mixed directions; exactly ONE electric-blue accent (#526BFF, emissive #526BFF, intensity 2.2) on band 3; others chrome.
- Band animation: each assembly slowly rotates around one of its local axes (speeds 0.06–0.15 rad/s, alternating signs). STRUCTURE NOTE: animated spin group wraps the static tilt group (world = Spin·Tilt). With the spec's exact camera (z 6.4, fov 38 → half-height 2.204) the outer ring (reach 2.56) would clip top/bottom at some orientations if rings tumble in-plane; spin-outer/tilt-inner makes the three outer bands precess at constant inclination (gyroscope look) — verified numerically across all spin×idle×pointer angles: max vertical reach 2.128 < 2.204. The inner band tumbles around x (reach 1.58, always safe).
- Whole system: pointer-follow via r3f state.pointer (target y = pointer.x·0.38, x = pointer.y·0.24) with frame-rate-independent damping ≈0.045/frame; idle auto-rotation y += 0.0016·60·delta. useFrame early-returns when document.hidden (r3f also throttles rAF when hidden — no warnings observed).
- Responsive fit: group scale = min(1, 0.92·frustumHalfHeight·aspect / systemHalfWidth) so the widest ring sweep (2.66 world units at bandWidth .09) never clips panel sides in portrait containers; landscape renders at reference scale 1.
- Lighting (fully offline): drei <Environment resolution={256}> with children ONLY — `<color attach="background" args={["#0d0e11"]}/>` (attaches to Environment's internal virtual scene, per drei source) + 4 Lightformers (white top strip 3.6, periwinkle #AAB7FF left 1.8, bright white right 2.6, electric #526BFF below 1.0). No preset/files/remote HDRIs. Plus ambient 0.15 + directional [4,6,4] 0.4.
- Canvas: dpr [1,1.75], camera [0,0,6.4] fov 38, gl {antialias, alpha, powerPreference high-performance}; component root `relative h-full w-full ${className}`, canvas parent `absolute inset-0`.
- Robustness: default export = SSR-safe client gate (renders static fallback during SSR + first paint → no hydration mismatch, swaps to canvas after mount only if WebGL context exists AND !prefers-reduced-motion; reduced-motion is reactive via matchMedia listener). Class error boundary renders the fallback on any three.js error. Named exports: ChromeOrbitLazy (next/dynamic, ssr:false, loading = static fallback), ChromeOrbitScene (raw scene), ChromeOrbitFallback (pure-CSS chrome orb: dark radial-gradient disc, specular highlight, periwinkle elliptical ring passing behind/in front of the orb via clip-path, one electric satellite dot; aria-hidden, no animation).
- Deviations (deliberate, documented): (1) satellites orbit at R + tube + 0.6r instead of exactly R — at the centerline they would be fully hidden inside the torus tube (r .07 < tube .13+), defeating the visible-satellite/accent requirement; formula shape [cos·ρ, sin·ρ, 0] preserved. (2) spin-outer structure as above. (3) ChromeOrbitLazy's loader is `() => Promise.resolve(ChromeOrbitScene)` rather than a self-referential `import("./chrome-orbit")` — the scene lives in the same single file, so a self-import adds nothing (identical chunk) while risking Turbopack circular-import edge cases; ssr:false semantics are identical. (4) responsive fit scale (see above).
- Verification: `bunx tsc --noEmit` → 0 errors in chrome-orbit.tsx (pre-existing errors exist in src/lib/queries.ts — orchestrator's file, untouched). `eslint src/components/site/chrome-orbit.tsx` → clean. dev.log: no compile errors, GET / 200. Fallback CSS rendered in headless browser + VLM-reviewed: ring correctly passes behind top / in front bottom, accent dot sits on the ring line. NOTE: no page imports the component yet, so Turbopack has not compiled it — 3-a's import will be its first compile (types/lint already validated).

Stage Summary (for 3-a — embedding the hero visual):
- Import: `import ChromeOrbit from "@/components/site/chrome-orbit"` (default export is the safe, gated component — use it). Named exports if needed: ChromeOrbitLazy, ChromeOrbitScene, ChromeOrbitFallback.
- Embed exactly like this (component fills its parent; parent controls size):
  `<div className="relative h-[420px] md:h-[560px] rounded-2xl bg-graphite overflow-hidden"><ChromeOrbit bandWidth={0.09} /></div>`
  (add `border border-white/[0.06]` / inner padding etc. on the wrapper as the design requires — the canvas is transparent, so the graphite panel IS the backdrop; rounded corners need overflow-hidden.)
- API: `{ bandWidth?: number (default 0.09, clamped 0.02–0.25), className?: string }` — className is appended to the root (root is always h-full w-full). No props for speed/colors by design (PRD-fixed signature visual).
- Behavior: SSR/no-JS/no-WebGL/reduced-motion/scene-error → static CSS chrome-orb fallback (aria-hidden, animation-free). Normal: WebGL canvas with idle rotation; pointer move over the panel tilts it (weighted, damped). Tab hidden: paused.
- Do NOT wrap it in another library's Suspense/error boundary — it handles its own; avoid width/height props on ChromeOrbit itself (style the parent).

---
Task ID: 3-b
Agent: general-purpose
Task: Remaining public pages — businesses, work, people, insights, careers, contact, legal, 404 (+ 4 detail pages)

Work Log:
- Overwrote all 13 stubs in src/components/site/pages/ per PRD §7,§10–§14. All data via useApi<T> with LoadingState / ErrorState(retry) / EmptyState; every page degrades gracefully on empty/error. Detail pages handle BOTH failure shapes: API 404-error AND 200-null → "not found" ErrorState + back-link pill.
- businesses.tsx: PageHeader `01 / ECOSYSTEM` + editorial divide-y directory rows (Link → /businesses/:slug) with monogram-or-logo tile, relationship micro-label (OWNED→"Owned by ETARNITY" etc.), electric category + line-clamp summary, StatusChip + ArrowUpRight; legend row; exports `relationshipLabel()` (reused by business-detail).
- business-detail.tsx: col-8 main (status+relationship chip row, summary lede on hairline, "\n\n" paragraphs) + col-4 sticky sidebar card (STATUS/CATEGORY/RELATIONSHIP/WEBSITE rows, external link w/ ArrowUpRight, "Discuss This Business" graphite pill + mono caption).
- work.tsx: PageHeader `02 / WORK`; client-side category filter pills ("ALL" + unique-from-data, useState); sm:2/lg:3 card grid with next/image covers (fallback: dark gradient + inline orbit-mark SVG), category + StatusChip, ownership micro-label; exports `ownershipLabel()` + `CoverFallback` (reused by project-detail/insights/article-detail). Transparency legend below grid.
- project-detail.tsx: meta row under header (StatusChip + ownership + "Visit Live Project ↗" outline pill when liveUrl); 21:9 cover; col-8 body sections (OVERVIEW/PROBLEM/SOLUTION/PROCESS/OUTCOMES, mono electric labels, only rendered when content exists) + col-4 sticky sidebar (TECH STACK chips + STATUS/OWNERSHIP/CATEGORY/LIVE LINK rows); gallery grid; bottom CTA row (graphite pill + text link).
- people.tsx: `03 / PEOPLE`; Founders. (md:2, 64px portrait/monogram tiles, FOUNDER badge) + Specialists & Builders. (sm:2/lg:3, 56px, department mono) sections; honest empty state; consent footnote. Exports `initialsOf()` + `Portrait` (reused by person-detail).
- person-detail.tsx: back link; lg-12 header — portrait card (aspect-square, max-w-320) + lucide icon link chips (Linkedin/Github/Mail/Globe by URL substring, aria-labels); dept + FOUNDER badge, h1, position, hairline, BIOGRAPHY/RESPONSIBILITIES/EXPERTISE, "Get in Touch" pill.
- insights.tsx: `04 / INSIGHTS`; category pills; featured = first of filtered list → large horizontal md:2 card (FEATURED·category mono, cover md:min-h-280, author·date meta row); rest → md:2/lg:3 vertical cards. Exports `formatDate()` (date-fns "MMM d, yyyy", null-safe) reused by article-detail.
- article-detail.tsx: max-w-760 reading layout; meta row (category · date · `N MIN READ` = words/200 ceil, min 1); h1; summary lede; author row (graphite initials tile → links to /people/:slug); 21:9 cover; ReactMarkdown with FULL custom `components` map (no prose plugin): h2/h3/p/ul(marker:text-electric)/ol/li/strong/em/a(target _blank)/blockquote(border-electric)/code(inline chip vs block via class/newline heuristic — v10 removed the `inline` prop)/pre(bg-graphite)/hr/img(plain lazy <img>: markdown can reference arbitrary remote hosts that next/image would reject — deviation). Footer author card + "Back to Insights →".
- careers.tsx: `05 / CAREERS`; Culture section (3 craft paragraphs + bordered working-principles list w/ mono 01-05 indices); Open Positions as accordion (expandedId state, aria-expanded/aria-controls, ChevronDown rotate-180, hover:bg-white, focus-visible ring-inset electric); expanded panel: description paragraphs + REQUIREMENTS list + `mailto:hello@etarnity.com?subject=Application: …` graphite pill; no-positions honest EmptyState + "Introduce Yourself"; footnote. Exports `INQUIRY_TYPE_STORAGE_KEY`.
- contact.tsx: `06 / CONTACT`; left col inquiry-type legend (6 lucide icons) + DIRECT card (contactEmail from /api/public/company, fallback hello@etarnity.com); right col form card — manual useState validation (required name/email-regex/inquiryType/subject, message ≥10 chars, consent) with inline red text-xs errors, shadcn Select for Inquiry Type (h-11 override via `data-[size=default]:h-11` to win the variant-class battle), Textarea rows 6, honeypot input name="website" (absolute -left-[9999px], tabIndex -1, aria-hidden, value sent in POST), consent label with /privacy-policy Link (stopPropagation so it doesn't toggle the checkbox), Loader2+"Sending…" disabled submit, 400/429/network error banners (429 → "Too many messages…"), success panel (CheckCircle2 + "Message received." + reset button). Reads sessionStorage INQUIRY_TYPE_STORAGE_KEY on mount to preselect CAREERS from the careers page (hash router can't carry query params — deviation).
- privacy.tsx / terms.tsx: `07 / LEGAL`, backTo Home; max-w-760, mono "LAST UPDATED — 2025" meta line, 9 sections each (h2 + text-[15px] paragraphs), cross-links.
- not-found.tsx: mono 7xl `404` + electric dot, "This page doesn't exist — yet.", Back to Home graphite pill + Report a Problem outline pill.
- VERIFICATION (headless browser, real dev server + 2-c's live API routes): every list/detail/static page rendered with temporarily seeded DB rows (business/project/founder/article/job — seeded via throwaway script, then fully cleaned up + script deleted; DB left with only 2-c's own rows). Confirmed in-DOM: directory rows & chips, business detail sidebar, filter pills, project sections+sidebar, founders grid, person bio, featured card, full markdown styling (verified exact class strings on ul/pre/code/blockquote/h2), careers accordion expand + requirements + mailto, contact inline validation errors, 429 banner text, success panel + "Send Another Message" reset, all 4 detail not-found paths, all empty states (pre-seed), privacy/terms/404. `bunx tsc --noEmit`: 0 errors in my files. `bun run lint`: 0 errors/0 warnings in my files. dev.log clean of page errors. NOTE: the dev server had died mid-run (external kill); restarted via `(bun run dev >/dev/null 2>&1 &)` from the project root — this invocation SURVIVES across tool calls.

Stage Summary (for agents 4/6 + orchestrator):
- Final page exports (all default): BusinessesPage() · WorkPage() · PeoplePage() · InsightsPage() · CareersPage() · ContactPage() · PrivacyPage() · TermsPage() · NotFoundPage() · BusinessDetailPage({ slug }) · ProjectDetailPage({ slug }) · PersonDetailPage({ slug }) · ArticlePage({ slug }) (file article-detail.tsx).
- Named cross-exports between my page files: businesses→relationshipLabel, work→ownershipLabel+CoverFallback, people→initialsOf+Portrait, insights→formatDate, careers→INQUIRY_TYPE_STORAGE_KEY. (No new shared component files were created, per file-ownership rules.)
- Admin (agent 4): the contact form POSTs exactly ContactFormPayload (website honeypot included, empty); careers "Introduce Yourself" preselects CAREERS in /contact via sessionStorage `etarnity:inquiry-type` — remove/keep as desired. MediaRef.mimeType === "image/svg+xml" renders next/image unoptimized (sharp can't optimize SVG).
- Media/agent 6: all imagery uses next/image fill+sizes+object-cover with alt = altText ?? name; cover fallbacks are gradient + inline orbit-mark (never nests Logo's <a> inside card Links).
- Content notes: eyebrow numbering is 01 ECOSYSTEM / 02 WORK / 03 PEOPLE / 04 INSIGHTS / 05 CAREERS / 06 CONTACT / 07 LEGAL (per PRD, differs from header nav order — cosmetic only). Article markdown bodies support h2/h3/lists/quotes/code/fenced blocks/links/inline images.
- Deviations (deliberate, spec-ambiguous icon sizes): businesses-row arrow size-4, sidebar Visit arrows size-3, contact category icons size-4, success CheckCircle2 size-10 — the spec's "size-N" numbers were internally inconsistent (16/12/15/40 would render 64/48/60/160px); px-sensible values chosen instead. Contact page uses manual useState validation (spec allowed either react-hook-form or manual). Markdown body images are plain <img> (unknown remote hosts can't go through the optimizer). Query params impossible through the hash router → sessionStorage hand-off for careers→contact inquiry type.

---
Task ID: 3-a
Agent: general-purpose (Task 3-a)
Task: Public pages — home, company, mission-vision, technology (PRD §5–§8)

Work Log:
- Overwrote the four stubs I own; nothing else touched.
- home.tsx: HERO — lg:grid-cols-12 (6/6): staggered Reveal (0/.1/.2/.3 + metadata row .4), H1 `Building What Comes Next.` with `Next` underlined (decoration-[#526BFF]/60 3px, offset 10px), dual CTAs (graphite pill + outline pill), mono metadata row `EST. {year} — {hq} ● {status}` (fallbacks 2025 / Dhaka, Bangladesh / Operating — early stage). RIGHT: `<ChromeOrbit bandWidth={0.09} />` in graphite panel h-[360/420/560px] with cinematic motion.div fade+scale (.97→1, .9s, delay .15, EASE, reduced-motion → initial:false), radial glow overlay, ring-1 ring-inset ring-white/10, mono corner labels `ETR.ORB / 01 — CHROME` / `SYS.ACTIVE ●`. Verified live in headless browser: WebGL scene renders, no page errors (only benign three.js Clock deprecation warning).
- home SECTION 01 — Company intro: overview (fallback provided) rendered via EditorialStatement (trailing clause after last em-dash softened to text-ink-soft), right column link to /company, 6-item capability strip (electric 5px dots + mono labels, staggered 0.08).
- home SECTION 02 — Ecosystem: up to 4 BusinessCards (monogram tile or logo via next/image, StatusChip, category, line-clamp-3 summary, hover Explore + ArrowUpRight reveal), EmptyState fallback, right-aligned `Explore All Businesses` mono link. Verified rendering 3-b's live test business (`ETAR Verify AI`).
- home SECTION 03 — Selected work: lead project as wide 5-col row card (cover 3 / content 2, aspect 16/10 mobile, min-h-320 desktop, `View Case Study →`), up to 3 vertical cards below, EmptyState fallback, `View All Work` link. Covers without media → gradient placeholder + static CoverMark SVG (NOT the Logo component — see deviation 3). Verified with 3-b's live test project (`Verify Analytics`, LIVE chip, placeholder cover).
- home SECTION 04 — full-width graphite CTA with radial periwinkle glow, `04 / NEXT`, H2, warmwhite pill → /contact.
- company.tsx: PageHeader (lede = first sentence of overview via regex, fallback lede) + OVERVIEW (sticky mono label col-span-3, paragraphs split on \n\n, first enlarged text-xl graphite; fallback = 3 written paragraphs; /technology link) + MISSION & VISION cards (fallback statements) + centered link to /company/mission-vision + PRINCIPLES `How We Operate.` (6 items, mono index 01–06, border-t border-graphite editorial top rules; 6 written fallbacks) + JOURNEY timeline (ol with ::before hairline spine, electric-ringed dots, 4 written fallback milestones 2025×3 + NOW) + FACTS `At a Glance.` (2-col dl, FOUNDED/HQ/STATUS/CONTACT mailto/FOCUS + verifiable-info note).
- mission-vision.tsx: two full-width statement blocks (Mission/Vision, h2 mono labels, 2xl→4xl statements, border-b) + DIRECTION section `Ambition, Stated Honestly.` with WHERE WE ARE TODAY (Check) / WHERE WE'RE GOING (ArrowUpRight) cards + `LONG-TERM AMBITIONS ≠ CURRENT ACHIEVEMENTS.` closing line + `← BACK TO COMPANY` mono link.
- technology.tsx: PageHeader + intro statement (40ch, link to /work inline) + per-area alternating bordered rows (lg:grid-cols-12, sticky col-span-4 label column with mono index/title/description; col-span-8 items as `md:grid-cols-[220px_1fr]` definition rows with electric 4px dots; odd indexes toggle lg:order-1/lg:order-2) + CORE STACK strip (12 mono chips) + CTA row (`See the Evidence →` graphite pill + `Discuss an Engineering Need` text link). research area needs no special-casing (Status strings render in descriptions as spec'd).
- Data: company/mission-vision use useApi<CompanyProfile>("/api/public/company"), technology useApi<TechnologyArea[]>("/api/public/technology"). LoadingState while loading. Verified against live 2-c routes (company → null, technology → []): fallback content renders; 3-b's seeded test rows flow into home cards correctly.
- Verification: `bunx tsc --noEmit` → 0 errors in my 4 files; `bun run lint` → 0 errors/0 warnings in my files (sole warning is 3-b's article-detail unused eslint-disable); dev.log clean; headless browser (isolated session) + VLM review of all four routes desktop + home at 390px mobile (no overflow/overlap, hero orbit + all sections + fallbacks confirmed).
- INFRA NOTE: the shared dev server died twice mid-verification (killed externally — empty dev.log, no process). Restarted detached (`setsid nohup bun run dev`) — if it dies again, any agent can rerun that.

Stage Summary:
- Pages shipped: home (hero + ChromeOrbit + 4 sections), company (overview/mission/principles/journey/facts), mission-vision, technology. All data-driven text has honest fallbacks; DB-seeded content upgrades in place.
- Props/APIs relied on (all per 2-a/2-b contracts, unchanged): Link/useRouter from @/lib/router, useApi from @/hooks/use-api, Section/PageHeader/Reveal(+EASE)/StatusChip/LoadingState/EmptyState from site components, default export ChromeOrbit({bandWidth}) from chrome-orbit, HomePayload (type-only import) from @/lib/queries.
- DEVIATIONS (important):
  1. HomePayload type bug (for orchestrator): src/lib/queries.ts annotates HomePayload with raw @prisma/client model types, but its serializers emit src/lib/types shapes (logo/cover/gallery/principles/milestones are computed and absent from Prisma models). home.tsx casts once at the boundary (commented). RECOMMEND queries.ts import the public types from src/lib/types. Also the generated Prisma client is stale (queries.ts errors: PersonLink missing, displayOrder unknown) → rerun `bunx prisma generate`.
  2. Error handling: fetch errors degrade to the fallback content (data ?? null) instead of a blocking ErrorState — GENERAL RULES ("pages must look complete") + 2-a's footer precedent for the 2-c-pending window; technology shows its designed EmptyState on error while static sections (intro/core stack/CTA) still render. To flip to strict ErrorState, re-add `<ErrorState message={error} onRetry={refresh}/>` in the three page bodies.
  3. Project cover placeholder uses a static CoverMark SVG (same orbit-mark geometry/gradient as Logo) instead of the Logo component — Logo renders a Link, which would nest `<a>` inside the card Link (invalid HTML). Non-interactive, aria-hidden.
  4. Hero metadata row is a 5th staggered Reveal (delay .4) beyond the spec's four; capability-strip items also stagger.
  5. Company CONTACT fact is a plain mailto `<a>` (not a hash-route Link — external scheme).

---
Task ID: 4
Agent: general-purpose (Task 4)
Task: Admin panel CMS — auth-gated internal application at /#/admin (login, shell + sidebar, overview dashboard, full CRUD for businesses/projects/people/articles, media library, inquiries triage, company profile editors, user management)

Work Log:
- Files created in src/components/admin/ (all "use client"): admin-utils.tsx, admin-header.tsx, admin-login.tsx, admin-shell.tsx, admin-app.tsx (replaced stub — same default export signature, no props), overview.tsx, businesses.tsx, projects.tsx, people.tsx, articles.tsx, media.tsx, inquiries.tsx, company.tsx, users.tsx. Nothing outside src/components/admin/** touched.
- admin-utils.tsx: api<T>() JSON wrapper (throws Error with the API's { error } text), uploadMedia() multipart helper, useAdminData() typed useApi passthrough, slugify/isValidSlug/isValidUrl/isValidEmail, formatBytes/formatDate/formatDateTime, isoToLocalInput/localInputToIso (datetime-local ↔ ISO), splitList (comma input → array), AdminTable (rounded-xl border bg-white + overflow-x-auto + min-w-720 table), Th/Td/Tr (mono 10px uppercase th per design language), Field (mono label + control + inline red error), SwitchField, AdminDialog (max-w-2xl / wide max-w-3xl, header + max-h-[70vh] scrollable body + footer Cancel/graphite pill submit with Loader2), ConfirmDelete (AlertDialog; stays open with spinner while the request runs, closes on settle, destructive red), DeleteButton + iconButtonClass, MediaPickerField (thumbnail h-16 w-24 or dashed "None" box; Upload… posts FormData immediately + toast; Choose… Select of media by fileName; X remove), toastSuccess/toastError.
- admin-app.tsx: auth gate — GET /api/admin/me on mount with LoadingState; 401 → AdminLogin; session → AdminShell({user}); logout clears user (returns to login). Deep links preserved (no forced redirect when already on an /admin path).
- admin-login.tsx: full-screen bg-graphite with two radial periwinkle/electric glows, centered max-w-sm white card (rounded-2xl p-8, deep shadow), Logo + mono "ETARNITY ADMIN" label, h-11 email/password inputs, w-full graphite pill submit with Loader2, inline red error (shows API message e.g. "Invalid email or password."), mono footer line.
- admin-shell.tsx: desktop sidebar w-60 (sticky, border-r, bg-white, hidden <lg) + mobile top bar with hamburger opening a left Sheet drawer (same nav). Nav: Overview /admin, Businesses, Projects, People, Articles, Media, Inquiries (electric NEW-count badge from /api/admin/inquiries), Company, Users (only when user.role === "SUPER_ADMIN"; direct /#/admin/users as non-super-admin falls back to Overview). Active item: bg-warmwhite + font-medium + 2px electric left indicator; inactive text-ink-soft hover:text-graphite. Bottom: user card (initials tile, name, mono role), Sign out (POST /api/admin/logout + toast), View Site ↗ (href "#/"). Sections lazy-loaded via React.lazy + Suspense (routed by segments[1]; unknown → overview). Main: bg-warmwhite, max-w-6xl, px-6 md:px-10 pt-6 pb-16.
- overview.tsx: 6 stat cards (2/4 grid, real /api/admin/dashboard counts: Published Businesses x/total, Published Projects x/total, Published Articles + drafts, Public People, Open Inquiries x/total, Media Items) + Recent Activity card listing AuditEntry rows (mono timestamp · action · entity #id · actor) or EmptyState. No fabricated analytics.
- businesses.tsx: AdminTable (Business+slug / Category / Relationship mono / StatusChip / Featured star filled-amber-outline / Published switch / edit+delete). Dialog: name, auto-slug (editable), summary, description, category (datalist suggestions), relationshipType + operationalStatus Selects, websiteUrl, displayOrder, logo MediaPickerField, Featured+Published switches. Client validation mirrors schemas.ts (name≥2, slug regex, summary 10–500, category≥2, URL format, integer order).
- projects.tsx: same table pattern (Ownership mono column). Wide dialog: title/slug/summary, problem/solution/process/outcomes 4-row textareas, stack (comma input → splitList), category, ownershipType/projectStatus Selects, liveUrl, displayOrder, cover picker + gallery multi-select (scrollable thumbnail row, click toggles electric ring+check, prefilled from item.gallery), switches.
- people.tsx: table (Person+position / Department mono / Founder badge / Public switch / actions). Dialog: name/slug/position, department Select (8 known departments, current value added if custom, "— None —"), biography/responsibilities textareas, expertise comma input, links repeater (label+url rows, Add Link / Trash2 remove, validated pairwise), switches, portrait picker.
- articles.tsx: table (Article+slug / Category / StatusChip / Author / Published date mono / Featured star TOGGLE BUTTON / Live switch (status PUBLISHED⇄DRAFT) / actions). Wide editor dialog: title/slug/summary, body textarea rows=16 mono text-[13px] with markdown hint, category, status Select (hint: publishing without a date auto-stamps), publishedAt datetime-local, author Select from /api/admin/people, cover picker, Featured switch.
- media.tsx: grid-cols-2 lg:4 gallery — aspect-[4/3] covers (SVG mime → generic ImageUp icon tile per spec), mime chip overlay, fileName mono truncate, size+date mono, inline altText Input with Save button appearing only when dirty (PUT { altText }), DeleteButton. Header "Upload Images" button: multi-file input, sequential FormData uploads with per-file error toasts + summary success toast + refresh.
- inquiries.tsx: filter pills (All + 4 statuses with live counts) → card list: header (inquiryType graphite badge, StatusChip, mono date), name + organization + mailto email (text-electric), subject, whitespace-pre-wrap message, status Select (PUT + toast), expandable Internal Notes panel (Textarea + Save Notes, blue dot indicator when notes exist), DeleteButton.
- company.tsx: stacked cards, each with its own save (partial PUT semantics): (a) Profile (name, tagline, overview/mission/vision textareas, foundingYear, headquarters, operatingStatus, contactEmail → PUT { profile }); (b) Principles editor (numbered rows, title + description, up/down reorder, remove, Add Principle → PUT { principles } replace-all); (c) Milestones editor (year/title/description, same pattern). Editors remount from fresh data only after their own save (separate keys) so unsaved edits in one section aren't lost when saving another.
- users.tsx: table (User name+email + "You" tag / Role mono badge color-coded / Status switch ACTIVE⇄SUSPENDED / Created date mono / actions). Add dialog (name, email, password min 8 + hint, role Select of 4). Edit dialog (name, email, role, Active switch, optional new password blank=unchanged). Self-row: status switch disabled, delete still allowed → server rejects with toast ("You cannot delete your own account.").
- KEY WORKAROUND (API shape gap): the admin list serializers (serializeBusiness/Project/Person) omit isPublished/isPublic/displayOrder (and Article omits isFeatured), so publish state is DERIVED from the corresponding /api/public/* list (slug membership) and both lists refresh together after every mutation. Edit dialogs only send displayOrder/isFeatured when the user touches those fields (PUT is partial — absent keys stay unchanged), so editing never clobbers unknown stored values. Articles' Featured column is a star TOGGLE with three client states (unknown-null → muted, true → amber filled, false → outline) since the stored value is unknowable until set; first click sets featured.
- Fixed during verification: (1) Radix forbids SelectItem value="" — author/department "none" options now use sentinel value="none" mapped to null/"" on change (initial empty state uses controlled value="" + placeholder instead of undefined, killing uncontrolled→controlled warnings); (2) ConfirmDelete made controlled (open state) so it always closes after the request settles; (3) React Compiler lint rule preserve-manual-memoization — replaced useCallback refreshAll wrappers with plain functions (compiler memoizes).
- VERIFICATION (headless browser on the live dev server, real seeded DB): login invalid (inline error + toast) → valid SUPER_ADMIN (dashboard real counts 4/4 businesses, 4/4 projects, 4 articles, 5 people, 2/2 inquiries, 2 media; Recent Activity fills with audit rows from mutations). Full business cycle: create (auto-slug, publish on) → verified in public API → edit (rename) → publish toggle off/on (reflected in public list both ways) → delete → verified cleanup. Article cycle: create with status PUBLISHED → publishedAt auto-stamped to now → Live switch to DRAFT → delete. Media: uploaded test PNG via UI → verified row + API → MediaPickerField Choose… (thumbnail + Remove + "NONE" placeholder) → deleted. Inquiries: status Select NEW→RESOLVED→IN_PROGRESS, Internal Notes save (then restored original state via PUT). Users: self-delete rejected with exact server message in destructive toast; self status switch disabled. CONTENT_MANAGER login: Users nav hidden, 8 items only. Mobile 390px: hamburger → Sheet drawer → nav works, View Site ↗ → #/ public site, logout → login screen + "Signed out" toast. VLM visual review of businesses + overview desktop screenshots: clean layout, no overlap/truncation, active state + badge correct. `bun run lint`: 0 errors/0 warnings project-wide. `bunx tsc --noEmit`: 0 errors in admin files (pre-existing errors only in examples/ + skills/). dev.log clean (two historical "Fast Refresh full reload" entries were from the pre-fix SelectItem crash). All test data cleaned up (DB back to seeded state; only audit-log entries remain, which is their purpose).

Stage Summary:
- Admin panel complete at /#/admin — standalone chrome (no public header/footer), reachable by direct URL only. 9 sections, full CRUD on every entity, toasts on every mutation, LoadingState/EmptyState/ErrorState everywhere, mobile Sheet drawer + scrollable tables, keyboard focus rings (ring-electric) throughout.
- Exports for orchestrator: src/components/admin/admin-app.tsx default export AdminApp() — unchanged signature consumed by site/app.tsx. All other admin files are internal to the folder.
- DEVIATIONS / notes for future agents:
  1. Publish/Public visibility switches are derived from /api/public/* lists because admin serializers omit those flags — a tiny serializer addition (isPublished/isPublic/displayOrder/isFeatured on admin endpoints) would let the derivation be dropped, but current approach is exact and self-healing.
  2. Articles' Featured is a toggle (unknown state rendered muted) — see workaround above; never sends isFeatured unless explicitly set.
  3. displayOrder fields in edit dialogs start empty with hint (stored value not exposed); only sent when touched.
  4. Media page renders SVGs as a generic icon tile (per spec) although <img> embedding would technically work.
  5. Gallery multi-select implemented (spec marked optional) — covers + gallery both manageable from the project dialog.
  6. Company editors use per-section saves (Profile / Principles / Milestones) rather than one global save — matches the partial PUT + replace-all semantics and avoids cross-section data loss.

---
Task ID: 1 / 5 / 6 (orchestrator tasks)
Agent: orchestrator (main)
Task: Foundation, imagery, seed, integration

Work Log:
- Fixed queries.ts typing (Prisma model types → lib/types shapes, structural row types).
- Fixed reveal.tsx `children: never` JSX typing (cast to concrete intrinsic tag).
- Generated 9 brand/content images via z-ai CLI (og.png in public/images + 8 covers in db/uploads).
- prisma/seed.ts: roles, 2 admin users, company profile, 6 principles, 4 milestones, 4 businesses, 5 people, 4 projects, 4 published articles, 7 technology areas, 2 job positions, 2 sample inquiries.
- scripts-attach-media.ts: idempotent media linkage (MediaItems + project/article covers).
- Verified: tsc clean (app files), eslint clean project-wide, all API endpoints tested via curl (public reads, login 401/200, auth guards, contact validation), all media serves 200 image/png.

Stage Summary:
- Credentials: admin@etarnity.com / Etarnity@2025! (SUPER_ADMIN) · content@etarnity.com / Etarnity@2025! (CONTENT_MANAGER).
- All seeded content is honest sample data — statuses labeled truthfully (In Development / Planned / Experiment / Demonstration), editable via #/admin.
- OG image 1344x768 (1440x720 rejected by API — 720 not 32-multiple).
- Remaining: agent-browser end-to-end verification of the golden path.

---
Task ID: 6-QA
Agent: orchestrator (main)
Task: End-to-end verification with agent-browser + VLM

Work Log:
- Browser-verified: home (Chrome Orbit renders, all seeded cards), all 8 inner routes + 2 detail routes (correct titles/URLs), business detail (status/relationship), article detail (markdown headings), mobile 390px (no overflow, menu works), sticky footer (footerBottom === viewportH), contact form full submission → success panel → DB record → visible in admin inbox, admin login → dashboard with real counts → inquiries section.
- Fixed: Article isFeatured now serialized (types.ts + queries.ts) and insights page prefers explicitly-featured article.
- VLM-flagged "defects" (article heading cut-off, success button truncation, footer overlap) all disproven via geometry measurements — scroll-position capture artifacts.
- Removed 2 QA test inquiries via admin API; sample inquiries retained.
- Final: lint 0/0, tsc clean, dev.log clean, robots/sitemap/og/icon all 200.

Stage Summary:
- PROJECT COMPLETE. All PRD requirements delivered within the single-route constraint.
