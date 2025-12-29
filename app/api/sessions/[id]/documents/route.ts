import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadDocumentToS3 } from '@/lib/aws/s3';

// POST /api/sessions/[id]/documents - Upload documents
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

    const formData = await request.formData();
    const frontFile = formData.get('front') as File | null;
    const backFile = formData.get('back') as File | null;

    if (!frontFile) {
      return NextResponse.json({ error: 'Front document is required' }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (frontFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Upload front document
    const frontBuffer = Buffer.from(await frontFile.arrayBuffer());
    const frontKey = await uploadDocumentToS3(
      frontBuffer,
      id,
      'front',
      frontFile.type
    );

    let backKey: string | null = null;

    // Upload back document if provided (required for ID_CARD)
    if (backFile) {
      if (backFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
      }

      const backBuffer = Buffer.from(await backFile.arrayBuffer());
      backKey = await uploadDocumentToS3(backBuffer, id, 'back', backFile.type);
    } else if (session.documentType === 'ID_CARD') {
      return NextResponse.json(
        { error: 'Back document is required for ID cards' },
        { status: 400 }
      );
    }

    // Update session
    await prisma.session.update({
      where: { id },
      data: {
        documentFrontKey: frontKey,
        documentBackKey: backKey,
        status: 'ID_UPLOADED',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        sessionId: id,
        eventType: 'DOCUMENTS_UPLOADED',
        actor: 'USER',
        payload: {
          frontKey,
          backKey,
        },
      },
    });

    return NextResponse.json({
      frontKey,
      backKey,
      message: 'Documents uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
