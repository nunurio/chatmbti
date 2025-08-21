'use client'

import { cn } from '@/lib/utils'
import { QuestionCardProps } from '@/lib/mbti/types'
import { LikertScale } from './LikertScale'

const AXIS_LABELS = {
  EI: '外向性・内向性の軸',
  SN: '感覚・直感の軸', 
  TF: '思考・感情の軸',
  JP: '判断・知覚の軸',
} as const

const AXIS_COLORS = {
  EI: 'bg-blue-100 text-blue-800 border-blue-200',
  SN: 'bg-green-100 text-green-800 border-green-200',
  TF: 'bg-purple-100 text-purple-800 border-purple-200',
  JP: 'bg-orange-100 text-orange-800 border-orange-200',
} as const

export function QuestionCard({
  question,
  value,
  onChange,
  error,
  required = false,
  className,
}: QuestionCardProps) {
  const handleLikertChange = (selectedValue: number) => {
    onChange(question.id, selectedValue)
  }

  return (
    <article
      className={cn(
        'border rounded-lg p-6 space-y-4 bg-card text-card-foreground shadow-sm',
        error && 'border-destructive',
        className
      )}
    >
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span 
            className="text-sm font-medium text-muted-foreground"
            aria-label={`質問番号${question.order}`}
          >
            質問 {question.order}
          </span>
          <span
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded-md border',
              AXIS_COLORS[question.axis]
            )}
            aria-label={AXIS_LABELS[question.axis]}
          >
            {question.axis}
          </span>
        </div>
      </div>

      {/* LikertScale Component */}
      <LikertScale
        questionId={question.id}
        question={question.text}
        value={value}
        onChange={handleLikertChange}
        error={error}
        required={required}
      />
    </article>
  )
}