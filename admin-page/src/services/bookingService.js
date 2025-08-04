/**
 * Booking Service
 * Provides booking data management using unified API service with new database schema
 */
import apiService from './apiService';
import supabaseService from './supabaseService';

/**
 * Mock booking data for fallback when API is unavailable
 * Updated to match new database schema
 */
const mockBookings = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    user_email: 'student1@bu.edu',
    user_name: 'John Doe',
    booking_reference: 'BU202501150001',
    building_name: 'Mugar Memorial Library',
    building_short_name: 'mug',
    room_name: 'Group Study Room A',
    booking_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '12:00',
    duration_minutes: 120,
    group_size: 4,
    status: 'confirmed',
    purpose: 'Group study session',
    notes: 'Need access to whiteboard',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    user_email: 'student2@bu.edu',
    user_name: 'Jane Smith',
    booking_reference: 'BU202501150002',
    building_name: 'Pardee Library',
    building_short_name: 'par',
    room_name: 'Conference Room 1',
    booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    start_time: '14:00',
    end_time: '16:00',
    duration_minutes: 120,
    group_size: 2,
    status: 'pending',
    purpose: 'Research meeting',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    user_email: 'student3@bu.edu',
    user_name: 'Mike Johnson',
    booking_reference: 'BU202501150003',
    building_name: 'Science & Engineering Library',
    building_short_name: 'sci',
    room_name: 'Engineering Study Room',
    booking_date: new Date().toISOString().split('T')[0],
    start_time: '16:00',
    end_time: '18:00',
    duration_minutes: 120,
    group_size: 1,
    status: 'cancelled',
    purpose: 'Project work',
    notes: 'Cancelled due to equipment maintenance',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];

/**
 * Get all bookings with optional filtering and pagination
 * @param {Object} options - Options for fetching bookings
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of items per page (default: 10)
 * @param {Object} options.filters - Optional filters for bookings
 * @returns {Promise<{success: boolean, data: Object, error: string|null}>}
 */
export const getBookings = async (options = {}) => {
  const { page = 1, limit = 10, filters = {} } = options;

  try {
    // Try to get data from Supabase first
    const result = await supabaseService.getBookings(page, limit, filters);

    if (result.success) {
      return result;
    } else {
      console.warn('Supabase query failed, using mock data:', result.error);
    }
  } catch (error) {
    console.warn('Supabase service unavailable, using mock data:', error.message);
  }

  // Fallback to mock data
  try {
    let filteredBookings = [...mockBookings];

    // Apply filters if provided
    if (filters.status) {
      filteredBookings = filteredBookings.filter(b => b.status === filters.status);
    }

    if (filters.building) {
      filteredBookings = filteredBookings.filter(b => b.building_short_name === filters.building);
    }

    if (filters.dateFrom) {
      filteredBookings = filteredBookings.filter(b => b.booking_date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filteredBookings = filteredBookings.filter(b => b.booking_date <= filters.dateTo);
    }

    if (filters.userEmail) {
      filteredBookings = filteredBookings.filter(b =>
        b.user_email.toLowerCase().includes(filters.userEmail.toLowerCase())
      );
    }

    // Apply pagination
    const total = filteredBookings.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedBookings = filteredBookings.slice(start, end);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    console.warn('Using mock booking data - Database connection in progress');
    return {
      success: true,
      data: {
        bookings: paginatedBookings,
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getBookings:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
};

/**
 * Get booking statistics
 * @returns {Promise<{success: boolean, data: Object, error: string|null}>}
 */
export const getBookingStats = async () => {
  try {
    // Try to get stats from Supabase first
    const result = await supabaseService.getBookingStats();

    if (result.success) {
      return result;
    } else {
      console.warn('Supabase stats query failed, using mock data:', result.error);
    }
  } catch (error) {
    console.warn('Supabase service unavailable, using mock data:', error.message);
  }

  // Fallback to mock data
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalBookings = mockBookings.length;
    const recentBookings = mockBookings.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate >= sevenDaysAgo;
    }).length;

    const monthlyBookings = mockBookings.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate >= thirtyDaysAgo;
    }).length;

    // Status breakdown
    const statusBreakdown = mockBookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    const activeBookings = mockBookings.filter(booking =>
      ['confirmed', 'active', 'pending'].includes(booking.status)
    ).length;

    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      success: true,
      data: {
        totalBookings,
        recentBookings,
        monthlyBookings,
        activeBookings,
        statusBreakdown,
        bookings: mockBookings
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getBookingStats:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
};

/**
 * Update booking status
 * @param {string} bookingId - ID of the booking to update
 * @param {string} status - New status
 * @param {string} reason - Optional reason for status change
 * @returns {Promise<{success: boolean, data: Object, error: string|null}>}
 */
export const updateBookingStatus = async (bookingId, status, reason = null) => {
  try {
    // Try to update in Supabase first
    const result = await supabaseService.updateBookingStatus(bookingId, status, reason);

    if (result.success) {
      return result;
    } else {
      console.warn('Supabase update failed, using mock response:', result.error);
    }
  } catch (error) {
    console.warn('Supabase service unavailable, using mock response:', error.message);
  }

  // Fallback to mock response
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find and update mock booking
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      return {
        success: false,
        data: null,
        error: 'Booking not found'
      };
    }

    // Update mock data
    mockBookings[bookingIndex] = {
      ...mockBookings[bookingIndex],
      status: status,
      updated_at: new Date().toISOString(),
      ...(status === 'cancelled' && reason && {
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString()
      })
    };

    return {
      success: true,
      data: mockBookings[bookingIndex],
      error: null
    };
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
};

