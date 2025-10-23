import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '~/App'

describe('App', () => {
  it('renders PropertySearch on home route', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )

    // Wait for the SearchWidget to render
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Select city')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument()
  })

  it('renders NotFound on unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument()
    expect(
      screen.getByText("The page you're looking for doesn't exist.")
    ).toBeInTheDocument()
  })

  it('renders NotFound on deeply nested unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/some/deeply/nested/unknown/path']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })

  it('provides navigation link back to home from 404 page', () => {
    render(
      <MemoryRouter initialEntries={['/404']}>
        <AppRoutes />
      </MemoryRouter>
    )

    const homeLink = screen.getByRole('link', { name: 'Go back home' })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('routes are configured correctly', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )

    // Should render home page by default
    expect(screen.getByPlaceholderText('Select city')).toBeInTheDocument()
  })
})
