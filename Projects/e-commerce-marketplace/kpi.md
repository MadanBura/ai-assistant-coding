# Key Performance Indicators (KPIs) & Acceptance Criteria

## Project: Multi-Vendor E-Commerce Platform

---

### 1. Key Performance Indicators (KPIs)
These KPIs are designed to measure the success of the platform across technical performance, business health, and operations (vendor success).

#### 1.1. Technical & System Performance KPIs
* **System Uptime:** $\ge 99.9\%$ monthly availability.
* **Core Page Load Speed (LCP):** Largest Contentful Paint under 2.5 seconds on mobile and 1.5 seconds on desktop over 4G/Broadband connections.
* **API Response Time:** Mean response time of $\le 200\text{ms}$ for non-static read APIs, and $\le 500\text{ms}$ for write/transactional APIs.
* **Search Latency:** Meilisearch/Elasticsearch query execution speed under 100ms for active catalogs up to 100,000 SKUs.
* **Error Rate:** HTTP 5xx responses must represent less than $0.1\%$ of all API traffic.

#### 1.2. Business Health KPIs
* **Monthly Active Users (MAU):** Growth metric tracking return customers and active sessions.
* **Conversion Rate:** Goal is a $\ge 2.5\%$ average conversion rate (Purchases / Total Visitors).
* **Shopping Cart Abandonment Rate:** Keep below $65\%$ using checkout optimizations, automatic cart recovery emails, and guest checkout options.
* **Customer Lifetime Value (LTV) to Customer Acquisition Cost (CAC) Ratio:** Target ratio of $\ge 3:1$ within 12 months.
* **Gross Merchandise Value (GMV):** Cumulative value of all goods sold on the platform (excluding returns/shipping charges).

#### 1.3. Merchant & Operational KPIs
* **Onboarding Time (KYC to First Sale):** Average merchant verification time under 48 hours.
* **Vendor Order Fulfillment Time:** Target shipping update (Processing $\rightarrow$ Shipped) within 24–48 hours of order confirmation.
* **Dispute Rate:** Disputed transactions (e.g., returns escalated to Admins) must be kept below $1.5\%$ of total sales.
* **Average Vendor Rating:** Platform average merchant rating must be maintained at $\ge 4.2 / 5.0$ stars.

---

### 2. Comprehensive Acceptance Criteria
Below is the verification checklist divided by feature modules. Every item must be satisfied to pass quality assurance (QA) and system integration testing (SIT).

#### Module 1: User Authentication & Role Setup
* **AC-1.01:** Users can sign up using email/password. Password must have a minimum complexity rule: at least 8 characters, 1 number, 1 uppercase letter, and 1 special character.
* **AC-1.02:** System verifies user emails by generating an encrypted, timed OTP or link. Unverified customers can browse but cannot finalize checkout; unverified sellers cannot list items.
* **AC-1.03:** Role boundaries are strict: Customers cannot access vendor dashboards (`/vendor/*`) or admin interfaces (`/admin/*`). Attempted access returns an HTTP 403 Forbidden.

#### Module 2: Vendor Onboarding & Storefront Customization
* **AC-2.01:** The registration form requires business name, phone, address, tax registration number, and bank account setup (via Stripe Connect).
* **AC-2.02:** Sellers must upload at least one valid identity document. The admin interface lists these documents as downloadable PDFs for approval workflows.
* **AC-2.03:** Dynamic URL mapping: Creating store name "Alpha Gear" generates `/store/alpha-gear` route, containing only products belonging to Vendor ID mapped to Alpha Gear.

#### Module 3: Catalog & Inventory Management (Vendor-Facing)
* **AC-3.01:** Vendors can create products with title, details, price, images, and categories. If a product field is missing or images exceed 5MB, appropriate validation error messages are displayed.
* **AC-3.02:** When creating variant groups (e.g., "Size: S, M, L" and "Color: Red, Blue"), the system generates the combination matrix (3 sizes x 2 colors = 6 items) and lets the vendor define unique stock quantities for each.
* **AC-3.03:** Low-Stock Notification trigger: When quantity falls below the threshold defined by the vendor, an automated mail/in-app notice is triggered.

#### Module 4: Product Search, Browsing, & Discovery
* **AC-4.01:** Text query search matches matches keywords in title, tags, and product description, showing results sorted by relevance matching scores.
* **AC-4.02:** Filtering by category updates product lists dynamically without full-page reloads (using React/Next.js client-side updates).
* **AC-4.03:** Multi-select filtering: Checking "Size: M" and "Color: Red" filters products to show items that have active inventory in *both* those specific variant specifications.

#### Module 5: Cart & Multi-Vendor Checkout Engine
* **AC-5.01:** Shopping cart displays line items sorted and grouped by Vendor.
* **AC-5.02:** Shipping calculations run asynchronously at checkout: The system requests shipping routes for each vendor's warehouse address to the customer's delivery destination, calculating total shipping as the sum of all vendor-specific shipping costs.
* **AC-5.03:** Coupons are validated: If a vendor coupon is applied, the discount is deducted only from that vendor's subtotal, not the platform total.

#### Module 6: Payment Processing & Split Routing
* **AC-6.01:** Customer credit card data undergoes encryption via Stripe Elements directly before hitting the app API. No raw credit card numbers are logged, stored, or sent to backend logs.
* **AC-6.02:** When payment succeeds, Stripe Connect splits the checkout total: the platform commission is transferred to the platform bank account, and the remaining item revenue is routed to the respective vendor balance (or held in escrow).
* **AC-6.03:** If a multi-vendor transaction fails (e.g., card declined), all items remain in the user's cart, and no partial sub-orders are created.

#### Module 7: Order Management & Tracking
* **AC-7.01:** Upon payment confirmation, one master Order ID is generated, alongside sub-order IDs for each unique vendor involved in the cart.
* **AC-7.02:** The customer order history dashboard shows tracking steps for each sub-order independently (e.g., "Vendor A's item: Shipped", "Vendor B's item: Processing").
* **AC-7.03:** Vendors can input tracking numbers and carrier names. The system validates this tracking information and triggers shipping notification emails containing active tracking URLs to the customer.

#### Module 8: Reviews & Dispute Resolution
* **AC-8.01:** Customers can rate a product/vendor only if they have purchased it and the sub-order state is "Delivered" or "Completed".
* **AC-8.02:** Once submitted, reviews cannot be edited by the customer (to prevent review tampering) but can be deleted by the customer or flagged by admins if violations occur.
* **AC-8.03:** In case of disputes, admins can initiate partial or full refunds through the Dispute Control panel, adjusting payouts on Stripe.
