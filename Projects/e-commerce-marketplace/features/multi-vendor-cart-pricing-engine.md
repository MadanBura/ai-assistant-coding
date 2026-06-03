# Feature Specification: Multi-Vendor Cart & Pricing Engine

## 1. Overview & Purpose
This feature handles the customer shopping cart logic, supporting items from multiple vendors simultaneously. The pricing engine calculates line items, taxes, shipping rates, and vendor-specific coupons dynamically.

---

## 2. Scope & Detailed Requirements

### Multi-Vendor Cart
* Allows customers to add items from different stores into a single checkout cart.
* Visual grouping: Cart UI displays items grouped by their respective vendor storefront names.
* Persistence: Save cart details on the database for logged-in users, and fallback to browser local storage for guest sessions.

### Shipping Calculation
* Sub-divide cart items by vendor to calculate delivery charges.
* Dynamic lookup of shipping rates based on vendor warehouse origin address and customer destination zip codes.

### Tax Calculation
* Apply regional taxes (e.g., VAT, Sales Tax) per item category and region regulations.

### Coupon Support
* Platform-wide coupons: Deduct absolute or percentage discount value from the total cart price.
* Vendor-specific coupons: Deduct discounts only from items matching the specific vendor's ID.

### Price Breakdown
* Display a details table: Subtotal per vendor, shipping fees per vendor, taxes, applied discounts, and final gross total.

---

## 3. Technical Workflow & User Flows

```
[Cart UI Page]
       |
       +---> Client fetches Cart API
       |        |
       +---> Backend Groups Items by Vendor ID
       +---> Fetch Shipping Rates API for each Vendor Group 
       +---> Apply Taxes & Coupon codes (Vendor A coupon vs. Global coupon)
       |        |
       +---> Returns Consolidated JSON Breakdown:
                {
                   vendorGroups: [ { vendorId, storeName, subtotal, shipping, tax } ],
                   globalDiscount,
                   finalTotal
                }
```

---

## 4. Proposed API Endpoints

### Cart Management Endpoints
* `GET /api/v1/cart` (Retrieve cart items & current calculated totals)
* `POST /api/v1/cart/items` (Add item or update quantity)
  * Body: `{ variant_id, quantity }`
* `DELETE /api/v1/cart/items/:variant_id` (Remove item)
* `POST /api/v1/cart/coupons` (Apply coupon code)
  * Body: `{ code }`

---

## 5. Database Schema & Data Model

* **Cart Items Entity:**
  * `id`: UUID (Primary Key)
  * `user_id`: UUID (Foreign Key to Users, Nullable for guest checkout sessions)
  * `session_token`: String (Nullable, links guest session tokens)
  * `variant_id`: UUID (Foreign Key to Product Variants)
  * `quantity`: Integer (Minimum 1)
  * `created_at`: Timestamp
  * `updated_at`: Timestamp

* **Coupons Entity:**
  * `id`: UUID
  * `code`: String (Unique)
  * `discount_type`: Enum (`percentage`, `fixed_amount`)
  * `value`: Decimal
  * `vendor_id`: UUID (Nullable, if null coupon is platform-wide)
  * `active_from`: Timestamp
  * `active_to`: Timestamp

---

## 6. Acceptance Criteria
* **AC-5.01:** Shopping cart displays line items sorted and grouped by Vendor storefront name.
* **AC-5.02:** Shipping calculations run asynchronously at checkout: The system requests shipping routes for each vendor's warehouse address to the customer's delivery destination, calculating total shipping as the sum of all vendor-specific shipping costs.
* **AC-5.03:** Coupons are validated: If a vendor coupon is applied, the discount is deducted only from that vendor's subtotal, not the platform total.
