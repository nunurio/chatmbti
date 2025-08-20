'use client';

import { useState, useEffect } from 'react';
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

const ERROR_MESSAGES = {
  LOAD_PROFILE_FAILED: 'プロフィールの読み込みに失敗しました',
  DISPLAY_NAME_REQUIRED: '表示名を入力してください',
  SAVE_FAILED: '保存に失敗しました'
} as const;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [selectedMBTI, setSelectedMBTI] = useState<MBTIType | 'unknown' | null>(null);

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (response.ok) {
        const result = await response.json() as { data: Profile };
        setDisplayName(result.data.display_name || '');
        setSelectedMBTI(result.data.mbti_type || null);
      } else {
        setError(ERROR_MESSAGES.LOAD_PROFILE_FAILED);
      }
    } catch {
      setError(ERROR_MESSAGES.LOAD_PROFILE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!displayName.trim()) {
      setError(ERROR_MESSAGES.DISPLAY_NAME_REQUIRED);
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
        setError(ERROR_MESSAGES.SAVE_FAILED);
      }
    } catch {
      setError(ERROR_MESSAGES.SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div>読み込み中...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="display-name">表示名</Label>
            <Input
              id="display-name"
              aria-label="表示名"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名を入力してください"
            />
          </div>

          <div className="space-y-4">
            <Label>MBTIタイプ</Label>
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
              わからない
            </Button>
          </div>

          <Button
            onClick={() => void saveProfile()}
            disabled={saving}
            className="w-full"
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}