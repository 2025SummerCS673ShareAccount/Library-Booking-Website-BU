// Test file for time validation
import { isPastTime, getPastTimeErrorMessage, getCurrentEasternTime, formatEasternTime } from '../src/utils/timeValidation.ts';

// Test current time
console.log('Current Eastern Time:', formatEasternTime());

// Test past time (should return true)
const pastDate = '2025-01-01';
const pastTime = '10:00';
console.log(`Is ${pastDate} ${pastTime} in the past?`, isPastTime(pastDate, pastTime));

// Test future time (should return false)  
const futureDate = '2025-12-31';
const futureTime = '23:59';
console.log(`Is ${futureDate} ${futureTime} in the past?`, isPastTime(futureDate, futureTime));

// Test today's time in the past (should return true if current time is past the test time)
const today = new Date().toISOString().split('T')[0];
const pastTimeToday = '01:00';
console.log(`Is today ${pastTimeToday} in the past?`, isPastTime(today, pastTimeToday));

// Test error message
console.log('Error message for past time:');
console.log(getPastTimeErrorMessage(pastDate, pastTime));
