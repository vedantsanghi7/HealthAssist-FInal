'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Loader2,
    Upload,
    FileText,
    X,
    FlaskConical,
    Pill,
    FileUp,
    CheckCircle2,
    Calendar,
    Stethoscope,
    Sparkles,
    CloudUpload
} from 'lucide-react';
import { MEDICAL_TESTS } from '@/lib/constants/medicalTests';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

type TestParameter = {
    name: string;
    unit: string;
    range: string;
}

type TestDefinition = {
    name: string;
    parameters: TestParameter[];
}

type MedicalTestsType = {
    [key: string]: TestDefinition[];
}

const medicalTestsData = MEDICAL_TESTS as MedicalTestsType;

interface UploadRecordFormProps {
    patientId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function UploadRecordForm({ patientId, onSuccess, onCancel }: UploadRecordFormProps) {
    const { user, role } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('doc');
    const [doctorFullName, setDoctorFullName] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);

    // Fetch doctor's full name if role is doctor
    React.useEffect(() => {
        const fetchDoctorName = async () => {
            if (role === 'doctor' && user?.id) {
                const { data } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                if (data?.full_name) {
                    setDoctorFullName(`Dr. ${data.full_name}`);
                }
            }
        };
        fetchDoctorName();
    }, [role, user?.id]);

