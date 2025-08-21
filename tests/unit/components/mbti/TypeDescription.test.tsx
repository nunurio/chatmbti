import { render, screen } from '@testing-library/react'
import { TypeDescription } from '@/components/mbti/TypeDescription'

describe('TypeDescription', () => {
  it('displays INTJ type information correctly', () => {
    render(
      <TypeDescription 
        type="INTJ" 
        confidence={85}
      />
    )
    
    expect(screen.getByRole('heading', { name: /INTJ/i })).toBeInTheDocument()
    expect(screen.getByText(/Architect/i)).toBeInTheDocument()
    expect(screen.getByText(/85% confidence/i)).toBeInTheDocument()
  })

  it('displays type description text', () => {
    render(
      <TypeDescription 
        type="ENFP" 
        confidence={92}
      />
    )
    
    expect(screen.getByRole('heading', { name: /ENFP/i })).toBeInTheDocument()
    expect(screen.getByText(/Campaigner/i)).toBeInTheDocument()
    expect(screen.getByText(/enthusiastic/i)).toBeInTheDocument()
  })

  it('handles low confidence scores with appropriate styling', () => {
    render(
      <TypeDescription 
        type="ISFJ" 
        confidence={45}
      />
    )
    
    const confidenceElement = screen.getByText(/45% confidence/i)
    expect(confidenceElement).toHaveClass('text-yellow-600')
  })

  it('handles high confidence scores with appropriate styling', () => {
    render(
      <TypeDescription 
        type="ESTP" 
        confidence={90}
      />
    )
    
    const confidenceElement = screen.getByText(/90% confidence/i)
    expect(confidenceElement).toHaveClass('text-green-600')
  })

  it('displays the four letter breakdown', () => {
    render(
      <TypeDescription 
        type="INFP" 
        confidence={75}
      />
    )
    
    expect(screen.getByText(/Introverted/i)).toBeInTheDocument()
    expect(screen.getByText(/iNtuitive/i)).toBeInTheDocument()
    expect(screen.getByText(/Feeling/i)).toBeInTheDocument()
    expect(screen.getByText(/Perceiving/i)).toBeInTheDocument()
  })
})