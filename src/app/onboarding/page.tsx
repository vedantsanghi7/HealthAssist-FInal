'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';
import { User, Stethoscope, Building2, Briefcase, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
    const { user, role, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Initialize with role from context, or localStorage fallback if context is still loading/default
    // Initialize with role from localStorage first (to handle fresh redirects), then context
    const [onboardingMode, setOnboardingMode] = useState<'patient' | 'doctor'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('last_active_role');
            if (saved === 'doctor' || saved === 'patient') {
                return saved;
            }
        }
        if (role) return role === 'doctor' ? 'doctor' : 'patient';
        return 'patient';
    });

    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        gender: '',
        doctor_name: '',
        specialization: '',
        experience: '',
        hospital: ''
    });

    // Prefill name from Google/Auth metadata
    React.useEffect(() => {
        if (user && !formData.full_name) {
            const { full_name, name } = user.user_metadata || {};
            // Priority: Metadata full_name -> Metadata name -> Email username
            const prefillName = full_name || name || user.email?.split('@')[0];

            if (prefillName) {
                setFormData(prev => ({ ...prev, full_name: prefillName }));
            }
        }
    }, [user]);

    const hasRole = (r: string) => role === r;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) {
                alert('Session lost. Please log in again.');
                return;
            }

            const updates: any = {
                id: user.id,
                full_name: formData.full_name,
                updated_at: new Date().toISOString(),
                is_onboarded: true
            };

            if (onboardingMode === 'doctor') {
                updates.specialization = formData.specialization;
                updates.experience_years = formData.experience ? parseInt(formData.experience) : null;
                updates.hospital_name = formData.hospital;
            } else {
                updates.age = formData.age ? parseInt(formData.age) : null;
                updates.gender = formData.gender;
                updates.doctor_name = formData.doctor_name;
            }

            updates.role = onboardingMode;

            const { error, data } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select();

            if (error) {
                console.error('Update failed:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.warn('Profile not found for update, attempting Upsert fallback...');
                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert({
                        ...updates,
                        email: user.email,
                        role: onboardingMode
                    });

                if (upsertError) throw upsertError;
            }

            console.log('Profile updated successfully');

            if (refreshProfile) {
                await refreshProfile();
            }

            window.location.href = onboardingMode === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';

        } catch (error) {
            console.error('Error updating profile:', error);
            alert(`Failed to save profile: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 p-4">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[20%] w-[60%] h-[60%] rounded-full bg-teal-400/10 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl z-10"
            >
                <GlassCard className="p-8 md:p-12 !bg-white/80 backdrop-blur-2xl shadow-2xl border-white/60">
                    <div className="text-center mb-10">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                            {onboardingMode === 'doctor' ?
                                <Stethoscope className="h-8 w-8 text-white" /> :
                                <User className="h-8 w-8 text-white" />
                            }
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Complete Your Profile</h1>
                        <p className="text-slate-500 mt-2">
                            Setting up your workspace as a <span className="font-semibold text-blue-600 capitalize">{onboardingMode}</span>
                        </p>
                    </div>

                    {(hasRole('patient') || hasRole('doctor')) && (
                        <div className="mb-8 p-4 bg-blue-50/80 border border-blue-100 text-blue-800 text-sm rounded-xl flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span>Logged in as <strong>{onboardingMode}</strong>. Please update your details below.</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Personal Information</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
                                <Input
                                    required
                                    placeholder="John Doe"
                                    className="h-12 bg-white/50 border-slate-200 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>

                            {onboardingMode === 'doctor' ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 ml-1">Specialization</label>
                                        <div className="relative">
                                            <Stethoscope className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                            <Input
                                                required
                                                placeholder="e.g. Cardiologist"
                                                className="pl-11 h-12 bg-white/50 border-slate-200 focus:bg-white rounded-xl"
                                                value={formData.specialization}
                                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 ml-1">Experience (Years)</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                            <Input
                                                required
                                                type="number"
                                                placeholder="10"
                                                className="pl-11 h-12 bg-white/50 border-slate-200 focus:bg-white rounded-xl"
                                                value={formData.experience}
                                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-slate-700 ml-1">Hospital / Clinic Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                            <Input
                                                required
                                                placeholder="City General Hospital"
                                                className="pl-11 h-12 bg-white/50 border-slate-200 focus:bg-white rounded-xl"
                                                value={formData.hospital}
                                                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 ml-1">Age</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                            <Input
                                                required
                                                type="number"
                                                placeholder="30"
                                                className="pl-11 h-12 bg-white/50 border-slate-200 focus:bg-white rounded-xl"
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 ml-1">Gender</label>
                                        <select
                                            required
                                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-slate-700 ml-1">Primary Doctor's Name</label>
                                        <div className="relative">
                                            <Stethoscope className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                            <Input
                                                placeholder="Dr. Smith (Optional)"
                                                className="pl-11 h-12 bg-white/50 border-slate-200 focus:bg-white rounded-xl"
                                                value={formData.doctor_name}
                                                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 text-base font-semibold"
                            disabled={loading}
                        >
                            {loading ? 'Saving Profile...' : (
                                <span className="flex items-center gap-2">
                                    {hasRole(onboardingMode) ? 'Update Profile' : `Join as ${onboardingMode === 'doctor' ? 'Doctor' : 'Patient'}`}
                                    <ChevronRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );
}
