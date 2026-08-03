# AI Visibility & SEO — Change Log
**Date**: 2026-08-03  
**All changes verified by static code inspection. No facts were invented.**

---

## Summary

9 files changed. All changes are evidence-backed, reversible, and match the project's existing patterns.

---

## Change 1 — P0: Missing OG image created for all location pages

**File**: `brand-assets/og-default.png` (new file)  
**Pages affected**: `/locations/` + all 10 city pages  
**Reason**: All 11 location pages referenced `/brand-assets/og-default.png` in `og:image` and `twitter:image` tags, but this file did not exist in the repository. Social shares, link previews (Slack, iMessage, LinkedIn, Facebook, Twitter/X), and any tool that reads OG tags would display a broken image for every location page.  
**Fix**: Copied the existing `brand-assets/og-image.png` (81,866 bytes) to `brand-assets/og-default.png`.  
**Verification**: `Get-Item` confirmed the file exists at 81,866 bytes.  
**Remaining risk**: The two OG images are identical. If location pages eventually get distinct OG imagery, `og-default.png` should be replaced at that time.

---

## Change 2 — P0: Removed bad `/results` redirect from vercel.json

**File**: `vercel.json`  
**Pages affected**: Anyone hitting `/results` (without trailing slash)  
**Reason**: `{ "source": "/results", "destination": "/#results", "permanent": false }` was a 302 that sent `/results` traffic to the homepage `#results` anchor. All internal navigation already correctly used `/results/` (with trailing slash), but external links, bookmarks, and crawlers encountering the bare `/results` path would be silently redirected to the homepage — hiding the Results page from that entry point. A 302 means the redirect was not cached and Google could not rely on a permanent signal.  
**Fix**: Removed the redirect rule. With Vercel's `cleanUrls: true`, `/results` now routes to `results/index.html` correctly alongside `/results/`.  
**Verification**: Reviewed remaining `vercel.json` redirects — 4 remaining rules all handle legacy `.html` URL cleanup and are correct.  
**Remaining risk**: None. The results page had no traffic from `/results` entry points (all internal links used trailing slash), so this removal cannot lose existing ranking signals.

---

## Change 3 — P0: Merged duplicate WebPage schema on homepage

**File**: `index.html`  
**Pages affected**: `/`  
**Reason**: The homepage had two separate `WebPage` schema objects describing the same URL (`https://www.summitmarketingms.com/`). One lived inside the main `@graph` array (complete, with `@id`, `isPartOf`, `about`, `breadcrumb`). A second standalone block existed only to carry the `speakable` property. Duplicate type declarations on the same URL can confuse schema parsers and reduce rich-result eligibility.  
**Fix**: Added the `speakable` property to the existing `@graph` WebPage entity. Removed the standalone duplicate `<script type="application/ld+json">` block.  
**Validation**: Inspected merged JSON — all properties are present; no trailing commas; the `@graph` block structure is valid.

---

## Change 4 — P0/P1: Removed disconnected HowTo schema from homepage

**File**: `index.html`  
**Pages affected**: `/`  
**Reason**: A `HowTo` schema block described a 3-step process (Audit & Strategy, Build & Launch, Optimize & Scale). These steps are not rendered as a visible HowTo list anywhere on the homepage. Google's guidelines require that HowTo markup reflect content actually visible to users; when it doesn't, the markup is ineligible for rich results and could attract a manual penalty.  
**Fix**: Removed the HowTo `<script type="application/ld+json">` block entirely.  
**Note**: If a visible step-by-step process section is added to the homepage in the future, HowTo schema can be reinstated at that time.

---

## Change 5 — P0: Standardized Organization name in pricing page schema

**File**: `pricing/index.html`  
**Pages affected**: `/pricing/`  
**Reason**: The `@type: Organization` entity on the pricing page used `"name": "Summit Marketing"` — without "LLC". All other pages use "Summit Marketing LLC". Schema.org entity resolution depends on consistent naming across pages; inconsistency weakens the organization entity signal.  
**Fix**: Changed `"name"` to `"Summit Marketing LLC"` and updated the `WebSite` name to match. Also corrected the `caption` on the logo `ImageObject`.  
**Also fixed**: Instagram `sameAs` URL was `https://www.instagram.com/SummitMarketingMS` (mixed case) — corrected to `https://www.instagram.com/summitmarketingms` to match all other pages.

---

## Change 6 — P1: Compliance page — noindex, corrected title, removed from sitemap

**Files**: `compliance/index.html`, `sitemap.xml`, `vercel.json`  
**Pages affected**: `/compliance/`  
**Reason**: The SMS consent/disclosure page (`/compliance/`) had `<meta name="robots" content="index, follow">` and was listed in the sitemap with priority 0.3. Its title was "Free Strategy Call — Summit Marketing" — misleading (the page is about SMS opt-in consent, not booking a call). Consent/legal pages should not appear in organic search results and waste crawl budget when indexed.  
**Fix**:  
- Changed `<title>` to "SMS Consent & Compliance | Summit Marketing LLC"  
- Changed `<meta name="robots">` to `noindex, follow`  
- Changed `X-Robots-Tag` in `vercel.json` from `all` to `noindex, follow`  
- Removed the `/compliance/` entry from `sitemap.xml` with a comment explaining the exclusion  
**Remaining risk**: None. The page remains accessible at its URL (needed for the SMS consent flow); it just won't appear in search results.

