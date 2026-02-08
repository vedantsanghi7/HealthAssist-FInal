'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Calendar,
    CheckCircle2,
    AlertCircle,
    Clock,
    Heart,
    Stethoscope,
    Pill,
    Activity,
    FileText,
    Sparkles,
    TrendingUp
} from 'lucide-react';

interface TimelineEvent {
    id: string;
    title: string;
    date: string;
    status: 'completed' | 'upcoming' | 'attention';
    doctor?: string;
    type: string;
}

interface MedicalTimelineProps {
    events?: TimelineEvent[];
}

// Mock data if none provided
const defaultEvents: TimelineEvent[] = [
    { id: '1', title: 'Annual Cardiac Checkup', date: 'Today, 2:00 PM', status: 'upcoming', doctor: 'Dr. Sarah Smith', type: 'Appointment' },
    { id: '2', title: 'Blood Work Results', date: 'Yesterday', status: 'attention', type: 'Lab Result' },
    { id: '3', title: 'Prescription Renewal', date: 'Oct 24, 2024', status: 'completed', doctor: 'Dr. James Wilson', type: 'Medication' },
    { id: '4', title: 'Cardiology Consultation', date: 'Oct 10, 2024', status: 'completed', doctor: 'Dr. Sarah Smith', type: 'Visit' },
];

export function MedicalTimeline({ events = defaultEvents }: MedicalTimelineProps) {
    const getStatusConfig = (status: TimelineEvent['status']) => {
        switch (status) {
            case 'completed': return {
                bg: 'from-emerald-500 to-teal-500',
                shadow: 'shadow-emerald-500/30',
                ring: 'ring-emerald-100',
                badge: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200',
                glow: 'bg-emerald-400/20'
            };
            case 'upcoming': return {
                bg: 'from-blue-500 to-indigo-500',
                shadow: 'shadow-blue-500/30',
                ring: 'ring-blue-100',
                badge: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-indigo-200',
                glow: 'bg-blue-400/20'
            };
            case 'attention': return {
                bg: 'from-amber-500 to-orange-500',
                shadow: 'shadow-amber-500/30',
                ring: 'ring-amber-100',
                badge: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200',
                glow: 'bg-amber-400/20'
            };
            default: return {
                bg: 'from-slate-500 to-slate-600',
                shadow: 'shadow-slate-500/30',
                ring: 'ring-slate-100',
                badge: 'bg-slate-50 text-slate-700 border-slate-200',
                glow: 'bg-slate-400/20'
            };
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'appointment':
            case 'visit':
                return <Stethoscope className="h-4 w-4" />;
            case 'lab result':
                return <Activity className="h-4 w-4" />;
            case 'medication':
                return <Pill className="h-4 w-4" />;
            case 'medical record':
                return <FileText className="h-4 w-4" />;
            default:
                return <Heart className="h-4 w-4" />;
        }
    };

    const getStatusIcon = (status: TimelineEvent['status']) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-3 w-3 text-white" />;
            case 'upcoming': return <Clock className="h-3 w-3 text-white" />;
            case 'attention': return <AlertCircle className="h-3 w-3 text-white" />;
        }
    };

    if (!events || events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                        <Calendar className="h-10 w-10 text-blue-400" />
                    </div>
                    <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Sparkles className="h-6 w-6 text-amber-400" />
                    </motion.div>
                </motion.div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Your Journey Begins Here</h3>
                <p className="text-sm text-slate-500 max-w-xs">
                    Book appointments and add medical records to start tracking your health journey.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Animated Progress Path */}
            <div className="absolute left-8 top-0 bottom-0 w-1 overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-200/50 via-purple-200/50 to-emerald-200/50" />
                <motion.div
                    className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-500/40 via-indigo-500/40 to-transparent"
                    animate={{ y: ['-100%', '500%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                />
            </div>

            {/* Timeline Events */}
            <div className="space-y-6">
                {events.map((event, index) => {
                    const config = getStatusConfig(event.status);

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.12, type: 'spring', stiffness: 100 }}
                            className="relative pl-16 group"
                        >
                            {/* Glowing Node */}
                            <div className="absolute left-5 top-4">
                                {/* Outer Glow */}
                                <motion.div
                                    className={cn("absolute -inset-2 rounded-full blur-md", config.glow)}
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                                />
                                {/* Main Node */}
                                <div className={cn(
                                    "relative h-6 w-6 rounded-full bg-gradient-to-br flex items-center justify-center",
                                    "shadow-lg ring-4 ring-white/80 transition-transform duration-300 group-hover:scale-110",
                                    config.bg, config.shadow
                                )}>
                                    {getStatusIcon(event.status)}
                                </div>
                            </div>

                            {/* Event Card */}
                            <motion.div
                                className={cn(
                                    "relative overflow-hidden rounded-2xl transition-all duration-300",
                                    "bg-white/60 backdrop-blur-lg border border-white/50",
                                    "shadow-md hover:shadow-xl hover:bg-white/80",
                                    "group-hover:-translate-y-1"
                                )}
                                whileHover={{ scale: 1.01 }}
                            >
                                {/* Card Gradient Accent */}
                                <div className={cn(
                                    "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                                    config.bg
                                )} />

                                <div className="p-4">
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {/* Type Icon */}
                                            <div className={cn(
                                                "p-2 rounded-xl bg-gradient-to-br",
                                                config.bg,
                                                "text-white shadow-md"
                                            )}>
                                                {getTypeIcon(event.type)}
                                            </div>
                                            <div>
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                                    config.badge
                                                )}>
                                                    {event.status}
                                                </span>
                                                <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wide">{event.type}</p>
                                            </div>
                                        </div>

                                        {/* Date Badge */}
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full">
                                            <Calendar className="h-3 w-3 text-slate-400" />
                                            <span className="text-xs font-medium text-slate-600">{event.date}</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-base font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {event.title}
                                    </h4>

                                    {/* Doctor Info */}
                                    {event.doctor && (
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                                <Stethoscope className="h-3 w-3 text-indigo-500" />
                                            </div>
                                            <span className="text-sm text-slate-600 font-medium">{event.doctor}</span>
                                        </div>
                                    )}

                                    {/* Action hint for upcoming */}
                                    {event.status === 'upcoming' && (
                                        <motion.div
                                            className="mt-3 flex items-center gap-2 text-xs text-blue-600"
                                            animate={{ x: [0, 3, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        >
                                            <TrendingUp className="h-3 w-3" />
                                            <span className="font-medium">Coming up soon!</span>
                                        </motion.div>
                                    )}

                                    {/* Attention indicator */}
                                    {event.status === 'attention' && (
                                        <motion.div
                                            className="mt-3 flex items-center gap-2 text-xs text-amber-600"
                                            animate={{ opacity: [1, 0.6, 1] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        >
                                            <AlertCircle className="h-3 w-3" />
                                            <span className="font-medium">Requires your attention</span>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Journey Stats Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-4 border-t border-dashed border-slate-200"
            >
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                            <span className="text-slate-500">{events.filter(e => e.status === 'completed').length} Completed</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                            <span className="text-slate-500">{events.filter(e => e.status === 'upcoming').length} Upcoming</span>
                        </div>
                    </div>
                    <motion.div
                        className="text-xs text-slate-400 flex items-center gap-1"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Activity className="h-3 w-3" />
                        Live updates
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
