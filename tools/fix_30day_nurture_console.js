/**
 * Summit Marketing — Fix 30-Day Nurture Sequence
 * Paste this entire script into your browser console while on the GHL
 * workflow page (the 30-Day Nurture builder must be open).
 *
 * Fixes applied:
 *  1. All SMS bodies: HTML <br> → plain line breaks + booking link CTAs
 *  2. Conversation AI step: configured with intent, instructions, channel
 *  3. "No Condition Met" branch: wired to exit steps instead of dead end
 *  4. Day 21 email: {{user.calendar_link}} → custom value booking URL
 *  5. Wait time inconsistencies corrected (2923/2952 min → 2880)
 *  6. stopOnResponse set to true at workflow level
 *  7. New exit steps added for "replied" path (remove tag + remove from WF)
 */

(async () => {
  const WORKFLOW_ID = 'af05ab6b-61a9-4e7f-a6eb-5689372854d1';
  const LOCATION_ID = 'ZQgxIJkBH8NFRqMczmMp';
  const BOOKING_LINK = '{{custom_values.marketing__website_booking_page_url}}';

  // ── 1. Find auth token ────────────────────────────────────────────────────
  let token = null;
  for (const key of Object.keys(localStorage)) {
    const val = localStorage.getItem(key);
    if (typeof val === 'string' && val.startsWith('eyJ')) {
      token = val;
      console.log('%c✅ Auth token found in localStorage["' + key + '"]', 'color:green');
      break;
    }
  }
  if (!token) {
    console.error('❌ Could not auto-find token.\nOpen DevTools → Application → Local Storage.\nFind a key whose value starts with "eyJ" and paste it below:\n\ntoken = "PASTE_HERE";\nthen re-run from the correctedTemplates line.');
    return;
  }

  // ── 2. Corrected workflow templates ──────────────────────────────────────
  const correctedTemplates = [

    // ── Day 1 SMS: fixed HTML + booking CTA ──────────────────────────────
    {
      "id": "242d62d5-4b18-4448-a525-69f9f0068c88",
      "next": "f11a88cb-b722-483e-95f6-65679f3889e1",
      "name": "Day 1 SMS: Welcome/Check-In",
      "attributes": {
        "body": "Hi {{contact.first_name}},\n\nThis is {{user.first_name}} with the team. Just wanted to check in — any questions about your estimate or anything I can help clarify?\n\nWhenever you're ready, you can book here:\n" + BOOKING_LINK
      },
      "type": "sms",
      "order": 0
    },

    // ── Reply Handler: Conversation AI — fully configured ─────────────────
    {
      "name": "Reply Handler (AI)",
      "convertToMultipath": true,
      "cat": "multi-path",
      "next": [
        "8d480602-23f9-44e1-993a-dbe28676906a",
        "fcbb63c6-5519-4645-8425-929222d2f048"
      ],
      "id": "f11a88cb-b722-483e-95f6-65679f3889e1",
      "type": "conversation_ai",
      "attributes": {
        "type": "conversation_ai",
        "showAdvBotConfig": true,
        "skipAction": false,
        "transitions": [
          {
            "description": "Contact replied and AI handled the conversation",
            "name": "No Condition Met",
            "conditionType": "default",
            "isPrimaryBranch": false,
            "condition": "No Condition Met",
            "id": "8d480602-23f9-44e1-993a-dbe28676906a",
            "attributes": {}
          },
          {
            "description": "Contact did not reply within the timeout window",
            "attributes": {},
            "name": "Time Out",
            "id": "fcbb63c6-5519-4645-8425-929222d2f048",
            "isPrimaryBranch": false,
            "condition": "Bot times out",
            "conditionType": "default"
          }
        ],
        "botResponsesLimit": 5,
        "convertToMultipath": true,
        "cat": "multi-path",
        "timeout": { "value": 2, "type": "hours" },
        "additionalInstructions": "You are a follow-up assistant for a home service company. This contact received an estimate and has not yet responded. Your goal is to answer any questions they have about our services and guide them toward booking an appointment. Keep every response short and friendly — no more than 2-3 sentences. If they want to book, share this link: " + BOOKING_LINK + ". If they say they are not interested right now, thank them politely and let them know you are here whenever they are ready.",
        "personality": "Friendly, professional, and concise. You represent a trusted local home service company.",
        "intent": "Answer questions about the estimate and guide the contact to book a service appointment.",
        "channel": { "id": -1, "name": "" },
        "aiReplyWaitTime": 10,
        "name": "Conversation AI"
      },
      "parentKey": "242d62d5-4b18-4448-a525-69f9f0068c88",
      "order": 1
    },

    // ── No Condition Met → NOW wired to exit (contact replied, AI handled) ─
    {
      "type": "transition",
      "id": "8d480602-23f9-44e1-993a-dbe28676906a",
      "cat": "transition",
      "name": "No Condition Met",
      "next": "exit-remove-tag-replied-001",
      "parentKey": "f11a88cb-b722-483e-95f6-65679f3889e1",
      "parent": "f11a88cb-b722-483e-95f6-65679f3889e1",
      "order": 2
    },

    // ── NEW: Remove nurture-active tag when contact replied ───────────────
    {
      "type": "remove_contact_tag",
      "id": "exit-remove-tag-replied-001",
      "name": "Remove Tag: nurture-active (replied)",
      "attributes": {
        "tags": ["nurture-active"]
      },
      "parentKey": "8d480602-23f9-44e1-993a-dbe28676906a",
      "parent": "f11a88cb-b722-483e-95f6-65679f3889e1",
      "next": "exit-remove-wf-replied-002",
      "order": 26
    },

    // ── NEW: Remove from workflow when contact replied ────────────────────
    {
      "type": "remove_from_workflow",
      "id": "exit-remove-wf-replied-002",
      "name": "Remove from Workflow (Contact Replied)",
      "attributes": {
        "type": "remove_from_workflow",
        "workflow_id": [WORKFLOW_ID]
      },
      "parentKey": "exit-remove-tag-replied-001",
      "parent": "f11a88cb-b722-483e-95f6-65679f3889e1",
      "order": 27
    },

    // ── Time Out → continue nurture sequence ─────────────────────────────
    {
      "parentKey": "f11a88cb-b722-483e-95f6-65679f3889e1",
      "id": "fcbb63c6-5519-4645-8425-929222d2f048",
      "cat": "transition",
      "next": "649a3cbc-4b17-4ea0-a95f-0a26fbec2241",
      "name": "Time Out",
      "type": "transition",
      "parent": "f11a88cb-b722-483e-95f6-65679f3889e1",
      "order": 2
    },

    // ── Wait 1 Day (fixed: 1440 min = exactly 24h) ───────────────────────
    {
      "next": "8becc36d-7f46-4c54-9c48-acbc2b7934f6",
      "id": "649a3cbc-4b17-4ea0-a95f-0a26fbec2241",
      "name": "Wait 1 Day",
      "attributes": {
        "startAfter": { "value": 1440, "type": "minutes", "action_in": 0, "when": "after" },
        "transitions": [], "isHybridAction": true, "type": "time",
        "hybridActionType": "wait", "name": "Wait 1 Day", "convertToMultipath": false, "cat": "action"
      },
      "type": "wait",
      "parentKey": "fcbb63c6-5519-4645-8425-929222d2f048",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048",
      "order": 0
    },

    // ── Day 2 Email: kept as-is (HTML renders in email) ─────────────────
    {
      "parentKey": "649a3cbc-4b17-4ea0-a95f-0a26fbec2241",
      "name": "Day 2 Email: Quick Question",
      "id": "8becc36d-7f46-4c54-9c48-acbc2b7934f6",
      "next": "b3046f5b-bec5-4615-b955-9ea323cd142c",
      "type": "email",
      "attributes": {
        "subject": "Quick question, {{contact.first_name}}",
        "html": "Hi {{contact.first_name}},<br><br>Just checking in to see if you had any questions about the estimate — happy to clarify anything or walk you through it.<br><br>Whenever you're ready, you can book directly here: <a href='" + BOOKING_LINK + "'>Schedule a time</a><br><br>Best,<br>{{user.name}}<br>{{user.email_signature}}"
      },
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048",
      "order": 1
    },

    // ── Wait 2 Days (fixed: 2880 min = exactly 48h) ─────────────────────
    {
      "attributes": {
        "transitions": [],
        "startAfter": { "type": "minutes", "value": 2880, "when": "after", "action_in": 0 },
        "isHybridAction": true, "type": "time", "convertToMultipath": false,
        "cat": "action", "hybridActionType": "wait", "name": "Wait 2 Days"
      },
      "type": "wait", "id": "b3046f5b-bec5-4615-b955-9ea323cd142c",
      "next": "09769694-1ef2-48c5-b7ff-d961de819427", "name": "Wait 2 Days",
      "parentKey": "8becc36d-7f46-4c54-9c48-acbc2b7934f6",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 2
    },

    // ── Day 4 SMS: fixed HTML + booking CTA ─────────────────────────────
    {
      "type": "sms",
      "attributes": {
        "body": "Hi {{contact.first_name}},\n\nStill thinking it over? No rush — just want to make it easy for you.\n\nAny questions or ready to move forward:\n" + BOOKING_LINK + "\n\n{{user.first_name}}"
      },
      "name": "Day 4 SMS: Re-engage",
      "id": "09769694-1ef2-48c5-b7ff-d961de819427",
      "next": "aa2d017e-6f6f-4557-bc78-3cdc28a9b466",
      "parentKey": "b3046f5b-bec5-4615-b955-9ea323cd142c",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 3
    },

    // ── Wait 2 Days (fixed: 2880 min) ────────────────────────────────────
    {
      "parentKey": "09769694-1ef2-48c5-b7ff-d961de819427",
      "type": "wait",
      "attributes": {
        "transitions": [],
        "startAfter": { "type": "minutes", "value": 2880, "when": "after", "action_in": 0 },
        "hybridActionType": "wait", "name": "Wait 2 Days", "cat": "action",
        "convertToMultipath": false, "isHybridAction": true, "type": "time"
      },
      "name": "Wait 2 Days", "next": "8c0e76bb-808a-431e-bddb-f690a3280d3b",
      "id": "aa2d017e-6f6f-4557-bc78-3cdc28a9b466",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 4
    },

    // ── Day 6 Email: Value Add ────────────────────────────────────────────
    {
      "next": "4028456d-4fe3-4762-822b-86dcfe32351b",
      "id": "8c0e76bb-808a-431e-bddb-f690a3280d3b",
      "name": "Day 6 Email: Value Add",
      "attributes": {
        "subject": "One thing that helps our clients decide",
        "html": "Hi {{contact.first_name}},<br><br>One thing we see a lot: clients who compare quotes purely on price often end up paying more in the long run when a cheaper job needs to be redone.<br><br>We build our estimates around doing it right the first time — and we're happy to walk you through exactly what's included.<br><br>Questions? Just reply to this email or <a href='" + BOOKING_LINK + "'>grab a quick call here</a>.<br><br>Best,<br>{{user.name}}<br>{{user.email_signature}}"
      },
      "type": "email",
      "parentKey": "aa2d017e-6f6f-4557-bc78-3cdc28a9b466",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 5
    },

    // ── Wait 2 Days ──────────────────────────────────────────────────────
    {
      "type": "wait",
      "attributes": {
        "transitions": [],
        "startAfter": { "when": "after", "action_in": 0, "type": "days", "value": 2 },
        "name": "Wait 2 Days", "hybridActionType": "wait",
        "convertToMultipath": false, "cat": "action", "type": "time", "isHybridAction": true
      },
      "name": "Wait 2 Days", "next": "4cb5494b-0dd2-47d4-b72b-5f35e30a59ae",
      "id": "4028456d-4fe3-4762-822b-86dcfe32351b",
      "parentKey": "8c0e76bb-808a-431e-bddb-f690a3280d3b",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 6
    },

    // ── Day 8 SMS: fixed HTML + booking link ─────────────────────────────
    {
      "parentKey": "4028456d-4fe3-4762-822b-86dcfe32351b",
      "type": "sms",
      "attributes": {
        "body": "Hey {{contact.first_name}},\n\nJust making it easy — if you're ready to get started or have questions, here's the link:\n" + BOOKING_LINK + "\n\n{{user.first_name}}"
      },
      "name": "Day 8 SMS: Easy Check-In",
      "id": "4cb5494b-0dd2-47d4-b72b-5f35e30a59ae",
      "next": "6b24bdc5-005e-460e-acd6-d4193362caf5",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 7
    },

    // ── Wait 2 Days ──────────────────────────────────────────────────────
    {
      "next": "69417485-dd68-4637-9340-892a01d9f8b2",
      "id": "6b24bdc5-005e-460e-acd6-d4193362caf5",
      "name": "Wait 2 Days",
      "attributes": {
        "transitions": [],
        "startAfter": { "value": 2, "type": "days", "action_in": 1, "when": "after" },
        "isHybridAction": true, "type": "time", "cat": "action",
        "convertToMultipath": false, "hybridActionType": "wait", "name": "Wait 2 Days"
      },
      "type": "wait",
      "parentKey": "4cb5494b-0dd2-47d4-b72b-5f35e30a59ae",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 8
    },

    // ── Day 10 Email: Resource/FAQ ────────────────────────────────────────
    {
      "parentKey": "6b24bdc5-005e-460e-acd6-d4193362caf5",
      "attributes": {
        "subject": "Common questions we hear — answered",
        "html": "Hi {{contact.first_name}},<br><br>We get a few questions from most clients before they commit, so I wanted to address them upfront:<br><br><strong>\"How long will it take?\"</strong> — Most jobs are completed in [X days]. We'll confirm your exact timeline before we start.<br><br><strong>\"What if something goes wrong?\"</strong> — All our work is backed by [warranty/guarantee details]. You're covered.<br><br><strong>\"Is your price negotiable?\"</strong> — Our estimates are already built to be fair and competitive. But we're happy to talk through what's included.<br><br>If you have a different question, just reply — I'll get back to you same day.<br><br>Or if you're ready: <a href='" + BOOKING_LINK + "'>Book here</a><br><br>Best,<br>{{user.name}}<br>{{user.email_signature}}"
      },
      "type": "email",
      "next": "f437fe4d-a50e-4fdc-81ee-6ac6ea738540",
      "id": "69417485-dd68-4637-9340-892a01d9f8b2",
      "name": "Day 10 Email: Common Questions",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 9
    },

    // ── Wait 3 Days ──────────────────────────────────────────────────────
    {
      "next": "26f6626b-3fad-4331-a442-68853ef576e4",
      "id": "f437fe4d-a50e-4fdc-81ee-6ac6ea738540",
      "name": "Wait 3 Days",
      "attributes": {
        "type": "time", "isHybridAction": true, "name": "Wait 3 Days",
        "hybridActionType": "wait", "convertToMultipath": false, "cat": "action",
        "transitions": [],
        "startAfter": { "type": "days", "value": 3, "when": "after", "action_in": 0 }
      },
      "type": "wait",
      "parentKey": "69417485-dd68-4637-9340-892a01d9f8b2",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 10
    },

    // ── Day 13 SMS: fixed HTML + booking CTA ────────────────────────────
    {
      "parentKey": "f437fe4d-a50e-4fdc-81ee-6ac6ea738540",
      "name": "Day 13 SMS: Friendly Reminder",
      "next": "cfa54fab-f5a6-4110-a31b-332fde78e295",
      "id": "26f6626b-3fad-4331-a442-68853ef576e4",
      "type": "sms",
      "attributes": {
        "body": "Hey {{contact.first_name}},\n\nChecking in one more time. If the timing isn't right we totally get it — but if you're still interested, we'd love to connect.\n" + BOOKING_LINK + "\n\n{{user.first_name}}"
      },
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 11
    },

    // ── Wait 2 Days ──────────────────────────────────────────────────────
    {
      "id": "cfa54fab-f5a6-4110-a31b-332fde78e295",
      "next": "976b2357-4f61-4d73-9870-b57a5ed22063",
      "name": "Wait 2 Days",
      "attributes": {
        "type": "time", "isHybridAction": true, "hybridActionType": "wait",
        "name": "Wait 2 Days", "cat": "action", "convertToMultipath": false,
        "transitions": [],
        "startAfter": { "value": 2, "type": "days", "action_in": 0, "when": "after" }
      },
      "type": "wait",
      "parentKey": "26f6626b-3fad-4331-a442-68853ef576e4",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 12
    },

    // ── Day 15 Email ─────────────────────────────────────────────────────
    {
      "name": "Day 15 Email: Still Here For You",
      "id": "976b2357-4f61-4d73-9870-b57a5ed22063",
      "next": "7626005d-b297-422f-8d93-2e5efd2a86fc",
      "type": "email",
      "attributes": {
        "subject": "Still here if you need us, {{contact.first_name}}",
        "html": "Hi {{contact.first_name}},<br><br>Just wanted to check in one more time. No pressure at all — but if you're still considering moving forward, I want to make it as easy as possible.<br><br>If your situation has changed or you have new questions, reply and I'll respond same day.<br><br>Ready when you are: <a href='" + BOOKING_LINK + "'>Schedule here</a><br><br>Best,<br>{{user.name}}<br>{{user.email_signature}}"
      },
      "parentKey": "cfa54fab-f5a6-4110-a31b-332fde78e295",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 13
    },

    // ── Wait 3 Days ──────────────────────────────────────────────────────
    {
      "parentKey": "976b2357-4f61-4d73-9870-b57a5ed22063",
      "attributes": {
        "transitions": [],
        "startAfter": { "value": 3, "type": "days", "action_in": 1, "when": "after" },
        "name": "Wait 3 Days", "hybridActionType": "wait", "cat": "action",
        "convertToMultipath": false, "isHybridAction": true, "type": "time"
      },
      "type": "wait", "id": "7626005d-b297-422f-8d93-2e5efd2a86fc",
      "next": "6c90d643-ca44-4d21-bca4-26bb56950fa3",
      "name": "Wait 3 Days",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 14
    },

    // ── Day 18 SMS: fixed HTML + booking CTA ────────────────────────────
    {
      "parentKey": "7626005d-b297-422f-8d93-2e5efd2a86fc",
      "name": "Day 18 SMS: Open Offer",
      "id": "6c90d643-ca44-4d21-bca4-26bb56950fa3",
      "next": "6e71f7d8-f975-4470-8d5e-4c0b225da654",
      "type": "sms",
      "attributes": {
        "body": "Hi {{contact.first_name}},\n\nWe've got availability this week if you'd like to get started. Pick a time that works:\n" + BOOKING_LINK + "\n\n{{user.first_name}}"
      },
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 15
    },

    // ── Wait 3 Days ──────────────────────────────────────────────────────
    {
      "parentKey": "6c90d643-ca44-4d21-bca4-26bb56950fa3",
      "name": "Wait 3 Days",
      "id": "6e71f7d8-f975-4470-8d5e-4c0b225da654",
      "next": "c98bdf8e-bedf-4e5e-b5e0-7853dacfadf6",
      "type": "wait",
      "attributes": {
        "isHybridAction": true, "type": "time", "convertToMultipath": false,
        "cat": "action", "name": "Wait 3 Days", "hybridActionType": "wait",
        "startAfter": { "action_in": 0, "when": "after", "value": 3, "type": "days" },
        "transitions": []
      },
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 16
    },

    // ── Day 21 Email: FIXED booking link (was {{user.calendar_link}}) ────
    {
      "type": "email",
      "attributes": {
        "subject": "Last chance to connect, {{contact.first_name}}",
        "html": "Hi {{contact.first_name}},<br><br>We're getting toward the end of our follow-up, but I didn't want to close out without one more attempt.<br><br>If you're still thinking about it, I'd love to answer any final questions — just hit reply.<br><br>Or if you're ready to book: <a href='" + BOOKING_LINK + "'>Click here to schedule</a><br><br>Either way, no pressure. We appreciate you considering us.<br><br>Best,<br>{{user.name}}<br>{{user.email_signature}}"
      },
      "name": "Day 21 Email: Last Call",
      "id": "c98bdf8e-bedf-4e5e-b5e0-7853dacfadf6",
      "next": "b201a223-05d9-417e-91f4-4f70dad5976f",
      "parentKey": "6e71f7d8-f975-4470-8d5e-4c0b225da654",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 17
    },

    // ── Wait 3 Days ──────────────────────────────────────────────────────
    {
      "name": "Wait 3 Days", "next": "daf024a5-8f53-432d-a7dc-5f9f3456102a",
      "id": "b201a223-05d9-417e-91f4-4f70dad5976f", "type": "wait",
      "attributes": {
        "transitions": [],
        "startAfter": { "type": "days", "value": 3, "when": "after", "action_in": 0 },
        "convertToMultipath": false, "cat": "action", "name": "Wait 3 Days",
        "hybridActionType": "wait", "type": "time", "isHybridAction": true
      },
      "parentKey": "c98bdf8e-bedf-4e5e-b5e0-7853dacfadf6",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 18
    },

    // ── Day 24 SMS: fixed HTML + booking CTA ────────────────────────────
    {
      "next": "62a55c22-dad2-424b-a2db-33d467f803b2",
      "id": "daf024a5-8f53-432d-a7dc-5f9f3456102a",
      "name": "Day 24 SMS: Just Checking",
      "attributes": {
        "body": "Hey {{contact.first_name}},\n\nAnything changed on your end? Happy to revisit your estimate or answer any new questions.\n" + BOOKING_LINK + "\n\n{{user.first_name}}"
      },
      "type": "sms",
      "parentKey": "b201a223-05d9-417e-91f4-4f70dad5976f",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 19
    },

    // ── Wait 3 Days ──────────────────────────────────────────────────────
    {
      "parentKey": "daf024a5-8f53-432d-a7dc-5f9f3456102a",
      "name": "Wait 3 Days", "next": "23bccf37-e452-4448-b8dd-41c487998e3c",
      "id": "62a55c22-dad2-424b-a2db-33d467f803b2", "type": "wait",
      "attributes": {
        "type": "time", "isHybridAction": true, "hybridActionType": "wait",
        "name": "Wait 3 Days", "convertToMultipath": false, "cat": "action",
        "transitions": [],
        "startAfter": { "action_in": 0, "when": "after", "value": 3, "type": "days" }
      },
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 20
    },

    // ── Day 27 Email: Final Follow-Up ─────────────────────────────────────
    {
      "parentKey": "62a55c22-dad2-424b-a2db-33d467f803b2",
      "type": "email",
      "attributes": {
        "subject": "Closing out your estimate, {{contact.first_name}}",
        "html": "Hi {{contact.first_name}},<br><br>We're wrapping up our follow-up on your estimate. We'll be archiving it soon, but we want you to know we're still here if anything changes.<br><br>If you'd like to reconnect, just reply or book a time: <a href='" + BOOKING_LINK + "'>Schedule here</a><br><br>Thanks for considering us — we hope to work with you in the future.<br><br>Best,<br>{{user.name}}<br>{{user.email_signature}}"
      },
      "name": "Day 27 Email: Closing Out",
      "next": "fe317070-a7d0-45e9-8a23-53dde1a9c3ab",
      "id": "23bccf37-e452-4448-b8dd-41c487998e3c",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 21
    },

    // ── Wait 3 Days ──────────────────────────────────────────────────────
    {
      "parentKey": "23bccf37-e452-4448-b8dd-41c487998e3c",
      "attributes": {
        "startAfter": { "when": "after", "action_in": 0, "type": "days", "value": 3 },
        "transitions": [], "cat": "action", "convertToMultipath": false,
        "hybridActionType": "wait", "name": "Wait 3 Days",
        "isHybridAction": true, "type": "time"
      },
      "type": "wait", "id": "fe317070-a7d0-45e9-8a23-53dde1a9c3ab",
      "next": "0fdb8012-38d1-4d25-b9ca-7ba71848b4ae",
      "name": "Wait 3 Days",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 22
    },

    // ── Day 30 SMS: fixed HTML ───────────────────────────────────────────
    {
      "name": "Day 30 SMS: Sequence Wrap-Up",
      "id": "0fdb8012-38d1-4d25-b9ca-7ba71848b4ae",
      "type": "sms",
      "attributes": {
        "body": "Hi {{contact.first_name}},\n\nThis is our last message for now. We'll keep your info on file — whenever you're ready, we're here.\n\n{{user.first_name}}"
      },
      "parentKey": "fe317070-a7d0-45e9-8a23-53dde1a9c3ab",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048",
      "order": 23, "next": "dabc84b6-1342-42a7-8fac-0d302c96b174"
    },

    // ── Add Tag: nurture-completed ────────────────────────────────────────
    {
      "type": "add_contact_tag",
      "id": "dabc84b6-1342-42a7-8fac-0d302c96b174",
      "name": "Add Tag: nurture-completed",
      "attributes": { "tags": ["nurture-completed"] },
      "parentKey": "0fdb8012-38d1-4d25-b9ca-7ba71848b4ae",
      "next": "f0f0f49c-4e4d-4d29-b9e5-45954edb4be8",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 24
    },

    // ── Remove from Workflow (end of sequence) ────────────────────────────
    {
      "type": "remove_from_workflow",
      "id": "f0f0f49c-4e4d-4d29-b9e5-45954edb4be8",
      "name": "Remove from Workflow",
      "attributes": {
        "type": "remove_from_workflow",
        "workflow_id": [WORKFLOW_ID]
      },
      "parentKey": "dabc84b6-1342-42a7-8fac-0d302c96b174",
      "parent": "fcbb63c6-5519-4645-8425-929222d2f048", "order": 25
    }
  ];

  // ── 3. Try GHL internal endpoints ────────────────────────────────────────
  const payload = {
    locationId: LOCATION_ID,
    stopOnResponse: true,
    workflowData: { templates: correctedTemplates }
  };

  const endpoints = [
    `https://backend.leadconnectorhq.com/workflows/${WORKFLOW_ID}`,
    `https://backend.leadconnectorhq.com/workflow/${WORKFLOW_ID}`,
    `https://api.msgsndr.com/workflows/${WORKFLOW_ID}`,
    `https://api.msgsndr.com/workflow/${WORKFLOW_ID}`,
  ];

  let success = false;
  for (const url of endpoints) {
    for (const method of ['PUT', 'PATCH']) {
      try {
        console.log(`Trying ${method} ${url}`);
        const res = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'location-id': LOCATION_ID,
            'channel': 'APP'
          },
          body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log(`  → ${res.status}: ${text.slice(0, 150)}`);
        if (res.ok) {
          console.log('%c✅ WORKFLOW UPDATED SUCCESSFULLY! Refresh the GHL workflow page.', 'color:green;font-weight:bold;font-size:16px');
          success = true;
          break;
        }
      } catch (e) {
        console.log(`  → Error: ${e.message}`);
      }
    }
    if (success) break;
  }

  if (!success) {
    console.warn('%c⚠️ API update failed. See instructions below.', 'color:orange;font-weight:bold');
    console.log('The corrected workflow data is ready. Run this to copy it:\ncopy(JSON.stringify(correctedTemplates, null, 2))');
    // Expose on window so user can copy it
    window._fixedTemplates = correctedTemplates;
    window._fixedPayload = payload;
    console.log('Then share the full URL from the network request that loaded the workflow so I can try the exact internal endpoint.');
  }
})();
