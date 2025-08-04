import { supabase } from './supabase';
import type { BookingRequest } from '../types/booking';
import { sendVerificationEmail, sendBookingConfirmationEmail } from './emailService';

/**
 * Generate a random confirmation code for booking
 * @returns A 8-character alphanumeric confirmation code
 */
const generateConfirmationCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Generate a 6-digit verification code
 * @returns A 6-digit numeric verification code
 */
const generateVerificationCode = (): string => {
  // Generate a random number between 100000 and 999999 (6 digits)
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return randomNum.toString();
};

/**
 * Submit a booking request to the database with pending status
 * @param bookingData - The booking form data
 * @returns Promise that resolves with booking ID and success status
 */
export const submitBookingRequest = async (bookingData: Omit<BookingRequest, 'id' | 'created_at' | 'updated_at'>): Promise<{
  success: boolean;
  booking_id?: string;
  error?: string;
}> => {
  try {
    const confirmationCode = generateConfirmationCode();
    const verificationCode = generateVerificationCode(); // Use the new function
    
    // Get room and building details to populate required fields
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*, building_id, buildings!inner(id, name, short_name)')
      .eq('id', bookingData.room_id)
      .single();

    if (roomError || !roomData) {
      console.error('Room fetch error:', roomError);
      return { success: false, error: 'Failed to fetch room details' };
    }

    const building = roomData.buildings;
    
    // Debug log to check the data structure
    console.log('Room data:', roomData);
    console.log('Building data:', building);
    console.log('Building ID from room:', roomData.building_id);
    console.log('Building ID from building:', building.id);
    
    // Debug the booking data being sent
    console.log('Booking data to insert:', {
      user_email: bookingData.user_email,
      user_name: bookingData.user_name,
      contact_phone: bookingData.user_phone,
      building_id: roomData.building_id || building.id,
      building_name: building.name,
      building_short_name: building.short_name,
      room_id: bookingData.room_id,
      room_eid: roomData.eid,
      room_name: roomData.name || roomData.title,
      room_capacity: roomData.capacity,
      booking_date: bookingData.booking_date,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      duration_minutes: bookingData.duration_minutes,
      status: 'pending',
      booking_reference: confirmationCode,
      purpose: bookingData.purpose,
      notes: bookingData.notes
    });
    
    const { data: insertedBooking, error } = await supabase
      .from('bookings')
      .insert([{
        user_email: bookingData.user_email,
        user_name: bookingData.user_name,
        contact_phone: bookingData.user_phone,
        building_id: roomData.building_id || building.id,
        building_name: building.name,
        building_short_name: building.short_name,
        room_id: bookingData.room_id,
        room_eid: roomData.eid,
        room_name: roomData.name || roomData.title,
        room_capacity: roomData.capacity,
        booking_date: bookingData.booking_date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        duration_minutes: bookingData.duration_minutes,
        status: 'pending',
        verification_status: 'pending',
        booking_reference: confirmationCode,
        verification_code: verificationCode,
        purpose: bookingData.purpose,
        notes: bookingData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: 'Failed to submit booking request' };
    }

    // Send verification email
    await sendVerificationEmail({
      user_email: bookingData.user_email,
      user_name: bookingData.user_name,
      verification_code: verificationCode,
      booking_reference: confirmationCode
    });

    return { 
      success: true, 
      booking_id: insertedBooking.id.toString()
    };

  } catch (error) {
    console.error('Booking submission error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Verify booking code and confirm the booking
 * @param bookingId - The booking ID
 * @param verificationCode - The verification code entered by user
 * @returns Promise with verification result
 */
export const verifyBookingCode = async (bookingId: string, verificationCode: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // First, get the booking with the verification code
    const { data: bookingVerification, error: fetchError } = await supabase
      .from('bookings')
      .select('verification_code, status, verification_status, created_at')
      .eq('id', bookingId)
      .single();

    if (fetchError || !bookingVerification) {
      return { success: false, error: 'Booking not found' };
    }

    // Check if already verified
    if (bookingVerification.verification_status === 'verified') {
      return { success: false, error: 'Booking has already been verified' };
    }

    // Check if verification code matches
    if (bookingVerification.verification_code !== verificationCode) {
      return { success: false, error: 'Invalid verification code' };
    }

    // Check if code has expired (15 minutes)
    const createdAt = new Date(bookingVerification.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (diffMinutes > 15) {
      return { success: false, error: 'Verification code has expired' };
    }

    // Update booking status to confirmed
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        verification_status: 'verified',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Failed to update booking status:', updateError);
      return { success: false, error: 'Failed to confirm booking' };
    }

    // Send confirmation email - get full booking details
    const { data: fullBooking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (!bookingError && fullBooking) {
      await sendBookingConfirmationEmail({
        user_email: fullBooking.user_email,
        user_name: fullBooking.user_name,
        room_name: fullBooking.room_name,
        building_name: fullBooking.building_name,
        booking_date: fullBooking.booking_date,
        start_time: fullBooking.start_time,
        end_time: fullBooking.end_time,
        booking_reference: fullBooking.booking_reference
      });
    }

    return { success: true };

  } catch (error) {
    console.error('Verification error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get booking history for a user using email and confirmation code
 * @param email - User's email address
 * @param confirmationCode - Booking confirmation code
 * @returns Promise that resolves to booking data or null if not found
 */
export const getBookingByConfirmation = async (email: string, confirmationCode: string): Promise<BookingRequest | null> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_email', email)
      .eq('booking_reference', confirmationCode)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return null;
    }

    // Map database fields to our interface
    const mappedData: BookingRequest = {
      id: data.id,
      room_id: data.room_id,
      user_email: data.user_email,
      user_phone: data.contact_phone || '',
      user_name: data.user_name || '',
      booking_date: data.booking_date,
      start_time: data.start_time,
      end_time: data.end_time,
      duration_minutes: data.duration_minutes || 60,
      status: data.status,
      confirmation_code: data.booking_reference,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return mappedData;
  } catch (error) {
    console.error('Booking lookup error:', error);
    return null;
  }
};

/**
 * Get all bookings for a user by email
 * @param email - User's email address
 * @returns Promise that resolves to array of booking data
 */
export const getUserBookings = async (email: string): Promise<BookingRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }

    // Map database fields to our interface
    const mappedData: BookingRequest[] = (data || []).map(booking => ({
      id: booking.id,
      room_id: booking.room_id,
      user_email: booking.user_email,
      user_phone: booking.contact_phone || '',
      user_name: booking.user_name || '',
      bu_id: booking.bu_id || '',
      booking_date: booking.booking_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      duration_minutes: booking.duration_minutes || 60,
      status: booking.status,
      confirmation_code: booking.booking_reference,
      created_at: booking.created_at,
      updated_at: booking.updated_at
    }));

    return mappedData;
  } catch (error) {
    console.error('User bookings lookup error:', error);
    return [];
  }
};
