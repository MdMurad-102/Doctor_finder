const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

admin.initializeApp();

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const twilioPhone = functions.config().twilio.phone;

const client = twilio(accountSid, authToken);

// Email transporter using Gmail SMTP with SSL (port 465)
const smtpHost = functions.config().smtp?.host || 'smtp.gmail.com';
const smtpPort = functions.config().smtp?.port || 465;
const smtpUser = functions.config().smtp?.user || 'fhmurad420@gmail.com';
const smtpPass = functions.config().smtp?.pass || 'bymg gjix wifu rrqp';
const smtpFrom = functions.config().smtp?.from || 'fhmurad420@gmail.com';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: Number(smtpPort),
  secure: true, // SSL enabled for port 465
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

// Trigger on booking status change
exports.sendBookingSMS = functions.database
  .ref("/bookings/{doctorId}/{bookingId}/status")
  .onUpdate(async (change, context) => {
    const status = change.after.val();
    const { doctorId, bookingId } = context.params;

    if (status !== "accepted") return null;

    // Get booking details
    const bookingSnap = await admin.database().ref(`/bookings/${doctorId}/${bookingId}`).get();
    const booking = bookingSnap.val();
    if (!booking) return null;

    const message = `Hello ${booking.patientName}, your appointment with Dr. ${booking.doctorName} is confirmed. Serial: ${bookingId}`;

    try {
      await client.messages.create({
        body: message,
        from: twilioPhone,
        to: `+${booking.phone}`, // patient number with country code
      });
      console.log("SMS sent to", booking.phone);
    } catch (error) {
      console.error("SMS send error:", error);
    }

    return null;
  });

// Trigger email on booking status change (accepted or rejected)
exports.sendBookingEmail = functions.database
  .ref("/bookings/{doctorId}/{bookingId}/status")
  .onUpdate(async (change, context) => {
    const status = change.after.val();
    const { doctorId, bookingId } = context.params;

    if (status !== "accepted" && status !== "rejected") return null;

    // Fetch booking
    const bookingSnap = await admin.database().ref(`/bookings/${doctorId}/${bookingId}`).get();
    const booking = bookingSnap.val();
    if (!booking || !booking.email) return null;

    const subject = status === "accepted"
      ? `Appointment Confirmed - Doctor Finder App`
      : `Appointment Update - Doctor Finder App`;

    const textContent = status === "accepted"
      ? `Dear ${booking.patientName},

Great news! Your appointment has been confirmed.

APPOINTMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Serial Number: ${booking.serialNumber || bookingId}
Doctor: ${booking.doctorName || 'Doctor'}
Department: ${booking.department || 'General'}
Hospital: ${booking.hospital || booking.hospitalName || 'Hospital'}

📅 Date: ${booking.appointmentDate || new Date().toLocaleDateString()}
⏰ Time: ${booking.appointmentTime || 'TBD'}
⏱️ Duration: ${booking.appointmentDuration || '20 minutes'}

IMPORTANT REMINDERS:
• Arrive 15 minutes before your appointment time
• Bring your ID and any relevant medical records
• Note your serial number: ${booking.serialNumber || bookingId}
• If you need to cancel or reschedule, please inform us at least 24 hours in advance

Best regards,
Doctor Finder Team

Confirmed on ${booking.acceptedAt || new Date().toLocaleString()}`
      : `Dear ${booking.patientName},\n\nWe regret to inform you that your appointment request with Dr. ${booking.doctorName} could not be accepted at this time.\n\nPlease try booking another time slot or contact the hospital directly.\n\nThank you for your understanding.\n\nBest regards,\nDoctor Finder Team`;

    const htmlContent = status === "accepted" ? `
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
              <p style="font-size: 16px; color: #333333;">Dear <strong>${booking.patientName}</strong>,</p>
              <p style="font-size: 16px; color: #555555;">Great news! Your appointment request has been confirmed.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F9FA; border-radius: 8px; border-left: 4px solid #007AFF; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <div style="background-color: #007AFF; color: #ffffff; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px;">
                      Serial Number: ${booking.serialNumber || bookingId}
                    </div>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px;">👨‍⚕️ <strong>Doctor:</strong></td>
                        <td style="color: #333333; font-size: 14px; text-align: right;">${booking.doctorName || 'Doctor'}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">🏥 <strong>Department:</strong></td>
                        <td style="color: #333333; font-size: 14px; text-align: right;">${booking.department || 'General'}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">🏩 <strong>Hospital:</strong></td>
                        <td style="color: #333333; font-size: 14px; text-align: right;">${booking.hospital || booking.hospitalName || 'Hospital'}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding-top: 15px;">📅 <strong>Date:</strong></td>
                        <td style="color: #333333; font-size: 14px; font-weight: bold; text-align: right; padding-top: 15px;">${booking.appointmentDate || new Date().toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">⏰ <strong>Time:</strong></td>
                        <td style="color: #333333; font-size: 14px; font-weight: bold; text-align: right;">${booking.appointmentTime || 'TBD'}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">⏱️ <strong>Duration:</strong></td>
                        <td style="color: #333333; font-size: 14px; text-align: right;">${booking.appointmentDuration || '20 minutes'}</td>
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
                  <li>Note your serial number: <strong>${booking.serialNumber || bookingId}</strong></li>
                  <li>Contact the hospital if you need to cancel or reschedule</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; color: #333333;">Best regards,<br><strong style="color: #007AFF;">Doctor Finder Team</strong></p>
              <p style="font-size: 12px; color: #999999;">Confirmed on ${booking.acceptedAt || new Date().toLocaleString()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>` : `<p>Dear ${booking.patientName},</p><p>We regret to inform you that your appointment request could not be accepted at this time.</p><p>Please try booking another time slot or contact the hospital directly.</p><p>Best regards,<br>Doctor Finder Team</p>`;

    try {
      await transporter.sendMail({
        from: `"Doctor Finder App" <${smtpFrom}>`,
        to: booking.email,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`✅ Email sent to ${booking.email} for status: ${status}`);
    } catch (error) {
      console.error("❌ Email send error:", error);
    }

    return null;
  });
