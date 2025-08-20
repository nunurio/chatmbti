import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeToggle } from '@/components/ThemeToggle';
import { vi } from 'vitest';

const japaneseMessages = {
  Settings: {
    theme: {
      label: 'テーマ',
      light: 'ライト',
      dark: 'ダーク',
      toggle: 'テーマ切替',
    },
  },
};

const englishMessages = {
  Settings: {
    theme: {
      label: 'Theme',
      light: 'Light',
      dark: 'Dark',
      toggle: 'Toggle theme',
    },
  },
};

function renderWithIntl(ui: React.ReactElement, locale = 'ja') {
  const messages = locale === 'ja' ? japaneseMessages : englishMessages;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('ThemeToggle i18n', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Japanese locale', () => {
    it('has correct aria-label in Japanese for light theme', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      renderWithIntl(<ThemeToggle />, 'ja');
      
      const button = screen.getByLabelText('テーマ切替');
      expect(button).toBeInTheDocument();
    });

    it('has correct title attribute in Japanese', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      renderWithIntl(<ThemeToggle />, 'ja');
      
      const button = screen.getByTitle('テーマ切替');
      expect(button).toBeInTheDocument();
    });

    it('maintains aria-label in Japanese when toggling themes', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('light');
      
      renderWithIntl(<ThemeToggle />, 'ja');
      
      const button = screen.getByLabelText('テーマ切替');
      expect(button).toBeInTheDocument();
      
      // Click to toggle theme
      await user.click(button);
      
      // Should still have Japanese aria-label
      expect(screen.getByLabelText('テーマ切替')).toBeInTheDocument();
    });
  });

  describe('English locale', () => {
    it('has correct aria-label in English for light theme', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      renderWithIntl(<ThemeToggle />, 'en');
      
      const button = screen.getByLabelText('Toggle theme');
      expect(button).toBeInTheDocument();
    });

    it('has correct title attribute in English', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      renderWithIntl(<ThemeToggle />, 'en');
      
      const button = screen.getByTitle('Toggle theme');
      expect(button).toBeInTheDocument();
    });

    it('maintains aria-label in English when toggling themes', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('light');
      
      renderWithIntl(<ThemeToggle />, 'en');
      
      const button = screen.getByLabelText('Toggle theme');
      expect(button).toBeInTheDocument();
      
      // Click to toggle theme
      await user.click(button);
      
      // Should still have English aria-label
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });
  });

  describe('Theme functionality with i18n', () => {
    it('toggles between light and dark themes correctly', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('light');
      
      renderWithIntl(<ThemeToggle />, 'ja');
      
      const button = screen.getByLabelText('テーマ切替');
      
      // Initially should show moon icon (for switching to dark)
      const moonIcon = button.querySelector('svg');
      expect(moonIcon).toBeInTheDocument();
      
      // Click to toggle to dark
      await user.click(button);
      
      // Should now show sun icon (for switching to light)
      const sunIcon = button.querySelector('svg');
      expect(sunIcon).toBeInTheDocument();
    });

    it('saves theme preference to localStorage', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('light');
      
      renderWithIntl(<ThemeToggle />, 'ja');
      
      const button = screen.getByLabelText('テーマ切替');
      await user.click(button);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('chat-mvp:theme', 'dark');
    });
  });
});