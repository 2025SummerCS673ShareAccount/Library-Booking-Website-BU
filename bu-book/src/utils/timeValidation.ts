/**
 * Time validation utilities for preventing past time selections
 * Validates time against Eastern Time (US) timezone
 */

/**
 * Get current date and time in Eastern Time
 * @returns Date object representing current time in ET
 */
export const getCurrentEasternTime = (): Date => {
  const now = new Date();
  // Convert to Eastern Time
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return easternTime;
};

/**
 * Check if selected date and time is in the past
 * @param selectedDate - Selected date in YYYY-MM-DD format
 * @param selectedTime - Selected time in HH:MM format (24-hour)
 * @returns true if the selected time is in the past, false otherwise
 */
export const isPastTime = (selectedDate: string, selectedTime: string): boolean => {
  const currentEasternTime = getCurrentEasternTime();
  
  // Create selected datetime
  const [year, month, day] = selectedDate.split('-').map(Number);
  const [hours, minutes] = selectedTime.split(':').map(Number);
  
  const selectedDateTime = new Date();
  selectedDateTime.setFullYear(year, month - 1, day); // month is 0-indexed
  selectedDateTime.setHours(hours, minutes, 0, 0);
  
  // Convert selected time to Eastern Time
  const selectedEasternTime = new Date(selectedDateTime.toLocaleString("en-US", { timeZone: "America/New_York" }));
  
  return selectedEasternTime <= currentEasternTime;
};

/**
 * Format Eastern Time for display
 * @returns string representing current time in Eastern Time
 */
export const formatEasternTime = (): string => {
  const easternTime = getCurrentEasternTime();
  return easternTime.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
};

/**
 * Get validation error message for past time
 * @param selectedDate - Selected date in YYYY-MM-DD format
 * @param selectedTime - Selected time in HH:MM format
 * @returns Error message string
 */
export const getPastTimeErrorMessage = (selectedDate: string, selectedTime: string): string => {
  const currentTime = formatEasternTime();
  return `You cannot book a room for a past time. 

Selected time: ${selectedDate} ${selectedTime} (Eastern Time)
Current time: ${currentTime}

Please select a future date and time.`;
};
