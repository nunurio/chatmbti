'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

// Force dynamic rendering for this protected page
export const dynamic = 'force-dynamic';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type MBTIType = Database['public']['Enums']['mbti_code'];

const MBTI_TYPES: MBTIType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

export default function ProfilePage() {
  const t = useTranslations('Auth.profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [selectedMBTI, setSelectedMBTI] = useState<MBTIType | 'unknown' | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (response.ok) {
        const result = await response.json() as { data: Profile };
        setDisplayName(result.data.display_name || '');
        setSelectedMBTI(result.data.mbti_type || null);
      } else {
        setError(t('errors.loadFailed'));
      }
    } catch {
      setError(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const saveProfile = async () => {
    if (!displayName.trim()) {
      setError(t('errors.displayNameRequired'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          mbti_type: selectedMBTI === 'unknown' ? null : selectedMBTI,
        }),
      });

      if (response.ok) {
        // Profile updated successfully
      } else {
        setError(t('errors.saveFailed'));
      }
    } catch {
      setError(t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div>{t('loading')}</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="display-name">{t('displayName')}</Label>
            <Input
              id="display-name"
              aria-label={t('displayName')}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('displayNamePlaceholder')}
            />
          </div>

          <div className="space-y-4">
            <Label>{t('mbtiType')}</Label>
            <div className="grid grid-cols-4 gap-3">
              {MBTI_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={selectedMBTI === type ? 'default' : 'outline'}
                  className={selectedMBTI === type ? 'ring-2 ring-blue-500' : ''}
                  onClick={() => setSelectedMBTI(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant={selectedMBTI === 'unknown' ? 'default' : 'outline'}
              className={`w-full ${selectedMBTI === 'unknown' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedMBTI('unknown')}
            >
              {t('mbtiUnknown')}
            </Button>
          </div>

          <Button
            onClick={() => void saveProfile()}
            disabled={saving}
            className="w-full"
          >
            {saving ? t('saving') : t('saveButton')}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}