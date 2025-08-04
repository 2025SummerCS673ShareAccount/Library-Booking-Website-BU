# EmailJS Setup Guide for BU Library Booking

EmailJS provides 2000 free emails per month, perfect for a university library booking system.

## 🚀 Quick Setup

### 1. Install EmailJS
```bash
npm install @emailjs/browser
```

### 2. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up with your email
3. Verify your email address

### 3. Connect Email Service
1. In EmailJS Dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - **Outlook**
   - **Yahoo**
   - Or any SMTP service
4. Follow the connection wizard
5. Note down your **Service ID**

### 4. Create Email Templates

#### Verification Email Template
1. Go to **Email Templates** → **Create New Template**
2. Template ID: `verification_email`
3. Subject: `BU Library Booking - Verify Your Email`
4. **Important**: Set the "To Email" field to: `{{user_email}}`
5. Content:
```html
Dear {{to_name}},

Your room booking request has been received. Please verify your email address by entering the following code:

Verification Code: {{verification_code}}
Booking Reference: {{booking_reference}}

This code will expire in {{expires_in}}.

If you didn't request this booking, please ignore this email.

Best regards,
BU Library Team
```

#### Confirmation Email Template
1. Create another template
2. Template ID: `confirmation_email`
3. Subject: `BU Library Booking Confirmed`
4. **Important**: Set the "To Email" field to: `{{user_email}}`
5. Content:
```html
Dear {{to_name}},

Your room booking has been confirmed!

Booking Details:
- Room: {{room_name}}
- Building: {{building_name}}
- Date: {{booking_date}}
- Time: {{start_time}} - {{end_time}}
- Booking Reference: {{booking_reference}}

Please arrive on time and bring your BU ID.

Best regards,
BU Library Team
```

### 5. Get Your Keys
1. Go to **Account** → **General**
2. Copy your **Public Key**
3. Note down your **Service ID** and **Template IDs**

### 6. Environment Configuration
Create or update your `.env` file in the `bu-book` folder:

```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_VERIFICATION_TEMPLATE_ID=verification_email
VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID=confirmation_email
```

### 7. Enable EmailJS in Code
1. Open `src/lib/emailService.ts`
2. Uncomment the EmailJS import line:
```typescript
import emailjs from '@emailjs/browser';
```

3. Uncomment the real EmailJS implementation sections (look for the commented blocks)

4. Open `src/main.tsx` and add:
```typescript
import { initEmailJS } from './lib/emailService';

// Initialize EmailJS
initEmailJS();
```

## 🧪 Testing

### Current State (Simulation Mode)
- Verification codes are logged to browser console
- Look for `🔑 TEST VERIFICATION CODE: xxxxxx` in console
- Use this code to test the verification flow

### Production Mode (After Setup)
- Real emails will be sent to users
- Check EmailJS dashboard for usage statistics
- Monitor for bounced emails

## 📊 Limits & Monitoring

### Free Tier Limits
- **2000 emails/month**
- **50 emails/day**
- No credit card required

### Monitoring Usage
1. EmailJS Dashboard → **Usage**
2. Track emails sent, delivery rates
3. Monitor for errors or bounces

### Upgrade Options
- If you exceed limits, EmailJS offers paid plans
- Consider implementing email queuing for high volume

## 🛡️ Security Best Practices

1. **Never commit .env files**
   - Already added to `.gitignore`
   - Keep your keys secure

2. **Rate Limiting**
   - EmailJS has built-in rate limiting
   - Consider adding client-side limits

3. **Validation**
   - Always validate email addresses
   - Check for disposable email domains if needed

## 🐛 Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check console for errors
   - Verify all environment variables are set
   - Check EmailJS dashboard for service status

2. **Template variables not working**
   - Ensure variable names match exactly: `{{to_name}}`, `{{verification_code}}`
   - Test templates in EmailJS dashboard

3. **CORS errors**
   - EmailJS handles CORS automatically
   - Ensure you're using the correct public key

4. **Rate limiting**
   - Check EmailJS dashboard for usage
   - Implement user-friendly error messages

### Debug Mode
Set `VITE_DEBUG_EMAIL=true` in `.env` to see detailed logs.

## 🔄 Alternative Email Services

If you need more emails or different features:

1. **Resend** - 3000 emails/month free
2. **SendGrid** - 100 emails/month free
3. **Mailgun** - 5000 emails free (first 3 months)
4. **AWS SES** - 62,000 emails/month free (with EC2)

## 📈 Future Enhancements

1. **Email Templates**
   - Rich HTML templates with BU branding
   - Responsive design for mobile

2. **Analytics**
   - Track email open rates
   - Monitor user engagement

3. **Automation**
   - Reminder emails for upcoming bookings
   - Cancellation notifications

---

**Need Help?** Check the EmailJS documentation at [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
