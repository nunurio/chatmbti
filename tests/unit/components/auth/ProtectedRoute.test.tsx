import { render, screen, act } from '@testing-library/react'
import { vi, expect, test, beforeEach } from 'vitest'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthProvider } from '@/components/auth/AuthProvider'
import type { User, Session } from '@supabase/supabase-js'

// Mock Next.js router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

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

beforeEach(() => {
  vi.clearAllMocks()
  mockPush.mockClear()
})

test('ProtectedRoute renders children for authenticated user', () => {
  render(
    <AuthProvider>
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    </AuthProvider>
  )
  
  // Simulate user sign in
  act(() => {
    authStateChangeCallback('SIGNED_IN', mockSession)
  })
  
  expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  expect(screen.getByText('Protected Content')).toBeInTheDocument()
})

test('ProtectedRoute redirects unauthenticated user to login', () => {
  render(
    <AuthProvider>
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    </AuthProvider>
  )
  
  // Simulate user not signed in (loading = false, user = null)
  act(() => {
    authStateChangeCallback('SIGNED_OUT', null)
  })
  
  expect(mockPush).toHaveBeenCalledWith('/login')
  expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
})

test('ProtectedRoute shows loading state', () => {
  render(
    <AuthProvider>
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    </AuthProvider>
  )
  
  // Initial loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
})