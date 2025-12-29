import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { compareFaces } from '@/lib/aws/rekognition-face';
import { getS3BucketName } from '@/lib/aws/s3';

// POST /api/sessions/[id]/face-match - Compare faces
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

    if (session.status !== 'LIVENESS_DONE') {
      return NextResponse.json(
        { error: 'Liveness check must be completed before face matching' },
        { status: 400 }
      );
    }

    if (!session.documentFrontKey || !session.livenessBestFrameKey) {
      return NextResponse.json(
        { error: 'Missing required images for face comparison' },
        { status: 400 }
      );
    }

    // Get system settings for threshold
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    const threshold = settings?.faceMatchThreshold || 85;
    const bucketName = getS3BucketName();

    // Compare faces using AWS Rekognition
    const faceMatchResult = await compareFaces(
      session.documentFrontKey,
      session.livenessBestFrameKey,
      bucketName,
      threshold
    );

    // Update session
    await prisma.session.update({
      where: { id },
      data: {
        faceMatchScore: faceMatchResult.similarity,
        status: 'FACE_MATCH_DONE',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        sessionId: id,
        eventType: 'FACE_MATCH_COMPLETED',
        actor: 'SYSTEM',
        payload: {
          isMatch: faceMatchResult.isMatch,
          similarity: faceMatchResult.similarity,
          threshold,
        },
      },
    });

    return NextResponse.json({
      isMatch: faceMatchResult.isMatch,
      similarity: faceMatchResult.similarity,
      sourceConfidence: faceMatchResult.sourceConfidence,
      targetConfidence: faceMatchResult.targetConfidence,
      threshold,
    });
  } catch (error) {
    console.error('Error matching faces:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
