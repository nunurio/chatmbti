import { Suspense } from 'react'
import { DiagnosisForm } from '@/components/mbti/DiagnosisForm'
import { getQuestions } from '@/lib/mbti/questions'
import { MBTIQuestion } from '@/lib/mbti/types'
import { MBTI_CONFIG } from '@/lib/mbti/config'

function getCurrentStepQuestions(locale: 'ja' | 'en', step: number): MBTIQuestion[] {
  const allQuestions = getQuestions(locale)
  const startIndex = (step - 1) * MBTI_CONFIG.QUESTIONS_PER_STEP
  const endIndex = Math.min(startIndex + MBTI_CONFIG.QUESTIONS_PER_STEP, allQuestions.length)
  
  return allQuestions.slice(startIndex, endIndex).map((q, index) => ({
    id: q.id,
    axis: q.axis,
    text: q.prompt,
    direction: q.direction,
    code: q.id,
    locale,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: startIndex + index + 1,
  }))
}

interface DiagnosisTestPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ 
    step?: string
    testId?: string 
  }>
}

export default async function DiagnosisTestPage({
  params,
  searchParams,
}: DiagnosisTestPageProps) {
  const { locale } = await params
  const { step = '1', testId } = await searchParams
  
  const currentStep = parseInt(step, 10)
  const stepQuestions = getCurrentStepQuestions(locale as 'ja' | 'en', currentStep)
  const existingAnswers: Record<string, number> = {}
  const currentTestId = testId || 'test-id-' + Date.now()

  // Mock server actions for testing
  async function handleStepComplete(_answers: Record<string, number>) {
    'use server'
    console.log('Mock step complete:', _answers)
    // For testing, just redirect to next step
    if (currentStep < MBTI_CONFIG.TOTAL_STEPS) {
      // Would redirect to next step
    }
  }

  async function handleBack() {
    'use server'
    console.log('Mock back action')
    // Would redirect to previous step
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              MBTI診断テスト (認証なし)
            </h1>
            <p className="text-muted-foreground">
              UIテスト用ページ - Step {currentStep}/{MBTI_CONFIG.TOTAL_STEPS}
            </p>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          }>
            <DiagnosisForm
              testId={currentTestId}
              currentStep={currentStep}
              questions={stepQuestions}
              existingAnswers={existingAnswers}
              onStepComplete={handleStepComplete}
              onBack={currentStep > 1 ? handleBack : undefined}
              showTimeEstimate
            />
          </Suspense>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              このページは認証なしでMBTI診断UIをテストするためのページです。
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
