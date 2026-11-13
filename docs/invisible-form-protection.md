# Summit invisible form protection

This change moves lead submissions behind `api/lead.js`. The browser no longer sends the GHL webhook URL directly.

## Vercel environment variables

Add these variables to the Summit Vercel project for Preview and Production:

- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key for `www.summitmarketingms.com` and `go.summitmarketingms.com`.
- `GHL_WEBHOOK_URL`: a new GoHighLevel inbound webhook URL for the Summit Marketing LLC location. Do not reuse the currently exposed URL after rollout.

The public Turnstile site key is intentionally not stored as a secret. Put it in `Snippets/summit-form-protection.js.txt` in place of `PASTE_TURNSTILE_SITE_KEY_HERE` before pasting that script into the GHL custom HTML form.

## GHL custom-code change

In the Summit Formfill custom HTML block:

1. Remove the old script that posts directly to `services.leadconnectorhq.com/hooks/...`.
2. Paste the contents of `Snippets/summit-form-protection.js.txt` after the form markup.
3. Replace `PASTE_TURNSTILE_SITE_KEY_HERE` with the Turnstile site key.
4. Keep both form IDs (`smfMain` and `smfMain2`) if the form is used both inline and in the booking modal.

The script uses invisible Turnstile, adds a honeypot and completion-time field, sends to `https://www.summitmarketingms.com/api/lead`, and only displays success after the Vercel endpoint confirms that GoHighLevel accepted the lead.

## Rollout order

1. Create a new inbound webhook workflow/trigger in GoHighLevel and copy its URL into `GHL_WEBHOOK_URL`.
2. Create the Turnstile site in Cloudflare and add the site key to the GHL custom code and the secret key to Vercel.
3. Deploy this branch to a Vercel Preview deployment.
4. Test one legitimate submission and several blocked cases: empty honeypot, missing Turnstile token, too-fast submission, and an explicit escort/sexual-spam phrase.
5. Update the GHL form custom code to use the proxy.
6. Confirm the legitimate submission reaches the new GHL workflow, then disable the old webhook workflow/trigger.

Do not expose either the Turnstile secret key or the new GHL webhook URL in HTML, JavaScript, Git history, or client-side network requests.
