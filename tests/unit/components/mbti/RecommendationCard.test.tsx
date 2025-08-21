import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecommendationCard } from '@/components/mbti/RecommendationCard'

describe('RecommendationCard', () => {
  const mockRecommendations = [
    {
      persona: {
        id: '1',
        name: 'Analytical Assistant',
        mbtiType: 'INTJ',
        description: 'A logical and strategic thinker'
      },
      compatibility: 95
    },
    {
      persona: {
        id: '2', 
        name: 'Creative Companion',
        mbtiType: 'ENFP',
        description: 'An enthusiastic and inspiring partner'
      },
      compatibility: 85
    },
    {
      persona: {
        id: '3',
        name: 'Practical Helper',
        mbtiType: 'ISFJ',
        description: 'A supportive and reliable aide'
      },
      compatibility: 75
    }
  ]

  it('displays all recommended personas', () => {
    render(<RecommendationCard recommendations={mockRecommendations} userType="INTJ" />)
    
    expect(screen.getByText('Analytical Assistant')).toBeInTheDocument()
    expect(screen.getByText('Creative Companion')).toBeInTheDocument()
    expect(screen.getByText('Practical Helper')).toBeInTheDocument()
  })

  it('shows compatibility scores', () => {
    render(<RecommendationCard recommendations={mockRecommendations} userType="INTJ" />)
    
    expect(screen.getByText('95% match')).toBeInTheDocument()
    expect(screen.getByText('85% match')).toBeInTheDocument()
    expect(screen.getByText('75% match')).toBeInTheDocument()
  })

  it('displays MBTI types for each persona', () => {
    render(<RecommendationCard recommendations={mockRecommendations} userType="INTJ" />)
    
    expect(screen.getByText('INTJ')).toBeInTheDocument()
    expect(screen.getByText('ENFP')).toBeInTheDocument()
    expect(screen.getByText('ISFJ')).toBeInTheDocument()
  })

  it('shows persona descriptions', () => {
    render(<RecommendationCard recommendations={mockRecommendations} userType="INTJ" />)
    
    expect(screen.getByText('A logical and strategic thinker')).toBeInTheDocument()
    expect(screen.getByText('An enthusiastic and inspiring partner')).toBeInTheDocument()
    expect(screen.getByText('A supportive and reliable aide')).toBeInTheDocument()
  })

  it('renders select buttons for each persona', () => {
    render(<RecommendationCard recommendations={mockRecommendations} userType="INTJ" />)
    
    const selectButtons = screen.getAllByRole('button', { name: /Select/i })
    expect(selectButtons).toHaveLength(3)
  })

  it('calls onSelect when persona is selected', async () => {
    const mockOnSelect = vi.fn()
    const user = userEvent.setup()
    
    render(
      <RecommendationCard 
        recommendations={mockRecommendations} 
        userType="INTJ"
        onSelect={mockOnSelect}
      />
    )
    
    const firstSelectButton = screen.getAllByRole('button', { name: /Select/i })[0]
    await user.click(firstSelectButton)
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockRecommendations[0].persona)
  })

  it('handles empty recommendations gracefully', () => {
    render(<RecommendationCard recommendations={[]} userType="INTJ" />)
    
    expect(screen.getByText(/No compatible personas found/i)).toBeInTheDocument()
  })

  it('displays compatibility ranking', () => {
    render(<RecommendationCard recommendations={mockRecommendations} userType="INTJ" />)
    
    // Should show recommendations in descending order by compatibility
    const compatibilityScores = screen.getAllByText(/\d+% match/)
    expect(compatibilityScores[0]).toHaveTextContent('95% match')
    expect(compatibilityScores[1]).toHaveTextContent('85% match')
    expect(compatibilityScores[2]).toHaveTextContent('75% match')
  })
})