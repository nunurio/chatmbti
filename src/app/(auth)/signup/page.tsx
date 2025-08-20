import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center">アカウント作成</h1>
        </div>
        
        <LoginForm mode="signup" />
        
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            既にアカウントをお持ちの方は{' '}
            <Link 
              href="/login" 
              className="text-primary hover:underline font-medium"
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}