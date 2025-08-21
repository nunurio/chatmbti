/**
 * MBTI Diagnosis Configuration
 * Centralized configuration for MBTI diagnosis flow
 */

export const MBTI_CONFIG = {
  /**
   * Total number of steps in the diagnosis flow
   */
  TOTAL_STEPS: 12,
  
  /**
   * Number of questions to display per step
   */
  QUESTIONS_PER_STEP: 5,
  
  /**
   * Estimated time per question in minutes
   */
  ESTIMATED_TIME_PER_QUESTION: 0.5,
  
  /**
   * Maximum percentage to show in progress indicator before completion
   */
  MAX_PROGRESS_PERCENTAGE: 90,
  
  /**
   * Progress boost for early questions to encourage completion
   */
  EARLY_PROGRESS_MULTIPLIER: 1.5,
  
  /**
   * Number of questions that get the early progress boost
   */
  EARLY_QUESTIONS_COUNT: 3,
} as const