/**
 * Get bookings by user email
 * @param {string} userEmail - User email to search for
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const getBookingsByUser = async (userEmail) => {
  try {
    // Use apiService to get bookings filtered by user email
    const result = await apiService.getBookings({ user_email: userEmail });

    if (result.bookings) {
      return {
        success: true,
        data: result.bookings,
        error: null
      };
    }
  } catch (error) {
    console.warn('Backend API unavailable, using mock data:', error.message);
  }

  // Fallback to mock data
  try {
    const userBookings = mockBookings.filter(booking =>
      booking.user_email.toLowerCase() === userEmail.toLowerCase()
    );

    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      success: true,
      data: userBookings,
      error: null
    };
  } catch (error) {
    console.error('Error in getBookingsByUser:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
};

/**
 * Get booking details by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<{success: boolean, data: Object, error: string|null}>}
 */
export const getBookingById = async (bookingId) => {
  try {
    // Try to find in mock data first
    const booking = mockBookings.find(b => b.id === bookingId);

    if (booking) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        success: true,
        data: booking,
        error: null
      };
    }

    return {
      success: false,
      data: null,
      error: 'Booking not found'
    };
  } catch (error) {
    console.error('Error in getBookingById:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
};

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @returns {Promise<{success: boolean, data: Object, error: string|null}>}
 */
export const createBooking = async (bookingData) => {
  try {
    // Use apiService to create booking
    const data = await apiService.createBooking(bookingData);

    if (data) {
      return {
        success: true,
        data: data,
        error: null
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        data: null,
        error: errorData.error || 'Failed to create booking'
      };
    }
  } catch (error) {
    console.warn('Backend API unavailable for booking creation:', error.message);
    return {
      success: false,
      data: null,
      error: 'Backend service unavailable'
    };
  }
};

/**
 * Update booking (admin function - can update all fields except email)
 * @param {string} bookingId - ID of the booking to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<{success: boolean, data: Object, error: string|null}>}
 */
export const updateBooking = async (bookingId, updateData) => {
  try {
    // Try to update in Supabase first
    const result = await supabaseService.updateBooking(bookingId, updateData);

    if (result.success) {
      return result;
    } else {
      console.warn('Supabase update failed, using mock response:', result.error);
    }
  } catch (error) {
    console.warn('Supabase service unavailable, using mock response:', error.message);
  }

  // Fallback to mock response
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find and update mock booking
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      return {
        success: false,
        data: null,
        error: 'Booking not found'
      };
    }

    // Update mock data (preserve email and created_at)
    mockBookings[bookingIndex] = {
      ...mockBookings[bookingIndex],
      ...updateData,
      user_email: mockBookings[bookingIndex].user_email, // Don't allow email changes
      created_at: mockBookings[bookingIndex].created_at, // Don't allow created_at changes
      updated_at: new Date().toISOString()
    };

    return {
      success: true,
      data: mockBookings[bookingIndex],
      error: null
    };
  } catch (error) {
    console.error('Error in updateBooking:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
};

// Export default service object
const bookingService = {
  getBookings,
  getBookingStats,
  updateBookingStatus,
  updateBooking,
  getBookingsByUser,
  getBookingById,
  createBooking
};

export default bookingService;
