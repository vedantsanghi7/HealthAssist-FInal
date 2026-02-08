'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { NotificationDropdown, getUnreadNotificationCount } from './NotificationDropdown';
import { motion } from 'framer-motion';
import { ModeToggle } from '@/components/ui/theme-toggle';

export function Header() {
    const { user, profile, signOut } = useAuth();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [status, setStatus] = useState<'online' | 'busy' | 'away'>('online');
    const [notificationCount, setNotificationCount] = useState(0);

    // Fetch notification count
    useEffect(() => {
        const fetchCount = async () => {
            if (user?.id && profile?.role) {
                const count = await getUnreadNotificationCount(user.id, profile.role as 'patient' | 'doctor');
                setNotificationCount(count);
            }
        };
        fetchCount();

        // Refresh count periodically
        const interval = setInterval(fetchCount, 60000); // Every minute
        return () => clearInterval(interval);
    }, [user?.id, profile?.role]);

    const getInitials = (name: string) => {
        return name
            ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
            : 'U';
    };

    const statusColors = {
        online: 'bg-emerald-500',
        busy: 'bg-red-500',
        away: 'bg-amber-500'
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
                "sticky top-4 z-30 mx-6 mb-2 rounded-2xl px-6 h-16 flex items-center justify-between",
                "backdrop-blur-xl border transition-all duration-300",
                // Light mode
                "bg-white/80 border-white/60 shadow-lg",
                // Dark mode
                "dark:bg-[#111827]/80 dark:border-white/[0.08] dark:shadow-none"
            )}
        >
            {/* Search Bar */}
            <div className="flex-1 max-w-md hidden md:flex items-center gap-2 relative">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={
                        profile?.role === 'doctor'
                            ? "Search patients, records, or symptoms..."
                            : "Search doctors, specialists, or services..."
                    }
                    className={cn(
                        "pl-9 h-10 w-full rounded-xl transition-all duration-300",
                        // Light mode
                        "bg-white/50 border-white/60 focus:bg-white",
                        // Dark mode
                        "dark:bg-white/[0.03] dark:border-white/[0.1] dark:focus:bg-white/[0.05]",
                        "dark:focus:border-blue-500/50 dark:focus:ring-blue-500/10",
                        "dark:placeholder:text-slate-500"
                    )}
                />
            </div>

            <div className="md:hidden font-semibold text-lg text-foreground">HealthAssist</div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">

                {/* Status Toggle */}
                <div className={cn(
                    "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors",
                    "bg-white/50 border-white/60",
                    "dark:bg-white/[0.03] dark:border-white/[0.1]"
                )}>
                    <span className={cn("h-2.5 w-2.5 rounded-full animate-pulse", statusColors[status])} />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'online' | 'busy' | 'away')}
                        className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer dark:text-white"
                    >
                        <option value="online">Online</option>
                        <option value="busy">Do Not Disturb</option>
                        <option value="away">On Break</option>
                    </select>
                </div>

                <div className="h-8 w-px bg-border/20 dark:bg-white/[0.05] hidden sm:block" />

                {/* Theme Toggle */}
                <ModeToggle />

                {/* Notifications */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "relative rounded-xl h-10 w-10 transition-all duration-300",
                            "hover:bg-white/50 dark:hover:bg-white/[0.05]",
                            isNotificationOpen && "bg-white/50 dark:bg-white/[0.05]"
                        )}
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 border-2 border-white dark:border-[#111827] flex items-center justify-center text-[10px] font-bold text-white">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </Button>
                    <NotificationDropdown
                        isOpen={isNotificationOpen}
                        onClose={() => {
                            setIsNotificationOpen(false);
                            // Refresh count after closing
                            if (user?.id && profile?.role) {
                                getUnreadNotificationCount(user.id, profile.role as 'patient' | 'doctor')
                                    .then(setNotificationCount);
                            }
                        }}
                        userId={user?.id}
                        userRole={profile?.role as 'patient' | 'doctor'}
                    />
                </div>

                {/* Profile */}
                <div className="relative">
                    <div
                        className="flex items-center gap-3 pl-2 cursor-pointer"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold leading-none text-foreground">
                                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                                {profile?.role || 'Guest'}
                            </p>
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-white/20 shadow-sm hover:scale-105 transition-transform">
                            <AvatarImage src="/placeholder-user.jpg" alt="User" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                                {getInitials(profile?.full_name || '')}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className={cn(
                                    "absolute right-0 top-14 w-56 rounded-2xl p-2 z-50",
                                    "backdrop-blur-xl border shadow-xl",
                                    // Light mode
                                    "bg-white/90 border-white/60",
                                    // Dark mode
                                    "dark:bg-[#111827]/95 dark:border-white/[0.1] dark:shadow-2xl dark:shadow-black/20"
                                )}
                            >
                                <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.05] mb-1">
                                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{profile?.full_name || 'User'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-9 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg"
                                        onClick={() => {
                                            window.location.href = '/dashboard/settings';
                                        }}
                                    >
                                        My Profile
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-9 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                        onClick={async () => {
                                            await signOut();
                                            setIsProfileOpen(false);
                                        }}
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
