'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Doctor } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface BookAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor | null;
}

export function BookAppointmentModal({ isOpen, onClose, doctor }: BookAppointmentModalProps) {
    const { user, profile } = useAuth();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBook = async () => {
        if (!user || !doctor || !date || !time) return;
        setLoading(true);

        try {
            const appointmentDate = new Date(`${date}T${time}`);
            const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
            });

            const { error } = await supabase
                .from('appointments')
                .insert({
                    patient_id: user.id,
                    doctor_id: doctor.id,
                    appointment_date: appointmentDate.toISOString(),
                    reason: reason,
                    status: 'pending'
                });

            if (error) throw error;

            // Send email notifications via API
            const patientName = profile?.full_name || 'Patient';
            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'appointment_booked',
                    data: {
                        patientId: user.id,
                        doctorId: doctor.id,
                        patientName,
                        doctorName: doctor.full_name || 'Doctor',
                        specialty: doctor.specialization || 'General Medicine',
                        date: formattedDate,
                        time: formattedTime,
                        reason: reason || 'General Consultation'
                    }
                })
            }).catch(err => console.error('Email notification failed:', err));

            alert('Appointment booked successfully! You will receive a confirmation email shortly.');
            onClose();
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment.');
        } finally {
            setLoading(false);
        }
    };

    if (!doctor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(
                "sm:max-w-[425px] backdrop-blur-xl",
                "bg-white/95 dark:bg-[#1A2233]/95",
                "border border-white/50 dark:border-white/[0.05]"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-foreground">Book Appointment</DialogTitle>
                    <DialogDescription>
                        Schedule a visit with Dr. {doctor.full_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                className={cn(
                                    "pl-9",
                                    "bg-white/50 dark:bg-white/[0.03]",
                                    "border-slate-200 dark:border-white/[0.1]"
                                )}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="time"
                                className={cn(
                                    "pl-9",
                                    "bg-white/50 dark:bg-white/[0.03]",
                                    "border-slate-200 dark:border-white/[0.1]"
                                )}
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Reason for Visit</label>
                        <Textarea
                            placeholder="Briefly describe your symptoms or reason for visit..."
                            className={cn(
                                "bg-white/50 dark:bg-white/[0.03]",
                                "border-slate-200 dark:border-white/[0.1]"
                            )}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-500/10 p-2 rounded-lg">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span>You and the doctor will receive email notifications.</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleBook} disabled={loading} className="bg-medical-primary text-white hover:bg-medical-primary/90">
                        {loading ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
