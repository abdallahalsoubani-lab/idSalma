'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      const data = await response.json();
      setSession(data.session);
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/report`);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verification-report-${sessionId}.json`;
      a.click();
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const decision = session?.decision;
  const isApproved = decision === 'APPROVED';
  const isRejected = decision === 'REJECTED';
  const needsReview = decision === 'MANUAL_REVIEW';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Verification Result</h1>
          <p className="text-gray-600">Session ID: {sessionId}</p>
        </div>

        {/* Status Badge */}
        <Card className="mb-6">
          <CardContent className="py-12 text-center">
            {isApproved && (
              <>
                <CheckCircle className="mx-auto mb-4 h-20 w-20 text-green-500" />
                <h2 className="mb-2 text-3xl font-bold text-green-600">Approved</h2>
                <p className="text-gray-600">Your identity has been successfully verified</p>
              </>
            )}
            {isRejected && (
              <>
                <XCircle className="mx-auto mb-4 h-20 w-20 text-red-500" />
                <h2 className="mb-2 text-3xl font-bold text-red-600">Rejected</h2>
                <p className="text-gray-600">Verification failed. Please try again.</p>
              </>
            )}
            {needsReview && (
              <>
                <Clock className="mx-auto mb-4 h-20 w-20 text-yellow-500" />
                <h2 className="mb-2 text-3xl font-bold text-yellow-600">Under Review</h2>
                <p className="text-gray-600">Your application requires manual review</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Scores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verification Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-sm text-gray-600">OCR Confidence</p>
                <p className="text-2xl font-bold text-blue-600">
                  {session?.ocrConfidenceScore?.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Liveness Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {session?.livenessScore?.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Face Match</p>
                <p className="text-2xl font-bold text-blue-600">
                  {session?.faceMatchScore?.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flags/Reasons */}
        {session?.flags && session.flags.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detected Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {session.flags.map((flag: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    {flag.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={downloadReport}>
            Download Report
          </Button>
          <Link href="/">
            <Button>Start New Verification</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
