# PRD — healthCare

## 1. Problem Statement
Modern healthcare delivery suffers from severe fragmentation, leading to inefficient patient-doctor interactions and compromised care quality. Patients struggle with long waiting lists, lack of transparent doctor availability, and tedious scheduling processes. Accessing medical history across different clinics is highly manual and prone to data loss, while remote consultations are often conducted over insecure, non-compliant communication channels. Doctors face high administrative overhead, unoptimized scheduling, and insecure methods for sharing digital prescriptions and medical records. Furthermore, patients have no reliable, verified mechanism (such as trusted reviews) to assess doctor credentials, and billing/payment collection remains slow and disconnected from the clinical flow.

## 2. Solution Overview
The proposed healthCare platform is a unified, HIPAA-compliant digital ecosystem connecting patients with verified medical professionals. It streamlines the entire patient journey and reduces administrative load for doctors. 
- Doctor Profiles: Displays verified qualifications, specialties, fees, clinic locations, aggregated reviews, and real-time appointment availability calendar.
- Appointment Booking: A real-time reservation engine that allows patients to select, schedule, and confirm appointment slots.
- Video Consultations: Secure, high-definition, peer-to-peer web RTC or telehealth video streams directly embedded in the browser, featuring automatic session logging.
- Medical Records: A encrypted, secure digital repository for storing and viewing laboratory results, scan reports, and medical history with fine-grained patient consent controls.
- Prescription Management: Allows doctors to issue digitally signed prescriptions that patients can view, download, or forward to partner pharmacies.
- Notifications: An automated email, SMS, and push notification microservice to handle appointment confirmations, booking reminders, video link dispatches, and billing receipts.
- Payments: A secure payment gateway integration (e.g., Stripe) handling upfront consultation fee holds, charge capturing post-consultation, and doctor payout distribution.
- Patient Dashboard: A centralized user interface summarizing upcoming appointments, prescription downloads, medical logs, consultation history, and unpaid invoices.
- Reviews: A verified rating and feedback system allowing patients to rate doctors post-consultation to ensure quality and transparency.
- Admin Portal: A back-office management console for verifying doctor medical licenses, monitoring global KPIs, managing disputes, and moderating reviews.

## 3. User Flow
Patient Flow:
1. Registration & Authentication: Patient signs up using email, mobile number, and password. Completes email/SMS verification.
2. Dashboard Access: Lands on the Patient Dashboard displaying health summaries, upcoming appointments, and a search bar.
3. Doctor Search: Searches for doctors by specialty, location, pricing, rating, or availability.
4. Profile Review: Clicks on a doctor's profile to view credentials, reviews, consultation fees, and available time slots.
5. Appointment Booking: Selects an open time slot, enters a brief reason for the visit, and clicks "Book Appointment".
6. Checkout & Payment: Redirected to a secure payment checkout to input card details. A authorization hold is placed on the consultation fee.
7. Confirmation: Receives automated SMS/email confirmation containing appointment details and a secure video consultation link.
8. Consultation Attendance: On the scheduled date, clicks the link from the dashboard or email, joins the virtual waiting room, and completes the 1-on-1 video call.
9. Records & Prescriptions Access: Accesses the generated digital prescription and consultation notes from the Patient Dashboard.
10. Review Submission: Receives a prompt to submit a rating (1-5 stars) and a written review of the doctor.

Doctor Flow:
1. Registration & Verification: Doctor signs up and uploads medical board certifications, identity proof, and clinical license documents.
2. Admin Audit: Doctor profile is hidden from search and marked "Pending Verification" until the Admin Portal approves credentials.
3. Profile & Availability Setup: Doctor logs in, defines consultation hours, sets fees, and syncs external calendars.
4. Appointment Management: Receives dashboard alerts for new bookings. Views patient medical histories (where consent is explicitly granted).
5. Consultation Execution: Joins the video room at the scheduled time, speaks with the patient, and takes digital clinical notes.
6. Prescribing & Logging: Fills out the digital prescription form and diagnostic notes, adds a digital signature, and submits the consultation record.
7. Earnings Tracking: Views pending payouts, completed consultation fees, and patient reviews on the doctor dashboard.

Admin Flow:
1. Authentication: Secure multi-factor login to the Admin Portal.
2. License Verification Queue: Admin reviews pending doctor applications, verifies credentials with official medical registries, and changes status to "Active" or "Rejected".
3. Moderation & Dispute Handling: Admin reviews flagged ratings/comments, manages refunds for cancelled appointments, and addresses dispute logs.
4. Platform Health Audit: Monitors total consultations, active users, transaction volumes, and system performance via a global dashboard.

## 4. API Design
Authentication & User Management:
- POST /api/v1/auth/register (Request: { email, password, role, firstName, lastName }. Response: { userId, token })
- POST /api/v1/auth/login (Request: { email, password }. Response: { token, user: { id, role } })

Doctor Profiles:
- GET /api/v1/doctors (Request Query: { specialty, location, rating, page }. Response: { doctors: [{ id, name, specialty, rating, fee }], total })
- GET /api/v1/doctors/:id (Request: { id }. Response: { doctor: { id, name, credentials, availabilityCalendar, reviews: [...] } })

Appointment Booking:
- GET /api/v1/appointments/slots (Request Query: { doctorId, date }. Response: { availableSlots: ["09:00", "09:30", "10:00"] })
- POST /api/v1/appointments (Request: { doctorId, date, slot, reason }. Response: { appointmentId, paymentIntentSecret, status: "pending_payment" })
- POST /api/v1/appointments/:id/cancel (Request: { id, reason }. Response: { status: "cancelled", refundStatus: "initiated|none" })

