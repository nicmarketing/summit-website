# AI Visibility & SEO Audit — Summit Marketing LLC
**Date**: 2026-08-03  
**Domain**: https://www.summitmarketingms.com  
**Auditor**: Claude (Sonnet 4.6) — evidence-based, no invented facts  
**Source of truth**: This repository + verified brand files only

---

## A. Project Inventory

### Framework & Architecture

| Property | Detail |
|---|---|
| Framework | Static HTML/CSS/JS — no build tool, no SSG, no framework |
| Routing | Vercel `cleanUrls: true` + explicit redirects/rewrites in `vercel.json` |
| Rendering | Server-rendered static HTML — no JavaScript rendering risk for main content |
| CMS | None — hand-authored HTML files |
| Build commands | None (static deploy) |
| Dev server | `node serve.mjs` at `http://localhost:3000` |
| Deployment | Vercel (GitHub auto-deploy on push to `main`) |
| Analytics | Google Analytics 4 (`G-7R81TMRFN4`) on every page |
| Images | Inline SVG + PNG/JPG; one `sharp` npm devDependency (unused in deploy) |
| SEO components | Inline `<meta>` and `<script type="application/ld+json">` in every `<head>` |
| Sitemap | `/sitemap.xml` (hand-authored) |
| robots.txt | `/robots.txt` (hand-authored, allows all crawlers including AI agents) |
| AI reference files | `/llms.txt` and `/llms-full.txt` (both present) |
| Serverless API | `api/audit.js` — Vercel function, powers the free audit tool |

### Production Domain & Canonical URLs

- **Domain**: `https://www.summitmarketingms.com`
- **Canonical pattern**: `https://www.summitmarketingms.com/{path}/` (trailing slash)
- **CNAME file**: present (GitHub Pages artifact — not used on Vercel)

### Verified Brand Facts (from codebase + approved files)

| Fact | Source |
|---|---|
| Legal name | Summit Marketing LLC |
| Tagline | Reaching New Heights Together |
| Founder | Nic Butts, Founder & CEO |
| Founded | 2026 |
| Address | 4725 US Highway 80 E, Pearl, MS 39208 |
| Phone | (601) 607-9714 |
| Email | nic@summitmarketingms.com |
| Primary niche | Home service contractors, Mississippi |
| Social: Facebook | https://www.facebook.com/SummitMarketingMS |
| Social: Instagram | https://www.instagram.com/summitmarketingms |
| GA4 ID | G-7R81TMRFN4 |

### Existing SEO/AEO Audit Artifacts in Repo

| File | Status |
|---|---|
| `SEO/meta-titles.csv.txt` | **Empty** — no content |
| `SEO/meta-data.md.txt` | **Empty** — no content |
| `Snippets/schema.json.txt` | **Empty** — no content |
| `Snippets/pricing-service-schema.json` | Present (template reference only, not deployed) |
| `llms.txt` | Present and substantive |
| `llms-full.txt` | Present and substantive |

No prior formal AI-visibility score reports, Lighthouse exports, or Search Console data found in the repository.

---

## B. Technical Crawl / Index Audit

### Indexable Routes (from sitemap.xml)

