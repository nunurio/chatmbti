import { render, screen, act } from '@testing-library/react'
import { vi, expect, test, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider'
import type { User, Session } from '@supabase/supabase-js'

// Mock user data
const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  app_metadata: {},
  user_metadata: {}
}

const mockSession: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser
}

let authStateChangeCallback: (event: string, session: Session | null) => void
let mockSignOut: any

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => {
    mockSignOut = vi.fn().mockResolvedValue({})
    return {
      auth: {
        onAuthStateChange: vi.fn((callback) => {
          authStateChangeCallback = callback
          return {
            data: { subscription: { unsubscribe: vi.fn() } }
          }
        }),
        signOut: mockSignOut
      }
    }
  })
}))

// Test component that uses useAuth
function TestComponent() {
  const { user, loading, signOut } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user?.id || 'no-user'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <button data-testid="sign-out" onClick={signOut}>
        Sign Out
      </button>
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  if (mockSignOut) {
    mockSignOut.mockClear()
  }
})

test('AuthProvider renders children', () => {
  render(
    <AuthProvider>
      <div data-testid="child">Test Child</div>
    </AuthProvider>
  )
  
  expect(screen.getByTestId('child')).toBeInTheDocument()
  expect(screen.getByText('Test Child')).toBeInTheDocument()
})

test('useAuth throws error when used outside provider', () => {
  // Suppress console.error for this test
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  
  expect(() => {
    render(<TestComponent />)
  }).toThrow('useAuth must be used within an AuthProvider')
  
  consoleSpy.mockRestore()
})

test('useAuth provides initial loading state', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )
  
  expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  expect(screen.getByTestId('loading')).toHaveTextContent('loading')
})

test('useAuth updates state when user signs in', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )
  
  // Initial state
  expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  expect(screen.getByTestId('loading')).toHaveTextContent('loading')
  
  // Simulate sign in
  act(() => {
    authStateChangeCallback('SIGNED_IN', mockSession)
  })
  
  expect(screen.getByTestId('user')).toHaveTextContent('test-user-id')
  expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
})

test('useAuth updates state when user signs out', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )
  
  // Start with signed in user
  act(() => {
    authStateChangeCallback('SIGNED_IN', mockSession)
  })
  expect(screen.getByTestId('user')).toHaveTextContent('test-user-id')
  
  // Simulate sign out
  act(() => {
    authStateChangeCallback('SIGNED_OUT', null)
  })
  
  expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
})

test('signOut function calls supabase signOut', async () => {
  const { getByTestId } = render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )
  
  const signOutButton = getByTestId('sign-out')
  
  await act(async () => {
    signOutButton.click()
  })
  
  expect(mockSignOut).toHaveBeenCalledTimes(1)
})