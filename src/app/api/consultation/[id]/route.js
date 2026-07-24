import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/middleware/auth.middleware';

/**
 * GET: Retrieves the complete session state of a single consultation by its ID
 */
export async function GET(req, { params }) {
  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Consultation ID parameter is required' }, { status: 400 });
    }

    const docRef = db.collection('consultations').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    const data = doc.data();
    if (data.userId && data.userId !== authResult.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to access this consultation' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error retrieving consultation details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE: Deletes a single consultation by its ID
 */
export async function DELETE(req, { params }) {
  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Consultation ID parameter is required' }, { status: 400 });
    }

    const docRef = db.collection('consultations').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    const data = doc.data();
    if (data.userId && data.userId !== authResult.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this consultation' }, { status: 403 });
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Consultation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
