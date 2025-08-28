import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    return (key: string, _values?: any) => {
      if (namespace && key) {
        return `${namespace}.${key}`
      }
      return key
    }
  },
  useLocale: () => 'ja',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next-intl/navigation
vi.mock('next-intl/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    locale: 'ja',
  }),
  usePathname: () => '/',
  redirect: vi.fn(),
  Link: ({ children, href, ...props }: any) => {
    const React = require('react')
    return React.createElement('a', { href, ...props }, children)
  },
}))

// Mock next/navigation for next-intl compatibility
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

// Add missing DOM APIs for Radix UI Select component
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  value: function () {
    return {}
  },
  writable: true,
})

Object.defineProperty(window.HTMLElement.prototype, 'hasPointerCapture', {
  value: function () {
    return false
  },
  writable: true,
})

Object.defineProperty(window.HTMLElement.prototype, 'setPointerCapture', {
  value: function () {
    return {}
  },
  writable: true,
})

Object.defineProperty(window.HTMLElement.prototype, 'releasePointerCapture', {
  value: function () {
    return {}
  },
  writable: true,
})