import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST: Syncs consultation updates.
 * Supports appending transcripts, timeline events, calendar references, or overwriting decision briefs.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      consultationId, 
      status,
      transcript, 
      timelineEvent, 
      decisionBrief, 
      recommendations, 
      googleCalendarEvent 
    } = body;

    if (!consultationId) {
      return NextResponse.json({ error: 'Consultation ID is required' }, { status: 400 });
    }

    const docRef = db.collection('consultations').doc(consultationId);
    
    // Verify document exists before proceeding
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Consultation session not found' }, { status: 404 });
    }

    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (status) {
      updates.status = status;
    }

    // 1. Append transcript line if provided
    if (transcript && transcript.sender && transcript.text) {
      updates.transcript = FieldValue.arrayUnion({
        sender: transcript.sender,
        text: transcript.text,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Append timeline event if provided
    if (timelineEvent && timelineEvent.event) {
      updates.timelineEvents = FieldValue.arrayUnion({
        event: timelineEvent.event,
        timestamp: timelineEvent.timestamp || new Date().toISOString()
      });
    }

    // 3. Update Decision Brief object if provided
    if (decisionBrief) {
      updates.status = 'completed';
      updates.decisionBrief = {
        decision: decisionBrief.decision || 'In Consultation',
        confidence: typeof decisionBrief.confidence === 'number' ? decisionBrief.confidence : 0,
        confidenceFactors: decisionBrief.confidenceFactors || [],
        missingInformation: decisionBrief.missingInformation || [],
        reason: decisionBrief.reason || [],
        recommendedNextSteps: decisionBrief.recommendedNextSteps || [],
        supportingEvidence: decisionBrief.supportingEvidence || []
      };
    }

    // 4. Update Recommendations array if provided
    if (recommendations && Array.isArray(recommendations)) {
      updates.recommendations = recommendations;
    }

    // 5. Append scheduled calendar event details
    if (googleCalendarEvent) {
      updates.googleCalendarEvents = FieldValue.arrayUnion({
        eventId: googleCalendarEvent.eventId,
        title: googleCalendarEvent.title,
        dateTime: googleCalendarEvent.dateTime,
        meetingUrl: googleCalendarEvent.meetingUrl || ''
      });
    }

    await docRef.update(updates);

    const freshDoc = await docRef.get();
    return NextResponse.json({
      success: true,
      data: freshDoc.data()
    });
  } catch (error) {
    console.error('Error syncing consultation state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
