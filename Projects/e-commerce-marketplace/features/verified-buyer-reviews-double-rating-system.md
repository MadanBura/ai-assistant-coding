# Feature Specification: Verified Buyer Reviews & Double Rating System

## 1. Overview & Purpose
This feature lets customers write reviews and rate both product quality and vendor service separately. It enforces verified-purchase verification and includes tools to handle media uploads and review moderation.

---

## 2. Scope & Detailed Requirements

### Purchase Verification
* The system checks database records to ensure the user has bought the item and the sub-order is marked as `Delivered` or `Completed` before allowing them to submit a review.

### Product Ratings
* Standard rating score (1-5 stars) assessing product design and functionality.

### Vendor Ratings
* Standard rating score (1-5 stars) assessing delivery speed, communication, packaging, and merchant service.

### Media Uploads
* Allow buyers to upload up to 3 photos of the received product to attach to their review (formats: JPG, PNG; max size: 3MB per image).

### Review Moderation
* Allow users to flag inappropriate reviews.
* Admin panel to review flagged ratings and remove spam or offensive content.

---

## 3. Technical Workflow & User Flows

```
[Customer visits product details page or Order History]
       |
       +---> Checks if user purchased the product & order is delivered
       |        |
       |        +---> Yes: Render "Write a Review" form
       |        +---> No: Hide review creation form, display read-only reviews
       |
       +---> Customer completes form:
       |        +---> Inputs Product Star Rating (1-5) & Vendor Star Rating (1-5)
       |        +---> Types review comment text
       |        +---> Uploads photos of the product
       |
       +---> Submits Form -> Database records review (Status: Active)
       +---> Recalculate average scores for the Product & Vendor profile
```

---

## 4. Proposed API Endpoints

### Review Submission Endpoints
* `POST /api/v1/reviews`
  * Body: `{ product_id, sub_order_id, product_rating, vendor_rating, text }`
  * Response: `{ status: "success", review_id }`
* `POST /api/v1/reviews/:id/media` (Upload review photos)

### Public Fetching Endpoints
* `GET /api/v1/products/:id/reviews` (Paginated list of product reviews)
* `GET /api/v1/vendor/:id/reviews` (Paginated list of vendor feedback)

---

## 5. Database Schema & Data Model

* **Reviews Entity:**
  * `id`: UUID (Primary Key)
  * `product_id`: UUID (Foreign Key to Products)
  * `sub_order_id`: UUID (Foreign Key to Sub_Orders, Unique constraints to prevent duplicate reviews)
  * `customer_id`: UUID (Foreign Key to Users)
  * `product_rating`: Integer (Range 1-5)
  * `vendor_rating`: Integer (Range 1-5)
  * `review_text`: Text (Nullable)
  * `is_flagged`: Boolean (Default: false)
  * `created_at`: Timestamp

* **Review Media Entity:**
  * `id`: UUID
  * `review_id`: UUID (Foreign Key to Reviews)
  * `image_url`: String
  * `created_at`: Timestamp

---

## 6. Acceptance Criteria
* **AC-9.01:** Customers can rate a product/vendor only if they have purchased it and the sub-order state is "Delivered" or "Completed".
* **AC-9.02:** Once submitted, reviews cannot be edited by the customer (to prevent review tampering) but can be deleted by the customer or flagged by admins if violations occur.
* **AC-9.03:** Average ratings recalculate automatically in the background when a review is added or removed, updating the cache.
