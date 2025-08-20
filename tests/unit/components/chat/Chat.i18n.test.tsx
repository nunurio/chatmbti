import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { Chat } from '@/components/chat/Chat';
import { vi } from 'vitest';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock the useLocalStorage hook
vi.mock('@/hooks/use-local-storage', () => ({
  useLocalStorage: vi.fn((key: string, defaultValue: any) => [defaultValue, vi.fn()]),
}));

// Mock the parseSSE function
vi.mock('@/lib/sse', () => ({
  parseSSE: vi.fn(),
}));

const japaneseMessages = {
  Chat: {
    newChat: '新しいチャット',
    inputPlaceholder: 'メッセージを入力。Enterで送信、Shift+Enterで改行',
    sendButton: '送信',
    stopButton: '停止',
    conversations: '会話',
    newChatButton: '新規チャット',
    conversationsSaved: '会話はローカルに保存されます',
    conversationsAriaLabel: '会話一覧',
    systemPromptAriaLabel: 'System Prompt',
    emptyStateMessage: '最初のメッセージを送信して会話を始めましょう',
    errors: {
      generic: 'エラー',
      networkError: 'ネットワークエラーが発生しました',
    },
    prompts: {
      suggestion1: 'このプロジェクトの設計方針を要約して',
      suggestion2: '次の文章を丁寧な日本語に書き直して', 
      suggestion3: 'コードのパフォーマンス改善案を3つ出して',
    },
    promptEditor: {
      triggerButton: '性格を変更',
      title: 'モデルの性格（System Prompt）',
      label: 'System prompt',
      placeholder: '例: あなたは簡潔かつ丁寧に返答する日本語アシスタントです。...',
      resetButton: 'デフォルトに戻す',
      saveButton: '保存',
    },
  },
  Settings: {
    theme: {
      label: 'テーマ',
      light: 'ライト',
      dark: 'ダーク',
      system: 'システム設定に従う',
      toggle: 'テーマ切替',
    },
  },
};

