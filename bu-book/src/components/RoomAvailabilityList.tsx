import { useState, useEffect, useMemo } from 'react';
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
 * Displays rooms grouped by building, with available and unavailable rooms in each building
 */
export default function RoomAvailabilityList({ 
  buildings, 
  timeSelection, 
  availabilityStatus
}: RoomAvailabilityListProps) {
  const [selectedRoom, setSelectedRoom] = useState<ExtendedRoom | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set());

  // Group rooms by building, then by availability
  const buildingGroups = useMemo(() => {
    const groups: { 
      [buildingId: string]: { 
        building: ModernBuilding; 
        availableRooms: ExtendedRoom[]; 
        unavailableRooms: ExtendedRoom[]; 
      } 
    } = {};

    buildings.forEach(building => {
      if (building.rooms && building.rooms.length > 0) {
        const availableRooms: ExtendedRoom[] = [];
        const unavailableRooms: ExtendedRoom[] = [];

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

        // Only add building if it has rooms
        if (availableRooms.length > 0 || unavailableRooms.length > 0) {
          groups[building.id] = {
            building,
            availableRooms,
            unavailableRooms
          };
        }
      }
    });

    return groups;
  }, [buildings, availabilityStatus]);

  // Default to expand all buildings on first load
  useEffect(() => {
    const buildingIds = Object.keys(buildingGroups);
    if (buildingIds.length > 0 && expandedBuildings.size === 0) {
      setExpandedBuildings(new Set(buildingIds));
    }
  }, [buildingGroups, expandedBuildings.size]);

  const toggleBuilding = (buildingId: string) => {
    setExpandedBuildings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(buildingId)) {
        newSet.delete(buildingId);
      } else {
        newSet.add(buildingId);
      }
      return newSet;
    });
  };

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

      {/* Buildings Section */}
      {Object.keys(buildingGroups).length > 0 ? (
        Object.values(buildingGroups).map(({ building, availableRooms, unavailableRooms }) => {
          const isExpanded = expandedBuildings.has(building.id);
          
          return (
            <div key={building.id} className="building-section">
              <div className={`building-header ${isExpanded ? 'expanded' : ''}`} onClick={() => toggleBuilding(building.id)}>
                <h3 className="building-title">
                  <button className="toggle-btn">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                  {building.name}
                  <span className="room-count">
                    ({availableRooms.length + unavailableRooms.length} rooms)
                  </span>
                </h3>
                <div className="building-stats">
                  <span className="available-count">
                    {availableRooms.length} available
                  </span>
                  {unavailableRooms.length > 0 && (
                    <span className="unavailable-count">
                      {unavailableRooms.length} unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="building-content">
                  {/* Available Rooms in this Building */}
            {availableRooms.length > 0 && (
              <div className="rooms-subsection available-subsection">
                <h4 className="subsection-title">
                  <span className="status-indicator available"></span>
                  Available ({availableRooms.length})
                </h4>
                <div className="rooms-grid">
                  {availableRooms.map(room => (
                    <div key={room.id} className="room-card available">
                      <div className="room-header">
                        <h5 className="room-name">{room.name}</h5>
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

            {/* Unavailable Rooms in this Building */}
            {unavailableRooms.length > 0 && (
              <div className="rooms-subsection unavailable-subsection">
                <h4 className="subsection-title">
                  <span className="status-indicator unavailable"></span>
                  Unavailable ({unavailableRooms.length})
                </h4>
                <div className="rooms-grid">
                  {unavailableRooms.map(room => (
                    <div key={room.id} className="room-card unavailable">
                      <div className="room-header">
                        <h5 className="room-name">{room.name}</h5>
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
                </div>
              )}
            </div>
          );
        })
      ) : (
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
