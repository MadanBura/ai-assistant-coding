# Test Automation Coverage Log

This document tracks execution coverage metrics, requirement mappings, and priority hierarchies for all Telehealth Connect features.

## Coverage Summary

| Epic ID | Feature ID | Feature Name | Frontend Tests | Backend Tests | Total TCs | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| EPC-001 | FEAT-101 | Practitioner Signup Verification | 3 | 3 | 6 | Ready |
| EPC-007 | FEAT-701 | Back Office Admin Operations | 2 | 3 | 5 | Ready |
| EPC-001 | FEAT-102 | Search Discovery Engine | 2 | 3 | 5 | Ready |
| EPC-001 | FEAT-103 | Dynamic Calendar Availability | 2 | 3 | 5 | Ready |
| EPC-002 | FEAT-201 | Slot Booking Locking | 2 | 3 | 5 | Ready |
| EPC-005 | FEAT-501 | Patient Payment Escrow | 2 | 3 | 5 | Ready |
| EPC-003 | FEAT-301 | Encrypted Webrtc Video | 2 | 2 | 4 | Ready |
| EPC-003 | FEAT-302 | Shared Consultation Space | 2 | 2 | 4 | Ready |
| EPC-004 | FEAT-401 | Patient Secure Ehr Vault | 2 | 3 | 5 | Ready |
| EPC-004 | FEAT-402 | Eprescription Creator Signer | 2 | 3 | 5 | Ready |
| EPC-005 | FEAT-502 | Doctor Wallet Split Payouts | 2 | 2 | 4 | Ready |
| EPC-006 | FEAT-601 | Patient Consolidated Dashboard | 2 | 2 | 4 | Ready |
| EPC-006 | FEAT-602 | Verified Consultation Reviews | 2 | 3 | 5 | Ready |
| EPC-007 | FEAT-702 | Multichannel Notification Hub | 2 | 3 | 5 | Ready |
| **TOTAL** | | | **30** | **38** | **68** | **100% Covered** |

---

## Detailed Test Mapping Directory

### FEAT-101: Practitioner Signup Verification

#### Frontend Playwright Tests (`01_practitioner-signup-verification.spec.ts`)
- **TC-FE-101-01** (Priority: High) | Req: `FR-101` | AC: `AC-101.1.1`
  - *Desc:* Verify that a doctor can fill in the multistep registration wizard, upload files, and complete submission.
  - *Expected:* Account created, files stored in S3, and profile state sets to pending_verification.
- **TC-FE-101-02** (Priority: Medium) | Req: `FR-101` | AC: `AC-101.1.2`
  - *Desc:* Verify that document files exceeding the 15MB size limit are rejected with an inline validation warning.
  - *Expected:* Validation warning prevents upload and disables form submission.
- **TC-FE-101-03** (Priority: Medium) | Req: `BR-006` | AC: `UIC-005`
  - *Desc:* Verify that all form fields and upload inputs support visible focus indicators and tab indexing controls (WCAG AA).
  - *Expected:* Focus states are clearly styled and keyboard inputs navigate form successfully.

#### Backend Jest/API Tests (`01_practitioner-signup-verification.test.ts`)
- **TC-BE-101-01** (Priority: High) | Req: `FR-101` | AC: `AC-101.1.1`
  - *Desc:* Verify POST /api/v1/auth/register/doctor registers doctor with status pending_verification.
  - *Expected:* User record written in users database table and doctor state is pending.
- **TC-BE-101-02** (Priority: High) | Req: `FR-101` | AC: `AC-101.1.2`
  - *Desc:* Verify that uploaded files containing virus signatures are quarantined and rejected with HTTP 400.
  - *Expected:* API rejects file upload and blocks storage write.
- **TC-BE-101-03** (Priority: Medium) | Req: `FR-101` | AC: `AC-101.1.3`
  - *Desc:* Verify DB unique constraint rejects duplicate license registrations.
  - *Expected:* Database prevents duplicate entries and API returns 409 status.

---

### FEAT-701: Back Office Admin Operations

#### Frontend Playwright Tests (`02_back-office-admin-operations.spec.ts`)
- **TC-FE-701-01** (Priority: High) | Req: `FR-101` | AC: `AC-101.2.1`
  - *Desc:* Verify that admin dashboard renders doctor verification queue list, pagination indicators, and file preview details.
  - *Expected:* Audit list renders completely and document preview updates correctly.
