import { supabase } from './supabase';
import type { BookingRequest } from '../types/booking';

/**
 * Generate a random confirmation code for booking
 * @returns A 8-character alphanumeric confirmation code
 */
const generateConfirmationCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Calculate duration in minutes between two time strings
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Duration in minutes
 */
const calculateDurationInMinutes = (startTime: string, endTime: string): number => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

/**
 * Submit a booking request to the database
 * @param bookingData - The booking form data
 * @returns Promise that resolves when booking is submitted
 */
export const submitBookingRequest = async (bookingData: Omit<BookingRequest, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
  try {
    const confirmationCode = generateConfirmationCode();
    
    // Get room and building details to populate required fields
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*, buildings!inner(name, short_name)')
      .eq('id', bookingData.room_id)
      .single();

    if (roomError || !roomData) {
      throw new Error('Failed to fetch room details');
    }

    const building = roomData.buildings;
    
    const { error } = await supabase
      .from('bookings')
      .insert([{
        user_email: bookingData.user_email,
        user_name: bookingData.user_name,
        contact_phone: bookingData.user_phone,
        building_id: building.id,
        building_name: building.name,
        building_short_name: building.short_name,
        room_id: bookingData.room_id,
        room_eid: roomData.eid,
        room_name: roomData.name || roomData.title,
        room_capacity: roomData.capacity,
        booking_date: bookingData.booking_date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        duration_minutes: calculateDurationInMinutes(bookingData.start_time, bookingData.end_time),
        status: 'pending',
        booking_reference: confirmationCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to submit booking request');
    }

    // Send confirmation email (this would be handled by a backend service)
    await sendConfirmationEmail({
      ...bookingData,
      confirmation_code: confirmationCode
    });

  } catch (error) {
    console.error('Booking submission error:', error);
    throw error;
  }
};

/**
 * Send confirmation email to user
 * This is a placeholder function - in a real application, this would
 * trigger an email service (like SendGrid, AWS SES, etc.)
 * @param bookingData - The booking data including confirmation code
 */
const sendConfirmationEmail = async (bookingData: BookingRequest): Promise<void> => {
  // In a real application, this would call your email service
  // For now, we'll just log the email content
  console.log('Sending confirmation email:', {
    to: bookingData.user_email,
    subject: 'Room Booking Confirmation - BU Book',
    content: `
      Dear ${bookingData.user_name},
      
      Your room booking request has been received.
      
      Booking Details:
      - Room ID: ${bookingData.room_id}
      - Date: ${bookingData.booking_date}
      - Time: ${bookingData.start_time} - ${bookingData.end_time}
      - Confirmation Code: ${bookingData.confirmation_code}
      
      You will receive another email once your booking is confirmed.
      
      Thank you for using BU Book!
    `
  });

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
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
      bu_id: data.bu_id || '',
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