Video Consultations:
- POST /api/v1/consultations/:appointmentId/session (Request: { appointmentId }. Response: { roomName, token, apiAppId })
- POST /api/v1/consultations/:appointmentId/terminate (Request: { appointmentId, duration }. Response: { status: "completed" })

Medical Records & Prescriptions:
- GET /api/v1/records (Request Query: { patientId }. Response: { records: [{ id, doctorId, date, notes, diagnosis, attachments }] })
- POST /api/v1/records (Request: { patientId, diagnosis, notes, attachments }. Response: { recordId, status: "saved" })
- POST /api/v1/prescriptions (Request: { patientId, appointmentId, medications: [{ name, dosage, frequency, duration }] }. Response: { prescriptionId, downloadUrl })

Payments:
- POST /api/v1/payments/webhook (Request: Stripe raw webhook event body. Response: { received: true })
- GET /api/v1/payments/history (Request Query: { page }. Response: { transactions: [{ id, amount, date, status, description }] })

Patient Dashboard & Reviews:
- GET /api/v1/patients/:id/dashboard (Request: { id }. Response: { appointments: [...], records: [...], prescriptions: [...] })
- POST /api/v1/reviews (Request: { doctorId, appointmentId, rating, comment }. Response: { reviewId, status: "published" })

Admin Portal:
- PUT /api/v1/admin/doctors/:id/verify (Request: { status: "approved|rejected", rejectionReason: "" }. Response: { doctorId, verified: true|false })

## 5. Edge Cases
- Race Conditions in Booking: Two patients attempt to book the exact same time slot simultaneously. The system must implement database row-level locking (SELECT FOR UPDATE) on the slots table. The first transaction to acquire the lock completes, while the second receives a "Slot no longer available" error.
- Payment Webhook Failure: Patient completes Stripe payment successfully, but the network drops before Stripe can call the app's webhook to confirm booking. The client-side polling or Websocket fallback must check payment status directly via Stripe's API using the payment intent secret before displaying a timeout error, ensuring the booking isn't marked as cancelled.
- Mid-Call Disconnections: A network interruption occurs during a video call. The video client must support an automatic 3-minute reconnection window. If the call cannot be restored within 3 minutes and the doctor spent less than 5 minutes on the call, the appointment remains in a "disrupted" status for manual admin dispute resolution or automated partial refunds.
- Patient Revokes Doctor Medical Record Access: Patient revokes access rights to historical records while a consultation is scheduled. The doctor's access must instantly terminate via cache invalidation, preventing data exposure during the call, though the doctor remains authorized to write notes for the *current* session.
- Doctor No-Show: The doctor fails to join the video room within 15 minutes of the scheduled start time. The appointment is auto-flagged, the patient is notified, the authorization hold on their payment card is fully released, and a penalty is logged against the doctor's profile.
- License Expiry Mid-Consultation: A doctor's medical license expires during a scheduled block. The nightly validation script must auto-suspend profiles with expired licenses, cancel future appointments, notify scheduled patients, and initiate immediate payment releases.

## 6. KPIs (Success Metrics / Acceptance Criteria)
System Performance Metrics:
- Video connection latency must remain below 150ms for 95% of sessions, with a call drop rate of less than 1%.
- Core API endpoint response times (95th percentile) must be less than 200ms.
- High-availability database replication ensuring platform uptime of at least 99.9% annually.

Business & User Metrics:
- Consultation completion rate (completed consultations divided by booked appointments) must exceed 95%.
- Average time from license upload to admin verification decision must be less than 24 hours.
- Payment payout processing error rate must be 0%.

Acceptance Criteria:
- Patients cannot book any appointment slot without completing payment authorization.
- Only patients with a fully paid and completed consultation status can submit a review for that specific doctor.
- Medical records and prescription documents must be encrypted at rest (AES-256) and transit (TLS 1.3), with audit logs tracking every read/write action.
- Doctors cannot search for or view profiles/medical history of patients who have not scheduled an appointment with them or explicitly shared their files.

## 7. Limitations
- Out-of-Scope Emergency Care: The platform is strictly for non-emergency consultations. The user interface must prominently display a disclaimer stating "Not for medical emergencies. If you are experiencing an emergency, please dial 911 or visit the nearest hospital." and block any booking attempts matching critical triage keywords.
- Single Patient-Doctor Video Channels: The video consultation system only supports 1-on-1 audio/video connections. Multi-party calls (e.g., adding family members or secondary consulting doctors) are not supported in this release.
- Digital Prescription Limits: The system only outputs digital prescription documentation. It does not integrate with physical pharmacy APIs for direct medication delivery, order tracking, or inventory management.
- Geographical Jurisdiction Licensing: The platform does not automate cross-border medical compliance checks. Doctors are only allowed to consult patients located in jurisdictions where the doctor is registered and licensed; checking patient location compliance is the user's manual responsibility.
- No Offline Payment Option: Cash payments, insurance-direct billing, and post-consultation offline payments are not supported. All transactions must occur online through the designated payment gateway at the time of booking.
- Diagnostic Limitations: The platform provides no automated AI diagnostics or computer-aided prescriptions. All diagnoses and prescriptions must be entered and validated manually by the attending licensed doctor.
