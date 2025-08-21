import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LikertScale } from '@/components/mbti/LikertScale'

describe('LikertScale', () => {
  const defaultProps = {
    questionId: 'test-question-1',
    question: 'This is a test question',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the question text', () => {
      render(<LikertScale {...defaultProps} />)
      
      expect(screen.getByText('This is a test question')).toBeInTheDocument()
    })

    it('should render 7 radio buttons with correct values', () => {
      render(<LikertScale {...defaultProps} />)
      
      for (let i = 1; i <= 7; i++) {
        expect(screen.getByDisplayValue(i.toString())).toBeInTheDocument()
      }
    })

    it('should render with fieldset and legend for accessibility', () => {
      render(<LikertScale {...defaultProps} />)
      
      const fieldset = screen.getByRole('group')
      expect(fieldset).toBeInTheDocument()
      expect(fieldset.tagName).toBe('FIELDSET')
      
      const legend = screen.getByText('This is a test question')
      expect(legend.tagName).toBe('LEGEND')
    })

    it('should render required indicator when required=true', () => {
      render(<LikertScale {...defaultProps} required />)
      
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('should call onChange when a radio button is selected', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(<LikertScale {...defaultProps} onChange={onChange} />)
      
      const radioButton = screen.getByDisplayValue('3')
      await user.click(radioButton)
      
      expect(onChange).toHaveBeenCalledWith(3)
    })

    it('should support keyboard navigation with arrow keys', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(<LikertScale {...defaultProps} onChange={onChange} />)
      
      // Focus on first radio button
      await user.tab()
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}')
      expect(screen.getByDisplayValue('2')).toHaveFocus()
      
      await user.keyboard('{ArrowRight}')
      expect(screen.getByDisplayValue('3')).toHaveFocus()
      
      // Select with Space
      await user.keyboard(' ')
      expect(onChange).toHaveBeenCalledWith(3)
    })

    it('should show selected value when value prop is provided', () => {
      render(<LikertScale {...defaultProps} value={5} />)
      
      const selectedRadio = screen.getByDisplayValue('5')
      expect(selectedRadio).toBeChecked()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when error prop is provided', () => {
      const errorMessage = 'This field is required'
      render(<LikertScale {...defaultProps} error={errorMessage} />)
      
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage)
    })

    it('should set aria-invalid when error is present', () => {
      const errorMessage = 'This field is required'
      render(<LikertScale {...defaultProps} error={errorMessage} />)
      
      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('should associate error message with radio group using aria-describedby', () => {
      const errorMessage = 'This field is required'
      render(<LikertScale {...defaultProps} error={errorMessage} />)
      
      const errorElement = screen.getByRole('alert')
      const errorId = errorElement.id
      
      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('aria-describedby', errorId)
      })
    })
  })

  describe('Disabled State', () => {
    it('should disable all radio buttons when disabled=true', () => {
      render(<LikertScale {...defaultProps} disabled />)
      
      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach(radio => {
        expect(radio).toBeDisabled()
      })
    })

    it('should not call onChange when disabled radio is clicked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(<LikertScale {...defaultProps} onChange={onChange} disabled />)
      
      const radioButton = screen.getByDisplayValue('3')
      await user.click(radioButton)
      
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Responsive Design', () => {
    it('should apply correct CSS classes for responsive layout', () => {
      render(<LikertScale {...defaultProps} />)
      
      // Find the main options container (second div)
      const fieldset = screen.getByRole('group')
      const containers = fieldset.querySelectorAll('div')
      const optionsContainer = containers[1] // Skip the labels container
      expect(optionsContainer).toHaveClass('flex', 'flex-col', 'md:flex-row')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<LikertScale {...defaultProps} />)
      
      // Check that labels contain both visual text and screen reader text
      const labels = screen.getAllByText(/強く/i) // Partial match for Japanese labels
      expect(labels.length).toBeGreaterThan(0)
    })

    it('should meet minimum touch target size (44x44px)', () => {
      render(<LikertScale {...defaultProps} />)
      
      const labels = screen.getAllByRole('radio').map(radio => radio.closest('label'))
      labels.forEach(label => {
        const styles = window.getComputedStyle(label!)
        // Note: In test environment, we check for the CSS classes that ensure 44px minimum
        expect(label).toHaveClass('min-h-[44px]', 'min-w-[44px]')
      })
    })
  })
})