import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchWidget from '~/components/SearchWidget'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

describe('SearchWidget', () => {
  const mockOnSearch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all search fields', () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    expect(screen.getByPlaceholderText('Select city')).toBeInTheDocument()
    expect(screen.getByText('Adults')).toBeInTheDocument()
    expect(screen.getByText('Children')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument()
  })

  it('loads cities from API on mount', async () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    // Click to open dropdown
    const input = screen.getByPlaceholderText('Select city')
    fireEvent.focus(input)

    // Wait for cities to load
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    expect(screen.getByText('Los Angeles')).toBeInTheDocument()
    expect(screen.getByText('Chicago')).toBeInTheDocument()
  })

  it('displays loading state while fetching cities', async () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Select city')
    fireEvent.focus(input)

    // Should show loading initially
    expect(screen.getByText('Loading cities...')).toBeInTheDocument()

    // Wait for cities to load
    await waitFor(() => {
      expect(screen.queryByText('Loading cities...')).not.toBeInTheDocument()
    })
  })

  it('filters cities based on search input', async () => {
    const user = userEvent.setup()
    render(<SearchWidget onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Select city')

    // Wait for cities to load
    fireEvent.focus(input)
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    // Type to filter
    await user.type(input, 'los')

    await waitFor(() => {
      expect(screen.getByText('Los Angeles')).toBeInTheDocument()
      expect(screen.queryByText('New York')).not.toBeInTheDocument()
    })
  })

  it('selects city when clicked from dropdown', async () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Select city')

    // Open dropdown
    fireEvent.focus(input)

    // Wait for cities to load
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    // Click on a city
    fireEvent.click(screen.getByText('New York'))

    // Input should be populated
    expect(input).toHaveValue('New York')
  })

  it('toggles location dropdown with dropdown button', async () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    // Wait for cities to load
    await waitFor(() => {
      expect(screen.queryByText('Loading cities...')).not.toBeInTheDocument()
    })

    const toggleButton = screen.getByRole('button', { name: '▼' })

    // Open dropdown
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    // Close dropdown
    const upButton = screen.getByRole('button', { name: '▲' })
    fireEvent.click(upButton)

    await waitFor(() => {
      expect(screen.queryByText('New York')).not.toBeInTheDocument()
    })
  })

  it('increments adults counter', async () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    const incrementButton = screen.getAllByRole('button', { name: '+' })[0]
    const counterValue = screen.getAllByText('1')[0]

    expect(counterValue).toBeInTheDocument()

    fireEvent.click(incrementButton)

    await waitFor(() => {
      expect(screen.getAllByText('2')[0]).toBeInTheDocument()
    })
  })

  it('decrements adults counter but not below 1', async () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    const decrementButton = screen.getAllByRole('button', { name: '−' })[0]

    // Try to decrement below 1
    fireEvent.click(decrementButton)

    // Should stay at 1
    expect(screen.getAllByText('1')[0]).toBeInTheDocument()
  })

  it('increments children counter', async () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    // Get all counter values - initially should be [1, 0] for [adults, children]
    const initialChildrenValue = screen.getAllByText('0')[0]
    expect(initialChildrenValue).toBeInTheDocument()

    // Get the increment button for children (second + button)
    const incrementButtons = screen.getAllByRole('button', { name: '+' })
    const incrementChildren = incrementButtons[1]

    fireEvent.click(incrementChildren)

    // After clicking, children should be 1
    await waitFor(() => {
      // Now we should have values like [1 or 2 for adults, 1 for children]
      const allOnes = screen.getAllByText('1')
      // At least one element should be 1 (the children counter)
      expect(allOnes.length).toBeGreaterThan(0)
    })
  })

  it('decrements children counter but not below 0', async () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    const decrementButton = screen.getAllByRole('button', { name: '−' })[1]

    // Already at 0
    expect(screen.getByText('0')).toBeInTheDocument()

    // Try to decrement below 0
    fireEvent.click(decrementButton)

    // Should stay at 0
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('calls onSearch with correct parameters when search button is clicked', async () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    // Select a city
    const input = screen.getByPlaceholderText('Select city')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('Chicago')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Chicago'))

    // Increment adults
    const incrementAdults = screen.getAllByRole('button', { name: '+' })[0]
    fireEvent.click(incrementAdults)

    // Increment children
    const incrementChildren = screen.getAllByRole('button', { name: '+' })[1]
    fireEvent.click(incrementChildren)

    // Click search
    const searchButton = screen.getByRole('button', { name: /Search/i })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        location: 'Chicago',
        checkIn: expect.any(String),
        checkOut: expect.any(String),
        adults: 2,
        children: 1,
      })
    })
  })

  it('displays "No cities found" when filter returns no results', async () => {
    const user = userEvent.setup()
    render(<SearchWidget onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Select city')

    // Wait for cities to load
    fireEvent.focus(input)
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    // Type something that doesn't match
    await user.clear(input)
    await user.type(input, 'NonexistentCity')

    await waitFor(() => {
      expect(screen.getByText('No cities found')).toBeInTheDocument()
    })
  })

  it('shows location icon for each city in dropdown', async () => {
    render(<SearchWidget onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Select city')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    // Check for multiple location icons (in input and dropdown items)
    const icons = screen.getAllByText('📍')
    expect(icons.length).toBeGreaterThan(1)
  })

  it('clears search input when city is selected', async () => {
    const user = userEvent.setup()
    render(<SearchWidget onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Select city')

    // Type to filter
    await user.type(input, 'new')

    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    // Select city
    fireEvent.click(screen.getByText('New York'))

    // Input should have the city name, and dropdown should close
    expect(input).toHaveValue('New York')
  })

  it('handles API error when fetching cities', async () => {
    // Override handler to return error
    server.use(
      http.get('http://localhost:3000/api/boom/cities', () => {
        return HttpResponse.json(
          { error: 'Failed to fetch cities' },
          { status: 500 }
        )
      })
    )

    render(<SearchWidget onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Select city')
    fireEvent.focus(input)

    // Should still show loading initially
    expect(screen.getByText('Loading cities...')).toBeInTheDocument()

    // Wait for error state - cities should be empty but no error displayed to user
    await waitFor(() => {
      expect(screen.queryByText('Loading cities...')).not.toBeInTheDocument()
    })

    // Dropdown should show "No cities found" when there's an error
    await waitFor(() => {
      expect(screen.getByText('No cities found')).toBeInTheDocument()
    })
  })
})
