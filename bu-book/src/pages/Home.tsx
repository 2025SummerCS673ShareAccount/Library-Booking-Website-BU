import { useState } from 'react';
import '../assets/styles/home.css';
import Map from '../components/Map'
import ConnectionStatus from '../components/ConnectionStatus';
import RoomAvailabilityList from '../components/RoomAvailabilityList';
import NotificationContainer from '../components/NotificationContainer';
import { useGlobalApi } from '../contexts/GlobalApiContext';
import { useNotifications } from '../hooks/useNotifications';
import type { TimeSelection } from '../types/booking';
import { isPastTime } from '../utils/timeValidation';

export default function Home() {
  const { buildings, isLoading, error } = useGlobalApi();
  const { notifications, removeNotification, showPastTimeError } = useNotifications();
  const [timeSelection, setTimeSelection] = useState<TimeSelection | null>(null);
  
  // Get current time for default values
  const getCurrentTimeDefaults = () => {
    const now = new Date();
    let currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    let targetDate = now;
    
    // If current time is after 22:00 (10 PM), set to next day 08:00
    if (currentHour >= 22) {
      targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Add one day
      currentHour = 8; // Set to 8 AM
      const nextQuarter = '00';
      const formattedHour = currentHour.toString().padStart(2, '0');
      return { 
        currentHour: formattedHour, 
        nextQuarter, 
        defaultDate: targetDate.toISOString().split('T')[0] 
      };
    }
    
    // If current time is before 08:00 (8 AM), set to 08:00 today
    if (currentHour < 8) {
      currentHour = 8;
      const nextQuarter = '00';
      const formattedHour = currentHour.toString().padStart(2, '0');
      return { 
        currentHour: formattedHour, 
        nextQuarter,
        defaultDate: targetDate.toISOString().split('T')[0]
      };
    }
    
    // Normal time logic (8 AM - 10 PM)
    let nextQuarter;
    if (currentMinute <= 15) {
      nextQuarter = '15';
    } else if (currentMinute <= 30) {
      nextQuarter = '30';
    } else if (currentMinute <= 45) {
      nextQuarter = '45';
    } else {
      // If minutes are 46-59, move to next hour with 00 minutes
      nextQuarter = '00';
      currentHour = currentHour + 1;
      
      // If this pushes us past 22:00, move to next day 08:00
      if (currentHour >= 22) {
        targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        currentHour = 8;
        nextQuarter = '00';
      }
    }
    
    const formattedHour = currentHour.toString().padStart(2, '0');
    return { 
      currentHour: formattedHour, 
      nextQuarter,
      defaultDate: targetDate.toISOString().split('T')[0]
    };
  };

  const { currentHour, nextQuarter, defaultDate } = getCurrentTimeDefaults();
  
  // Time selection form states
  const [selectedHour, setSelectedHour] = useState<string>(currentHour);
  const [selectedMinute, setSelectedMinute] = useState<string>(nextQuarter);
  const [duration, setDuration] = useState<number>(60);
  const [selectedDate, setSelectedDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0] // Use calculated default date
  );

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
    if (!selectedHour || !selectedMinute || !selectedDate) {
      alert('Please select date, hour and minute');
      return;
    }

    const startTime = `${selectedHour}:${selectedMinute}`;
    
    // Check if the selected time is in the past
    if (isPastTime(selectedDate, startTime)) {
      showPastTimeError();
      return;
    }

    const selection: TimeSelection = {
      start_time: startTime,
      duration_minutes: duration,
      end_time: calculateEndTime(startTime, duration),
      date: selectedDate
    };
    setTimeSelection(selection);
  };

  const handleReset = () => {
    const { currentHour, nextQuarter, defaultDate } = getCurrentTimeDefaults();
    setSelectedHour(currentHour);
    setSelectedMinute(nextQuarter);
    setDuration(60);
    setSelectedDate(defaultDate || new Date().toISOString().split('T')[0]); // Use calculated default date
    setTimeSelection(null);
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + durationMinutes);
    return `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
  };


  return (
    <div className="home-container">
      <header className="home-header">
        <h1>BU Book</h1>
        <div className="header-controls">
          <ConnectionStatus />
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ Error loading data: {error}</span>
        </div>
      )}

      {isLoading && buildings.length === 0 && (
        <div className="loading-banner">
          <span>Loading buildings...</span>
        </div>
      )}

      <div className="list-map-wrapper">
        <aside className="building-list-container">
          {/* 上半部分：地图区域 */}
          <section className="map-area">
            <Map />
          </section>

          {/* 下半部分：预约区域 */}
          <div className="booking-section">
            {/* 时间选择表单 */}
            <div className="time-selection-form">
              <div className="time-inputs">
                <div className="form-group">
                  <label htmlFor="date-select">Date</label>
                  <input
                    id="date-select"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    className="date-select"
                  />
                </div>

                <div className="form-group time-group">
                  <div className="time-field">
                    <label htmlFor="hour-select">Hour</label>
                    <select
                      id="hour-select"
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(e.target.value)}
                      className="time-select"
                    >
                      {hours.map(hour => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="time-field">
                    <label htmlFor="minute-select">Minute</label>
                    <select
                      id="minute-select"
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      className="time-select"
                    >
                      {minutes.map(minute => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
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
              </div>

              <div className="control-buttons">
                <button 
                  type="button" 
                  onClick={handleReset}
                  className="reset-btn"
                >
                  Reset
                </button>
                <button 
                  type="button" 
                  onClick={handleSearch}
                  className="search-btn"
                  disabled={!selectedHour || !selectedMinute || !selectedDate}
                >
                  Search Available Rooms
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* 右侧：房间可用性列表 - 现在是主要功能区域 */}
        <section className="room-availability-area">
          {timeSelection ? (
            <RoomAvailabilityList 
              timeSelection={timeSelection}
              buildings={buildings}
            />
          ) : (
            <div className="no-time-selection">
              <p>Please select a time to see available rooms</p>
            </div>
          )}
        </section>
      </div>

      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
    </div>
  );
}
