import { cn } from '@/lib/utils'
import { DiagnosisProgressProps } from '@/lib/mbti/types'
import { MBTI_CONFIG } from '@/lib/mbti/config'

export function DiagnosisProgress({
  currentStep,
  totalSteps,
  showTimeEstimate = false,
  className,
}: DiagnosisProgressProps) {
  // 心理学的配慮: 早期の進捗を早く見せる
  const calculateProgressPercentage = () => {
    if (currentStep === 0) return 0
    if (currentStep === 1) return 15 // 1問目で15%表示
    
    // 初期問題は早期進捗ブーストを適用
    let percentage: number
    if (currentStep <= MBTI_CONFIG.EARLY_QUESTIONS_COUNT) {
      percentage = (currentStep / totalSteps) * 100 * MBTI_CONFIG.EARLY_PROGRESS_MULTIPLIER
    } else {
      percentage = (currentStep / totalSteps) * 100
    }
    
    // 設定された最大値まで（完了前に少し残す）
    return Math.min(MBTI_CONFIG.MAX_PROGRESS_PERCENTAGE, Math.round(percentage))
  }

  // 推定残り時間計算
  const calculateRemainingTime = () => {
    const remainingSteps = totalSteps - currentStep
    return Math.max(1, Math.ceil(remainingSteps * MBTI_CONFIG.ESTIMATED_TIME_PER_QUESTION))
  }

  const progressPercentage = calculateProgressPercentage()
  const remainingMinutes = calculateRemainingTime()

  return (
    <div className={cn('mb-8', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {progressPercentage}% complete
        </span>
      </div>

      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`診断の進捗: ステップ${currentStep}/${totalSteps}、${progressPercentage}%完了`}
          tabIndex={0}
        />
      </div>

      {showTimeEstimate && (
        <p className="text-xs text-muted-foreground mt-2">
          About {remainingMinutes} minute{remainingMinutes === 1 ? '' : 's'} remaining
        </p>
      )}
    </div>
  )
}