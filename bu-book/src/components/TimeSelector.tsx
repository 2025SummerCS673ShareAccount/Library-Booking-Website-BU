import { useState } from 'react';
import '../assets/styles/time-selector.css';

interface TimeSelectorProps {
  onTimeSelect: (startTime: string, duration: number) => void;
  onReset: () => void;
  selectedTime?: string;
  selectedDuration?: number;
}

/**
 * Time Selector Component
 * Allows users to select start time (hour and minute) and duration for room booking
 * Minutes are restricted to 0, 15, 30, 45
 * Duration is between 15 minutes and 3 hours (180 minutes)
 */
export default function TimeSelector({ onTimeSelect, onReset, selectedTime, selectedDuration }: TimeSelectorProps) {
  const [selectedHour, setSelectedHour] = useState<string>(selectedTime ? selectedTime.split(':')[0] : '');
  const [selectedMinute, setSelectedMinute] = useState<string>(selectedTime ? selectedTime.split(':')[1] : '');
  const [duration, setDuration] = useState<number>(selectedDuration || 60);

  // Generate hours from 8 AM to 10 PM (22:00)
  const hours = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8;
    return hour.toString().padStart(2, '0');
  });

  // Minutes can only be 0, 15, 30, 45
  const minutes = ['00', '15', '30', '45'];

  // Duration options in minutes (15 min to 3 hours)
  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 150, label: '2.5 hours' },
    { value: 180, label: '3 hours' }
  ];

  const handleSearch = () => {
    if (!selectedHour || selectedMinute === '') {
      alert('Please select both hour and minute');
      return;
    }

    const startTime = `${selectedHour}:${selectedMinute}`;
    onTimeSelect(startTime, duration);
  };

  const handleReset = () => {
    setSelectedHour('');
    setSelectedMinute('');
    setDuration(60);
    onReset();
  };

  const isValidSelection = selectedHour && selectedMinute !== '';

  return (
    <div className="time-selector">
      <div className="time-selection-form">
        <div className="time-inputs">
          <div className="form-group">
            <label htmlFor="hour-select">Hour</label>
            <select
              id="hour-select"
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="time-select"
            >
              <option value="">Select Hour</option>
              {hours.map(hour => (
                <option key={hour} value={hour}>
                  {hour}:00
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="minute-select">Minute</label>
            <select
              id="minute-select"
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(e.target.value)}
              className="time-select"
            >
              <option value="">Select Minute</option>
              {minutes.map(minute => (
                <option key={minute} value={minute}>
                  :{minute}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="duration-selection">
          <label htmlFor="duration-select">Duration</label>
          <select
            id="duration-select"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="duration-select"
          >
            {durationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {isValidSelection && (
          <div className="time-preview">
            <h3>Selected Time</h3>
            <p>
              <strong>Start:</strong> {selectedHour}:{selectedMinute}
            </p>
            <p>
              <strong>Duration:</strong> {durationOptions.find(opt => opt.value === duration)?.label}
            </p>
            <p>
              <strong>End:</strong> {(() => {
                const startHour = parseInt(selectedHour);
                const startMin = parseInt(selectedMinute);
                const totalMinutes = startHour * 60 + startMin + duration;
                const endHour = Math.floor(totalMinutes / 60);
                const endMin = totalMinutes % 60;
                return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
              })()}
            </p>
          </div>
        )}

        <div className="time-selector-actions">
          <button 
            className="reset-btn" 
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>
          <button 
            className="search-btn"
            onClick={handleSearch}
            disabled={!isValidSelection}
            type="button"
          >
            Search Available Rooms
          </button>
        </div>
      </div>
    </div>
  );
}
