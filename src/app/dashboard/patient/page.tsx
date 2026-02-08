'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Components
import { HeroSection } from '@/components/patient/dashboard/HeroSection';
import { MedicalTimeline } from '@/components/patient/dashboard/MedicalTimeline';
import { HealthInsightPanel } from '@/components/patient/HealthInsightPanel';
import { VitalsChart } from '@/components/patient/VitalsChart';
import { RecordCard } from '@/components/patient/RecordCard'; // Assuming this exists or will be used
import { ArrowRight, FileText, Activity } from 'lucide-react';

import { RecordDetailsDialog } from '@/components/records/RecordDetailsDialog';

export default function PatientDashboard() {
    const { user, profile } = useAuth();
    const [recentRecords, setRecentRecords] = useState<any[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [healthMetrics, setHealthMetrics] = useState<{
        heartRate: string | null;
        bloodPressure: string | null;
        healthScore: string | null;
    }>({
        heartRate: null,
        bloodPressure: null,
        healthScore: null
    });
    const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // Fetch Recent Records
                const { data: records } = await supabase
                    .from('medical_records')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .limit(3);

                setRecentRecords(records || []);

                // Fetch Health Score from Health Metrics
                const { data: metrics } = await supabase
                    .from('health_metrics')
                    .select('*')
                    .eq('patient_id', user.id)
                    .eq('metric_type', 'health_score') // Only need score from here
                    .order('recorded_at', { ascending: false })
                    .limit(1);

                const latestHealthScore = metrics && metrics.length > 0 ? metrics[0].value : null;

                // Fetch Vitals from Medical Records (looking for 'Vitals' category or specific test names)
                const { data: vitalRecords } = await supabase
                    .from('medical_records')
                    .select('*')
                    .eq('user_id', user.id)
                    .or('test_category.eq.Vitals,test_name.eq.Vital Signs')
                    .order('date', { ascending: false })
                    .limit(5);

                let latestHeartRate = null;
                let latestBP = null;

                if (vitalRecords && vitalRecords.length > 0) {
                    for (const record of vitalRecords) {
                        const results = record.test_results;
                        if (!results) continue;

                        // Check for Heart Rate
                        if (!latestHeartRate) {
                            if (results.heart_rate?.value) latestHeartRate = results.heart_rate.value; // Seeded format
                            else if (results['Heart Rate']) latestHeartRate = results['Heart Rate']; // Manual format
                        }

                        // Check for Blood Pressure
                        if (!latestBP) {
                            if (results.blood_pressure?.systolic && results.blood_pressure?.diastolic) {
                                latestBP = `${results.blood_pressure.systolic}/${results.blood_pressure.diastolic}`; // Seeded format
                            } else if (results.Systolic && results.Diastolic) {
                                latestBP = `${results.Systolic}/${results.Diastolic}`; // Manual format
                            }
                        }

                        if (latestHeartRate && latestBP) break; // Found both
                    }
                }

                setHealthMetrics({
                    heartRate: latestHeartRate ? String(latestHeartRate) : null,
                    bloodPressure: latestBP || null,
                    healthScore: latestHealthScore || null
                });

                // Fetch Timeline: Combine appointments and recent records
                const timeline: any[] = [];

                // Get upcoming/recent appointments
                const { data: appointments } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        doctor:doctor_id(full_name, specialization)
                    `)
                    .eq('patient_id', user.id)
                    .gte('appointment_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                    .order('appointment_date', { ascending: false })
                    .limit(5);

                if (appointments) {
                    appointments.forEach((apt: any) => {
                        const aptDate = new Date(apt.appointment_date);
                        const isUpcoming = aptDate > new Date();
                        const isToday = aptDate.toDateString() === new Date().toDateString();

                        let dateStr = aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        if (isToday) dateStr = `Today, ${aptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                        else if (isUpcoming) dateStr = aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                        timeline.push({
                            id: apt.id,
                            title: `${apt.doctor?.specialization || 'Medical'} Appointment`,
                            date: dateStr,
                            status: apt.status === 'confirmed' && isUpcoming ? 'upcoming' :
                                apt.status === 'completed' ? 'completed' :
                                    apt.status === 'cancelled' ? 'completed' : 'attention',
                            doctor: apt.doctor?.full_name || 'Doctor',
                            type: 'Appointment'
                        });
                    });
                }

                // Add recent medical records to timeline
                if (records && records.length > 0) {
                    records.slice(0, 2).forEach((record: any) => {
                        const recordDate = new Date(record.date);
                        const isToday = recordDate.toDateString() === new Date().toDateString();
                        const isYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString() === recordDate.toDateString();

                        let dateStr = recordDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        if (isToday) dateStr = 'Today';
                        else if (isYesterday) dateStr = 'Yesterday';

                        timeline.push({
                            id: `record-${record.id}`,
                            title: record.record_type === 'lab_test' ? `${record.test_name || 'Lab Test'}` : 'Medical Record',
                            date: dateStr,
                            status: 'completed',
                            type: record.record_type === 'lab_test' ? 'Lab Result' : 'Medical Record'
                        });
                    });
                }

                // Sort timeline by most recent
                timeline.sort((a, b) => {
                    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
                    if (b.status === 'upcoming' && a.status !== 'upcoming') return 1;
                    return 0;
                });

                setTimelineEvents(timeline.slice(0, 5));
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleHealthScoreUpdate = (newScore: number) => {
        setHealthMetrics(prev => ({
            ...prev,
            healthScore: String(newScore)
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 p-4 md:p-8 space-y-8">

            {/* 1. Hero Section with 3D Graphic & Key Stats */}
            <section className="w-full animate-in fade-in slide-in-from-top-4 duration-700">
                <HeroSection
                    userName={profile?.full_name?.split(' ')[0] || 'Patient'}
                    healthMetrics={healthMetrics}
                    recentActivity={timelineEvents[0]}
                />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* 2. Main Content Column (Left/Center) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Vitals Chart Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Vitals Trends
                            </h2>
                            <select className="bg-white/50 border border-white/60 rounded-lg text-xs py-1 px-3 text-slate-600 focus:outline-none">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="glass-panel p-1 rounded-3xl overflow-hidden bg-white/40">
                            <VitalsChart />
                        </div>
                    </section>

                    {/* Medical Timeline Section */}
                    <section className="space-y-4">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-white/60 to-blue-50/40 backdrop-blur-xl border border-white/50 shadow-xl">
                            {/* Decorative gradient orbs */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl -z-0" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl -z-0" />

                            {/* Header */}
                            <div className="relative z-10 flex items-center justify-between p-6 pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">Health Journey</h2>
                                        <p className="text-xs text-slate-500">Your medical timeline & activities</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/patient/timeline" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors flex items-center gap-1">
                                    View Full History
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {/* Timeline Content */}
                            <div className="relative z-10 p-6 md:p-8 min-h-[350px]">
                                <MedicalTimeline events={timelineEvents} />
                            </div>
                        </div>
                    </section>
                </div>

                {/* 3. Sidebar Column (Right) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* AI Insights - Primary Action */}
                    <section>
                        <HealthInsightPanel
                            onHealthScoreUpdate={handleHealthScoreUpdate}
                            initialScore={healthMetrics.healthScore ? Number(healthMetrics.healthScore) : null}
                        />
                    </section>

                    {/* Recent Documents / Records */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-bold text-foreground">Recent Documents</h2>
                            <Link href="/dashboard/patient/records" className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <ArrowRight className="h-4 w-4 text-slate-500" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentRecords.length === 0 ? (
                                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/30 text-slate-400">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No recent records</p>
                                </div>
                            ) : (
                                recentRecords.map((r, i) => (
                                    <motion.div
                                        key={r.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <RecordCard
                                            title={r.record_type === 'lab_test' ? `${r.test_name}` : `Prescription`}
                                            date={new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            type={r.record_type === 'lab_test' ? 'Lab Result' : 'Prescription'}
                                            category={r.test_category || (r.record_type === 'prescription' ? 'Medication' : 'General')}
                                            onView={() => setSelectedRecord({
                                                ...r,
                                                title: r.record_type === 'lab_test' ? `${r.test_name}` : `Prescription`,
                                                type: r.record_type === 'lab_test' ? 'Lab Result' : 'Prescription',
                                                category: r.test_category || (r.record_type === 'prescription' ? 'Medication' : 'General')
                                            })}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <Link href="/dashboard/patient/records" className="block w-full">
                            <button className="w-full py-3 rounded-xl border border-slate-200 bg-white/40 hover:bg-white/60 text-sm font-medium text-slate-600 transition-all">
                                View sensitive records vaulted
                            </button>
                        </Link>
                    </section>
                </div>
            </div>

            <RecordDetailsDialog
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                record={selectedRecord}
            />
        </div>
    );
}
