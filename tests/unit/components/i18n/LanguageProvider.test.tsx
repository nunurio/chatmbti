import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { LanguageProvider, useLanguage } from '@/components/i18n/LanguageProvider';
import { vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useLocale: vi.fn(() => 'ja'),
}));

// Mock navigation
vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/test'),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(),
}));

// Mock messages
const mockMessages = {
  Common: { language: 'Language' },
  Settings: { language: 'Language Selection' }
};

// Test component to consume the context
function TestComponent() {
  const { locale, switchLanguage, isChanging } = useLanguage();
  
  return (
    <div>
      <span data-testid="current-locale">{locale}</span>
      <button 
        data-testid="switch-to-en"
        onClick={() => switchLanguage('en')}
        disabled={isChanging}
      >
        Switch to EN
      </button>
      <button 
        data-testid="switch-to-ja"
        onClick={() => switchLanguage('ja')}
        disabled={isChanging}
      >
        Switch to JA
      </button>
      {isChanging && <span data-testid="loading">Loading...</span>}
    </div>
  );
}

describe('LanguageProvider', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
  };
  
  const mockSupabaseClient = {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } },
        error: null 
      })),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (createBrowserClient as any).mockReturnValue(mockSupabaseClient);
  });

  it('provides current locale from context', () => {
    render(
      <NextIntlClientProvider locale="ja" messages={mockMessages}>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </NextIntlClientProvider>
    );

    expect(screen.getByTestId('current-locale')).toHaveTextContent('ja');
  });

  it('switches language and updates URL', async () => {
    render(
      <NextIntlClientProvider locale="ja" messages={mockMessages}>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </NextIntlClientProvider>
    );

    const switchButton = screen.getByTestId('switch-to-en');
    
    await act(async () => {
      fireEvent.click(switchButton);
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/test', { locale: 'en' });
    });
  });

  it('persists language preference for authenticated users', async () => {
    render(
      <NextIntlClientProvider locale="ja" messages={mockMessages}>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </NextIntlClientProvider>
    );

    const switchButton = screen.getByTestId('switch-to-en');
    
    await act(async () => {
      fireEvent.click(switchButton);
    });

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({ locale: 'en' });
    });
  });

  it('handles language switch for unauthenticated users', async () => {
    // Mock unauthenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    render(
      <NextIntlClientProvider locale="ja" messages={mockMessages}>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </NextIntlClientProvider>
    );

    const switchButton = screen.getByTestId('switch-to-en');
    
    await act(async () => {
      fireEvent.click(switchButton);
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/test', { locale: 'en' });
      // Should not try to update database for unauthenticated users
      expect(mockSupabaseClient.from().update).not.toHaveBeenCalled();
    });
  });

  it('shows loading state during language change', async () => {
    render(
      <NextIntlClientProvider locale="ja" messages={mockMessages}>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </NextIntlClientProvider>
    );

    const switchButton = screen.getByTestId('switch-to-en');
    
    // Mock slow navigation to test loading state
    mockRouter.push.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    act(() => {
      fireEvent.click(switchButton);
    });

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(switchButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  it('handles errors gracefully during language switch', async () => {
    // Mock Supabase error
    mockSupabaseClient.from().update().eq().select.mockResolvedValue({
      error: { message: 'Database error' }
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <NextIntlClientProvider locale="ja" messages={mockMessages}>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </NextIntlClientProvider>
    );

    const switchButton = screen.getByTestId('switch-to-en');
    
    await act(async () => {
      fireEvent.click(switchButton);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to update user locale preference:', expect.any(Object));
      // Should still navigate even if database update fails
      expect(mockRouter.push).toHaveBeenCalledWith('/test', { locale: 'en' });
    });

    consoleSpy.mockRestore();
  });
});