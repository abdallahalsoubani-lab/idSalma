'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LivenessPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [livenessSessionId, setLivenessSessionId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const startLiveness = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/liveness`, {
        method: 'POST',
      });
      const data = await response.json();
      setLivenessSessionId(data.livenessSessionId);

      // Simulate liveness check completion
      setTimeout(async () => {
        await completeLiveness();
      }, 3000);
    } catch (error) {
      console.error('Error starting liveness:', error);
      alert('Failed to start liveness check');
    } finally {
      setLoading(false);
    }
  };

  const completeLiveness = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/liveness`, {
        method: 'PUT',
      });
      const data = await response.json();
      setCompleted(true);

      // Auto-redirect to face match
      setTimeout(() => {
        router.push(`/verify/${sessionId}/face-match`);
      }, 1500);
    } catch (error) {
      console.error('Error completing liveness:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Liveness Check</h1>
          <p className="text-gray-600">Verify your identity with a live selfie</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Face Liveness Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!livenessSessionId ? (
              <>
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 font-semibold text-blue-900">Instructions:</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>✓ Position your face in the center of the camera</li>
                    <li>✓ Ensure good lighting</li>
                    <li>✓ Remove glasses if possible</li>
                    <li>✓ Follow the on-screen instructions</li>
                  </ul>
                </div>
                <Button size="lg" className="w-full" onClick={startLiveness} disabled={loading}>
                  {loading ? 'Initializing...' : 'Start Liveness Check'}
                </Button>
              </>
            ) : (
              <div className="py-8 text-center">
                {!completed ? (
                  <>
                    <div className="mb-4 h-64 rounded-lg bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-600">Liveness check in progress...</p>
                    </div>
                    <p className="text-gray-600">Please follow the on-screen instructions</p>
                  </>
                ) : (
                  <>
                    <div className="mb-4 text-6xl">✓</div>
                    <h3 className="mb-2 text-xl font-semibold text-green-600">Liveness Check Passed!</h3>
                    <p className="text-gray-600">Redirecting to face comparison...</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
