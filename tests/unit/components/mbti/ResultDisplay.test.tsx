import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultDisplay } from '@/components/mbti/ResultDisplay'

describe('ResultDisplay', () => {
  const mockMBTIResult = {
    type: 'INTJ',
    confidence: 85,
    scores: {
      EI: 45,   // I stronger
      SN: -30,  // S stronger  
      TF: 70,   // F stronger
      JP: -15   // J stronger
    }
  }

  const mockRecommendations = [
    {
      persona: {
        id: '1',
        name: 'Strategic Advisor',
        mbtiType: 'INTJ',
        description: 'A logical and systematic thinker'
      },
      compatibility: 100
    },
    {
      persona: {
        id: '2',
        name: 'Creative Catalyst',
        mbtiType: 'ENFP',
        description: 'An inspiring and energetic companion'
      },
      compatibility: 85
    }
  ]

  const mockPersonas = [
    {
      id: '1',
      name: 'Strategic Advisor',
      mbtiType: 'INTJ',
      description: 'A logical and systematic thinker'
    },
    {
      id: '2', 
      name: 'Creative Catalyst',
      mbtiType: 'ENFP',
      description: 'An inspiring and energetic companion'
    }
  ]

  it('displays the MBTI type and description', () => {
    render(
      <ResultDisplay 
        result={mockMBTIResult}
        recommendations={mockRecommendations}
        personas={mockPersonas}
      />
    )

    expect(screen.getByRole('heading', { name: /INTJ/i })).toBeInTheDocument()
    expect(screen.getByText(/Architect/i)).toBeInTheDocument()
    expect(screen.getByText(/85% confidence/i)).toBeInTheDocument()
  })

  it('displays the score chart', () => {
    render(
      <ResultDisplay 
        result={mockMBTIResult}
        recommendations={mockRecommendations}
        personas={mockPersonas}
      />
    )

    expect(screen.getByText('Personality Dimensions')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()  // EI score
    expect(screen.getByText('30%')).toBeInTheDocument()  // SN score (absolute)
    expect(screen.getByText('70%')).toBeInTheDocument()  // TF score
    expect(screen.getByText('15%')).toBeInTheDocument()  // JP score (absolute)
  })

  it('displays recommended personas', () => {
    render(
      <ResultDisplay 
        result={mockMBTIResult}
        recommendations={mockRecommendations}
        personas={mockPersonas}
      />
    )

    expect(screen.getByText('Recommended Chat Personas')).toBeInTheDocument()
    expect(screen.getByText('Strategic Advisor')).toBeInTheDocument()
    expect(screen.getByText('Creative Catalyst')).toBeInTheDocument()
    expect(screen.getByText('100% match')).toBeInTheDocument()
    expect(screen.getByText('85% match')).toBeInTheDocument()
  })

  it('shows action buttons', () => {
    render(
      <ResultDisplay 
        result={mockMBTIResult}
        recommendations={mockRecommendations}
        personas={mockPersonas}
      />
    )

    expect(screen.getByRole('button', { name: /Save Result/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retake Test/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start Chat/i })).toBeInTheDocument()
  })

  it('calls onSave when save button is clicked', async () => {
    const mockOnSave = vi.fn()
    const user = userEvent.setup()
    
    render(
      <ResultDisplay 
        result={mockMBTIResult}
        recommendations={mockRecommendations}
        personas={mockPersonas}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: /Save Result/i })
    await user.click(saveButton)

    expect(mockOnSave).toHaveBeenCalledWith(mockMBTIResult)
  })

  it('calls onRetakeTest when retake button is clicked', async () => {
    const mockOnRetakeTest = vi.fn()
    const user = userEvent.setup()
    
    render(
      <ResultDisplay 
        result={mockMBTIResult}
        recommendations={mockRecommendations}
        personas={mockPersonas}
        onRetakeTest={mockOnRetakeTest}
      />
    )

    const retakeButton = screen.getByRole('button', { name: /Retake Test/i })
    await user.click(retakeButton)

    expect(mockOnRetakeTest).toHaveBeenCalled()
  })

  it('calls onStartChat when start chat button is clicked', async () => {
    const mockOnStartChat = vi.fn()
    const user = userEvent.setup()
    
    render(
      <ResultDisplay 
        result={mockMBTIResult}
        recommendations={mockRecommendations}
        personas={mockPersonas}
        onStartChat={mockOnStartChat}
      />
    )

    const startChatButton = screen.getByRole('button', { name: /Start Chat/i })
    await user.click(startChatButton)

    expect(mockOnStartChat).toHaveBeenCalled()
  })

  it('calls onPersonaSelect when a persona is selected', async () => {
    const mockOnPersonaSelect = vi.fn()
    const user = userEvent.setup()
    
    render(
      <ResultDisplay 
        result={mockMBTIResult}
        recommendations={mockRecommendations}
        personas={mockPersonas}
        onPersonaSelect={mockOnPersonaSelect}
      />
    )

    // Get the first Select button from the RecommendationCard
    const selectButtons = screen.getAllByRole('button', { name: /Select/i })
    await user.click(selectButtons[0])

    expect(mockOnPersonaSelect).toHaveBeenCalledWith(mockRecommendations[0].persona)
  })

  it('renders with proper layout structure', () => {
    render(
      <ResultDisplay 
        result={mockMBTIResult}
        recommendations={mockRecommendations}
        personas={mockPersonas}
      />
    )

    // Should have main sections rendered
    expect(screen.getAllByText('INTJ')).toHaveLength(2) // Type description + recommendation badges
    expect(screen.getByText('Personality Dimensions')).toBeInTheDocument() // Score chart
    expect(screen.getByText('Recommended Chat Personas')).toBeInTheDocument() // Recommendations
  })
})