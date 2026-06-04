# Feature Specification: Exportable Reports
## Feature ID: FEAT-602

---

## 1. Purpose
Enable social media managers (SMMs) to export analytics dashboards to branded PDF or raw CSV files. Reports can be generated on-demand, saved to Amazon S3 storage, and sent directly to client emails or downloaded from browser links, improving client communication workflows.

---

## 2. User Stories
* **US-602:** As a SMM, I want to export our dashboard analytics to a branded PDF or CSV file to send to clients.

---

## 3. Functional Requirements
1. **FR-602-1:** The backend MUST support on-demand generation requests for report exports in two formats: `PDF` and `CSV`.
2. **FR-602-2:** Report queries MUST specify parameter inputs: `start_date`, `end_date`, and workspace context.
3. **FR-602-3:** **PDF Compilation Engine:** The backend MUST generate PDFs asynchronously (using Puppeteer or PDFKit) to compile clean page breaks, charts representation styling, and workspace brand details.
4. **FR-602-4:** **CSV Compiler:** The system compiles raw analytics grids matching record values.
5. **FR-602-5:** Generated documents MUST be uploaded to a secure Amazon S3 folder structure: `workspace_id/reports/uuid_report.pdf`.
6. **FR-602-6:** The API MUST return a secure, expiring signed URL (valid for 15 minutes) allowing the client to download the report from S3.
7. **FR-602-7:** If the report takes longer than 5 seconds to generate, the system MUST queue the job, return a status indicator (e.g. `PENDING`), and email a link to the user once compilation finishes.

---

## 4. Validation Rules
* **Format Selector:** Must belong to: `['PDF', 'CSV']`.
* **Date Bounds:** Range limit MUST not exceed 12 months. Start date cannot be greater than end date.
* **Email Address:** The destination email must pass standard RFC 5322 validations (defaulting to the requesting user's email if not specified).

---

## 5. Edge Cases
* **Huge Data Sets Timing Out:** For large workspaces with thousands of posts, generating graphs could take up to 30 seconds. The server MUST process this asynchronously using Redis job workers (e.g. BullMQ) rather than blocking HTTP connection sockets, preventing gateway timeouts.
* **Generating Clean Charts in PDF:** Standard headless engines (Puppeteer) frequently render chart canvases blank if PDF print execution starts before chart animations complete. The backend PDF renderer MUST disable CSS animations and listen for explicit canvas draw events (`window.chartRenderStatus = 'complete'`) prior to generating PDF page streams.
* **S3 Write Faults:** If uploading the generated report fails:
  1. Catch the exception.
  2. Retry upload once.
  3. If still failing, return a `500 Internal Server Error` with diagnostic logs.

---

## 6. Dependencies
* **Headless Browser/PDF Engine:** Integration of Puppeteer or backend libraries like PDFKit/ExcelJS.
* **Mail Dispatch Integration:** Mailer engine capability defined in `FEAT-101`.
* **AWS S3 Bucket:** Access permissions defined in `FEAT-401`.

---

## 7. API Requirements

### 7.1 Initiate Report Generation Request
* **POST `/api/v1/analytics/export`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Request Body:**
  ```json
  {
    "format": "PDF",
    "start_date": "2026-05-01",
    "end_date": "2026-06-01",
    "email_to": "client@acme-brand.com"
  }
  ```
* **Response `202 Accepted`:**
  ```json
  {
    "report_id": "r9a8b7c6-e5f4-3a2b-1c0d-9e8f7a6b5c4e",
    "status": "PROCESSING",
    "message": "Report compilation has started. A download link will be emailed to client@acme-brand.com shortly."
  }
  ```

### 7.2 Get Report Generation Status
* **GET `/api/v1/analytics/export/:report_id`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Response `200 OK` (Processing Complete):**
  ```json
  {
    "report_id": "r9a8b7c6-e5f4-3a2b-1c0d-9e8f7a6b5c4e",
    "status": "COMPLETED",
    "download_url": "https://creatorsuite-media.s3.amazonaws.com/workspace_id/reports/uuid_report.pdf?AWSAccessKeyId=...",
    "expires_at": "2026-06-04T17:05:00Z"
  }
  ```

---

## 8. Database Impact
Logs generation actions in a `REPORT_LOG` tracking index:

```sql
CREATE TABLE report_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES "user"(id),
    report_format VARCHAR(10) NOT NULL CHECK (report_format IN ('PDF', 'CSV')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    s3_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_workspace ON report_log(workspace_id);
```

---

## 9. UI Components
* **Export Controls Dialog Modal:** Layout overlay containing file type selection buttons, date picker selectors, input field for client emails, and standard execution button.
* **Downloads Settings History:** Simple table rendering lists of recently requested reports with status indicators and download buttons.

---

## 10. Security Requirements
1. **expiring download references:** S3 pre-signed keys MUST be configured with strict expirations (Max 15 minutes), preventing historical reports from remaining accessible via cached links.
2. **Access Security validation:** Enforce authorization parameters. Rejects download requests targeting reports generated by another workspace user.

---

## 11. Acceptance Criteria
* **AC-602-1:** Triggering report requests kicks off generation background tasks and returns `202 Accepted` states.
* **AC-602-2:** PDF exports compile chart assets and upload cleanly to S3 buckets.
* **AC-602-3:** Expiring URLs expire and return access errors after 15 minutes.
* **AC-602-4:** Email alerts with download attachments/links are sent to target recipients.

---

## 12. Definition of Done (DoD)
1. **Asynchronous Tests:** Long-duration mock queues verified under high concurrent requests.
2. **Report Visual Validation:** Confirm PDFs render correctly across all layout sections.
3. **Tests:** Coverage ensures expired link requests fail with security block errors.
