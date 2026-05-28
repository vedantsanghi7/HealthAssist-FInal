# src/ai

Sarvam AI integration module. Handles all AI chat completions, multilingual translation, and health score generation.

## Exports
- `analyzeMedicalText()` — Core Sarvam AI client function (in `sarvam.ts`)
- `getMedicalRecordsContext()` — Fetches and formats patient records for AI prompts (in `context.ts`)
- `languageCodeMap` — Mapping of 23 language names to Sarvam API codes (in `constants.ts`)
- Server actions: `analyzeMedicalTextAction`, `translateTextAction`, `generateHealthScoreAction` (in `actions/`)

## Depends on
- `src/data` (for `supabaseAdmin` — fetching medical records server-side)
- Sarvam AI SDK (`sarvamai`)

## Rules
- Must **never** import from `src/auth`, `src/email`, `src/components`, or `src/app`.
- All server actions are re-exported through `src/app/actions.ts` — components should import from there.
