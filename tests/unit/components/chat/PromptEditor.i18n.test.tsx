import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { PromptEditor } from '@/components/chat/PromptEditor';
import { vi } from 'vitest';

const japaneseMessages = {
  Chat: {
    promptEditor: {
      triggerButton: '性格を変更',
      title: 'モデルの性格（System Prompt）',
      label: 'System prompt',
      placeholder: '例: あなたは簡潔かつ丁寧に返答する日本語アシスタントです。...',
      resetButton: 'デフォルトに戻す',
      saveButton: '保存',
    },
  },
};

const englishMessages = {
  Chat: {
    promptEditor: {
      triggerButton: 'Change personality',
      title: 'Model Personality (System Prompt)',
      label: 'System prompt',
      placeholder: 'Example: You are a concise and polite English assistant...',
      resetButton: 'Reset to default',
      saveButton: 'Save',
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

describe('PromptEditor i18n', () => {
  const mockOnSave = vi.fn();
  const defaultProps = {
    value: 'You are a helpful assistant.',
    onSave: mockOnSave,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Japanese locale', () => {
    it('displays default trigger button text in Japanese', () => {
      renderWithIntl(<PromptEditor {...defaultProps} />, 'ja');
      expect(screen.getByRole('button', { name: '性格を変更' })).toBeInTheDocument();
    });

    it('displays dialog title in Japanese when opened', async () => {
      const user = userEvent.setup();
      renderWithIntl(<PromptEditor {...defaultProps} />, 'ja');
      
      const triggerButton = screen.getByRole('button', { name: '性格を変更' });
      await user.click(triggerButton);
      
      expect(screen.getByText('モデルの性格（System Prompt）')).toBeInTheDocument();
    });

    it('displays label in Japanese', async () => {
      const user = userEvent.setup();
      renderWithIntl(<PromptEditor {...defaultProps} />, 'ja');
      
      const triggerButton = screen.getByRole('button', { name: '性格を変更' });
      await user.click(triggerButton);
      
      expect(screen.getByText('System prompt')).toBeInTheDocument();
    });

    it('displays textarea placeholder in Japanese', async () => {
      const user = userEvent.setup();
      renderWithIntl(<PromptEditor {...defaultProps} />, 'ja');
      
      const triggerButton = screen.getByRole('button', { name: '性格を変更' });
      await user.click(triggerButton);
      
      expect(screen.getByPlaceholderText('例: あなたは簡潔かつ丁寧に返答する日本語アシスタントです。...')).toBeInTheDocument();
    });

    it('displays buttons in Japanese', async () => {
      const user = userEvent.setup();
      renderWithIntl(<PromptEditor {...defaultProps} />, 'ja');
      
      const triggerButton = screen.getByRole('button', { name: '性格を変更' });
      await user.click(triggerButton);
      
      expect(screen.getByRole('button', { name: 'デフォルトに戻す' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    });
  });

  describe('English locale', () => {
    it('displays default trigger button text in English', () => {
      renderWithIntl(<PromptEditor {...defaultProps} />, 'en');
      expect(screen.getByRole('button', { name: 'Change personality' })).toBeInTheDocument();
    });

    it('displays dialog title in English when opened', async () => {
      const user = userEvent.setup();
      renderWithIntl(<PromptEditor {...defaultProps} />, 'en');
      
      const triggerButton = screen.getByRole('button', { name: 'Change personality' });
      await user.click(triggerButton);
      
      expect(screen.getByText('Model Personality (System Prompt)')).toBeInTheDocument();
    });

    it('displays label in English', async () => {
      const user = userEvent.setup();
      renderWithIntl(<PromptEditor {...defaultProps} />, 'en');
      
      const triggerButton = screen.getByRole('button', { name: 'Change personality' });
      await user.click(triggerButton);
      
      expect(screen.getByText('System prompt')).toBeInTheDocument();
    });

    it('displays textarea placeholder in English', async () => {
      const user = userEvent.setup();
      renderWithIntl(<PromptEditor {...defaultProps} />, 'en');
      
      const triggerButton = screen.getByRole('button', { name: 'Change personality' });
      await user.click(triggerButton);
      
      expect(screen.getByPlaceholderText('Example: You are a concise and polite English assistant...')).toBeInTheDocument();
    });

    it('displays buttons in English', async () => {
      const user = userEvent.setup();
      renderWithIntl(<PromptEditor {...defaultProps} />, 'en');
      
      const triggerButton = screen.getByRole('button', { name: 'Change personality' });
      await user.click(triggerButton);
      
      expect(screen.getByRole('button', { name: 'Reset to default' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  describe('Functionality with i18n', () => {
    it('calls onSave when save button is clicked', async () => {
      const user = userEvent.setup();
      renderWithIntl(<PromptEditor {...defaultProps} />, 'ja');
      
      const triggerButton = screen.getByRole('button', { name: '性格を変更' });
      await user.click(triggerButton);
      
      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);
      
      expect(mockOnSave).toHaveBeenCalledWith(defaultProps.value);
    });

    it('resets to default when reset button is clicked', async () => {
      const user = userEvent.setup();
      renderWithIntl(<PromptEditor {...defaultProps} />, 'ja');
      
      const triggerButton = screen.getByRole('button', { name: '性格を変更' });
      await user.click(triggerButton);
      
      const resetButton = screen.getByRole('button', { name: 'デフォルトに戻す' });
      await user.click(resetButton);
      
      const textarea = screen.getByDisplayValue('You are a helpful assistant.');
      expect(textarea).toBeInTheDocument();
    });
  });
});