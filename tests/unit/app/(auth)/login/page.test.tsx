import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { vi } from 'vitest'
import Page from '@/app/[locale]/(auth)/login/page'

// Mock next-intl server functions
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn((key: string) => {
    const mockTranslations = {
      'Auth.login': {
        title: 'ログイン',
        signupPrompt: 'アカウントをお持ちでないですか？',
        signupLinkText: 'アカウント作成',
      },
    };
    return vi.fn((subkey: string) => mockTranslations[key as keyof typeof mockTranslations]?.[subkey as keyof typeof mockTranslations['Auth.login']] || subkey);
  }),
}));

// Mock navigation components
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock LoginForm component
vi.mock('@/components/auth/LoginForm', () => ({
  LoginForm: ({ mode }: { mode: string }) => (
    <div data-testid="login-form" data-mode={mode}>
      Mocked LoginForm
    </div>
  )
}))

describe('Login Page', () => {
  const mockParams = Promise.resolve({ locale: 'ja' });

  it('renders login page with correct elements', async () => {
    const PageComponent = await Page({ params: mockParams });
    render(PageComponent);
    
    // ページタイトルまたはヘッダーが表示される
    expect(screen.getByText('ログイン')).toBeInTheDocument()
    
    // LoginFormが適切なmodeで表示される
    const loginForm = screen.getByTestId('login-form')
    expect(loginForm).toBeInTheDocument()
    expect(loginForm).toHaveAttribute('data-mode', 'login')
    
    // サインアップページへのリンクが表示される
    expect(screen.getByRole('link', { name: /アカウント作成/i })).toBeInTheDocument()
  })

  it('has proper navigation links', async () => {
    const PageComponent = await Page({ params: mockParams });
    render(PageComponent);
    
    const signupLink = screen.getByRole('link', { name: /アカウント作成/i })
    expect(signupLink).toHaveAttribute('href', '/signup')
  })
})