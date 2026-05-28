import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createRoom } from "@/video/daily";
import { createMeetingToken } from "@/video/tokens";

// Server-side Supabase client (service role — bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // ── 1. Authenticate ────────────────────────────────────────────────
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // ── 2. Parse body ──────────────────────────────────────────────────
    const body = await request.json();
    const { appointmentId } = body as { appointmentId?: string };

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 }
      );
    }

    // ── 3. Get user profile for display name ───────────────────────────
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name ?? user.email ?? "User";

    // ── 4. Create Daily room ───────────────────────────────────────────
    const roomName = `healthassist-${appointmentId}`;
    const room = await createRoom(roomName);

    // ── 5. Generate meeting tokens ─────────────────────────────────────
    const [doctorToken, patientToken] = await Promise.all([
      createMeetingToken(roomName, true, userName),
      createMeetingToken(roomName, false, userName),
    ]);

    // ── 6. Persist to Supabase ─────────────────────────────────────────
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    const { error: insertError } = await supabaseAdmin
      .from("video_sessions")
      .insert({
        appointment_id: appointmentId,
        room_name: roomName,
        room_url: room.url,
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("[Video] Failed to save video session:", insertError);
      // Non-fatal — the room was still created, so we return the data
    }

    // ── 7. Respond ─────────────────────────────────────────────────────
    return NextResponse.json({
      roomUrl: room.url,
      doctorToken,
      patientToken,
    });
  } catch (error) {
    console.error("[Video] Error creating room:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
