import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Camera, CheckCircle, FileText } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-blue-600">SalmaAIID</h1>
          <Link href="/admin/login">
            <Button variant="ghost" size="sm">
              Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Digital KYC Verification
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Secure and automated identity verification for Jordanian documents
          </p>
          <Link href="/consent">
            <Button size="lg" className="px-8">
              Start Verification
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h3 className="mb-12 text-center text-3xl font-bold text-gray-900">
            How It Works
          </h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <FileText className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>Upload ID</CardTitle>
                <CardDescription>
                  Upload your Jordanian ID Card or Passport
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>Data Extraction</CardTitle>
                <CardDescription>
                  AI extracts and verifies your document information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Camera className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>Liveness Check</CardTitle>
                <CardDescription>
                  Verify your identity with a live selfie
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>Instant Decision</CardTitle>
                <CardDescription>
                  Get verification results in seconds
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-lg bg-blue-50 p-8">
          <h3 className="mb-4 text-2xl font-bold text-gray-900">
            Your Security is Our Priority
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Bank-level encryption for all data</li>
            <li>✓ Data automatically deleted after 7 days</li>
            <li>✓ Compliant with privacy regulations</li>
            <li>✓ No data sharing with third parties</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 SalmaAIID. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
