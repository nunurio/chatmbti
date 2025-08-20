// utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 既存ヘッダを引き継いだ NextResponse を作成
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // request/response の cookies を橋渡しするサーバクライアント
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // ここで getUser() を呼ぶことで、期限切れならトークンが更新され setAll 経由で Cookie 同期される
  await supabase.auth.getUser()

  return response
}