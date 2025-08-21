import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DiagnosisForm } from '@/components/mbti/DiagnosisForm'
import { getQuestions } from '@/lib/mbti/questions'
import { MBTIQuestion } from '@/lib/mbti/types'
import { MBTI_CONFIG } from '@/lib/mbti/config'

function getCurrentStepQuestions(locale: 'ja' | 'en', step: number): MBTIQuestion[] {
  const allQuestions = getQuestions(locale)
  const startIndex = (step - 1) * MBTI_CONFIG.QUESTIONS_PER_STEP
  const endIndex = Math.min(startIndex + MBTI_CONFIG.QUESTIONS_PER_STEP, allQuestions.length)
  
  // Convert to MBTIQuestion format (adding missing database fields)
  return allQuestions.slice(startIndex, endIndex).map((q, index) => ({
    id: q.id,
    axis: q.axis,
    text: q.prompt, // Map prompt to text
    direction: q.direction,
    code: q.id,
    locale,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: startIndex + index + 1, // Ensure proper ordering
  }))
}

interface DiagnosisPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ 
    step?: string
    testId?: string 
  }>
}

export default async function DiagnosisPage({
  params,
  searchParams,
}: DiagnosisPageProps) {
  const { locale } = await params
  const { step = '1', testId } = await searchParams
  
  // Validate locale
  if (locale !== 'ja' && locale !== 'en') {
    redirect('/ja/mbti/diagnosis?step=1')
  }
  
  const currentStep = parseInt(step, 10)
  
  // Validate step
  if (isNaN(currentStep) || currentStep < 1 || currentStep > MBTI_CONFIG.TOTAL_STEPS) {
    redirect(`/${locale}/mbti/diagnosis?step=1`)
  }
  
  // Get questions for current step
  const stepQuestions = getCurrentStepQuestions(locale, currentStep)
  
  // Mock existing answers - in production, this would come from database
  const existingAnswers: Record<string, number> = {}
  
  // Mock test ID - in production, this would be generated or retrieved
  const currentTestId = testId || 'mock-test-id-' + Date.now()

  // Create server actions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleStepComplete(_answers: Record<string, number>) {
    'use server'
    
    // In a production implementation, this would integrate with the DiagnosisService
    // For now, we maintain the existing mock behavior for the UI flow
    
    // Navigate to next step or results
    if (currentStep === MBTI_CONFIG.TOTAL_STEPS) {
      // Complete diagnosis - redirect to results
      redirect(`/${locale}/mbti/result?testId=${currentTestId}`)
    } else {
      // Next step
      redirect(`/${locale}/mbti/diagnosis?step=${currentStep + 1}&testId=${currentTestId}`)
    }
  }

  async function handleBack() {
  'use server'
  
  if (currentStep > 1) {
    redirect(`/${locale}/mbti/diagnosis?step=${currentStep - 1}&testId=${currentTestId}`)
  }
}

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                MBTI診断
              </h1>
              <p className="text-muted-foreground">
                あなたの性格タイプを発見しましょう
              </p>
            </div>

            {/* Diagnosis Form */}
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

            {/* Help Text */}
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                各質問について、あなたの普段の行動や考え方に最も近いものを選択してください。
                直感的に答えることで、より正確な結果が得られます。
              </p>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}