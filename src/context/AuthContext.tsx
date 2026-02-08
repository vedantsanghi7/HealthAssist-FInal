'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabaseClient';

import { UserProfile } from '@/lib/types';

export type UserRole = 'patient' | 'doctor' | 'admin' | null;

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isOnboarded: boolean;
    refreshProfile: () => Promise<void>; // Added to manually refresh profile
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    isOnboarded: false,
    refreshProfile: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (currentUser: User) => {
        try {
            console.log('Auth: Fetching profile for', currentUser.id);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .maybeSingle();

            if (error) {
                console.error('Auth: Error fetching profile:', error.message);
                setRole('patient');
                setLoading(false);
                return;
            }

            if (!data) {
                console.warn('Auth: Profile not found for user:', currentUser.id);
                // Fallback to metadata if available (e.g. fresh signup)
                const metadataRole = currentUser.user_metadata?.role as UserRole;
                setRole(metadataRole || 'patient');
                setProfile(null);
            } else {
                setProfile(data);
                console.log('Auth: Profile loaded:', data.role);

                // Set role directly from DB
                const userRole = data.role as UserRole;
                setRole(userRole || 'patient');

                // Store for persistence if needed, though less critical now with strict checks
                if (userRole) {
                    localStorage.setItem('last_active_role', userRole);
                }
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            setRole('patient');
        } finally {
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchUserProfile(user);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            console.log('Auth: Initializing...');
            try {
                // Get initial session
                const { data: { session: initialSession } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (initialSession) {
                    setSession(initialSession);
                    setUser(initialSession.user);
                    // Fetch profile immediately if session exists
                    await fetchUserProfile(initialSession.user);
                } else {
                    // No session, stop loading
                    setLoading(false);
                }

                // Listen for changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                    console.log(`Auth: Auth state change: ${event}`);
                    if (!mounted) return;

                    setSession(currentSession);
                    const newUser = currentSession?.user ?? null;

                    // Only fetch profile if user CHANGED or strictly on SIGN_IN
                    if (newUser?.id !== user?.id || event === 'SIGNED_IN') {
                        setUser(newUser);
                        if (newUser) {
                            setLoading(true); // Set loading while we get new profile
                            await fetchUserProfile(newUser);
                        } else {
                            setRole(null);
                            setProfile(null);
                            setLoading(false);
                        }
                    } else if (event === 'SIGNED_OUT') {
                        setUser(null);
                        setRole(null);
                        setProfile(null);
                        setLoading(false);
                    }
                });

                return () => {
                    subscription.unsubscribe();
                };

            } catch (error) {
                console.error("Auth init error:", error);
                setLoading(false);
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array intentially

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setRole(null);
            setProfile(null);
            setUser(null);
            setSession(null);
            localStorage.removeItem('last_active_role');
            window.location.href = '/login';
        }
    };

    const isOnboarded = profile?.is_onboarded || false;

    return (
        <AuthContext.Provider value={{ user, session, role, profile, loading, signOut, isOnboarded, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
