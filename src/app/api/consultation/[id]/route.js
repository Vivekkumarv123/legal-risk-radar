import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

/**
 * GET: Retrieves the complete session state of a single consultation by its ID
 */
export async function GET(req, { params }) {
  try {
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

    return NextResponse.json({
      success: true,
      data: doc.data()
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
