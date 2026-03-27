import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Admin supabase client to bypass RLS for this operation
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
        const { doctorId } = body;

        if (!doctorId) {
            return NextResponse.json({ success: false, error: 'Doctor ID is required' }, { status: 400 });
        }

        // Get the current user from auth header to verify they are admin
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // Check if user is healthassist admin
        if (user.email !== 'healthassistpilani@gmail.com') {
            return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        // Fetch doctor profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name, doctor_name')
            .eq('id', doctorId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ success: false, error: 'Doctor profile not found' }, { status: 404 });
        }

        // Update verification_status
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ verification_status: 'verified' })
            .eq('id', doctorId);

        if (updateError) {
            console.error('[Admin Verify] Failed to update profile:', updateError);
            return NextResponse.json({ success: false, error: 'Failed to update database' }, { status: 500 });
        }

        // Send Email
        const doctorEmail = profile.email;
        const doctorName = profile.full_name || profile.doctor_name || 'Doctor';

        if (doctorEmail) {
            try {
                await transporter.sendMail({
                    from: `"HealthAssist" <${process.env.GMAIL}>`,
                    to: doctorEmail,
                    subject: '✅ Account Verified - HealthAssist',
                    html: getDoctorVerifiedTemplate(doctorName),
                });
                console.log(`[Admin Verify] Sent verification email to: ${doctorEmail}`);
            } catch (err) {
                console.error('[Admin Verify] Email sending failed, but DB updated:', err);
                // We still return success but maybe with a warning
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Admin Verify] Error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

function getDoctorVerifiedTemplate(doctorName: string): string {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">✅ Account Verified!</h1>
            </div>
            <div style="padding: 30px;">
                <p>Hello Dr. <strong>${doctorName}</strong>,</p>
                <p>Great news! Your account has been successfully verified by our administrators.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 8px 0; color: #065f46;">You now have full access to your Doctor Dashboard. You can view patient records, accept appointments, and manage your schedule.</p>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/doctor" style="background: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
                © 2026 HealthAssist. All rights reserved.
            </div>
        </div>
    </div>`;
}
