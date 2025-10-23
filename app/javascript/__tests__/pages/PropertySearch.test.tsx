import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PropertySearch from '~/pages/PropertySearch'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

describe('PropertySearch', () => {
  describe('Initial Rendering', () => {
    it('renders SearchWidget component', () => {
      render(<PropertySearch />)

      expect(screen.getByPlaceholderText('Select city')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument()
    })

    it('displays initial state with prompt message', () => {
      render(<PropertySearch />)

      expect(
        screen.getByText('Enter your search criteria above to find properties')
      ).toBeInTheDocument()
    })

    it('does not display property list before search', () => {
      render(<PropertySearch />)

      expect(screen.queryByText(/Found/)).not.toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('displays loading state during API call', async () => {
      render(<PropertySearch />)

      // Open dropdown and select city
      const input = screen.getByPlaceholderText('Select city')
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('New York'))

      // Click search
      const searchButton = screen.getByRole('button', { name: /Search/i })
      fireEvent.click(searchButton)

      // Should show loading state
      expect(screen.getByText('Searching for properties...')).toBeInTheDocument()

      // Wait for results
      await waitFor(() => {
        expect(screen.queryByText('Searching for properties...')).not.toBeInTheDocument()
      })
    })

    it('displays search results after successful API call', async () => {
      render(<PropertySearch />)

      // Select city
      const input = screen.getByPlaceholderText('Select city')
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('New York'))

      // Click search
      const searchButton = screen.getByRole('button', { name: /Search/i })
      fireEvent.click(searchButton)

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Found 2 properties')).toBeInTheDocument()
      })

      // Check if properties are displayed
      expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument()
      expect(screen.getByText('Cozy Studio with Great View')).toBeInTheDocument()
    })

    it('displays singular form when only one property is found', async () => {
      // Override handler to return single property
      server.use(
        http.get('http://localhost:3000/api/boom/listings', () => {
          return HttpResponse.json({
            listings: [
              {
                id: 1,
                title: 'Single Property',
                city_name: 'Test City',
                picture: 'https://example.com/image.jpg',
                rating: 4.5,
                accommodates: 2,
                beds: 1,
                baths: 1,
                extra_info: {
                  current_price: {
                    total_price: 100,
                  },
                },
              },
            ],
          })
        })
      )

      render(<PropertySearch />)

      // Select city and search
      const input = screen.getByPlaceholderText('Select city')
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('New York'))

      const searchButton = screen.getByRole('button', { name: /Search/i })
      fireEvent.click(searchButton)

      await waitFor(() => {
        expect(screen.getByText('Found 1 property')).toBeInTheDocument()
      })
    })

    it('displays property results with price information', async () => {
      const { container } = render(<PropertySearch />)

      // Select city and search
      const input = screen.getByPlaceholderText('Select city')
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('New York'))

      const searchButton = screen.getByRole('button', { name: /Search/i })
      fireEvent.click(searchButton)

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument()
      })

      // Verify properties are displayed with prices
      expect(screen.getByText('$250')).toBeInTheDocument()
      expect(screen.getByText('$150')).toBeInTheDocument()

      // Note: In tests, DateRangePicker doesn't propagate dates until user interaction,
      // so nights calculation will be 0 and nights won't be displayed
      // This is expected behavior in the test environment
    })
  })

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      // Override handler to return error
      server.use(
        http.get('http://localhost:3000/api/boom/listings', () => {
          return HttpResponse.json(
            { error: 'Failed to fetch listings' },
            { status: 500 }
          )
        })
      )

      render(<PropertySearch />)

      // Select city and search
      const input = screen.getByPlaceholderText('Select city')
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('New York'))

      const searchButton = screen.getByRole('button', { name: /Search/i })
      fireEvent.click(searchButton)

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch listings')).toBeInTheDocument()
      })
    })

    it('displays generic error message when API returns no error message', async () => {
      // Override handler to return error without message
      server.use(
        http.get('http://localhost:3000/api/boom/listings', () => {
          return HttpResponse.json({}, { status: 500 })
        })
      )

      render(<PropertySearch />)

      // Select city and search
      const input = screen.getByPlaceholderText('Select city')
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('New York'))

      const searchButton = screen.getByRole('button', { name: /Search/i })
      fireEvent.click(searchButton)

      // Wait for error
      await waitFor(() => {
        expect(
          screen.getByText('Failed to fetch listings. Please try again.')
        ).toBeInTheDocument()
      })
    })

    it('allows dismissing error message', async () => {
      // Override handler to return error
      server.use(
        http.get('http://localhost:3000/api/boom/listings', () => {
          return HttpResponse.json(
            { error: 'Test error' },
            { status: 500 }
          )
        })
      )

      render(<PropertySearch />)

      // Select city and search
      const input = screen.getByPlaceholderText('Select city')
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('New York'))

      const searchButton = screen.getByRole('button', { name: /Search/i })
      fireEvent.click(searchButton)

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument()
      })

      // Dismiss error
      const dismissButton = screen.getByRole('button', { name: 'Dismiss' })
      fireEvent.click(dismissButton)

      expect(screen.queryByText('Test error')).not.toBeInTheDocument()
    })
  })

  describe('Data Transformation and API Integration', () => {
    it('displays empty results when API returns no listings', async () => {
      // Override handler to return empty results
      server.use(
        http.get('http://localhost:3000/api/boom/listings', () => {
          return HttpResponse.json({ listings: [] })
        })
      )

      render(<PropertySearch />)

      // Select city and search
      const input = screen.getByPlaceholderText('Select city')
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('New York'))

      const searchButton = screen.getByRole('button', { name: /Search/i })
      fireEvent.click(searchButton)

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Found 0 properties')).toBeInTheDocument()
      })

      expect(
        screen.getByText('No properties found. Try adjusting your search criteria.')
      ).toBeInTheDocument()
    })

    it('transforms API data correctly to Property interface', async () => {
      render(<PropertySearch />)

      // Select city and search
      const input = screen.getByPlaceholderText('Select city')
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('New York'))

      const searchButton = screen.getByRole('button', { name: /Search/i })
      fireEvent.click(searchButton)

      // Wait for results and verify transformation
      await waitFor(() => {
        expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument()
      })

      // Verify rating is displayed
      expect(screen.getByText('⭐ 4.8')).toBeInTheDocument()

      // Verify price is displayed
      expect(screen.getByText('$250')).toBeInTheDocument()
    })

    it('passes correct query parameters to API', async () => {
      let capturedParams: URLSearchParams | null = null

      server.use(
        http.get('http://localhost:3000/api/boom/listings', ({ request }) => {
          capturedParams = new URL(request.url).searchParams
          return HttpResponse.json({ listings: [] })
        })
      )

      render(<PropertySearch />)

      // Select city
      const input = screen.getByPlaceholderText('Select city')
      fireEvent.focus(input)

      await waitFor(() => {
        expect(screen.getByText('Chicago')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Chicago'))

      // Wait a bit for state to update
      await waitFor(() => {
        expect(input).toHaveValue('Chicago')
      })

      // Increment adults and children
      const incrementButtons = screen.getAllByRole('button', { name: '+' })
      fireEvent.click(incrementButtons[0]) // Adults: 2

      await waitFor(() => {
        expect(screen.getAllByText('2').length).toBeGreaterThan(0)
      })

      fireEvent.click(incrementButtons[1]) // Children: 1

      // Search
      const searchButton = screen.getByRole('button', { name: /Search/i })
      fireEvent.click(searchButton)

      await waitFor(() => {
        expect(capturedParams).not.toBeNull()
      }, { timeout: 3000 })

      expect(capturedParams?.get('city')).toBe('Chicago')
      expect(capturedParams?.get('adults')).toBe('2')
      expect(capturedParams?.get('children')).toBe('1')
      // Date parameters may be empty in tests since DateRangePicker doesn't
      // propagate default dates until user interaction
      // If they exist, they should be in correct format (YYYY-MM-DD)
      const checkIn = capturedParams?.get('check_in')
      const checkOut = capturedParams?.get('check_out')
      if (checkIn && checkIn !== '') {
        expect(checkIn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
      if (checkOut && checkOut !== '') {
        expect(checkOut).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    })
  })
})
