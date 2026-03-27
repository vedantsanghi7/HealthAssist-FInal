'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Loader2, ShieldCheck, Mail, Lock, CheckCircle2, User, Stethoscope, Building2, ArrowLeft, GraduationCap, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

function AdminVerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Check if there was a default doctor ID from email
    const initialDoctorId = searchParams.get('doctorId');
    
    const { user, session } = useAuth();
    
    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    // List State
    const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    
    // Detail State
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(initialDoctorId);
    
    // Action State
    const [isVerifying, setIsVerifying] = useState(false);

    const isAdmin = user?.email === 'healthassistpilani@gmail.com';

    useEffect(() => {
        if (isAdmin) {
            fetchPendingDoctors();
        }
    }, [isAdmin]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email !== 'healthassistpilani@gmail.com') {
            toast.error('Only the authorized admin email can log in here.');
            return;
        }

        setIsLoggingIn(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            toast.success('Admin login successful');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('admin_redirect', 'true');
            }
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || 'Google login failed');
            setIsLoggingIn(false);
        }
    };

    const fetchPendingDoctors = async () => {
        setIsLoadingList(true);
        try {
            // Join profiles with doctor_profiles to get all relevant info
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id,
                    full_name,
                    email,
                    verification_status,
                    doctor_name,
                    doctor_profiles (
                        specializations,
                        medical_council,
                        registration_number,
                        degrees,
                        experience_years,
                        current_hospitals,
                        clinic_address
                    )
                `)
                .eq('role', 'doctor')
                .eq('verification_status', 'pending');
                
            if (error) throw error;
            setPendingDoctors(data || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            toast.error('Could not load pending verifications.');
        } finally {
            setIsLoadingList(false);
        }
    };

    const handleVerifyDoctor = async (id: string) => {
        if (!session) return;
        setIsVerifying(true);
        try {
            const response = await fetch('/api/admin/verify-doctor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ doctorId: id })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Verification failed');
            }
            
            toast.success('Doctor verified successfully! An email has been sent back to them.');
            
            // Remove from list
            setPendingDoctors(prev => prev.filter(req => req.id !== id));
            // Go back to list
            setSelectedDoctorId(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to verify doctor');
        } finally {
            setIsVerifying(false);
        }
    };

    // View: Not Logged In
    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
                <GlassCard className="w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Portal</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Sign in to approve new doctor registrations.</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input 
                                    type="email" 
                                    placeholder="healthassistpilani@gmail.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input 
                                    type="password" 
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-white/[0.1]" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-[#1e293b] px-3 text-slate-500 dark:text-slate-400 rounded-full py-0.5" style={{ zIndex: 1, backgroundColor: 'var(--card-bg)' }}>Or</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        className="w-full h-11 transition-all font-medium rounded-xl bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700 dark:bg-white/[0.03] dark:border-white/[0.1] dark:hover:bg-white/[0.08] dark:text-white"
                        onClick={handleGoogleLogin}
                        disabled={isLoggingIn}
                    >
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Sign in with Google
                    </Button>
                </GlassCard>
            </div>
        );
    }

    // View: Logged in, but not admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <GlassCard className="w-full max-w-md p-8 text-center">
                    <ShieldCheck className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-slate-500 mb-6">You must be logged in as healthassistpilani@gmail.com.</p>
                    <Button onClick={() => supabase.auth.signOut()} variant="outline" className="w-full">
                        Sign Out
                    </Button>
                </GlassCard>
            </div>
        );
    }

    // View: Detailed Doctor View
    if (selectedDoctorId) {
        const doc = pendingDoctors.find(d => d.id === selectedDoctorId);
        
        // If doctor not found in pending list, maybe they were already verified or it's a bad link but we can't show it easily without re-fetching
        if (!doc && !isLoadingList) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6">
                    <GlassCard className="w-full max-w-md p-8 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Notice</h1>
                        <p className="text-slate-500 mb-6">This doctor might not be pending verification anymore.</p>
                        <Button onClick={() => setSelectedDoctorId(null)} className="w-full">
                            Back to Pending List
                        </Button>
                    </GlassCard>
                </div>
            );
        }

        if (doc) {
            const extraInfo = doc.doctor_profiles || {};

            return (
                <div className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-900 flex justify-center">
                    <div className="w-full max-w-3xl space-y-6">
                        <Button variant="ghost" className="mb-4" onClick={() => setSelectedDoctorId(null)}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                        </Button>

                        <GlassCard className="p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-orange-100 dark:bg-orange-900/40 rounded-xl">
                                    <ShieldCheck className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Review Doctor Application</h1>
                                    <p className="text-slate-500 text-sm">Review these details carefully before granting platform access.</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Basic Info Section */}
                                <div>
                                    <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-500" /> Basic Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Full Name</p>
                                            <p className="font-semibold">{doc.full_name || doc.doctor_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Email Address</p>
                                            <p className="font-semibold">{doc.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Specializations</p>
                                            <p className="font-semibold">
                                                {extraInfo.specializations?.length > 0 
                                                    ? extraInfo.specializations.join(', ') 
                                                    : 'Not specified'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Years of Experience</p>
                                            <p className="font-semibold">{extraInfo.experience_years || 0} Years</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Qualifications & Registration */}
                                <div>
                                    <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                                        <FileCheck className="w-5 h-5 text-indigo-500" /> Registration & Qualifications
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1 font-semibold text-red-500 flex items-center gap-1">
                                                ★ Registration Number
                                            </p>
                                            <p className="font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded inline-block">
                                                {extraInfo.registration_number || 'MISSING'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1 font-semibold text-red-500 flex items-center gap-1">
                                                ★ Medical Council
                                            </p>
                                            <p className="font-semibold">{extraInfo.medical_council || 'MISSING'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                                <GraduationCap className="w-4 h-4" /> Degrees
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {extraInfo.degrees?.length > 0 ? (
                                                    extraInfo.degrees.map((deg: string, i: number) => (
                                                        <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-semibold">
                                                            {deg}
                                                        </span>
                                                    ))
                                                ) : <span className="text-slate-400 italic">None listed</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Practice Details */}
                                <div>
                                    <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-teal-500" /> Practice Info
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Current Hospitals</p>
                                            <p className="font-semibold">
                                                {extraInfo.current_hospitals?.length > 0 
                                                    ? extraInfo.current_hospitals.join(', ') 
                                                    : 'Not specified'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Clinic Address</p>
                                            <p className="font-semibold">{extraInfo.clinic_address || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-end">
                                <Button variant="outline" onClick={() => setSelectedDoctorId(null)} className="h-12 w-full sm:w-auto">
                                    Cancel & Go Back
                                </Button>
                                <Button 
                                    onClick={() => handleVerifyDoctor(doc.id)}
                                    disabled={isVerifying}
                                    className="h-12 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium px-8 text-base shadow-lg shadow-green-500/20"
                                >
                                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                                    Approve and Verify
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            );
        }
    }

    // View: List of Pending Doctors
    return (
        <div className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            Admin Verification Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1">Review and approve new doctor registrations.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => fetchPendingDoctors()} disabled={isLoadingList}>
                            {isLoadingList ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Refresh List
                        </Button>
                        <Button variant="destructive" onClick={() => supabase.auth.signOut()}>
                            Sign Out
                        </Button>
                    </div>
                </div>

                <GlassCard className="p-0 overflow-hidden">
                    {isLoadingList && pendingDoctors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                            <p className="text-slate-500">Loading pending applications...</p>
                        </div>
                    ) : pendingDoctors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">You're all caught up!</h2>
                            <p className="text-slate-500 max-w-sm">There are no pending doctor verifications at this time.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 uppercase text-slate-500 text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Specialization</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {pendingDoctors.map((doc) => {
                                        const extra = doc.doctor_profiles || {};
                                        // Take first specialization or fallback
                                        const spec = extra.specializations?.[0] || 'Not specified';
                                        
                                        return (
                                            <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                                                        {(doc.full_name || doc.doctor_name || '?')[0].toUpperCase()}
                                                    </div>
                                                    {doc.full_name || doc.doctor_name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{doc.email}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">{spec}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse" />
                                                        Pending
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button onClick={() => setSelectedDoctorId(doc.id)} size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                                        Review <ArrowLeft className="w-3 h-3 ml-2 rotate-180" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}

export default function AdminVerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        }>
            <AdminVerifyContent />
        </Suspense>
    );
}
