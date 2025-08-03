import { useState } from 'react';
import BookingModal from './BookingModal';
import type { Room } from '../types/building';
import '../assets/styles/booking-button.css';

interface BookingButtonProps {
  room: Room;
  buildingName: string;
}

/**
 * BookingButton component that triggers the booking modal for a specific room
 * @param room - The room object containing room details
 * @param buildingName - The name of the building where the room is located
 */
export default function BookingButton({ room, buildingName }: BookingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookingClick = () => {
    if (!room.available) {
      alert('This room is currently unavailable for booking.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBookingSuccess = () => {
    setIsModalOpen(false);
    // Optionally trigger a refresh of the room availability
    alert('Booking request submitted successfully! You will receive a confirmation email shortly.');
  };

  return (
    <>
      <button
        className={`booking-btn ${room.available ? 'available' : 'unavailable'}`}
        onClick={handleBookingClick}
        disabled={!room.available}
        title={room.available ? 'Click to book this room' : 'Room is currently unavailable'}
      >
        {room.available ? 'Book' : 'Unavailable'}
      </button>

      {isModalOpen && (
        <BookingModal
          room={room}
          buildingName={buildingName}
          onClose={handleCloseModal}
          onSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
}
