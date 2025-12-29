import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// POST /api/admin/sessions/[id]/override - Override decision
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { decision, reason, notes } = body;

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const kycSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!kycSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update session with admin override
    await prisma.session.update({
      where: { id },
      data: {
        adminDecision: decision,
        adminReviewerId: (session.user as any).id,
        adminReviewNotes: notes || reason,
        adminReviewedAt: new Date(),
        decision: decision,
        status: 'COMPLETED',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        sessionId: id,
        eventType: 'ADMIN_OVERRIDE',
        actor: session.user.email || 'ADMIN',
        payload: {
          decision,
          reason,
          notes,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error overriding decision:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
