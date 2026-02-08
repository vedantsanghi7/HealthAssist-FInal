import { supabase } from '@/lib/supabase/supabaseClient';

export const addDummyRecords = async (userId: string) => {
    const dates = [
        new Date(), // Today
        new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)  // 3 days ago
    ];

    const records = dates.map((date, index) => {
        // Generate random variations
        const heartRate = 70 + Math.floor(Math.random() * 20); // 70-90
        const systolic = 115 + Math.floor(Math.random() * 15); // 115-130
        const diastolic = 75 + Math.floor(Math.random() * 10); // 75-85
        const weight = 70 + Math.random() * 2 - 1; // around 70kg

        // Vitamin D (20-50 ng/mL is normal/insufficient range)
        const vitD = 30 + Math.floor(Math.random() * 10);
        // Vitamin B12 (200-900 pg/mL)
        const vitB12 = 400 + Math.floor(Math.random() * 100);

        // We'll create two records per day: Vitals and Vitamin Panel to show variety
        return [
            {
                user_id: userId,
                record_type: 'lab_test',
                test_category: 'Self Upload',
                test_name: 'Vital Signs',
                date: date.toISOString(),
                uploaded_by: 'patient',
                file_url: null, // No actual file
                test_results: {
                    "Heart Rate": { value: heartRate, unit: 'bpm' },
                    "Blood Pressure": { systolic: systolic, diastolic: diastolic, unit: 'mmHg' },
                    "Weight": { value: parseFloat(weight.toFixed(1)), unit: 'kg' }
                }
            },
            {
                user_id: userId,
                record_type: 'lab_test',
                test_category: 'Self Upload',
                test_name: 'Vitamin Panel',
                date: date.toISOString(), // Same date
                uploaded_by: 'patient',
                file_url: null,
                test_results: {
                    "Vitamin D": { value: vitD, unit: 'ng/mL' },
                    "Vitamin B12": { value: vitB12, unit: 'pg/mL' }
                }
            }
        ];
    }).flat();

    try {
        const { error } = await supabase
            .from('medical_records')
            .insert(records);

        if (error) {
            console.error('Error inserting dummy records:', error);
            throw error;
        }
        return { success: true };
    } catch (err) {
        console.error('Unexpected error adding dummy data:', err);
        return { success: false, error: err };
    }
};
