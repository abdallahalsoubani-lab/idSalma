import { Session, Decision, SessionStatus, DocumentType } from '@prisma/client';

export type { Session, Decision, SessionStatus, DocumentType };

export interface ExtractedIDData {
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  fullNameArabic: string | null;
  documentNumber: string | null;
  nationalNumber: string | null;
  dateOfBirth: string | null;
  expirationDate: string | null;
  dateOfIssue: string | null;
  nationality: string | null;
  gender: string | null;
  placeOfBirth: string | null;
  placeOfIssue: string | null;
  mrzCode: string | null;
  motherName: string | null;
  bloodType: string | null;
  rawFields: Record<string, { value: string; confidence: number }>;
  overallConfidence: number;
}

export interface LivenessResult {
  isLive: boolean;
  confidence: number;
  referenceImageKey: string | null;
  auditImages: string[];
  sessionId: string;
}

export interface FaceMatchResult {
  isMatch: boolean;
  similarity: number;
  sourceConfidence: number;
  targetConfidence?: number;
}

export interface FaceDetectionResult {
  faceDetected: boolean;
  faceCount: number;
  primaryFaceConfidence: number;
  boundingBox: {
    Width: number;
    Height: number;
    Left: number;
    Top: number;
  } | null;
}

export interface DecisionResult {
  decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
  reasons: string[];
  scores: {
    ocr: number;
    liveness: number;
    faceMatch: number;
  };
}

export interface SystemSettings {
  id: string;
  faceMatchThreshold: number;
  ocrMinConfidence: number;
  livenessThreshold: number;
  retentionDays: number;
}

export interface SessionWithData extends Session {
  extractedData: ExtractedIDData | null;
}

export interface AuditLogEvent {
  sessionId: string;
  eventType: string;
  actor: string;
  payload?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface UploadedDocument {
  key: string;
  url: string;
  type: 'front' | 'back';
}

export interface VerificationStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  href: string;
}
