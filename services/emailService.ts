/**
 * Email Service using SMTP via Backend API
 * For React Native, we use a backend endpoint to send emails via Gmail SMTP
 */
import { Platform } from 'react-native';

// Email server URL based on platform
const getEmailServerUrl = () => {
    // For iOS Simulator and web: use localhost
    // For Android Emulator: use 10.0.2.2 (special alias for host machine)
    // For Physical Device: use your computer's local IP (change this!)
    // For production: replace with your deployed server URL (e.g., https://your-app.onrender.com)

    if (Platform.OS === 'android') {
        // Try Android emulator address first
        // return 'http://10.0.2.2:3000';

        // If using physical Android device, uncomment and use your computer's IP:
        return 'http://192.168.1.110:3000';
    }
    return 'http://localhost:3000';
};

const EMAIL_SERVER_URL = getEmailServerUrl();

// Email configuration from environment
const EMAIL_CONFIG = {
    fromEmail: 'fhmurad420@gmail.com',
    fromName: 'Doctor Finder App',
    // SMTP Settings (matches your .env)
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: 'fhmurad420@gmail.com',
    smtpPass: 'bymg gjix wifu rrqp', // Your Gmail app password from .env
};

/**
 * Send booking acceptance email to patient
 * Calls our local Node.js email server that uses Gmail SMTP
 */
