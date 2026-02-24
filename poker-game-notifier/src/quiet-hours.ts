import { DateTime } from 'luxon';

/**
 * Check if the current time falls within quiet hours for a given timezone.
 * Handles midnight-crossing ranges (e.g., 22:00 - 06:00).
 */
export function isQuietHours(
  quietStart: string,
  quietEnd: string,
  timezone: string = 'America/Los_Angeles'
): boolean {
  const now = DateTime.now().setZone(timezone);

  const [startHour, startMinute] = quietStart.split(':').map(Number);
  const [endHour, endMinute] = quietEnd.split(':').map(Number);

  const currentMinutes = now.hour * 60 + now.minute;
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (startMinutes <= endMinutes) {
    // Same-day range (e.g., 02:00 - 08:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Midnight-crossing range (e.g., 22:00 - 06:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}
