import https from 'https';
import http from 'http';
import { URL } from 'url';

async function fetchPage(rawUrl, maxRedirects = 6) {
  const start = Date.now();
  let currentUrl = rawUrl;
  for (let i = 0; i <= maxRedirects; i++) {
    const result = await new Promise((resolve, reject) => {
      let parsed;
      try { parsed = new URL(currentUrl); } catch (e) { return reject(e); }
      const lib = parsed.protocol === 'https:' ? https : http;
      const opts = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: (parsed.pathname || '/') + parsed.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SummitAuditBot/1.0; +https://summitmarketingms.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 12000,
      };
      const req = lib.get(opts, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          try {
            const next = new URL(res.headers.location, currentUrl).href;
            resolve({ redirect: next });
          } catch { resolve({ redirect: res.headers.location }); }
          res.resume();
          return;
        }
        const chunks = [];
        let size = 0;
        res.on('data', chunk => {
          chunks.push(chunk);
          size += chunk.length;
          if (size > 1024 * 1024) req.destroy();
        });
        res.on('end', () => resolve({
          html: Buffer.concat(chunks).toString('utf8'),
          statusCode: res.statusCode,
          finalUrl: currentUrl,
          time: Date.now() - start,
          isHttps: parsed.protocol === 'https:',
        }));
        res.on('error', reject);
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    });
    if (result.redirect) { currentUrl = result.redirect; continue; }
    return result;
  }
  throw new Error('Too many redirects');
}

async function checkExists(url) {
  try {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    return await new Promise((resolve) => {
      const req = lib.get({
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SummitAuditBot/1.0)' },
        timeout: 6000,
      }, (res) => { res.resume(); resolve(res.statusCode < 400); });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    });
  } catch { return false; }
}

