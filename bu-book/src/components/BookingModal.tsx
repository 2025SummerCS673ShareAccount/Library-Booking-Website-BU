import { useState, useEffect } from 'react';
import type { Room } from '../types/building';
import type { BookingFormData, TimeSlot } from '../types/booking';
import { submitBookingRequest } from '../lib/bookingService';
import '../assets/styles/booking-modal.css';

interface BookingModalProps {
  room: Room;
  buildingName: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * BookingModal component for handling room booking requests
 * Displays a form where users can input their details and select time slots
 */
export default function BookingModal({ room, buildingName, onClose, onSuccess }: BookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    room_id: room.id,
    user_name: '',
    user_email: '',
    bu_id: '',
    user_phone: '',
    booking_date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    purpose: '',
    notes: ''
  });

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate available time slots (9 AM to 9 PM in 1-hour intervals)
  useEffect(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 21; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({
        start,
        end,
        available: true // In a real app, this would be checked against existing bookings
      });
    }
    setAvailableSlots(slots);
  }, []);

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, booking_date: today }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = 'Name is required';
    }

    if (!formData.user_email.trim()) {
      newErrors.user_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.user_email)) {
      newErrors.user_email = 'Please enter a valid email address';
    }

    if (!formData.user_phone?.trim()) {
      newErrors.user_phone = 'Phone number is required';
    }

    if (!formData.booking_date) {
      newErrors.booking_date = 'Booking date is required';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitBookingRequest({
        ...formData,
        status: 'pending'
      });
      onSuccess();
    } catch (error) {
      console.error('Booking submission failed:', error);
      alert('Failed to submit booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="booking-modal-overlay" onClick={handleOverlayClick}>
      <div className="booking-modal">
        <div className="booking-modal-header">
          <h2>Book Room: {room.title}</h2>
          <p className="building-info">{buildingName} • Capacity: {room.capacity}</p>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="user_name">Full Name *</label>
            <input
              type="text"
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onChange={handleInputChange}
              className={errors.user_name ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {errors.user_name && <span className="error-message">{errors.user_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="user_email">Email Address *</label>
            <input
              type="email"
              id="user_email"
              name="user_email"
              value={formData.user_email}
              onChange={handleInputChange}
              className={errors.user_email ? 'error' : ''}
              placeholder="Enter your email address"
            />
            {errors.user_email && <span className="error-message">{errors.user_email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="user_phone">Phone Number *</label>
            <input
              type="tel"
              id="user_phone"
              name="user_phone"
              value={formData.user_phone}
              onChange={handleInputChange}
              className={errors.user_phone ? 'error' : ''}
              placeholder="Enter your phone number"
            />
            {errors.user_phone && <span className="error-message">{errors.user_phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="booking_date">Booking Date *</label>
            <input
              type="date"
              id="booking_date"
              name="booking_date"
              value={formData.booking_date}
              onChange={handleInputChange}
              className={errors.booking_date ? 'error' : ''}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.booking_date && <span className="error-message">{errors.booking_date}</span>}
          </div>

          <div className="time-selection">
            <div className="form-group">
              <label htmlFor="start_time">Start Time *</label>
              <select
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className={errors.start_time ? 'error' : ''}
              >
                <option value="">Select start time</option>
                {availableSlots.map((slot, index) => (
                  <option key={index} value={slot.start} disabled={!slot.available}>
                    {slot.start}
                  </option>
                ))}
              </select>
              {errors.start_time && <span className="error-message">{errors.start_time}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end_time">End Time *</label>
              <select
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                className={errors.end_time ? 'error' : ''}
              >
                <option value="">Select end time</option>
                {availableSlots.map((slot, index) => (
                  <option key={index} value={slot.end} disabled={!slot.available}>
                    {slot.end}
                  </option>
                ))}
              </select>
              {errors.end_time && <span className="error-message">{errors.end_time}</span>}
            </div>
          </div>

          <div className="booking-info">
            <p><strong>Note:</strong> You will receive a confirmation email with your booking details and confirmation code once your request is processed.</p>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
