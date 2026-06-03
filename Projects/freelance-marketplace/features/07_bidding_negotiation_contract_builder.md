# Feature Specification: Bidding Negotiation & Contract Builder
## Feature ID: F-07

---

### 1. Feature Description
Provide an interactive workspace for Clients and Freelancers to negotiate pricing, modify milestone splits, and revise project scopes. Once terms are mutually agreed upon, the system will lock revisions and dynamically compile a legal digital contract ready for funding.

---

### 2. Scope & Boundaries

#### In-Scope:
- **Proposal Negotiation Console**: Private text negotiation workspace linked to the bid.
- **Budget Revisions**: Clients can counter-offer with a revised budget amount.
- **Milestone Editing**: Bidders can modify title, details, and price allocations during active negotiation.
- **Agreement Workflow**: Dual-acceptance logic. Both freelancer and client must click "Accept Proposal Terms" to lock parameters.
- **Contract Generation**: Automatically generates a formal contract log containing user IDs, milestones, legal terms of service, and agreed delivery dates.

#### Out-of-Scope:
- PDF digital signature integrations (e.g., DocuSign). Cryptographic logs and platform check boxes represent legal agreement inside the marketplace.
- External contract uploads.

---

### 3. Detailed Technical Requirements

```
                     +---------------------------------------+
                     |  Freelancer Submits Initial Proposal   |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |  Client & Freelancer Chat/Negotiate   | <---+
                     +---------------------------------------+     |
                                         |                         |
                                         v                         |
                     +---------------------------------------+     |
                     | Revisions Made (Budget/Milestones)    | ----+
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     | Both Parties Accept Terms (Locked)    |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |   System Generates Active Contract    |
                     +---------------------------------------+
```

#### 3.1. Frontend Views & UI Elements
- **Negotiation Hub View**: Split-screen dashboard. Left: Active negotiation chat. Right: Interactive milestone inspector where changes update live using optimism states.
- **Counter-Offer Modal**: Minimal form allowing clients to change total bid values, which forces the freelancer to redistribute milestone budgets.
- **Contract Agreement Banner**: Displays green check badges showing which party has agreed to the current draft state.

#### 3.2. Backend APIs & Endpoints
- `POST /api/v1/proposals/:id/counter-offer`: Client submits updated pricing.
- `PUT /api/v1/proposals/:id/milestones`: Freelancer revises proposed milestones.
- `POST /api/v1/proposals/:id/agree`: Marks user role as "Agreed" to the current proposal specs.
- `GET /api/v1/contracts/:id`: Fetches the compiled contract and signature verification metadata.

#### 3.3. Database Schema Impact
- **Proposals Table**: Add columns `client_agreed` (BOOLEAN, DEFAULT false), `freelancer_agreed` (BOOLEAN, DEFAULT false), `is_negotiable` (BOOLEAN, DEFAULT true).
- **Contracts Table**: Create table structure linking `id` (UUID, PK), `proposal_id` (UUID, FK), `terms_hash` (VARCHAR - cryptographic hash of milestone details and system TOS version).

---

### 4. Acceptance Criteria & Edge Cases

| Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- |
| **Out-of-Sync Agreement** | Client accepts terms, but freelancer edits milestones thereafter | Freelancer clicks "Save Milestone Edits" | The client's agreement status reset to `false` and they are notified of modifications. |
| **Mutual Agreement Lock** | Both parties click "Accept Terms" | The second party clicks | The proposal edit permissions are disabled, state transitions to `ContractCreated`, and contract record generates. |
| **Invalid Budget Counter** | Client counter-offers with budget higher than project limits | They click send | System permits counters up to 150% of initial budget, warning user of limits. |
| **Contract Hash Verification** | A contract is successfully generated | System processes records | The terms and milestones must be hashed and stored, providing tamper-evident security. |
| **Withdrawal of Bid** | A freelancer withdraws proposal during active negotiation | They click withdraw | Active chat is archived, counter-offers are cancelled, and connects are not refunded unless job cancels. |