- **TC-FE-701-02** (Priority: High) | Req: `FR-101` | AC: `AC-101.2.2`
  - *Desc:* Verify admin can reject a doctor profile, enforcing rejection comment constraints.
  - *Expected:* Rejection requires reason, form validations block submission on blank comments, and list refetches post-update.

#### Backend Jest/API Tests (`02_back-office-admin-operations.test.ts`)
- **TC-BE-701-01** (Priority: High) | Req: `FR-101` | AC: `SECC-001`
  - *Desc:* Verify that GET and POST verification routes block non-admin accounts with HTTP 403 Forbidden.
  - *Expected:* System restricts API routes to admin roles using security middleware.
- **TC-BE-701-02** (Priority: High) | Req: `FR-501` | AC: `AC-501.2.1`
  - *Desc:* Verify POST /api/v1/admin/payments/override-refund triggers refund actions on Stripe.
  - *Expected:* Escrow transaction is voided on payment gateway and status updates in database.
- **TC-BE-701-03** (Priority: Medium) | Req: `SEC-104` | AC: `SECC-005`
  - *Desc:* Verify administrative actions write audit entries in database logs.
  - *Expected:* Log entries are written, content is immutable, and tables block updates.

---

### FEAT-102: Search Discovery Engine

#### Frontend Playwright Tests (`03_search-discovery-engine.spec.ts`)
- **TC-FE-102-01** (Priority: High) | Req: `FR-102` | AC: `AC-102.1.1`
  - *Desc:* Verify that search directory contains filter inputs and updates search cards dynamic list.
  - *Expected:* Search sidebar contains correct criteria widgets and filters grid results.
- **TC-FE-102-02** (Priority: Medium) | Req: `FR-102` | AC: `AC-102.1.2`
  - *Desc:* Verify that geolocation searches sort results by distance parameters.
  - *Expected:* Search proximity calculations resolve correct sequence sorting.

#### Backend Jest/API Tests (`03_search-discovery-engine.test.ts`)
- **TC-BE-102-01** (Priority: High) | Req: `FR-102` | AC: `AC-102.2.1`
  - *Desc:* Verify fuzzy text searches correct common query typos.
  - *Expected:* Elasticsearch fuzzy query parameters resolve typo correctly.
- **TC-BE-102-02** (Priority: High) | Req: `FR-101` | AC: `AC-102.1.2`
  - *Desc:* Verify search results completely exclude non-verified doctors.
  - *Expected:* Search indexing layers block access to non-verified profiles.
- **TC-BE-102-03** (Priority: Medium) | Req: `NFR-102` | AC: `PERFC-002`
  - *Desc:* Verify search API response latency satisfies SLA limits under load.
  - *Expected:* API satisfies SLA thresholds under concurrent user loads.

---

### FEAT-103: Dynamic Calendar Availability

#### Frontend Playwright Tests (`04_dynamic-calendar-availability.spec.ts`)
- **TC-FE-103-01** (Priority: High) | Req: `FR-103` | AC: `AC-103.1.1`
  - *Desc:* Verify doctor can save custom weekly templates with multiple daily intervals.
  - *Expected:* Schedule editor allows adding multiple intervals, validates boundary values, and saves template configurations.
- **TC-FE-103-02** (Priority: Medium) | Req: `FR-103` | AC: `AC-103.1.2`
  - *Desc:* Verify doctor can block a specific date on the exclusion calendar grid.
  - *Expected:* Exclusion settings update UI state and block calendar days.

#### Backend Jest/API Tests (`04_dynamic-calendar-availability.test.ts`)
- **TC-BE-103-01** (Priority: High) | Req: `FR-103` | AC: `AC-103.1.2`
  - *Desc:* Verify saving overlapping intervals triggers validation failure.
  - *Expected:* API validation checks intercept input error and return warning response.
- **TC-BE-103-02** (Priority: High) | Req: `FR-103` | AC: `AC-103.1.3`
  - *Desc:* Verify GET /api/v1/doctors/:id/availability compiles free slots accurately, subtracting active exclusions.
  - *Expected:* Scheduler engine merges tables correctly and drops slots falling inside exclusion periods.
- **TC-BE-103-03** (Priority: Medium) | Req: `FR-103` | AC: `AC-103.1.1`
  - *Desc:* Verify timezone compiler converts settings intervals to UTC database keys safely.
  - *Expected:* Timezone offsets are calculated correctly and stored in standard UTC formats.

---

### FEAT-201: Slot Booking Locking

#### Frontend Playwright Tests (`05_slot-booking-locking.spec.ts`)
- **TC-FE-201-01** (Priority: High) | Req: `FR-103` | AC: `AC-201.2.1`
  - *Desc:* Verify selecting a slot locks it and starts the checkout countdown timer.
  - *Expected:* Checkout timer initializes and ticks down correctly.
