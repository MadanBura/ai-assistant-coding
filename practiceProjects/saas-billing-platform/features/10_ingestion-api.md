# Feature Specification: Usage Ingestion API

---

## 1. Metadata
* **Feature Name:** Usage Ingestion API
* **Feature ID:** `FEAT-MTR-01`
* **Priority:** 10 (High-Throughput Metering Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Provide a high-throughput, low-latency API endpoint for merchants to transmit usage metrics (e.g., API requests made, gigabytes of storage consumed, emails sent) for metered subscription billing.

---

## 3. User Stories
* **US-MTR-01-01:** As a Merchant Developer, I want to submit usage event logs programmatically via a REST API, so that my subscribers' bills accurately reflect their product utilization.
* **US-MTR-01-02:** As a Merchant Developer, I want to send usage logs with an idempotency key, so that network retries do not result in double billing for my customers.

---

## 4. Functional Requirements
* **FR-MTR-01-01:** Expose an API endpoint: `POST /v1/usage`.
* **FR-MTR-01-02:** Accept payloads containing: `subscription_id` or `customer_id`, `usage_metric` name, `quantity` (numeric), `timestamp` (epoch), and an `idempotency_key` (UUID/string).
* **FR-MTR-01-03:** Store records of unique idempotency keys in a fast key-value database (Redis) with a TTL of 24 hours. Reject duplicate requests returning HTTP 202 without double processing.
* **FR-MTR-01-04:** Queue all validated usage events immediately into an ingestion message broker (Redis Queue / AWS SQS) to guarantee API response times under 50ms, processing actual database writes asynchronously.
* **FR-MTR-01-05:** Validate that the target subscription status is `active` or `trialing`. If the subscription is `canceled` or `past_due`, reject usage submission with HTTP 400.

---

## 5. Validation Rules
* **VAL-MTR-01-01:** `quantity` parameter must be a positive number. Negative quantities are prohibited.
* **VAL-MTR-01-02:** `timestamp` must be within a valid boundary: not more than 24 hours in the past (respecting billing cycle rules) and not in the future.
* **VAL-MTR-01-03:** Idempotency header or JSON body parameter must be present.

---

## 6. Edge Cases
* **Edge Case 1: Ingestion API Flooding.** Under high burst loads, database lock contentions on PostgreSQL can slow down APIs.
  * *Resolution:* Enable a memory buffer (Redis cache list). Worker tasks pull batches of 1,000 usage events from Redis and perform bulk inserts (`INSERT INTO USAGE_LOG VALUES ...`) instead of running single queries.
* **Edge Case 2: Ingesting usage right at billing cycle close.** A customer might submit usage logs that occurred at 11:59:59 PM, but the API receives them at 12:00:05 AM after the billing cycle closes.
  * *Resolution:* The aggregation worker (`FEAT-MTR-02`) must check the timestamp of the telemetry event, not the database transaction write timestamp, allocating the resource consumption to the correct cycle.
* **Edge Case 3: Customer matches a deleted subscription.** Return explicit error code `SUBSCRIPTION_NOT_FOUND` to alert developers of configuration mismatches.

---

## 7. Dependencies
* **Upstream:**
  * `FEAT-SUB-02` (Lifecycle Engine) - ensures subscription statuses allow writes.
* **Downstream:**
  * `FEAT-MTR-02` (Usage Aggregator) - reads logs to sum/average metrics.

---

## 8. API Requirements

### 8.1 Ingest Usage Event
* **Endpoint:** `POST /v1/usage`
* **Headers:** `Idempotency-Key: uuid-string-12345`
* **Request Body:**
```json
{
  "subscription_id": "sub_92k02kasj8",
  "usage_metric": "api_calls",
  "quantity": 25,
  "timestamp": 1780602000
}
```
* **Response (202 Accepted):**
```json
{
  "id": "usg_0ak293ka82",
  "status": "accepted",
  "idempotency_key": "uuid-string-12345",
  "quantity": 25
}
```

---

## 9. Database Impact
* **Table:** `USAGE_LOG`
  * Inserts rows.
  * Fields: `id` (UUID, PK), `subscription_id` (UUID, FK, Indexed), `usage_metric` (String, Indexed), `quantity` (Numeric(12,4)), `idempotency_key` (String, Unique), `recorded_at` (Timestamp, Indexed), `created_at` (Timestamp).

---

## 10. UI Components
* **Developer Logs Stream Screen (Admin Dashboard):**
  * Displays real-time JSON stream log entries of incoming usage events.
  * Search bar filters logs by Customer ID or Subscription ID.

---

## 11. Security Requirements
* **SEC-MTR-01-01 (Bearer Token Authentication):** API calls require Bearer private keys, which are checked using SHA-256 hashes against merchant security keys.
* **SEC-MTR-01-02 (API Rate Limiting):** Apply high throughput limits: 10,000 requests per minute per merchant credential, returning HTTP 429 when exceeded.

---

## 12. Acceptance Criteria
* **AC-MTR-01-01:** Verify API response latency (excluding network) remains $< 50\text{ ms}$ under 1,000 concurrent request simulation.
* **AC-MTR-01-02:** Verify duplicate payloads with the same idempotency key return HTTP 202 but do not write duplicate database logs.
* **AC-MTR-01-03:** Verify negative usage logs are rejected.

---

## 13. Definition of Done
* Integration load tests executed using `k6` validating rate-limiting and Redis buffer logic.
* Log security audit confirms no sensitive merchant config headers are exposed in telemetry output files.
