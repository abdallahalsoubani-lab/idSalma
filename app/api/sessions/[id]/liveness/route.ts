import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createLivenessSession, getLivenessResults } from '@/lib/aws/rekognition-liveness';

// POST /api/sessions/[id]/liveness - Create liveness session
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

    if (session.status !== 'OCR_DONE') {
      return NextResponse.json(
        { error: 'OCR must be completed before liveness check' },
        { status: 400 }
      );
    }

    // Create AWS Rekognition liveness session
    const livenessSession = await createLivenessSession(id);

    // Update session with liveness session ID
    await prisma.session.update({
      where: { id },
      data: {
        livenessSessionId: livenessSession.sessionId,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        sessionId: id,
        eventType: 'LIVENESS_SESSION_CREATED',
        actor: 'SYSTEM',
        payload: {
          livenessSessionId: livenessSession.sessionId,
        },
      },
    });

    return NextResponse.json({
      livenessSessionId: livenessSession.sessionId,
      region: livenessSession.region,
    });
  } catch (error) {
    console.error('Error creating liveness session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/sessions/[id]/liveness - Complete liveness and get results
export async function PUT(
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

    if (!session.livenessSessionId) {
      return NextResponse.json({ error: 'No liveness session found' }, { status: 400 });
    }

    // Get liveness results from AWS
    const livenessResult = await getLivenessResults(session.livenessSessionId);

    // Update session with results
    const flags = [...(session.flags || [])];
    if (!livenessResult.isLive) {
      flags.push('LIVENESS_FAILED');
    }

    await prisma.session.update({
      where: { id },
      data: {
        livenessScore: livenessResult.confidence,
        livenessBestFrameKey: livenessResult.referenceImageKey,
        flags,
        status: 'LIVENESS_DONE',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        sessionId: id,
        eventType: 'LIVENESS_COMPLETED',
        actor: 'SYSTEM',
        payload: {
          isLive: livenessResult.isLive,
          confidence: livenessResult.confidence,
        },
      },
    });

    return NextResponse.json({
      isLive: livenessResult.isLive,
      confidence: livenessResult.confidence,
      referenceImageKey: livenessResult.referenceImageKey,
    });
  } catch (error) {
    console.error('Error getting liveness results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