- **TC-FE-201-02** (Priority: Medium) | Req: `FR-202` | AC: `AC-201.1.2`
  - *Desc:* Verify UI blocks booking overlapping slots.
  - *Expected:* Interface checks calendar states and warning modal disables checkout steps.

#### Backend Jest/API Tests (`05_slot-booking-locking.test.ts`)
- **TC-BE-201-01** (Priority: High) | Req: `FR-103` | AC: `AC-201.1.1`
  - *Desc:* Verify POST /api/v1/appointments/lock writes Redis lock key with 10-minute TTL.
  - *Expected:* Redis temporary lock key is registered and TTL is set.
- **TC-BE-201-02** (Priority: High) | Req: `FR-103` | AC: `AC-201.1.2`
  - *Desc:* Verify concurrent locking requests on locked slots are blocked.
  - *Expected:* Concurrency checks block concurrent writes using Redis transaction guards.
- **TC-BE-201-03** (Priority: High) | Req: `FR-103` | AC: `AC-201.2.1`
  - *Desc:* Verify that after 10 minutes lock is released.
  - *Expected:* Expired locks are purged from Redis memory, returning slots to active booking states.

---

### FEAT-501: Patient Payment Escrow

#### Frontend Playwright Tests (`06_patient-payment-escrow.spec.ts`)
- **TC-FE-501-01** (Priority: High) | Req: `FR-501` | AC: `AC-201.1.2`
  - *Desc:* Verify Stripe checkout inputs load elements and handle card validation warnings.
  - *Expected:* Stripe inputs render securely, and payment validation returns errors.
- **TC-FE-501-02** (Priority: Medium) | Req: `BR-004` | AC: `UIC-004`
  - *Desc:* Verify escrow security info badge is visible.
  - *Expected:* Escrow badge renders to satisfy platform communication standards.

#### Backend Jest/API Tests (`06_patient-payment-escrow.test.ts`)
- **TC-BE-501-01** (Priority: High) | Req: `FR-501` | AC: `AC-501.1.1`
  - *Desc:* Verify PaymentIntent creation configuration triggers manual capture settings.
  - *Expected:* Payment intent is generated with pre-authorization holds.
- **TC-BE-501-02** (Priority: High) | Req: `FR-501` | AC: `SECC-004`
  - *Desc:* Verify webhook endpoint rejects request payloads containing invalid signatures.
  - *Expected:* Signature validations reject unverified payload requests.
- **TC-BE-501-03** (Priority: High) | Req: `FR-501` | AC: `AC-501.2.1`
  - *Desc:* Verify execution of cancellation refund triggers Stripe API void request.
  - *Expected:* Escrow funds are voided and transaction state updates.

---

### FEAT-301: Encrypted Webrtc Video

#### Frontend Playwright Tests (`07_encrypted-webrtc-video.spec.ts`)
- **TC-FE-301-01** (Priority: High) | Req: `FR-301` | AC: `AC-301.1.3`
  - *Desc:* Verify call screen control widgets load and trigger mute and share camera states.
  - *Expected:* Call buttons update track configurations correctly.
- **TC-FE-301-02** (Priority: Medium) | Req: `FR-301` | AC: `AC-301.1.2`
  - *Desc:* Verify system displays validation error screen on hardware block.
  - *Expected:* UI intercepts device exceptions and displays diagnostic instructions.

#### Backend Jest/API Tests (`07_encrypted-webrtc-video.test.ts`)
- **TC-BE-301-01** (Priority: High) | Req: `FR-301` | AC: `AC-301.1.1`
  - *Desc:* Verify WebRTC token generator maps access rights to appointment participants only.
  - *Expected:* Access token generation enforces participant boundaries.
- **TC-BE-301-02** (Priority: High) | Req: `FR-301` | AC: `AC-301.1.2`
  - *Desc:* Verify call room session scheduler terminates room access after duration caps.
  - *Expected:* API routes reject expired consultation tokens.

---

### FEAT-302: Shared Consultation Space

#### Frontend Playwright Tests (`08_shared-consultation-space.spec.ts`)
- **TC-FE-302-01** (Priority: High) | Req: `FR-302` | AC: `AC-302.1.2`
  - *Desc:* Verify WebSocket chat widget displays text messages and scroll heights update.
  - *Expected:* Chat messages transmit over socket connection and render.
