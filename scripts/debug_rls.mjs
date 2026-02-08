
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmlkctgcyiabttpnbacw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbGtjdGdjeWlhYnR0cG5iYWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDg5ODAsImV4cCI6MjA4NTk4NDk4MH0.l8bJ0kHi0QcmqjmV64KD9ExhCVqGhI2lbpi38ZG4il8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log('Checking records with Anon Key (simulating actions.ts)...');
    const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Records returned:', data.length);
        console.log('Data:', data);
    }
}

checkRLS();
