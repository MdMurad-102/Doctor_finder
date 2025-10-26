/**
 * ALTERNATIVE EMAIL SERVICE - Quick Test Version
 * Uses webhook.site for immediate testing (no signup required)
 * 
 * USAGE:
 * 1. Go to https://webhook.site/
 * 2. Copy your unique URL (shown at top)
 * 3. Replace WEBHOOK_URL below with your URL
 * 4. Accept a booking
 * 5. Check webhook.site to see the email data
 * 
 * This won't send actual emails, but you can verify the data is correct!
 */

export const sendAcceptanceEmailQuickTest = async (bookingData: any) => {
    const WEBHOOK_URL = 'https://webhook.site/YOUR-UNIQUE-ID'; // Get from webhook.site

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: bookingData.patientEmail,
                subject: 'Appointment Confirmed',
                message: `
Hello ${bookingData.patientName},

Your appointment has been confirmed!

Serial: ${bookingData.serialNumber}
Doctor: ${bookingData.doctorName}
Date: ${bookingData.appointmentDate}
Time: ${bookingData.appointmentTime}
Hospital: ${bookingData.hospital}

Best regards,
Doctor Finder Team
                `.trim()
            })
        });

        console.log('📧 Email data sent to webhook:', response.status);
        return { success: true, message: 'Test data sent (check webhook.site)' };
    } catch (error) {
        console.error('❌ Webhook error:', error);
        return { success: false, error: 'Webhook test failed' };
    }
};