    // Lab Test State
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedTestIndex, setSelectedTestIndex] = useState<string>('');
    const [testDate, setTestDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [testValues, setTestValues] = useState<Record<string, string>>({});

    // Prescription State
    const [doctorName, setDoctorName] = useState('');
    const [prescriptionDate, setPrescriptionDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [prescriptionText, setPrescriptionText] = useState('');

    // Document/File Upload State
    const [file, setFile] = useState<File | null>(null);
    const [docTitle, setDocTitle] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Determine target user ID (Patient ID or Current User ID)
    const targetUserId = patientId || user?.id;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const resetForm = () => {
        setSelectedCategory('');
        setSelectedTestIndex('');
        setTestValues({});
        setDoctorName('');
        setPrescriptionText('');
        setTestDate(new Date().toISOString().split('T')[0]);
        setPrescriptionDate(new Date().toISOString().split('T')[0]);
        setFile(null);
        setDocTitle('');
    };

    const handleDocumentSubmit = async () => {
        if (!file || !user || !targetUserId || !docTitle) return;
        setIsLoading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${targetUserId}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('medical-records')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase
                .from('medical_records')
                .insert({
                    user_id: targetUserId,
                    record_type: 'prescription',
                    file_path: fileName,
                    doctor_name: role === 'doctor' ? doctorFullName : 'Self Upload',
                    uploaded_by: role === 'doctor' ? 'doctor' : 'patient',
                    doctor_id: role === 'doctor' ? user.id : null,
                    test_name: docTitle,
                    date: new Date().toISOString(),
                    test_category: 'Document',
                    status: 'completed'
                });

            if (dbError) throw dbError;

            // Send email notification if doctor uploads for patient
            if (role === 'doctor' && patientId) {
                const { data: patientProfile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', patientId)
                    .single();

                fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'medical_record',
                        data: {
                            patientId: patientId,
                            patientName: patientProfile?.full_name || 'Patient',
                            recordType: 'Document',
                            testName: docTitle,
                            uploadedBy: doctorFullName
                        }
                    })
                }).catch(err => console.error('Email notification failed:', err));
            }

            resetForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error uploading document:', error);
            alert(`Upload failed: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLabSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !targetUserId || !selectedCategory || !selectedTestIndex) return;

        setIsLoading(true);
        try {
            const test = medicalTestsData[selectedCategory][parseInt(selectedTestIndex)];

            const { error } = await supabase.from('medical_records').insert({
                user_id: targetUserId,
                record_type: 'lab_test',
                date: testDate || new Date().toISOString().split('T')[0],
                test_category: selectedCategory,
                test_name: test.name,
                test_results: testValues,
                doctor_name: role === 'doctor' ? doctorFullName : 'Self Upload',
                uploaded_by: role === 'doctor' ? 'doctor' : 'patient',
                doctor_id: role === 'doctor' ? user.id : null,
            });

            if (error) throw error;

            // Send email notification if doctor uploads for patient
            if (role === 'doctor' && patientId) {
                const { data: patientProfile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', patientId)
                    .single();

                fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'medical_record',
                        data: {
                            patientId: patientId,
                            patientName: patientProfile?.full_name || 'Patient',
                            recordType: 'Lab Test',
                            testName: test.name,
                            uploadedBy: doctorFullName
                        }
                    })
                }).catch(err => console.error('Email notification failed:', err));
            }

            resetForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error uploading lab test:", error);
            alert("Failed to upload record. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrescriptionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !targetUserId || !doctorName || !prescriptionText) return;

        setIsLoading(true);
        try {
            const { error } = await supabase.from('medical_records').insert({
                user_id: targetUserId,
                record_type: 'prescription',
                date: prescriptionDate || new Date().toISOString().split('T')[0],
                doctor_name: doctorName,
                prescription_text: prescriptionText,
                uploaded_by: role === 'doctor' ? 'doctor' : 'patient',
                doctor_id: role === 'doctor' ? user.id : null,
            });

            if (error) throw error;

            // Send email notification if doctor uploads for patient
            if (role === 'doctor' && patientId) {
                const { data: patientProfile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', patientId)
                    .single();

                fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'medical_record',
                        data: {
                            patientId: patientId,
                            patientName: patientProfile?.full_name || 'Patient',
                            recordType: 'Prescription',
                            testName: 'New Prescription',
                            uploadedBy: doctorName
                        }
                    })
                }).catch(err => console.error('Email notification failed:', err));
            }

            resetForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error uploading prescription:", error);
            alert("Failed to upload prescription. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const availableTests = selectedCategory ? medicalTestsData[selectedCategory] : [];
    const selectedTest = (selectedCategory && selectedTestIndex !== '') ? availableTests[parseInt(selectedTestIndex)] : null;

    const tabConfig = [
        { value: 'doc', label: 'File Upload', icon: FileUp },
        { value: 'lab', label: 'Lab Test', icon: FlaskConical },
        { value: 'prescription', label: 'Prescription', icon: Pill },
    ];

    return (
        <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl pointer-events-none" />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">
                {/* Premium Tab List */}
                <TabsList className="grid w-full grid-cols-3 mb-6 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl h-auto">
                    {tabConfig.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className={cn(
                                "flex items-center gap-2 py-3 rounded-xl transition-all duration-300",
                                "data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600",
                                "data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="font-medium text-sm">{tab.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* File Upload Tab */}
                <TabsContent value="doc">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Record Title</Label>
                            <Input
                                placeholder="e.g. Scanned Report, X-Ray, Previous Prescription"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                className="h-12 bg-white/70 border-slate-200 rounded-xl focus:border-indigo-400 focus:ring-indigo-400/20"
                            />
                        </div>

                        {/* Premium Drag & Drop Zone */}
                        <motion.div
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                                "relative rounded-2xl p-8 cursor-pointer transition-all duration-300 overflow-hidden",
                                "border-2 border-dashed",
                                isDragging
                                    ? "border-indigo-400 bg-indigo-50/50"
                                    : file
                                        ? "border-emerald-400 bg-emerald-50/30"
                                        : "border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:border-indigo-300 hover:bg-indigo-50/30"
                            )}
                        >
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-4 left-4 w-16 h-16 border border-slate-400 rounded-lg transform rotate-12" />
                                <div className="absolute bottom-4 right-4 w-12 h-12 border border-slate-400 rounded-lg transform -rotate-12" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-slate-400 rounded-full" />
                            </div>

                            <div className="relative flex flex-col items-center justify-center text-center">
                                {file ? (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex flex-col items-center gap-3"
                                    >
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                                            <CheckCircle2 className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-700">{file.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Remove
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <>
                                        <motion.div
                                            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 mb-4"
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <CloudUpload className="h-10 w-10 text-indigo-500" />
                                        </motion.div>
                                        <p className="text-base font-semibold text-slate-700 mb-1">Drop your file here</p>
                                        <p className="text-sm text-slate-500 mb-3">or click to browse</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <FileText className="h-3.5 w-3.5" />
                                            <span>PDF, JPG, PNG up to 10MB</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex justify-end gap-3">
                            {onCancel && (
                                <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl px-6">
                                    Cancel
                                </Button>
                            )}
                            <Button
                                onClick={handleDocumentSubmit}
                                disabled={isLoading || !file || !docTitle}
                                className="rounded-xl px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                Upload File
                            </Button>
                        </div>
                    </motion.div>
                </TabsContent>

                {/* Lab Test Tab */}
                <TabsContent value="lab">
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleLabSubmit}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">Category</Label>
                                <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setSelectedTestIndex(''); setTestValues({}); }}>
                                    <SelectTrigger className="h-12 bg-white/70 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(MEDICAL_TESTS).map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">Test Name</Label>
                                <Select value={selectedTestIndex} onValueChange={setSelectedTestIndex} disabled={!selectedCategory}>
                                    <SelectTrigger className="h-12 bg-white/70 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="Select Test" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTests.map((test, idx) => (
                                            <SelectItem key={idx} value={idx.toString()}>{test.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                Date of Test
                            </Label>
                            <Input
                                type="date"
                                value={testDate}
                                onChange={(e) => setTestDate(e.target.value)}
                                required
                                className="h-12 bg-white/70 border-slate-200 rounded-xl"
                            />
                        </div>

                        {/* Test Parameters */}
                        <AnimatePresence>
                            {selectedTest && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 p-5 space-y-4 overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="h-4 w-4 text-indigo-500" />
                                        <h3 className="font-semibold text-indigo-700">Enter Results</h3>
                                    </div>
                                    {selectedTest.parameters.map((param, idx) => (
                                        <motion.div
                                            key={param.name}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="space-y-2"
                                        >
                                            <div className="flex justify-between items-center">
                                                <Label className="text-sm font-medium text-slate-700">{param.name}</Label>
                                                <span className="text-xs text-slate-500 bg-white/50 px-2 py-1 rounded-full">
                                                    Normal: {param.range} {param.unit}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="text"
                                                    placeholder="Enter value"
                                                    value={testValues[param.name] || ''}
                                                    onChange={(e) => setTestValues(prev => ({ ...prev, [param.name]: e.target.value }))}
                                                    className="h-11 bg-white border-slate-200 rounded-xl flex-1"
                                                />
                                                <span className="text-sm text-slate-500 font-medium w-16">{param.unit}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-4 flex justify-end gap-3">
                            {onCancel && (
                                <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl px-6">
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isLoading || !selectedTest}
                                className="rounded-xl px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                            >
                                {isLoading ? <LoadingSpinner size={16} className="mr-2 text-white" /> : <FlaskConical className="h-4 w-4 mr-2" />}
                                Save Record
                            </Button>
                        </div>
                    </motion.form>
                </TabsContent>

                {/* Prescription Tab */}
                <TabsContent value="prescription">
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handlePrescriptionSubmit}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-slate-400" />
                                    Doctor&apos;s Name
                                </Label>
                                <Input
                                    placeholder="Dr. Smith"
                                    value={doctorName}
                                    onChange={(e) => setDoctorName(e.target.value)}
                                    required
                                    className="h-12 bg-white/70 border-slate-200 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    Date
                                </Label>
                                <Input
                                    type="date"
                                    value={prescriptionDate}
                                    onChange={(e) => setPrescriptionDate(e.target.value)}
                                    required
                                    className="h-12 bg-white/70 border-slate-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Prescription Details</Label>
                            <Textarea
                                placeholder="Enter medications, dosage, and instructions..."
                                className="min-h-[150px] bg-white/70 border-slate-200 rounded-xl resize-none"
                                value={prescriptionText}
                                onChange={(e) => setPrescriptionText(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            {onCancel && (
                                <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl px-6">
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-xl px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pill className="h-4 w-4 mr-2" />}
                                Save Prescription
                            </Button>
                        </div>
                    </motion.form>
                </TabsContent>
            </Tabs>
        </div>
    );
}
