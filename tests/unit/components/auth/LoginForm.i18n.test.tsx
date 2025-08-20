import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';
import { LoginForm } from '@/components/auth/LoginForm';

const createMockMessages = (locale: 'ja' | 'en') => {
  if (locale === 'ja') {
    return {
      Auth: {
        login: {
          title: 'ログイン',
          emailLabel: 'メールアドレス',
          emailPlaceholder: 'name@example.com',
          submitButton: 'ログイン',
          magicLinkDescription: 'メールアドレスでMagic Linkを送信します',
          sending: '送信中...',
          success: 'メールを確認してください',
          errors: {
            emailRequired: 'メールアドレスが必要です',
            emailInvalid: '有効なメールアドレスを入力してください',
            sendingError: '送信中にエラーが発生しました'
          }
        },
        signup: {
          title: 'アカウント作成',
          submitButton: 'サインアップ'
        }
      }
    };
  } else {
    return {
      Auth: {
        login: {
          title: 'Login',
          emailLabel: 'Email',
          emailPlaceholder: 'name@example.com',
          submitButton: 'Login',
          magicLinkDescription: 'We will send you a Magic Link via email',
          sending: 'Sending...',
          success: 'Please check your email',
          errors: {
            emailRequired: 'Email is required',
            emailInvalid: 'Please enter a valid email address',
            sendingError: 'Error occurred while sending'
          }
        },
        signup: {
          title: 'Sign Up',
          submitButton: 'Sign Up'
        }
      }
    };
  }
};

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      signInWithOtp: vi.fn(() => Promise.resolve({ error: null }))
    }
  }))
}));

describe('LoginForm i18n', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays login form elements in Japanese', () => {
    const messages = createMockMessages('ja');
    render(
      <NextIntlClientProvider locale="ja" messages={messages}>
        <LoginForm mode="login" />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByText('メールアドレスでMagic Linkを送信します')).toBeInTheDocument();
  });

  it('displays login form elements in English', () => {
    const messages = createMockMessages('en');
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LoginForm mode="login" />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('We will send you a Magic Link via email')).toBeInTheDocument();
  });

  it('displays signup form elements in Japanese', () => {
    const messages = createMockMessages('ja');
    render(
      <NextIntlClientProvider locale="ja" messages={messages}>
        <LoginForm mode="signup" />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'アカウント作成' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'サインアップ' })).toBeInTheDocument();
  });

  it('displays signup form elements in English', () => {
    const messages = createMockMessages('en');
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LoginForm mode="signup" />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('shows validation errors in Japanese', async () => {
    const messages = createMockMessages('ja');
    render(
      <NextIntlClientProvider locale="ja" messages={messages}>
        <LoginForm mode="login" />
      </NextIntlClientProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('メールアドレスが必要です')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('メールアドレス');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    });
  });

  it('shows validation errors in English', async () => {
    const messages = createMockMessages('en');
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LoginForm mode="login" />
      </NextIntlClientProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows loading state in Japanese', async () => {
    const messages = createMockMessages('ja');
    render(
      <NextIntlClientProvider locale="ja" messages={messages}>
        <LoginForm mode="login" />
      </NextIntlClientProvider>
    );

    const emailInput = screen.getByLabelText('メールアドレス');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('送信中...')).toBeInTheDocument();
    });
  });

  it('shows loading state in English', async () => {
    const messages = createMockMessages('en');
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LoginForm mode="login" />
      </NextIntlClientProvider>
    );

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });
  });
});