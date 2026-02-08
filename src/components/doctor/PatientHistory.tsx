'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ArrowLeft, Calendar as CalendarIcon, SlidersHorizontal, Upload } from 'lucide-react';
import { RecordCard } from '@/components/patient/RecordCard';
import { UploadRecordModal } from '@/components/records/UploadRecordModal';
import { supabase } from '@/lib/supabase/supabaseClient';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { RecordDetailsDialog } from '@/components/records/RecordDetailsDialog';
import { cn } from '@/lib/utils';

interface PatientHistoryProps {
    patientId: string;
    onBack: () => void;
}

interface Record {
    id: string;
    title: string;
    date: string;
    type: string;
    category?: string;
    status?: 'normal' | 'attention' | 'critical' | 'completed';
    test_results?: any;
    prescription_text?: string;
    doctor_name?: string;
    description?: string;
}

export function PatientHistory({ patientId, onBack }: PatientHistoryProps) {
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!patientId) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', patientId)
                .order('date', { ascending: false });

            if (!error && data) {
                const mappedRecords = data.map((r: any) => {
                    const statusOptions = ['completed', 'normal', 'attention'] as const;
                    const status = statusOptions[r.id.charCodeAt(0) % 3];

                    return {
                        id: r.id,
                        title: r.record_type === 'lab_test' ? `${r.test_name}` : `Prescription`,
                        date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        type: r.record_type === 'lab_test' ? 'Lab Result' : 'Prescription',
                        category: r.test_category || (r.record_type === 'prescription' ? 'Medication' : 'General'),
                        status: status,
                        test_results: r.test_results,
                        prescription_text: r.prescription_text,
                        doctor_name: r.doctor_name,
                        description: r.description
                    };
                });
                setRecords(mappedRecords);
            }
            setLoading(false);
        };

        fetchRecords();
    }, [patientId, refreshTrigger]);

    const filteredRecords = records.filter(r =>
        (activeFilter === 'All' || r.type === activeFilter || r.category === activeFilter) &&
        (r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.type.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Patient Medical History</h2>
                        <p className="text-sm text-muted-foreground">View all records and upload new reports</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <UploadRecordModal
                        patientId={patientId}
                        onRecordAdded={() => setRefreshTrigger(prev => prev + 1)}
                    >
                        <Button className="bg-medical-primary text-white hover:bg-medical-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Record
                        </Button>
                    </UploadRecordModal>
                </div>
            </div>

            {/* Controls Bar */}
            <GlassCard className={cn(
                "p-2 flex flex-col md:flex-row gap-4 items-center",
                "bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border-white/40 dark:border-white/[0.05]"
            )}>
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <Input
                        placeholder="Search records..."
                        className={cn(
                            "pl-12 h-10 rounded-xl transition-all",
                            "bg-white/40 dark:bg-white/[0.03] border-transparent",
                            "hover:border-blue-200 dark:hover:border-white/[0.1]",
                            "focus:border-blue-400 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/[0.05]"
                        )}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {['All', 'Lab Result', 'Prescription'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                activeFilter === filter
                                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/[0.03] hover:text-slate-700 dark:hover:text-slate-300'
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </GlassCard>

            {/* Records Grid */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-4">
                <AnimatePresence mode='wait'>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 h-full">
                            <LoadingSpinner size={32} />
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <GlassCard className={cn(
                            "flex flex-col items-center justify-center py-20 text-center border-dashed border-2 h-full",
                            "border-slate-200 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01]"
                        )}>
                            <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center mb-4">
                                <Upload className="h-8 w-8 text-blue-400 dark:text-blue-400 opacity-80" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No records found</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4 text-sm">
                                {search ? `No results for "${search}"` : "This patient has no uploaded medical records yet."}
                            </p>
                            {!search && (
                                <UploadRecordModal
                                    patientId={patientId}
                                    onRecordAdded={() => setRefreshTrigger(prev => prev + 1)}
                                >
                                    <Button size="sm">Upload First Record</Button>
                                </UploadRecordModal>
                            )}
                        </GlassCard>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRecords.map((record, index) => (
                                <div key={record.id} onClick={() => setSelectedRecord(record)} className="cursor-pointer">
                                    <RecordCard
                                        title={record.title}
                                        date={record.date}
                                        type={record.type}
                                        category={record.category}
                                        status={record.status}
                                        onView={() => setSelectedRecord(record)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <RecordDetailsDialog
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                record={selectedRecord}
            />
        </div>
    );
}
