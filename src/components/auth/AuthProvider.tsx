'use client'

import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createBrowserClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Memoize the client to avoid recreation on every render
  const supabase = useMemo(() => createBrowserClient(), [])

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Memoize signOut function to prevent unnecessary re-renders
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase.auth])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signOut
    }),
    [user, session, loading, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}