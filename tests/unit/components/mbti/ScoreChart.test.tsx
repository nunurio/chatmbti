import { render, screen } from '@testing-library/react'
import { ScoreChart } from '@/components/mbti/ScoreChart'

describe('ScoreChart', () => {
  const mockScores = {
    EI: 45,   // E stronger
    SN: -30,  // S stronger  
    TF: 70,   // F stronger
    JP: -15   // J stronger
  }

  it('displays all four MBTI dimensions', () => {
    render(<ScoreChart scores={mockScores} />)
    
    expect(screen.getAllByText(/Extraversion/)).toHaveLength(1)
    expect(screen.getAllByText(/Introversion/)).toHaveLength(2) // one in dimension list, one in preference
    expect(screen.getAllByText(/Sensing/)).toHaveLength(2)     // one in dimension list, one in preference  
    expect(screen.getAllByText(/iNtuition/)).toHaveLength(1)
    expect(screen.getAllByText(/Thinking/)).toHaveLength(1)
    expect(screen.getAllByText(/Feeling/)).toHaveLength(2)     // one in dimension list, one in preference
    expect(screen.getAllByText(/Judging/)).toHaveLength(2)     // one in dimension list, one in preference
    expect(screen.getAllByText(/Perceiving/)).toHaveLength(1)
  })

  it('displays percentage values for each dimension', () => {
    render(<ScoreChart scores={mockScores} />)
    
    expect(screen.getByText('45%')).toBeInTheDocument()  // EI
    expect(screen.getByText('30%')).toBeInTheDocument()  // SN (absolute)
    expect(screen.getByText('70%')).toBeInTheDocument()  // TF
    expect(screen.getByText('15%')).toBeInTheDocument()  // JP (absolute)
  })

  it('indicates the stronger preference for each dimension', () => {
    render(<ScoreChart scores={mockScores} />)
    
    // EI: positive = I stronger (45%)
    const eiSection = screen.getByTestId('dimension-EI')
    expect(eiSection).toHaveClass('border-primary')
    
    // SN: negative = S stronger (30%)
    const snSection = screen.getByTestId('dimension-SN')
    expect(snSection).toHaveClass('border-primary')
    
    // TF: positive = F stronger (70%)
    const tfSection = screen.getByTestId('dimension-TF')
    expect(tfSection).toHaveClass('border-primary')
    
    // JP: negative = J stronger (15%)
    const jpSection = screen.getByTestId('dimension-JP')
    expect(jpSection).toHaveClass('border-primary')
  })

  it('renders as an accessible table structure', () => {
    render(<ScoreChart scores={mockScores} />)
    
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(5) // header + 4 dimensions
    expect(screen.getAllByRole('columnheader')).toHaveLength(3) // Dimension, Score, Preference
  })

  it('handles edge case scores correctly', () => {
    const edgeCaseScores = {
      EI: 0,    // Neutral
      SN: 100,  // Max positive
      TF: -100, // Max negative
      JP: 1     // Minimal positive
    }
    
    render(<ScoreChart scores={edgeCaseScores} />)
    
    expect(screen.getByText('0%')).toBeInTheDocument()   // EI neutral
    expect(screen.getAllByText('100%')).toHaveLength(2)  // SN and TF both max
    expect(screen.getByText('1%')).toBeInTheDocument()   // JP minimal
  })
})