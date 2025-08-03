import { useState } from 'react';
import type { BookingRequest } from '../types/booking';
import { submitBookingRequest, verifyBookingCode } from '../lib/bookingService';
import '../assets/styles/room-booking-modal.css';

interface ExtendedRoom {
  id: string;
  name: string;
  building_name: string;
  building_short_name: string;
  capacity: number;
  room_type: string;
  available: boolean;
}

interface RoomBookingModalProps {
  room: ExtendedRoom;
  timeSelection: {
    start_time: string;
    end_time: string;
    duration_minutes: number;
    date: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

type BookingStep = 'form' | 'verification' | 'confirmed';

export default function RoomBookingModal({ 
  room, 
  timeSelection, 
  onClose, 
  onSuccess 
}: RoomBookingModalProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingId, setBookingId] = useState<string>('');
  
  // Form data state
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    purpose: '',
    notes: ''
  });

  // Verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = 'Name is required';
    }

    if (!formData.user_email.trim()) {
      newErrors.user_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      newErrors.user_email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const bookingRequest: BookingRequest = {
        room_id: parseInt(room.id),
        user_name: formData.user_name,
        user_email: formData.user_email,
        booking_date: timeSelection.date,
        start_time: timeSelection.start_time,
        end_time: timeSelection.end_time,
        duration_minutes: timeSelection.duration_minutes,
        purpose: formData.purpose,
        notes: formData.notes,
        status: 'pending',
        verification_status: 'pending'
      };

      // TODO: Replace with actual API call
      const response = await submitBookingRequest(bookingRequest);
      
      if (response.success) {
        setBookingId(response.booking_id || '');
        setCurrentStep('verification');
      } else {
        throw new Error(response.error || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Booking submission failed:', error);
      setErrors({ submit: 'Failed to submit booking request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setVerificationError('Please enter the verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual verification API call
      const response = await verifyBookingCode(bookingId, verificationCode);
      
      if (response.success) {
        setCurrentStep('confirmed');
      } else {
        setVerificationError(response.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    if (currentStep === 'confirmed') {
      onSuccess();
    }
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const renderBookingForm = () => (
    <div className="booking-form">
      <h3>Book Room: {room.name}</h3>
      <div className="booking-details">
        <p><strong>Building:</strong> {room.building_name}</p>
        <p><strong>Date:</strong> {timeSelection.date}</p>
        <p><strong>Time:</strong> {timeSelection.start_time} - {timeSelection.end_time}</p>
        <p><strong>Duration:</strong> {Math.floor(timeSelection.duration_minutes / 60)}h {timeSelection.duration_minutes % 60}m</p>
        <p><strong>Capacity:</strong> {room.capacity} people</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label htmlFor="user_name">Full Name *</label>
          <input
            id="user_name"
            type="text"
            value={formData.user_name}
            onChange={(e) => handleInputChange('user_name', e.target.value)}
            className={errors.user_name ? 'error' : ''}
          />
          {errors.user_name && <span className="error-text">{errors.user_name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="user_email">Email Address *</label>
          <input
            id="user_email"
            type="email"
            value={formData.user_email}
            onChange={(e) => handleInputChange('user_email', e.target.value)}
            className={errors.user_email ? 'error' : ''}
          />
          {errors.user_email && <span className="error-text">{errors.user_email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="purpose">Purpose (Optional)</label>
          <select
            id="purpose"
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
          >
            <option value="">Select purpose</option>
            <option value="study">Individual Study</option>
            <option value="group_study">Group Study</option>
            <option value="meeting">Meeting</option>
            <option value="presentation">Presentation</option>
            <option value="research">Research</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes (Optional)</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            placeholder="Any special requirements or notes..."
          />
        </div>
      </div>

      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <div className="form-actions">
        <button type="button" onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button 
          type="button" 
          onClick={handleSubmitBooking}
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
        </button>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="verification-step">
      <div className="verification-icon">📧</div>
      <h3>Email Verification</h3>
      <p>We've sent a verification code to:</p>
      <p className="email-address">{formData.user_email}</p>
      
      <div className="verification-form">
        <div className="form-group">
          <label htmlFor="verification_code">Enter Verification Code</label>
          <input
            id="verification_code"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className={verificationError ? 'error' : ''}
            placeholder="Enter 6-digit code"
            maxLength={6}
          />
          {verificationError && <span className="error-text">{verificationError}</span>}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => setCurrentStep('form')} className="back-btn">
            Back to Form
          </button>
          <button 
            type="button" 
            onClick={handleVerifyCode}
            disabled={isSubmitting || !verificationCode.trim()}
            className="verify-btn"
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Confirm Booking'}
          </button>
        </div>
      </div>

      <div className="resend-section">
        <p>Didn't receive the code?</p>
        <button type="button" className="resend-btn">
          Resend Code
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="confirmation-step">
      <div className="success-icon">✅</div>
      <h3>Booking Confirmed!</h3>
      <p>Your room booking has been successfully confirmed.</p>
      
      <div className="booking-summary">
        <h4>Booking Details:</h4>
        <p><strong>Room:</strong> {room.name}</p>
        <p><strong>Building:</strong> {room.building_name}</p>
        <p><strong>Date:</strong> {timeSelection.date}</p>
        <p><strong>Time:</strong> {timeSelection.start_time} - {timeSelection.end_time}</p>
        <p><strong>Booking ID:</strong> {bookingId}</p>
      </div>
      
      <p className="confirmation-note">
        A confirmation email has been sent to {formData.user_email}
      </p>
      
      <div className="confirmation-actions">
        <button 
          type="button" 
          onClick={() => {
            onSuccess();
            onClose();
          }}
          className="confirm-close-btn"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="room-booking-modal-overlay" onClick={handleOverlayClick}>
      <div className="room-booking-modal">
        <button className="close-btn" onClick={handleClose}>×</button>
        
        <div className="step-indicator">
          <div className={`step ${currentStep === 'form' ? 'active' : 'completed'}`}>
            <span>1</span> Details
          </div>
          <div className={`step ${currentStep === 'verification' ? 'active' : currentStep === 'confirmed' ? 'completed' : ''}`}>
            <span>2</span> Verification
          </div>
          <div className={`step ${currentStep === 'confirmed' ? 'active' : ''}`}>
            <span>3</span> Confirmed
          </div>
        </div>

        <div className="modal-content">
          {currentStep === 'form' && renderBookingForm()}
          {currentStep === 'verification' && renderVerificationStep()}
          {currentStep === 'confirmed' && renderConfirmationStep()}
        </div>
      </div>
    </div>
  );
}
