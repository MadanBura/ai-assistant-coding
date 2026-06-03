# Feature Specification: Product Catalog & Variant Management

## 1. Overview & Purpose
This feature equips vendors with full CRUD capability over their digital catalogs. It supports single-item listings, variant combination grids (e.g., color and size matrix grids), automated inventory deduction tracking, and multi-photo uploads.

---

## 2. Scope & Detailed Requirements

### Product CRUD
* Create, Read, Update, Delete operations for products.
* Fields: Title, description, SKU, pricing, compare-at pricing, and stock quantity.
* Status flags: `draft` (only visible to vendor), `pending_moderation` (under admin review), `active` (publicly visible), `suspended` (blocked by admin).

### Media Management
* Supporting up to 8 image uploads per product.
* Drag-and-drop ordering, allowing vendors to choose a primary thumbnail image.
* Upload validation checking file extensions and size constraints (<5MB).

### Category Assignment
* Associate products with one or more categories in the hierarchical category taxonomy.

### Variant Builder
* Support multiple attribute dimensions (e.g., Size, Color, Material).
* Dynamic generation of all possible combinations (Cartesian product).
* Ability to configure variant-specific SKU, pricing, and stock level overrides.

### Inventory Tracking
* Track inventory levels.
* Low stock alerts based on vendor-configured levels.
* Prevent double-ordering: Locks/decrements inventory at checkout completion.

---

## 3. Technical Workflow & User Flows

```
[Vendor Dashboard] 
       |
       +---> Create New Product 
       |        |
       |        +---> Input Base Details (Title, Description, Category, Base Price)
       |        +---> Upload Media (Thumbnail, Gallery Images)
       |        +---> Select Attributes (e.g., Size, Color)
       |                 |
       |                 +---> System generates Variant Combinations Matrix
       |                 +---> Edit individual Variant SKU, Price, and Stock quantities
       |
       +---> Save Product (Status: Pending Moderation)
```

---

## 4. Proposed API Endpoints

### Product Management (Vendor-Facing)
* `POST /api/v1/vendor/products` (Create product)
  * Body: `{ title, description, category_id, base_price, variants: [{ name, price, stock, sku }] }`
* `PUT /api/v1/vendor/products/:id` (Update product details)
* `DELETE /api/v1/vendor/products/:id` (Delete product)
* `POST /api/v1/vendor/products/:id/media` (Upload image files)

---

## 5. Database Schema & Data Model

* **Products Entity:**
  * `id`: UUID (Primary Key)
  * `vendor_id`: UUID (Foreign Key to Vendor Profiles)
  * `title`: String
  * `description`: Text
  * `base_price`: Decimal
  * `compare_at_price`: Decimal (Nullable)
  * `status`: Enum (`draft`, `pending_moderation`, `active`, `suspended`)
  * `created_at`: Timestamp

* **Product Variants Entity:**
  * `id`: UUID (Primary Key)
  * `product_id`: UUID (Foreign Key to Products)
  * `sku`: String (Unique)
  * `variant_name`: String (e.g., "M / Red")
  * `price_override`: Decimal (Nullable)
  * `stock_quantity`: Integer
  * `created_at`: Timestamp

---

## 6. Acceptance Criteria
* **AC-3.01:** Vendors can create products with title, details, price, images, and categories. If a product field is missing or images exceed 5MB, appropriate validation error messages are displayed.
* **AC-3.02:** When creating variant groups (e.g., "Size: S, M, L" and "Color: Red, Blue"), the system generates the combination matrix (3 sizes x 2 colors = 6 items) and lets the vendor define unique stock quantities for each.
* **AC-3.03:** Low-Stock Notification trigger: When quantity falls below the threshold defined by the vendor, an automated mail/in-app notice is triggered.
