# Product Requirements Document (PRD)

## Project: Multi-Vendor E-Commerce Platform

---

### 1. Introduction & Vision
The Multi-Vendor E-Commerce Platform is a multi-sided marketplace designed to bridge the gap between niche/local merchants and retail consumers. The platform enables sellers to set up customized micro-stores within the marketplace, leveraging the platform's traffic, search capabilities, and payment infrastructure. Customers receive a unified shopping experience, allowing them to purchase products from multiple sellers in a single checkout.

---

### 2. User Roles & Personas
* **Consumer (Customer):** The end-buyer. Seeks diversity of products, competitive pricing, seamless checkout, and reliable order tracking.
* **Vendor (Merchant):** Business owners listing inventory. Seeks catalog autonomy, transparent commission deductions, simple fulfillment workflows, and detailed store analytics.
* **Administrator (Platform Owner):** The platform operator. Seeks full control over user accounts, product validation, commission settings, site configurations, and dispute resolution.

---

### 3. Detailed Feature Specifications & Workflows

#### 3.1. Authentication & Profile Management
* **Requirements:**
  * Support email/password registration and OAuth 2.0 (Google, Apple).
  * Role-Based Access Control (RBAC): Users register as a Customer or Seller. Admins are created via seed scripts or super-admin invitation.
  * Profile management: Customers manage shipping/billing addresses, payment profiles, and order histories. Sellers manage store name, banner, logo, business address, and tax information.
* **Workflow:**
  ```
  User Registration -> Select Role (Customer / Seller) -> Verify Email -> Profile Complete
  ```

#### 3.2. Vendor Storefronts & Onboarding
* **Requirements:**
  * Self-service merchant onboarding wizard.
  * KYC Document upload (business registry, government identity, tax certificates).
  * Unique storefront URLs (e.g., `/store/vendor-slug`).
  * Custom branding settings: Logo, store banner description, contact email, and phone.
* **Fulfillment Settings:** Sellers can specify flat-rate shipping rules, free-shipping thresholds, or set carrier-calculated shipping rates.

#### 3.3. Product Catalog Management (Vendor-facing)
* **Requirements:**
  * Product editor supporting titles, rich-text descriptions, categories, tags, SKU codes, and multiple high-resolution images.
  * Pricing: Regular price, compare-at price (sale price), and tax category.
  * Inventory tracking: Track stock levels, low-stock threshold alerting, and set "continue selling when out of stock" option.
  * Product Variations: Ability to create variants based on attributes (e.g., Size, Color, Material), with unique pricing, SKUs, and stock counts per variant.
  * Product Status: Draft, Pending Approval, Active, Suspended.

#### 3.4. Product Discovery & Search (Customer-facing)
* **Requirements:**
  * Full-text search engine index supporting typos, synonyms, and autocomplete suggestions.
  * Category navigation hierarchy (multi-level taxonomy).
  * Advanced filters: Price range, vendor rating, product rating, variant filters (size/color), and availability status.
  * Sorting options: Relevance, price (low to high, high to low), rating, and newest arrivals.

