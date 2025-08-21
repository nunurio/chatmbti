import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionCard } from '@/components/mbti/QuestionCard'
import { MBTIQuestion } from '@/lib/mbti/types'

describe('QuestionCard', () => {
  const mockQuestion: MBTIQuestion = {
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
  }

  const defaultProps = {
    question: mockQuestion,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render question card with proper structure', () => {
      render(<QuestionCard {...defaultProps} />)
      
      // Should have card-like appearance
      const card = screen.getByRole('article')
      expect(card).toHaveClass('border', 'rounded-lg')
    })

    it('should render question text from MBTIQuestion', () => {
      render(<QuestionCard {...defaultProps} />)
      
      expect(screen.getByText('人とのやりとりでエネルギーを得る')).toBeInTheDocument()
    })

    it('should render question number based on order', () => {
      render(<QuestionCard {...defaultProps} />)
      
      expect(screen.getByText('質問 1')).toBeInTheDocument()
    })

    it('should render axis indicator', () => {
      render(<QuestionCard {...defaultProps} />)
      
      expect(screen.getByText('EI')).toBeInTheDocument()
    })

    it('should render LikertScale component', () => {
      render(<QuestionCard {...defaultProps} />)
      
      // Should have radio buttons (from LikertScale)
      const radioButtons = screen.getAllByRole('radio')
      expect(radioButtons).toHaveLength(7)
    })
  })

  describe('Interaction', () => {
    it('should call onChange with question id and value when LikertScale changes', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(<QuestionCard {...defaultProps} onChange={onChange} />)
      
      const radioButton = screen.getByDisplayValue('5')
      await user.click(radioButton)
      
      expect(onChange).toHaveBeenCalledWith('ei_1', 5)
    })

    it('should display selected value when value prop is provided', () => {
      render(<QuestionCard {...defaultProps} value={3} />)
      
      const selectedRadio = screen.getByDisplayValue('3')
      expect(selectedRadio).toBeChecked()
    })
  })

  describe('Error Handling', () => {
    it('should display error state when error prop is provided', () => {
      const errorMessage = 'Please answer this question'
      render(<QuestionCard {...defaultProps} error={errorMessage} />)
      
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage)
    })

    it('should apply error styling to card', () => {
      const errorMessage = 'Please answer this question'
      render(<QuestionCard {...defaultProps} error={errorMessage} />)
      
      const card = screen.getByRole('article')
      expect(card).toHaveClass('border-destructive')
    })
  })

  describe('Required State', () => {
    it('should show required indicator when required=true', () => {
      render(<QuestionCard {...defaultProps} required />)
      
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('should pass required prop to LikertScale', () => {
      render(<QuestionCard {...defaultProps} required />)
      
      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('required')
      })
    })
  })

  describe('Different Question Types', () => {
    it('should handle different MBTI axes', () => {
      const snQuestion: MBTIQuestion = {
        ...mockQuestion,
        id: 'sn_1',
        axis: 'SN',
        text: '具体的な事実を重視する',
        order: 7,
      }
      
      render(<QuestionCard {...defaultProps} question={snQuestion} />)
      
      expect(screen.getByText('質問 7')).toBeInTheDocument()
      expect(screen.getByText('SN')).toBeInTheDocument()
      expect(screen.getByText('具体的な事実を重視する')).toBeInTheDocument()
    })

    it('should display axis color coding', () => {
      const questions = [
        { ...mockQuestion, axis: 'EI' as const },
        { ...mockQuestion, axis: 'SN' as const },
        { ...mockQuestion, axis: 'TF' as const },
        { ...mockQuestion, axis: 'JP' as const },
      ]
      
      questions.forEach((question) => {
        const { unmount } = render(<QuestionCard {...defaultProps} question={question} />)
        
        const axisIndicator = screen.getByText(question.axis)
        expect(axisIndicator).toBeInTheDocument()
        // Should have axis-specific styling classes
        expect(axisIndicator).toHaveClass('px-2', 'py-1')
        
        unmount()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<QuestionCard {...defaultProps} />)
      
      // Should use article for semantic meaning
      const article = screen.getByRole('article')
      expect(article).toBeInTheDocument()
    })

    it('should have accessible question numbering', () => {
      render(<QuestionCard {...defaultProps} />)
      
      const questionNumber = screen.getByText('質問 1')
      expect(questionNumber).toHaveAttribute('aria-label', '質問番号1')
    })

    it('should associate axis information with screen readers', () => {
      render(<QuestionCard {...defaultProps} />)
      
      const axisIndicator = screen.getByText('EI')
      expect(axisIndicator).toHaveAttribute('aria-label', '外向性・内向性の軸')
    })
  })

  describe('Visual Design', () => {
    it('should have proper spacing and layout', () => {
      render(<QuestionCard {...defaultProps} />)
      
      const card = screen.getByRole('article')
      expect(card).toHaveClass('p-6', 'space-y-4')
    })

    it('should support custom className', () => {
      render(<QuestionCard {...defaultProps} className="custom-class" />)
      
      const card = screen.getByRole('article')
      expect(card).toHaveClass('custom-class')
    })
  })
})