# Feature: Automatic Certificate Generation and Download

## 1. Feature Overview
This feature manages the generation and download of certificates of completion. Once a learner successfully completes all curriculum topics and passes the course-level final examination, they become eligible for certification. The backend dynamically compiles a custom PDF certificate containing the learner's name, the course title, completion date, and a uniquely generated certificate ID. The system saves this certificate record in MongoDB Atlas to ensure duplicate requests return the same certificate ID and layout rather than regenerating database records.

## 2. Acceptance Criteria
*   **AC1:** Requesting a certificate (`GET /api/courses/:id/certificate`) when the final exam has not been passed returns an HTTP 403 Forbidden status.
*   **AC2:** When a certificate is generated, the response must include a downloadable PDF buffer or URL with an HTTP 200 OK status.
*   **AC3:** The generated certificate PDF must contain the learner's full name, the course title, date of completion, and a unique certificate ID.
*   **AC4:** The certificate ID must be uniquely generated and stored in MongoDB linked to the learner and course.
*   **AC5:** If a certificate is requested multiple times, it must retrieve the already generated certificate ID and layout rather than creating a new record.

## 3. UI/UX Requirements
*   **Certificate Claim Card:** Displayed on the Course Viewer dashboard upon passing the final exam. Shows a congratulatory message and a prominent "Download Certificate" button (styled with a download icon).
*   **Loading Overlay:** Clicking "Download Certificate" disables the button and displays a progress spinner (e.g. "Generating PDF...") while streaming the document payload.
*   **Download Trigger:** The browser interceptor receives the raw binary PDF stream and triggers an immediate download event, naming the file as `[CourseName]_Certificate.pdf`.

## 4. API Endpoints Required
*   **Endpoint:** `GET /api/courses/:id/certificate`
    *   **Description:** Generates or retrieves a certificate PDF.
    *   **Headers:** `Authorization: Bearer <token>`
    *   **Response (200 OK):**
        *   **Content-Type:** `application/pdf`
        *   **Content-Disposition:** `attachment; filename="React_19_Certificate.pdf"`
        *   **Body:** Raw PDF binary buffer stream.
    *   **Response (403 Forbidden - Final Exam Pending):**
        ```json
        {
          "success": false,
          "message": "Certificate unavailable. You must pass the final examination first."
        }
        ```

## 5. Data Models / Schema
### Certificate Schema (Mongoose)
```javascript
const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true // e.g. UUID or custom string 'CERT-LMS-XXXX'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  issuedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate certificates for the same learner/course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
```

## 6. State Management Notes
*   **Download Progress State:** Managed locally at the component level to control UI button loading states and spinner messages. No global context updates are required as this is a file download operation.

## 7. Edge Cases
*   **Name Updates After Issuance:** If a learner updates their profile name after the certificate is issued, does the certificate update? As per backend guidelines (Feature 1.3), the database stores the user ID link and builds the layout dynamically querying the User model, ensuring it reflects the user's latest name.
*   **Parallel PDF Compilation Hits:** Multiple download clicks on slow connections. The backend utilizes `findOrCreate` logic to ensure parallel hits resolve to the same `certificateId` and DB document, and the frontend locks the button during active transfers.

## 8. Dependencies on Other Features
*   **Feature 1.3: User Profile Management:** Requires name details to populate the PDF layout.
*   **Feature 4.2: Course-Level Final Examination:** Relies on final exam completion states to unlock eligibility.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Course/CourseViewer.test.jsx` (Checks download button rendering states and event handler invocations).
*   **Backend API Test File:** `tests/backend/integration/progress.test.js` (Checks eligibility gate blocks, PDF file headers, duplicate request consistency, and Mongoose creation logs).
*   **Backend Unit Test File:** `tests/backend/unit/services/certificate.test.js` (Validates the PDF generation module itself, verifying it compiles fields correctly into the buffer).

## 10. Out of Scope for This Feature
*   Emailing the certificate as an attachment.
*   Sharing certificates to social platforms (e.g., LinkedIn direct upload links).
*   Custom styling templates selectable by learners (the certificate layout is static and unified).
