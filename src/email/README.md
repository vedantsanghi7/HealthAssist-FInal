# src/email

Email notification module. Owns the Nodemailer transport and all HTML email templates.

## Exports
- `sendEmailAction()` — Server action that sends email via Gmail SMTP (in `transport.ts`)
- Template functions (in `templates.ts`):
  - `getAppointmentBookedEmailTemplate()`
  - `getAppointmentConfirmedEmailTemplate()`
  - `getAppointmentDeclinedEmailTemplate()`
  - `getNewAppointmentRequestEmailTemplate()`
  - `getNewMessageEmailTemplate()`
  - `getNewMedicalRecordEmailTemplate()`

## Depends on
- External libs only: `nodemailer`

## Rules
- Must **never** import from any other `src/` module.
- Templates are pure functions (data in → HTML string out). No database calls, no React, no auth checks.
- API routes in `src/app/api/` consume these templates — the email module itself never sends unsolicited email.