- **TC-FE-302-02** (Priority: High) | Req: `FR-302` | AC: `AC-302.2.1`
  - *Desc:* Verify doctor can type clinical notes and status indicators show auto-saving.
  - *Expected:* Editor updates trigger debounced auto-save requests.

#### Backend Jest/API Tests (`08_shared-consultation-space.test.ts`)
- **TC-BE-302-01** (Priority: High) | Req: `FR-302` | AC: `AC-302.2.1`
  - *Desc:* Verify that patient roles are blocked from accessing clinical notes APIs.
  - *Expected:* Security checks restrict notes API access to doctor roles.
- **TC-BE-302-02** (Priority: High) | Req: `SEC-101` | AC: `SECC-003`
  - *Desc:* Verify database encryption configurations encrypt chat history.
  - *Expected:* Message inputs are encrypted in database.

---

### FEAT-401: Patient Secure Ehr Vault

#### Frontend Playwright Tests (`09_patient-secure-ehr-vault.spec.ts`)
- **TC-FE-401-01** (Priority: High) | Req: `FR-401` | AC: `AC-401.1.1`
  - *Desc:* Verify dragging and dropping medical reports updates upload queues.
  - *Expected:* Upload dropzone registers files and shows upload progress.
- **TC-FE-401-02** (Priority: High) | Req: `FR-401` | AC: `AC-401.1.2`
  - *Desc:* Verify patient can grant temporary access permissions to a doctor.
  - *Expected:* Access manager settings compile permissions and save choices.

#### Backend Jest/API Tests (`09_patient-secure-ehr-vault.test.ts`)
- **TC-BE-401-01** (Priority: High) | Req: `FR-401` | AC: `AC-401.1.1`
  - *Desc:* Verify document upload registers file and stores checksum hash.
  - *Expected:* Database registry stores checksums and files are written to S3.
- **TC-BE-401-02** (Priority: High) | Req: `FR-401` | AC: `AC-401.2.1`
  - *Desc:* Verify temporary permissions expire 48 hours after appointment end.
  - *Expected:* Expired permission keys are rejected by access controls.
- **TC-BE-401-03** (Priority: Medium) | Req: `SEC-104` | AC: `SECC-005`
  - *Desc:* Verify file downloads record access audits.
  - *Expected:* Access checks log audits before generating signed URLs.

---

### FEAT-402: Eprescription Creator Signer

#### Frontend Playwright Tests (`10_eprescription-creator-signer.spec.ts`)
- **TC-FE-402-01** (Priority: High) | Req: `FR-402` | AC: `AC-402.1.1`
  - *Desc:* Verify doctor can add multiple medication lines in prescription builder.
  - *Expected:* Prescription composer dynamically appends medication forms.
- **TC-FE-402-02** (Priority: High) | Req: `FR-402` | AC: `AC-402.2.1`
  - *Desc:* Verify doctor can submit MFA validation code to sign prescription.
  - *Expected:* OTP forms block actions until correct inputs are validated.

#### Backend Jest/API Tests (`10_eprescription-creator-signer.test.ts`)
- **TC-BE-402-01** (Priority: High) | Req: `FR-402` | AC: `AC-402.2.1`
  - *Desc:* Verify prescription sign API checks verification tokens.
  - *Expected:* Verification failures abort signing actions and block outputs.
- **TC-BE-402-02** (Priority: High) | Req: `FR-402` | AC: `AC-402.1.2`
  - *Desc:* Verify signed prescriptions generate read-only S3 PDF objects.
  - *Expected:* Finalized PDFs are locked on object storage levels.
- **TC-BE-402-03** (Priority: Medium) | Req: `FR-402` | AC: `AC-402.1.2`
  - *Desc:* Verify prescription submittals are blocked 4 hours after appointment ends.
  - *Expected:* Sign deadlines restrict submissions to safety limits.

---

### FEAT-502: Doctor Wallet Split Payouts

#### Frontend Playwright Tests (`11_doctor-wallet-split-payouts.spec.ts`)
- **TC-FE-502-01** (Priority: High) | Req: `FR-502` | AC: `AC-502.2.1`
  - *Desc:* Verify wallet page displays available vs pending balances and transaction tables.
  - *Expected:* Doctor balance dashboard renders tables with net calculations.
- **TC-FE-502-02** (Priority: High) | Req: `FR-502` | AC: `AC-502.1.1`
  - *Desc:* Verify linking bank account button triggers Stripe Connect redirects.
  - *Expected:* Onboarding click routes user to Stripe portals.