| Route | Title | Canonical | Robots | Sitemap | Notes |
|---|---|---|---|---|---|
| `/` | Summit Marketing LLC \| Digital Marketing Agency in Mississippi | ✅ self | default (index) | ✅ 1.0 | — |
| `/services/` | Services \| Summit Marketing LLC — Mississippi Marketing Agency | ✅ self | default | ✅ 0.9 | — |
| `/results/` | Client Results & Reviews \| Summit Marketing LLC | ✅ self | default | ✅ 0.9 | — |
| `/pricing/` | Pricing & Plans \| Summit Marketing LLC | ✅ self | default | ✅ 0.9 | — |
| `/about/` | About Summit Marketing LLC \| Digital Marketing Agency — Pearl, MS | ✅ self | default | ✅ 0.8 | — |
| `/contact/` | Contact Summit Marketing LLC | ✅ self | default | ✅ 0.8 | — |
| `/faq/` | FAQ \| Summit Marketing LLC | ✅ self | default | ✅ 0.8 | — |
| `/audit/` | Free SEO & Marketing Audit \| Summit Marketing LLC | ✅ self | default | ✅ 0.7 | — |
| `/locations/` | Digital Marketing Agency Serving Mississippi | ✅ self | index,follow | ✅ 0.9 | — |
| `/locations/{city}-ms/` (×10) | Digital Marketing Agency in {City}, MS | ✅ self | default | ✅ 0.85 | — |
| `/compliance/` | Free Strategy Call — Summit Marketing | ✅ self | **index,follow** | ✅ 0.3 | **Issue: should be noindex** |
| `/privacy-policy/` | — | ✅ self | default | ✅ 0.3 | — |
| `/terms-of-service/` | — | ✅ self | default | ✅ 0.3 | — |

### Non-Indexed Routes (intentional)

| Route | robots | Notes |
|---|---|---|
| `/404.html` | `noindex` | ✅ correct |
| `/salesdemo.html` | `noindex, nofollow` | ✅ correct |
| `/Pages/pricing.html` | `noindex, nofollow` | ✅ correct |
| `/privacy-policy.html` (root) | `noindex, follow` | ✅ redirects to `/privacy-policy/` |
| `/terms-of-service.html` (root) | `noindex, follow` | ✅ redirects to `/terms-of-service/` |

### Redirect Inventory (from vercel.json)

| Source | Destination | Type | Issue? |
|---|---|---|---|
| `/results` | `/#results` | 302 | **⚠️ P0: Redirects results-page traffic to homepage anchor** |
| `/privacy.html` | `/privacy-policy` | 301 | ✅ OK |
| `/privacy-policy.html` | `/privacy-policy` | 301 | ✅ OK |
| `/terms.html` | `/terms-of-service` | 301 | ✅ OK |
| `/terms-of-service.html` | `/terms-of-service` | 301 | ✅ OK |

**Critical note**: `/results` (without trailing slash) 302-redirects to `/#results` on the homepage. All internal links correctly use `/results/` (with trailing slash), so regular navigation is unaffected. However, any external link, bookmark, or crawler hitting `/results` gets sent to the homepage — hiding the results page from that entry point and potentially causing index confusion.

### Duplicate Content Risks

- `/privacy-policy.html` and `/privacy-policy/index.html` — root has `noindex`, subfolder is canonical. ✅ Handled.
- `/terms-of-service.html` and `/terms-of-service/index.html` — same. ✅ Handled.
- `Pages/pricing.html` is `noindex` and not in sitemap — no conflict with `/pricing/`. ✅ OK.

### 404 Behavior

- `404.html` present with `noindex` and `link rel="canonical" href="/404"` — minor issue: canonical on a 404 page is unusual but harmless.

### Language Declarations

- All pages: `<html lang="en">` ✅

### JavaScript Rendering Risk

- None: all primary content is static HTML, not client-rendered. ✅

---

## C. Page Quality & Entity Audit

### Homepage (`/`)

| Check | Status | Detail |
|---|---|---|
| H1 | ⚠️ P1 | "Your strategic partner for a truly profitable business" — generic, no geo or niche signal |
| Opening paragraph | ⚠️ | "Summit Marketing delivers results-driven growth strategies built around SEO, content, brand, and automation" — broad, doesn't lead with contractor/Mississippi angle |
| Dashboard stats | ⚠️ P1 | "+84% Organic Traffic", "+62% Revenue Lift", "2,841 New Leads" shown in hero dashboard labeled as "Illustrative projections" — fine legally but schema FAQ answers claim specific outcomes |
| Reviews visible | ✅ | 6 Google reviews shown — matches `AggregateRating` reviewCount:6 in schema |
| Internal links | ✅ | All nav items link to correct trailing-slash URLs |
| Missing OG image | ✅ | `og-image.png` exists in brand-assets |
| Favicon | ⚠️ | Filename is `Summt Marketing LOGO.png` (typo, missing 'i') — works but embarrassing in source |

