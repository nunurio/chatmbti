'use client'

import { ReactNode, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  fallback?: ReactNode
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  fallback = <div>Loading...</div> 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Memoize redirect logic to prevent unnecessary re-renders
  const shouldRedirect = useMemo(() => !loading && !user, [loading, user])

  useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo)
    }
  }, [shouldRedirect, router, redirectTo])

  if (loading) {
    return <>{fallback}</>
  }

  if (!user) {
    return null
  }

  // Future: Add profile completion check
  // if (!user.profile_completed) {
  //   router.push('/profile/setup')
  //   return null
  // }

  return <>{children}</>
}