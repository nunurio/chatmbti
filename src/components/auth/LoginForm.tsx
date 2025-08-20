'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginFormProps {
  mode: 'login' | 'signup'
}

export function LoginForm({ mode }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string): string => {
    if (!email) {
      return 'メールアドレスが必要です'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return '有効なメールアドレスを入力してください'
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
        setSuccess('メールを確認してください')
      }
    } catch {
      setError('送信中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-center">
          {mode === 'login' ? 'ログイン' : 'アカウント作成'}
        </h1>
        <p className="text-center text-muted-foreground">
          メールアドレスでMagic Linkを送信します
        </p>
      </div>
      
      <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            aria-label="Email"
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
          {isLoading ? '送信中...' : (mode === 'login' ? 'ログイン' : 'サインアップ')}
        </Button>
      </form>
    </div>
  )
}