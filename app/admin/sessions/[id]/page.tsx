'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function SessionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${id}`);
      const data = await response.json();
      setSession(data.session);
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!reviewNotes) {
      alert('Please provide review notes');
      return;
    }

    try {
      const response = await fetch(`/api/admin/sessions/${id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reason: reviewNotes,
          notes: reviewNotes,
        }),
      });

      if (response.ok) {
        alert('Decision updated successfully');
        fetchSession();
      }
    } catch (error) {
      console.error('Error updating decision:', error);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const extractedData = session?.extractedData || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Session Review</h1>
          <p className="text-gray-600">Session ID: {id}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Current Decision */}
            <Card>
              <CardHeader>
                <CardTitle>Current Decision</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Badge
                    variant={
                      session.decision === 'APPROVED'
                        ? 'success'
                        : session.decision === 'REJECTED'
                        ? 'destructive'
                        : 'warning'
                    }
                    className="text-lg"
                  >
                    {session.decision}
                  </Badge>
                </div>
                <div className="grid gap-2">
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>{' '}
                    <span className="font-semibold">{session.status}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Document Type:</span>{' '}
                    <span className="font-semibold">{session.documentType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">OCR Confidence:</span>
                    <span className="font-semibold">{session.ocrConfidenceScore?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Liveness Score:</span>
                    <span className="font-semibold">{session.livenessScore?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Face Match:</span>
                    <span className="font-semibold">{session.faceMatchScore?.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extracted Data */}
            <Card>
              <CardHeader>
                <CardTitle>Extracted Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Full Name:</span>{' '}
                    <span className="font-semibold">{extractedData.fullName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">National Number:</span>{' '}
                    <span className="font-semibold">{extractedData.nationalNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date of Birth:</span>{' '}
                    <span className="font-semibold">{extractedData.dateOfBirth || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Expiry Date:</span>{' '}
                    <span className="font-semibold">{extractedData.expirationDate || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Flags */}
            {session.flags && session.flags.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-900">Flags</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {session.flags.map((flag: string, index: number) => (
                      <li key={index} className="text-sm text-yellow-800">
                        • {flag.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Admin Override */}
            {session.decision === 'MANUAL_REVIEW' && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Override</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Review Notes</Label>
                    <Input
                      id="notes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Enter reason for decision..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleOverride('APPROVED')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleOverride('REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
