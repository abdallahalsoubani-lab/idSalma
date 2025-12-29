import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// GET /api/admin/settings - Get system settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/settings - Update system settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { faceMatchThreshold, ocrMinConfidence, livenessThreshold, retentionDays } = body;

    const settings = await prisma.systemSettings.update({
      where: { id: 'default' },
      data: {
        faceMatchThreshold:
          faceMatchThreshold !== undefined ? faceMatchThreshold : undefined,
        ocrMinConfidence: ocrMinConfidence !== undefined ? ocrMinConfidence : undefined,
        livenessThreshold: livenessThreshold !== undefined ? livenessThreshold : undefined,
        retentionDays: retentionDays !== undefined ? retentionDays : undefined,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
