// EmailJS integration for sending verification emails
// Free tier: 2000 emails/month

// Uncomment the line below when you install EmailJS
import emailjs from '@emailjs/browser';

interface EmailData {
  user_email: string;
  user_name: string;
  verification_code: string;
  booking_reference: string;
}

interface ConfirmationEmailData {
  user_email: string;
  user_name: string;
  room_name: string;
  building_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  booking_reference: string;
}

// EmailJS configuration - add these to your .env file
const EMAILJS_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  VERIFICATION_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_VERIFICATION_TEMPLATE_ID || '',
  CONFIRMATION_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID || ''
};

/**
 * Send verification email using EmailJS
 */
export const sendVerificationEmail = async (data: EmailData): Promise<boolean> => {
  try {
    // Check if EmailJS is configured
    if (!EMAILJS_CONFIG.PUBLIC_KEY || !EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.VERIFICATION_TEMPLATE_ID) {
      console.warn('EmailJS not configured, simulating email send');
      console.log('📧 [SIMULATION] Verification email:', {
        to: data.user_email,
        subject: 'BU Library Booking - Email Verification Required',
        verification_code: data.verification_code,
        booking_reference: data.booking_reference,
        user_name: data.user_name
      });
      
      // Show the verification code in console for testing
      console.log(`🔑 TEST VERIFICATION CODE: ${data.verification_code}`);
      return true;
    }

    // Real EmailJS implementation
    const templateParams = {
      user_email: data.user_email,
      to_name: data.user_name,
      verification_code: data.verification_code,
      booking_reference: data.booking_reference,
      expires_in: '15 minutes'
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.VERIFICATION_TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('Verification email sent successfully:', result);
    return result.status === 200;

  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
};

/**
 * Send booking confirmation email using EmailJS
 */
export const sendBookingConfirmationEmail = async (data: ConfirmationEmailData): Promise<boolean> => {
  try {
    // Check if EmailJS is configured
    if (!EMAILJS_CONFIG.PUBLIC_KEY || !EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.CONFIRMATION_TEMPLATE_ID) {
      console.warn('EmailJS not configured, simulating email send');
      console.log('📧 [SIMULATION] Confirmation email:', {
        to: data.user_email,
        subject: 'BU Library Booking Confirmed',
        room_name: data.room_name,
        building_name: data.building_name,
        booking_date: data.booking_date,
        start_time: data.start_time,
        end_time: data.end_time,
        booking_reference: data.booking_reference
      });
      return true;
    }

    // Real EmailJS implementation
    const templateParams = {
      user_email: data.user_email,
      to_name: data.user_name,
      room_name: data.room_name,
      building_name: data.building_name,
      booking_date: data.booking_date,
      start_time: data.start_time,
      end_time: data.end_time,
      booking_reference: data.booking_reference
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.CONFIRMATION_TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('Confirmation email sent successfully:', result);
    return result.status === 200;

  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
};

/**
 * Initialize EmailJS (call this once in your app)
 * Add this to your main.tsx or App.tsx:
 * 
 * import { initEmailJS } from './lib/emailService';
 * initEmailJS();
 */
export const initEmailJS = () => {
  if (EMAILJS_CONFIG.PUBLIC_KEY) {
    // Initialize EmailJS with public key
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.log('EmailJS initialized with public key');
  } else {
    console.log('EmailJS running in simulation mode - add VITE_EMAILJS_PUBLIC_KEY to .env');
  }
};

// EmailJS setup instructions:
/* 
1. Install EmailJS:
   npm install @emailjs/browser

2. Create .env file with:
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_VERIFICATION_TEMPLATE_ID=your_verification_template_id
   VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID=your_confirmation_template_id

3. Verification email template:
   Subject: BU Library Booking - Verify Your Email
   Body:
   Dear {{user_name}},
   
   Your room booking request has been received. Please verify your email address by entering the following code:
   
   Verification Code: {{verification_code}}
   Booking Reference: {{booking_reference}}
   
   This code will expire in {{expires_in}}.
   
   If you didn't request this booking, please ignore this email.
   
   Best regards,
   BU Library Team

4. Confirmation email template:
   Subject: BU Library Booking Confirmed
   Body:
   Dear {{user_name}},
   
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
*/