function extractMeta(html, name) {
  const r1 = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
  const r2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*name=["']${name}["']`, 'i');
  return (r1.exec(html) || r2.exec(html) || [])[1] || null;
}

function extractOG(html, prop) {
  const r1 = new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  const r2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:${prop}["']`, 'i');
  return (r1.exec(html) || r2.exec(html) || [])[1] || null;
}

function runChecks(html, pageData) {
  const { time, isHttps } = pageData;
  const results = [];
  let rawScore = 0;

  function check(id, category, label, pass, warn, description, maxPoints) {
    const status = pass ? 'pass' : warn ? 'warn' : 'fail';
    const earned = pass ? maxPoints : warn ? Math.round(maxPoints * 0.4) : 0;
    rawScore += earned;
    results.push({ id, category, label, status, description, earned, maxPoints });
  }

  check('https', 'On-Page SEO', 'HTTPS Secure Connection',
    isHttps, false,
    isHttps
      ? 'Your site uses HTTPS — a confirmed Google ranking signal that also builds user trust.'
      : 'Your site is not using HTTPS. This is a direct Google ranking penalty and scares users away.',
    5);

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1].trim() : null;
  const titleLen = titleText ? titleText.length : 0;
  const titleGood = titleLen >= 30 && titleLen <= 65;
  check('title', 'On-Page SEO', 'Title Tag',
    !!titleText && titleGood, !!titleText && !titleGood,
    titleText
      ? titleGood
        ? `"${titleText.slice(0, 65)}${titleLen > 65 ? '…' : ''}" (${titleLen} chars — optimal)`
        : `Title found (${titleLen} chars) but ${titleLen < 30 ? 'too short — add keywords' : 'too long — trim to under 65 chars'}`
      : 'No <title> tag found. This is the most critical on-page SEO element.',
    8);

  const metaDesc = extractMeta(html, 'description');
  const descLen = metaDesc ? metaDesc.length : 0;
  const descGood = descLen >= 100 && descLen <= 165;
  check('metadesc', 'On-Page SEO', 'Meta Description',
    !!metaDesc && descGood, !!metaDesc && !descGood,
    metaDesc
      ? descGood
        ? `Description found (${descLen} chars — optimal). Good click-through optimization.`
        : `Description found but ${descLen < 100 ? 'too short (' + descLen + ' chars, aim for 100+)' : 'too long (' + descLen + ' chars, trim to under 165)'}`
      : 'No meta description. You\'re leaving click-through rate on the table.',
    8);

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Count = h1s.length;
  const h1Text = h1Count > 0 ? h1s[0][1].replace(/<[^>]+>/g, '').trim().slice(0, 80) : null;
  check('h1', 'On-Page SEO', 'H1 Heading Tag',
    h1Count === 1, h1Count > 1,
    h1Count === 0 ? 'No H1 tag found. Every page needs exactly one H1 — it\'s a primary keyword signal.'
      : h1Count === 1 ? `H1: "${h1Text}"`
      : `${h1Count} H1 tags found. Use exactly one H1 per page — multiple H1s dilute keyword signals.`,
    7);

  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  check('h2', 'On-Page SEO', 'Subheading Structure (H2+)',
    h2Count >= 2, h2Count === 1,
    h2Count === 0 ? 'No H2 headings found. Add subheadings to organize content and target secondary keywords.'
      : h2Count === 1 ? '1 H2 found. Add more subheadings to improve content structure and scannability.'
      : `${h2Count} H2 headings found — solid content hierarchy.`,
    4);

  const viewport = extractMeta(html, 'viewport');
  check('viewport', 'On-Page SEO', 'Mobile Viewport Tag',
    !!viewport, false,
    viewport ? 'Mobile viewport meta tag present — site signals mobile-friendliness.'
      : 'No viewport meta tag. Your site may not render correctly on mobile devices, hurting rankings.',
    5);

  const imgTags = [...html.matchAll(/<img[^>]*>/gi)];
  const imgCount = imgTags.length;
  const imgsWithAlt = imgTags.filter(m => /alt=["'][^"']{1,}["']/i.test(m[0])).length;
  const altRatio = imgCount > 0 ? imgsWithAlt / imgCount : 1;
  check('imgalt', 'On-Page SEO', 'Image Alt Text',
    imgCount === 0 || altRatio >= 0.9, imgCount > 0 && altRatio >= 0.5 && altRatio < 0.9,
    imgCount === 0 ? 'No images detected on this page.'
      : altRatio >= 0.9 ? `${imgsWithAlt}/${imgCount} images have alt text — excellent accessibility and image SEO.`
      : `Only ${imgsWithAlt} of ${imgCount} images have alt text (${Math.round(altRatio * 100)}%). Missing alt tags hurt SEO and accessibility.`,
    5);

  const canonical = (/<link[^>]+rel=["']canonical["'][^>]*>/i).test(html);
  check('canonical', 'Technical SEO', 'Canonical Tag',
    canonical, false,
    canonical ? 'Canonical tag present — prevents duplicate content penalties.'
      : 'No canonical tag. Without it, duplicate URLs can split your ranking authority.',
    5);

  const speedGood = time < 1500, speedOk = time < 3000;
  check('speed', 'Technical SEO', 'Page Response Speed',
    speedGood, !speedGood && speedOk,
    `Server responded in ${time}ms. ${speedGood ? 'Excellent — fast servers boost rankings and conversions.' : speedOk ? 'Acceptable, but aim for under 1,500ms for optimal rankings.' : 'Slow response time. Investigate server performance, caching, and hosting.'}`,
    6);

  const ogTitle = extractOG(html, 'title');
  const ogDesc = extractOG(html, 'description');
  const ogImage = extractOG(html, 'image');
  const ogCount = [ogTitle, ogDesc, ogImage].filter(Boolean).length;
  check('ogtags', 'Technical SEO', 'Open Graph Tags (Social Sharing)',
    ogCount === 3, ogCount >= 1,
    ogCount === 3 ? 'All Open Graph tags present — your links will look polished when shared on social.'
      : ogCount >= 1 ? `Partial OG tags found. Missing: ${[!ogTitle && 'og:title', !ogDesc && 'og:description', !ogImage && 'og:image'].filter(Boolean).join(', ')}.`
      : 'No Open Graph tags found. Every share of your link will look generic and unbranded.',
    6);

  const twitterCard = extractMeta(html, 'twitter:card');
  check('twitter', 'Technical SEO', 'Twitter / X Card Tags',
    !!twitterCard, false,
    twitterCard ? `Twitter Card type: "${twitterCard}" — optimized social previews on X.`
      : 'No Twitter/X card tags. Add them to control your link appearance on social platforms.',
    4);

  const jsonldBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const schemaTypes = [];
  for (const block of jsonldBlocks) {
    try {
      const obj = JSON.parse(block[1]);
      const arr = Array.isArray(obj) ? obj : [obj];
      for (const item of arr) {
        const t = item['@type'];
        if (Array.isArray(t)) schemaTypes.push(...t);
        else if (t) schemaTypes.push(t);
        if (item['@graph']) {
          for (const node of item['@graph']) {
            const nt = node['@type'];
            if (Array.isArray(nt)) schemaTypes.push(...nt);
            else if (nt) schemaTypes.push(nt);
          }
        }
      }
    } catch {}
  }

  check('schema', 'AI & LLM Visibility', 'Structured Data (JSON-LD Schema)',
    jsonldBlocks.length > 0, false,
    jsonldBlocks.length > 0
      ? `${jsonldBlocks.length} JSON-LD block(s) detected. Types: ${schemaTypes.slice(0, 6).join(', ') || 'detected'}.`
      : 'No structured data found. Schema markup is the #1 factor for appearing in AI-generated answers (Google SGE, Bing Copilot, ChatGPT).',
    10);

  const hasOrg = schemaTypes.some(t => ['Organization', 'LocalBusiness', 'Corporation', 'MedicalOrganization', 'EducationalOrganization'].includes(t));
  check('org', 'AI & LLM Visibility', 'Organization Schema',
    hasOrg, false,
    hasOrg ? 'Organization schema found — AI tools and search engines can identify and describe your business.'
      : 'No Organization schema. Without it, AI search tools struggle to surface your business in knowledge panels.',
    6);

  const hasFAQ = schemaTypes.includes('FAQPage');
  check('faq', 'AI & LLM Visibility', 'FAQ Schema',
    hasFAQ, false,
    hasFAQ ? 'FAQPage schema found — your content is eligible for rich result FAQ boxes and AI answer extraction.'
      : 'No FAQ schema. FAQ markup is one of the highest-impact AI visibility wins — add it to your most-visited pages.',
    6);

  const hasWebsite = schemaTypes.includes('WebSite');
  check('website', 'AI & LLM Visibility', 'WebSite Schema',
    hasWebsite, false,
    hasWebsite ? 'WebSite schema present — enables Google Sitelinks search box and improves entity recognition.'
      : 'No WebSite schema. Add it to enable Google Sitelinks and improve how AI describes your site.',
    5);

  const hasBreadcrumb = schemaTypes.includes('BreadcrumbList');
  check('breadcrumb', 'AI & LLM Visibility', 'Breadcrumb Schema',
    hasBreadcrumb, false,
    hasBreadcrumb ? 'Breadcrumb schema found — improves URL appearance in search results and page context for AI.'
      : 'No breadcrumb schema. Breadcrumbs help search engines and AI understand your site structure.',
    4);

  const hasArticle = schemaTypes.some(t => ['Article', 'BlogPosting', 'NewsArticle', 'WebPage'].includes(t));
  check('article', 'AI & LLM Visibility', 'Article / Page Schema',
    hasArticle, false,
    hasArticle ? `${schemaTypes.find(t => ['Article', 'BlogPosting', 'NewsArticle', 'WebPage'].includes(t))} schema detected — content is structured for AI indexing.`
      : 'No Article or WebPage schema. Add it so AI-powered tools can properly attribute and index your content.',
    4);

  return { results, rawScore };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { url: rawUrl, name = '', company = '', email = '' } = req.body || {};
  if (!rawUrl) { res.status(400).json({ error: 'URL is required' }); return; }

  let url = rawUrl.trim();
  if (!url.match(/^https?:\/\//i)) url = 'https://' + url;

  let parsed;
  try { parsed = new URL(url); } catch { res.status(400).json({ error: 'Invalid URL format.' }); return; }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported.' }); return;
  }

  try {
    const pageData = await fetchPage(url);
    const { results, rawScore } = runChecks(pageData.html, pageData);

    const baseOrigin = new URL(pageData.finalUrl).origin;
    const [hasRobots, hasSitemap] = await Promise.all([
      checkExists(`${baseOrigin}/robots.txt`),
      checkExists(`${baseOrigin}/sitemap.xml`),
    ]);

    const robotsEarned = hasRobots ? 5 : 2;
    const sitemapEarned = hasSitemap ? 5 : 2;
    results.push({
      id: 'robots', category: 'Technical SEO', label: 'robots.txt',
      status: hasRobots ? 'pass' : 'warn',
      description: hasRobots ? 'robots.txt found — search crawlers can read your crawl directives.'
        : 'No robots.txt found. Add one to guide how search engines crawl your site.',
      earned: robotsEarned, maxPoints: 5,
    });
    results.push({
      id: 'sitemap', category: 'Technical SEO', label: 'XML Sitemap',
      status: hasSitemap ? 'pass' : 'warn',
      description: hasSitemap ? 'sitemap.xml found — all your pages are discoverable by search engines.'
        : 'No sitemap.xml found. A sitemap ensures all your pages get crawled and indexed.',
      earned: sitemapEarned, maxPoints: 5,
    });

    const totalRaw = rawScore + robotsEarned + sitemapEarned;
    const maxTotal = results.reduce((s, r) => s + r.maxPoints, 0);
    const score = Math.round(totalRaw / maxTotal * 100);

    const cats = ['On-Page SEO', 'Technical SEO', 'AI & LLM Visibility'];
    const catScores = {};
    for (const cat of cats) {
      const cr = results.filter(r => r.category === cat);
      const earned = cr.reduce((s, r) => s + r.earned, 0);
      const max = cr.reduce((s, r) => s + r.maxPoints, 0);
      catScores[cat] = { earned, max, pct: Math.round(earned / max * 100) };
    }

    let grade, gradeLabel, gradeColor;
    if (score >= 85)      { grade = 'A'; gradeLabel = 'Excellent';       gradeColor = '#00c875'; }
    else if (score >= 70) { grade = 'B'; gradeLabel = 'Good';            gradeColor = '#41D9F2'; }
    else if (score >= 50) { grade = 'C'; gradeLabel = 'Needs Work';      gradeColor = '#f0a500'; }
    else if (score >= 30) { grade = 'D'; gradeLabel = 'Poor';            gradeColor = '#ff6b35'; }
    else                  { grade = 'F'; gradeLabel = 'Critical Issues'; gradeColor = '#e53e3e'; }

    res.status(200).json({ score, grade, gradeLabel, gradeColor, url: pageData.finalUrl, catScores, results });

    // ── EMAIL NOTIFICATION ──────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const fails  = results.filter(r => r.status === 'fail').map(r => `<li>❌ <b>${r.label}</b> — ${r.description}</li>`).join('');
      const passes = results.filter(r => r.status === 'pass').map(r => `<li>✅ <b>${r.label}</b></li>`).join('');
      const catRows = Object.entries(catScores).map(([cat, s]) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${cat}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right"><b>${s.pct}%</b> (${s.earned}/${s.max})</td></tr>`
      ).join('');

      const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
  <div style="background:#002060;padding:28px 32px;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:22px">🔍 New Audit Submission</h1>
    <p style="color:#41D9F2;margin:8px 0 0;font-size:14px">Summit Marketing Audit Tool</p>
  </div>
  <div style="background:#f8f9ff;padding:28px 32px;border:1px solid #e0e4f0">
    <h2 style="margin:0 0 16px;font-size:16px;color:#002060">Lead Info</h2>
    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e4f0">
      <tr><td style="padding:8px 14px;border-bottom:1px solid #eee;color:#666;width:140px">Name</td><td style="padding:8px 14px;border-bottom:1px solid #eee"><b>${name}</b></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #eee;color:#666">Email</td><td style="padding:8px 14px;border-bottom:1px solid #eee"><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #eee;color:#666">Company</td><td style="padding:8px 14px;border-bottom:1px solid #eee"><b>${company}</b></td></tr>
      <tr><td style="padding:8px 14px;color:#666">Website</td><td style="padding:8px 14px"><a href="${pageData.finalUrl}">${pageData.finalUrl}</a></td></tr>
    </table>

    <h2 style="margin:24px 0 16px;font-size:16px;color:#002060">Audit Results</h2>
    <div style="background:#fff;border-radius:8px;border:1px solid #e0e4f0;padding:20px 24px;text-align:center;margin-bottom:16px">
      <div style="font-size:56px;font-weight:900;color:${gradeColor};line-height:1">${grade}</div>
      <div style="font-size:28px;font-weight:700;color:#1a1a2e;margin:4px 0">${score}/100</div>
      <div style="color:#666;font-size:14px">${gradeLabel} — ${pageData.finalUrl}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e4f0;margin-bottom:24px">
      ${catRows}
    </table>

    ${fails ? `<h3 style="color:#e53e3e;margin:0 0 10px;font-size:14px">Issues Found</h3><ul style="margin:0 0 20px;padding-left:20px;line-height:1.8">${fails}</ul>` : ''}
    ${passes ? `<h3 style="color:#00c875;margin:0 0 10px;font-size:14px">Passing Checks</h3><ul style="margin:0;padding-left:20px;line-height:1.8">${passes}</ul>` : ''}
  </div>
  <div style="background:#002060;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center">
    <p style="color:rgba(255,255,255,.6);font-size:12px;margin:0">Summit Marketing Audit Tool · summitmarketingms.com</p>
  </div>
</div>`;

      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Summit Audit <audit@summitmarketingms.com>',
          to: 'nic@summitmarketingms.com',
          subject: `🔍 Audit: ${company || email} — Score ${score}/100 (${grade}) — ${pageData.finalUrl}`,
          html,
        }),
      }).catch(() => {});
    }

  } catch (err) {
    res.status(200).json({ error: `Could not reach that site: ${err.message}. Please check the URL and try again.` });
  }
}