const englishMessages = {
  Chat: {
    newChat: 'New Chat',
    inputPlaceholder: 'Type a message. Press Enter to send, Shift+Enter for new line',
    sendButton: 'Send',
    stopButton: 'Stop',
    conversations: 'Conversations',
    newChatButton: 'New Chat',
    conversationsSaved: 'Conversations are saved locally',
    conversationsAriaLabel: 'Conversation list',
    systemPromptAriaLabel: 'System Prompt',
    emptyStateMessage: 'Send your first message to start a conversation',
    errors: {
      generic: 'Error',
      networkError: 'Network error occurred',
    },
    prompts: {
      suggestion1: 'Summarize the design principles of this project',
      suggestion2: 'Rewrite the following text in polite English',
      suggestion3: 'Give me 3 code performance improvement suggestions',
    },
    promptEditor: {
      triggerButton: 'Change personality',
      title: 'Model Personality (System Prompt)',
      label: 'System prompt',
      placeholder: 'Example: You are a concise and polite English assistant...',
      resetButton: 'Reset to default',
      saveButton: 'Save',
    },
  },
  Settings: {
    theme: {
      label: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
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

describe('Chat i18n', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock scrollIntoView method for DOM testing
    Element.prototype.scrollIntoView = vi.fn();
    
    // Mock ResizeObserver for ScrollArea components
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  describe('Japanese locale', () => {
    it('displays input placeholder in Japanese', () => {
      renderWithIntl(<Chat />, 'ja');
      expect(screen.getByPlaceholderText('メッセージを入力。Enterで送信、Shift+Enterで改行')).toBeInTheDocument();
    });

    it('displays send button in Japanese', () => {
      renderWithIntl(<Chat />, 'ja');
      expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();
    });

    it('displays stop button in Japanese', () => {
      renderWithIntl(<Chat />, 'ja');
      expect(screen.getByRole('button', { name: '停止' })).toBeInTheDocument();
    });

    it('displays conversations title in Japanese', () => {
      renderWithIntl(<Chat />, 'ja');
      const menuButton = screen.getByLabelText('会話一覧');
      fireEvent.click(menuButton);
      expect(screen.getByText('会話')).toBeInTheDocument();
    });

    it('displays new chat button in Japanese', () => {
      renderWithIntl(<Chat />, 'ja');
      expect(screen.getByRole('button', { name: /新規チャット/ })).toBeInTheDocument();
    });

    it('displays conversations saved message in Japanese', () => {
      renderWithIntl(<Chat />, 'ja');
      expect(screen.getByText('会話はローカルに保存されます')).toBeInTheDocument();
    });

    it('displays empty state message in Japanese', () => {
      renderWithIntl(<Chat />, 'ja');
      expect(screen.getByText('最初のメッセージを送信して会話を始めましょう')).toBeInTheDocument();
    });

    it('displays prompt suggestions in Japanese', () => {
      renderWithIntl(<Chat />, 'ja');
      expect(screen.getByText('このプロジェクトの設計方針を要約して')).toBeInTheDocument();
      expect(screen.getByText('次の文章を丁寧な日本語に書き直して')).toBeInTheDocument();
      expect(screen.getByText('コードのパフォーマンス改善案を3つ出して')).toBeInTheDocument();
    });

    it('has correct aria-labels in Japanese', () => {
      renderWithIntl(<Chat />, 'ja');
      expect(screen.getByLabelText('会話一覧')).toBeInTheDocument();
      expect(screen.getByLabelText('System Prompt')).toBeInTheDocument();
    });
  });

  describe('English locale', () => {
    it('displays input placeholder in English', () => {
      renderWithIntl(<Chat />, 'en');
      expect(screen.getByPlaceholderText('Type a message. Press Enter to send, Shift+Enter for new line')).toBeInTheDocument();
    });

    it('displays send button in English', () => {
      renderWithIntl(<Chat />, 'en');
      expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    });

    it('displays stop button in English', () => {
      renderWithIntl(<Chat />, 'en');
      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
    });

    it('displays conversations title in English', () => {
      renderWithIntl(<Chat />, 'en');
      const menuButton = screen.getByLabelText('Conversation list');
      fireEvent.click(menuButton);
      expect(screen.getByText('Conversations')).toBeInTheDocument();
    });

    it('displays new chat button in English', () => {
      renderWithIntl(<Chat />, 'en');
      expect(screen.getByRole('button', { name: /New Chat/ })).toBeInTheDocument();
    });

    it('displays conversations saved message in English', () => {
      renderWithIntl(<Chat />, 'en');
      expect(screen.getByText('Conversations are saved locally')).toBeInTheDocument();
    });

    it('displays empty state message in English', () => {
      renderWithIntl(<Chat />, 'en');
      expect(screen.getByText('Send your first message to start a conversation')).toBeInTheDocument();
    });

    it('displays prompt suggestions in English', () => {
      renderWithIntl(<Chat />, 'en');
      expect(screen.getByText('Summarize the design principles of this project')).toBeInTheDocument();
      expect(screen.getByText('Rewrite the following text in polite English')).toBeInTheDocument();
      expect(screen.getByText('Give me 3 code performance improvement suggestions')).toBeInTheDocument();
    });

    it('has correct aria-labels in English', () => {
      renderWithIntl(<Chat />, 'en');
      expect(screen.getByLabelText('Conversation list')).toBeInTheDocument();
      expect(screen.getByLabelText('System Prompt')).toBeInTheDocument();
    });
  });

  describe('Dynamic content behavior', () => {
    it('clicking suggestion sets input value', async () => {
      const user = userEvent.setup();
      renderWithIntl(<Chat />, 'ja');
      
      const suggestion = screen.getByText('このプロジェクトの設計方針を要約して');
      await user.click(suggestion);
      
      const textarea = screen.getByPlaceholderText('メッセージを入力。Enterで送信、Shift+Enterで改行');
      expect(textarea).toHaveValue('このプロジェクトの設計方針を要約して');
    });

    it('creates new chat with translated title', async () => {
      const user = userEvent.setup();
      renderWithIntl(<Chat />, 'ja');
      
      const newChatButton = screen.getByRole('button', { name: /新規チャット/ });
      await user.click(newChatButton);
      
      // This will depend on the implementation, but should create a new chat
      // with "新しいチャット" title
    });
  });
});