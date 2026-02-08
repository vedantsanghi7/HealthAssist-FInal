'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/supabaseClient';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
    User,
    Save,
    Settings as SettingsIcon,
    Mail,
    Building2,
    Stethoscope,
    Calendar,
    Shield,
    Sparkles,
    CheckCircle2,
    Loader2
} from 'lucide-react';

export default function SettingsPage() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        gender: '',
        doctor_name: '',
        specialization: '',
        experience_years: '',
        hospital_name: ''
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                age: profile.age?.toString() || '',
                gender: profile.gender || '',
                doctor_name: profile.doctor_name || '',
                specialization: profile.specialization || '',
                experience_years: profile.experience_years?.toString() || '',
                hospital_name: profile.hospital_name || ''
            });
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const updates: any = {
                id: user.id,
                full_name: formData.full_name,
                updated_at: new Date().toISOString(),
            };

            if (profile?.role === 'doctor') {
                updates.specialization = formData.specialization;
                updates.experience_years = formData.experience_years ? parseInt(formData.experience_years) : null;
                updates.hospital_name = formData.hospital_name;
            } else {
                updates.age = formData.age ? parseInt(formData.age) : null;
                updates.gender = formData.gender;
                updates.doctor_name = formData.doctor_name;
            }

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                    <p className="text-slate-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 p-4 md:p-8">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                            <SettingsIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                                Settings
                            </h1>
                            <p className="text-slate-500">Manage your account and preferences</p>
                        </div>
                    </div>
                </motion.div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-white/60 to-indigo-50/40 backdrop-blur-xl border border-white/50 shadow-xl">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl" />

                        {/* Profile Header */}
                        <div className="relative z-10 p-6 border-b border-white/30">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
                                        {formData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg">
                                        <Shield className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-slate-800">{formData.full_name || 'Your Name'}</h2>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-200">
                                            {profile.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span className="text-sm">{user?.email}</span>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                                    <Sparkles className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs font-medium text-emerald-700">Account Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSave} className="relative z-10 p-6 space-y-6">
                            {/* Personal Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="h-5 w-5 text-indigo-500" />
                                    <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
                                </div>

                                <div className="grid gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            Full Name
                                        </label>
                                        <Input
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className="h-12 bg-white/60 border-white/40 rounded-xl focus:border-indigo-400 focus:ring-indigo-400/20 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                value={user?.email || ''}
                                                disabled
                                                className="h-12 pl-11 bg-slate-50/80 border-slate-200 text-slate-400 cursor-not-allowed rounded-xl"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            Email address is verified and cannot be changed
                                        </p>
                                    </div>

                                    {profile.role === 'patient' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Age</label>
                                                    <Input
                                                        name="age"
                                                        type="number"
                                                        value={formData.age}
                                                        onChange={handleChange}
                                                        placeholder="30"
                                                        className="h-12 bg-white/60 border-white/40 rounded-xl focus:border-indigo-400"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Gender</label>
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                        className="flex h-12 w-full rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all"
                                                    >
                                                        <option value="">Select gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4 text-slate-400" />
                                                    Primary Doctor
                                                </label>
                                                <Input
                                                    name="doctor_name"
                                                    value={formData.doctor_name}
                                                    onChange={handleChange}
                                                    placeholder="Dr. Smith"
                                                    className="h-12 bg-white/60 border-white/40 rounded-xl focus:border-indigo-400"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {profile.role === 'doctor' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4 text-slate-400" />
                                                    Specialization
                                                </label>
                                                <Input
                                                    name="specialization"
                                                    value={formData.specialization}
                                                    onChange={handleChange}
                                                    placeholder="Cardiology, General Practice, etc."
                                                    className="h-12 bg-white/60 border-white/40 rounded-xl focus:border-indigo-400"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                        Experience (Years)
                                                    </label>
                                                    <Input
                                                        name="experience_years"
                                                        type="number"
                                                        value={formData.experience_years}
                                                        onChange={handleChange}
                                                        placeholder="10"
                                                        className="h-12 bg-white/60 border-white/40 rounded-xl focus:border-indigo-400"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-slate-400" />
                                                        Hospital/Clinic
                                                    </label>
                                                    <Input
                                                        name="hospital_name"
                                                        value={formData.hospital_name}
                                                        onChange={handleChange}
                                                        placeholder="City Hospital"
                                                        className="h-12 bg-white/60 border-white/40 rounded-xl focus:border-indigo-400"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-6 border-t border-white/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {saved && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-2 text-emerald-600"
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                            <span className="text-sm font-medium">Changes saved successfully!</span>
                                        </motion.div>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
