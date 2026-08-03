# AI Visibility & SEO — Items Requiring Owner Approval
**Date**: 2026-08-03  
**Instructions**: Review each item below. For each one, either confirm the fact / approve the change, or provide the correct information. Nothing in this list has been changed without your approval except where noted.

---

## Item 1 — CONFIRM: Nic's educational background

**Priority**: P1  
**Current state**: `llms-full.txt` previously stated "Nic holds a degree in Marketing from the University of Mississippi." This was removed because it could not be verified from the codebase or any approved document in this repository.  
**Action needed**: Please confirm whether this is accurate.  
- If **yes**: Add it back to `llms-full.txt` and, ideally, mention it on the about page so it is verifiable from visible page content.  
- If **no**: The current neutral language ("Nic ran marketing operations for home service companies before starting Summit Marketing…") is correct and no further action is needed.

---

## Item 2 — APPROVE OR REVISE: Homepage H1

**Priority**: P2  
**Current H1**: "Your strategic partner for a truly profitable business"  
**Issue**: The current H1 is generic — it contains no geographic signal (Mississippi) and no niche signal (contractors, home services). For local search, H1s with clear geo + service context perform better and signal more relevantly to AI systems answering queries like "who's the best marketing agency for contractors in Mississippi?"  
**Proposed revision** (for your consideration only — requires your approval before any change):

> "Mississippi's Revenue Engine for Home Service Contractors"

Or, to keep the aspirational tone:

> "Your strategic growth partner for Mississippi contractors"

**Action needed**: Approve a revised H1, or confirm the current one should stay. No change will be made without your explicit approval — this is a brand decision.

---

## Item 3 — CONFIRM: Service area includes Meridian, MS

**Priority**: P2  
**Issue**: The homepage FAQPage schema and `llms-full.txt` both list Meridian as a service area ("Jackson, Gulfport, Biloxi, Hattiesburg, Meridian, Tupelo, and Southaven"). However, Meridian has no location page on the site and is not in the sitemap.  
**Options**:
1. **Confirm and keep**: If you do serve Meridian, the text is accurate — no change needed. You may optionally add a Meridian location page in the future.
2. **Remove from FAQ schema**: If Meridian is not a current focus market, remove it from the homepage FAQPage schema answer to keep all mentions consistent.

---

## Item 4 — DECIDE: Location page content differentiation

**Priority**: P2  
**Issue**: All 10 city location pages share near-identical structure. The unique content per page is limited to a single paragraph specific to the city. Google treats pages with very similar content as having a "thin content" signal, which can suppress them from surfacing for city-specific queries.  
**Recommended fix**: Add 2–3 city-specific paragraphs per page covering:
- The specific industries or contractor types most common in that city
- A local market fact (population growth, weather-driven service demand, etc.)
- A local competitor landscape observation (if verifiable)

**Action needed**: Confirm you want this done, and optionally provide city-specific notes. This requires your input because the content must be factually accurate — I will not invent city statistics.

---

## Item 5 — DECIDE: Named case studies on Results page

**Priority**: P2  
**Issue**: The Results page shows 6 Google reviews (which are real and visible) but no case studies with specific before/after metrics. AI citation engines prioritize pages with specific, attributable results (e.g., "Client X increased booked appointments by 40% in 60 days").  
**Recommended fix**: Add 2–3 case study cards with:
- Client first name or anonymized title (e.g., "Jackson HVAC Contractor")
- Service used
- Specific, verifiable outcome (calls answered, leads captured, reviews generated)
- Approximate timeline

**Action needed**: If you have real client results you can share (with client permission), provide them. Nothing will be added without real data.

---

## Item 6 — CONFIRM: Social media profile URLs

**Priority**: P2  
**Current in schema**: 
- Facebook: `https://www.facebook.com/SummitMarketingMS`
- Instagram: `https://www.instagram.com/summitmarketingms`

**Action needed**: Confirm these are the correct, live profile URLs. If either profile has a different URL slug or doesn't exist yet, the `sameAs` values should be corrected or removed. Incorrect `sameAs` values actively mislead entity resolution.

---

## Item 7 — DECIDE: Google Search Console setup

**Priority**: P0 for ongoing monitoring  
**Issue**: No Search Console verification was found in the repository. Without GSC, you cannot:
- See which queries are bringing impressions/clicks
- Monitor index coverage issues
- Get notified of manual penalties
- Submit the sitemap for faster indexing
- See Core Web Vitals from field data

**Action needed**: If GSC is not yet set up, do so at https://search.google.com/search-console — verify via DNS TXT record (preferred) or HTML file. Once verified, submit the sitemap at: `https://www.summitmarketingms.com/sitemap.xml`.  
If GSC is already set up under a different email, no repo change is needed — just confirm it's active.

---

## Item 8 — DECIDE: Bing Webmaster Tools

**Priority**: P1  
**Issue**: No Bing Webmaster Tools verification in the repo. Perplexity, Copilot, and Bing AI Mode all use Bing's index as a primary signal for AI answers. Without Bing indexing confirmation, the site may be slower to appear in Bing-powered AI answers.  
**Action needed**: Set up Bing Webmaster Tools at https://www.bing.com/webmasters/, verify the site, and submit the sitemap. Can also import from GSC to save time.

---

## Item 9 — DECIDE: Google Analytics 4 conversion tracking

**Priority**: P1  
**Issue**: GA4 is installed (`G-7R81TMRFN4`) but no conversion events are visible in the repository code. Without conversion tracking, you cannot measure which pages/channels are driving form submissions, phone calls, or audit tool completions.  
**Recommended events to configure in GA4**:
- `generate_lead` — on contact form submission
- `phone_call` — on `tel:` link clicks
- `audit_submitted` — on audit tool form submission
- `book_call_click` — on "Book a Call" CTA clicks

**Action needed**: Configure these in GA4 directly (no repo change required for standard GA4 events). If tag-based tracking is preferred, add event listeners to the relevant buttons.

---

## Item 10 — CONFIRM: Physical address is public-facing appropriate

**Priority**: P1 (legal / privacy)  
**Issue**: The address `4725 US Highway 80 E, Pearl, MS 39208` appears in the `Organization` schema on every page, in `llms.txt`, and in `llms-full.txt`. If this is a home address or the business is home-based, exposing it sitewide may not be desirable.  
**Action needed**: Confirm the address is appropriate to display publicly in schema markup. If it's a registered business address (office, mailbox), it's fine. If it's a home address, consider replacing with a PO Box or registered agent address in the schema.

---

## Non-Blocking Observation

**Logo filename typo**: The logo file is named `Summt Marketing LOGO.png` (missing the 'i' in Summit). This appears in schema URLs as `Summt%20Marketing%20LOGO.png`. The file resolves correctly because the actual filename matches. This is cosmetic only — renaming would require updating every page's `<link rel="icon">`, `<link rel="apple-touch-icon">`, and schema references. Flag for a future cleanup sprint if desired.
