import { supabase } from './supabase';
import type { TimeSelection, RoomAvailabilityStatus, BookingConflict } from '../types/booking';

/**
 * Check for booking conflicts for a specific room and time range
 * @param roomId - Room ID to check
 * @param timeSelection - Selected time range
 * @returns Promise that resolves to room availability status
 */
export const checkRoomConflicts = async (
  roomId: number, 
  timeSelection: TimeSelection
): Promise<RoomAvailabilityStatus> => {
  try {
    const bookingDate = timeSelection.date || new Date().toISOString().split('T')[0];
    
    // Query for confirmed bookings that overlap with the requested time
    const { data: conflictingBookings, error } = await supabase
      .from('bookings')
      .select('start_time, end_time, booking_reference, user_name')
      .eq('room_id', roomId)
      .eq('booking_date', bookingDate)
      .eq('verification_status', 'verified') // Only check verified bookings
      .in('status', ['confirmed', 'active']) // Only active bookings
      .or(
        // Check for time overlaps
        `and(start_time.lte.${timeSelection.end_time},end_time.gte.${timeSelection.start_time})`
      );

    if (error) {
      console.error('Error checking room conflicts:', error);
      return {
        room_id: roomId,
        available: true, // Default to available if error
        status: 'available'
      };
    }

    // If no conflicts, room is available
    if (!conflictingBookings || conflictingBookings.length === 0) {
      return {
        room_id: roomId,
        available: true,
        status: 'available'
      };
    }

    // Find the most relevant conflict (earliest overlapping booking)
    const primaryConflict = conflictingBookings[0];
    
    const conflict: BookingConflict = {
      room_id: roomId,
      conflicting_booking: {
        start_time: primaryConflict.start_time,
        end_time: primaryConflict.end_time,
        booking_reference: primaryConflict.booking_reference
      },
      conflict_message: `This room has been booked from ${primaryConflict.start_time} - ${primaryConflict.end_time}`
    };

    return {
      room_id: roomId,
      available: false,
      status: 'conflict',
      message: `Booked from ${primaryConflict.start_time} - ${primaryConflict.end_time}`,
      conflict_details: conflict
    };

  } catch (error) {
    console.error('Room conflict check error:', error);
    return {
      room_id: roomId,
      available: true, // Default to available on error
      status: 'available'
    };
  }
};

/**
 * Check conflicts for multiple rooms at once
 * @param roomIds - Array of room IDs to check
 * @param timeSelection - Selected time range
 * @returns Promise that resolves to array of room availability statuses
 */
export const checkMultipleRoomConflicts = async (
  roomIds: number[], 
  timeSelection: TimeSelection
): Promise<RoomAvailabilityStatus[]> => {
  try {
    // Run conflict checks in parallel for better performance
    const conflictChecks = roomIds.map(roomId => checkRoomConflicts(roomId, timeSelection));
    const results = await Promise.all(conflictChecks);
    return results;
  } catch (error) {
    console.error('Multiple room conflict check error:', error);
    // Return all rooms as available on error
    return roomIds.map(roomId => ({
      room_id: roomId,
      available: true,
      status: 'available' as const
    }));
  }
};

/**
 * Format conflict message for display
 * @param conflict - Booking conflict details
 * @returns Formatted message string
 */
export const formatConflictMessage = (conflict: BookingConflict): string => {
  const { start_time, end_time } = conflict.conflicting_booking;
  return `This room has been booked from ${start_time} - ${end_time}`;
};
