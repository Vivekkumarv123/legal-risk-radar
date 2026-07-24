import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { createDocumentWithText, compileTemplate } from '@/services/googleDocs';

/**
 * POST: Compiles a legal document template and saves it directly to Google Docs
 * on behalf of the user using their OAuth token.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { consultationId, templateType, parameters, accessToken } = body;

    if (!consultationId || !templateType || !parameters || !accessToken) {
      return NextResponse.json({ 
        error: 'Missing parameters. consultationId, templateType, parameters, and accessToken are required.' 
      }, { status: 400 });
    }

    // 1. Build document title based on template type
    const docTitle = `${templateType.toUpperCase()} - ${parameters.clientName || 'Client'} (${new Date().toLocaleDateString()})`;

    // 2. Compile text template with parameters
    // If it's a BRIEF, we load the full consultation state to inject timelineEvents, reasons, etc.
    let templateParams = { ...parameters };
    if (templateType.toUpperCase() === 'BRIEF') {
      const docSnap = await db.collection('consultations').doc(consultationId).get();
      if (docSnap.exists) {
        const sessionData = docSnap.data();
        templateParams = {
          consultationId,
          clientName: sessionData.decisionBrief?.clientName || parameters.clientName,
          decision: sessionData.decisionBrief?.decision || 'No decision logged',
          confidence: sessionData.decisionBrief?.confidence || 0,
          confidenceFactors: sessionData.decisionBrief?.confidenceFactors || [],
          missingInformation: sessionData.decisionBrief?.missingInformation || [],
          reason: sessionData.decisionBrief?.reason || [],
          recommendedNextSteps: sessionData.decisionBrief?.recommendedNextSteps || [],
          supportingEvidence: sessionData.decisionBrief?.supportingEvidence || [],
          timelineEvents: sessionData.timelineEvents || []
        };
      }
    }

    const compiledText = compileTemplate(templateType, templateParams);

    // 3. Create document in Google Docs
    const gDoc = await createDocumentWithText(accessToken, docTitle, compiledText);

    // 4. Save document log to Firestore and append timeline event
    const docRef = db.collection('consultations').doc(consultationId);
    
    const newDocReference = {
      documentId: gDoc.documentId,
      title: gDoc.title,
      url: gDoc.url,
      type: templateType.toUpperCase(),
      generatedAt: new Date().toISOString()
    };

    await docRef.update({
      generatedDocuments: FieldValue.arrayUnion(newDocReference),
      timelineEvents: FieldValue.arrayUnion({
        event: `Document Generated: ${templateType.toUpperCase()}`,
        timestamp: new Date().toISOString()
      }),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: newDocReference
    });
  } catch (error) {
    console.error('Error generating legal document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
