import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deleteRoom } from "@/video/daily";

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
    const { roomName } = body as { roomName?: string };

    if (!roomName) {
      return NextResponse.json(
        { error: "roomName is required" },
        { status: 400 }
      );
    }

    // ── 3. Delete the Daily room ───────────────────────────────────────
    await deleteRoom(roomName);

    // ── 4. Mark as deleted in Supabase ─────────────────────────────────
    const { error: updateError } = await supabaseAdmin
      .from("video_sessions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("room_name", roomName);

    if (updateError) {
      console.error("[Video] Failed to update video session:", updateError);
      // Non-fatal — the room was still deleted on Daily's side
    }

    // ── 5. Respond ─────────────────────────────────────────────────────
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Video] Error deleting room:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
