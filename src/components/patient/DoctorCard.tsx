'use client';

import React from 'react';
import { Doctor } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DoctorCardProps {
    doctor: Doctor;
    onBook: (doctor: Doctor) => void;
}

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
        >
            <GlassCard className={cn(
                "h-full relative overflow-hidden group transition-all duration-500",
                "border-white/40 dark:border-white/[0.05]",
                "bg-white/60 dark:bg-white/[0.02]",
                "backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-none"
            )}>
                {/* Gradient Background Highlight on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-teal-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-teal-500/5 transition-all duration-500" />

                <div className="p-4 sm:p-5 md:p-6 flex flex-col h-full relative z-10 w-full">
                    {/* Header / Avatar */}
                    <div className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center mb-4 md:mb-6 gap-3 sm:gap-4 md:gap-0 w-full">
                        <div className="relative mb-0 md:mb-4 shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 md:h-24 md:w-24 border-2 md:border-4 border-white dark:border-[#111827] shadow-md md:shadow-lg">
                                <AvatarImage src={`/placeholder-doctor.jpg`} alt={doctor.full_name} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 text-base md:text-xl font-bold">
                                    {doctor.full_name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute 0 md:-bottom-2 -bottom-1 -right-1 md:-right-2 bg-white dark:bg-[#111827] rounded-full p-1 md:p-1.5 shadow-md">
                                <div className="bg-green-500 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full border-2 border-white dark:border-[#111827]" />
                            </div>
                        </div>

                        <div className="flex flex-col items-start md:items-center flex-1 min-w-0 justify-center">
                            <h3 className="font-bold text-base sm:text-lg md:text-xl text-foreground mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors truncate w-full">
                                {doctor.full_name}
                            </h3>
                            <div className="max-w-full truncate">
                                <p className={cn(
                                    "text-[10px] sm:text-xs md:text-sm font-medium px-2 md:px-3 py-0.5 md:py-1 rounded-full border mb-0 md:mb-2 inline-block max-w-full truncate",
                                    "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/20 border-blue-100 dark:border-blue-500/30"
                                )}>
                                    {doctor.specialization || 'General Specialist'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats / Info */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6 w-full">
                        <div className={cn(
                            "flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl border",
                            "bg-white/40 dark:bg-white/[0.02] border-white/60 dark:border-white/[0.05]"
                        )}>
                            <div className="flex items-center gap-1 text-amber-500 mb-0.5 sm:mb-1">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                                <span className="font-bold text-sm sm:text-base text-slate-700 dark:text-white">4.9</span>
                            </div>
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-center">Rating</span>
                        </div>
                        <div className={cn(
                            "flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl border",
                            "bg-white/40 dark:bg-white/[0.02] border-white/60 dark:border-white/[0.05]"
                        )}>
                            <div className="font-bold text-sm sm:text-base text-slate-700 dark:text-white mb-0.5 sm:mb-1">
                                {doctor.experience_years || '5+'} <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">Yrs</span>
                            </div>
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-center">Experience</span>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1 w-full overflow-hidden">
                        <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 w-full">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                            <span className="line-clamp-2 break-words w-full">{doctor.hospital_name || 'HealthAssist Medical Center, New York'}</span>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 w-full">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                            <span className="truncate w-full block">Next Available: <span className="font-medium text-emerald-600 dark:text-emerald-400 sm:ml-1">Today, 2:00 PM</span></span>
                        </div>
                    </div>

                    {/* Action */}
                    <Button
                        onClick={() => onBook(doctor)}
                        className={cn(
                            "w-full shadow-lg transition-all duration-300 rounded-xl h-11 group/btn relative overflow-hidden",
                            "bg-slate-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-500",
                            "text-white dark:text-slate-900 dark:hover:text-white",
                            "hover:shadow-blue-500/25"
                        )}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Book Appointment <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                    </Button>
                </div>
            </GlassCard>
        </motion.div>
    );
}
