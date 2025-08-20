import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center">ログイン</h1>
        </div>
        
        <LoginForm mode="login" />
        
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            アカウントをお持ちでない方は{' '}
            <Link 
              href="/signup" 
              className="text-primary hover:underline font-medium"
            >
              アカウント作成
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}