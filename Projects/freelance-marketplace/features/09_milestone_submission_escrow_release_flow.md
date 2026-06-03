# Feature Specification: Milestone Submission & Escrow Release Flow
## Feature ID: F-09

---

### 1. Feature Description
Manage the lifecycle of active milestones. This feature guides freelancers through submitting work deliverables, allows clients to review and approve submissions, and handles automated payout releases from escrow to the freelancer's wallet balance while applying commission deductions.

---

### 2. Scope & Boundaries

#### In-Scope:
- **Deliverable Uploads**: Freelancers upload code zips, document links, and text descriptions detailing completed work parameters.
- **Client Reviews**: Client UI to inspect submissions, containing buttons to *"Request Changes"* or *"Approve & Release Funds"*.
- **Approval Workflow**: State updates moving milestones from `Funded` -> `Submitted` -> `Released` or `Disputed`.
- **Escrow Release**: Invokes payment transfer APIs to move funds from platform holds to withdrawable freelancer ledger balances.
- **Commission Deduction**: Automatically calculates and separates a 10% platform service fee upon successful release.

#### Out-of-Scope:
- Automatic code repository analysis (e.g., executing test suites on GitHub before approval).
- Client bank-side dispute handling (chargebacks are handled out-of-band by Admins).

---

### 3. Detailed Technical Requirements

```
[ Freelancer: Submits Deliverable ]  --> Sets Milestone to 'Submitted'
                                                |
                                                v
                                     [ Client: Review Panel ]
                                                |
              +---------------------------------+---------------------------------+
              | (Approve & Release)                                               | (Request Revision)
              v                                                                   v
[ Backend: Payout Execution ]                                       Sets Milestone back to 'Funded'
              |                                                     Sends Feedback Notification
              +---> Calculates 10% Platform Fee
              +---> Updates Freelancer Balance (90%)
              +---> Updates Milestone status to 'Released'
```

#### 3.1. Frontend Views & UI Elements
- **Deliverables Submit Form**: Modal for freelancers. Requires summary text and provides file file-drop slots.
- **Milestone Review Console**: Client-facing workspace view showing submitted files, reviewer logs, revision feedback history, and confirmation action modules.
- **Withdrawable Balance Dashboard**: Freelancer billing dashboard showing available balances, pending escrow listings, and deduction invoice generators.

#### 3.2. Backend APIs & Endpoints
- `POST /api/v1/milestones/:id/submit`: Freelancer submits deliverables.
- `POST /api/v1/milestones/:id/approve`: Client triggers approval. Executes financial balance updates.
- `POST /api/v1/milestones/:id/revision`: Client requests modifications, transitioning state to revision active.

#### 3.3. Database Schema Impact
- **MilestoneSubmissions Table**: Create table storing `id` (UUID, PK), `milestone_id` (UUID, FK), `freelancer_id` (UUID), `message` (TEXT), `attachment_urls` (ARRAY), `created_at` (TIMESTAMP).
- **WalletBalances Table**: Add column `available_balance` (DECIMAL), `escrow_pending_balance` (DECIMAL).

---

### 4. Acceptance Criteria & Edge Cases

| Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- |
| **Double Payout Prevention** | Client double-clicks the "Approve" button | Concurrent database transactions are executed | Database row locks (`SELECT FOR UPDATE`) on the milestone prevent duplicate balance additions. |
| **Negative Fee Calculation** | Milestone budget is $100 | Client approves release | System deducts exactly $10 (10%) platform fee and adds $90 to freelancer balance; fee cannot yield negative bounds. |
| **File Size Limit Breach** | Freelancer uploads a 150MB project ZIP | They click upload | Client-side validation blocks upload, indicating file exceeds 50MB restriction. |
| **Automatic Review Timeout** | Milestone is in `Submitted` state for 14 days without client action | System cron-job executes daily | System automatically approves submission, releases escrow, and notifies client. |
| **Escrow Unlock on Dispute** | Contract enters dispute | Milestone status is updated | Payout abilities remain frozen until Admin overrides state. |
