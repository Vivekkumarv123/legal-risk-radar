/**
 * Google Calendar API Service
 * Handles scheduling follow-up consultation dates and deadlines using Google Calendar REST endpoints and OAuth tokens.
 */

/**
 * Schedules an event in the user's primary Google Calendar.
 * @param {string} token - Google OAuth access token.
 * @param {string} title - Summary of the event.
 * @param {string} description - Brief details of the event.
 * @param {string} startISOString - The start time in ISO-8601 format.
 * @param {number} durationMinutes - The duration in minutes.
 * @returns {Promise<Object>} The scheduled event details { eventId, link, summary, dateTime }.
 */
export async function scheduleCalendarEvent(token, title, description, startISOString, durationMinutes = 30) {
  try {
    const startDate = new Date(startISOString);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC',
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Calendar API error: ${res.statusText} (${res.status}) - ${errText}`);
    }

    const data = await res.json();
    return {
      eventId: data.id,
      link: data.htmlLink,
      summary: data.summary,
      dateTime: startDate.toISOString(),
    };
  } catch (error) {
    console.error('Error scheduling Google Calendar event:', error);
    throw error;
  }
}
