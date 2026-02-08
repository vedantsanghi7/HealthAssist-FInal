'use server';

import { analyzeMedicalText } from '@/lib/ai/sarvam';
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[WARN] SUPABASE_SERVICE_ROLE_KEY is missing. Medical records fetching might fail due to RLS.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MedicalRecord {
    id: string;
    record_type: 'lab_test' | 'prescription' | 'document';
    date: string;
    doctor_name?: string;
    test_name?: string;
    test_category?: string;
    test_results?: Record<string, unknown>;
    prescription_text?: string;
    file_path?: string;
    status?: string;
    uploaded_by?: string;
}

async function getMedicalRecordsContext(userId: string): Promise<string> {
    try {
        console.log(`[getMedicalRecordsContext] Fetching records for user: ${userId}`);
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        console.log(`[getMedicalRecordsContext] Using Service Role Key: ${hasServiceKey}`);

        // Fetch records for the user
        const { data: records, error } = await supabase
            .from('medical_records')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(20); // Get last 20 records for context

        if (error) {
            console.error('[getMedicalRecordsContext] Error fetching medical records:', error);
            return '';
        }

        console.log(`[getMedicalRecordsContext] Raw records count: ${records?.length}`);
        if (records?.length > 0) {
            console.log(`[getMedicalRecordsContext] First record keys: ${Object.keys(records[0]).join(', ')}`);
        }

        console.log(`[getMedicalRecordsContext] Found ${records?.length || 0} records for user ${userId}`);

        // Detailed log of first record to verify structure if found
        if (records && records.length > 0) {
            console.log('[getMedicalRecordsContext] First record sample:', JSON.stringify(records[0], null, 2));
        }

        if (!records || records.length === 0) {
            console.log('[getMedicalRecordsContext] No records found. RLS might be blocking access if Service Key is missing.');
            return '';
        }

        // Format records in a more readable way for AI
        const formattedRecords = records.map((record: MedicalRecord, index: number) => {
            let formattedRecord = `\n--- Medical Record ${index + 1} ---\n`;
            formattedRecord += `Type: ${record.record_type?.toUpperCase() || 'Unknown'}\n`;
            formattedRecord += `Date: ${record.date || 'Unknown'}\n`;

            if (record.doctor_name) {
                formattedRecord += `Doctor: ${record.doctor_name}\n`;
            }

            if (record.record_type === 'lab_test') {
                let testName = record.test_name;
                let testCategory = record.test_category || 'General';
                let testResultsStr = '';

                // Detailed parsing of test_name and results
                if (record.test_results) {
                    try {
                        const results = typeof record.test_results === 'string'
                            ? JSON.parse(record.test_results)
                            : record.test_results;

                        // Try to find test name in the JSON if not in column
                        if (!testName && typeof results === 'object' && results !== null) {
                            // Common patterns for test name in JSON
                            if ('test_name' in results) testName = results.test_name as string;
                            else if ('name' in results) testName = results.name as string;
                            else if ('title' in results) testName = results.title as string;
                        }

                        if (typeof results === 'object' && results !== null) {
                            testResultsStr += `Test Results Breakdown:\n`;

                            // Flatten simple objects for readability
                            const formatValue = (key: string, value: any, indent = '  ') => {
                                if (typeof value === 'object' && value !== null) {
                                    testResultsStr += `${indent}${key}:\n`;
                                    Object.entries(value).forEach(([k, v]) => formatValue(k, v, indent + '  '));
                                } else {
                                    testResultsStr += `${indent}- ${key}: ${value}\n`;
                                }
                            };

                            Object.entries(results).forEach(([key, value]) => {
                                // Skip redundant name fields in results if we already have the test name
                                if (['test_name', 'name', 'title'].includes(key) && testName) return;
                                formatValue(key, value);
                            });
                        } else {
                            testResultsStr += `Test Results: ${String(results)}\n`;
                        }
                    } catch (e) {
                        testResultsStr += `Test Results (Raw): ${String(record.test_results)}\n`;
                    }
                }

                formattedRecord += `Test Category: ${testCategory}\n`;
                formattedRecord += `Test Name: ${testName || 'Unknown Lab Test'}\n`;

                if (testResultsStr) {
                    formattedRecord += testResultsStr;
                }

            } else if (record.record_type === 'prescription') {
                if (record.prescription_text) {
                    formattedRecord += `Prescription Details:\n${record.prescription_text}\n`;
                }
            } else if (record.record_type === 'document') {
                formattedRecord += `Document Title: ${record.test_name || 'Untitled Document'}\n`;
                if (record.file_path) {
                    formattedRecord += `File Reference: ${record.file_path}\n`;
                }
                // If there's OCR text or summary in test_results, include it
                if (record.test_results) {
                    const results = typeof record.test_results === 'string'
                        ? JSON.parse(record.test_results)
                        : record.test_results;
                    if (results && (results.summary || results.text || results.content)) {
                        formattedRecord += `Document Content: ${results.summary || results.text || results.content}\n`;
                    }
                }
            }

            // Add status if available
            if (record.status) {
                formattedRecord += `Status: ${record.status}\n`;
            }

            return formattedRecord;
        });

        const context = formattedRecords.join('\n');
        console.log('Formatted medical context length:', context.length);
        return context;
    } catch (error) {
        console.error('Error fetching medical records:', error);
        return '';
    }
}

