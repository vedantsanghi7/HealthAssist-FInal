'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Calendar, Check, X, Clock, User } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Appointment } from '@/lib/types'; // Make sure this path is correct based on your previous edit
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AppointmentRequestsProps {
    onUpdate?: () => void;
}

export function AppointmentRequests({ onUpdate }: AppointmentRequestsProps) {
    const { user } = useAuth();
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

    const handleAction = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Appointment ${newStatus}`);
            // Refresh list
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
            <GlassCard className="h-full p-4 flex items-center justify-center bg-white/60">
                <p className="text-muted-foreground">Loading requests...</p>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="h-full flex flex-col overflow-hidden bg-white/60">
            <div className="p-4 border-b border-border/10 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
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
                        <div key={apt.id} className="bg-white/50 rounded-lg p-4 border border-border/50 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm">
                                            {apt.profiles?.full_name || 'Unknown Patient'}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {apt.profiles?.gender}, {apt.profiles?.age} years
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(apt.appointment_date), 'MMM d, h:mm a')}
                                    </div>
                                </div>
                            </div>

                            {apt.reason && (
                                <div className="text-sm bg-muted/30 p-2 rounded text-muted-foreground">
                                    <span className="font-medium text-foreground/80 mr-1">Reason:</span>
                                    {apt.reason}
                                </div>
                            )}

                            <div className="flex gap-2 pt-1">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8"
                                    onClick={() => handleAction(apt.id, 'confirmed')}
                                >
                                    <Check className="h-3 w-3 mr-1.5" /> Accept
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    onClick={() => handleAction(apt.id, 'cancelled')}
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
