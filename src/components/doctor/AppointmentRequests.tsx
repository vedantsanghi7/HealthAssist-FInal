'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Calendar, Check, X, Clock, User } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Appointment } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AppointmentRequestsProps {
    onUpdate?: () => void;
}

export function AppointmentRequests({ onUpdate }: AppointmentRequestsProps) {
    const { user, profile } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    profiles:patient_id (
                        full_name,
                        age,
                        gender
                    )
                `)
                .eq('doctor_id', user.id)
                .eq('status', 'pending')
                .order('appointment_date', { ascending: true });

            if (error) throw error;
            setAppointments(data || []);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            toast.error('Failed to load appointment requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const handleAction = async (apt: Appointment, newStatus: 'confirmed' | 'cancelled') => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', apt.id);

            if (error) throw error;

            const appointmentDate = new Date(apt.appointment_date);
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

            // Send email notification via API
            if (newStatus === 'confirmed') {
                fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'appointment_confirmed',
                        data: {
                            patientId: apt.patient_id,
                            patientName: apt.profiles?.full_name || 'Patient',
                            doctorName: profile?.full_name || 'Doctor',
                            specialty: profile?.specialization || 'General Medicine',
                            date: formattedDate,
                            time: formattedTime
                        }
                    })
                }).catch(err => console.error('Email notification failed:', err));

                toast.success('Appointment confirmed! Patient has been notified via email.');
            } else {
                fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'appointment_declined',
                        data: {
                            patientId: apt.patient_id,
                            patientName: apt.profiles?.full_name || 'Patient',
                            doctorName: profile?.full_name || 'Doctor',
                            date: formattedDate
                        }
                    })
                }).catch(err => console.error('Email notification failed:', err));

                toast.success('Appointment declined. Patient has been notified via email.');
            }

            fetchAppointments();
            if (newStatus === 'confirmed' && onUpdate) {
                onUpdate();
            }
        } catch (err) {
            console.error('Error updating appointment:', err);
            toast.error('Failed to update appointment');
        }
    };

    if (loading) {
        return (
            <GlassCard className={cn(
                "h-full p-4 flex items-center justify-center",
                "bg-white/60 dark:bg-white/[0.02]"
            )}>
                <p className="text-muted-foreground">Loading requests...</p>
            </GlassCard>
        );
    }

    return (
        <GlassCard className={cn(
            "h-full flex flex-col overflow-hidden",
            "bg-white/60 dark:bg-white/[0.02]"
        )}>
            <div className="p-4 border-b border-border/10 dark:border-white/[0.05] flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    Appointment Requests
                </h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {appointments.length} Pending
                </span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
                {appointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No pending appointment requests.</p>
                    </div>
                ) : (
                    appointments.map((apt) => (
                        <div key={apt.id} className={cn(
                            "rounded-lg p-4 border space-y-3",
                            "bg-white/50 dark:bg-white/[0.02] border-border/50 dark:border-white/[0.05]"
                        )}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-foreground">
                                            {apt.profiles?.full_name || 'Unknown Patient'}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {apt.profiles?.gender}, {apt.profiles?.age} years
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/5 dark:bg-primary/10 px-2 py-1 rounded">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(apt.appointment_date), 'MMM d, h:mm a')}
                                    </div>
                                </div>
                            </div>

                            {apt.reason && (
                                <div className={cn(
                                    "text-sm p-2 rounded",
                                    "bg-muted/30 dark:bg-white/[0.02] text-muted-foreground"
                                )}>
                                    <span className="font-medium text-foreground/80 mr-1">Reason:</span>
                                    {apt.reason}
                                </div>
                            )}

                            <div className="flex gap-2 pt-1">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8"
                                    onClick={() => handleAction(apt, 'confirmed')}
                                >
                                    <Check className="h-3 w-3 mr-1.5" /> Accept
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className={cn(
                                        "flex-1 h-8",
                                        "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200",
                                        "dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 dark:border-red-500/30"
                                    )}
                                    onClick={() => handleAction(apt, 'cancelled')}
                                >
                                    <X className="h-3 w-3 mr-1.5" /> Decline
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </GlassCard>
    );
}
