# Contributing to HealthAssist

## Module Ownership

Before making a change, identify which module it belongs to. **Never scatter logic across modules.**

| If you need to… | Touch this module | Never touch |
|---|---|---|
| Add a utility function or TypeScript interface | `src/shared/` | Any business logic |
| Change login, signup, role checks, session management | `src/auth/` | AI, email, UI primitives |
| Add/modify a Supabase query or seed data | `src/data/` | UI rendering, components |
| Add a new AI action, change prompts, add a language | `src/ai/` | Auth, email, Supabase client init |
| Add a new email template or notification type | `src/email/` | Auth, AI, UI |
| Add medical test definitions or onboarding constants | `src/constants/` | Runtime logic |
| Build a new UI primitive (button, modal, card) | `src/components/ui/` | Business logic, data fetching |
| Build a patient feature (vitals chart, record view) | `src/components/patient/` | Doctor features, admin logic |
| Build a doctor feature (patient list, AI notes) | `src/components/doctor/` | Patient features, admin logic |
| Add a new page or API route | `src/app/` | Reusable logic (put that in a module) |

---

## The Dependency Rule

> **Lower-level modules must never import from higher-level modules.**

The dependency hierarchy (bottom = lowest level):

```
1. src/shared, src/constants     ← Leaf nodes — import from NOTHING in the app
2. src/data                      ← May import from (1)
3. src/auth                      ← May import from (1), (2)
4. src/ai                        ← May import from (1), (2)
5. src/email                     ← Standalone (imports from nothing in the app)
6. src/components/*              ← May import from (1)–(5)
7. src/app                       ← May import from anything
```

**Examples of violations:**
- ❌ `src/shared/types.ts` importing from `src/auth/AuthContext` 
- ❌ `src/data/supabase.ts` importing from `src/components/ui/button`
- ❌ `src/ai/sarvam.ts` importing from `src/auth/AuthContext`

**How to check:** If your import path points to a module with a higher number in the list above, you have a circular or upward dependency. Refactor by extracting the shared piece into a lower-level module.

---

## Adding a New Server Action

1. Create the action file in the appropriate module:
   - AI-related → `src/ai/actions/yourAction.ts`
   - Data/seed-related → `src/data/actions/yourAction.ts`
2. Mark it with `'use server'` at the top.
3. Re-export it from the barrel file `src/app/actions.ts`:
   ```ts
   export { yourAction } from '@/ai/actions/yourAction';
   ```
4. Import in your component from `@/app/actions`.

---

## Adding a New Email Template

1. Add your template function to `src/email/templates.ts`. It must be a **pure function** that takes data arguments and returns an HTML string.
2. Add a new `case` to the `switch` block in `src/app/api/send-email/route.ts`.
3. Call the API from your component with `fetch('/api/send-email', { method: 'POST', body: ... })`.

---

## Adding a New UI Component

1. If it's a **generic primitive** (reusable across features): add to `src/components/ui/`.
2. If it's a **patient feature**: add to `src/components/patient/`.
3. If it's a **doctor feature**: add to `src/components/doctor/`.
4. Use `cn()` from `@/shared/utils` for conditional Tailwind classes.
5. Never put Supabase queries or server action calls inside `src/components/ui/`.

---

## Build Check

After every change, verify the project compiles:

```bash
npm run build
```

Fix all TypeScript and build errors before committing. The build will catch:
- Broken import paths
- Type mismatches
- Missing exports
- Server/client boundary violations

---

## Git Conventions

### Commit Granularity
- **One commit per module change.** If you modify `src/auth` and `src/data` in the same task, make two commits.
- Prefix your commit message with the module name:

```
auth: add password reset flow
ai: add Bengali language support  
data: create appointment query helper
email: add cancellation notification template
ui: add DateRangePicker component
patient: add medication tracker widget
doctor: add bulk appointment approval
```

### Branch Naming

```
feature/<module>-<short-description>
fix/<module>-<short-description>
refactor/<module>-<short-description>
```

Examples: `feature/ai-voice-input`, `fix/auth-session-refresh`, `refactor/data-query-helpers`

---

## Environment Variables

Required in `.env.local` (see `.env.example`):

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `src/data` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/data` |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/data` (server-side only) |
| `SARVAM_API_KEY` | `src/ai` |
| `GMAIL` | `src/email` |
| `GMAIL_APP_PASSWORD` | `src/email` |
| `NEXT_PUBLIC_APP_URL` | `src/app/api` |
