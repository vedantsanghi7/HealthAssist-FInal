'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const { user, role, profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not authenticated, redirect to login
                // Only redirect if NOT already on login page to avoid loops
                if (!pathname.includes('/login')) {
                    router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                }
                return;
            }

            // Check if profile is loaded
            // If profile is null but user exists, it might be a new user or fetch failed
            if (!profile) {
                // Determine if we are already on onboarding
                if (!pathname.startsWith('/onboarding')) {
                    console.log('AuthGuard: Missing profile, redirecting to onboarding');
                    router.push('/onboarding');
                }
                return;
            }

            // Check onboarding status
            if (!profile.is_onboarded) {
                if (!pathname.startsWith('/onboarding')) {
                    console.log('AuthGuard: User not onboarded, redirecting to onboarding');
                    router.push('/onboarding');
                }
                return;
            } else if (pathname.startsWith('/onboarding')) {
                // Using "startsWith" to catch sub-routes if any
                // If ALREADY onboarded but trying to access /onboarding, send to dashboard
                console.log('AuthGuard: User already onboarded, redirecting to dashboard');
                const target = role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';
                router.replace(target); // Use replace to avoid history stack issues
                return;
            }

            // Role-based access control
            let effectiveAllowedRoles = allowedRoles;
            if (!effectiveAllowedRoles) {
                if (pathname.startsWith('/dashboard/doctor')) {
                    effectiveAllowedRoles = ['doctor'];
                } else if (pathname.startsWith('/dashboard/patient')) {
                    effectiveAllowedRoles = ['patient'];
                }
            }

            if (effectiveAllowedRoles && role && !effectiveAllowedRoles.includes(role)) {
                // Authenticated but wrong role
                const target = role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';
                if (pathname !== target && !pathname.startsWith(target)) {
                    console.log('AuthGuard: Unauthorized role, redirecting to', target);
                    router.push(target);
                }
            }
        }
    }, [user, role, profile, loading, router, pathname, allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner size={48} className="text-blue-600" />
                    <p className="text-slate-500 font-medium">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!user) return null; // Will redirect

    // If we are on onboarding, render children (the onboarding form)
    if (pathname.startsWith('/onboarding')) {
        return <>{children}</>;
    }

    // If profile is missing or not onboarded, show loading/blocking state while redirect happens
    if (!profile || !profile.is_onboarded) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-medical-bg">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner size={32} className="text-blue-600" />
                    <p className="text-sm text-muted-foreground">Setting up your profile...</p>
                </div>
            </div>
        );
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) return null; // Will redirect

    return <>{children}</>;
}
