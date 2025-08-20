import { render, screen } from '@testing-library/react'
import Page from '@/app/(auth)/login/page'

// Mock LoginForm component
vi.mock('@/components/auth/LoginForm', () => ({
  LoginForm: ({ mode }: { mode: string }) => (
    <div data-testid="login-form" data-mode={mode}>
      Mocked LoginForm
    </div>
  )
}))

describe('Login Page', () => {
  it('renders login page with correct elements', () => {
    render(<Page />)
    
    // ページタイトルまたはヘッダーが表示される
    expect(screen.getByText('ログイン')).toBeInTheDocument()
    
    // LoginFormが適切なmodeで表示される
    const loginForm = screen.getByTestId('login-form')
    expect(loginForm).toBeInTheDocument()
    expect(loginForm).toHaveAttribute('data-mode', 'login')
    
    // サインアップページへのリンクが表示される
    expect(screen.getByRole('link', { name: /アカウント作成/i })).toBeInTheDocument()
  })

  it('has proper navigation links', () => {
    render(<Page />)
    
    const signupLink = screen.getByRole('link', { name: /アカウント作成/i })
    expect(signupLink).toHaveAttribute('href', '/signup')
  })
})