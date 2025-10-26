const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

admin.initializeApp();

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const twilioPhone = functions.config().twilio.phone;

const client = twilio(accountSid, authToken);

// Email transporter (configure via: firebase functions:config:set smtp.host=... smtp.port=... smtp.user=... smtp.pass=... smtp.from=...)
const smtpHost = functions.config().smtp?.host;
const smtpPort = functions.config().smtp?.port || 587;
const smtpUser = functions.config().smtp?.user;
const smtpPass = functions.config().smtp?.pass;
const smtpFrom = functions.config().smtp?.from || "no-reply@example.com";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: Number(smtpPort),
  secure: Number(smtpPort) === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
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
      ? `Your booking is accepted`
      : `Your booking is rejected`;

    const text = status === "accepted"
      ? `Hello ${booking.patientName},\n\nYour booking with Dr. ${booking.doctorName} has been accepted.\nSerial: ${booking.serialNumber || bookingId}.\n\nThank you.`
      : `Hello ${booking.patientName},\n\nWe are sorry to inform you that your booking with Dr. ${booking.doctorName} was rejected.\n\nThank you.`;

    try {
      await transporter.sendMail({
        from: smtpFrom,
        to: booking.email,
        subject,
        text,
      });
      console.log(`Email sent to ${booking.email} for status: ${status}`);
    } catch (error) {
      console.error("Email send error:", error);
    }

    return null;
  });
