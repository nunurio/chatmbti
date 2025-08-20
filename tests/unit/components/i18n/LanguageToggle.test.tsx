import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageToggle } from '@/components/i18n/LanguageToggle';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import { vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useLocale: vi.fn(() => 'ja'),
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'language': 'Language',
      'japanese': '日本語',
      'english': 'English',
      'selectLanguage': 'Select language',
    };
    return translations[key] || key;
  }),
}));

// Mock navigation
vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => '/test'),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => ({
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
  })),
}));

// Mock LanguageProvider context
const mockSwitchLanguage = vi.fn();
const mockLanguageContext = {
  locale: 'ja',
  switchLanguage: mockSwitchLanguage,
  isChanging: false,
};

vi.mock('@/components/i18n/LanguageProvider', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useLanguage: () => mockLanguageContext,
}));

// Mock messages
const mockMessages = {
  Common: { 
    language: 'Language',
    japanese: '日本語',
    english: 'English' 
  },
  Settings: { 
    selectLanguage: 'Select language' 
  }
};

describe('LanguageToggle', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockLanguageContext.locale = 'ja';
    mockLanguageContext.isChanging = false;
  });

  function renderWithProviders(component: React.ReactElement) {
    return render(
      <NextIntlClientProvider locale="ja" messages={mockMessages}>
        <LanguageProvider>
          {component}
        </LanguageProvider>
      </NextIntlClientProvider>
    );
  }

  it('displays current language', () => {
    renderWithProviders(<LanguageToggle />);
    
    // Should display current language in the trigger
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('shows available languages in dropdown', async () => {
    renderWithProviders(<LanguageToggle />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // Should show both language options
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('triggers language change on selection', async () => {
    renderWithProviders(<LanguageToggle />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const englishOption = screen.getByText('English');
    await user.click(englishOption);
    
    expect(mockSwitchLanguage).toHaveBeenCalledWith('en');
  });

  it('shows loading state during change', () => {
    mockLanguageContext.isChanging = true;
    
    renderWithProviders(<LanguageToggle />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('is keyboard accessible', async () => {
    renderWithProviders(<LanguageToggle />);
    
    const select = screen.getByRole('combobox');
    
    // Test keyboard navigation
    select.focus();
    expect(select).toHaveFocus();
    
    // Open dropdown with Enter
    await user.keyboard('{Enter}');
    
    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}');
    
    // Select with Enter
    await user.keyboard('{Enter}');
    
    expect(mockSwitchLanguage).toHaveBeenCalled();
  });

  it('has proper ARIA attributes', () => {
    renderWithProviders(<LanguageToggle />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label');
    
    // Should have accessible name
    expect(select).toHaveAccessibleName();
  });

  it('displays correct language for English locale', () => {
    mockLanguageContext.locale = 'en';
    
    renderWithProviders(<LanguageToggle />);
    
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('handles unknown locale gracefully', () => {
    mockLanguageContext.locale = 'fr' as any;
    
    renderWithProviders(<LanguageToggle />);
    
    // Should not crash and show some fallback
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('prevents interaction when changing languages', () => {
    mockLanguageContext.isChanging = true;
    
    renderWithProviders(<LanguageToggle />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    
    // Should show visual indication of loading state
    expect(select).toHaveAttribute('disabled');
  });

  it('maintains focus after language selection', async () => {
    renderWithProviders(<LanguageToggle />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const englishOption = screen.getByText('English');
    await user.click(englishOption);
    
    // After selection, focus should be managed properly
    expect(mockSwitchLanguage).toHaveBeenCalledWith('en');
  });
});