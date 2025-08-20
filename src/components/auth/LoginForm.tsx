'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginFormProps {
  mode: 'login' | 'signup'
}

export function LoginForm({ mode }: LoginFormProps) {
  const t = useTranslations('Auth.login')
  const tSignup = useTranslations('Auth.signup')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string): string => {
    if (!email) {
      return t('errors.emailRequired')
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return t('errors.emailInvalid')
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(t('success'))
      }
    } catch {
      setError(t('errors.sendingError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-center">
          {mode === 'login' ? t('title') : tSignup('title')}
        </h1>
        <p className="text-center text-muted-foreground">
          {t('magicLinkDescription')}
        </p>
      </div>
      
      <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('emailLabel')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            aria-label={t('emailLabel')}
          />
        </div>
        
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
            {success}
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('sending') : (mode === 'login' ? t('submitButton') : tSignup('submitButton'))}
        </Button>
      </form>
    </div>
  )
}