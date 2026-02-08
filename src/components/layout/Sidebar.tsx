'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Activity,
    Calendar,
    Settings,
    LogOut,
    Users,
    MessageSquare,
    ClipboardList,
    Mail,
    HeartPulse
} from 'lucide-react';

const PATIENT_MENU = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/patient' },
    { label: 'Medical Records', icon: FileText, href: '/dashboard/patient/records' },
    { label: 'Timeline', icon: Activity, href: '/dashboard/patient/timeline' },
    { label: 'Find Doctors', icon: Users, href: '/dashboard/patient/doctors' },
    { label: 'Appointments', icon: Calendar, href: '/dashboard/patient/appointments' },
    { label: 'Messages', icon: Mail, href: '/dashboard/patient/messages' },
    { label: 'AI Assistant', icon: MessageSquare, href: '/dashboard/patient/ai-chat' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

const DOCTOR_MENU = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/doctor' },
    { label: 'My Patients', icon: Users, href: '/dashboard/doctor/patients' },
    { label: 'Consultations', icon: ClipboardList, href: '/dashboard/doctor/consultations' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/doctor/messages' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { role } = useRole();
    const { signOut } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(true);

    const menuItems = role === 'doctor' ? DOCTOR_MENU : PATIENT_MENU;

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            className={cn(
                "hidden md:flex flex-col h-[calc(100vh-2rem)] sticky top-4 mb-4 ml-4 rounded-3xl z-40",
                "backdrop-blur-xl border transition-all duration-300",
                // Light mode
                "bg-white/80 border-white/60 shadow-xl",
                // Dark mode
                "dark:bg-[#0B0F14]/80 dark:border-white/[0.05] dark:shadow-none"
            )}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            {/* Logo Section */}
            <div className="flex h-20 items-center justify-center border-b border-border/10 dark:border-white/[0.05] relative">
                <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap px-4 w-full">
                    <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10">
                        <HeartPulse className="h-6 w-6 text-white" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isCollapsed ? 0 : 1 }}
                        className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300"
                    >
                        HealthAssist
                    </motion.div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3">
                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 group relative",
                                    isActive
                                        ? "text-white"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/[0.05]"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className={cn(
                                            "absolute inset-0 rounded-xl z-0",
                                            "bg-gradient-to-r from-blue-600 to-indigo-600",
                                            "shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10"
                                        )}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className="relative z-10 flex items-center gap-3">
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-all duration-300",
                                        isActive
                                            ? "text-white"
                                            : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-110"
                                    )} />
                                    <motion.span
                                        animate={{ opacity: isCollapsed ? 0 : 1, x: isCollapsed ? -10 : 0 }}
                                        className="whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                </div>
                                {isActive && !isCollapsed && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm z-10"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Sign Out Button */}
            <div className="p-4 border-t border-border/10 dark:border-white/[0.05]">
                <button
                    onClick={async () => {
                        await signOut();
                    }}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all group overflow-hidden",
                        "text-slate-500 dark:text-slate-400",
                        "hover:bg-red-50 dark:hover:bg-red-500/10",
                        "hover:text-red-600 dark:hover:text-red-400",
                        isCollapsed && "justify-center"
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <motion.span
                        animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                        className="whitespace-nowrap overflow-hidden"
                    >
                        Sign Out
                    </motion.span>
                </button>
            </div>
        </motion.aside>
    );
}
