'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PatientList } from '@/components/doctor/PatientList';
import { PatientSummary } from '@/components/doctor/PatientSummary';
import { AppointmentRequests } from '@/components/doctor/AppointmentRequests';
import {
    Users,
    Calendar,
    Building2,
    Award,
    Stethoscope,
    TrendingUp,
    Sparkles,
    Activity
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/supabaseClient';
import { cn } from '@/lib/utils';

import { Patient } from '@/lib/types';

export default function DoctorDashboard() {
    const { user, profile: doctorProfile } = useAuth();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            try {
                const { data: patientsData } = await supabase
                    .from('appointments')
                    .select('patient_id')
                    .eq('doctor_id', user.id);

                const uniquePatients = new Set(patientsData?.map(a => a.patient_id) || []);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const { count: todayCount } = await supabase
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('doctor_id', user.id)
                    .gte('appointment_date', today.toISOString())
                    .lt('appointment_date', tomorrow.toISOString());

                setStats({
                    totalPatients: uniquePatients.size,
                    todayAppointments: todayCount || 0
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [user]);

    const statsCards = [
        {
            label: 'Total Patients',
            value: stats.totalPatients,
            icon: Users,
            gradient: 'from-blue-500 to-indigo-500',
            bgGradient: 'from-blue-50 to-indigo-50',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            shadowColor: 'shadow-blue-500/20'
        },
        {
            label: 'Today\'s Appointments',
            value: `${stats.todayAppointments}`,
            subtitle: 'Scheduled',
            icon: Calendar,
            gradient: 'from-emerald-500 to-teal-500',
            bgGradient: 'from-emerald-50 to-teal-50',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            shadowColor: 'shadow-emerald-500/20'
        },
        {
            label: 'Hospital',
            value: doctorProfile?.hospital_name || 'Not set',
            icon: Building2,
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50 to-pink-50',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            shadowColor: 'shadow-purple-500/20',
            truncate: true
        },
        {
            label: 'Experience',
            value: doctorProfile?.experience_years ? `${doctorProfile.experience_years} Years` : '-',
            icon: Award,
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-50 to-orange-50',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            shadowColor: 'shadow-amber-500/20'
        }
    ];

    return (
        <div className="min-h-screen pb-20 p-4 md:p-6">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-[100px]" />
            </div>

            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                            <Stethoscope className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                                Welcome, Dr. {doctorProfile?.full_name?.split(' ')[0] || 'Doctor'}
                            </h1>
                            <p className="text-slate-500 flex items-center gap-2">
                                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                                <span>{doctorProfile?.specialization || 'Healthcare Professional'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-medium text-emerald-700">Online</span>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "relative overflow-hidden rounded-2xl p-5",
                                "bg-white/70 backdrop-blur-xl border border-white/50",
                                "shadow-lg hover:shadow-xl transition-all duration-300",
                                "hover:-translate-y-1 cursor-default",
                                stat.shadowColor
                            )}
                        >
                            {/* Decorative Gradient */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2",
                                `bg-gradient-to-br ${stat.gradient}`
                            )} />

                            <div className="relative flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center",
                                    "bg-gradient-to-br",
                                    stat.gradient,
                                    "text-white shadow-lg",
                                    stat.shadowColor
                                )}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                                    <h3 className={cn(
                                        "text-xl font-bold text-slate-800",
                                        stat.truncate && "truncate"
                                    )} title={stat.truncate ? String(stat.value) : undefined}>
                                        {stat.value}
                                    </h3>
                                    {stat.subtitle && (
                                        <p className="text-xs text-slate-400">{stat.subtitle}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="h-[calc(100vh-320px)] grid grid-cols-12 gap-4 md:gap-6">
                    {/* Left: Patient List */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="col-span-12 md:col-span-3 h-full"
                    >
                        <div className="h-full rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
                            <PatientList
                                onSelect={(p) => setSelectedPatient(p)}
                                refreshTrigger={refreshTrigger}
                            />
                        </div>
                    </motion.div>

                    {/* Center: Main Clinical View */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="col-span-12 md:col-span-6 h-full"
                    >
                        <div className="h-full rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
                            <PatientSummary patient={selectedPatient} />
                        </div>
                    </motion.div>

                    {/* Right: Appointment Requests */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="col-span-12 md:col-span-3 h-full"
                    >
                        <div className="h-full rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
                            <AppointmentRequests onUpdate={() => setRefreshTrigger(prev => prev + 1)} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
