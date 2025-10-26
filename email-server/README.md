# Email Server - Doctor Finder App

## Why This Server?

Your **Gmail SMTP works perfectly** (you confirmed with test tool), but React Native **cannot use nodemailer directly** because it lacks Node.js modules.

**This server solves that problem:**
- ✅ Uses your working Gmail SMTP (465/SSL)
- ✅ No Firebase dependency needed
- ✅ Direct SMTP connection
- ✅ React Native app calls this server via HTTP

## Setup Instructions

### 1. Install Dependencies

```bash
cd email-server
npm install
```

This will install:
- `express` - Web server
- `nodemailer` - SMTP email sending (uses your Gmail)
- `cors` - Allow requests from React Native app
- `dotenv` - Load environment variables

### 2. Verify Configuration

The server already uses your Gmail credentials:
```
Email: fhmurad420@gmail.com
App Password: bymg gjix wifu rrqp
Port: 465 (SSL)
Host: smtp.gmail.com
```

These are hardcoded in `server.js` (or can read from `../.env`).

### 3. Start the Server

```bash
npm start
```

You should see:
```
🚀 Email server running on http://localhost:3000
📧 Using Gmail SMTP: fhmurad420@gmail.com
🔒 SSL Port: 465
✅ SMTP Server is ready to send emails
```

### 4. Test the Server

Keep the server running, then test from your React Native app:

1. Start email server: `npm start` (in email-server folder)
2. Start React Native app: `npm start` (in project root)
3. Accept a booking in the app
4. Check the email server terminal for logs
5. Patient should receive email within seconds

## API Endpoint

### POST /send-appointment-email

Send appointment confirmation email.

**Request Body:**
```json
{
  "patientEmail": "patient@example.com",
  "patientName": "John Doe",
  "doctorName": "Dr. Smith",
  "doctorDegree": "MBBS, MD",
  "department": "Cardiology",
  "hospital": "City Hospital",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "10:00 AM",
  "appointmentDuration": "30 minutes",
  "serialNumber": "12345",
  "acceptedAt": "2024-01-10 3:45 PM"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<unique-message-id>",
  "to": "patient@example.com"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## How It Works

```
React Native App (booking.tsx)
    ↓
    calls sendAcceptanceEmail()
    ↓
emailService.ts
    ↓
    HTTP POST to localhost:3000
    ↓
Email Server (server.js)
    ↓
    uses nodemailer + Gmail SMTP
    ↓
Gmail sends email to patient
```

## Deployment Options

For production, you can deploy this server to:

### Option 1: Render.com (Recommended - Free)
1. Create account at render.com
2. Connect your GitHub repo
3. Deploy as Web Service
4. Update emailService.ts URL: `http://localhost:3000` → `https://your-app.onrender.com`

### Option 2: Railway.app (Free $5 credit/month)
1. Create account at railway.app
2. Deploy from GitHub
3. Update React Native app URL

### Option 3: Heroku (Free tier ended, paid only)
1. Create Heroku app
2. Deploy with Git
3. Update React Native app URL

### Option 4: Keep Running Locally
- Just keep `npm start` running when testing
- Works perfectly for development

## Troubleshooting

### "SMTP Connection Error"
- Check Gmail credentials in server.js
- Verify app password is correct: `bymg gjix wifu rrqp`
- Ensure 2-factor authentication is enabled on Gmail

### "Cannot connect to localhost:3000"
- Make sure email server is running: `cd email-server && npm start`
- Check if port 3000 is available
- Try killing any process on port 3000: `lsof -ti:3000 | xargs kill -9`

### "Email sent but not received"
- Check Gmail sent folder at fhmurad420@gmail.com
- Check patient's spam/junk folder
- Verify patient email address is correct
- Check email server terminal logs

### React Native "Network request failed"
- Email server must be running
- For iOS Simulator: use `http://localhost:3000`
- For Android Emulator: use `http://10.0.2.2:3000`
- For Physical Device: use your computer's IP (e.g., `http://192.168.1.100:3000`)

## Security Notes

- ✅ SMTP credentials are secure (SSL connection)
- ⚠️ For production, move credentials to environment variables
- ⚠️ Add rate limiting to prevent spam
- ⚠️ Consider adding authentication (API key)

## Why Not Firebase?

You asked: "my smtp not depent the firbase why the firbase is issue"

**You're right!** 
- Your Gmail SMTP works independently
- This server uses SMTP directly
- No Firebase dependency needed
- Simpler and more straightforward

Firebase Cloud Functions was one solution, but this standalone server is:
- ✅ Easier to set up (no Firebase CLI needed)
- ✅ Easier to debug (see logs immediately)
- ✅ More control (direct SMTP access)
- ✅ Free to run locally

## Next Steps

1. **Start the server**: `npm start`
2. **Test from app**: Accept a booking
3. **Verify email**: Check patient inbox
4. **Deploy** (optional): Use Render.com for production

---

**Your SMTP works. This server just bridges React Native to SMTP. That's it!** 🎉
