'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    ReferenceLine
} from 'recharts';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Activity, Heart, Scale, Droplets, Thermometer, Wind, FileBarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

// Types
import { MedicalRecord } from '@/lib/types';

interface ChartDataPoint {
    date: string;
    fullDate: string;
    value: number;
    [key: string]: any;
}

interface VitalMetric {
    id: string;
    label: string;
    unit: string;
    icon: React.ReactNode;
    color: string;
    gradientId: string;
    domain: [number | 'auto', number | 'auto'];
    reference?: number;
}

const PREDEFINED_METRICS: Record<string, Partial<VitalMetric>> = {
    'Heart Rate': { icon: <Heart className="w-4 h-4" />, color: '#f43f5e', unit: 'bpm', domain: [40, 180] },
    'Systolic BP': { icon: <Activity className="w-4 h-4" />, color: '#8b5cf6', unit: 'mmHg', domain: [80, 180] },
    'Diastolic BP': { icon: <Activity className="w-4 h-4" />, color: '#6366f1', unit: 'mmHg', domain: [50, 120] },
    'Weight': { icon: <Scale className="w-4 h-4" />, color: '#10b981', unit: 'kg', domain: ['auto', 'auto'] },
    'Hemoglobin': { icon: <Droplets className="w-4 h-4" />, color: '#ec4899', unit: 'g/dL', domain: [10, 18] },
    'Temperature': { icon: <Thermometer className="w-4 h-4" />, color: '#f59e0b', unit: '°C', domain: [35, 42] },
    'SpO2': { icon: <Wind className="w-4 h-4" />, color: '#06b6d4', unit: '%', domain: [90, 100] },
};

const DYNAMIC_COLORS = [
    '#3b82f6', '#ef4444', '#eab308', '#22c55e',
    '#a855f7', '#ec4899', '#f97316', '#06b6d4',
];

