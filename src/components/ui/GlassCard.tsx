import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glow?: 'blue' | 'purple' | 'teal' | 'none';
}

export function GlassCard({ children, className, hover = true, glow = 'none' }: GlassCardProps) {
    const glowClasses = {
        blue: 'hover:shadow-[0_8px_32px_-1px_rgba(59,130,246,0.15)]',
        purple: 'hover:shadow-[0_8px_32px_-1px_rgba(139,92,246,0.15)]',
        teal: 'hover:shadow-[0_8px_32px_-1px_rgba(20,184,166,0.15)]',
        none: ''
    };

    return (
        <div className={cn(
            // Base styling
            "rounded-3xl border backdrop-blur-xl transition-all duration-300",
            // Light mode
            "bg-white/70 border-white/60 shadow-lg",
            // Dark mode
            "dark:bg-white/[0.05] dark:border-white/[0.08] dark:shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2)]",
            // Hover effects
            hover && [
                "hover:bg-white/90 dark:hover:bg-white/[0.08]",
                "hover:border-white/70 dark:hover:border-white/[0.12]",
                "hover:shadow-xl dark:hover:shadow-[0_8px_32px_-1px_rgba(0,0,0,0.3)]",
                "hover:-translate-y-0.5",
                glowClasses[glow]
            ],
            className
        )}>
            {children}
        </div>
    );
}
