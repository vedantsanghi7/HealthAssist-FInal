'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';
import {
    User, Stethoscope, GraduationCap, Building2, Calendar,
    ChevronRight, ChevronLeft, Check, Plus, X, Clock, MapPin,
    Languages, FileText, Shield, Briefcase, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeToggleButton } from '@/components/ui/theme-toggle';
import {
    SPECIALITY_CATEGORIES,
    MEDICAL_COUNCILS,
    MEDICAL_DEGREES,
    LANGUAGES,
    DAYS_OF_WEEK,
    ONBOARDING_STEPS
} from '@/lib/constants/doctorOnboarding';
import type { AvailabilitySlot } from '@/lib/types';

// ─── Progress Bar ───────────────────────────────────────────────
function ProgressBar({ currentStep }: { currentStep: number }) {
    return (
        <div className="w-full mb-10">
            <div className="flex items-center justify-between relative">
                {/* Background line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-white/10" />
                {/* Active line */}
                <motion.div
                    className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
                {ONBOARDING_STEPS.map((step) => (
                    <div key={step.number} className="flex flex-col items-center relative z-10">
                        <motion.div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                                step.number < currentStep
                                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                                    : step.number === currentStep
                                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110"
                                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-white/20 text-slate-400 dark:text-slate-500"
                            )}
                            animate={step.number === currentStep ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            {step.number < currentStep ? (
                                <Check className="h-5 w-5" />
                            ) : (
                                step.number
                            )}
                        </motion.div>
                        <span className={cn(
                            "text-xs mt-2 font-medium whitespace-nowrap hidden sm:block",
                            step.number <= currentStep
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-400 dark:text-slate-500"
                        )}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Multi-Select Chips ─────────────────────────────────────────
function MultiSelectChips({
    label,
    options,
    selected,
    onChange,
    columns = 3
}: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    columns?: number;
}) {
    const toggle = (item: string) => {
        onChange(
            selected.includes(item)
                ? selected.filter((s) => s !== item)
                : [...selected, item]
        );
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{label}</label>
            <div className={cn("grid gap-2", `grid-cols-2 sm:grid-cols-${columns}`)}>
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => toggle(option)}
                        className={cn(
                            "px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-200 text-left",
                            selected.includes(option)
                                ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/40 dark:text-blue-300 shadow-sm"
                                : "bg-white/50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-slate-400 dark:hover:border-white/20"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <span className={cn(
                                "w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                selected.includes(option)
                                    ? "bg-blue-500 border-blue-500"
                                    : "border-slate-300 dark:border-white/20"
                            )}>
                                {selected.includes(option) && <Check className="w-3 h-3 text-white" />}
                            </span>
                            {option}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Styled Select Component ────────────────────────────────────
function StyledSelect({
    label,
    value,
    onChange,
    options,
    placeholder,
    required = false,
    icon: Icon
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder: string;
    required?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />}
                <select
                    required={required}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        "flex h-12 w-full rounded-xl border px-3 py-2 text-sm ring-offset-background transition-all appearance-none",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/50",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "bg-white/50 border-slate-200 text-slate-900",
                        "dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-white",
                        Icon ? "pl-11" : "pl-3"
                    )}
                >
                    <option value="" className="dark:bg-slate-800">{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt} className="dark:bg-slate-800">{opt}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

// ─── Styled Input ───────────────────────────────────────────────
const inputClasses = cn(
    "h-12 rounded-xl transition-all",
    "bg-white/50 border-slate-200 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10",
    "dark:bg-white/[0.03] dark:border-white/[0.1] dark:focus:bg-white/[0.05] dark:focus:border-blue-500/50"
);

const textareaClasses = cn(
    "rounded-xl transition-all min-h-[100px]",
    "bg-white/50 border-slate-200 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10",
    "dark:bg-white/[0.03] dark:border-white/[0.1] dark:focus:bg-white/[0.05] dark:focus:border-blue-500/50"
);

const iconInputClasses = cn(inputClasses, "pl-11");

// ─── Main Component ─────────────────────────────────────────────
export default function DoctorOnboardingPage() {
    const { user, refreshProfile } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

    // Step 1 – Personal
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [bio, setBio] = useState('');
    const [languages, setLanguages] = useState<string[]>([]);

    // Step 2 – Education
    const [degrees, setDegrees] = useState<string[]>([]);
    const [specializationCategory, setSpecializationCategory] = useState('');
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [medicalCollege, setMedicalCollege] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [additionalCerts, setAdditionalCerts] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [medicalCouncil, setMedicalCouncil] = useState('');

    // Step 3 – Practice
    const [experienceYears, setExperienceYears] = useState('');
    const [currentHospitals, setCurrentHospitals] = useState<string[]>(['']);
    const [previousExperience, setPreviousExperience] = useState('');
    const [clinicAddress, setClinicAddress] = useState('');

    // Step 4 – Availability
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([
        { day: 'Monday', startTime: '09:00', endTime: '17:00', mode: 'both' }
    ]);
    const [consultationMode, setConsultationMode] = useState<'online' | 'offline' | 'both'>('both');

    // Pre-fill name from auth
    useEffect(() => {
        if (user && !fullName) {
            const { full_name, name } = user.user_metadata || {};
            const prefill = full_name || name || user.email?.split('@')[0] || '';
            if (prefill) setFullName(prefill);
        }
    }, [user, fullName]);

    // Get sub-specialties for selected category
    const availableSpecialties = specializationCategory
        ? SPECIALITY_CATEGORIES.find(c => c.category === specializationCategory)?.specialties || []
        : [];

    // Reset selections when category changes
    useEffect(() => {
        setSpecializations([]);
    }, [specializationCategory]);

    // ── Step Validation ──
    const isStep1Valid = fullName.trim() !== '' && gender !== '' && languages.length > 0;
    const isStep2Valid = degrees.length > 0 && specializationCategory !== '' && specializations.length > 0
        && medicalCollege.trim() !== '' && graduationYear.trim() !== ''
        && registrationNumber.trim() !== '' && medicalCouncil !== '';
    const isStep3Valid = experienceYears.trim() !== '' && currentHospitals.some(h => h.trim() !== '');
    const isStep4Valid = availability.length > 0 && availability.every(a => a.day && a.startTime && a.endTime);

    const isCurrentStepValid = () => {
        switch (currentStep) {
            case 1: return isStep1Valid;
            case 2: return isStep2Valid;
            case 3: return isStep3Valid;
            case 4: return isStep4Valid;
            default: return false;
        }
    };

    const nextStep = () => {
        if (currentStep < 4 && isCurrentStepValid()) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    // ── Hospital List Helpers ──
    const addHospital = () => setCurrentHospitals(prev => [...prev, '']);
    const removeHospital = (index: number) => setCurrentHospitals(prev => prev.filter((_, i) => i !== index));
    const updateHospital = (index: number, value: string) => {
        setCurrentHospitals(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    // ── Availability Helpers ──
    const addSlot = () => setAvailability(prev => [...prev, { day: 'Monday', startTime: '09:00', endTime: '17:00', mode: 'both' }]);
    const removeSlot = (index: number) => setAvailability(prev => prev.filter((_, i) => i !== index));
    const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string) => {
        setAvailability(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // ── Submit ──
    const handleSubmit = async () => {
        if (!isCurrentStepValid() || !user) return;
        setLoading(true);

        try {
            console.log('Doctor onboarding: Starting submit for user', user.id);

            // 1. Ensure profiles row exists — try update first, then upsert fallback
            const { error: updateError, data: updateData } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    is_onboarded: true,
                    specialization: specializations.join(', '),
                    experience_years: parseInt(experienceYears) || null,
                    hospital_name: currentHospitals.filter(h => h.trim() !== '').join(', '),
                    gender,
                    role: 'doctor',
                    verification_status: 'pending',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
                .select();

            console.log('Doctor onboarding: Profile update result:', { updateData, updateError });

            if (updateError) {
                console.error('Profile update failed:', updateError);
                throw updateError;
            }

            // If update returned no rows, the profile doesn't exist — insert it
            if (!updateData || updateData.length === 0) {
                console.log('Doctor onboarding: Profile not found, attempting upsert...');
                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        email: user.email,
                        full_name: fullName,
                        is_onboarded: true,
                        specialization: specializations.join(', '),
                        experience_years: parseInt(experienceYears) || null,
                        hospital_name: currentHospitals.filter(h => h.trim() !== '').join(', '),
                        gender,
                        role: 'doctor',
                        verification_status: 'pending',
                        updated_at: new Date().toISOString(),
                    });

                if (upsertError) {
                    console.error('Profile upsert failed:', upsertError);
                    throw upsertError;
                }
                console.log('Doctor onboarding: Profile upserted successfully');
            }

            // 2. Upsert doctor_profiles
            console.log('Doctor onboarding: Inserting doctor_profiles...');
            const { error: insertError } = await supabase
                .from('doctor_profiles')
                .upsert({
                    user_id: user.id,
                    gender,
                    bio,
                    languages,
                    degrees,
                    specialization_category: specializationCategory,
                    specializations,
                    medical_college: medicalCollege,
                    graduation_year: parseInt(graduationYear) || null,
                    additional_certifications: additionalCerts,
                    registration_number: registrationNumber,
                    medical_council: medicalCouncil,
                    experience_years: parseInt(experienceYears) || null,
                    current_hospitals: currentHospitals.filter(h => h.trim() !== ''),
                    previous_experience: previousExperience,
                    clinic_address: clinicAddress,
                    availability,
                    consultation_mode: consultationMode,
                }, { onConflict: 'user_id' });

            if (insertError) {
                console.error('Doctor profile insert failed:', insertError);
                throw insertError;
            }

            // Send notification email to admin
            console.log('Doctor onboarding: Sending admin notification...');
            try {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'admin_doctor_signup_notification',
                        data: {
                            doctorId: user.id,
                            doctorName: fullName,
                            email: user.email,
                            specialization: specializations.join(', '),
                            experience: `${experienceYears} years`
                        }
                    })
                });
            } catch (err) {
                console.error('Failed to send admin signup notification:', err);
                // Non-blocking error, so we don't throw
            }

            console.log('Doctor onboarding: Complete! Redirecting...');
            if (refreshProfile) await refreshProfile();
            window.location.href = '/dashboard/doctor';

        } catch (error) {
            console.error('Error saving doctor profile:', error);
            alert(`Failed to save profile: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    // ── Step content animation variants ──
    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
    };

    // ── Step Icons ──
    const stepIcons = [
        <User key="user" className="h-8 w-8 text-white" />,
        <GraduationCap key="grad" className="h-8 w-8 text-white" />,
        <Building2 key="building" className="h-8 w-8 text-white" />,
        <Calendar key="calendar" className="h-8 w-8 text-white" />,
    ];

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4">
            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggleButton />
            </div>

            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="dark:hidden absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px]" />
                <div className="dark:hidden absolute bottom-[-20%] right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-400/10 blur-[120px]" />
                <div className="hidden dark:block absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/15 blur-[120px]" />
                <div className="hidden dark:block absolute bottom-[-20%] right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl z-10"
            >
                <GlassCard className="p-6 md:p-10" hover={false}>
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                            {stepIcons[currentStep - 1]}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {ONBOARDING_STEPS[currentStep - 1].label}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                            {ONBOARDING_STEPS[currentStep - 1].description}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <ProgressBar currentStep={currentStep} />

                    {/* Step Content */}
                    <div className="relative overflow-hidden min-h-[380px]">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                                className="space-y-6"
                            >
                                {/* ═══════ STEP 1: Personal Info ═══════ */}
                                {currentStep === 1 && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Full Name *</label>
                                            <div className="relative">
                                                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                                <Input
                                                    required
                                                    placeholder="Dr. John Doe"
                                                    className={iconInputClasses}
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <StyledSelect
                                            label="Gender *"
                                            value={gender}
                                            onChange={setGender}
                                            options={['Male', 'Female', 'Other', 'Prefer not to say']}
                                            placeholder="Select Gender"
                                            required
                                        />

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Short Bio</label>
                                            <Textarea
                                                placeholder="Brief description of your experience and approach (e.g., '15+ years in cardiology, specializing in preventive care and patient education...')"
                                                className={textareaClasses}
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                            />
                                        </div>

                                        <MultiSelectChips
                                            label="Languages Spoken *"
                                            options={LANGUAGES}
                                            selected={languages}
                                            onChange={setLanguages}
                                            columns={4}
                                        />
                                    </>
                                )}

                                {/* ═══════ STEP 2: Education & Registration ═══════ */}
                                {currentStep === 2 && (
                                    <>
                                        <MultiSelectChips
                                            label="Medical Degree(s) *"
                                            options={MEDICAL_DEGREES}
                                            selected={degrees}
                                            onChange={setDegrees}
                                            columns={4}
                                        />

                                        <StyledSelect
                                            label="Specialization Category *"
                                            value={specializationCategory}
                                            onChange={setSpecializationCategory}
                                            options={SPECIALITY_CATEGORIES.map(c => c.category)}
                                            placeholder="Select Category"
                                            required
                                            icon={Stethoscope}
                                        />

                                        {specializationCategory && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <MultiSelectChips
                                                    label="Specialization(s) *"
                                                    options={availableSpecialties}
                                                    selected={specializations}
                                                    onChange={setSpecializations}
                                                    columns={2}
                                                />
                                            </motion.div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Medical College / University *</label>
                                                <div className="relative">
                                                    <GraduationCap className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        required
                                                        placeholder="AIIMS Delhi"
                                                        className={iconInputClasses}
                                                        value={medicalCollege}
                                                        onChange={(e) => setMedicalCollege(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Year of Graduation *</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        required
                                                        type="number"
                                                        min="1950"
                                                        max={new Date().getFullYear()}
                                                        placeholder="2010"
                                                        className={iconInputClasses}
                                                        value={graduationYear}
                                                        onChange={(e) => setGraduationYear(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Additional Certifications</label>
                                            <Textarea
                                                placeholder="Fellowships, diplomas, board certifications, etc."
                                                className={textareaClasses}
                                                value={additionalCerts}
                                                onChange={(e) => setAdditionalCerts(e.target.value)}
                                            />
                                        </div>

                                        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                                            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
                                                <Shield className="h-4 w-4" />
                                                Registration Details (Required)
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Registration Number *</label>
                                                    <div className="relative">
                                                        <FileText className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                                        <Input
                                                            required
                                                            placeholder="MCI-12345"
                                                            className={iconInputClasses}
                                                            value={registrationNumber}
                                                            onChange={(e) => setRegistrationNumber(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <StyledSelect
                                                    label="Medical Council *"
                                                    value={medicalCouncil}
                                                    onChange={setMedicalCouncil}
                                                    options={MEDICAL_COUNCILS}
                                                    placeholder="Select Council"
                                                    required
                                                    icon={Shield}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ═══════ STEP 3: Practice & Experience ═══════ */}
                                {currentStep === 3 && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Years of Experience *</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                                <Input
                                                    required
                                                    type="number"
                                                    min="0"
                                                    max="60"
                                                    placeholder="10"
                                                    className={iconInputClasses}
                                                    value={experienceYears}
                                                    onChange={(e) => setExperienceYears(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Current Hospital / Clinic Name(s) *</label>
                                            {currentHospitals.map((hospital, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <div className="relative flex-1">
                                                        <Building2 className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                                        <Input
                                                            placeholder={`Hospital / Clinic ${index + 1}`}
                                                            className={iconInputClasses}
                                                            value={hospital}
                                                            onChange={(e) => updateHospital(index, e.target.value)}
                                                        />
                                                    </div>
                                                    {currentHospitals.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeHospital(index)}
                                                            className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addHospital}
                                                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-1 py-1"
                                            >
                                                <Plus className="h-4 w-4" /> Add another hospital/clinic
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Previous Work Experience</label>
                                            <Textarea
                                                placeholder="Description of your previous roles, hospitals, or clinics you've worked at..."
                                                className={textareaClasses}
                                                value={previousExperience}
                                                onChange={(e) => setPreviousExperience(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Clinic Address (for offline visits)</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                                <Textarea
                                                    placeholder="Full clinic address including city, state, and pin code..."
                                                    className={cn(textareaClasses, "pl-11")}
                                                    value={clinicAddress}
                                                    onChange={(e) => setClinicAddress(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ═══════ STEP 4: Availability ═══════ */}
                                {currentStep === 4 && (
                                    <>
                                        <div className="space-y-2 mb-6">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Preferred Consultation Mode</label>
                                            <div className="flex gap-3">
                                                {(['online', 'offline', 'both'] as const).map((mode) => (
                                                    <button
                                                        key={mode}
                                                        type="button"
                                                        onClick={() => setConsultationMode(mode)}
                                                        className={cn(
                                                            "flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all duration-200 capitalize",
                                                            consultationMode === mode
                                                                ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/40 dark:text-blue-300 shadow-sm"
                                                                : "bg-white/50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-slate-400 dark:hover:border-white/20"
                                                        )}
                                                    >
                                                        {mode === 'both' ? 'Online & Offline' : mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Available Time Slots *
                                            </label>
                                            {availability.map((slot, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={cn(
                                                        "p-4 rounded-xl border",
                                                        "bg-slate-50/50 border-slate-200",
                                                        "dark:bg-white/[0.02] dark:border-white/[0.08]"
                                                    )}
                                                >
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Day</label>
                                                            <select
                                                                value={slot.day}
                                                                onChange={(e) => updateSlot(index, 'day', e.target.value)}
                                                                className={cn(
                                                                    "flex h-10 w-full rounded-lg border px-2 py-1 text-sm transition-all appearance-none",
                                                                    "bg-white border-slate-200 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
                                                                )}
                                                            >
                                                                {DAYS_OF_WEEK.map(day => (
                                                                    <option key={day} value={day} className="dark:bg-slate-800">{day}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Start</label>
                                                            <Input
                                                                type="time"
                                                                value={slot.startTime}
                                                                onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                                                                className="h-10 rounded-lg bg-white border-slate-200 dark:bg-white/[0.05] dark:border-white/[0.1]"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">End</label>
                                                            <Input
                                                                type="time"
                                                                value={slot.endTime}
                                                                onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                                                                className="h-10 rounded-lg bg-white border-slate-200 dark:bg-white/[0.05] dark:border-white/[0.1]"
                                                            />
                                                        </div>
                                                        <div className="flex items-end gap-2">
                                                            <select
                                                                value={slot.mode}
                                                                onChange={(e) => updateSlot(index, 'mode', e.target.value)}
                                                                className={cn(
                                                                    "flex h-10 flex-1 rounded-lg border px-2 py-1 text-sm transition-all appearance-none",
                                                                    "bg-white border-slate-200 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
                                                                )}
                                                            >
                                                                <option value="online" className="dark:bg-slate-800">Online</option>
                                                                <option value="offline" className="dark:bg-slate-800">Offline</option>
                                                                <option value="both" className="dark:bg-slate-800">Both</option>
                                                            </select>
                                                            {availability.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSlot(index)}
                                                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addSlot}
                                                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-1 py-1"
                                            >
                                                <Plus className="h-4 w-4" /> Add time slot
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.08]">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={cn(
                                "h-12 px-6 rounded-xl font-medium transition-all",
                                "border-slate-200 text-slate-600 hover:bg-slate-50",
                                "dark:border-white/[0.1] dark:text-slate-300 dark:hover:bg-white/[0.05]",
                                currentStep === 1 && "opacity-0 pointer-events-none"
                            )}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        {currentStep < 4 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                disabled={!isCurrentStepValid()}
                                className={cn(
                                    "h-12 px-8 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5",
                                    "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25",
                                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                )}
                            >
                                Next Step
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!isCurrentStepValid() || loading}
                                className={cn(
                                    "h-12 px-8 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5",
                                    "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25",
                                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                )}
                            >
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                ) : (
                                    <><Check className="h-4 w-4 mr-2" /> Complete Profile</>
                                )}
                            </Button>
                        )}
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
