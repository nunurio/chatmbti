import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockProfile = {
  id: 'test-user-id',
  display_name: 'Test User',
  mbti_type: 'INTJ' as const,
  avatar_url: null,
  bio: null,
  handle: null,
  is_public: false,
  last_seen_at: null,
  preferences: {},
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

global.fetch = vi.fn();

vi.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render profile form elements', async () => {
    const ProfilePage = await import('@/app/[locale]/(auth)/profile/page').then(m => m.default);
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    render(<ProfilePage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('プロフィール設定')).toBeInTheDocument();
    expect(screen.getByLabelText('表示名')).toBeInTheDocument();
    expect(screen.getByText('MBTIタイプ')).toBeInTheDocument();
  });

  it('should display current profile data', async () => {
    const ProfilePage = await import('@/app/(auth)/profile/page').then(m => m.default);
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
  });

  it('should display all MBTI types as options', async () => {
    const ProfilePage = await import('@/app/(auth)/profile/page').then(m => m.default);
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    render(<ProfilePage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    const mbtiTypes = [
      'INTJ', 'INTP', 'ENTJ', 'ENTP',
      'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
      'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ];

    for (const type of mbtiTypes) {
      expect(screen.getByText(type)).toBeInTheDocument();
    }
    
    expect(screen.getByText('わからない')).toBeInTheDocument();
  });

  it('should highlight current MBTI type', async () => {
    const ProfilePage = await import('@/app/(auth)/profile/page').then(m => m.default);
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      const intjButton = screen.getByRole('button', { name: /INTJ/ });
      expect(intjButton).toHaveClass('ring-2');
    });
  });

  it('should allow MBTI type selection', async () => {
    const user = userEvent.setup();
    const ProfilePage = await import('@/app/(auth)/profile/page').then(m => m.default);
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    const entpButton = screen.getByRole('button', { name: /ENTP/ });
    await user.click(entpButton);

    expect(entpButton).toHaveClass('ring-2');
  });

  it('should update display name', async () => {
    const user = userEvent.setup();
    const ProfilePage = await import('@/app/(auth)/profile/page').then(m => m.default);
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    const displayNameInput = screen.getByLabelText('表示名');
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Updated Name');

    expect(displayNameInput).toHaveValue('Updated Name');
  });

  it('should save profile successfully', async () => {
    const user = userEvent.setup();
    const ProfilePage = await import('@/app/(auth)/profile/page').then(m => m.default);
    
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProfile }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { ...mockProfile, display_name: 'Updated Name' } }),
      });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    const displayNameInput = screen.getByLabelText('表示名');
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /保存/ });
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: 'Updated Name',
          mbti_type: 'INTJ',
        }),
      });
    });
  });

  it('should display error when profile save fails', async () => {
    const user = userEvent.setup();
    const ProfilePage = await import('@/app/(auth)/profile/page').then(m => m.default);
    
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProfile }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Save failed' }),
      });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /保存/ });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('保存に失敗しました')).toBeInTheDocument();
    });
  });

  it('should handle "わからない" option selection', async () => {
    const user = userEvent.setup();
    const ProfilePage = await import('@/app/(auth)/profile/page').then(m => m.default);
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    const unknownButton = screen.getByRole('button', { name: /わからない/ });
    await user.click(unknownButton);

    expect(unknownButton).toHaveClass('ring-2');
  });

  it('should show loading state when fetching profile', async () => {
    const ProfilePage = await import('@/app/(auth)/profile/page').then(m => m.default);
    
    (global.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ProfilePage />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
});