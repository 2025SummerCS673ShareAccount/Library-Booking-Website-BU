import { useState } from 'react';
import { getBookingByConfirmation } from '../lib/bookingService';
import type { BookingRequest } from '../types/booking';
import '../assets/styles/booking-lookup.css';

interface BookingLookupModalProps {
  onClose: () => void;
}

/**
 * BookingLookupModal component for users to search their booking history
 * Users can search using their email and confirmation code
 */
export default function BookingLookupModal({ onClose }: BookingLookupModalProps) {
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !confirmationCode.trim()) {
      setError('Please enter both email and confirmation code');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const result = await getBookingByConfirmation(email.trim(), confirmationCode.trim().toUpperCase());
      
      if (result) {
        setBooking(result);
      } else {
        setError('No booking found with the provided email and confirmation code');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching for your booking');
    } finally {
      setIsSearching(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className="booking-lookup-overlay" onClick={handleOverlayClick}>
      <div className="booking-lookup-modal">
        <div className="booking-lookup-header">
          <h2>Look Up Your Booking</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        {!booking ? (
          <form className="lookup-form" onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="lookup-email">Email Address</label>
              <input
                type="email"
                id="lookup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmation-code">Confirmation Code</label>
              <input
                type="text"
                id="confirmation-code"
                className="confirmation-input"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                placeholder="Enter your confirmation code"
                maxLength={8}
                required
              />
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="search-btn" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search Booking'}
              </button>
            </div>
          </form>
        ) : (
          <div className="booking-details">
            <div className="booking-info-section">
              <h3>Booking Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Confirmation Code:</label>
                  <span className="confirmation-code">{booking.confirmation_code}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                <div className="info-item">
                  <label>Room ID:</label>
                  <span>{booking.room_id}</span>
                </div>
                <div className="info-item">
                  <label>Date:</label>
                  <span>{formatDate(booking.booking_date)}</span>
                </div>
                <div className="info-item">
                  <label>Time:</label>
                  <span>{booking.start_time} - {booking.end_time}</span>
                </div>
                <div className="info-item">
                  <label>Name:</label>
                  <span>{booking.user_name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{booking.user_email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{booking.user_phone}</span>
                </div>
                {booking.created_at && (
                  <div className="info-item">
                    <label>Booked on:</label>
                    <span>{new Date(booking.created_at).toLocaleString('en-US')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="back-btn" onClick={() => setBooking(null)}>
                Search Another
              </button>
              <button type="button" className="close-btn-alt" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
