import { render, screen } from '@testing-library/react'
import Page from '@/app/[locale]/(auth)/signup/page'

// Mock LoginForm component
vi.mock('@/components/auth/LoginForm', () => ({
  LoginForm: ({ mode }: { mode: string }) => (
    <div data-testid="signup-form" data-mode={mode}>
      Mocked LoginForm
    </div>
  )
}))

describe('Signup Page', () => {
  it('renders signup page with correct elements', () => {
    render(<Page />)
    
    // ページタイトルまたはヘッダーが表示される
    expect(screen.getByText('アカウント作成')).toBeInTheDocument()
    
    // LoginFormが適切なmode（signup）で表示される
    const signupForm = screen.getByTestId('signup-form')
    expect(signupForm).toBeInTheDocument()
    expect(signupForm).toHaveAttribute('data-mode', 'signup')
    
    // ログインページへのリンクが表示される
    expect(screen.getByRole('link', { name: /ログイン/i })).toBeInTheDocument()
  })

  it('has proper navigation links', () => {
    render(<Page />)
    
    const loginLink = screen.getByRole('link', { name: /ログイン/i })
    expect(loginLink).toHaveAttribute('href', '/login')
  })
})