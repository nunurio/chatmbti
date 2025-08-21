import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ResultDisplay } from '@/components/mbti/ResultDisplay'
import { getTopRecommendations } from '@/lib/mbti/recommendations'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Database } from '@/lib/database.types'

interface ResultPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ testId?: string }>
}

async function ResultContent({ testId }: { testId?: string }) {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // Fetch test result and scores
  let mbtiResult
  if (testId) {
    // Get specific test result by ID
    const { data: testData, error: testError } = await supabase
      .from('mbti_tests')
      .select('id, status, determined_type, scores, created_at')
      .eq('id', testId)
      .eq('user_id', user.id)
      .single()

    if (testError || !testData || testData.status !== 'completed') {
      notFound()
    }

    mbtiResult = {
      type: (testData.determined_type as string) || 'UNKNOWN',
      confidence: 85, // Default confidence since not stored in mbti_tests
      scores: (testData.scores as { EI: number; SN: number; TF: number; JP: number }) || { EI: 0, SN: 0, TF: 0, JP: 0 }
    }
  } else {
    // Get latest completed result from user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('mbti_type')
      .eq('id', user.id)
      .single()

    if (profileError || !profileData?.mbti_type) {
      redirect('/mbti/diagnosis')
    }

    mbtiResult = {
      type: (profileData.mbti_type as string),
      confidence: 85, // Default confidence for saved results
      scores: { EI: 0, SN: 0, TF: 0, JP: 0 } // Default scores since not stored in profiles
    }
  }

  // Fetch available personas for recommendations
  const { data: personas, error: personasError } = await supabase
    .from('bot_personas')
    .select('id, name, mbti_type, description')
    .eq('visibility', 'public')
    .not('mbti_type', 'is', null)

  if (personasError) {
    console.error('Error fetching personas:', personasError)
  }

  // Calculate recommendations
  const validPersonas = (personas || []).filter(p => p.mbti_type !== null).map(p => ({
    id: p.id,
    name: p.name,
    mbtiType: p.mbti_type as string,
    description: p.description || ''
  }))

  const recommendations = getTopRecommendations(mbtiResult.type, validPersonas)

  const handleSave = async (result: { type: string; scores: Record<string, number> }) => {
    'use server'
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('profiles')
        .update({
          mbti_type: result.type as Database['public']['Enums']['mbti_code'],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }
  }

  async function handleRetakeTest() {
    'use server'
    redirect('/mbti/diagnosis')
  }

  async function handleStartChat() {
    'use server'
    redirect('/chat')
  }

  async function handlePersonaSelect(persona: { id: string }) {
    'use server'
    redirect(`/chat?persona=${persona.id}`)
  }

  return (
    <ResultDisplay
      result={mbtiResult}
      recommendations={recommendations}
      onSave={(result) => void handleSave(result)}
      onRetakeTest={handleRetakeTest}
      onStartChat={handleStartChat}
      onPersonaSelect={handlePersonaSelect}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-24 mx-auto" />
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-56 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const { testId } = await searchParams

  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <ResultContent testId={testId} />
      </Suspense>
    </main>
  )
}