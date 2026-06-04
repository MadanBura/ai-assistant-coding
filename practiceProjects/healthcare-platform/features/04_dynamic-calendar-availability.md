# Feature Specification: Dynamic Calendar Availability Builder

## Feature ID
`FEAT-103` (Epic: `EPC-001`)

## Purpose
Enable verified doctors to configure their clinical schedules, define recurring weekly office hours, schedule breaks, and block out personal/vacation days. These parameters dynamically populate the slot scheduler accessed by patients during booking.

## User Stories
* **US-103.1:** As a doctor, I want to define my standard weekly working hours (e.g., Mon-Fri 09:00-17:00), so that patients can see my available booking windows.
* **US-103.2:** As a doctor, I want to block off specific vacation dates or sudden personal leave, so that my scheduling calendar automatically closes bookings on those days.

## Functional Requirements
1. **Recurring Hours Template Editor:** Doctors can construct a weekly pattern. For each weekday (Monday-Sunday), they can define:
   * **Active status:** Enabled/Disabled.
   * **Time segments:** Multiple active ranges per day (e.g., Morning: 08:30-12:00, Afternoon: 13:00-17:00) to support lunch hours.
2. **Consultation Slot Duration Configurator:** Doctor sets default consultation length per appointment (e.g., 15 mins, 30 mins, 45 mins, 60 mins).
3. **One-Off Exclusions Calendar:** An interactive monthly view where doctors can click specific dates to mark as `unavailable` or input single-day changes to recurring templates.
4. **Schedule Generator Service:** A backend compiler that merges the doctor's weekly templates, one-off exclusions, and existing appointments to output a stream of free, selectable slots.

## Validation Rules
* **No Overlapping Templates:** Time segments on the weekly setup must not overlap (e.g., setting segment A as 08:00-12:00 and segment B as 11:30-15:00 is blocked).
* **Segment Duration vs. Slot Length:** Active segments must span at least the length of the default consultation slot duration.
* **Maximum Schedule Horizon:** Doctors can configure schedules up to a maximum of 90 days in advance.

## Edge Cases
* **Doctor adds calendar exclusion on day with existing bookings:** **Rule:** System alerts the doctor with list of affected appointments. The doctor must either manually reschedule them or confirm the block, triggering automated notifications and 100% refunds for cancelled slots.
* **Doctor alters default slot duration from 30 mins to 15 mins:** **Rule:** New settings only apply to future slots that have no bookings. Existing bookings maintain their original 30-minute block duration allocations.
* **Daylight Savings transitions:** Scheduling calculations must translate all doctor-configured timezone hours into UTC prior to database serialization, avoiding offsets during seasonal changes.

## Dependencies
* **Calendar Engine:** Luxon or date-fns libraries (timezone-safe utilities).
* **Database Cache:** Redis to store compiled slot results for active schedules.

## API Requirements

### `GET /api/v1/doctors/:id/availability/settings`
* **Security:** Authenticated (JWT) - Doctor owner or Admin
* **Response (200 OK):**
```json
{
  "doctor_id": "doc-robert-chen-77",
  "slot_duration_minutes": 30,
  "weekly_hours": [
    { "day_of_week": 1, "is_active": true, "intervals": [{ "start": "09:00", "end": "12:00" }, { "start": "13:00", "end": "17:00" }] },
    { "day_of_week": 2, "is_active": true, "intervals": [{ "start": "09:00", "end": "17:00" }] }
  ],
  "timezone": "America/New_York"
}
```

### `PUT /api/v1/doctors/:id/availability/settings`
* **Security:** Authenticated (JWT) - Doctor owner only
* **Payload:**
```json
{
  "slot_duration_minutes": 30,
  "weekly_hours": [
    { "day_of_week": 1, "is_active": true, "intervals": [{ "start": "09:00", "end": "12:00" }, { "start": "13:00", "end": "17:00" }] }
  ]
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Availability settings updated successfully."
}
```

### `POST /api/v1/doctors/:id/availability/exclusions`
* **Security:** Authenticated (JWT) - Doctor owner only
* **Payload:**
```json
{
  "exclusion_date": "2026-07-04",
  "all_day": true,
  "custom_intervals": [],
  "reason": "Independence Day Holiday"
}
```
* **Response (201 Created):**
```json
{
  "exclusion_id": "excl-9912",
  "exclusion_date": "2026-07-04",
  "status": "active"
}
```

## Database Impact
* **`doctors` Table:** Update `availability_settings` (JSONB field storing slot durations and weekly template configurations).
* **`doctor_exclusions` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `doctor_id` (VARCHAR(64), FK to `doctors.id`)
  * `exclusion_date` (DATE)
  * `all_day` (BOOLEAN)
  * `custom_intervals` (JSONB) - For partial-day exclusions
  * `reason` (VARCHAR(255))
  * `created_at` (TIMESTAMP)

## UI Components
* **Availability Planner Dashboard (`SCR-103A`):**
  * Weekly day grids with start/end slider controllers and "Add interval" action buttons.
  * Selector dropdown for default slot lengths (15, 30, 45, 60 minutes).
  * Interactive Month Calendar (using custom component/FullCalendar) supporting date selection to apply overrides and view exclusion lists.

## Security Requirements
* **Owner Authentication:** Ensure backend middleware validates that the authenticated doctor ID match the ID prefix in API endpoints.
* **Input Sanitization:** Avoid raw JSON ingestion directly into DB fields; parse and clean interval strings to match `HH:MM` formats.

## Acceptance Criteria
* **AC-103.1.1:** Verify that saving active weekly templates translates hours into the doctor's local timezone configurations and stores them as standard formats.
* **AC-103.1.2:** Validate that adding an overlapping daily interval generates a validation error.
* **AC-103.1.3:** Verify that exclusions block slots on the patient scheduling page.

## Definition of Done
* Calendar scheduler rules are implemented.
* Doctor schedule setting views conform to brand specifications.
* Exclusions API handlers and unit tests are complete.
* Timezone drift tests successfully run.
* End-to-end user booking flow verified manually.
