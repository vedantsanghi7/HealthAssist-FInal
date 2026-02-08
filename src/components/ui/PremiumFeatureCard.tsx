"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumFeatureCardProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}

export function PremiumFeatureCard({ icon, title, description, className, children }: PremiumFeatureCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn(
                "relative group z-0",
                className
            )}
        >
            {/* Gradient border/glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-[32px] blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Main Card Content */}
            <div className={cn(
                "relative h-full backdrop-blur-[30px] border rounded-[32px] p-8 overflow-hidden transition-all duration-500 flex flex-col",
                // Light mode
                "bg-white/60 border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]",
                "group-hover:bg-white/80 group-hover:border-white/50 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]",
                // Dark mode
                "dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]",
                "dark:group-hover:bg-white/[0.06] dark:group-hover:border-white/[0.12] dark:group-hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.1)]"
            )}>

                {/* Subtle internal gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Noise texture overlay for frosted glass feel */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] dark:opacity-[0.02] pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full items-start text-left">
                    {icon && (
                        <div className={cn(
                            "mb-6 p-3 rounded-2xl border shadow-lg group-hover:scale-110 transition-transform duration-300",
                            // Light mode
                            "bg-gradient-to-br from-white/80 to-white/40 border-white/60 shadow-blue-500/5",
                            // Dark mode
                            "dark:from-white/10 dark:to-white/5 dark:border-white/10 dark:shadow-blue-500/10"
                        )}>
                            {icon}
                        </div>
                    )}

                    <h3 className={cn(
                        "text-xl font-bold bg-clip-text text-transparent mb-3 transition-all duration-300",
                        // Light mode
                        "bg-gradient-to-r from-slate-900 to-slate-700",
                        "group-hover:from-blue-700 group-hover:to-purple-700",
                        // Dark mode
                        "dark:from-white dark:to-slate-300",
                        "dark:group-hover:from-blue-400 dark:group-hover:to-purple-400"
                    )}>
                        {title}
                    </h3>

                    {description && (
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                            {description}
                        </p>
                    )}

                    {children}
                </div>
            </div>
        </motion.div>
    );
}
