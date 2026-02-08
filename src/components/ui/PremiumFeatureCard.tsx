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
            <div className="relative h-full bg-white/10 backdrop-blur-[30px] border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[32px] p-8 overflow-hidden transition-all duration-500 group-hover:bg-white/20 group-hover:border-white/30 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] flex flex-col">

                {/* Subtle internal gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Noise texture overlay for frosted glass feel */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full items-start text-left">
                    {icon && (
                        <div className="mb-6 p-3 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 border border-white/60 shadow-lg shadow-blue-500/5 group-hover:scale-110 transition-transform duration-300">
                            {icon}
                        </div>
                    )}

                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-3 group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                        {title}
                    </h3>

                    {description && (
                        <p className="text-slate-600 leading-relaxed text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                            {description}
                        </p>
                    )}

                    {children}
                </div>
            </div>
        </motion.div>
    );
}
