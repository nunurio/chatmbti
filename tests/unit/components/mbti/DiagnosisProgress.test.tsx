import { render, screen } from '@testing-library/react'
import { DiagnosisProgress } from '@/components/mbti/DiagnosisProgress'

describe('DiagnosisProgress', () => {
  const defaultProps = {
    currentStep: 5,
    totalSteps: 12,
  }

  describe('Rendering', () => {
    it('should render progress bar with correct step information', () => {
      render(<DiagnosisProgress {...defaultProps} />)
      
      expect(screen.getByText('Step 5 of 12')).toBeInTheDocument()
    })

    it('should render progress percentage', () => {
      render(<DiagnosisProgress {...defaultProps} />)
      
      // For step 5 of 12, should show calculated percentage
      expect(screen.getByText(/complete/)).toBeInTheDocument()
    })

    it('should render progress bar element', () => {
      render(<DiagnosisProgress {...defaultProps} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
    })

    it('should set correct aria attributes on progress bar', () => {
      render(<DiagnosisProgress {...defaultProps} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '5')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '12')
    })
  })

  describe('Progress Calculation', () => {
    it('should calculate correct percentage for early steps (1-3)', () => {
      const { rerender } = render(<DiagnosisProgress currentStep={1} totalSteps={12} />)
      
      // Step 1 should show 15%
      expect(screen.getByText('15% complete')).toBeInTheDocument()
      
      rerender(<DiagnosisProgress currentStep={2} totalSteps={12} />)
      // Step 2 should show enhanced percentage
      expect(screen.getByText(/complete/)).toBeInTheDocument()
      
      rerender(<DiagnosisProgress currentStep={3} totalSteps={12} />)
      // Step 3 should show enhanced percentage
      expect(screen.getByText(/complete/)).toBeInTheDocument()
    })

    it('should calculate correct percentage for middle and later steps', () => {
      render(<DiagnosisProgress currentStep={6} totalSteps={12} />)
      
      // Should show standard percentage calculation
      const expectedPercentage = Math.round((6 / 12) * 100)
      expect(screen.getByText(`${expectedPercentage}% complete`)).toBeInTheDocument()
    })

    it('should never exceed 90% until completion', () => {
      render(<DiagnosisProgress currentStep={11} totalSteps={12} />)
      
      // Should not show more than 90%
      const percentageText = screen.getByText(/% complete/)
      const percentage = parseInt(percentageText.textContent!.match(/\d+/)![0])
      expect(percentage).toBeLessThanOrEqual(90)
    })

    it('should handle edge case of step 0', () => {
      render(<DiagnosisProgress currentStep={0} totalSteps={12} />)
      
      expect(screen.getByText('0% complete')).toBeInTheDocument()
    })
  })

  describe('Time Estimation', () => {
    it('should show time estimate when showTimeEstimate=true', () => {
      render(<DiagnosisProgress {...defaultProps} showTimeEstimate />)
      
      expect(screen.getByText(/minutes remaining/)).toBeInTheDocument()
    })

    it('should not show time estimate by default', () => {
      render(<DiagnosisProgress {...defaultProps} />)
      
      expect(screen.queryByText(/minutes remaining/)).not.toBeInTheDocument()
    })

    it('should calculate reasonable time estimate', () => {
      render(<DiagnosisProgress currentStep={5} totalSteps={12} showTimeEstimate />)
      
      // Should estimate based on remaining steps (7 remaining * 0.5 minutes = ~4 minutes)
      const timeText = screen.getByText(/minutes remaining/)
      const minutes = parseInt(timeText.textContent!.match(/\d+/)![0])
      expect(minutes).toBeGreaterThanOrEqual(1)
      expect(minutes).toBeLessThanOrEqual(10) // Reasonable upper bound
    })

    it('should show minimum 1 minute for last steps', () => {
      render(<DiagnosisProgress currentStep={11} totalSteps={12} showTimeEstimate />)
      
      const timeText = screen.getByText(/minute.*remaining/)
      const minutes = parseInt(timeText.textContent!.match(/\d+/)![0])
      expect(minutes).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Visual Design', () => {
    it('should render with proper CSS classes', () => {
      render(<DiagnosisProgress {...defaultProps} />)
      
      const progressBarContainer = screen.getByRole('progressbar').parentElement
      expect(progressBarContainer).toHaveClass('w-full', 'bg-secondary', 'rounded-full')
    })

    it('should apply custom className when provided', () => {
      render(<DiagnosisProgress {...defaultProps} className="custom-progress" />)
      
      const outerContainer = screen.getByText('Step 5 of 12').closest('div.mb-8')
      expect(outerContainer).toHaveClass('custom-progress')
    })

    it('should have smooth progress bar animation', () => {
      render(<DiagnosisProgress {...defaultProps} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('transition-all', 'duration-500', 'ease-out')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible progress label', () => {
      render(<DiagnosisProgress {...defaultProps} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-label', expect.stringContaining('診断の進捗'))
    })

    it('should be keyboard accessible', () => {
      render(<DiagnosisProgress {...defaultProps} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('tabIndex', '0')
    })

    it('should provide screen reader friendly text', () => {
      render(<DiagnosisProgress {...defaultProps} showTimeEstimate />)
      
      // Should have comprehensive description for screen readers
      const progressBar = screen.getByRole('progressbar')
      const ariaLabel = progressBar.getAttribute('aria-label')
      expect(ariaLabel).toContain('5')
      expect(ariaLabel).toContain('12')
    })
  })

  describe('Different Step Scenarios', () => {
    it('should handle first step correctly', () => {
      render(<DiagnosisProgress currentStep={1} totalSteps={12} />)
      
      expect(screen.getByText('Step 1 of 12')).toBeInTheDocument()
      expect(screen.getByText('15% complete')).toBeInTheDocument()
    })

    it('should handle last step correctly', () => {
      render(<DiagnosisProgress currentStep={12} totalSteps={12} />)
      
      expect(screen.getByText('Step 12 of 12')).toBeInTheDocument()
      expect(screen.getByText('90% complete')).toBeInTheDocument()
    })

    it('should handle different total step counts', () => {
      render(<DiagnosisProgress currentStep={3} totalSteps={24} />)
      
      expect(screen.getByText('Step 3 of 24')).toBeInTheDocument()
      const percentageText = screen.getByText(/% complete/)
      expect(percentageText).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render efficiently with many re-renders', () => {
      const { rerender } = render(<DiagnosisProgress currentStep={1} totalSteps={12} />)
      
      // Simulate rapid step changes
      for (let i = 2; i <= 12; i++) {
        rerender(<DiagnosisProgress currentStep={i} totalSteps={12} />)
        expect(screen.getByText(`Step ${i} of 12`)).toBeInTheDocument()
      }
    })
  })
})