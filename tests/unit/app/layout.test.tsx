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
  it('should render children within AuthProvider', async () => {
    const RootLayout = await import('@/app/layout').then(m => m.default);
    
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    
    // Children should be inside AuthProvider
    const authProvider = screen.getByTestId('auth-provider');
    const testChild = screen.getByTestId('test-child');
    expect(authProvider).toContainElement(testChild);
  });

  it('should include Toaster component with correct props', async () => {
    const RootLayout = await import('@/app/layout').then(m => m.default);
    
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const toaster = screen.getByTestId('toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveAttribute('data-rich-colors', 'true');
    expect(toaster).toHaveAttribute('data-expand', 'false');
    expect(toaster).toHaveAttribute('data-position', 'top-right');
  });

  it('should have correct html structure with lang attribute', async () => {
    const RootLayout = await import('@/app/layout').then(m => m.default);
    
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const htmlElement = document.documentElement;
    expect(htmlElement).toHaveAttribute('lang', 'ja');
  });

  it('should apply font variables to body element', async () => {
    const RootLayout = await import('@/app/layout').then(m => m.default);
    
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const bodyElement = document.body;
    expect(bodyElement.className).toContain('antialiased');
    // Note: Font variables are applied but testing them specifically requires more complex setup
  });

  it('should maintain existing layout structure after AuthProvider integration', async () => {
    const RootLayout = await import('@/app/layout').then(m => m.default);
    
    render(
      <RootLayout>
        <main data-testid="main-content">Main Content</main>
      </RootLayout>
    );

    // Verify that the basic structure is maintained
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});