'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Award, Stethoscope, Filter, ArrowRight, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal';
import { Doctor } from '@/lib/types';
import { DoctorCard } from '@/components/patient/DoctorCard';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function FindDoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All Specialists');

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                // Fetch profiles where role is 'doctor'
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'doctor');

                if (error) throw error;
                setDoctors(data as Doctor[]);
            } catch (error: any) {
                console.error('Error fetching doctors full:', JSON.stringify(error, null, 2));
                console.error('Error message:', error.message);
                console.error('Error details:', error.details);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc =>
        (activeCategory === 'All Specialists' || doc.specialization === activeCategory) &&
        (doc.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleBookClick = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const categories = ['All Specialists', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician'];

    return (
        <div className="space-y-6 md:space-y-10 pb-20 relative">
            {/* 1. Hero Section */}
            <section className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-sky-800 text-white shadow-2xl p-6 sm:p-8 md:p-12 mb-2 md:mb-8">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-blue-900/80 to-transparent" />

                <div className="relative z-10 max-w-2xl space-y-4 md:space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4 leading-tight">
                            Meet the people <br />
                            <span className="text-sky-300">who care.</span>
                        </h1>
                        <p className="text-base md:text-lg text-blue-100 max-w-lg leading-relaxed opacity-90">
                            Connect with trusted medical professionals who prioritize your well-being. Expert care, just an appointment away.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2"
                    >
                        <Button
                            className="bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full h-11 md:h-12 px-6 md:px-8 font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                            onClick={() => {
                                document.getElementById('doctors-grid')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Find a Specialist
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 rounded-full h-11 md:h-12 px-6 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all font-semibold border-2 border-red-400 w-full sm:w-auto"
                            onClick={() => window.open('https://112.gov.in/', '_blank')}
                        >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Emergency Care
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* 2. Floating Search & Filter Bar */}
            <div id="doctors-grid" className="sticky top-16 md:top-24 z-30 mt-2 md:-mt-20 px-0 w-full min-w-0">
                <GlassCard className="p-2 md:p-3 flex flex-col md:flex-row gap-2 md:gap-4 items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/60 dark:border-white/[0.05] shadow-lg md:shadow-xl rounded-xl md:rounded-2xl w-full">
                    <div className="relative w-full md:flex-1 min-w-0">
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                        <Input
                            placeholder="Search doctors, specialties..."
                            className="pl-10 md:pl-12 bg-white/60 dark:bg-slate-800/60 border-transparent hover:border-blue-200 dark:hover:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 h-10 md:h-14 rounded-lg md:rounded-xl transition-all text-sm md:text-base shadow-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide min-w-0">
                        <Button
                            variant="outline"
                            className="h-9 md:h-14 px-3 md:px-6 rounded-lg md:rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 bg-white/60 dark:bg-slate-800/60 shadow-sm transition-all whitespace-nowrap text-xs md:text-base flex-1 md:flex-none"
                            onClick={() => toast.info('Location filter coming soon!', {
                                description: 'We\'re working on adding location-based filtering to help you find doctors nearby.',
                            })}
                        >
                            <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 shrink-0" />
                            Location
                        </Button>
                        <Button
                            variant="outline"
                            className="h-9 md:h-14 px-3 md:px-6 rounded-lg md:rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 bg-white/60 dark:bg-slate-800/60 shadow-sm transition-all whitespace-nowrap text-xs md:text-base flex-1 md:flex-none"
                            onClick={() => toast.info('Advanced filters coming soon!', {
                                description: 'Filter by availability, ratings, languages spoken, and more.',
                            })}
                        >
                            <Filter className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 shrink-0" />
                            Filters
                        </Button>
                    </div>
                </GlassCard>
            </div>

            {/* 3. Category Pills using Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide pt-2 md:pt-0 w-full min-w-0 max-w-full">
                {categories.map((cat, i) => (
                    <motion.button
                        key={cat}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.3 }}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border shrink-0 ${activeCategory === cat
                            ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-md transform scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        {cat}
                    </motion.button>
                ))}
            </div>

            {/* 4. Doctors Grid */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[380px] md:h-[420px] rounded-2xl md:rounded-3xl bg-white/40 dark:bg-slate-800/40 animate-pulse border border-white/40 dark:border-slate-700/40" />
                        ))}
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="mx-auto h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700 shadow-inner">
                            <Stethoscope className="h-10 w-10 text-slate-300 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No pros found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            We couldn&apos;t find any doctors matching &quot;{searchTerm}&quot;. Try adjusting your search or filters.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDoctors.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <DoctorCard doctor={doc} onBook={handleBookClick} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <BookAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={selectedDoctor}
            />
        </div>
    );
}
