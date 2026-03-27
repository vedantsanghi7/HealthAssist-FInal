import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        // Validate environment variables
        if (!process.env.GMAIL || !process.env.GMAIL_APP_PASSWORD) {
            console.warn('[Email API] Gmail credentials not configured');
            return NextResponse.json({ success: true, message: 'Email not configured' });
        }

        switch (type) {
            case 'appointment_booked':
                await handleAppointmentBooked(data);
                break;
            case 'appointment_confirmed':
                await handleAppointmentConfirmed(data);
                break;
            case 'appointment_declined':
                await handleAppointmentDeclined(data);
                break;
            case 'new_message':
                await handleNewMessage(data);
                break;
            case 'medical_record':
                await handleMedicalRecord(data);
                break;
            case 'admin_doctor_signup_notification':
                await handleAdminDoctorSignupNotification(data);
                break;
            default:
                console.log('[Email API] Unknown email type:', type);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Email API] Error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

// Helper to get user email from Supabase
async function getUserEmail(userId: string): Promise<string | null> {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (error || !data?.user?.email) return null;
        return data.user.email;
    } catch {
        return null;
    }
}

// Helper to get user profile
async function getUserProfile(userId: string): Promise<{ full_name?: string; specialization?: string } | null> {
    try {
        const { data } = await supabaseAdmin
            .from('profiles')
            .select('full_name, specialization')
            .eq('id', userId)
            .single();
        return data;
    } catch {
        return null;
    }
}

async function handleAppointmentBooked(data: {
    patientId: string;
    doctorId: string;
    patientName: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    reason?: string;
}) {
    // Email to patient
    const patientEmail = await getUserEmail(data.patientId);
    if (patientEmail) {
        await transporter.sendMail({
            from: `"HealthAssist" <${process.env.GMAIL}>`,
            to: patientEmail,
            subject: '📅 Appointment Booked - HealthAssist',
            html: getAppointmentBookedTemplate(data.patientName, data.doctorName, data.specialty, data.date, data.time),
        });
        console.log(`[Email] Sent appointment booked to patient: ${patientEmail}`);
    }

    // Email to doctor
    const doctorEmail = await getUserEmail(data.doctorId);
    if (doctorEmail) {
        await transporter.sendMail({
            from: `"HealthAssist" <${process.env.GMAIL}>`,
            to: doctorEmail,
            subject: '📋 New Appointment Request - HealthAssist',
            html: getNewAppointmentRequestTemplate(data.doctorName, data.patientName, data.reason || 'General Consultation', data.date, data.time),
        });
        console.log(`[Email] Sent new appointment request to doctor: ${doctorEmail}`);
    }
}

async function handleAppointmentConfirmed(data: {
    patientId: string;
    patientName: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
}) {
    const patientEmail = await getUserEmail(data.patientId);
    if (patientEmail) {
        await transporter.sendMail({
            from: `"HealthAssist" <${process.env.GMAIL}>`,
            to: patientEmail,
            subject: '✅ Appointment Confirmed - HealthAssist',
            html: getAppointmentConfirmedTemplate(data.patientName, data.doctorName, data.specialty, data.date, data.time),
        });
        console.log(`[Email] Sent appointment confirmed to: ${patientEmail}`);
    }
}

async function handleAppointmentDeclined(data: {
    patientId: string;
    patientName: string;
    doctorName: string;
    date: string;
}) {
    const patientEmail = await getUserEmail(data.patientId);
    if (patientEmail) {
        await transporter.sendMail({
            from: `"HealthAssist" <${process.env.GMAIL}>`,
            to: patientEmail,
            subject: '❌ Appointment Declined - HealthAssist',
            html: getAppointmentDeclinedTemplate(data.patientName, data.doctorName, data.date),
        });
        console.log(`[Email] Sent appointment declined to: ${patientEmail}`);
    }
}

async function handleNewMessage(data: {
    senderId: string;
    recipientId: string;
    senderName: string;
    senderRole: 'doctor' | 'patient';
    messagePreview: string;
}) {
    const recipientEmail = await getUserEmail(data.recipientId);
    const recipientProfile = await getUserProfile(data.recipientId);

    if (recipientEmail) {
        await transporter.sendMail({
            from: `"HealthAssist" <${process.env.GMAIL}>`,
            to: recipientEmail,
            subject: `💬 New message from ${data.senderRole === 'doctor' ? 'Dr. ' : ''}${data.senderName} - HealthAssist`,
            html: getNewMessageTemplate(recipientProfile?.full_name || 'User', data.senderName, data.senderRole, data.messagePreview),
        });
        console.log(`[Email] Sent new message notification to: ${recipientEmail}`);
    }
}

async function handleMedicalRecord(data: {
    patientId: string;
    patientName: string;
    recordType: string;
    testName: string;
    uploadedBy: string;
}) {
    const patientEmail = await getUserEmail(data.patientId);
    if (patientEmail) {
        await transporter.sendMail({
            from: `"HealthAssist" <${process.env.GMAIL}>`,
            to: patientEmail,
            subject: '📄 New Medical Record Added - HealthAssist',
            html: getMedicalRecordTemplate(data.patientName, data.recordType, data.testName, data.uploadedBy),
        });
        console.log(`[Email] Sent medical record notification to: ${patientEmail}`);
    }
}

async function handleAdminDoctorSignupNotification(data: {
    doctorId: string;
    doctorName: string;
    email: string;
    specialization: string;
    experience: string;
}) {
    const adminEmail = 'healthassistpilani@gmail.com';
    await transporter.sendMail({
        from: `"HealthAssist" <${process.env.GMAIL}>`,
        to: adminEmail,
        subject: '⚠️ New Doctor Signup Pending Verification - HealthAssist',
        html: getAdminDoctorSignupNotificationTemplate(data.doctorId, data.doctorName, data.email, data.specialization, data.experience),
    });
    console.log(`[Email] Sent admin notification for new doctor: ${data.doctorName}`);
}