### Services (`/services/`)

| Check | Status | Detail |
|---|---|---|
| H1 | ✅ | "Revenue Systems That Work While You Work" — clear value statement |
| Title | ✅ | Specific, includes geo signal |
| Services schema | ✅ | 6 `Service` entities with prices and descriptions |
| Content completeness | ✅ | Detailed per-service sections present |
| Oswald font | ⚠️ P2 | Services page loads only Inter; all other pages load Inter + Oswald |

### Results (`/results/`)

| Check | Status | Detail |
|---|---|---|
| H1 | ✅ | "Real results. Real growth." |
| Reviews visible | ✅ | Same 6 reviews shown — matches `AggregateRating` schema |
| Schema source | ✅ | `LocalBusiness` with `review` array — reviews are visible on this page |
| Case studies | ⚠️ P1 | Stats section shows "< 24hr", "100%", "ROI" — these are pledge/guarantee claims, not specific client outcomes. No named case studies with before/after metrics |

### Pricing (`/pricing/`)

| Check | Status | Detail |
|---|---|---|
| H1 | ✅ | "Plans Built to Scale With You" |
| Organization name | ⚠️ P0 | Schema says "Summit Marketing" (missing LLC) — inconsistent with all other pages |
| Instagram URL | ⚠️ P1 | Schema uses `SummitMarketingMS` (mixed case) — all other pages use lowercase |
| Plan content | ✅ | Four plans with pricing visible on page |

### About (`/about/`)

| Check | Status | Detail |
|---|---|---|
| H1 | ✅ | "The agency built for the climb" |
| Founder visible | ✅ | Nic Butts, photo, bio visible |
| Person schema | ✅ | Present with correct details |
| OG site_name | ⚠️ P2 | `og:site_name` is "Summit Marketing" (missing LLC) — inconsistent |

### FAQ (`/faq/`)

| Check | Status | Detail |
|---|---|---|
| H1 | ✅ | "Everything You Need to Know" |
| FAQPage schema | ✅ | Present with factual Q&A |
| Content accuracy | ✅ | Pricing figures match current plans |

### Contact (`/contact/`)

| Check | Status | Detail |
|---|---|---|
| H1 | ✅ | "Let's Reach New Heights Together" |
| Schema | ✅ | ContactPoint present |

### Audit (`/audit/`)

| Check | Status | Detail |
|---|---|---|
| H1 | ✅ | "Your Free SEO & AI Visibility Score" |
| Tool functional | ✅ | API at `api/audit.js` present |

### Compliance (`/compliance/`)

| Check | Status | Detail |
|---|---|---|
| Title | ⚠️ P1 | "Free Strategy Call — Summit Marketing" — misleading, should reflect SMS consent purpose |
| robots | ⚠️ P1 | `index, follow` + in sitemap — SMS consent pages should be noindex |
| H1 | ⚠️ | "Let's reach new heights together" — wrong for a legal/consent page |

### Location Hub (`/locations/`)

| Check | Status | Detail |
|---|---|---|
| H1 | ✅ | "Digital Marketing for Every Corner of Mississippi" |
| OG image | ⚠️ P0 | References `/brand-assets/og-default.png` — **file does not exist** |
| twitter:image | ⚠️ P1 | Missing from `<head>` |

### City Location Pages (`/locations/{city}-ms/`) — all 10

| Check | Status | Detail |
|---|---|---|
| H1 pattern | ✅ | "Digital Marketing Agency in {City}, MS" — distinct per page |
| OG image | ⚠️ P0 | All reference `/brand-assets/og-default.png` — **file does not exist** |
| Content uniqueness | ⚠️ P2 | City pages share near-identical structure; unique content limited to city-specific paragraph |
| Oswald font | ⚠️ P2 | Hub and city pages load Oswald but no visible Oswald-styled elements; wasted render-blocking request |

