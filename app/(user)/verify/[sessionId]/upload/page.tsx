'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';

export default function UploadPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState<'ID_CARD' | 'PASSPORT'>('ID_CARD');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
      alert('File must be JPEG, PNG, or PDF');
      return;
    }

    if (side === 'front') {
      setFrontFile(file);
    } else {
      setBackFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!frontFile) {
      alert('Please upload front document');
      return;
    }

    if (documentType === 'ID_CARD' && !backFile) {
      alert('Please upload back of ID card');
      return;
    }

    setLoading(true);

    try {
      // Upload documents
      const formData = new FormData();
      formData.append('front', frontFile);
      if (backFile) {
        formData.append('back', backFile);
      }

      const uploadResponse = await fetch(`/api/sessions/${sessionId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload documents');
      }

      // Run OCR
      const ocrResponse = await fetch(`/api/sessions/${sessionId}/ocr`, {
        method: 'POST',
      });

      if (!ocrResponse.ok) {
        throw new Error('Failed to process documents');
      }

      // Redirect to OCR review
      router.push(`/verify/${sessionId}/ocr-review`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600">Upload clear photos of your ID document</p>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {/* Front Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Front Side</CardTitle>
              <CardDescription>Upload the front of your document</CardDescription>
            </CardHeader>
            <CardContent>
              {frontFile ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(frontFile)}
                    alt="Front preview"
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => setFrontFile(null)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                  <Upload className="mb-2 h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Click to upload</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileSelect(e, 'front')}
                    className="hidden"
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Back Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Back Side</CardTitle>
              <CardDescription>
                {documentType === 'ID_CARD' ? 'Required for ID cards' : 'Optional for passports'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backFile ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(backFile)}
                    alt="Back preview"
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => setBackFile(null)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                  <Upload className="mb-2 h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Click to upload</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileSelect(e, 'back')}
                    className="hidden"
                  />
                </label>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 bg-blue-50">
          <CardContent className="pt-6">
            <h4 className="mb-2 font-semibold text-blue-900">Tips for better results:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>✓ Ensure good lighting</li>
              <li>✓ Avoid glare or shadows</li>
              <li>✓ Full document must be visible</li>
              <li>✓ Keep the document flat</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button size="lg" onClick={handleSubmit} disabled={loading} className="w-full md:w-auto">
            {loading ? 'Processing...' : 'Submit & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
