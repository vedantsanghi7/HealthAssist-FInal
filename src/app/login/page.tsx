'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Shield, Mail, Lock, AlertTriangle, Stethoscope, User, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggleButton } from '@/components/ui/theme-toggle';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<'patient' | 'doctor'>('patient');
    const [isSignUp, setIsSignUp] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'doctor') setRole('doctor');

        const modeParam = searchParams.get('mode');
        if (modeParam === 'signup') setIsSignUp(true);
    }, [searchParams]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: role,
                            full_name: email.split('@')[0],
                        },
                    },
                });
                if (authError) throw authError;

                localStorage.setItem('last_active_role', role);
                alert('Signup successful! Please check your email for confirmation link.');
            } else {
                const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (authError) throw authError;

                if (!user) throw new Error('Login failed');

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    const userRole = profile.role;
                    if (userRole !== role) {
                        await supabase.auth.signOut();
                        setError(`Access Denied: You are not registered as a ${role}.`);
                        return;
                    }
                }

                localStorage.setItem('last_active_role', role);
                window.dispatchEvent(new Event('storage'));
                router.push(role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
            }
        } catch (err: unknown) {
            console.error('Auth error:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        localStorage.setItem('last_active_role', role);

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md z-10"
        >
            <GlassCard className="w-full p-8 md:p-10">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="mb-6 group">
                        <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105",
                            role === 'doctor'
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20"
                                : "bg-gradient-to-br from-blue-500 to-teal-500 shadow-blue-500/20"
                        )}>
                            {role === 'doctor' ? <Stethoscope className="h-7 w-7 text-white" /> : <Shield className="h-7 w-7 text-white" />}
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm">
                        {role === 'doctor' ? 'Access your medical practice portal' : 'Secure access to your health dashboard'}
                    </p>
                </div>

                {/* Role Toggle */}
                <div className={cn(
                    "flex p-1 rounded-xl mb-8 relative border",
                    "bg-slate-100/80 border-slate-200/50",
                    "dark:bg-white/[0.03] dark:border-white/[0.1]"
                )}>
                    <div
                        className={cn(
                            "absolute top-1 bottom-1 w-1/2 rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                            "bg-white dark:bg-white/10",
                            role === 'patient' ? 'left-1' : 'left-[calc(50%-4px)] translate-x-1'
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setRole('patient')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 relative z-10 transition-colors",
                            role === 'patient' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        )}
                    >
                        <User className="h-4 w-4" /> Patient
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('doctor')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 relative z-10 transition-colors",
                            role === 'doctor' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        )}
                    >
                        <Stethoscope className="h-4 w-4" /> Doctor
                    </button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "mb-6 p-4 rounded-xl flex items-start gap-3 text-sm backdrop-blur-sm",
                            "bg-red-50/80 border border-red-100 text-red-600",
                            "dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
                        )}
                    >
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="email"
                                placeholder={role === 'doctor' ? "dr.smith@hospital.com" : "name@example.com"}
                                className={cn(
                                    "pl-10 h-11 rounded-xl transition-all",
                                    "bg-white/50 border-slate-200 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10",
                                    "dark:bg-white/[0.03] dark:border-white/[0.1] dark:focus:bg-white/[0.05] dark:focus:border-blue-500/50"
                                )}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className={cn(
                                    "pl-10 h-11 rounded-xl transition-all",
                                    "bg-white/50 border-slate-200 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10",
                                    "dark:bg-white/[0.03] dark:border-white/[0.1] dark:focus:bg-white/[0.05] dark:focus:border-blue-500/50"
                                )}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className={cn(
                            "w-full h-11 text-white shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl font-medium text-base",
                            role === 'doctor'
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        )}
                        disabled={loading}
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                        ) : (
                            isSignUp ? 'Create Account' : 'Sign In'
                        )}
                    </Button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200 dark:border-white/[0.1]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white/40 dark:bg-white/5 backdrop-blur-sm px-3 text-slate-500 dark:text-slate-400">Or continue with</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className={cn(
                        "w-full h-11 transition-all font-medium rounded-xl",
                        "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700",
                        "dark:bg-white/[0.03] dark:border-white/[0.1] dark:hover:bg-white/[0.08] dark:text-white"
                    )}
                    onClick={handleGoogleLogin}
                >
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Google
                </Button>

                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-4 transition-colors"
                    >
                        {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                </p>
            </GlassCard>
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-background">
            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggleButton />
            </div>

            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Light mode */}
                <div className="dark:hidden absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[100px]" />
                <div className="dark:hidden absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/10 blur-[100px]" />
                {/* Dark mode */}
                <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/15 blur-[100px]" />
                <div className="hidden dark:block absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[100px]" />
            </div>

            <Suspense fallback={<div className="text-center text-slate-500 dark:text-slate-400">Loading authentication...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
