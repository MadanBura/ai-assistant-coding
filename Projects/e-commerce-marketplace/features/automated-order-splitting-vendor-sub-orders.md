# Feature Specification: Automated Order Splitting & Vendor Sub-Orders

## 1. Overview & Purpose
This feature handles post-purchase order splitting. When a customer purchases items from multiple vendors, the master order is split into separate sub-orders for each vendor, ensuring proper data isolation, custom shipping details, and individual status workflows.

---

## 2. Scope & Detailed Requirements

### Order Splitting
* Break down a master Order containing multi-vendor items into sub-orders immediately upon receipt of a successful payment confirmation.
* Assign a unique sub-order ID for each vendor-specific bundle.

### Sub-Order Creation
* Each sub-order maintains its own subtotal, tax amount, shipping fee, delivery service, and tracking metadata.

### Vendor Visibility
* Vendor dashboard displays only the sub-orders matching the vendor's ID.
* Prevent vendors from seeing client billing information or products ordered from other stores in the same transaction.

### Order Management
* Allow vendors to process their respective sub-orders independently (e.g., mark as processing, print invoice PDFs).

### Access Restrictions
* Implement backend checks to ensure a logged-in seller can only fetch or modify sub-orders matching their vendor ID.

---

## 3. Technical Workflow & User Flows

```
      [Customer Checkout Success]
                 |
                 v
        Generate Master Order 
     (e.g., Order #10001, Total $150)
                 |
                 v
      Order Splitter Process
                 |
                 +---> Split Group A (Vendor 1 Items) ---> Generate Sub-Order #10001-A
                 |                                         (Visible ONLY to Vendor 1)
                 |
                 +---> Split Group B (Vendor 2 Items) ---> Generate Sub-Order #10001-B
                                                           (Visible ONLY to Vendor 2)
```

---

## 4. Proposed API Endpoints

### Customer Endpoints
* `GET /api/v1/orders/:id` (Returns master order details and status of all sub-orders)

### Vendor Endpoints
* `GET /api/v1/vendor/sub-orders` (Returns all sub-orders for the authenticated vendor)
  * Query parameters: `status`, `page`, `limit`
* `GET /api/v1/vendor/sub-orders/:id` (Returns details of a specific sub-order)
* `PATCH /api/v1/vendor/sub-orders/:id/status` (Update sub-order state)
  * Body: `{ status: "processing" | "shipped" | "cancelled" }`

---

## 5. Database Schema & Data Model

* **Orders Entity (Master Order):**
  * `id`: UUID (Primary Key)
  * `customer_id`: UUID (Foreign Key to Users)
  * `total_amount`: Decimal
  * `status`: Enum (`created`, `paid`, `cancelled`)
  * `created_at`: Timestamp

* **Sub_Orders Entity:**
  * `id`: UUID (Primary Key)
  * `order_id`: UUID (Foreign Key to Orders)
  * `vendor_id`: UUID (Foreign Key to Vendor Profiles)
  * `subtotal`: Decimal
  * `shipping_cost`: Decimal
  * `tax`: Decimal
  * `fulfillment_status`: Enum (`pending`, `processing`, `shipped`, `delivered`, `returned`, `cancelled`)
  * `tracking_number`: String (Nullable)
  * `carrier`: String (Nullable)
  * `created_at`: Timestamp

---

## 6. Acceptance Criteria
* **AC-7.01:** Upon payment confirmation, one master Order ID is generated, alongside sub-order IDs for each unique vendor involved in the cart.
* **AC-7.02:** The customer order history dashboard shows tracking steps for each sub-order independently (e.g., "Vendor A's item: Shipped", "Vendor B's item: Processing").
* **AC-7.03:** Vendors can input tracking numbers and carrier names. The system validates this tracking information and triggers shipping notification emails containing active tracking URLs to the customer.
