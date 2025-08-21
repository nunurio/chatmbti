import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiagnosisForm } from '@/components/mbti/DiagnosisForm'
import { MBTIQuestion } from '@/lib/mbti/types'

// Mock questions data
const mockQuestions: MBTIQuestion[] = [
  {
    id: 'ei_1',
    axis: 'EI',
    text: '人とのやりとりでエネルギーを得る',
    direction: -1,
    order: 1,
    code: 'ei_1',
    locale: 'ja',
    is_active: true,
    created_at: '2025-08-21T00:00:00Z',
    updated_at: '2025-08-21T00:00:00Z',
  },
  {
    id: 'ei_2',
    axis: 'EI', 
    text: '一人の時間を大切にする',
    direction: 1,
    order: 2,
    code: 'ei_2',
    locale: 'ja',
    is_active: true,
    created_at: '2025-08-21T00:00:00Z',
    updated_at: '2025-08-21T00:00:00Z',
  },
]

describe('DiagnosisForm', () => {
  const defaultProps = {
    testId: 'test-id-123',
    currentStep: 1,
    questions: mockQuestions,
    existingAnswers: {},
    onStepComplete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render diagnosis form with progress indicator', () => {
      render(<DiagnosisForm {...defaultProps} />)
      
      // Should show progress (default is 12 total steps)
      expect(screen.getByText('Step 1 of 12')).toBeInTheDocument()
    })

    it('should render all questions for current step', () => {
      render(<DiagnosisForm {...defaultProps} />)
      
      // Should render question cards
      expect(screen.getByText('人とのやりとりでエネルギーを得る')).toBeInTheDocument()
      expect(screen.getByText('一人の時間を大切にする')).toBeInTheDocument()
    })

    it('should render navigation buttons', () => {
      render(<DiagnosisForm {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('should disable back button on first step', () => {
      render(<DiagnosisForm {...defaultProps} currentStep={1} />)
      
      const backButton = screen.getByRole('button', { name: /back/i })
      expect(backButton).toBeDisabled()
    })

    it('should show "Complete" button on final step', () => {
      render(
        <DiagnosisForm 
          {...defaultProps} 
          currentStep={12}
          questions={mockQuestions.slice(0, 1)} // Only show one question for final step
        />
      )
      
      expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument()
    })
  })

  describe('Question Interaction', () => {
    it('should handle answer selection', async () => {
      const user = userEvent.setup()
      render(<DiagnosisForm {...defaultProps} />)
      
      // Select answer for first question
      const radioButtons = screen.getAllByDisplayValue('5')
      await user.click(radioButtons[0])
      
      // Answer should be reflected in UI
      expect(radioButtons[0]).toBeChecked()
    })

    it('should show existing answers when provided', () => {
      const existingAnswers = { ei_1: 3, ei_2: 6 }
      render(<DiagnosisForm {...defaultProps} existingAnswers={existingAnswers} />)
      
      // Check the specific radio buttons for each question
      const allRadios = screen.getAllByRole('radio')
      const ei1Radio3 = allRadios.find(radio => radio.getAttribute('name') === 'ei_1' && radio.getAttribute('value') === '3')
      const ei2Radio6 = allRadios.find(radio => radio.getAttribute('name') === 'ei_2' && radio.getAttribute('value') === '6')
      
      expect(ei1Radio3).toBeChecked()
      expect(ei2Radio6).toBeChecked()
    })

    it('should update answers in real-time', async () => {
      const user = userEvent.setup()
      render(<DiagnosisForm {...defaultProps} />)
      
      // Find radios by name and value
      const allRadios = screen.getAllByRole('radio')
      const ei1Radio4 = allRadios.find(radio => 
        radio.getAttribute('name') === 'ei_1' && radio.getAttribute('value') === '4'
      )
      const ei2Radio7 = allRadios.find(radio => 
        radio.getAttribute('name') === 'ei_2' && radio.getAttribute('value') === '7'
      )
      
      // Answer first question
      await user.click(ei1Radio4!)
      
      // Answer second question  
      await user.click(ei2Radio7!)
      
      // Both answers should be selected
      expect(ei1Radio4).toBeChecked()
      expect(ei2Radio7).toBeChecked()
    })
  })

  describe('Form Submission', () => {
    it('should require all questions to be answered before allowing submission', async () => {
      const user = userEvent.setup()
      const onStepComplete = vi.fn()
      
      render(<DiagnosisForm {...defaultProps} onStepComplete={onStepComplete} />)
      
      // Try to submit without answering all questions
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      // Should show validation errors
      expect(screen.getByText(/please answer all questions/i)).toBeInTheDocument()
      expect(onStepComplete).not.toHaveBeenCalled()
    })

    it('should call onStepComplete with answers when all questions are answered', async () => {
      const user = userEvent.setup()
      const onStepComplete = vi.fn()
      
      render(<DiagnosisForm {...defaultProps} onStepComplete={onStepComplete} />)
      
      // Answer all questions
      await user.click(screen.getAllByDisplayValue('3')[0])
      await user.click(screen.getAllByDisplayValue('5')[1])
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(() => {
        expect(onStepComplete).toHaveBeenCalledWith({
          ei_1: 3,
          ei_2: 5,
        })
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      const onStepComplete = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<DiagnosisForm {...defaultProps} onStepComplete={onStepComplete} />)
      
      // Answer all questions
      await user.click(screen.getAllByDisplayValue('4')[0])
      await user.click(screen.getAllByDisplayValue('6')[1])
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      // Should show loading state
      expect(screen.getByText(/saving/i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.queryByText(/saving/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Validation', () => {
    it('should show error messages for unanswered questions', async () => {
      const user = userEvent.setup()
      render(<DiagnosisForm {...defaultProps} />)
      
      // Submit without answers
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      // Should show field-level errors
      const errorMessages = screen.getAllByRole('alert')
      expect(errorMessages.length).toBeGreaterThan(0)
    })

    it('should clear validation errors when questions are answered', async () => {
      const user = userEvent.setup()
      render(<DiagnosisForm {...defaultProps} />)
      
      // Submit without answers to trigger validation
      await user.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText(/please answer all questions/i)).toBeInTheDocument()
      
      // Answer the questions
      await user.click(screen.getAllByDisplayValue('2')[0])
      await user.click(screen.getAllByDisplayValue('7')[1])
      
      // Error should be cleared
      expect(screen.queryByText(/please answer all questions/i)).not.toBeInTheDocument()
    })

    it('should validate individual questions in real-time', async () => {
      const user = userEvent.setup()
      render(<DiagnosisForm {...defaultProps} />)
      
      // Initially should not show validation errors
      expect(screen.queryByText(/please answer all questions/i)).not.toBeInTheDocument()
      
      // Focus and blur first question without selecting - errors only show on submit
      const firstRadio = screen.getAllByRole('radio')[0]
      await user.click(firstRadio)
      await user.tab()
      
      // Still should not show validation error until form submission attempt
      expect(screen.queryByText(/please answer all questions/i)).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup()
      const onBack = vi.fn()
      
      render(<DiagnosisForm {...defaultProps} currentStep={2} onBack={onBack} />)
      
      await user.click(screen.getByRole('button', { name: /back/i }))
      
      expect(onBack).toHaveBeenCalled()
    })

    it('should handle keyboard navigation between questions', async () => {
      const user = userEvent.setup()
      render(<DiagnosisForm {...defaultProps} />)
      
      // Tab through questions
      await user.tab() // First question, first option
      await user.keyboard('{ArrowRight}') // Second option in first question
      
      // Should navigate within radio group
      const radioButtons = screen.getAllByRole('radio')
      expect(radioButtons[1]).toHaveFocus()
    })
  })

  describe('Progress Tracking', () => {
    it('should show correct progress information', () => {
      render(<DiagnosisForm {...defaultProps} currentStep={3} />)
      
      expect(screen.getByText('Step 3 of 12')).toBeInTheDocument()
    })

    it('should show time estimate when enabled', () => {
      render(<DiagnosisForm {...defaultProps} showTimeEstimate />)
      
      expect(screen.getByText(/minute.*remaining/)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup()
      const onStepComplete = vi.fn().mockRejectedValue(new Error('Network error'))
      
      render(<DiagnosisForm {...defaultProps} onStepComplete={onStepComplete} />)
      
      // Answer questions and submit
      await user.click(screen.getAllByDisplayValue('4')[0])
      await user.click(screen.getAllByDisplayValue('5')[1])
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
      })
    })

    it('should allow retry after submission error', async () => {
      const user = userEvent.setup()
      const onStepComplete = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined)
      
      render(<DiagnosisForm {...defaultProps} onStepComplete={onStepComplete} />)
      
      // Answer questions and submit (first attempt fails)
      await user.click(screen.getAllByDisplayValue('3')[0])
      await user.click(screen.getAllByDisplayValue('6')[1])
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
      })
      
      // Retry submission
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(() => {
        expect(onStepComplete).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<DiagnosisForm {...defaultProps} />)
      
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })

    it('should have accessible error summary', async () => {
      const user = userEvent.setup()
      render(<DiagnosisForm {...defaultProps} />)
      
      // Trigger validation
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      const errorSummary = screen.getByRole('alert')
      expect(errorSummary).toHaveAttribute('aria-live', 'polite')
    })

    it('should announce progress changes to screen readers', () => {
      render(<DiagnosisForm {...defaultProps} currentStep={5} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-live', 'polite')
    })
  })
})