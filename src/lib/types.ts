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
    verification_status?: 'pending' | 'verified' | 'rejected';
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

export interface AvailabilitySlot {
    day: string;
    startTime: string;
    endTime: string;
    mode: 'online' | 'offline' | 'both';
}

export interface DoctorProfile {
    id?: string;
    user_id: string;
    // Step 1 – Personal
    gender: string;
    bio: string;
    languages: string[];
    // Step 2 – Education & Registration
    degrees: string[];
    specialization_category: string;
    specializations: string[];
    medical_college: string;
    graduation_year: number | null;
    additional_certifications: string;
    registration_number: string;
    medical_council: string;
    // Step 3 – Practice
    experience_years: number | null;
    current_hospitals: string[];
    previous_experience: string;
    clinic_address: string;
    // Step 4 – Availability
    availability: AvailabilitySlot[];
    consultation_mode: 'online' | 'offline' | 'both';
    // Meta
    created_at?: string;
    updated_at?: string;
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
