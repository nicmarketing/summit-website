import { URLSearchParams } from 'url';

const ALLOWED_ORIGINS = new Set([
  'https://www.summitmarketingms.com',
  'https://summitmarketingms.com',
  'https://go.summitmarketingms.com',
]);

const GHL_HOST_SUFFIXES = [
  '.leadconnectorhq.com',
  '.msgsndr.com',
  '.highlevel.com',
  '.gohighlevel.com',
];

const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_IP = 8;
const recentSubmissions = new Map();

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === 'https:'
      && GHL_HOST_SUFFIXES.some(suffix => hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}

function getBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    return Object.fromEntries(new URLSearchParams(req.body));
  }
  return {};
}

function clean(value, maxLength = 2000) {
  return String(value || '').trim().slice(0, maxLength);
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return clean((Array.isArray(forwarded) ? forwarded[0] : forwarded || '').split(',')[0], 80)
    || clean(req.socket?.remoteAddress, 80)
    || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  for (const [key, timestamp] of recentSubmissions) {
    if (timestamp <= now - WINDOW_MS) recentSubmissions.delete(key);
  }
  const previous = recentSubmissions.get(ip) || 0;
  if (previous >= MAX_SUBMISSIONS_PER_IP) return true;
  recentSubmissions.set(ip, previous + 1);
  return false;
}

function looksLikeSpam(body) {
  const text = [body.message, body.company_name, body.first_name, body.last_name]
    .map(value => clean(value, 1000).toLowerCase())
    .join(' ');
  return /\b(escort|onlyfans|nudes?|porn|sex\s*work|explicit\s*photos?)\b/i.test(text);
}

async function verifyTurnstile(token, ip) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY || '',
      response: token,
      remoteip: ip,
    }),
  });
  if (!response.ok) return { success: false, errorCodes: [`siteverify-http-${response.status}`] };
  return response.json();
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const body = getBody(req);
  const ip = getClientIp(req);

  if (!process.env.TURNSTILE_SECRET_KEY || !process.env.GHL_WEBHOOK_URL) {
    console.error('Lead proxy is missing TURNSTILE_SECRET_KEY or GHL_WEBHOOK_URL');
    return res.status(503).json({ ok: false, error: 'Lead capture is temporarily unavailable' });
  }

  // Bots should never fill this field. Do not reveal which check rejected the request.
  if (clean(body.website, 200)) {
    console.error('Lead rejected: honeypot field was filled');
    return res.status(400).json({ ok: false, error: 'Unable to submit this request' });
  }
  if (looksLikeSpam(body)) {
    console.error('Lead rejected: spam content pattern');
    return res.status(400).json({ ok: false, error: 'Unable to submit this request' });
  }

  const startedAt = Number(body.form_started_at);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1800 || Date.now() - startedAt > 24 * 60 * 60 * 1000) {
    console.error('Lead rejected: invalid form_started_at');
    return res.status(400).json({ ok: false, error: 'Unable to submit this request' });
  }

  if (isRateLimited(ip)) {
    console.error('Lead rejected: rate limit');
    return res.status(429).json({ ok: false, error: 'Too many attempts. Please try again later.' });
  }

  const token = clean(body['cf-turnstile-response'] || body.turnstile_token, 4096);
  if (!token) {
    console.error('Lead rejected: missing Turnstile response');
    return res.status(400).json({ ok: false, error: 'Unable to verify this request' });
  }

  const verification = await verifyTurnstile(token, ip);
  if (!verification.success) {
    console.error('Lead rejected: Turnstile verification failed', {
      errorCodes: verification['error-codes'] || verification.errorCodes || [],
      hostname: verification.hostname || null,
      action: verification.action || null,
    });
    return res.status(403).json({ ok: false, error: 'Unable to verify this request' });
  }
  if (!verification.hostname || !verification.hostname.endsWith('summitmarketingms.com')) {
    console.error('Lead rejected: Turnstile hostname mismatch', {
      hostname: verification.hostname || null,
      action: verification.action || null,
    });
    return res.status(403).json({ ok: false, error: 'Unable to verify this request' });
  }

  const firstName = clean(body.first_name, 80);
  const lastName = clean(body.last_name, 80);
  const email = clean(body.email, 254).toLowerCase();
  const serviceInterest = clean(body.service_interest, 80);
  const phone = clean(body.phone, 40);
  const companyName = clean(body.company_name, 160);
  const message = clean(body.message, 4000);

  if (!firstName || !lastName || !/^\S+@\S+\.\S+$/.test(email) || !serviceInterest || body.sms_consent !== 'true') {
    return res.status(400).json({ ok: false, error: 'Please complete the required fields.' });
  }

  const forwarded = new URLSearchParams({
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    company_name: companyName,
    service_interest: serviceInterest,
    message,
    sms_consent: 'true',
    source: 'Summit Marketing Website',
    lead_source: 'Website Contact Form',
  });

  try {
    const ghlResponse = await fetch(process.env.GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: forwarded,
    });
    if (!ghlResponse.ok) {
      console.error('GHL webhook rejected lead', ghlResponse.status);
      return res.status(502).json({ ok: false, error: 'Lead capture is temporarily unavailable' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('GHL webhook request failed', error);
    return res.status(502).json({ ok: false, error: 'Lead capture is temporarily unavailable' });
  }
}