export async function analyzeMedicalTextAction(prompt: string, historyContext?: string, userId?: string, language: string = "English") {
    try {
        console.log(`[analyzeMedicalTextAction] Started. UserId: ${userId}, Language: ${language}`);
        let fullPrompt = prompt;

        // Add medical records context if userId is provided
        let medicalContext = '';
        if (userId) {
            console.log(`[analyzeMedicalTextAction] Fetching medical context for user: ${userId}`);
            medicalContext = await getMedicalRecordsContext(userId);
            console.log(`[analyzeMedicalTextAction] Medical context length: ${medicalContext.length}`);
        } else {
            console.log(`[analyzeMedicalTextAction] No userId provided, skipping medical context.`);
        }

        // Build a conversational prompt for the AI chatbot
        const systemPrompt = `You are a helpful, friendly AI Health Assistant chatbot. You provide medical information, answer health-related questions, and help users understand their health data.

IMPORTANT GUIDELINES:
- Be conversational, warm, and supportive
- Answer questions directly and helpfully
- Use markdown formatting for better readability (bullet points, bold for emphasis, etc.)
- If the user has medical records, reference them when relevant
- Always remind users to consult healthcare professionals for serious concerns
- Be concise but thorough
- Do NOT respond with JSON or structured data - respond naturally like a helpful assistant
- If asked about symptoms, provide general information but recommend seeing a doctor

${medicalContext ? `=== PATIENT MEDICAL RECORDS ===
The following are the patient's actual medical records. Reference this data when relevant to their questions:
${medicalContext}
=== END OF RECORDS ===` : 'Note: This patient has no medical records on file yet.'}

${historyContext ? `Previous Conversation:
${historyContext}` : ''}

User's Question: ${prompt}

Respond helpfully and conversationally in ${language}:`;

        console.log(`[analyzeMedicalTextAction] Final Prompt Length: ${systemPrompt.length}`);

        const response = await analyzeMedicalText(systemPrompt, language);

        // Return the response directly - no JSON parsing needed for conversational AI
        return response;
    } catch (error) {
        console.error('Server Action Error:', error);
        return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
}

// Language code mapping for Sarvam Translate API
const languageCodeMap: Record<string, string> = {
    "English": "en-IN",
    "Hindi": "hi-IN",
    "Bengali": "bn-IN",
    "Gujarati": "gu-IN",
    "Kannada": "kn-IN",
    "Malayalam": "ml-IN",
    "Marathi": "mr-IN",
    "Oriya": "od-IN",
    "Punjabi": "pa-IN",
    "Tamil": "ta-IN",
    "Telugu": "te-IN",
    "Assamese": "as-IN",
    "Bodo": "brx-IN",
    "Dogri": "doi-IN",
    "Kashmiri": "ks-IN",
    "Konkani": "kok-IN",
    "Maithili": "mai-IN",
    "Manipuri": "mni-IN",
    "Nepali": "ne-IN",
    "Sanskrit": "sa-IN",
    "Santali": "sat-IN",
    "Sindhi": "sd-IN",
    "Urdu": "ur-IN"
};

export async function translateTextAction(text: string, targetLanguage: string): Promise<string | null> {
    try {
        const targetCode = languageCodeMap[targetLanguage];

        if (!targetCode || targetLanguage === "English") {
            // No translation needed for English
            return text;
        }

        const apiKey = process.env.SARVAM_API_KEY;
        if (!apiKey) {
            console.error("[translateTextAction] SARVAM_API_KEY not set");
            return null;
        }

        console.log(`[translateTextAction] Translating to ${targetLanguage} (${targetCode})...`);

        const response = await fetch('https://api.sarvam.ai/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': apiKey,
            },
            body: JSON.stringify({
                input: text,
                source_language_code: "en-IN",
                target_language_code: targetCode,
                model: "sarvam-translate:v1"
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[translateTextAction] API error: ${response.status}`, errorText);
            return null;
        }

        const data = await response.json();
        console.log("[translateTextAction] Translation successful");

        return data.translated_text || null;
    } catch (error) {
        console.error("[translateTextAction] Error:", error);
        return null;
    }
}

export async function seedVitalsAction(userId: string) {
    try {
        console.log(`[seedVitalsAction] Seeding vitals for user: ${userId}`);

        const vitals = [
            {
                user_id: userId,
                record_type: 'lab_test',
                date: new Date().toISOString(),
                test_name: 'Vital Signs',
                test_category: 'Cardiovascular',
                test_results: {
                    heart_rate: { value: 72, unit: 'bpm', status: 'Normal' },
                    blood_pressure: { systolic: 120, diastolic: 80, unit: 'mmHg', status: 'Normal' },
                    oxygen_saturation: { value: 98, unit: '%', status: 'Normal' }
                },
                doctor_name: 'Dr. System (AI)',
                status: 'Final'
            },
            {
                user_id: userId,
                record_type: 'lab_test',
                date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                test_name: 'Vital Signs',
                test_category: 'Cardiovascular',
                test_results: {
                    heart_rate: { value: 75, unit: 'bpm', status: 'Normal' },
                    blood_pressure: { systolic: 122, diastolic: 82, unit: 'mmHg', status: 'Normal' }
                },
                doctor_name: 'Dr. System (AI)',
                status: 'Final'
            }
        ];

        const { error } = await supabase.from('medical_records').insert(vitals);

        if (error) {
            console.error('[seedVitalsAction] Error seeding vitals:', error);
            throw error;
        }

        return { success: true, message: "Vitals added successfully" };
    } catch (error) {
        console.error('[seedVitalsAction] Error:', error);
        return { success: false, message: "Failed to add vitals" };
    }
}

export async function generateHealthScoreAction(userId: string, language: string = "English") {
    try {
        console.log(`[generateHealthScoreAction] Started for user: ${userId}`);

        // 1. Fetch Medical Context
        const medicalContext = await getMedicalRecordsContext(userId);

        if (!medicalContext) {
            return JSON.stringify({
                score: null,
                analysis: "No medical records found to analyze.",
                summary: "Please upload medical records to get a health score.",
                vitals_analysis: null
            });
        }

        // 2. Construct Prompt
        const prompt = `
=== PATIENT MEDICAL RECORDS ===
${medicalContext}
=== END OF RECORDS ===

Analyze the provided medical records and generate a numerical Health Score (0-100) based on the patient's overall health status.

Also provide:
1. A brief analysis of their health (2-3 sentences).
2. A short summary for the dashboard.
3. Specific analysis of their vitals if available.

Return ONLY a JSON object with this structure:
{
    "score": number,
    "analysis": "string (markdown allowed)",
    "summary": "string",
    "vitals_analysis": "string (optional)"
}`;

        // 3. System Prompt for JSON enforcement
        const systemPrompt = `You are a medical AI analyst.
You MUST return valid JSON only.
Do not include any text outside the JSON block.
Do not use markdown formatting for the JSON block itself (no \`\`\`json wrappers).
The JSON must match this schema:
{
    "score": number (0-100),
    "analysis": "string",
    "summary": "string",
    "vitals_analysis": "string or null"
}

Respond in ${language}.`;

        // 4. Call AI
        const result = await analyzeMedicalText(prompt, language, systemPrompt);

        // 5. Parse JSON
        let data;
        let jsonString = "";
        try {
            // Clean up potential markdown wrappers
            const cleanResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
            data = JSON.parse(cleanResult);
            jsonString = cleanResult;
        } catch (e) {
            console.error("Failed to parse AI JSON response:", result);
            // Return a structured error response that the frontend can handle, but as a string to match the return type expectation if needed, or just return the object if I am returning 'any' or specific type.
            // analyzeMedicalTextAction returns string. Here I should probably return stringified JSON to be safe with server actions serialization or just the object.
            // Let's return stringified JSON to be consistent with how some server actions pass data, or just the object.
            // The previous action returned a string (analysis).
            // Let's return the object, but if I need to return a string, I'll stringify it.
            // HealthInsightPanel expects a string from analyzeMedicalTextAction, but here I am creating a NEW action.
            // I will return the object directly.

            return JSON.stringify({
                score: null,
                analysis: result, // Fallback to raw text
                summary: "Analysis generated",
                vitals_analysis: null
            });
        }

        // 6. Persist Score
        if (data.score !== null && typeof data.score === 'number') {
            const { error } = await supabase.from('health_metrics').insert({
                patient_id: userId,
                metric_type: 'health_score',
                value: String(data.score),
                unit: '/100',
                recorded_at: new Date().toISOString()
            });

            if (error) {
                console.error("Failed to save health score:", error);
            } else {
                console.log("Health score saved successfully.");
            }
        }

        return JSON.stringify(data);

    } catch (error) {
        console.error("generateHealthScoreAction Error:", error);
        throw new Error("Failed to generate health score");
    }
}
