'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'
import { LikertScaleProps, LIKERT_OPTIONS } from '@/lib/mbti/types'

export function LikertScale({
  questionId,
  question,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}: LikertScaleProps) {
  const id = useId()
  const errorId = `${id}-error`

  const handleChange = (selectedValue: number) => {
    if (!disabled) {
      onChange(selectedValue)
    }
  }

  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-lg font-medium mb-6 text-left w-full text-foreground">
        {question}
        {required && <span className="text-destructive ml-1" aria-label="必須">*</span>}
      </legend>

      {/* Scale Labels - Only show on desktop */}
      <div className="hidden md:flex justify-between mb-2 px-2">
        <span className="text-xs text-muted-foreground font-medium">強く反対</span>
        <span className="text-xs text-muted-foreground font-medium">どちらでもない</span>
        <span className="text-xs text-muted-foreground font-medium">強く同意</span>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between gap-3 md:gap-2">
        {LIKERT_OPTIONS.map(({ value: optionValue, label }) => (
          <label
            key={optionValue}
            className={cn(
              "group flex flex-col items-center cursor-pointer p-3 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              "border border-transparent",
              value === optionValue && "bg-primary/10 border-primary/20 text-primary",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive/20",
              // Mobile: full width, desktop: equal flex
              "md:flex-1 md:max-w-none"
            )}
          >
            <input
              type="radio"
              name={questionId}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => handleChange(optionValue)}
              required={required}
              disabled={disabled}
              className={cn(
                "sr-only", // Hide visually but keep for accessibility
              )}
              aria-describedby={error ? errorId : undefined}
            />
            
            {/* Visual Radio Indicator */}
            <div className={cn(
              "w-4 h-4 rounded-full border-2 mb-2 flex items-center justify-center transition-all",
              "border-muted-foreground/30",
              "group-hover:border-primary/50",
              value === optionValue && "border-primary bg-primary",
              disabled && "border-muted-foreground/20"
            )}>
              {value === optionValue && (
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              )}
            </div>

            {/* Mobile: Show full label, Desktop: Show number for middle values */}
            <span className="text-sm text-center leading-tight font-medium md:hidden">
              {label}
            </span>
            <span className="hidden md:block text-sm text-center leading-tight font-medium">
              {optionValue === 1 || optionValue === 7 ? label : optionValue}
            </span>
            
            {/* Screen reader text for middle values on desktop */}
            {optionValue !== 1 && optionValue !== 7 && (
              <span className="sr-only md:not-sr-only md:hidden">{label}</span>
            )}
          </label>
        ))}
      </div>

      {error && (
        <div 
          id={errorId} 
          role="alert" 
          className="text-destructive text-sm mt-3 flex items-center gap-2"
        >
          <svg 
            className="w-4 h-4 flex-shrink-0" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}
    </fieldset>
  )
}