// Supabase service for admin dashboard operations
import { supabase } from '../lib/supabase';

/**
 * Supabase service for admin dashboard operations
 * Handles direct database interactions for admin functionality
 * Updated for new database schema with proper table names
 */
class SupabaseService {
  constructor() {
    this.client = supabase;
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      const { data, error } = await this.client
        .from('bookings')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('Supabase connection test failed:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Successfully connected to Supabase',
        count: data
      };
    } catch (error) {
      console.error('Supabase connection test error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get comprehensive booking statistics
   */
  async getBookingStats() {
    try {
      const { data, error } = await this.client
        .from('bookings')
        .select(`
          id, user_email, user_name, booking_reference,
          building_name, building_short_name, room_name,
          booking_date, start_time, end_time, duration_minutes,
          status, purpose, notes, created_at, updated_at
        `);

      if (error) {
        return { success: false, error: error.message };
      }

      // Calculate comprehensive statistics
      const totalBookings = data.length;
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentBookings = data.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= sevenDaysAgo;
      }).length;

      const monthlyBookings = data.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= thirtyDaysAgo;
      }).length;

      // Status breakdown
      const statusBreakdown = data.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {});

      // Active bookings (confirmed, active, pending)
      const activeBookings = data.filter(booking =>
        ['confirmed', 'active', 'pending'].includes(booking.status)
      ).length;

      return {
        success: true,
        data: {
          totalBookings,
          recentBookings,
          monthlyBookings,
          activeBookings,
          statusBreakdown,
          bookings: data
        }
      };
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all bookings with pagination and filtering
   */
  async getBookings(page = 1, limit = 10, filters = {}) {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      let query = this.client
        .from('bookings')
        .select(`
          id, user_email, user_name, booking_reference,
          building_name, building_short_name, room_name,
          booking_date, start_time, end_time, duration_minutes,
          status, purpose, notes, created_at, updated_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.building) {
        query = query.eq('building_short_name', filters.building);
      }
      if (filters.dateFrom) {
        query = query.gte('booking_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('booking_date', filters.dateTo);
      }
      if (filters.userEmail) {
        query = query.ilike('user_email', `%${filters.userEmail}%`);
      }

      const { data, error, count } = await query.range(start, end);

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          bookings: data,
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user activity statistics
   */
  async getUserStats() {
    try {
      const { data: bookingsData, error: bookingsError } = await this.client
        .from('bookings')
        .select('user_email, created_at');

      if (bookingsError) {
        return { success: false, error: bookingsError.message };
      }

      const { data: profilesData, error: profilesError } = await this.client
        .from('user_profiles')
        .select('email, total_bookings, active_bookings, cancelled_bookings, last_activity_at, created_at');

      if (profilesError) {
        return { success: false, error: profilesError.message };
      }

      // Calculate user statistics
      const uniqueUsers = new Set(bookingsData.map(booking => booking.user_email)).size;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activeUsersThisWeek = new Set(
        bookingsData.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= sevenDaysAgo;
        }).map(booking => booking.user_email)
      ).size;

      // User profile statistics
      const totalProfiles = profilesData.length;
      const activeProfiles = profilesData.filter(profile => profile.active_bookings > 0).length;

      return {
        success: true,
        data: {
          totalUsers: uniqueUsers,
          totalProfiles,
          activeUsersThisWeek,
          activeProfiles,
          totalBookings: bookingsData.length,
          userProfiles: profilesData
        }
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get building and room usage statistics
   */
  async getBuildingStats() {
    try {
      const { data: buildingsData, error: buildingsError } = await this.client
        .from('buildings')
        .select('id, name, short_name, address, website, contacts, available, libcal_id, lid, latitude, longitude, geocoding_status');

      if (buildingsError) {
        return { success: false, error: buildingsError.message };
      }

      const { data: bookingsData, error: bookingsError } = await this.client
        .from('bookings')
        .select('building_short_name, building_name, room_name, created_at');

      if (bookingsError) {
        return { success: false, error: bookingsError.message };
      }

      // Calculate building usage
      const buildingUsage = {};
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      bookingsData.forEach(booking => {
        const buildingKey = booking.building_short_name || 'Unknown';
        if (!buildingUsage[buildingKey]) {
          buildingUsage[buildingKey] = {
            name: booking.building_name || buildingKey,
            shortName: buildingKey,
            count: 0,
            recentCount: 0,
            rooms: new Set()
          };
        }
        buildingUsage[buildingKey].count++;
        buildingUsage[buildingKey].rooms.add(booking.room_name);

        // Count recent bookings (last 7 days)
        const bookingDate = new Date(booking.created_at);
        if (bookingDate >= sevenDaysAgo) {
          buildingUsage[buildingKey].recentCount++;
        }
      });

      // Convert to array and add room counts
      const usageArray = Object.entries(buildingUsage).map(([code, stats]) => ({
        code,
        ...stats,
        uniqueRooms: stats.rooms.size,
        rooms: undefined // Remove Set object for JSON serialization
      }));

      // Map database fields to frontend expected field names
      const mappedBuildingsData = buildingsData.map(building => ({
        ...building,
        // Add legacy field names for backward compatibility
        building_name: building.name,
        building_short_name: building.short_name,
        location: building.address,
        is_active: building.available
      }));

      return {
        success: true,
        data: {
          buildings: mappedBuildingsData,
          buildingUsage: usageArray,
          totalBookings: bookingsData.length
        }
      };
    } catch (error) {
      console.error('Error fetching building stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get buildings data with field mapping for frontend compatibility
   */
  async getBuildings(options = {}) {
    try {
      let query = this.client
        .from('buildings')
        .select('id, name, short_name, address, website, contacts, available, libcal_id, lid, created_at, updated_at, latitude, longitude, geocoding_status, geocoded_at');

      // Apply filters if provided
      if (options.available !== undefined) {
        query = query.eq('available', options.available);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      // Map database fields to frontend expected field names
      const mappedData = data.map(building => ({
        ...building,
        // Add legacy field names for backward compatibility
        building_name: building.name,
        building_short_name: building.short_name,
        location: building.address,
        is_active: building.available
      }));

      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      console.error('Error fetching buildings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get building by ID with field mapping
   */
  async getBuildingById(buildingId) {
    try {
      const { data, error } = await this.client
        .from('buildings')
        .select('id, name, short_name, address, website, contacts, available, libcal_id, lid, created_at, updated_at, latitude, longitude, geocoding_status, geocoded_at')
        .eq('id', buildingId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Map database fields to frontend expected field names
      const mappedData = {
        ...data,
        building_name: data.name,
        building_short_name: data.short_name,
        location: data.address,
        is_active: data.available
      };

      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      console.error('Error fetching building by ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update building with field mapping
   */
  async updateBuilding(buildingId, updates) {
    console.log('🗄️ [SUPABASE SERVICE] updateBuilding called:', {
      buildingId,
      originalUpdates: updates,
      timestamp: new Date().toISOString()
    });

    try {
      // Use regular client for updates
      const clientToUse = this.client;

      console.log('🔑 [CLIENT SELECTION] Using regular client for update operation');

      // Map frontend field names back to database field names
      const dbUpdates = { ...updates };

      console.log('🔄 [FIELD MAPPING] Before mapping:', dbUpdates);

      if (updates.building_name !== undefined) {
        dbUpdates.name = updates.building_name;
        delete dbUpdates.building_name;
      }

      if (updates.building_short_name !== undefined) {
        dbUpdates.short_name = updates.building_short_name;
        delete dbUpdates.building_short_name;
      }

      if (updates.location !== undefined) {
        dbUpdates.address = updates.location;
        delete dbUpdates.location;
      }

      if (updates.is_active !== undefined) {
        dbUpdates.available = updates.is_active;
        delete dbUpdates.is_active;
      }

      console.log('🔄 [FIELD MAPPING] After mapping:', dbUpdates);

      console.log('📤 [SQL QUERY] Executing Supabase update:', {
        table: 'buildings',
        buildingId,
        dbUpdates,
        operation: 'PATCH',
        endpoint: `${clientToUse.supabaseUrl}/rest/v1/buildings?id=eq.${buildingId}`,
        query: `UPDATE buildings SET ${Object.keys(dbUpdates).map(key => `${key}=$${key}`).join(', ')} WHERE id=${buildingId}`
      });

      // First, let's check if we can read the record to ensure permissions
      console.log('🔐 [PERMISSION CHECK] Testing read access before update...');
      const { data: readTest, error: readError } = await clientToUse
        .from('buildings')
        .select('id, name, updated_at')
        .eq('id', buildingId)
        .single();

      if (readError) {
        console.error('❌ [READ ACCESS ERROR]', readError);
        return { success: false, error: `Cannot read building record: ${readError.message}` };
      }

      console.log('✅ [READ ACCESS OK]', { id: readTest.id, name: readTest.name, lastUpdate: readTest.updated_at });

      // Test a simple update first to check permissions
      console.log('🧪 [TEST UPDATE] Trying simple updated_at field...');
      const testUpdate = {
        updated_at: new Date().toISOString()
      };

      const { data: testData, error: testError } = await clientToUse
        .from('buildings')
        .update(testUpdate)
        .eq('id', buildingId)
        .select('id, updated_at');

      console.log('🧪 [TEST RESULT]', { testData, testError });

      if (testError) {
        console.error('❌ [TEST UPDATE FAILED]', testError);
        return { success: false, error: `Test update failed: ${testError.message}` };
      }

      // Try updating fields one by one to identify problematic fields
      console.log('🔍 [INCREMENTAL UPDATE] Trying individual field updates...');
      const updateResults = {};

      // Special handling for coordinate fields - update them together
      if (dbUpdates.latitude && dbUpdates.longitude) {
        console.log('🌍 [COORDINATE UPDATE] Updating coordinates together...');

        const coordinateUpdate = {
          latitude: dbUpdates.latitude,
          longitude: dbUpdates.longitude,
          updated_at: new Date().toISOString()
        };

        const { data: coordData, error: coordError } = await clientToUse
          .from('buildings')
          .update(coordinateUpdate)
          .eq('id', buildingId)
          .select('id, latitude, longitude, updated_at');

        updateResults['coordinates'] = {
          success: !coordError,
          error: coordError?.message,
          data: coordData?.[0]
        };

        console.log('📊 [COORDINATES RESULT]', updateResults['coordinates']);

        if (coordError) {
          console.error('❌ [COORDINATES ERROR]', coordError);
        }

        // Remove coordinate fields from further individual updates
        delete dbUpdates.latitude;
        delete dbUpdates.longitude;
      }

      // Update remaining fields individually
      for (const [fieldName, fieldValue] of Object.entries(dbUpdates)) {
        console.log(`🔧 [FIELD UPDATE] Updating ${fieldName} = ${fieldValue}`);

        const singleFieldUpdate = {
          [fieldName]: fieldValue,
          updated_at: new Date().toISOString()
        };

        const { data: fieldData, error: fieldError } = await clientToUse
          .from('buildings')
          .update(singleFieldUpdate)
          .eq('id', buildingId)
          .select(`id, ${fieldName}, updated_at`);

        updateResults[fieldName] = {
          success: !fieldError,
          error: fieldError?.message,
          data: fieldData?.[0]
        };

        console.log(`📊 [${fieldName} RESULT]`, updateResults[fieldName]);

        if (fieldError) {
          console.error(`❌ [${fieldName} ERROR]`, fieldError);
        }
      }

      console.log('📋 [ALL FIELD RESULTS]', updateResults);

      console.log('📋 [ALL FIELD RESULTS]', updateResults);

      // Now try the original bulk update (should work now since coordinates are updated together)
      console.log('🔄 [BULK UPDATE] Attempting original bulk update...');

      // Reconstruct the update object, but since coordinates were already updated, 
      // we only need to update the remaining fields
      const remainingUpdates = { ...updates };

      // Remove coordinate fields if they exist (already updated above)
      if (remainingUpdates.latitude || remainingUpdates.longitude) {
        delete remainingUpdates.latitude;
        delete remainingUpdates.longitude;
        console.log('ℹ️ [BULK UPDATE] Coordinates already updated, updating remaining fields:', Object.keys(remainingUpdates));
      }

      // If there are remaining fields to update, do a final batch update
      if (Object.keys(remainingUpdates).length > 0) {
        const finalDbUpdates = { ...remainingUpdates };

        // Apply field mapping to remaining updates
        if (remainingUpdates.building_name !== undefined) {
          finalDbUpdates.name = remainingUpdates.building_name;
          delete finalDbUpdates.building_name;
        }
        if (remainingUpdates.building_short_name !== undefined) {
          finalDbUpdates.short_name = remainingUpdates.building_short_name;
          delete finalDbUpdates.building_short_name;
        }
        if (remainingUpdates.location !== undefined) {
          finalDbUpdates.address = remainingUpdates.location;
          delete finalDbUpdates.location;
        }
        if (remainingUpdates.is_active !== undefined) {
          finalDbUpdates.available = remainingUpdates.is_active;
          delete finalDbUpdates.is_active;
        }

        const { data, error } = await clientToUse
          .from('buildings')
          .update(finalDbUpdates)
          .eq('id', buildingId)
          .select('*');

        console.log('📥 [FINAL BULK UPDATE]', { data, error });
      } else {
        console.log('ℹ️ [SKIP BULK UPDATE] All fields updated individually');
        // Just query the final state
        const { data, error } = await clientToUse
          .from('buildings')
          .select('*')
          .eq('id', buildingId)
          .single();

        console.log('📥 [FINAL STATE QUERY]', { data, error });

        if (!error && data) {
          return {
            success: true,
            data: data,
            incrementalUpdate: true
          };
        }
      }

      // The verification logic continues as before, but we'll skip it since 
      // coordinates should have been updated successfully above
      console.log('✅ [COORDINATE UPDATE SUCCESS] Geocoding completed successfully');

      // Query final building state
      const { data: finalData, error: finalError } = await clientToUse
        .from('buildings')
        .select('*')
        .eq('id', buildingId)
        .single();

      if (finalError) {
        console.error('❌ [FINAL QUERY ERROR]', finalError);
        return { success: false, error: `Failed to query updated building: ${finalError.message}` };
      }

      console.log('✅ [FINAL SUCCESS] Building updated with coordinates:', finalData);
      return {
        success: true,
        data: finalData,
        coordinateUpdateMethod: 'incremental'
      };
    } catch (error) {
      console.error('💥 [SUPABASE EXCEPTION] Error updating building:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all rooms with building information
   */
  async getRooms(options = {}) {
    try {
      let query = this.client
        .from('rooms')
        .select(`
          id, name, eid, url, room_type, capacity, gtype, available, building_id, created_at, updated_at,
          buildings (
            id, name, short_name, address
          )
        `);

      // Apply filters if provided
      if (options.available !== undefined) {
        query = query.eq('available', options.available);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      // Map database fields to frontend expected field names
      const mappedData = data.map(room => ({
        ...room,
        // Add legacy field names for backward compatibility
        room_name: room.name,
        is_active: room.available,
        // Add building information for easy access
        building_code: room.buildings?.short_name || 'unknown',
        building_name: room.buildings?.name || 'Unknown Building'
      }));

      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      console.error('Error fetching all rooms:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get rooms by building ID with field mapping
   */
  async getRoomsByBuilding(buildingId, options = {}) {
    try {
      let query = this.client
        .from('rooms')
        .select('id, name, eid, url, room_type, capacity, gtype, available, building_id, created_at, updated_at')
        .eq('building_id', buildingId);

      // Apply filters if provided
      if (options.available !== undefined) {
        query = query.eq('available', options.available);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      // Map database fields to frontend expected field names
      const mappedData = data.map(room => ({
        ...room,
        // Add legacy field names for backward compatibility
        room_name: room.name,
        is_active: room.available
      }));

      return {
        success: true,
        data: { rooms: mappedData }
      };
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new room
   */
  async createRoom(roomData) {
    try {
      const { data, error } = await this.client
        .from('rooms')
        .insert([roomData])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating room:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing room
   */
  async updateRoom(roomId, roomData) {
    try {
      const { data, error } = await this.client
        .from('rooms')
        .update(roomData)
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating room:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get system monitoring data
   */
  async getSystemStats() {
    try {
      // Get recent access logs
      const { data: accessLogs, error: accessError } = await this.client
        .from('access_logs')
        .select('method, url, status_code, response_time_ms, timestamp')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (accessError) {
        console.warn('Could not fetch access logs:', accessError.message);
      }

      // Get error logs
      const { data: errorLogs, error: errorLogError } = await this.client
        .from('error_logs')
        .select('error_level, error_type, error_message, service_name, created_at, is_resolved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (errorLogError) {
        console.warn('Could not fetch error logs:', errorLogError.message);
      }

      // Get system status
      const { data: systemStatus, error: statusError } = await this.client
        .from('system_status')
        .select('service_name, service_type, status, response_time_ms, check_timestamp')
        .order('check_timestamp', { ascending: false })
        .limit(20);

      if (statusError) {
        console.warn('Could not fetch system status:', statusError.message);
      }

      return {
        success: true,
        data: {
          accessLogs: accessLogs || [],
          errorLogs: errorLogs || [],
          systemStatus: systemStatus || [],
          hasMonitoring: !!(accessLogs || errorLogs || systemStatus)
        }
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId, status, reason = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'cancelled' && reason) {
        updateData.cancellation_reason = reason;
        updateData.cancelled_at = new Date().toISOString();
      }

      const { data, error } = await this.client
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data[0]
      };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update booking (admin function - can update all fields except email)
   */
  async updateBooking(bookingId, updateData) {
    try {
      // Prepare update data, excluding fields that shouldn't be updated
      const allowedFields = [
        'user_name', 'booking_date', 'start_time', 'end_time',
        'duration_minutes', 'group_size', 'status', 'purpose',
        'notes', 'room_id', 'building_id'
      ];

      const filteredUpdateData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredUpdateData[field] = updateData[field];
        }
      });

      // Always update the timestamp
      filteredUpdateData.updated_at = new Date().toISOString();

      const { data, error } = await this.client
        .from('bookings')
        .update(filteredUpdateData)
        .eq('id', bookingId)
        .select(`
          *, 
          buildings(name, short_name),
          rooms(name)
        `);

      if (error) {
        return { success: false, error: error.message };
      }

      // Transform the response to match expected format
      const booking = data[0];
      const transformedData = {
        ...booking,
        building_name: booking.buildings?.name,
        building_short_name: booking.buildings?.short_name,
        room_name: booking.rooms?.name
      };

      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      console.error('Error updating booking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get system configuration
   */
  async getSystemConfig() {
    try {
      const { data, error } = await this.client
        .from('system_config')
        .select('config_key, config_value, description, is_active')
        .eq('is_active', true);

      if (error) {
        return { success: false, error: error.message };
      }

      // Convert to key-value object
      const config = {};
      data.forEach(item => {
        config[item.config_key] = item.config_value;
      });

      return {
        success: true,
        data: {
          config,
          configItems: data
        }
      };
    } catch (error) {
      console.error('Error fetching system config:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get dashboard overview data
   */
  async getDashboardOverview() {
    try {
      const [bookingStats, userStats, buildingStats, systemStats] = await Promise.all([
        this.getBookingStats(),
        this.getUserStats(),
        this.getBuildingStats(),
        this.getSystemStats()
      ]);

      return {
        success: true,
        data: {
          bookings: bookingStats.success ? bookingStats.data : {},
          users: userStats.success ? userStats.data : {},
          buildings: buildingStats.success ? buildingStats.data : {},
          system: systemStats.success ? systemStats.data : {}
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export service instance
const supabaseService = new SupabaseService();
export default supabaseService;
