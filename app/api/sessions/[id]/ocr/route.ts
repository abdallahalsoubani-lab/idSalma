import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { analyzeJordanianID } from '@/lib/aws/textract';
import { detectFaceInDocument } from '@/lib/aws/rekognition-face';
import { getS3BucketName } from '@/lib/aws/s3';
import { validateExtractedData } from '@/lib/decision-engine';

// POST /api/sessions/[id]/ocr - Run OCR on uploaded documents
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.documentFrontKey) {
      return NextResponse.json({ error: 'No documents uploaded' }, { status: 400 });
    }

    const bucketName = getS3BucketName();

    // Prepare document keys for Textract
    const documentKeys = [session.documentFrontKey];
    if (session.documentBackKey) {
      documentKeys.push(session.documentBackKey);
    }

    // Run Textract AnalyzeID
    const extractedData = await analyzeJordanianID(documentKeys, bucketName);

    // Detect face in front document
    const faceDetection = await detectFaceInDocument(session.documentFrontKey, bucketName);

    // Validate extracted data and generate flags
    const flags = validateExtractedData(extractedData);

    // Add face detection flags
    if (!faceDetection.faceDetected) {
      flags.push('NO_FACE_IN_DOCUMENT');
    } else if (faceDetection.faceCount > 1) {
      flags.push('MULTIPLE_FACES_DETECTED');
    }

    // Update session
    await prisma.session.update({
      where: { id },
      data: {
        extractedData: extractedData as any,
        ocrConfidenceScore: extractedData.overallConfidence,
        flags,
        status: 'OCR_DONE',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        sessionId: id,
        eventType: 'OCR_COMPLETED',
        actor: 'SYSTEM',
        payload: {
          confidence: extractedData.overallConfidence,
          flags,
        },
      },
    });

    return NextResponse.json({
      extractedData,
      flags,
      faceDetected: faceDetection.faceDetected,
    });
  } catch (error) {
    console.error('Error running OCR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