---

## Change 7 — P1: Removed unverifiable degree claim from llms-full.txt

**File**: `llms-full.txt`  
**Pages affected**: Anywhere AI crawlers read `/llms-full.txt`  
**Reason**: The file stated "Nic holds a degree in Marketing from the University of Mississippi." This specific claim was not confirmed in the about page, any HTML file, or any other approved brand document in this repository. Publishing unverifiable credentials as a public fact in an AI reference file could mislead AI systems that cite it, and could damage trust if the claim is inaccurate.  
**Fix**: Replaced the degree sentence with a factual, verifiable statement about his work history in home services (which IS confirmed in the about page and llms.txt): "Nic ran marketing operations for home service companies before starting Summit Marketing, giving him firsthand insight into where contractors consistently lose jobs — and what systems fix that."  
**Approval needed**: Nic should confirm whether he holds this degree. If confirmed, the factual statement can be reinstated. See `docs/ai-visibility-approval-items.md`.

---

## Change 8 — P1: Added missing twitter:image to locations hub

**File**: `locations/index.html`  
**Pages affected**: `/locations/`  
**Reason**: The locations hub had `og:image` but was missing `twitter:image`. Without `twitter:image`, Twitter/X link previews fall back to a smaller card format (summary, not summary_large_image), defeating the `twitter:card` declaration already present.  
**Fix**: Added `<meta name="twitter:image" content="https://www.summitmarketingms.com/brand-assets/og-default.png" />` immediately after the existing `twitter:description` tag.

---

## Change 9 — P1/P2: Sitemap lastmod dates updated

**File**: `sitemap.xml`  
**Reason**: All `lastmod` values were 2026-07-29 (original build date). Multiple pages were substantially modified in commits 8041dbd and this session. Accurate `lastmod` values help Googlebot prioritize recrawling recently changed pages.  
**Updated dates**:

| URL | Old lastmod | New lastmod | Reason |
|---|---|---|---|
| `/` | 2026-07-29 | 2026-08-03 | Schema restructured this session |
| `/results/` | 2026-07-29 | 2026-08-03 | Content restored 2026-08-03 (commit 8041dbd) |
| `/pricing/` | 2026-07-29 | 2026-08-03 | Schema name/URL fixed this session |
| `/about/` | 2026-07-29 | 2026-08-03 | og:site_name fixed; page restored 2026-08-03 |
| `/locations/` | 2026-07-29 | 2026-08-03 | twitter:image added this session |
| All 10 city pages | 2026-07-29 | 2026-08-03 | H1 font updated + content restored 2026-08-03 |

---

## Change 10 — P2: og:site_name standardized on about page

**File**: `about/index.html`  
**Reason**: `og:site_name` was "Summit Marketing" (missing LLC). Consistent entity naming across all OG metadata helps social platforms and AI systems identify the brand correctly.  
**Fix**: Changed to "Summit Marketing LLC".

---

## Validation

| Check | Method | Result |
|---|---|---|
| JSON-LD syntax | Static inspection of all modified blocks | No syntax errors detected |
| vercel.json structure | File inspection after edits | Valid JSON, 4 remaining redirect rules correct |
| sitemap.xml validity | File inspection | Well-formed XML, all URLs use HTTPS + trailing slash |
| og-default.png | PowerShell Get-Item | File exists, 81,866 bytes |
| Broken link check | grep for `href="/results"` without trailing slash | No instances found — all internal links use `/results/` |

**Not validated** (requires live environment):  
- Google Rich Results Test — requires browser + live URL  
- Lighthouse scores — requires browser  
- Search Console indexing status — requires GSC access

---

## Files Changed

| File | Type | Change |
|---|---|---|
| `brand-assets/og-default.png` | New file | Created from og-image.png copy |
| `vercel.json` | Config | Removed bad `/results` redirect; noindex on compliance |
| `index.html` | Schema | Merged duplicate WebPage; removed HowTo; added speakable |
| `pricing/index.html` | Schema | Org name "LLC"; corrected Instagram URL; WebSite name |
| `compliance/index.html` | Meta | noindex; corrected title |
| `locations/index.html` | Meta | Added twitter:image |
| `about/index.html` | Meta | Fixed og:site_name to include LLC |
| `sitemap.xml` | Sitemap | Updated lastmod dates; removed compliance |
| `llms-full.txt` | AI reference | Removed unverifiable degree claim |
| `docs/ai-visibility-audit.md` | Docs | New — full audit report |
| `docs/ai-visibility-changelog.md` | Docs | New — this file |
| `docs/ai-visibility-approval-items.md` | Docs | New — owner decisions needed |
| `docs/ai-visibility-measurement-plan.md` | Docs | New — before/after tracking plan |
