import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateDecision } from '@/lib/decision-engine';

// POST /api/sessions/[id]/decision - Calculate final decision
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

    if (session.status !== 'FACE_MATCH_DONE') {
      return NextResponse.json(
        { error: 'All verification steps must be completed' },
        { status: 400 }
      );
    }

    // Get system settings
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        faceMatchThreshold: 85,
        ocrMinConfidence: 70,
        livenessThreshold: 90,
        retentionDays: 7,
      },
    });

    // Calculate decision
    const decisionResult = calculateDecision(session, settings);

    // Determine final status
    const finalStatus =
      decisionResult.decision === 'MANUAL_REVIEW' ? 'NEED_REVIEW' : 'COMPLETED';

    // Update session with decision
    await prisma.session.update({
      where: { id },
      data: {
        decision: decisionResult.decision,
        status: finalStatus,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        sessionId: id,
        eventType: 'DECISION_CALCULATED',
        actor: 'SYSTEM',
        payload: {
          decision: decisionResult.decision,
          reasons: decisionResult.reasons,
          scores: decisionResult.scores,
        },
      },
    });

    return NextResponse.json({
      decision: decisionResult.decision,
      reasons: decisionResult.reasons,
      scores: decisionResult.scores,
    });
  } catch (error) {
    console.error('Error calculating decision:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
