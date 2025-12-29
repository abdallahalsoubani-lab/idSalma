'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CreditCard, FileText } from 'lucide-react';

export default function ConsentPage() {
  const router = useRouter();
  const [dataConsent, setDataConsent] = useState(false);
  const [cameraConsent, setCameraConsent] = useState(false);
  const [documentType, setDocumentType] = useState<'ID_CARD' | 'PASSPORT' | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinue = dataConsent && cameraConsent && documentType;

  const handleSubmit = async () => {
    if (!canContinue) return;

    setLoading(true);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          consentGiven: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      router.push(`/verify/${data.sessionId}/upload`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to start verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Consent & Document Type
          </h1>
          <p className="text-gray-600">
            Please review and accept the terms before proceeding
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Processing Consent</CardTitle>
            <CardDescription>
              We need your permission to process your identity data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="data-consent"
                checked={dataConsent}
                onChange={(e: any) => setDataConsent(e.target.checked)}
              />
              <Label htmlFor="data-consent" className="text-sm leading-relaxed">
                I agree to allow SalmaAIID to process my identity data for verification
                purposes. My data will be encrypted and automatically deleted after 7 days.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="camera-consent"
                checked={cameraConsent}
                onChange={(e: any) => setCameraConsent(e.target.checked)}
              />
              <Label htmlFor="camera-consent" className="text-sm leading-relaxed">
                I agree to use my camera for the liveness check to verify my identity.
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Document Type</CardTitle>
            <CardDescription>
              Select the type of document you will upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => setDocumentType('ID_CARD')}
                className={`flex flex-col items-center rounded-lg border-2 p-6 transition-colors ${
                  documentType === 'ID_CARD'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="mb-3 h-12 w-12 text-blue-600" />
                <h3 className="mb-1 font-semibold">ID Card</h3>
                <p className="text-center text-sm text-gray-600">البطاقة الشخصية</p>
                <p className="mt-2 text-xs text-gray-500">Front & back required</p>
              </button>

              <button
                onClick={() => setDocumentType('PASSPORT')}
                className={`flex flex-col items-center rounded-lg border-2 p-6 transition-colors ${
                  documentType === 'PASSPORT'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="mb-3 h-12 w-12 text-blue-600" />
                <h3 className="mb-1 font-semibold">Passport</h3>
                <p className="text-center text-sm text-gray-600">جواز السفر</p>
                <p className="mt-2 text-xs text-gray-500">Data page only</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 font-semibold text-blue-900">Privacy Notice</h4>
          <p className="text-sm text-blue-800">
            Your data is encrypted and stored securely. We automatically delete all
            verification data after 7 days. We do not share your information with third
            parties.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canContinue || loading}
            className="w-full md:w-auto"
          >
            {loading ? 'Creating Session...' : 'Continue to Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}
