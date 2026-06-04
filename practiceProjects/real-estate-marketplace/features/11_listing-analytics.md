# Feature Specification: Listing Analytics & Trends

## 1. Feature Info
* **Feature ID:** `FT-4.2`
* **Priority:** 11 (Market Intelligence & Performance Module)
* **Title:** Listing Analytics & Trends

---

## 2. Purpose
Provides agents and property owners with graphical performance charts tracking listing views, inquiries, and conversion ratios. It also gives buyers historical neighborhood pricing data compared to the listing price.

---

## 3. User Stories
* **US-4.5:** As an Agent or Owner, I want to track how many users view my listing or send inquiries over time so that I can evaluate its marketing performance.
* **US-4.6:** As a Buyer, I want to view historical price trend charts for the neighborhood so that I can determine if a listing is priced fairly.

---

## 4. Functional Requirements

### FR-402.1: Interaction Logging Middlewares
* **Description:** Intercept request paths for property pages (`GET /properties/{id}`) and inquiries to log engagement events:
  * IP address hashes (for deduplication)
  * Event Type (`VIEW` | `INQUIRY` | `FAVORITE`)
  * Date timestamp

### FR-402.2: Daily Aggregator Job
* **Description:** A nightly cron job runs at 01:00 AM UTC to aggregate raw clickstream logs from `ANALYTICS_LOG` into a summary table `ANALYTICS_DAILY_SUMMARY`, reducing table read overhead.

### FR-402.3: Historical Neighborhood Valuation Calculator
* **Description:** Average listing prices within the property's ZIP code are aggregated monthly to generate a 12-month historical price trend index.

---

## 5. Validation Rules
* **VAL-402.1 (Date Window Bound):** Custom chart ranges must not exceed 12 months. Queries asking for larger spans must be rejected to protect memory buffers.
* **VAL-402.2 (Metric Bounds):** View and inquiry metrics count outputs must always return as non-negative integers.

---

## 6. Edge Cases
* **Edge Case 1: Sparse Neighborhood Data:** A listing is created in a newly built neighborhood with no historical sales or listing records.
  * *Resolution:* The chart must default to broader city/county statistical averages and display a tooltip: "Insufficient local data; showing city average."
* **Edge Case 2: Bot View Spamming:** A bot spams requests to a property detail page, inflating views.
  * *Resolution:* Deduplicate view counts by hashing user IP and user agent strings. The system must count only one view per user session per 24 hours.

---

## 7. Dependencies
* **Upstream:** `FT-2.1` (Properties details context), `FT-5.1` (Inquiries tracking).
* **Downstream:** Agent/Owner Dashboards (displays analytics charts).

---

## 8. API Requirements

### Fetch Listing Performance Analytics
* **Endpoint:** `GET /api/v1/analytics/properties/{id}`
* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:** `startDate` (ISO Date), `endDate` (ISO Date)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "propertyId": "prop_9910a",
    "conversionFunnel": {
      "totalViews": 1250,
      "totalFavorites": 85,
      "totalInquiries": 42,
      "conversionRatePercentage": 3.36
    },
    "timeline": [
      { "date": "2026-06-01", "views": 150, "inquiries": 4 },
      { "date": "2026-06-02", "views": 220, "inquiries": 8 }
    ]
  }
}
```

### Fetch Neighborhood Trends
* **Endpoint:** `GET /api/v1/analytics/neighborhoods`
* **Query Parameters:** `zipcode` (String, required)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "zipcode": "10001",
    "medianPricePerSqft": 820.50,
    "priceTrend12Months": [
      { "month": "2025-07", "medianPrice": 800 },
      { "month": "2025-08", "medianPrice": 805 }
    ]
  }
}
```

---

## 9. Database Impact
* **Target Tables:** `ANALYTICS_LOG` (inserts), `ANALYTICS_DAILY_SUMMARY` (populated by cron).
* **Summary Table Schema:**
```sql
CREATE TABLE analytics_daily_summaries (
    id SERIAL PRIMARY KEY,
    property_id VARCHAR REFERENCES properties(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    UNIQUE (property_id, summary_date)
);
```

---

## 10. UI Components
* **Line Charts Engine:** Powered by Recharts/Chart.js. Responsive panels rendering views and inquiries curves with custom legends.
* **Funnel Progress Bars:** Standardized metrics blocks showing conversion drops from View -> Bookmark -> Message.
* **Neighborhood Comparison Line:** Chart comparing the target property's price/sqft with the neighborhood average line over time.

---

## 11. Security Requirements
* **SEC-402.1 (Performance Metrics Access Limit):** Performance metrics for individual listings (`/analytics/properties/{id}`) can be queried only by the listing Owner/Agent or platform Admins. Uninvited requests must be rejected.
* **SEC-402.2 (IP Data Hash Obfuscation):** IP details logged inside `ANALYTICS_LOG` must be hashed using SHA-256 before storage to comply with data privacy regulations.

---

## 12. Acceptance Criteria
* **AC-403:** Confirm opening a property page records a view increment that is throttled per session.
* **AC-404:** Verify neighborhood median metrics render correctly when compared to individual property specs.

---

## 13. Definition of Done
* [ ] Daily aggregate Cron logic implemented and verified under testing environments.
* [ ] Charts display responsive layouts down to mobile viewport widths.
* [ ] Database query indexing configured on summary tables.
