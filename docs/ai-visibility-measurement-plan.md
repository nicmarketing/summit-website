# AI Visibility & SEO — Measurement Plan
**Date**: 2026-08-03  
**Purpose**: Establish a before/after baseline for the changes made in this audit session and define the metrics, tools, prompts, and cadence for ongoing measurement.

---

## Baseline Snapshot — 2026-08-03

Record these values at the time of reading. If GSC/Bing are not yet set up, mark as "Not yet active" and fill in after setup.

### A. Google Search Console

| Metric | Baseline (date) | 30-day target | 90-day target |
|---|---|---|---|
| Total impressions (last 28 days) | — | — | — |
| Total clicks (last 28 days) | — | — | — |
| Average CTR | — | — | — |
| Average position | — | — | — |
| Index coverage — valid pages | — | — | — |
| Index coverage — errors | — | — | — |

**URLs to monitor in GSC URL Inspection**:
- `https://www.summitmarketingms.com/`
- `https://www.summitmarketingms.com/services/`
- `https://www.summitmarketingms.com/results/`
- `https://www.summitmarketingms.com/pricing/`
- `https://www.summitmarketingms.com/locations/`
- `https://www.summitmarketingms.com/locations/jackson-ms/`

**Query segments to filter and track separately**:
- Branded: `summit marketing`, `summit marketing ms`, `summit marketing mississippi`
- Contractor marketing: `contractor marketing mississippi`, `hvac marketing mississippi`, `plumber marketing jackson ms`
- AI/AEO: `ai receptionist for contractors`, `marketing agency jackson ms`, `marketing automation mississippi`

---

### B. Bing Webmaster Tools

| Metric | Baseline (date) | 30-day target | 90-day target |
|---|---|---|---|
| Impressions (last 28 days) | — | — | — |
| Clicks (last 28 days) | — | — | — |
| Pages crawled | — | — | — |
| Pages indexed | — | — | — |

---

### C. Google Analytics 4

| Metric | Baseline (date) | 30-day | 90-day |
|---|---|---|---|
| Sessions (last 28 days) | — | — | — |
| Organic sessions | — | — | — |
| Top landing pages (organic) | — | — | — |
| Contact form submissions | — | — | — |
| Audit tool submissions | — | — | — |
| Phone call clicks | — | — | — |
| Book a Call CTA clicks | — | — | — |

**GA4 property**: `G-7R81TMRFN4`  
**Note**: Conversion events must be configured in GA4 before the above conversion metrics are trackable. See `docs/ai-visibility-approval-items.md` Item 9.

---

### D. AI Visibility Spot-Checks

These are manual checks using AI tools. Run them in a private/incognito window with no location bias where possible. Record the exact tool, date, locale, and prompt used.

**Prompt set (run monthly at minimum)**:

| # | Prompt | Tool | Expected outcome |
|---|---|---|---|
| 1 | "What is Summit Marketing LLC?" | ChatGPT (GPT-4o), Perplexity, Gemini | Named mention with Pearl MS / contractors |
| 2 | "Best marketing agency for home service contractors in Mississippi" | ChatGPT, Perplexity, Gemini | Summit Marketing mentioned or linked |
| 3 | "Marketing agency in Jackson Mississippi" | ChatGPT, Perplexity, Gemini, Google AI Overview | Summit Marketing mentioned |
| 4 | "AI receptionist for plumbers near Jackson MS" | ChatGPT, Perplexity | Summit Marketing as relevant provider |
| 5 | "Who is Nic Butts marketing?" | ChatGPT, Perplexity | Nic Butts / Summit Marketing connection |
| 6 | "Summit Marketing Mississippi pricing" | Perplexity, ChatGPT | Correct plan names and prices |

**Result template** (fill in monthly):

```
Date: ___________
Tool: ___________
Prompt: ___________
Response summary: ___________
Was Summit Marketing mentioned? Yes / No / Partial
Was information accurate? Yes / No / Errors: ___________
Citation source shown: ___________
```

---

### E. Rich Results / Schema Status

Run these manually after each major schema change:

| Check | Tool | Baseline status | Last checked |
|---|---|---|---|
| Organization / LocalBusiness | Google Rich Results Test | — | 2026-08-03 (not yet run) |
| FAQPage (homepage) | Google Rich Results Test | — | — |
| FAQPage (faq page) | Google Rich Results Test | — | — |
| AggregateRating + Reviews | Google Rich Results Test | — | — |
| BreadcrumbList | Google Rich Results Test | — | — |
| Speakable (homepage) | Google Rich Results Test | — | — |

**URL for Rich Results Test**: https://search.google.com/test/rich-results

---

### F. Core Web Vitals (Field Data from GSC)

Check in GSC under Experience → Core Web Vitals after at least 28 days of data.

| Metric | Baseline | Target |
|---|---|---|
| LCP (Largest Contentful Paint) — mobile | — | < 2.5s |
| INP (Interaction to Next Paint) — mobile | — | < 200ms |
| CLS (Cumulative Layout Shift) — mobile | — | < 0.1 |
| LCP — desktop | — | < 2.5s |

---

## Monitoring Cadence

| Frequency | Action |
|---|---|
| **Weekly** | Check GSC for new coverage errors or drops in impressions |
| **Monthly** | Run full AI prompt set across ChatGPT, Perplexity, and Gemini. Export GSC + GA4 data. |
| **Quarterly** | Full page quality review — update case studies, review FAQ accuracy, refresh location content |
| **After each deployment** | Run Rich Results Test on any page whose schema changed |

---

## What to Measure as "Success" for This Audit Session

The changes made on 2026-08-03 were primarily technical (schema cleanup, crawl unblocking, meta fixes). Technical fixes don't move metrics overnight — they remove blockers that allow real content quality to translate into rankings and citations. Set 30-day and 90-day checkpoints:

**30 days (by 2026-09-03)**:
- GSC shows `/results/` and all location pages indexing cleanly (no coverage errors)
- OG images resolved for all 11 location pages (confirm via link preview debugger)
- No rich-result errors for the pages whose schema was fixed

**90 days (by 2026-11-03)**:
- Organic impressions stable or trending up in GSC
- At least 1 of the 6 AI prompts above returns a Summit Marketing mention
- Location pages showing impressions for city-specific queries in GSC

---

## Tools Required (External — No Repo Changes Needed)

| Tool | URL | Purpose |
|---|---|---|
| Google Search Console | https://search.google.com/search-console | Index, rankings, CWV |
| Bing Webmaster Tools | https://www.bing.com/webmasters/ | Bing index + Copilot signals |
| Google Rich Results Test | https://search.google.com/test/rich-results | Schema validation |
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ | OG image validation |
| Twitter Card Validator | https://cards-dev.twitter.com/validator | twitter:image validation |
| PageSpeed Insights | https://pagespeed.web.dev/ | CWV lab data |
