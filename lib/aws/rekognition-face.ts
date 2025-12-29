import {
  RekognitionClient,
  CompareFacesCommand,
  DetectFacesCommand,
} from '@aws-sdk/client-rekognition';
import type { FaceMatchResult, FaceDetectionResult } from '@/types';

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function compareFaces(
  sourceImageKey: string,
  targetImageKey: string,
  bucketName: string,
  threshold: number = 85
): Promise<FaceMatchResult> {
  const command = new CompareFacesCommand({
    SourceImage: {
      S3Object: { Bucket: bucketName, Name: sourceImageKey },
    },
    TargetImage: {
      S3Object: { Bucket: bucketName, Name: targetImageKey },
    },
    SimilarityThreshold: 0, // We'll check the threshold ourselves to get all matches
    QualityFilter: 'AUTO',
  });

  const response = await rekognitionClient.send(command);
  const matches = response.FaceMatches || [];

  if (matches.length === 0) {
    return {
      isMatch: false,
      similarity: 0,
      sourceConfidence: response.SourceImageFace?.Confidence || 0,
    };
  }

  // Get the best match (highest similarity)
  const bestMatch = matches.reduce((best, curr) =>
    (curr.Similarity || 0) > (best.Similarity || 0) ? curr : best
  );

  const similarity = bestMatch.Similarity || 0;

  return {
    isMatch: similarity >= threshold,
    similarity,
    sourceConfidence: response.SourceImageFace?.Confidence || 0,
    targetConfidence: bestMatch.Face?.Confidence || 0,
  };
}

export async function detectFaceInDocument(
  imageKey: string,
  bucketName: string
): Promise<FaceDetectionResult> {
  const command = new DetectFacesCommand({
    Image: {
      S3Object: { Bucket: bucketName, Name: imageKey },
    },
    Attributes: ['DEFAULT'],
  });

  const response = await rekognitionClient.send(command);
  const faces = response.FaceDetails || [];

  return {
    faceDetected: faces.length > 0,
    faceCount: faces.length,
    primaryFaceConfidence: faces[0]?.Confidence || 0,
    boundingBox: faces[0]?.BoundingBox || null,
  };
}

export { rekognitionClient };