---

## D. Structured Data Audit

### Schema Types by Route

| Route | Schema Types Present |
|---|---|
| `/` | Organization, LocalBusiness (with AggregateRating), Person, WebSite, WebPage (×2 — duplicate), BreadcrumbList, SiteNavigationElement (×7), FAQPage, HowTo, WebPage+speakable |
| `/services/` | Organization, BreadcrumbList, WebPage+speakable, Service (×6), FAQPage |
| `/results/` | Organization, LocalBusiness+AggregateRating+Review (×6), BreadcrumbList |
| `/pricing/` | Organization (name mismatch), WebSite, WebPage, BreadcrumbList, FAQPage |
| `/about/` | BreadcrumbList, AboutPage, Person |
| `/faq/` | Organization, BreadcrumbList, WebPage+speakable, FAQPage |
| `/contact/` | Organization+ContactPoint, BreadcrumbList, FAQPage |
| `/audit/` | Organization, WebPage, BreadcrumbList, FAQPage |
| `/locations/` | BreadcrumbList, ProfessionalService (as Organization @id) |
| `/locations/{city}/` | BreadcrumbList, LocalBusiness, FAQPage |
| `/compliance/` | BreadcrumbList |

### Structured Data Issues

| Issue | Priority | Pages | Detail |
|---|---|---|---|
| **Duplicate WebPage on homepage** | P0 | `/` | Two separate `WebPage` blocks: one in `@graph` (lines 161–170) and one standalone with `speakable` (lines 292–302). They reference the same URL. Should be merged. |
| **Organization name inconsistency** | P0 | `/pricing/` | Schema says "Summit Marketing" instead of "Summit Marketing LLC" |
| **HowTo schema disconnected from visible content** | P1 | `/` | 3-step HowTo (Audit, Build, Optimize) not presented as a HowTo list on the page; matches generic agency copy, not the current contractor-specific positioning |
| **FAQPage on homepage** | P1 | `/` | Homepage FAQPage answers reference "Meridian" as a service area — Meridian has no location page and is not in the sitemap. The FAQ page itself does not mention Meridian. Minor factual inconsistency. |
| **FAQPage schema over-applied** | P2 | `/contact/`, `/audit/`, all location pages | FAQPage appears on pages where FAQ is a minor supporting element, not the primary content. Not strictly wrong but dilutes signal. |
| **Instagram URL case mismatch** | P1 | `/pricing/` | `sameAs` uses `https://www.instagram.com/SummitMarketingMS` (capital); all others use lowercase |
| **AggregateRating on homepage** | ✅ OK | `/` | Reviews ARE visible on homepage (lines 2648+) — schema is justified |
| **AggregateRating on results page** | ✅ OK | `/results/` | Reviews visible on page — schema justified |
| **`og:site_name` inconsistency** | P2 | `/about/`, `/pricing/` | Uses "Summit Marketing" (no LLC); all others use "Summit Marketing LLC" |
| **`llms-full.txt` unverifiable claim** | P1 | `llms-full.txt` | "Nic holds a degree in Marketing from the University of Mississippi" — not confirmed in any other page/file. Must be client-approved before remaining public. |

### Schema Validation Method

Validation performed by static code inspection of all JSON-LD blocks. Automated validation via Google's Rich Results Test or Schema.org validator was not run (no browser environment). No syntax errors detected by inspection. The duplicate `WebPage` issue and name inconsistency are the only structural problems found.

---

## E. Measurement Audit

### Currently Installed