// Email Templates
function getAppointmentBookedTemplate(patientName: string, doctorName: string, specialty: string, date: string, time: string): string {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🏥 Appointment Booked</h1>
            </div>
            <div style="padding: 30px;">
                <p>Hello <strong>${patientName}</strong>,</p>
                <p>Your appointment has been successfully scheduled!</p>
                <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
                    <p style="margin: 8px 0;"><strong>Specialty:</strong> ${specialty}</p>
                    <p style="margin: 8px 0;"><strong>Date:</strong> ${date}</p>
                    <p style="margin: 8px 0;"><strong>Time:</strong> ${time}</p>
                    <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">⏳ Pending Confirmation</span></p>
                </div>
                <p style="color: #64748b; font-size: 14px;">You'll receive another email once the doctor confirms your appointment.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
                © 2026 HealthAssist. All rights reserved.
            </div>
        </div>
    </div>`;
}

function getAppointmentConfirmedTemplate(patientName: string, doctorName: string, specialty: string, date: string, time: string): string {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">✅ Appointment Confirmed!</h1>
            </div>
            <div style="padding: 30px;">
                <p>Great news, <strong>${patientName}</strong>!</p>
                <p>Your appointment has been confirmed by the doctor.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
                    <p style="margin: 8px 0;"><strong>Specialty:</strong> ${specialty}</p>
                    <p style="margin: 8px 0;"><strong>Date:</strong> ${date}</p>
                    <p style="margin: 8px 0;"><strong>Time:</strong> ${time}</p>
                    <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #10b981;">✓ Confirmed</span></p>
                </div>
                <p style="color: #64748b; font-size: 14px;">Please arrive 10-15 minutes early for your appointment.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
                © 2026 HealthAssist. All rights reserved.
            </div>
        </div>
    </div>`;
}

function getAppointmentDeclinedTemplate(patientName: string, doctorName: string, date: string): string {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">❌ Appointment Declined</h1>
            </div>
            <div style="padding: 30px;">
                <p>Hello <strong>${patientName}</strong>,</p>
                <p>Unfortunately, your appointment request with Dr. ${doctorName} for ${date} has been declined.</p>
                <p>Please try booking another time slot or consult with a different specialist.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
                © 2026 HealthAssist. All rights reserved.
            </div>
        </div>
    </div>`;
}

function getNewAppointmentRequestTemplate(doctorName: string, patientName: string, reason: string, date: string, time: string): string {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">📋 New Appointment Request</h1>
            </div>
            <div style="padding: 30px;">
                <p>Hello Dr. <strong>${doctorName}</strong>,</p>
                <p>You have a new appointment request:</p>
                <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong>Patient:</strong> ${patientName}</p>
                    <p style="margin: 8px 0;"><strong>Reason:</strong> ${reason}</p>
                    <p style="margin: 8px 0;"><strong>Date:</strong> ${date}</p>
                    <p style="margin: 8px 0;"><strong>Time:</strong> ${time}</p>
                </div>
                <p style="color: #64748b; font-size: 14px;">Please log in to your dashboard to accept or decline this request.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
                © 2026 HealthAssist. All rights reserved.
            </div>
        </div>
    </div>`;
}

function getNewMessageTemplate(recipientName: string, senderName: string, senderRole: 'doctor' | 'patient', messagePreview: string): string {
    const roleLabel = senderRole === 'doctor' ? 'Dr. ' : '';
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">💬 New Message</h1>
            </div>
            <div style="padding: 30px;">
                <p>Hello <strong>${recipientName}</strong>,</p>
                <p>You have received a new message:</p>
                <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #0f766e;">From: ${roleLabel}${senderName}</p>
                    <p style="margin: 0; color: #1e293b; font-style: italic;">"${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}"</p>
                </div>
                <p style="color: #64748b; font-size: 14px;">Log in to your dashboard to view and reply to this message.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
                © 2026 HealthAssist. All rights reserved.
            </div>
        </div>
    </div>`;
}

function getMedicalRecordTemplate(patientName: string, recordType: string, testName: string, uploadedBy: string): string {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">📄 New Medical Record</h1>
            </div>
            <div style="padding: 30px;">
                <p>Hello <strong>${patientName}</strong>,</p>
                <p>A new medical record has been added to your profile:</p>
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong>Type:</strong> ${recordType}</p>
                    <p style="margin: 8px 0;"><strong>Name:</strong> ${testName}</p>
                    <p style="margin: 8px 0;"><strong>Uploaded by:</strong> ${uploadedBy}</p>
                </div>
                <p style="color: #64748b; font-size: 14px;">Log in to your dashboard to view the full record.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
                © 2026 HealthAssist. All rights reserved.
            </div>
        </div>
    </div>`;
}

function getAdminDoctorSignupNotificationTemplate(doctorId: string, doctorName: string, email: string, specialization: string, experience: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/admin/verify?doctorId=${doctorId}`;
    
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">⚠️ Verification Pending for New Doctor</h1>
            </div>
            <div style="padding: 30px;">
                <p>Hello Admin,</p>
                <p>A new doctor has completed their onboarding and requires manual verification.</p>
                <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong>Name:</strong> Dr. ${doctorName}</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 8px 0;"><strong>Specialization:</strong> ${specialization}</p>
                    <p style="margin: 8px 0;"><strong>Experience:</strong> ${experience}</p>
                    <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #ea580c;">Verification Pending</span></p>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${verifyUrl}" style="background: #ea580c; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Doctor</a>
                </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
                © 2026 HealthAssist. All rights reserved.
            </div>
        </div>
    </div>`;
}