#### Backend Jest/API Tests (`11_doctor-wallet-split-payouts.test.ts`)
- **TC-BE-502-01** (Priority: High) | Req: `FR-502` | AC: `AC-502.2.1`
  - *Desc:* Verify payout tasks calculate split sums and route payouts on intervals.
  - *Expected:* Payout triggers send funds to Stripe and update databases.
- **TC-BE-502-02** (Priority: Medium) | Req: `FR-502` | AC: `AC-502.2.1`
  - *Desc:* Verify payout scheduler skips wallets containing less than $50 minimum.
  - *Expected:* Minimum balance limits block transfers.

---

### FEAT-601: Patient Consolidated Dashboard

#### Frontend Playwright Tests (`12_patient-consolidated-dashboard.spec.ts`)
- **TC-FE-601-01** (Priority: High) | Req: `FR-601` | AC: `AC-601.1.1`
  - *Desc:* Verify dashboard displays appointments listings, prescription links, and invoice grids.
  - *Expected:* Patient portals compile recent account records.
- **TC-FE-601-02** (Priority: Medium) | Req: `FR-201` | AC: `AC-601.1.2`
  - *Desc:* Verify canceled appointments display warning banners in UI.
  - *Expected:* Canceled items render warnings instead of call buttons.

#### Backend Jest/API Tests (`12_patient-consolidated-dashboard.test.ts`)
- **TC-BE-601-01** (Priority: High) | Req: `FR-601` | AC: `AC-601.2.1`
  - *Desc:* Verify GET /api/v1/patients/:id/dashboard compiles queries in SLA limit.
  - *Expected:* Data aggregates are read and validated.
- **TC-BE-601-02** (Priority: High) | Req: `FR-601` | AC: `SECC-001`
  - *Desc:* Verify accessing other patient dashboards is blocked.
  - *Expected:* Multitenant access controls block unauthorized queries.

---

### FEAT-602: Verified Consultation Reviews

#### Frontend Playwright Tests (`13_verified-consultation-reviews.spec.ts`)
- **TC-FE-602-01** (Priority: High) | Req: `FR-602` | AC: `AC-602.1.2`
  - *Desc:* Verify patient can input review ratings and write comment details.
  - *Expected:* Form records ratings values and submits comments.
- **TC-FE-602-02** (Priority: Medium) | Req: `FR-602` | AC: `AC-602.2.1`
  - *Desc:* Verify doctor profile lists public review cards.
  - *Expected:* Public views compile reviews details.

#### Backend Jest/API Tests (`13_verified-consultation-reviews.test.ts`)
- **TC-BE-602-01** (Priority: High) | Req: `FR-602` | AC: `AC-602.1.1`
  - *Desc:* Verify reviews require completed status.
  - *Expected:* Verified validators block review writes on uncompleted items.
- **TC-BE-602-02** (Priority: High) | Req: `FR-602` | AC: `SECC-003`
  - *Desc:* Verify automated review text checks scrub private details.
  - *Expected:* System filters out private elements.
- **TC-BE-602-03** (Priority: High) | Req: `FR-602` | AC: `AC-602.2.1`
  - *Desc:* Verify submitting new reviews recalculates rating averages.
  - *Expected:* New reviews trigger rating updates.

---

### FEAT-702: Multichannel Notification Hub

#### Frontend Playwright Tests (`14_multichannel-notification-hub.spec.ts`)
- **TC-FE-702-01** (Priority: High) | Req: `FR-702` | AC: `AC-702.2.1`
  - *Desc:* Verify notifications popover displays alerts lists.
  - *Expected:* Notification components toggle visibility states.
- **TC-FE-702-02** (Priority: Medium) | Req: `FR-702` | AC: `AC-702.1.2`
  - *Desc:* Verify changing alert preferences switches config flags.
  - *Expected:* Settings widgets save channels flags.

#### Backend Jest/API Tests (`14_multichannel-notification-hub.test.ts`)
- **TC-BE-702-01** (Priority: High) | Req: `FR-702` | AC: `AC-702.1.1`
  - *Desc:* Verify templater compiles parameters safely.
  - *Expected:* Message builder compiles inputs safely.
- **TC-BE-702-02** (Priority: High) | Req: `FR-702` | AC: `AC-702.1.1`
  - *Desc:* Verify queue workers execute retry actions with exponential delays.
  - *Expected:* Failures trigger queue delays and retries.
- **TC-BE-702-03** (Priority: High) | Req: `FR-702` | AC: `AC-702.1.1`
  - *Desc:* Verify outgoing SMS text blocks scrub PHI details.
  - *Expected:* Alert notifications conform to HIPAA restrictions.
