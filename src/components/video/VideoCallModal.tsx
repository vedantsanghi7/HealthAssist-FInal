"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import DailyIframe from "@daily-co/daily-js";
import { useAuth } from "@/context/AuthContext";

interface VideoCallModalProps {
  appointmentId: string;
  role: "doctor" | "patient";
  isOpen: boolean;
  onClose: () => void;
}

export function VideoCallModal({ appointmentId, role, isOpen, onClose }: VideoCallModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const callContainerRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<any>(null);
  const roomNameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen || !appointmentId) return;

    let mounted = true;

    const startCall = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = session?.access_token;
        if (!token) throw new Error("Authentication required");

        const res = await fetch("/api/video/create-room", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ appointmentId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create room");

        const { roomUrl, doctorToken, patientToken } = data;
        const meetingToken = role === "doctor" ? doctorToken : patientToken;

        roomNameRef.current = `healthassist-${appointmentId}`;

        if (!mounted) return;

        if (callContainerRef.current) {
          const callFrame = DailyIframe.createFrame(callContainerRef.current, {
            iframeStyle: {
              width: "100%",
              height: "100%",
              border: "0",
              borderRadius: "12px",
              backgroundColor: "#f1f5f9"
            },
            showLeaveButton: true,
          });

          callFrameRef.current = callFrame;

          callFrame.on("left-meeting", () => {
             onClose();
          });

          await callFrame.join({
            url: roomUrl,
            token: meetingToken,
          });
          
          if (mounted) setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "An error occurred");
          setLoading(false);
        }
      }
    };

    startCall();

    return () => {
      mounted = false;
    };
  }, [isOpen, appointmentId, role, session]);

  const handleClose = async () => {
    if (callFrameRef.current) {
      callFrameRef.current.destroy();
      callFrameRef.current = null;
    }

    if (roomNameRef.current && session?.access_token) {
      try {
        await fetch("/api/video/delete-room", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ roomName: roomNameRef.current }),
        });
      } catch (e) {
        console.error("Failed to delete room:", e);
      }
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-2xl">
        <DialogHeader className="p-4 border-b bg-white dark:bg-slate-900 z-10 shrink-0">
          <DialogTitle>Video Consultation</DialogTitle>
          <DialogDescription className="sr-only">Video call interface</DialogDescription>
        </DialogHeader>
        <div className="flex-1 relative w-full h-full bg-slate-50 dark:bg-slate-900">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Connecting to secure room...</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="text-red-500 mb-2 font-medium">Failed to connect</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
            </div>
          )}
          <div ref={callContainerRef} className="w-full h-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
