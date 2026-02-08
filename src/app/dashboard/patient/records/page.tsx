'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Search, Filter, Calendar as CalendarIcon, SlidersHorizontal, Plus, X, ArrowUpDown, Clock } from 'lucide-react';
import { RecordCard } from '@/components/patient/RecordCard';
import { UploadRecordModal } from '@/components/records/UploadRecordModal';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface Record {
    id: string;
    title: string;
    date: string;
    rawDate: Date;
    type: string;
    category?: string;
    status?: 'normal' | 'attention' | 'critical' | 'completed';
    doctor_name?: string;
}

import { RecordDetailsDialog } from '@/components/records/RecordDetailsDialog';

export default function MedicalRecordsPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    // New Filter States
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!user) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (!error && data) {
                // Map DB records to UI model
                const mappedRecords = data.map((r: any) => {
                    // Simple heuristic for status - random or based on future analysis
                    // consistent based on ID char for demo stability
                    const statusOptions = ['completed', 'normal', 'attention'] as const;
                    const status = statusOptions[r.id.charCodeAt(0) % 3];

                    return {
                        id: r.id,
                        title: r.record_type === 'lab_test' ? `${r.test_name}` : `Prescription`,
                        date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        rawDate: new Date(r.date),
                        type: r.record_type === 'lab_test' ? 'Lab Result' : 'Prescription',
                        category: r.test_category || (r.record_type === 'prescription' ? 'Medication' : 'General'),
                        status: status,
                        // Pass raw data for dialog
                        test_results: r.test_results,
                        prescription_text: r.prescription_text,
                        doctor_name: r.doctor_name,
                        description: r.description
                    }
                });
                setRecords(mappedRecords);
            }
            setLoading(false);
        };

        fetchRecords();
    }, [user, refreshTrigger]);

    // Derived State for filtering
    const filteredRecords = React.useMemo(() => {
        let filtered = records.filter(r => {
            // 1. Text Search
            const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                r.type.toLowerCase().includes(search.toLowerCase()) ||
                (r.doctor_name && r.doctor_name.toLowerCase().includes(search.toLowerCase()));

            // 2. Category Filter
            const matchesCategory = activeFilter === 'All' || r.type === activeFilter || r.category === activeFilter;

            // 3. Date Range Filter
            let matchesDate = true;
            if (dateRange?.from) {
                const recordTime = r.rawDate.getTime();
                const fromTime = dateRange.from.getTime();
                // Reset time part for accurate date comparison if needed, but simplistic is fine
                matchesDate = recordTime >= fromTime;

                if (matchesDate && dateRange.to) {
                    // Start of next day effectively for inclusive range if we want, or just simple
                    // Let's assume inclusive of the day
                    const toTime = new Date(dateRange.to).setHours(23, 59, 59, 999);
                    matchesDate = recordTime <= toTime;
                } else if (matchesDate && !dateRange.to) {
                    // Check if it matches 'from' date exactly if single date selected?
                    // Usually libraries handle 'range' as [from, undefined] meaning 'on or after' or 'only this date'?
                    // DayPicker range mode: selecting one day sets from=day, to=undefined (sometimes).
                    // If we want exact day when 'to' is undefined:
                    // const nextDay = new Date(dateRange.from); nextDay.setDate(nextDay.getDate()+1);
                    // matchesDate = recordTime >= fromTime && recordTime < nextDay.getTime();
                    // But usually standard range picker implies "From X onwards" if To is empty, OR "On X" if intended as single.
                    // Let's assume standard behavior: From X (and To Y if set).
                }
            }

            return matchesSearch && matchesCategory && matchesDate;
        });

        // 4. Sorting
        filtered.sort((a, b) => {
            const timeA = a.rawDate.getTime();
            const timeB = b.rawDate.getTime();
            return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
        });

        return filtered;
    }, [records, search, activeFilter, dateRange, sortOrder]);

    const clearFilters = () => {
        setSearch('');
        setActiveFilter('All');
        setDateRange(undefined);
        setSortOrder('newest');
    };

    const hasActiveFilters = search || activeFilter !== 'All' || dateRange;

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                >
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                        Medical Records
                    </h1>
                    <p className="text-muted-foreground text-base max-w-lg">
                        Centralized vault for all your health documents, lab results, and prescriptions.
                    </p>
                </motion.div>

                <div className="flex gap-3">
                    <UploadRecordModal onRecordAdded={() => setRefreshTrigger(prev => prev + 1)}>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-xl h-12 px-6 transition-all duration-300 hover:scale-105 active:scale-95">
                            <Plus className="h-5 w-5 mr-2" />
                            Upload Record
                        </Button>
                    </UploadRecordModal>
                </div>
            </div>

            {/* Controls Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <GlassCard className="p-2 flex flex-col md:flex-row gap-4 items-center bg-white/60 backdrop-blur-xl border-white/40">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by name, doctor, or type..."
                            className="pl-12 bg-white/40 border-transparent hover:border-blue-200 focus:border-blue-400 focus:bg-white h-12 rounded-xl transition-all text-base"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto w-full md:w-auto flex items-center gap-2 pb-2 md:pb-0 scrollbar-hide">
                        {['All', 'Lab Result', 'Prescription', 'Imaging'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap border",
                                    activeFilter === filter
                                        ? "bg-blue-100/50 border-blue-200 text-blue-700 shadow-sm"
                                        : "bg-transparent border-transparent text-slate-500 hover:bg-white/50 hover:text-slate-700"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden md:block" />

                    <div className="flex gap-2 w-full md:w-auto">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "flex-1 md:w-auto justify-start text-left font-normal h-12 rounded-xl border-slate-200 hover:bg-white",
                                        !dateRange && "text-muted-foreground",
                                        dateRange && "text-blue-600 border-blue-200 bg-blue-50/50"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                                {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex-1 md:w-auto border-slate-200 text-slate-600 hover:bg-white h-12 rounded-xl gap-2">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filters
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Sort Records</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v) => setSortOrder(v as 'newest' | 'oldest')}>
                                    <DropdownMenuRadioItem value="newest">
                                        <ArrowUpDown className="mr-2 h-4 w-4 rotate-0" /> Newest First
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="oldest">
                                        <ArrowUpDown className="mr-2 h-4 w-4 rotate-180" /> Oldest First
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>

                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Filter by Doctor</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={search}
                                    onValueChange={(v) => {
                                        setSearch(v === search ? '' : v);
                                    }}
                                >
                                    {Array.from(new Set(records.map(r => r.doctor_name).filter(Boolean))).map((doc) => (
                                        <DropdownMenuRadioItem key={doc} value={doc || ''}>
                                            Dr. {doc?.replace('Dr. ', '')}
                                        </DropdownMenuRadioItem>
                                    ))}
                                    {records.length > 0 && !records.some(r => r.doctor_name) && (
                                        <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                                            No doctors found
                                        </div>
                                    )}
                                </DropdownMenuRadioGroup>

                                {hasActiveFilters && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={clearFilters}
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        >
                                            <X className="mr-2 h-4 w-4" /> Clear All Filters
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clearFilters}
                                className="h-12 w-12 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                                title="Clear filters"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </GlassCard>
            </motion.div>

            {/* Records Grid */}
            <AnimatePresence mode='wait'>
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="relative">
                            <LoadingSpinner size={48} className="text-blue-500" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-8 w-8 rounded-full bg-blue-50" />
                            </div>
                        </div>
                        <p className="mt-4 text-slate-400 font-medium">Loading your secure records...</p>
                    </motion.div>
                ) : filteredRecords.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-full"
                    >
                        <GlassCard className="flex flex-col items-center justify-center py-24 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
                            <div className="h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center mb-6 shadow-inner">
                                <Search className="h-10 w-10 text-blue-400 opacity-80" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No records found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8">
                                {hasActiveFilters
                                    ? "Try adjusting your filters or search terms."
                                    : "Upload your first medical record to start tracking your health journey."}
                            </p>
                            {hasActiveFilters ? (
                                <Button onClick={clearFilters} variant="outline" className="border-slate-300">
                                    Clear Filters
                                </Button>
                            ) : (
                                <UploadRecordModal onRecordAdded={() => setRefreshTrigger(prev => prev + 1)}>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 shadow-lg shadow-blue-500/20">
                                        Upload Now
                                    </Button>
                                </UploadRecordModal>
                            )}
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredRecords.map((record, index) => (
                            <motion.div
                                key={record.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <RecordCard
                                    title={record.title}
                                    date={record.date}
                                    type={record.type}
                                    category={record.category}
                                    status={record.status}
                                    onView={() => setSelectedRecord(record)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <RecordDetailsDialog
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                record={selectedRecord}
            />
        </div>
    );
}
