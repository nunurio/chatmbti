'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { DiagnosisFormProps } from '@/lib/mbti/types'
import { MBTI_CONFIG } from '@/lib/mbti/config'
import { DiagnosisProgress } from './DiagnosisProgress'
import { QuestionCard } from './QuestionCard'
import { Button } from '@/components/ui/button'

interface FormErrors {
  [questionId: string]: string
}

export function DiagnosisForm({
  currentStep,
  questions,
  existingAnswers = {},
  onStepComplete,
  onBack,
}: DiagnosisFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(existingAnswers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showTimeEstimate] = useState(true)

  // Update answers when existingAnswers prop changes
  useEffect(() => {
    setAnswers(existingAnswers)
  }, [existingAnswers])

  // Calculate total steps from configuration
  const totalSteps = MBTI_CONFIG.TOTAL_STEPS

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // Clear error for this question if it exists
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Check if all questions have answers
    questions.forEach(question => {
      if (!answers[question.id]) {
        newErrors[question.id] = 'This question is required'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onStepComplete(answers)
    } catch (error) {
      console.error('Submission error:', error)
      // Note: Error handling could be more sophisticated
      setErrors({ 
        _form: 'An error occurred while saving your answers. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps
  const hasUnansweredQuestions = questions.some(q => !answers[q.id])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <DiagnosisProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        showTimeEstimate={showTimeEstimate}
      />

      <form onSubmit={(e) => void handleSubmit(e)} role="form" className="space-y-8">
        {/* Error Summary */}
        {(Object.keys(errors).length > 0 || hasUnansweredQuestions) && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
          >
            <h3 className="font-medium text-destructive mb-2">
              Please fix the following errors:
            </h3>
            <ul className="text-sm text-destructive space-y-1">
              {errors._form && <li>• {errors._form}</li>}
              {hasUnansweredQuestions && (
                <li>• Please answer all questions before continuing</li>
              )}
              {Object.entries(errors)
                .filter(([key]) => key !== '_form')
                .map(([questionId, error]) => {
                  const question = questions.find(q => q.id === questionId)
                  return (
                    <li key={questionId}>
                      • Question {question?.order}: {error}
                    </li>
                  )
                })}
            </ul>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={handleAnswerChange}
              error={errors[question.id]}
              required
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isFirstStep}
            className="min-w-[100px]"
          >
            Back
          </Button>

          <div className="flex items-center gap-4">
            {/* Step indicator for mobile */}
            <span className="text-sm text-muted-foreground md:hidden">
              {currentStep} / {totalSteps}
            </span>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "min-w-[100px]",
                isLastStep && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isSubmitting 
                ? 'Saving...' 
                : isLastStep 
                  ? 'Complete' 
                  : 'Next'
              }
            </Button>
          </div>
        </div>
      </form>

      {/* Progress for screen readers */}
      <div 
        role="progressbar"
        aria-live="polite"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        className="sr-only"
      >
        Step {currentStep} of {totalSteps} completed
      </div>
    </div>
  )
}