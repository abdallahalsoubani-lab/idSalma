import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DocumentType } from '@prisma/client';

// POST /api/sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentType, consentGiven } = body;

    if (!consentGiven) {
      return NextResponse.json({ error: 'Consent is required' }, { status: 400 });
    }

    if (!documentType || !['ID_CARD', 'PASSPORT'].includes(documentType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    const session = await prisma.session.create({
      data: {
        documentType: documentType as DocumentType,
        consentGiven: true,
        consentTimestamp: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        sessionId: session.id,
        eventType: 'SESSION_CREATED',
        actor: 'USER',
        payload: { documentType },
      },
    });

    return NextResponse.json({ sessionId: session.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
