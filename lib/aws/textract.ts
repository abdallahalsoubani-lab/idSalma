import { TextractClient, AnalyzeIDCommand } from '@aws-sdk/client-textract';
import type { ExtractedIDData } from '@/types';

const textractClient = new TextractClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function analyzeJordanianID(
  documentS3Keys: string[],
  bucketName: string
): Promise<ExtractedIDData> {
  const documentPages = documentS3Keys.map((key) => ({
    S3Object: { Bucket: bucketName, Name: key },
  }));

  const command = new AnalyzeIDCommand({ DocumentPages: documentPages });
  const response = await textractClient.send(command);

  // Parse response and extract Jordanian-specific fields
  const rawFields: Record<string, { value: string; confidence: number }> = {};
  let totalConfidence = 0;
  let fieldCount = 0;

  for (const doc of response.IdentityDocuments || []) {
    for (const field of doc.IdentityDocumentFields || []) {
      const fieldType = field.Type?.Text || 'UNKNOWN';
      const fieldValue = field.ValueDetection?.Text || '';
      const confidence = field.ValueDetection?.Confidence || 0;

      rawFields[fieldType] = { value: fieldValue, confidence };
      totalConfidence += confidence;
      fieldCount++;
    }
  }

  const get = (key: string) => rawFields[key]?.value || null;

  // Extract national number from MRZ or ID_NUMBER field
  const nationalNumber = get('ID_NUMBER') || extractNationalNumberFromMRZ(get('MRZ_CODE'));

  // Build full name
  const firstName = get('FIRST_NAME');
  const lastName = get('LAST_NAME');
  const middleName = get('MIDDLE_NAME');
  let fullName = null;
  if (firstName || lastName) {
    fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
  }

  return {
    firstName,
    lastName,
    fullName: fullName || get('FULL_NAME'),
    fullNameArabic: null, // Textract may not extract Arabic text well
    documentNumber: get('DOCUMENT_NUMBER') || get('PASSPORT_NUMBER') || get('ID_NUMBER'),
    nationalNumber,
    dateOfBirth: get('DATE_OF_BIRTH'),
    expirationDate: get('EXPIRATION_DATE'),
    dateOfIssue: get('DATE_OF_ISSUE'),
    nationality: get('NATIONALITY') || 'JOR',
    gender: get('SEX') || get('GENDER'),
    placeOfBirth: get('PLACE_OF_BIRTH'),
    placeOfIssue: get('PLACE_OF_ISSUE'),
    mrzCode: get('MRZ_CODE'),
    motherName: get('MOTHER_NAME'),
    bloodType: get('BLOOD_TYPE'),
    rawFields,
    overallConfidence: fieldCount > 0 ? totalConfidence / fieldCount : 0,
  };
}

function extractNationalNumberFromMRZ(mrz: string | null): string | null {
  if (!mrz) return null;

  // Jordanian national number is 10 digits
  // For ID Card (TD1), it's in line 1 after the document number
  // For Passport (TD3), it's in line 2

  // Extract all sequences of 10 consecutive digits
  const matches = mrz.match(/\d{10}/g);
  if (matches && matches.length > 0) {
    // Return the first match (likely the national number)
    return matches[0];
  }

  return null;
}

function extractMrzCheckDigit(mrz: string, position: number): string | null {
  if (mrz && mrz.length > position) {
    return mrz[position];
  }
  return null;
}

export function validateJordanianNationalNumber(nationalNumber: string): boolean {
  // Jordanian national number is exactly 10 digits
  if (!/^\d{10}$/.test(nationalNumber)) {
    return false;
  }

  // Additional validation logic can be added here
  // For example, check if the year is valid, etc.
  return true;
}

export function extractDateFromNationalNumber(nationalNumber: string): {
  year: number;
  month: number;
  day: number;
} | null {
  if (!validateJordanianNationalNumber(nationalNumber)) {
    return null;
  }

  // Jordanian national number format: YYMMDDSSSC
  // YY = year (95 = 1995 or 2095, need to determine century)
  // MM = month
  // DD = day
  // SSS = sequence number
  // C = check digit

  const year = parseInt(nationalNumber.substring(0, 2), 10);
  const month = parseInt(nationalNumber.substring(2, 4), 10);
  const day = parseInt(nationalNumber.substring(4, 6), 10);

  // Determine century (assume 1900s if > 50, 2000s otherwise)
  const fullYear = year > 50 ? 1900 + year : 2000 + year;

  return { year: fullYear, month, day };
}

export { textractClient };
