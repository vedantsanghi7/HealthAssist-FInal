// Email Templates - These are pure functions that return HTML strings
// They are used by the email server action

export function getAppointmentBookedEmailTemplate(
    patientName: string,
    doctorName: string,
    specialty: string,
    date: string,
    time: string
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .appointment-card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .appointment-card h3 { margin: 0 0 15px 0; color: #1e293b; }
            .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .detail:last-child { border-bottom: none; }
            .label { color: #64748b; font-size: 14px; }
            .value { color: #1e293b; font-weight: 600; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
            .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 Appointment Booked</h1>
            </div>
            <div class="content">
                <p>Hello <strong>${patientName}</strong>,</p>
                <p>Your appointment has been successfully scheduled. Here are the details:</p>
                
                <div class="appointment-card">
                    <h3>📋 Appointment Details</h3>
                    <div class="detail">
                        <span class="label">Doctor</span>
                        <span class="value">Dr. ${doctorName}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Specialty</span>
                        <span class="value">${specialty}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Date</span>
                        <span class="value">${date}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Time</span>
                        <span class="value">${time}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Status</span>
                        <span class="value" style="color: #f59e0b;">⏳ Pending Confirmation</span>
                    </div>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">You will receive another email once the doctor confirms your appointment.</p>
            </div>
            <div class="footer">
                <p>© 2026 HealthAssist. All rights reserved.</p>
                <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function getAppointmentConfirmedEmailTemplate(
    patientName: string,
    doctorName: string,
    specialty: string,
    date: string,
    time: string
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .appointment-card { background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #bbf7d0; }
            .appointment-card h3 { margin: 0 0 15px 0; color: #166534; }
            .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dcfce7; }
            .detail:last-child { border-bottom: none; }
            .label { color: #64748b; font-size: 14px; }
            .value { color: #1e293b; font-weight: 600; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Appointment Confirmed!</h1>
            </div>
            <div class="content">
                <p>Great news, <strong>${patientName}</strong>!</p>
                <p>Your appointment has been confirmed by the doctor. Please mark your calendar:</p>
                
                <div class="appointment-card">
                    <h3>✨ Confirmed Appointment</h3>
                    <div class="detail">
                        <span class="label">Doctor</span>
                        <span class="value">Dr. ${doctorName}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Specialty</span>
                        <span class="value">${specialty}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Date</span>
                        <span class="value">${date}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Time</span>
                        <span class="value">${time}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Status</span>
                        <span class="value" style="color: #10b981;">✓ Confirmed</span>
                    </div>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">Please arrive 10-15 minutes early for your appointment.</p>
            </div>
            <div class="footer">
                <p>© 2026 HealthAssist. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function getNewAppointmentRequestEmailTemplate(
    doctorName: string,
    patientName: string,
    reason: string,
    date: string,
    time: string
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .appointment-card { background: #faf5ff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e9d5ff; }
            .appointment-card h3 { margin: 0 0 15px 0; color: #6b21a8; }
            .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3e8ff; }
            .detail:last-child { border-bottom: none; }
            .label { color: #64748b; font-size: 14px; }
            .value { color: #1e293b; font-weight: 600; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
            .btn { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 New Appointment Request</h1>
            </div>
            <div class="content">
                <p>Hello Dr. <strong>${doctorName}</strong>,</p>
                <p>You have received a new appointment request:</p>
                
                <div class="appointment-card">
                    <h3>👤 Patient Request</h3>
                    <div class="detail">
                        <span class="label">Patient</span>
                        <span class="value">${patientName}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Reason</span>
                        <span class="value">${reason || 'General Consultation'}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Requested Date</span>
                        <span class="value">${date}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Requested Time</span>
                        <span class="value">${time}</span>
                    </div>
                </div>
                
                <p style="text-align: center;">
                    <a href="#" class="btn">Review in Dashboard</a>
                </p>
            </div>
            <div class="footer">
                <p>© 2026 HealthAssist. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function getNewMessageEmailTemplate(
    recipientName: string,
    senderName: string,
    senderRole: 'doctor' | 'patient',
    messagePreview: string
): string {
    const roleLabel = senderRole === 'doctor' ? 'Dr.' : '';
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .message-card { background: #f0fdfa; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #99f6e4; }
            .sender { font-weight: 600; color: #0f766e; margin-bottom: 10px; }
            .preview { color: #1e293b; font-style: italic; line-height: 1.6; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
            .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💬 New Message</h1>
            </div>
            <div class="content">
                <p>Hello <strong>${recipientName}</strong>,</p>
                <p>You have received a new message:</p>
                
                <div class="message-card">
                    <p class="sender">From: ${roleLabel} ${senderName}</p>
                    <p class="preview">"${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}"</p>
                </div>
                
                <p style="text-align: center;">
                    <a href="#" class="btn">View Message</a>
                </p>
            </div>
            <div class="footer">
                <p>© 2026 HealthAssist. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function getNewMedicalRecordEmailTemplate(
    patientName: string,
    recordType: string,
    testName: string,
    uploadedBy: string
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .record-card { background: #fffbeb; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #fde68a; }
            .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fef3c7; }
            .detail:last-child { border-bottom: none; }
            .label { color: #64748b; font-size: 14px; }
            .value { color: #1e293b; font-weight: 600; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
            .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📄 New Medical Record</h1>
            </div>
            <div class="content">
                <p>Hello <strong>${patientName}</strong>,</p>
                <p>A new medical record has been added to your profile:</p>
                
                <div class="record-card">
                    <div class="detail">
                        <span class="label">Record Type</span>
                        <span class="value">${recordType}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Test/Document Name</span>
                        <span class="value">${testName}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Uploaded By</span>
                        <span class="value">${uploadedBy}</span>
                    </div>
                </div>
                
                <p style="text-align: center;">
                    <a href="#" class="btn">View Record</a>
                </p>
            </div>
            <div class="footer">
                <p>© 2026 HealthAssist. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function getAppointmentDeclinedEmailTemplate(
    patientName: string,
    doctorName: string,
    date: string
): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Appointment Request Declined</h2>
        <p>Hello ${patientName},</p>
        <p>We're sorry to inform you that your appointment request with Dr. ${doctorName} for ${date} has been declined.</p>
        <p>Please try booking another time slot or consult with a different specialist.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">© 2026 HealthAssist. All rights reserved.</p>
    </div>
    `;
}
