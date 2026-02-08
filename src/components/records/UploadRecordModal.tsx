'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UploadRecordForm } from './UploadRecordForm';

interface UploadRecordModalProps {
    onRecordAdded?: () => void;
    children?: React.ReactNode;
    patientId?: string; // Optional: If provided, uploads for this patient (for doctors)
}

export function UploadRecordModal({ onRecordAdded, children, patientId }: UploadRecordModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSuccess = () => {
        setIsOpen(false);
        if (onRecordAdded) onRecordAdded();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Upload Record
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>Upload Medical Record</DialogTitle>
                    {patientId && <DialogDescription className="text-blue-600 font-medium">Uploading for patient ID: {patientId.slice(0, 8)}</DialogDescription>}
                </DialogHeader>

                <UploadRecordForm
                    patientId={patientId}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsOpen(false)}
                />

            </DialogContent>
        </Dialog>
    );
}