| Tool | Status | Notes |
|---|---|---|
| Google Analytics 4 | ✅ Installed | GA4 ID `G-7R81TMRFN4` on every page, `async` load |
| Google Search Console | ⚠️ Not verified in repo | Must be verified and sitemap submitted externally |
| Bing Webmaster Tools | ⚠️ Not verified in repo | Must be set up externally |
| AI Visibility Platform | ⚠️ None in repo | No Otterly, Profound, Brandwatch AI, or similar tool configured |
| robots.txt Sitemap pointer | ✅ | `Sitemap: https://www.summitmarketingms.com/sitemap.xml` |
| GA4 Consent | ⚠️ | No consent mode or cookie banner present — may be required depending on audience geography |

---

## Priority Issue Register

| Priority | Route | Issue | Evidence / File | Search Impact | Recommended Fix | Safe Now? | Needs Approval? |
|---|---|---|---|---|---|---|---|
| **P0** | `/results` | 302 redirect sends `/results` to `/#results` homepage | `vercel.json` line 27 | Crawlers hitting `/results` see homepage, not results page | Change redirect to `/results/` or delete | ✅ Yes | No |
| **P0** | All location pages | `og-default.png` missing — OG images broken on 11 pages | `brand-assets/` dir listing | Broken social previews for 11 pages | Create `og-default.png` (copy of `og-image.png`) | ✅ Yes | No |
| **P0** | `/` | Duplicate `WebPage` schema block | `index.html` lines 161–170 & 292–302 | Parser confusion, invalid rich result eligibility | Merge into single `WebPage` with `speakable` | ✅ Yes | No |
| **P0** | `/pricing/` | Organization schema name is "Summit Marketing" (missing LLC) | `pricing/index.html` line 47 | Entity inconsistency across pages | Change to "Summit Marketing LLC" | ✅ Yes | No |
| **P1** | `/pricing/` | Instagram `sameAs` URL mixed-case | `pricing/index.html` line 63 | Minor entity mismatch | Lowercase the URL | ✅ Yes | No |
| **P1** | `/compliance/` | Page indexed; title misleading; SMS consent page | `compliance/index.html` + `sitemap.xml` | Wastes crawl budget; misleads searchers | Add `noindex`, fix title, remove from sitemap | ✅ Yes | No |
| **P1** | `llms-full.txt` | Unverifiable degree claim for Nic Butts | `llms-full.txt` line 30 | AI systems may cite incorrect credential | Remove or replace with verified facts | ✅ Yes | **Yes — confirm degree** |
| **P1** | `/locations/` | Missing `twitter:image` meta tag | `locations/index.html` | Broken Twitter/X preview | Add `twitter:image` | ✅ Yes | No |
| **P1** | `/` | HowTo schema not visible on page | `index.html` lines 264–291 | Rich result ineligible (content not on page) | Remove HowTo schema OR add visible step content | ✅ Yes | No |
| **P1** | `sitemap.xml` | `lastmod` dates stale (all 2026-07-29) | `sitemap.xml` | Googlebot may deprioritize recrawl | Update to reflect actual last-modified dates | ✅ Yes | No |
| **P2** | `/` | H1 generic, no geo/niche signal | `index.html` line 2215 | Keyword relevance gap for "Mississippi contractor marketing" | Revise H1 to include contractor + geo | Review needed | **Yes — brand approval** |
| **P2** | `/about/` | `og:site_name` missing LLC | `about/index.html` line 17 | Minor entity inconsistency | Add "LLC" | ✅ Yes | No |
| **P2** | `/services/` | Oswald font loaded on no-Oswald pages (and vice versa) | `services/index.html` | Minor performance (render-blocking font request) | Load only Inter on services page | ✅ Yes | No |
| **P2** | Location pages | Near-duplicate content across 10 city pages | All 10 location `index.html` | Thin content signal; limited differentiation | Add 2–3 city-specific sentences per page | Review needed | **Yes — content approval** |
| **P2** | `/results/` | No named case studies with specific metrics | `results/index.html` | Weak evidence for AI citation | Add verified client case studies when available | No — needs data | **Yes — client data needed** |
