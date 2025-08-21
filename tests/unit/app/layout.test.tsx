import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock CSS imports
vi.mock('@/app/globals.css', () => ({}));

vi.mock('@/components/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  )
}));

vi.mock('sonner', () => ({
  Toaster: ({ richColors, expand, position }: any) => (
    <div 
      data-testid="toaster" 
      data-rich-colors={richColors}
      data-expand={expand}
      data-position={position}
    />
  )
}));

vi.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans'
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono'
  })
}));

describe('RootLayout', () => {
  it('should render children directly (minimal layout)', async () => {
    const RootLayout = await import('@/app/layout').then(m => m.default);
    
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('should pass through children without modification', async () => {
    const RootLayout = await import('@/app/layout').then(m => m.default);
    
    const TestComponent = () => <div data-testid="custom-component">Custom</div>;
    
    render(
      <RootLayout>
        <TestComponent />
      </RootLayout>
    );

    expect(screen.getByTestId('custom-component')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});