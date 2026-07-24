import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { scheduleCalendarEvent } from '@/services/googleCalendar';

/**
 * POST: Schedules an action or follow-up deadline in the user's Google Calendar,
 * writes the reference to Firestore, and pushes a timeline event.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      consultationId, 
      title, 
      description, 
      startDateTime, 
      durationMinutes, 
      accessToken 
    } = body;

    if (!consultationId || !title || !startDateTime || !accessToken) {
      return NextResponse.json({ 
        error: 'Missing required parameters: consultationId, title, startDateTime, and accessToken are required.' 
      }, { status: 400 });
    }

    // 1. Call Calendar Service to schedule event
    const eventDetails = await scheduleCalendarEvent(
      accessToken, 
      title, 
      description || 'Scheduled via AI Legal Decision Agent.', 
      startDateTime, 
      durationMinutes || 30
    );

    // 2. Append event reference to consultations document in Firestore
    const docRef = db.collection('consultations').doc(consultationId);

    const dbEventReference = {
      eventId: eventDetails.eventId,
      title: eventDetails.summary,
      dateTime: eventDetails.dateTime,
      meetingUrl: eventDetails.link
    };

    await docRef.update({
      googleCalendarEvents: FieldValue.arrayUnion(dbEventReference),
      timelineEvents: FieldValue.arrayUnion({
        event: `Scheduled Calendar Event: ${title}`,
        timestamp: new Date().toISOString()
      }),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: dbEventReference
    });
  } catch (error) {
    console.error('Error scheduling calendar event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
