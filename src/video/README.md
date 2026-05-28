# src/video

Server-side video-calling infrastructure using the [Daily.co REST API](https://docs.daily.co/reference/rest-api).

## What this module owns

- Creating and deleting private Daily video rooms.
- Generating scoped meeting tokens (owner / participant) for secure room access.
- API routes for the frontend to request rooms and tokens.

## Exports

| File | Function | Description |
|------|----------|-------------|
| `daily.ts` | `createRoom(roomName, expirySeconds?)` | Creates a private Daily room; returns `{ url, name }`. |
| `daily.ts` | `deleteRoom(roomName)` | Deletes a Daily room by name. |
| `tokens.ts` | `createMeetingToken(roomName, isOwner, userName, expirySeconds?)` | Creates a scoped meeting token string. |

## API Routes

| Route | Method | Body | Description |
|-------|--------|------|-------------|
| `/api/video/create-room` | POST | `{ appointmentId }` | Creates room, generates doctor + patient tokens, persists to `video_sessions`. |
| `/api/video/delete-room` | POST | `{ roomName }` | Deletes the room and marks the session as deleted. |

## Depends on

- `src/data/supabaseAdmin.ts` pattern (inline `createClient` with service role key) — for auth verification and `video_sessions` persistence.
- **Daily REST API** (`https://api.daily.co/v1`) — room and token management. Requires `DAILY_API_KEY` env var.

## Rules

- Does **not** use `@daily-co/daily-js` — all calls are plain `fetch()`.
- Must **never** be imported in client components (contains server-only secrets).
- Does **not** modify any existing module or UI component.