export const sendAcceptanceEmail = async (bookingData: {
    patientEmail: string;
    patientName: string;
    doctorName: string;
    doctorDegree?: string;
    department: string;
    hospital: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentDuration: string;
    serialNumber: string;
    acceptedAt: string;
}) => {
    try {
        console.log('📧 Sending email to:', bookingData.patientEmail);
        console.log('🔗 Email server URL:', EMAIL_SERVER_URL);
        console.log('📱 Platform:', Platform.OS);

        // First, test if server is reachable
        console.log('🔍 Testing server connection...');
        const healthCheck = await fetch(`${EMAIL_SERVER_URL}/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        }).catch(err => {
            console.error('❌ Cannot reach email server:', err.message);
            throw new Error(`Email server not reachable at ${EMAIL_SERVER_URL}. Make sure it's running: cd email-server && npm start`);
        });

        if (!healthCheck.ok) {
            throw new Error(`Email server returned status ${healthCheck.status}`);
        }

        console.log('✅ Server is reachable');

        // Now send the email
        console.log('📤 Sending email request...');
        const response = await fetch(`${EMAIL_SERVER_URL}/send-appointment-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ Email sent successfully to:', bookingData.patientEmail);
            console.log('✅ Message ID:', result.messageId);
            return { success: true, message: 'Email sent successfully' };
        } else {
            console.error('❌ Email Server Error:', result.error);
            throw new Error(result.error || 'Failed to send email');
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error sending email:', errorMessage);
        console.error('📧 Patient email:', bookingData.patientEmail);
        console.error('👤 Patient name:', bookingData.patientName);
        console.error('💡 Troubleshooting:');
        console.error('   1. Make sure email server is running: cd email-server && npm start');
        console.error('   2. Server should show: 🚀 Email server running on http://10.0.2.2:3000');
        console.error('   3. Android emulator uses: http://10.0.2.2:3000');
        console.error('   4. Physical device needs computer IP (e.g., http://192.168.1.110:3000)');

        return { success: false, error: errorMessage };
    }
};

/**
 * Generate HTML email template
 */
const generateAcceptanceEmailHTML = (data: any): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                ✅ Appointment Confirmed!
              </h1>
              <p style="color: #E3F2FD; margin: 10px 0 0 0; font-size: 16px;">
                Your appointment has been accepted by the doctor
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
                Dear <strong>${data.patientName}</strong>,
              </p>

              <p style="font-size: 16px; color: #555555; line-height: 1.6; margin: 0 0 30px 0;">
                Great news! Your appointment request has been confirmed. Here are your appointment details:
              </p>

              <!-- Appointment Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F9FA; border-radius: 8px; border-left: 4px solid #007AFF; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    
                    <!-- Serial Number (Prominent) -->
                    <div style="background-color: #007AFF; color: #ffffff; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 20px;">
                      Serial Number: ${data.serialNumber}
                    </div>

                    <!-- Doctor Info -->
                    <table width="100%" cellpadding="8" cellspacing="0" style="margin-top: 15px;">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                          👨‍⚕️ <strong>Doctor:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 0; text-align: right;">
                          ${data.doctorName}${data.doctorDegree ? `, ${data.doctorDegree}` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                          🏥 <strong>Department:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 0; text-align: right;">
                          ${data.department}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                          🏩 <strong>Hospital:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 0; text-align: right;">
                          ${data.hospital}
                        </td>
                      </tr>
                      <tr style="background-color: #FFF9E6;">
                        <td style="color: #666666; font-size: 14px; padding: 12px 8px; border-top: 2px solid #FFD700;">
                          📅 <strong>Date:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; font-weight: bold; padding: 12px 8px; text-align: right; border-top: 2px solid #FFD700;">
                          ${data.appointmentDate}
                        </td>
                      </tr>
                      <tr style="background-color: #FFF9E6;">
                        <td style="color: #666666; font-size: 14px; padding: 12px 8px;">
                          ⏰ <strong>Time:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; font-weight: bold; padding: 12px 8px; text-align: right;">
                          ${data.appointmentTime}
                        </td>
                      </tr>
                      <tr style="background-color: #FFF9E6;">
                        <td style="color: #666666; font-size: 14px; padding: 12px 8px; border-bottom: 2px solid #FFD700;">
                          ⏱️ <strong>Duration:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; padding: 12px 8px; text-align: right; border-bottom: 2px solid #FFD700;">
                          ${data.appointmentDuration}
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Important Instructions -->
              <div style="background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold; font-size: 14px;">
                  ⚠️ Important Reminders:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px;">
                  <li style="margin-bottom: 8px;">Please arrive 15 minutes before your appointment time</li>
                  <li style="margin-bottom: 8px;">Bring your ID and any relevant medical records</li>
                  <li style="margin-bottom: 8px;">Note your serial number: <strong>${data.serialNumber}</strong></li>
                  <li>If you need to cancel or reschedule, please inform us at least 24 hours in advance</li>
                </ul>
              </div>

              <!-- Contact Info -->
              <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                If you have any questions or need to make changes to your appointment, please contact the hospital directly or reach out to us through the app.
              </p>

              <p style="font-size: 16px; color: #333333; margin: 0;">
                We look forward to seeing you!
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                Best regards,<br>
                <strong style="color: #007AFF;">Doctor Finder Team</strong>
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #999999;">
                Confirmed on ${data.acceptedAt}
              </p>
              <p style="margin: 15px 0 0 0; font-size: 11px; color: #AAAAAA;">
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Simple text version for email clients that don't support HTML
 */
const generateAcceptanceEmailText = (data: any): string => {
    return `
APPOINTMENT CONFIRMED

Dear ${data.patientName},

Great news! Your appointment request has been confirmed.

APPOINTMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Serial Number: ${data.serialNumber}
Doctor: ${data.doctorName}${data.doctorDegree ? `, ${data.doctorDegree}` : ''}
Department: ${data.department}
Hospital: ${data.hospital}

Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
Duration: ${data.appointmentDuration}

IMPORTANT REMINDERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Please arrive 15 minutes before your appointment time
• Bring your ID and any relevant medical records
• Note your serial number: ${data.serialNumber}
• If you need to cancel or reschedule, please inform us at least 24 hours in advance

If you have any questions, please contact the hospital directly or reach out through the app.

We look forward to seeing you!

Best regards,
Doctor Finder Team

Confirmed on ${data.acceptedAt}

---
This is an automated email. Please do not reply to this message.
  `.trim();
};

export { generateAcceptanceEmailHTML, generateAcceptanceEmailText };
