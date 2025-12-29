import type { Session, SystemSettings } from '@prisma/client';
import type { DecisionResult, ExtractedIDData } from '@/types';

export function calculateDecision(
  session: Session,
  settings: SystemSettings,
  extractedData?: ExtractedIDData | null
): DecisionResult {
  const reasons: string[] = [];
  const flags = session.flags || [];

  const scores = {
    ocr: session.ocrConfidenceScore || 0,
    liveness: session.livenessScore || 0,
    faceMatch: session.faceMatchScore || 0,
  };

  // Critical failures → REJECTED
  if (flags.includes('LIVENESS_FAILED')) {
    reasons.push('Liveness check failed');
    return { decision: 'REJECTED', reasons, scores };
  }

  if (scores.faceMatch < settings.faceMatchThreshold - 10) {
    reasons.push(`Face match score too low: ${scores.faceMatch.toFixed(1)}%`);
    return { decision: 'REJECTED', reasons, scores };
  }

  if (flags.includes('DOCUMENT_EXPIRED')) {
    reasons.push('Document has expired');
    return { decision: 'REJECTED', reasons, scores };
  }

  if (flags.includes('NO_FACE_DETECTED')) {
    reasons.push('No face detected in document');
    return { decision: 'REJECTED', reasons, scores };
  }

  // Borderline cases → MANUAL_REVIEW
  let needsReview = false;

  if (
    scores.faceMatch >= settings.faceMatchThreshold - 10 &&
    scores.faceMatch < settings.faceMatchThreshold
  ) {
    needsReview = true;
    reasons.push(`Face match borderline: ${scores.faceMatch.toFixed(1)}%`);
  }

  if (scores.ocr < settings.ocrMinConfidence) {
    needsReview = true;
    reasons.push(`OCR confidence low: ${scores.ocr.toFixed(1)}%`);
  }

  if (flags.includes('MISSING_CRITICAL_FIELD')) {
    needsReview = true;
    reasons.push('Missing critical document fields');
  }

  if (flags.includes('NO_FACE_IN_DOCUMENT')) {
    needsReview = true;
    reasons.push('Could not detect face in document');
  }

  if (flags.includes('MULTIPLE_FACES_DETECTED')) {
    needsReview = true;
    reasons.push('Multiple faces detected in document');
  }

  if (scores.liveness < settings.livenessThreshold) {
    needsReview = true;
    reasons.push(`Liveness score below threshold: ${scores.liveness.toFixed(1)}%`);
  }

  if (needsReview) {
    return { decision: 'MANUAL_REVIEW', reasons, scores };
  }

  // All checks passed → APPROVED
  reasons.push('All verification checks passed');
  return { decision: 'APPROVED', reasons, scores };
}

export function validateExtractedData(data: ExtractedIDData): string[] {
  const flags: string[] = [];

  // Check for critical fields
  const criticalFields = ['documentNumber', 'nationalNumber', 'dateOfBirth', 'fullName'];
  const missingFields = criticalFields.filter(
    (field) => !data[field as keyof ExtractedIDData]
  );

  if (missingFields.length > 0) {
    flags.push('MISSING_CRITICAL_FIELD');
  }

  // Check if document is expired
  if (data.expirationDate) {
    const expiryDate = new Date(data.expirationDate);
    if (expiryDate < new Date()) {
      flags.push('DOCUMENT_EXPIRED');
    }
  }

  // Check overall confidence
  if (data.overallConfidence < 70) {
    flags.push('LOW_OCR_CONFIDENCE');
  }

  return flags;
}

export function generateVerificationReport(session: Session & { extractedData: any }) {
  const extractedData = session.extractedData as ExtractedIDData | null;

  return {
    sessionId: session.id,
    status: session.status,
    decision: session.decision,
    documentType: session.documentType,
    createdAt: session.createdAt,
    completedAt: session.updatedAt,
    scores: {
      ocr: session.ocrConfidenceScore,
      liveness: session.livenessScore,
      faceMatch: session.faceMatchScore,
    },
    extractedData: extractedData
      ? {
          fullName: extractedData.fullName,
          nationalNumber: extractedData.nationalNumber,
          documentNumber: extractedData.documentNumber,
          dateOfBirth: extractedData.dateOfBirth,
          expirationDate: extractedData.expirationDate,
          nationality: extractedData.nationality,
          gender: extractedData.gender,
        }
      : null,
    flags: session.flags,
    adminReview: session.adminDecision
      ? {
          decision: session.adminDecision,
          reviewedBy: session.adminReviewerId,
          reviewedAt: session.adminReviewedAt,
          notes: session.adminReviewNotes,
        }
      : null,
  };
}
