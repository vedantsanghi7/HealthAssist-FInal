# src/shared

Foundation layer for the entire application. Contains generic utilities and TypeScript interfaces used across all modules.

## Exports
- `cn()` — Tailwind class-merge helper (combines `clsx` + `tailwind-merge`)
- All shared interfaces: `Doctor`, `Patient`, `UserProfile`, `MedicalRecord`, `Appointment`, `DoctorProfile`, `AvailabilitySlot`

## Depends on
- External libs only: `clsx`, `tailwind-merge`

## Rules
- Must **never** import from any other `src/` module.
- Only pure utilities and type definitions belong here — no React components, no API calls, no business logic.
