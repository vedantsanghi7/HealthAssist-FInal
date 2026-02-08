'use server';

import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmailAction(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
        if (!process.env.GMAIL || !process.env.GMAIL_APP_PASSWORD) {
            console.warn('[Email] Gmail credentials not configured');
            return { success: false, error: 'Email not configured' };
        }

        await transporter.sendMail({
            from: `"HealthAssist" <${process.env.GMAIL}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
        return { success: true };
    } catch (error) {
        console.error('[Email] Failed to send:', error);
        return { success: false, error: String(error) };
    }
}
