import {
  RekognitionClient,
  CreateFaceLivenessSessionCommand,
  GetFaceLivenessSessionResultsCommand,
} from '@aws-sdk/client-rekognition';
import type { LivenessResult } from '@/types';

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function createLivenessSession(kycSessionId: string) {
  const command = new CreateFaceLivenessSessionCommand({
    Settings: {
      OutputConfig: {
        S3Bucket: process.env.AWS_S3_BUCKET!,
        S3KeyPrefix: `liveness/${kycSessionId}/`,
      },
      AuditImagesLimit: 4,
    },
    ClientRequestToken: `liveness-${kycSessionId}-${Date.now()}`,
  });

  const response = await rekognitionClient.send(command);

  return {
    sessionId: response.SessionId!,
    region: process.env.AWS_REGION!,
  };
}

export async function getLivenessResults(livenessSessionId: string): Promise<LivenessResult> {
  const command = new GetFaceLivenessSessionResultsCommand({
    SessionId: livenessSessionId,
  });

  const response = await rekognitionClient.send(command);

  const confidence = response.Confidence || 0;
  const isLive = response.Status === 'SUCCEEDED' && confidence >= 90;

  return {
    isLive,
    confidence,
    referenceImageKey: response.ReferenceImage?.S3Object?.Name || null,
    auditImages:
      response.AuditImages?.map((img) => img.S3Object?.Name || '').filter(Boolean) || [],
    sessionId: livenessSessionId,
  };
}

export { rekognitionClient };
