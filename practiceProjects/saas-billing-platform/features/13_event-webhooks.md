# Feature Specification: Event Stream & Webhooks

---

## 1. Metadata
* **Feature Name:** Event Stream & Webhooks
* **Feature ID:** `FEAT-API-01`
* **Priority:** 13 (Developer Integration Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Notify external merchant applications in real-time when billing events occur (e.g., subscription upgrades, successful payments, failed retries). Webhooks decouple system events, permitting merchant servers to provision SaaS access or update local account tables automatically.

---

## 3. User Stories
* **US-API-01-01:** As a Merchant Developer, I want to receive HTTP POST JSON notifications at a registered endpoint when a subscription status changes, so that my system can immediately grant or revoke application access.
* **US-API-01-02:** As a Merchant Developer, I want webhook events to contain cryptographic signature headers, so that I can verify payloads originate securely from AuraBilling.

---

## 4. Functional Requirements
* **FR-API-01-01:** Define a standardized event model payload structure containing: `id` (event ID), `type` (e.g. `customer.created`, `subscription.updated`), `created_at` (timestamp), and `data` (the target resource JSON serialization).
* **FR-API-01-02:** Support merchant registration of webhook endpoint configurations, mapping URLs to desired event topics.
* **FR-API-01-03:** When an event fires, publish a task to the Webhook Dispatch Queue. The dispatch worker must send an HTTP `POST` containing the JSON payload with a connection timeout threshold of 10 seconds.
* **FR-API-01-04:** Compute a HMAC-SHA256 signature hash of the raw JSON request body using the merchant endpoint's secret key. Inject this signature value into headers as `X-Aura-Signature`.
* **FR-API-01-05:** Track dispatch responses. If the receiving endpoint returns anything other than HTTP `2xx` (or fails to respond/times out):
  * Mark log as failed.
  * Schedule retries using exponential backoff schedules over 24 hours: +15m, +30m, +1h, +3h, +6h, +12h, and +24h (Max 8 attempts total).

---

## 5. Validation Rules
* **VAL-API-01-01:** Webhook endpoints must use secure `https://` schemas. Hard block non-secure `http://` destination targets in production.
* **VAL-API-01-02:** Event type inputs must match a strict list of defined system topics.

---

## 6. Edge Cases
* **Edge Case 1: Webhook loop vulnerability.** If a merchant's webhook handler has logic that makes calls back to our API, which in turn emits another webhook event, this can create infinite loops.
  * *Resolution:* Limit nested action pipelines in logic. Ensure webhook events are decoupled and do not trigger cascading cascades of similar events without validation bounds.
* **Edge Case 2: Slow responding merchant endpoints.** If a merchant's server responds very slowly (e.g., taking 9 seconds per request), this holds queue worker resources.
  * *Resolution:* Webhook delivery requests must run asynchronously in separate thread threads with a strict 10-second timeout limit. If exceeded, terminate the HTTP connection and write `TIMEOUT` to the log table, scheduling a retry.
* **Edge Case 3: Circular Redirects.** If the merchant server redirects incoming webhooks to another URL:
  * *Resolution:* Force connection handlers to refuse redirect prompts (set redirect policy to max redirects = 0). Treat any 3xx redirect status as an immediate delivery failure.

---

## 7. Dependencies
* **Upstream:** None.
* **Downstream:** All other platform components trigger actions that emit events to this engine.

---

## 8. API Requirements

### 8.1 Register Webhook Endpoint
* **Endpoint:** `POST /v1/webhooks/endpoints`
* **Request Body:**
```json
{
  "url": "https://api.merchant.com/v1/billing-webhooks",
  "enabled_events": [
    "invoice.paid",
    "subscription.canceled"
  ]
}
```
* **Response (201 Created):**
```json
{
  "id": "we_9a2jk92hja8",
  "url": "https://api.merchant.com/v1/billing-webhooks",
  "secret_key": "whsec_abc123xyz...",
  "enabled_events": ["invoice.paid", "subscription.canceled"],
  "is_active": true
}
```

---

## 9. Database Impact
* **Table:** `WEBHOOK_ENDPOINT` (Registration configurations)
  * Fields: `id` (UUID, PK), `merchant_id` (UUID, FK, Indexed), `url` (String/Text), `secret_key` (String), `enabled_events` (JSONB/Array), `is_active` (Boolean), `created_at` (Timestamp).
* **Table:** `WEBHOOK_DELIVERY_LOG` (Delivery retry and auditing database ledger)
  * Fields: `id` (UUID, PK), `endpoint_id` (UUID, FK, Indexed), `event_id` (String), `event_type` (String), `payload` (JSONB), `attempt_number` (Integer), `response_status` (Integer, e.g. 200, 500), `response_body` (Text), `is_success` (Boolean), `created_at` (Timestamp).

---

## 10. UI Components (Admin Dashboard)
* **Webhooks Settings Panel:**
  * Endpoint CRUD wizard.
  * Key generator module revealing webhook keys `whsec_...` under click-to-view toggles.
  * Webhook Delivery History Table with lists of sent payloads, timestamps, HTTP statuses, and a manual `[Resend Webhook]` button.

---

## 11. Security Requirements
* **SEC-API-01-01 (HMAC Authenticity):** The system must generate unique cryptographic secrets for every webhook URL configuration. The HMAC calculation must hash the exact raw body bytes.
* **SEC-API-01-02 (SSRF Prevention):** Validate webhook URLs to ensure they do not resolve to local host addresses (e.g. `127.0.0.1`, `localhost`, or private range IPs `10.x.x.x`, `192.168.x.x`) preventing Server-Side Request Forgery.

---

## 12. Acceptance Criteria
* **AC-API-01-01:** Verify webhook logs record payload, status, and HMAC header values correctly.
* **AC-API-01-02:** Verify endpoints are unreachable if SSRF target rules are matched.
* **AC-API-01-03:** Verify retry queue logic processes failed webhooks correctly with delays.

---

## 13. Definition of Done
* Sandbox verification with mock endpoint listener servers confirms correct webhook dispatch.
* Queue stress testing shows handler capacity scales to 1,000 parallel dispatches per worker node.
* Security review of HMAC headers confirmed.
