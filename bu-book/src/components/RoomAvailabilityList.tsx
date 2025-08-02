import { useState } from 'react';
import type { ModernBuilding } from '../lib/fetchBuildingsWithModernApi';
import type { TimeSelection, RoomAvailabilityStatus } from '../types/booking';
import '../assets/styles/room-availability-list.css';

interface ExtendedRoom {
  id: string;
  name: string;
  building_name: string;
  building_short_name: string;
  capacity: number;
  room_type: string;
  available: boolean;
  availability_status?: RoomAvailabilityStatus;
}

interface RoomAvailabilityListProps {
  buildings: ModernBuilding[];
  timeSelection: TimeSelection;
  availabilityStatus?: RoomAvailabilityStatus[];
  onBookingComplete?: () => void;
}

/**
 * Room Availability List Component
 * Displays rooms separated by availability status
 * Available rooms are shown first, then unavailable rooms
 */
export default function RoomAvailabilityList({ 
  buildings, 
  timeSelection, 
  availabilityStatus
}: RoomAvailabilityListProps) {
  const [selectedRoom, setSelectedRoom] = useState<ExtendedRoom | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Group rooms by availability
  const availableRooms: ExtendedRoom[] = [];
  const unavailableRooms: ExtendedRoom[] = [];

  buildings.forEach(building => {
    if (building.rooms) {
      building.rooms.forEach((room) => {
        const status = availabilityStatus?.find(s => s.room_id === parseInt(room.id));
        const roomWithBuilding: ExtendedRoom = {
          id: room.id,
          name: room.name || room.room_name,
          building_name: building.name,
          building_short_name: building.short_name || building.name.substring(0, 3).toUpperCase(),
          capacity: room.capacity,
          room_type: room.room_type,
          available: room.available,
          availability_status: status
        };

        if (status?.available !== false && room.available) {
          availableRooms.push(roomWithBuilding);
        } else {
          unavailableRooms.push(roomWithBuilding);
        }
      });
    }
  });

  const handleSelectRoom = (room: ExtendedRoom) => {
    setSelectedRoom(room);
    setIsBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
    setSelectedRoom(null);
  };

  const getStatusMessage = (status: RoomAvailabilityStatus) => {
    switch (status.status) {
      case 'conflict':
        return status.conflict_details 
          ? `Order Conflict. Someone booked this room from ${status.conflict_details.conflicting_booking.start_time} to ${status.conflict_details.conflicting_booking.end_time}`
          : 'Room is already booked for this time';
      case 'closed':
        return 'Room is currently closed';
      case 'maintenance':
        return 'Room is under maintenance';
      default:
        return status.message || 'Room is unavailable';
    }
  };

  return (
    <div className="room-availability-list">
      <div className="availability-header">
        <h2>Available Rooms</h2>
        <div className="time-info">
          <span className="time-range">
            {timeSelection.start_time} - {timeSelection.end_time}
          </span>
          <span className="duration">
            ({Math.floor(timeSelection.duration_minutes / 60)}h {timeSelection.duration_minutes % 60}m)
          </span>
        </div>
      </div>

      {/* Available Rooms Section */}
      {availableRooms.length > 0 && (
        <div className="rooms-section available-section">
          <h3 className="section-title">
            <span className="status-indicator available"></span>
            Available Rooms ({availableRooms.length})
          </h3>
          <div className="rooms-grid">
            {availableRooms.map(room => (
              <div key={room.id} className="room-card available">
                <div className="room-header">
                  <h4 className="room-name">{room.name}</h4>
                  <span className="building-name">{room.building_name}</span>
                </div>
                <div className="room-details">
                  <div className="room-info">
                    <span className="capacity">Capacity: {room.capacity}</span>
                    <span className="room-type">{room.room_type || 'Study Room'}</span>
                  </div>
                  <div className="room-status">
                    <span className="status-badge available">Available</span>
                  </div>
                </div>
                <button 
                  className="select-btn available"
                  onClick={() => handleSelectRoom(room)}
                >
                  Select Room
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unavailable Rooms Section */}
      {unavailableRooms.length > 0 && (
        <div className="rooms-section unavailable-section">
          <h3 className="section-title">
            <span className="status-indicator unavailable"></span>
            Unavailable Rooms ({unavailableRooms.length})
          </h3>
          <div className="rooms-grid">
            {unavailableRooms.map(room => (
              <div key={room.id} className="room-card unavailable">
                <div className="room-header">
                  <h4 className="room-name">{room.name}</h4>
                  <span className="building-name">{room.building_name}</span>
                </div>
                <div className="room-details">
                  <div className="room-info">
                    <span className="capacity">Capacity: {room.capacity}</span>
                    <span className="room-type">{room.room_type || 'Study Room'}</span>
                  </div>
                  <div className="room-status">
                    <span className="status-badge unavailable">
                      {room.availability_status?.status === 'conflict' ? 'Conflict' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <div className="unavailable-message">
                  {room.availability_status && getStatusMessage(room.availability_status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No rooms found */}
      {availableRooms.length === 0 && unavailableRooms.length === 0 && (
        <div className="no-rooms">
          <p>No rooms found for the selected time. Please try a different time slot.</p>
        </div>
      )}

      {/* Booking Modal - TODO: Implement RoomBookingModal */}
      {isBookingModalOpen && selectedRoom && (
        <div className="booking-modal-placeholder">
          <p>Booking modal for room: {selectedRoom.name}</p>
          <button onClick={handleCloseModal}>Close</button>
        </div>
      )}
    </div>
  );
}