#### 3.5. Shopping Cart & Checkout
* **Requirements:**
  * Persistent shopping cart saved across sessions (database/local storage sync).
  * Multi-vendor checkout: Group cart items by vendor to calculate vendor-specific shipping costs and taxes.
  * Coupon Engine: Apply platform-wide coupons (e.g., 10% off entire order) or vendor-specific coupons (e.g., free shipping on Vendor A's items only).
  * Checkout Flow:
    1. Address input/verification (Google Address API integration).
    2. Shipping option selection per vendor.
    3. Payment gateway integration (Stripe, PayPal) using Stripe Connect for split payment capabilities.
    4. Order confirmation page & email invoice generation.

#### 3.6. Order State Machine & Fulfillment
* **State Machine Diagram:**
  ```
  [Created] -> [Paid] -> [Processing (split to sub-orders)] -> [Shipped (per vendor)] -> [Delivered] -> [Completed]
                                                             \-> [Returned/Refunded (per sub-order)]
  ```
* **Order Splitting:** Once payment is confirmed, the main Order is split into multiple Sub-Orders (one per vendor).
* **Vendor Operations:** Vendors can access only their respective Sub-Orders, generate invoice PDFs, upload shipment tracking numbers, and update the sub-order status (Processing -> Shipped).
* **Tracking:** Customers view tracking timelines in their order dashboard, showing real-time updates for each vendor shipment.

#### 3.7. Payments, Commissions, & Payouts
* **Stripe Connect Integration:** Use Stripe Connect Custom or Express accounts for vendors.
* **Commission Engine:**
  * Global platform commission fee (e.g., 10% + $0.30 per transaction).
  * Vendor-specific commission overrides configured by Admins.
* **Payment Routing:**
  * Customer pays $X.
  * Stripe holds the payment -> Platform deducts commission -> Balance routed directly to Vendor's connected Stripe balance.
  * Escrow option: Hold funds in the platform's Stripe balance until delivery confirmation plus return window expiration (e.g., 14 days), then release to the vendor.

#### 3.8. Customer Reviews & Ratings
* **Requirements:**
  * Verified Buyer validation: A review prompt is only active for customers whose order status is "Completed".
  * Rating scale: 1 to 5 stars for both product quality and vendor service.
  * Rich reviews: Text reviews with up to 3 image uploads.
  * Review moderation: Flagging system for spam, abusive language, or false reviews, visible in the Admin Dashboard.

#### 3.9. Admin Control Center
* **Requirements:**
  * Dashboard analytics: Total Sales (GMV), net platform earnings, vendor counts, new signups, and transaction volume graphs.
  * Vendor Audit Panel: Review uploaded KYC documents and approve/suspend vendor storefronts.
  * Product Moderation Queue: Accept or reject newly created product listings by vendors.
  * Dispute Center: Resolve buyer claims for items not received, items damaged, or refund rejection appeals.

---

### 4. Technical Architecture & Database Schema Design

#### 4.1. Proposed Technology Stack
* **Frontend:** React / Next.js (Server-Side Rendering for fast initial load and SEO optimization), Tailwind CSS for styling.
* **Backend:** Node.js (Express or NestJS) / Python (FastAPI/Django) as the API layer.
* **Database:** PostgreSQL for transactional data (relational integrity, transactions, ACID), Redis for caching cart sessions and product search metadata.
* **Search Engine:** Elasticsearch or Meilisearch for full-text search capability.
* **Storage:** AWS S3 or Cloudinary for product image and KYC document uploads.

#### 4.2. Simplified Entity Relationship Diagram (Conceptual)
* **Users Table:** `id`, `email`, `password_hash`, `role` (customer, vendor, admin), `created_at`
* **Vendor Profiles Table:** `id`, `user_id` (FK), `store_name`, `slug`, `logo_url`, `banner_url`, `kyc_status` (pending, approved, rejected), `stripe_connect_id`
* **Products Table:** `id`, `vendor_id` (FK), `title`, `description`, `price`, `compare_at_price`, `stock_quantity`, `status` (draft, active, suspended), `created_at`
* **Product Variants Table:** `id`, `product_id` (FK), `variant_name`, `sku`, `price`, `stock_quantity`
* **Orders Table:** `id`, `customer_id` (FK), `total_amount`, `payment_status` (unpaid, paid, refunded), `created_at`
* **Sub_Orders Table:** `id`, `order_id` (FK), `vendor_id` (FK), `subtotal`, `shipping_cost`, `fulfillment_status` (pending, shipped, delivered, returned), `tracking_number`, `carrier`
* **Order_Items Table:** `id`, `sub_order_id` (FK), `product_id` (FK), `variant_id` (FK), `quantity`, `price`
* **Reviews Table:** `id`, `product_id` (FK), `customer_id` (FK), `rating`, `review_text`, `created_at`

---

### 5. Security, Compliance, & Performance Requirements
* **PCI DSS Compliance:** Credit card information must be tokenized directly on the client side via Stripe Elements/SDKs. The backend must never handle raw card numbers.
* **Data Privacy:** Encrypt all Personally Identifiable Information (PII) including name, billing address, phone numbers. Standardize GDPR compliance mechanisms (data deletion requests, privacy consent banners).
* **API Rate Limiting:** Apply rate limiters on public APIs (e.g., login, password reset, checkout initialization) to prevent DDoS attacks.
* **Caching Strategy:** Cache slow-moving data like category lists, global site settings, and highly popular products on Redis with appropriate time-to-live (TTL) limits.
