// Sarvam AI Integration for Indian Languages & Medical Context
import { SarvamAIClient } from "sarvamai";

const apiKey = process.env.SARVAM_API_KEY;

if (!apiKey) {
    console.warn("SARVAM_API_KEY is not set. Please add it to your .env.local file.");
}

// Initialize Sarvam AI Client
const client = new SarvamAIClient({
    apiSubscriptionKey: apiKey || "",
});

export async function analyzeMedicalText(prompt: string, language: string = "English", systemPromptOverride?: string): Promise<string> {
    if (!apiKey) {
        return "AI service unavailable. Please set SARVAM_API_KEY in your environment variables.";
    }

    try {
        console.log(`Calling Sarvam AI (Language: ${language})...`);

        const defaultSystemPrompt = `You are an expert medical AI assistant specialized in analyzing health records.
        Your goal is to provide accurate, easy-to-understand health insights.
        
        IMPORTANT: You must respond in the following language: ${language}.
        
        - If the user asks about medical records, use the provided context.
        - If the user asks a general question, answer based on your medical knowledge.
        - Use simple language, bullet points, and clear headings.
        - Always include a disclaimer that you are an AI and they should consult a doctor.`;

        const systemPrompt = systemPromptOverride || defaultSystemPrompt;

        const response = await client.chat.completions({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            // model: "sarvam-m", // Removed as it caused a type error and might be implicit
            temperature: 0.5,
            max_tokens: 800,
        });

        const content = response.choices[0]?.message?.content;
        console.log("Sarvam AI response received successfully");
        return content || "No response from AI";
    } catch (error) {
        console.error("Sarvam AI error:", error);
        return "I encountered an error connecting to the AI service. Please try again in a moment.";
    }
}
