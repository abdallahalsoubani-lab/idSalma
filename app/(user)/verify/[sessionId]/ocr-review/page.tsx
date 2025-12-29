'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function OcrReviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
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

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <Badge variant="success">High ({confidence.toFixed(1)}%)</Badge>;
    if (confidence >= 70) return <Badge variant="warning">Medium ({confidence.toFixed(1)}%)</Badge>;
    return <Badge variant="destructive">Low ({confidence.toFixed(1)}%)</Badge>;
  };

  const handleContinue = () => {
    router.push(`/verify/${sessionId}/liveness`);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const extractedData = session?.extractedData || {};

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Review Extracted Data</h1>
          <p className="text-gray-600">Verify the information extracted from your document</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Extracted Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Full Name</TableCell>
                  <TableCell>{extractedData.fullName || 'N/A'}</TableCell>
                  <TableCell>{extractedData.rawFields?.FIRST_NAME ? getConfidenceBadge(extractedData.rawFields.FIRST_NAME.confidence) : 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">National Number</TableCell>
                  <TableCell>{extractedData.nationalNumber || 'N/A'}</TableCell>
                  <TableCell>{extractedData.rawFields?.ID_NUMBER ? getConfidenceBadge(extractedData.rawFields.ID_NUMBER.confidence) : 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Date of Birth</TableCell>
                  <TableCell>{extractedData.dateOfBirth || 'N/A'}</TableCell>
                  <TableCell>{extractedData.rawFields?.DATE_OF_BIRTH ? getConfidenceBadge(extractedData.rawFields.DATE_OF_BIRTH.confidence) : 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Expiry Date</TableCell>
                  <TableCell>{extractedData.expirationDate || 'N/A'}</TableCell>
                  <TableCell>{extractedData.rawFields?.EXPIRATION_DATE ? getConfidenceBadge(extractedData.rawFields.EXPIRATION_DATE.confidence) : 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Gender</TableCell>
                  <TableCell>{extractedData.gender || 'N/A'}</TableCell>
                  <TableCell>{extractedData.rawFields?.SEX ? getConfidenceBadge(extractedData.rawFields.SEX.confidence) : 'N/A'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {session?.flags && session.flags.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">Flags Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-yellow-800">
                {session.flags.map((flag: string, index: number) => (
                  <li key={index}>⚠ {flag.replace(/_/g, ' ')}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push(`/verify/${sessionId}/upload`)}>
            Re-upload
          </Button>
          <Button size="lg" onClick={handleContinue}>
            Continue to Liveness
          </Button>
        </div>
      </div>
    </div>
  );
}
