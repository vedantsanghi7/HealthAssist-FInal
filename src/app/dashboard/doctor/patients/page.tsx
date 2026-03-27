'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UploadRecordModal } from '@/components/records/UploadRecordModal';

export default function DoctorPatientsPage() {
    const { user } = useAuth();
    const router = useRouter(); // Use navigation
    const [patients, setPatients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
    const [newPatientEmail, setNewPatientEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch unique patients who have appointments with this doctor
                // We use the appointments table as the source of truth for doctor-patient relationship
                const { data: appointments, error } = await supabase
                    .from('appointments')
                    .select(`
                        patient_id,
                        profiles:patient_id (
                            id,
                            full_name,
                            email,
                            age,
                            gender
                        )
                    `)
                    .eq('doctor_id', user.id);

                if (error) throw error;

                // Extract unique profiles from appointments
                const uniquePatientsMap = new Map();
                appointments?.forEach((app: any) => {
                    if (app.profiles && !uniquePatientsMap.has(app.profiles.id)) {
                        uniquePatientsMap.set(app.profiles.id, app.profiles);
                    }
                });

                setPatients(Array.from(uniquePatientsMap.values()));
            } catch (error) {
                console.error('Error fetching patients:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, [user]);

    // 1. Search Functionality
    const filteredPatients = patients.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddPatient = async () => {
        if (!newPatientEmail) return;
        setLoading(true);
        // Simulate invitation
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`Invitation sent to ${newPatientEmail}!`);
        setIsAddPatientOpen(false);
        setNewPatientEmail('');
        setLoading(false);
    };

    const handleMessage = async (patientId: string) => {
        if (!user) return;

        // Check if conversation exists
        const { data: existingConvs } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${patientId}),and(participant1_id.eq.${patientId},participant2_id.eq.${user.id})`)
            .single();

        if (existingConvs) {
            router.push(`/dashboard/doctor/messages?conversationId=${existingConvs.id}`);
        } else {
            // Create new conversation
            const { data: newConv, error } = await supabase
                .from('conversations')
                .insert({
                    participant1_id: user.id,
                    participant2_id: patientId,
                    last_message: 'Started a new conversation',
                    last_message_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating conversation:', error);
                alert('Failed to start conversation');
            } else if (newConv) {
                router.push(`/dashboard/doctor/messages?conversationId=${newConv.id}`);
            }
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">My Patients</h1>
                <Button onClick={() => setIsAddPatientOpen(true)}>Add New Patient</Button>
            </div>

            <GlassCard className="p-4">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients by name or email..."
                        className="pl-9 max-w-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-md border mt-2">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-4 font-medium text-muted-foreground">Patient</th>
                                <th className="p-4 font-medium text-muted-foreground">Age/Gender</th>
                                <th className="p-4 font-medium text-muted-foreground">Contact</th>
                                <th className="p-4 font-medium text-muted-foreground">Last Visit</th>
                                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{patient.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <span className="font-medium block">{patient.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">ID: #{patient.id.substring(0, 4)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {patient.age || '-'} / {patient.gender || '-'}
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {patient.email}
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {new Date().toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => alert(`Viewing details for ${patient.full_name}\n\nAge: ${patient.age}\nGender: ${patient.gender}\nEmail: ${patient.email}`)}
                                                >
                                                    View
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleMessage(patient.id)}>
                                                    Message
                                                </Button>
                                                <UploadRecordModal patientId={patient.id} onRecordAdded={() => alert('Record uploaded successfully!')}>
                                                    <Button variant="outline" size="sm">Upload</Button>
                                                </UploadRecordModal>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-4 mt-2">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                            <div key={patient.id} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback>{patient.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <span className="font-semibold text-base block">{patient.full_name}</span>
                                        <span className="text-xs text-muted-foreground block">ID: #{patient.id.substring(0, 4)}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm max-w-full">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Age/Gender</span>
                                        <span className="font-medium text-slate-700">{patient.age || '-'} yrs / {patient.gender || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Last Visit</span>
                                        <span className="font-medium text-slate-700">{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col mt-1">
                                        <span className="text-xs text-muted-foreground">Email</span>
                                        <span className="font-medium text-slate-700 truncate">{patient.email}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => alert(`Viewing details for ${patient.full_name}`)}>
                                        View
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200" onClick={() => handleMessage(patient.id)}>
                                        Message
                                    </Button>
                                    <UploadRecordModal patientId={patient.id} onRecordAdded={() => alert('Record uploaded successfully!')}>
                                        <Button variant="outline" size="sm" className="w-full text-xs">Upload</Button>
                                    </UploadRecordModal>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
                            {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Add Patient Modal */}
            <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Patient</DialogTitle>
                        <DialogDescription>
                            Send an invitation to a patient to join your practice.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">Patient Email</label>
                        <Input
                            placeholder="patient@example.com"
                            value={newPatientEmail}
                            onChange={(e) => setNewPatientEmail(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddPatientOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddPatient} disabled={loading || !newPatientEmail}>
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
