'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function FaceMatchPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    runFaceMatch();
  }, []);

  const runFaceMatch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/face-match`, {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error running face match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDecision = async () => {
    try {
      await fetch(`/api/sessions/${sessionId}/decision`, {
        method: 'POST',
      });
      router.push(`/verify/${sessionId}/result`);
    } catch (error) {
      console.error('Error getting decision:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-lg">Comparing faces...</p>
              <Progress value={60} className="w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Face Comparison</h1>
          <p className="text-gray-600">Comparing your ID photo with your selfie</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Match Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 text-center">
              <div className="mb-4 inline-block rounded-full bg-blue-100 p-4">
                <span className="text-4xl font-bold text-blue-600">
                  {result?.similarity?.toFixed(1)}%
                </span>
              </div>
              <p className="text-lg font-semibold">
                {result?.isMatch ? (
                  <span className="text-green-600">✓ Faces Match</span>
                ) : (
                  <span className="text-red-600">✗ Faces Do Not Match</span>
                )}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Threshold: {result?.threshold}%
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center">
                <div className="mb-2 h-48 rounded-lg bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">ID Photo</p>
                </div>
                <p className="text-sm text-gray-600">
                  Confidence: {result?.sourceConfidence?.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2 h-48 rounded-lg bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Selfie</p>
                </div>
                <p className="text-sm text-gray-600">
                  Confidence: {result?.targetConfidence?.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button size="lg" onClick={handleGetDecision}>
            Get Final Decision
          </Button>
        </div>
      </div>
    </div>
  );
}
