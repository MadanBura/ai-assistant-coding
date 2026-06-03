# Feature Specification: Fulfillment Tracking & Notification System

## 1. Overview & Purpose
This feature tracks the delivery pipeline of sub-orders, enables vendors to attach shipping details (tracking codes, carriers), and triggers automated, real-time alerts to customers via email, SMS, or in-app updates as shipping milestones occur.

---

## 2. Scope & Detailed Requirements

### Shipment Tracking
* Display interactive shipping timelines showing key transit stages (Order Paid, Package Prepared, Shipped, Out for Delivery, Delivered).

### Tracking Number Upload
* Fields for vendors to input a shipping tracking code and carrier name (e.g., FedEx, DHL, UPS) when marking sub-orders as `Shipped`.

### Carrier Management
* System checks carrier fields and formats tracking URLs using standard carrier query patterns.

### Status Updates
* Changing a sub-order's status triggers updates to the master order status (e.g., if all sub-orders are `delivered`, master order status updates to `completed`).

### Customer Notifications
* Automated dispatch of emails and SMS alerts to the customer when the sub-order transitions to `Shipped` or `Delivered`.

---

## 3. Technical Workflow & User Flows

```
[Vendor Dashboard: Sub-Order Details]
       |
       +---> Vendor packs items, generates label from carrier
       +---> Clicks "Mark as Shipped" in system UI
       +---> Inputs Carrier (e.g., "FedEx") & Tracking Number (e.g., "123456789")
       |
       +---> Backend updates Sub-Order status to "shipped"
       +---> Triggers Async Event Listener
                |
                +---> Generates Tracking URL (https://www.fedex.com/tracking?tracknumbers=123456789)
                +---> Sends Email Notification to Buyer with the tracking URL
                +---> Broadcasts In-App notification alert to Buyer account
```

---

## 4. Proposed API Endpoints

### Fulfillment Endpoints (Vendor-Facing)
* `POST /api/v1/vendor/sub-orders/:id/fulfill`
  * Body: `{ carrier, tracking_number }`
  * Response: `{ status: "shipped", tracking_url }`

### Customer Endpoints
* `GET /api/v1/orders/:id/tracking`
  * Response: `{ sub_order_id, carrier, tracking_number, status_history: [{ status, timestamp }] }`

---

## 5. Database Schema & Data Model

* **Sub-Order Tracking Logs (Audit Trail):**
  * `id`: UUID (Primary Key)
  * `sub_order_id`: UUID (Foreign Key to Sub_Orders)
  * `status`: Enum (`pending`, `processing`, `shipped`, `delivered`, `returned`, `cancelled`)
  * `updated_by`: UUID (User ID of Seller or Admin)
  * `created_at`: Timestamp

---

## 6. Acceptance Criteria
* **AC-8.01:** The customer order history dashboard shows tracking steps for each sub-order independently (e.g., "Vendor A's item: Shipped", "Vendor B's item: Processing").
* **AC-8.02:** Vendors can input tracking numbers and carrier names. The system validates this tracking information and triggers shipping notification emails containing active tracking URLs to the customer.
* **AC-8.03:** Dynamic status cascade: When all sub-orders under a master order reach `Delivered`, the master order automatically updates status to `Completed`.
