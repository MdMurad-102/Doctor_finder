const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Allow all origins for development (Android emulator needs this)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url} from ${req.ip}`);
    next();
});

// Create Gmail SMTP transporter (using your working SMTP settings)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
        user: 'fhmurad420@gmail.com',
        pass: 'bymg gjix wifu rrqp' // Your app password
    }
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection Error:', error);
    } else {
        console.log('✅ SMTP Server is ready to send emails');
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'Email server running',
        smtp: 'Gmail SMTP (465/SSL)',
        email: 'fhmurad420@gmail.com'
    });
});

// Send appointment confirmation email
app.post('/send-appointment-email', async (req, res) => {
    try {
        console.log('📧 Received email request:', {
            patientEmail: req.body.patientEmail,
            patientName: req.body.patientName
        });

        const {
            patientEmail,
            patientName,
            doctorName,
            doctorDegree,
            department,
            hospital,
            appointmentDate,
            appointmentTime,
            appointmentDuration,
            serialNumber,
            acceptedAt
        } = req.body;

        // Validate required fields
        if (!patientEmail || !patientName) {
            console.error('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: patientEmail, patientName'
            });
        }

        // HTML email template
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Appointment Confirmed!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333333;">Dear <strong>${patientName}</strong>,</p>
              <p style="font-size: 16px; color: #555555;">Great news! Your appointment request has been confirmed.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F9FA; border-radius: 8px; border-left: 4px solid #007AFF; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <div style="background-color: #007AFF; color: #ffffff; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px;">
                      Serial Number: ${serialNumber}
                    </div>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px;">👨‍⚕️ <strong>Doctor:</strong></td>
                        <td style="color: #333333; font-size: 14px; text-align: right;">${doctorName}${doctorDegree ? ', ' + doctorDegree : ''}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">🏥 <strong>Department:</strong></td>
                        <td style="color: #333333; font-size: 14px; text-align: right;">${department}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">🏩 <strong>Hospital:</strong></td>
                        <td style="color: #333333; font-size: 14px; text-align: right;">${hospital}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding-top: 15px;">📅 <strong>Date:</strong></td>
                        <td style="color: #333333; font-size: 14px; font-weight: bold; text-align: right; padding-top: 15px;">${appointmentDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">⏰ <strong>Time:</strong></td>
                        <td style="color: #333333; font-size: 14px; font-weight: bold; text-align: right;">${appointmentTime}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">⏱️ <strong>Duration:</strong></td>
                        <td style="color: #333333; font-size: 14px; text-align: right;">${appointmentDuration}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">⚠️ Important Reminders:</p>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px;">
                  <li>Please arrive 15 minutes before your appointment time</li>
                  <li>Bring your ID and any relevant medical records</li>
                  <li>Note your serial number: <strong>${serialNumber}</strong></li>
                  <li>Contact the hospital if you need to cancel or reschedule</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; color: #333333;">Best regards,<br><strong style="color: #007AFF;">Doctor Finder Team</strong></p>
              <p style="font-size: 12px; color: #999999;">Confirmed on ${acceptedAt}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        // Plain text version
        const textContent = `
Dear ${patientName},

Great news! Your appointment has been confirmed.

APPOINTMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Serial Number: ${serialNumber}
Doctor: ${doctorName}${doctorDegree ? ', ' + doctorDegree : ''}
Department: ${department}
Hospital: ${hospital}

📅 Date: ${appointmentDate}
⏰ Time: ${appointmentTime}
⏱️ Duration: ${appointmentDuration}

IMPORTANT REMINDERS:
• Please arrive 15 minutes before your appointment time
• Bring your ID and any relevant medical records
• Note your serial number: ${serialNumber}
• Contact the hospital if you need to cancel or reschedule

Best regards,
Doctor Finder Team

Confirmed on ${acceptedAt}
    `;

        // Send email using nodemailer
        const info = await transporter.sendMail({
            from: '"Doctor Finder App" <fhmurad420@gmail.com>',
            to: patientEmail,
            subject: 'Appointment Confirmed - Doctor Finder App',
            text: textContent,
            html: htmlContent
        });

        console.log('✅ Email sent:', info.messageId);
        console.log('📧 Sent to:', patientEmail);

        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId,
            to: patientEmail
        });

    } catch (error) {
        console.error('❌ Email error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server - Listen on all interfaces (0.0.0.0) for Android emulator access
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Email server running on:`);
    console.log(`   - http://localhost:${PORT} (iOS Simulator)`);
    console.log(`   - http://10.0.2.2:${PORT} (Android Emulator)`);
    console.log(`📧 Using Gmail SMTP: fhmurad420@gmail.com`);
    console.log(`🔒 SSL Port: 465`);
});
