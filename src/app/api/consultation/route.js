import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/middleware/auth.middleware';

// Extract authenticated user ID using middleware verifyToken
async function getUserIdFromRequest(req) {
  const authResult = await verifyToken(req);
  if (authResult.success) {
    return authResult.user.id;
  }
  return null;
}

// Helper to generate CONSULT-XXXXXX unique identifiers
function generateConsultationId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CONSULT-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * POST: Create a new consultation session document in Firestore
 */
export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const consultationId = generateConsultationId();

    const initialData = {
      consultationId,
      userId,
      status: 'active',
      transcript: [],
      timelineEvents: [
        { event: 'Meeting Started', timestamp: new Date().toISOString() }
      ],
      decisionBrief: {
        decision: 'In Consultation',
        confidence: 0,
        confidenceFactors: [],
        missingInformation: [],
        reason: [],
        recommendedNextSteps: [],
        supportingEvidence: []
      },
      recommendations: [],
      googleCalendarEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore under consultations collection using consultationId as document ID
    await db.collection('consultations').doc(consultationId).set(initialData);

    return NextResponse.json({
      success: true,
      data: initialData
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET: Retrieve all past consultation sessions for a user ID
 */
export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const snapshot = await db.collection('consultations')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const consultations = [];
    snapshot.forEach(doc => {
      consultations.push(doc.data());
    });

    return NextResponse.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE: Delete all consultations belonging to the authenticated user
 */
export async function DELETE(req) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const snapshot = await db.collection('consultations')
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'All consultations deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting all consultations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
