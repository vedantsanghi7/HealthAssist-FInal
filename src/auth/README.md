# src/auth

Authentication and authorization module. Manages user sessions, role-based access control, and route protection.

## Exports
- `AuthProvider` — React context provider (wraps the app in root layout)
- `useAuth()` — hook returning `user`, `session`, `role`, `profile`, `signOut`, etc.
- `AuthGuard` — component that redirects unauthenticated/unauthorized users
- `useRole()` — convenience hook for `isPatient`, `isDoctor`, `isAdmin` checks
- `UserRole` type

## Depends on
- `src/shared` (for `UserProfile` type)
- `src/data` (for Supabase browser client)

## Rules
- Must **never** import from `src/ai`, `src/email`, `src/components`, or `src/app`.
- All auth-related state lives here — components consume it via hooks, never by querying Supabase directly for auth state.
