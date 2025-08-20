import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { LoginForm } from '@/components/auth/LoginForm'

// Mock Supabase client
const mockSignInWithOtp = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      signInWithOtp: mockSignInWithOtp
    }
  })
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form elements', () => {
    render(<LoginForm mode="login" />)
    
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm mode="login" />)
    
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    
    await user.type(emailInput, 'invalid')
    await user.click(submitButton)
    
    expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument()
  })

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup()
    render(<LoginForm mode="login" />)
    
    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    
    await user.click(submitButton)
    
    expect(screen.getByText('メールアドレスが必要です')).toBeInTheDocument()
  })

  it('sends magic link for valid email', async () => {
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })

    const user = userEvent.setup()
    render(<LoginForm mode="login" />)
    
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('メールを確認してください')).toBeInTheDocument()
    })
    
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: expect.stringContaining('/auth/confirm')
      }
    })
  })

  it('shows error message on magic link send failure', async () => {
    mockSignInWithOtp.mockResolvedValue({ 
      data: {}, 
      error: { message: 'Network error' }
    })

    const user = userEvent.setup()
    render(<LoginForm mode="login" />)
    
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('shows loading state during form submission', async () => {
    let resolvePromise: (value: any) => void
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockSignInWithOtp.mockReturnValue(mockPromise)

    const user = userEvent.setup()
    render(<LoginForm mode="login" />)
    
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    // ローディング中はボタンが無効化される
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('送信中...')).toBeInTheDocument()
    
    // Promise resolve後はローディング状態が解除される
    resolvePromise!({ data: {}, error: null })
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
      expect(screen.queryByText('送信中...')).not.toBeInTheDocument()
    })
  })
})