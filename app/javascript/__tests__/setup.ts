import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { server } from './mocks/server'

// Silence expected console errors in tests
const originalError = console.error
beforeAll(() => {
  // Start MSW server before all tests
  server.listen({ onUnhandledRequest: 'warn' })

  // Suppress axios error logs that are expected during error handling tests
  console.error = (...args) => {
    const message = args[0]?.toString() || ''
    if (
      message.includes('Error fetching listings:') ||
      message.includes('Error fetching cities:') ||
      message.includes('AxiosError')
    ) {
      return
    }
    originalError(...args)
  }
})

// Reset handlers after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Clean up after all tests
afterAll(() => {
  server.close()
  console.error = originalError
})
