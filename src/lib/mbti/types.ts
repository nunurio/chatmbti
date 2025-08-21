import { Database } from '@/lib/database.types'

// データベース型のエイリアス
export type MBTIAxis = Database['public']['Enums']['mbti_axis']
export type MBTICode = Database['public']['Enums']['mbti_code']
export type MBTITest = Database['public']['Tables']['mbti_tests']['Row']
export type MBTIAnswer = Database['public']['Tables']['mbti_answers']['Row']
export type MBTIQuestion = Database['public']['Tables']['mbti_questions']['Row']

// 診断フォーム用の型定義
export interface DiagnosisFormData {
  testId: string
  currentStep: number
  answers: Record<string, number> // questionId -> score (1-7)
}

export interface LikertScaleProps {
  questionId: string
  question: string
  value?: number
  onChange: (value: number) => void
  error?: string
  required?: boolean
  disabled?: boolean
}

export interface QuestionCardProps {
  question: MBTIQuestion
  value?: number
  onChange: (questionId: string, value: number) => void
  error?: string
  required?: boolean
  className?: string
}

export interface DiagnosisProgressProps {
  currentStep: number
  totalSteps: number
  showTimeEstimate?: boolean
  className?: string
}

export interface DiagnosisFormProps {
  testId: string
  currentStep: number
  questions: MBTIQuestion[]
  existingAnswers: Record<string, number>
  onStepComplete: (answers: Record<string, number>) => Promise<void>
  onBack?: () => void
  showTimeEstimate?: boolean
}

// 診断の状態管理用
export interface DiagnosisState {
  testId: string | null
  currentStep: number
  totalSteps: number
  answers: Record<string, number>
  isLoading: boolean
  error: string | null
}

export type DiagnosisAction =
  | { type: 'SET_TEST_ID'; payload: string }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_ANSWER'; payload: { questionId: string; value: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }

// Likert Scale の選択肢
export interface LikertOption {
  value: number
  label: string
  shortLabel?: string
}

export const LIKERT_OPTIONS: LikertOption[] = [
  { value: 1, label: '強く反対', shortLabel: '1' },
  { value: 2, label: '反対', shortLabel: '2' },
  { value: 3, label: 'やや反対', shortLabel: '3' },
  { value: 4, label: 'どちらでもない', shortLabel: '4' },
  { value: 5, label: 'やや同意', shortLabel: '5' },
  { value: 6, label: '同意', shortLabel: '6' },
  { value: 7, label: '強く同意', shortLabel: '7' },
]

// 診断結果関連
export interface DiagnosisResult {
  mbtiType: MBTICode
  scores: {
    EI: number // Extroversion(-) vs Introversion(+)
    SN: number // Sensing(-) vs Intuition(+)
    TF: number // Thinking(-) vs Feeling(+)
    JP: number // Judging(-) vs Perceiving(+)
  }
  confidence: number // 0-1
  completedAt: string
}

// API レスポンス型
export interface DiagnosisApiResponse {
  success: boolean
  testId?: string
  currentStep?: number
  result?: DiagnosisResult
  error?: string
}

// フォームバリデーション用
export interface DiagnosisFormErrors {
  [questionId: string]: string
}

export interface DiagnosisFormState {
  isValid: boolean
  errors: DiagnosisFormErrors
  isSubmitting: boolean
}