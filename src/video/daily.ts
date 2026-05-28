/**
 * Daily.co server-side REST API client.
 *
 * Wraps https://api.daily.co/v1 with the Authorization header
 * set from process.env.DAILY_API_KEY.
 *
 * Does NOT use @daily-co/daily-js — plain fetch() only.
 */

const DAILY_API_BASE = "https://api.daily.co/v1";

function headers(): HeadersInit {
  const key = process.env.DAILY_API_KEY;
  if (!key) {
    throw new Error("[Daily] DAILY_API_KEY is not set in environment variables");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
}

// ── Types ────────────────────────────────────────────────────────────────

export interface DailyRoom {
  /** Full Daily room URL, e.g. https://your-domain.daily.co/healthassist-abc */
  url: string;
  /** Room name, e.g. healthassist-abc */
  name: string;
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Create a private Daily room.
 *
 * @param roomName      Desired room name (must be unique on your domain).
 * @param expirySeconds How long until the room expires (default 3600 = 1 h).
 * @returns             The room URL and room name.
 */
export async function createRoom(
  roomName: string,
  expirySeconds: number = 3600
): Promise<DailyRoom> {
  const exp = Math.round(Date.now() / 1000) + expirySeconds;

  const res = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: {
        exp,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Daily] Failed to create room: ${res.status} — ${body}`);
  }

  const data = await res.json();
  return { url: data.url as string, name: data.name as string };
}

/**
 * Delete a Daily room (cleanup after a consultation ends).
 *
 * @param roomName The room name to delete.
 */
export async function deleteRoom(roomName: string): Promise<void> {
  const res = await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Daily] Failed to delete room: ${res.status} — ${body}`);
  }
}
