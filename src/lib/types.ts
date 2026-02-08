export interface Doctor {
    id: string;
    full_name: string;
    specialization: string;
    hospital_name: string;
    experience_years: number;
}

export interface Patient {
    id: string;
    full_name: string;
    email: string;
    // UI specific properties
    name: string;
    age: number;
    status: 'waiting' | 'in-progress' | 'completed' | 'urgent';
    condition: string;
    lastVisit: string;
}

export interface UserProfile {
    id: string;
    role: 'patient' | 'doctor' | 'admin';
    full_name: string;
    email: string;
    is_onboarded: boolean;
    specialization?: string;
    hospital_name?: string;
    experience_years?: number;
    doctor_name?: string;
    age?: number;
    gender?: string;
}

export interface MedicalRecord {
    id: string;
    user_id: string;
    type: string;
    record_type: string;
    test_name: string;
    date: string;
    file_url: string;
    uploaded_by: 'doctor' | 'patient';
    created_at: string;
    test_results?: string | Record<string, any>; // JSON string or object
}

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_date: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    reason?: string;
    created_at: string;
    profiles?: {
        full_name: string;
        age: number;
        gender: string;
    };
}
