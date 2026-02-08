'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Activity, MessageSquare, CheckCircle2, FileText, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase/supabaseClient';

export interface Notification {
    id: string;
    title: string;
    description: string;
    type: 'appointment' | 'vital' | 'system' | 'message' | 'reminder' | 'record' | 'patient';
    timestamp: Date;
    isRead: boolean;
    link?: string;
}

const iconMap = {
    appointment: Calendar,
    vital: Activity,
    system: CheckCircle2,
    message: MessageSquare,
    reminder: Bell,
    record: FileText,
    patient: UserPlus,
};

const colorMap = {
    appointment: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    vital: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
    system: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400',
    message: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
    reminder: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
    record: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
    patient: 'bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400',
};

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
    userRole?: 'patient' | 'doctor';
}

export function NotificationDropdown({ isOpen, onClose, userId, userRole }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

    const fetchNotifications = useCallback(async () => {
        if (!userId || !userRole) return;
        setLoading(true);

        try {
            const notifs: Notification[] = [];

            if (userRole === 'patient') {
                // Fetch upcoming appointments for patients
                const { data: appointments } = await supabase
                    .from('appointments')
                    .select(`
                        id, appointment_date, status, reason, created_at,
                        doctor:doctor_id(full_name, specialization)
                    `)
                    .eq('patient_id', userId)
                    .gte('appointment_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                    .order('appointment_date', { ascending: true })
                    .limit(5);

                if (appointments) {
                    appointments.forEach((apt: any) => {
                        const aptDate = new Date(apt.appointment_date);
                        const isUpcoming = aptDate > new Date();
                        const isToday = aptDate.toDateString() === new Date().toDateString();

                        let title = '';
                        let description = '';

                        if (apt.status === 'pending') {
                            title = 'Appointment Pending';
                            description = `Your appointment with Dr. ${apt.doctor?.full_name || 'Doctor'} is awaiting confirmation.`;
                        } else if (apt.status === 'confirmed' && isUpcoming) {
                            title = isToday ? 'Appointment Today!' : 'Upcoming Appointment';
                            description = `${isToday ? 'Today' : aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${aptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} with Dr. ${apt.doctor?.full_name || 'Doctor'}`;
                        } else if (apt.status === 'confirmed') {
                            title = 'Appointment Confirmed';
                            description = `Your appointment with Dr. ${apt.doctor?.full_name || 'Doctor'} has been confirmed.`;
                        }

                        if (title) {
                            notifs.push({
                                id: `apt-${apt.id}`,
                                title,
                                description,
                                type: 'appointment',
                                timestamp: new Date(apt.created_at),
                                isRead: false,
                            });
                        }
                    });
                }

                // Fetch recent medical records
                const { data: records } = await supabase
                    .from('medical_records')
                    .select('id, record_type, test_name, created_at, uploaded_by')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (records) {
                    records.forEach((record: any) => {
                        const createdAt = new Date(record.created_at);
                        const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

                        // Only show notifications for records created in the last 7 days
                        if (daysSinceCreation <= 7) {
                            notifs.push({
                                id: `record-${record.id}`,
                                title: 'New Medical Record',
                                description: `${record.test_name || record.record_type || 'New record'} has been added to your profile${record.uploaded_by === 'doctor' ? ' by your doctor' : ''}.`,
                                type: 'record',
                                timestamp: createdAt,
                                isRead: false,
                            });
                        }
                    });
                }

                // Fetch recent messages from doctors
                const { data: conversations } = await supabase
                    .from('conversations')
                    .select('id')
                    .eq('patient_id', userId);

                if (conversations && conversations.length > 0) {
                    const convIds = conversations.map(c => c.id);
                    const { data: messages } = await supabase
                        .from('messages')
                        .select(`
                            id, content, created_at, sender_id,
                            sender:sender_id(full_name, role)
                        `)
                        .in('conversation_id', convIds)
                        .neq('sender_id', userId)
                        .order('created_at', { ascending: false })
                        .limit(3);

                    if (messages) {
                        messages.forEach((msg: any) => {
                            const createdAt = new Date(msg.created_at);
                            const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

                            if (daysSinceCreation <= 3) {
                                notifs.push({
                                    id: `msg-${msg.id}`,
                                    title: 'New Message',
                                    description: `Dr. ${msg.sender?.full_name || 'Your doctor'}: "${msg.content?.substring(0, 50)}${msg.content?.length > 50 ? '...' : ''}"`,
                                    type: 'message',
                                    timestamp: createdAt,
                                    isRead: false,
                                });
                            }
                        });
                    }
                }

            } else if (userRole === 'doctor') {
                // Fetch pending appointment requests for doctors
                const { data: pendingAppointments } = await supabase
                    .from('appointments')
                    .select(`
                        id, appointment_date, status, reason, created_at,
                        patient:patient_id(full_name, age, gender)
                    `)
                    .eq('doctor_id', userId)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (pendingAppointments) {
                    pendingAppointments.forEach((apt: any) => {
                        notifs.push({
                            id: `apt-req-${apt.id}`,
                            title: 'New Appointment Request',
                            description: `${apt.patient?.full_name || 'A patient'} requested an appointment for ${new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                            type: 'appointment',
                            timestamp: new Date(apt.created_at),
                            isRead: false,
                        });
                    });
                }

                // Fetch today's confirmed appointments
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const { data: todayAppointments } = await supabase
                    .from('appointments')
                    .select(`
                        id, appointment_date, status,
                        patient:patient_id(full_name)
                    `)
                    .eq('doctor_id', userId)
                    .eq('status', 'confirmed')
                    .gte('appointment_date', today.toISOString())
                    .lt('appointment_date', tomorrow.toISOString())
                    .order('appointment_date', { ascending: true })
                    .limit(3);

                if (todayAppointments && todayAppointments.length > 0) {
                    todayAppointments.forEach((apt: any) => {
                        const aptTime = new Date(apt.appointment_date);
                        notifs.push({
                            id: `today-apt-${apt.id}`,
                            title: 'Appointment Today',
                            description: `${apt.patient?.full_name || 'Patient'} at ${aptTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
                            type: 'reminder',
                            timestamp: aptTime,
                            isRead: false,
                        });
                    });
                }

                // Fetch new patients (first-time appointments)
                const { data: recentPatients } = await supabase
                    .from('appointments')
                    .select(`
                        id, created_at,
                        patient:patient_id(id, full_name)
                    `)
                    .eq('doctor_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (recentPatients) {
                    // Find unique patients who had their first appointment recently
                    const patientFirstAppointments = new Map<string, any>();
                    recentPatients.forEach((apt: any) => {
                        if (apt.patient && !patientFirstAppointments.has(apt.patient.id)) {
                            patientFirstAppointments.set(apt.patient.id, apt);
                        }
                    });

                    // Add notification for new patients in last 7 days
                    patientFirstAppointments.forEach((apt) => {
                        const createdAt = new Date(apt.created_at);
                        const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

                        if (daysSinceCreation <= 7) {
                            // Check if this is actually their first appointment
                            notifs.push({
                                id: `new-patient-${apt.patient.id}`,
                                title: 'New Patient',
                                description: `${apt.patient.full_name} has booked their first appointment with you.`,
                                type: 'patient',
                                timestamp: createdAt,
                                isRead: false,
                            });
                        }
                    });
                }

                // Fetch recent messages from patients
                const { data: doctorConversations } = await supabase
                    .from('conversations')
                    .select('id')
                    .eq('doctor_id', userId);

                if (doctorConversations && doctorConversations.length > 0) {
                    const convIds = doctorConversations.map(c => c.id);
                    const { data: messages } = await supabase
                        .from('messages')
                        .select(`
                            id, content, created_at, sender_id,
                            sender:sender_id(full_name, role)
                        `)
                        .in('conversation_id', convIds)
                        .neq('sender_id', userId)
                        .order('created_at', { ascending: false })
                        .limit(3);

                    if (messages) {
                        messages.forEach((msg: any) => {
                            const createdAt = new Date(msg.created_at);
                            const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

                            if (daysSinceCreation <= 3) {
                                notifs.push({
                                    id: `msg-${msg.id}`,
                                    title: 'New Message',
                                    description: `${msg.sender?.full_name || 'Patient'}: "${msg.content?.substring(0, 50)}${msg.content?.length > 50 ? '...' : ''}"`,
                                    type: 'message',
                                    timestamp: createdAt,
                                    isRead: false,
                                });
                            }
                        });
                    }
                }
            }

            // Sort by timestamp (most recent first) and limit
            notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            // Apply read status from local storage
            const storedRead = localStorage.getItem(`notifications_read_${userId}`);
            if (storedRead) {
                const readIds = new Set(JSON.parse(storedRead));
                setReadNotifications(readIds as Set<string>);
                notifs.forEach(n => {
                    if (readIds.has(n.id)) {
                        n.isRead = true;
                    }
                });
            }

            setNotifications(notifs.slice(0, 10));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, userRole]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleMarkAllAsRead = () => {
        const allIds = new Set(notifications.map(n => n.id));
        setReadNotifications(allIds);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        if (userId) {
            localStorage.setItem(`notifications_read_${userId}`, JSON.stringify([...allIds]));
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        const newReadSet = new Set(readNotifications);
        newReadSet.add(notification.id);
        setReadNotifications(newReadSet);
        if (userId) {
            localStorage.setItem(`notifications_read_${userId}`, JSON.stringify([...newReadSet]));
        }

        onClose();

        // Navigate based on notification type
        const isDoctor = userRole === 'doctor';
        switch (notification.type) {
            case 'appointment':
                window.location.href = isDoctor ? '/dashboard/doctor' : '/dashboard/patient/appointments';
                break;
            case 'vital':
            case 'record':
                window.location.href = '/dashboard/patient/records';
                break;
            case 'system':
                window.location.href = isDoctor ? '/dashboard/doctor' : '/dashboard/patient';
                break;
            case 'message':
                window.location.href = isDoctor ? '/dashboard/doctor/messages' : '/dashboard/patient/messages';
                break;
            case 'reminder':
                window.location.href = isDoctor ? '/dashboard/doctor' : '/dashboard/patient/timeline';
                break;
            case 'patient':
                window.location.href = '/dashboard/doctor/patients';
                break;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={cn(
                            "absolute right-0 top-14 z-50 w-80 sm:w-96 overflow-hidden rounded-xl border shadow-xl backdrop-blur-lg",
                            "bg-white/90 dark:bg-[#1A2233]/95 border-border/40 dark:border-white/[0.05]"
                        )}
                    >
                        <div className="flex items-center justify-between border-b border-border/10 dark:border-white/[0.05] p-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    className="text-xs text-medical-primary hover:underline"
                                    onClick={handleMarkAllAsRead}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 text-muted-foreground animate-spin mb-2" />
                                    <p className="text-sm text-muted-foreground">Loading notifications...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                <div className="divide-y divide-border/10 dark:divide-white/[0.05]">
                                    {notifications.map((notification) => {
                                        const Icon = iconMap[notification.type] || Bell;
                                        const isRead = readNotifications.has(notification.id) || notification.isRead;
                                        return (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    "flex gap-4 p-4 transition-colors cursor-pointer",
                                                    "hover:bg-slate-50 dark:hover:bg-white/[0.02]",
                                                    !isRead && "bg-medical-primary/5 dark:bg-medical-primary/10"
                                                )}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className={cn("h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center", colorMap[notification.type] || colorMap.system)}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className={cn("text-sm font-medium", !isRead ? "text-foreground" : "text-muted-foreground")}>
                                                            {notification.title}
                                                        </p>
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {notification.description}
                                                    </p>
                                                </div>
                                                {!isRead && (
                                                    <div className="h-2 w-2 mt-1.5 rounded-full bg-medical-primary flex-shrink-0" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <Bell className="mx-auto h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                                    <p className="text-sm text-muted-foreground">No new notifications</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                        {userRole === 'doctor'
                                            ? "Appointment requests and messages will appear here"
                                            : "Appointments, records, and messages will appear here"
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-border/10 dark:border-white/[0.05] p-3 text-center">
                            <button
                                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    onClose();
                                    window.location.href = userRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';
                                }}
                            >
                                View all activity
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Export helper to get unread count (for badge)
export async function getUnreadNotificationCount(userId: string, userRole: 'patient' | 'doctor'): Promise<number> {
    let count = 0;

    try {
        if (userRole === 'patient') {
            // Count pending appointments
            const { count: pendingCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('patient_id', userId)
                .eq('status', 'pending');

            count += pendingCount || 0;
        } else {
            // Count pending appointment requests
            const { count: requestCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('doctor_id', userId)
                .eq('status', 'pending');

            count += requestCount || 0;
        }
    } catch (error) {
        console.error('Error getting notification count:', error);
    }

    return count;
}
