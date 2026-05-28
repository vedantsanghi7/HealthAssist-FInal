/**
 * Daily.co meeting-token generation.
 *
 * Creates scoped meeting tokens via the Daily REST API.
 * Tokens always include room_name and exp per Daily's security recommendations.
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

/**
 * Create a meeting token for a specific room.
 *
 * @param roomName      The Daily room name to scope this token to.
 * @param isOwner       Whether this token grants owner privileges (e.g. for the doctor).
 * @param userName      Display name shown in the video call.
 * @param expirySeconds How long until the token expires (default 3600 = 1 h).
 * @returns             The meeting token string.
 */
export async function createMeetingToken(
  roomName: string,
  isOwner: boolean,
  userName: string,
  expirySeconds: number = 3600
): Promise<string> {
  const exp = Math.round(Date.now() / 1000) + expirySeconds;

  const res = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: isOwner,
        user_name: userName,
        exp,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `[Daily] Failed to create meeting token: ${res.status} — ${body}`
    );
  }

  const data = await res.json();
  return data.token as string;
}
