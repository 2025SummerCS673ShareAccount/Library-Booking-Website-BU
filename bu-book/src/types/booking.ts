export interface BookingRequest {
  id?: string;
  room_id: number;
  user_email: string;
  user_phone?: string;
  user_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  group_size?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_reference?: string;
  confirmation_code?: string;
  purpose?: string;
  notes?: string;
  verification_code?: string;
  verification_status?: 'pending' | 'verified';
  created_at?: string;
  updated_at?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  conflictReason?: string;
}

export interface BookingFormData {
  room_id: number;
  user_name: string;
  user_email: string;
  bu_id: string;
  user_phone?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  purpose?: string;
  notes?: string;
}

export interface TimeSelection {
  start_time: string;
  duration_minutes: number;
  end_time: string;
  date?: string; // Optional date field
}

export interface BookingConflict {
  room_id: number;
  conflicting_booking: {
    start_time: string;
    end_time: string;
    booking_reference: string;
  };
  conflict_message: string;
}

export interface RoomAvailabilityStatus {
  room_id: number;
  available: boolean;
  status: 'available' | 'conflict' | 'closed' | 'maintenance';
  message?: string;
  conflict_details?: BookingConflict;
}
