# src/constants

Static domain data used by forms and onboarding flows. Pure data — no logic, no imports.

## Exports
- `doctorOnboarding.ts` — `SPECIALITY_CATEGORIES`, `MEDICAL_COUNCILS`, `MEDICAL_DEGREES`, `LANGUAGES`, `DAYS_OF_WEEK`, `ONBOARDING_STEPS`
- `medicalTests.ts` — `MEDICAL_TESTS` (test categories with parameters, units, and normal ranges)

## Depends on
- Nothing

## Rules
- Must **never** import from any other module.
- Only static arrays/objects belong here. If it requires a function call or runtime computation, it belongs elsewhere.
