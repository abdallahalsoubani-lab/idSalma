import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'N/A';
  return `${score.toFixed(1)}%`;
}

export function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 90) return 'high';
  if (score >= 70) return 'medium';
  return 'low';
}

export function getConfidenceColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSize = maxSizeMB * 1024 * 1024;
  return file.size <= maxSize;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export const ALLOWED_DOCUMENT_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

export function validateDocument(file: File): { valid: boolean; error?: string } {
  if (!validateFileSize(file, 10)) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!validateFileType(file, ALLOWED_DOCUMENT_TYPES)) {
    return { valid: false, error: 'File must be JPEG, PNG, or PDF' };
  }

  return { valid: true };
}