export function VitalsChart() {
    const { user } = useAuth();
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [activeTab, setActiveTab] = useState<string>('Heart Rate');
    const [metricDefinitions, setMetricDefinitions] = useState<Record<string, VitalMetric>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVitals = async () => {
            if (!user) return;
            setIsLoading(true);

            try {
                const { data: recordsData } = await supabase
                    .from('medical_records')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: true })
                    .limit(50);

                const records = recordsData as MedicalRecord[] | null;

                if (records && records.length > 0) {
                    const processedData: ChartDataPoint[] = [];
                    const foundMetrics = new Map<string, VitalMetric>();

                    records.forEach((r) => {
                        if (!r.test_results) return;

                        const results = typeof r.test_results === 'string'
                            ? JSON.parse(r.test_results)
                            : r.test_results;

                        if (!results || typeof results !== 'object') return;

                        const dateObj = new Date(r.date);
                        const basePoint: ChartDataPoint = {
                            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            fullDate: dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                            value: 0
                        };

                        let hasData = false;

                        const traverseAndExtract = (obj: any, prefix = '') => {
                            Object.entries(obj).forEach(([key, val]) => {
                                if (['comments', 'notes', 'summary', 'doctor_name'].includes(key.toLowerCase())) return;

                                const fullKey = prefix ? `${prefix} ${key}` : key;
                                const cleanKey = fullKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                if (typeof val === 'number') {
                                    basePoint[cleanKey] = val;
                                    registerMetric(cleanKey, val);
                                    hasData = true;
                                } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
                                    basePoint[cleanKey] = parseFloat(val);
                                    registerMetric(cleanKey, parseFloat(val));
                                    hasData = true;
                                } else if (typeof val === 'object' && val !== null) {
                                    if ('value' in val) {
                                        const v = (val as any).value;
                                        if (typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v)))) {
                                            const numVal = typeof v === 'string' ? parseFloat(v) : v;
                                            basePoint[cleanKey] = numVal;
                                            registerMetric(cleanKey, numVal, (val as any).unit);
                                            hasData = true;
                                        }
                                    } else {
                                        if (key === 'blood_pressure') {
                                            traverseAndExtract(val, '');
                                        } else {
                                            traverseAndExtract(val, cleanKey);
                                        }
                                    }
                                }
                            });
                        };

                        const registerMetric = (key: string, _sampleValue: number, unitHint?: string) => {
                            if (!foundMetrics.has(key)) {
                                const predefined = PREDEFINED_METRICS[key] || {};
                                const colorIndex = Math.abs(key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % DYNAMIC_COLORS.length;

                                foundMetrics.set(key, {
                                    id: key,
                                    label: key,
                                    unit: unitHint || predefined.unit || '',
                                    icon: predefined.icon || <FileBarChart className="w-4 h-4" />,
                                    color: predefined.color || DYNAMIC_COLORS[colorIndex],
                                    gradientId: `color-${key.replace(/\s+/g, '-')}`,
                                    domain: predefined.domain as any || ['auto', 'auto'],
                                    reference: undefined
                                });
                            }
                        };

                        traverseAndExtract(results);
                        if (hasData) processedData.push(basePoint);
                    });

                    processedData.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
                    setChartData(processedData);
                    const metricsObj = Object.fromEntries(foundMetrics);
                    setMetricDefinitions(metricsObj);

                    const keys = Array.from(foundMetrics.keys());
                    if (keys.length > 0 && !activeTab) {
                        if (foundMetrics.has('Heart Rate')) setActiveTab('Heart Rate');
                        else if (foundMetrics.has('Systolic BP')) setActiveTab('Systolic BP');
                        else setActiveTab(keys[0]);
                    } else if (keys.length > 0 && !foundMetrics.has(activeTab)) {
                        setActiveTab(keys[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching vitals for chart:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVitals();
    }, [user, activeTab]);

    const currentMetric = useMemo(() => metricDefinitions[activeTab] || Object.values(metricDefinitions)[0], [activeTab, metricDefinitions]);

    const activeData = useMemo(() => {
        if (!currentMetric) return [];
        return chartData
            .filter(d => d[currentMetric.id] !== undefined)
            .map(d => ({ ...d, value: d[currentMetric.id] }));
    }, [chartData, currentMetric]);

    if (isLoading) {
        return <div className="h-[350px] w-full flex items-center justify-center animate-pulse bg-white/10 dark:bg-white/[0.02] rounded-3xl" />;
    }

    if (!currentMetric || activeData.length === 0) {
        return (
            <div className={cn(
                "h-[350px] w-full flex flex-col items-center justify-center rounded-3xl border space-y-4",
                "bg-white/40 backdrop-blur-md border-white/50 text-slate-400",
                "dark:bg-white/[0.02] dark:border-white/[0.05] dark:text-slate-500"
            )}>
                <Activity className="w-12 h-12 mb-2 opacity-20" />
                <div className="text-center">
                    <p className="font-medium">No vital data recorded yet.</p>
                    <p className="text-xs opacity-60">Upload medical records to see trends.</p>
                </div>

                <button
                    onClick={async () => {
                        if (!user) return;
                        setIsLoading(true);
                        try {
                            const { addDummyRecords } = await import('@/utils/dummyData');
                            await addDummyRecords(user.id);
                            window.location.reload();
                        } catch (e) {
                            console.error(e);
                            setIsLoading(false);
                        }
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                    <FileBarChart className="w-4 h-4" />
                    Populate Demo Data
                </button>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full rounded-3xl border overflow-hidden flex flex-col h-[400px]",
            "bg-white/40 backdrop-blur-xl border-white/60 shadow-xl",
            "dark:bg-white/[0.02] dark:border-white/[0.05] dark:shadow-none"
        )}>
            {/* Header / Dropdown */}
            <div className={cn(
                "p-4 border-b flex items-center justify-between",
                "border-white/50",
                "dark:border-white/[0.05]"
            )}>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    {React.cloneElement(currentMetric.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4 text-slate-500 dark:text-slate-400" })}
                    {currentMetric.label} Trend
                </h3>

                <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className={cn(
                        "w-[200px] backdrop-blur-sm",
                        "bg-white/50 border-white/60 focus:ring-slate-200",
                        "dark:bg-white/[0.03] dark:border-white/[0.1] dark:focus:ring-white/10"
                    )}>
                        <SelectValue placeholder="Select Metric" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {Object.values(metricDefinitions).map((metric) => (
                            <SelectItem key={metric.id} value={metric.id}>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "p-1 rounded-full",
                                        "bg-slate-100/50",
                                        "dark:bg-white/[0.05]"
                                    )}>
                                        {React.cloneElement(metric.icon as React.ReactElement<{ className?: string }>, { className: "w-3 h-3 text-slate-600 dark:text-slate-400" })}
                                    </span>
                                    {metric.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full relative group bg-transparent">
                {/* Background Decor - hidden in dark mode */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30 dark:to-transparent pointer-events-none" />

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <defs>
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <linearGradient id={currentMetric.gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            className="stroke-black/5 dark:stroke-white/[0.03]"
                        />

                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'currentColor', className: 'fill-slate-400 dark:fill-slate-500' }}
                            dy={10}
                            padding={{ left: 20, right: 20 }}
                        />

                        <YAxis
                            domain={currentMetric.domain}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'currentColor', className: 'fill-slate-400 dark:fill-slate-500' }}
                            padding={{ top: 20, bottom: 20 }}
                        />

                        {currentMetric.reference && (
                            <ReferenceLine
                                y={currentMetric.reference}
                                stroke={currentMetric.color}
                                strokeDasharray="3 3"
                                strokeOpacity={0.4}
                                label={{
                                    position: 'right',
                                    value: 'Avg',
                                    fill: currentMetric.color,
                                    fontSize: 10,
                                    opacity: 0.6
                                }}
                            />
                        )}

                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className={cn(
                                            "backdrop-blur-xl p-3 rounded-2xl shadow-xl border text-xs",
                                            "bg-white/90 border-white/60",
                                            "dark:bg-[#1A2233]/95 dark:border-white/[0.1]"
                                        )}>
                                            <p className="text-slate-500 dark:text-slate-400 mb-1">{payload[0].payload.fullDate}</p>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: currentMetric.color }}
                                                />
                                                <span className="font-bold text-slate-800 dark:text-white text-sm">
                                                    {payload[0].value} {currentMetric.unit}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                            cursor={{ stroke: currentMetric.color, strokeWidth: 1, strokeDasharray: '4 4' }}
                        />

                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={currentMetric.color}
                            strokeWidth={3}
                            fill={`url(#${currentMetric.gradientId})`}
                            filter="url(#glow)"
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
