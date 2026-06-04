# Feature Specification: Dev Sandbox & API Keys

---

## 1. Metadata
* **Feature Name:** Dev Sandbox & API Keys
* **Feature ID:** `FEAT-API-02`
* **Priority:** 14 (Developer Integration Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Equip developers with tools to safely test billing integrations. AuraBilling provides API key generation (test vs live environments) and logical sandbox partitioning, allowing developers to execute end-to-end checkouts and subscriptions using fake data without moving real money.

---

## 3. User Stories
* **US-API-02-01:** As a Merchant Developer, I want to retrieve separate "Test" and "Live" API keys from my settings dashboard, so that I can validate code integrations in my local environments safely.
* **US-API-02-02:** As a Merchant Developer, I want to rotate my API keys with a single click in the dashboard if they are accidentally leaked, so that I can maintain platform security.

---

## 4. Functional Requirements
* **FR-API-02-01:** Generate API keys following a strict prefix identifier structure:
  * **Test Publishable Key:** `pk_test_[32-random-alphanumeric-characters]`
  * **Test Secret Key:** `sk_test_[32-random-alphanumeric-characters]`
  * **Live Publishable Key:** `pk_live_[32-random-alphanumeric-characters]`
  * **Live Secret Key:** `sk_live_[32-random-alphanumeric-characters]`
* **FR-API-02-02:** Implement environment partitioning. API requests made using `_test_` keys must interact *only* with sandbox data scopes, routing payments to payment gateway mock sandbox endpoints (Stripe Test Mode).
* **FR-API-02-03:** Live key requests route to actual credit card clearing networks. Test key scopes are prohibited from calling real charge routes.
* **FR-API-02-04:** Provide an immediate key rotation method. Once triggered:
  * Deactivate the compromised key immediately.
  * Generate a new key and return it once to the screen.
  * Keep the old key active for a 12-hour grace period if the user selects "safe migration mode" to prevent production server downtime.

---

## 5. Validation Rules
* **VAL-API-02-01:** API keys must match regex formats corresponding to their environment roles before executing backend actions.
* **VAL-API-02-02:** If a request uses a secret key matching the format but not matching any record hash in the database, return a structured HTTP 401 Unauthorized payload: `{"error": "AUTHENTICATION_FAILED", "message": "API key is invalid."}`.

---

## 6. Edge Cases
* **Edge Case 1: Intermixing environments.** A developer uses a live publishable key with a test secret key in the same request payload.
  * *Resolution:* Block the request immediately. The request gateway middleware must verify that all authorization header parameters and client secrets share the identical environment context (e.g. both are `test` or both are `live`).
* **Edge Case 2: Accidental API Key Leaks in Client Apps.** A developer embeds their secret key (`sk_live_...`) in a mobile application or frontend web page instead of their publishable key.
  * *Resolution:* Filter client inputs. If the dashboard or backend detects secret key hashes matching requests originating from public browser contexts (checking origins and missing server headers), generate an automated security warning email to the administrator and throttle the key.

---

## 7. Dependencies
* **Upstream:** None.
* **Downstream:** All API operations require authentication filters built here.

---

## 8. API Requirements

### 8.1 Rotate Secret Key
* **Endpoint:** `POST /v1/developer/keys/rotate`
* **Request Body:**
```json
{
  "key_environment": "test",
  "safe_migration_mode": true
}
```
* **Response (200 OK):**
```json
{
  "environment": "test",
  "publishable_key": "pk_test_51Nx...",
  "new_secret_key": "sk_test_92jaks02ja103...",
  "old_key_expires_at": 1780641600
}
```

---

## 9. Database Impact
* **Table:** `MERCHANT_API_KEY` (Key storage ledger)
  * Fields: `id` (UUID, PK), `merchant_id` (UUID, FK, Indexed), `key_hash` (String, SHA-256 hashed, Unique, Indexed), `environment` (String: `test`/`live`), `key_type` (String: `publishable`/`secret`), `last_used_at` (Timestamp, Nullable), `expires_at` (Timestamp, Nullable), `created_at` (Timestamp).

---

## 10. UI Components
* **Developer API Settings Card:**
  * Displays "Publishable Key" and "Secret Key" in text input formats.
  * Secret keys are masked `sk_live_••••••••••••••••••••••••`. Button `[Reveal Key]` prompts for re-authentication.
  * Button `[Rotate Keys]` launches confirmation alert warnings.
* **Dashboard Global Toggle:**
  * Header toggle widget: "Viewing: Test Data" (Yellow header indicator background) vs "Viewing: Live Data" (Standard Deep Blue header).

---

## 11. Security Requirements
* **SEC-API-02-01 (Hash Storage):** Never store raw secret keys (`sk_...`) in plaintext in the database. Compute a SHA-256 hash of the key when generated, store only the hash, and present the raw key to the merchant only *once* upon creation.
* **SEC-API-02-02 (Key Length Entropy):** API keys must be constructed using cryptographically secure pseudorandom number generators (CSPRNG) yielding at least 128 bits of entropy.

---

## 12. Acceptance Criteria
* **AC-API-02-01:** Verify test secret keys restrict actions to sandbox databases.
* **AC-API-02-02:** Verify raw secret keys are visible only on generation screens.
* **AC-API-02-03:** Verify database stores hashed representations of secret keys.

---

## 13. Definition of Done
* Sandbox/Live middleware validation tests run successfully.
* Security review of database columns confirms no raw keys are accessible in audit logs.
