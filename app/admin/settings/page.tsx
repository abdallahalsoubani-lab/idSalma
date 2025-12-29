'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    faceMatchThreshold: 85,
    ocrMinConfidence: 70,
    livenessThreshold: 90,
    retentionDays: 7,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings updated successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure verification thresholds and parameters</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verification Thresholds</CardTitle>
            <CardDescription>
              Adjust the minimum scores required for automatic approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="faceMatch">Face Match Threshold (%)</Label>
              <Input
                id="faceMatch"
                type="number"
                min="50"
                max="100"
                value={settings.faceMatchThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, faceMatchThreshold: parseFloat(e.target.value) })
                }
              />
              <p className="mt-1 text-sm text-gray-600">
                Minimum similarity score for face matching (50-100)
              </p>
            </div>

            <div>
              <Label htmlFor="ocr">OCR Minimum Confidence (%)</Label>
              <Input
                id="ocr"
                type="number"
                min="50"
                max="100"
                value={settings.ocrMinConfidence}
                onChange={(e) =>
                  setSettings({ ...settings, ocrMinConfidence: parseFloat(e.target.value) })
                }
              />
              <p className="mt-1 text-sm text-gray-600">
                Minimum OCR confidence for data extraction (50-100)
              </p>
            </div>

            <div>
              <Label htmlFor="liveness">Liveness Threshold (%)</Label>
              <Input
                id="liveness"
                type="number"
                min="50"
                max="100"
                value={settings.livenessThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, livenessThreshold: parseFloat(e.target.value) })
                }
              />
              <p className="mt-1 text-sm text-gray-600">
                Minimum liveness detection score (50-100)
              </p>
            </div>

            <div>
              <Label htmlFor="retention">Data Retention (Days)</Label>
              <Input
                id="retention"
                type="number"
                min="1"
                max="30"
                value={settings.retentionDays}
                onChange={(e) =>
                  setSettings({ ...settings, retentionDays: parseInt(e.target.value) })
                }
              />
              <p className="mt-1 text-sm text-gray-600">
                Number of days to retain verification data (1-30)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={fetchSettings}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
