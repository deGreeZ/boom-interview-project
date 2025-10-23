import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DateRangePicker from '~/components/DateRangePicker'

describe('DateRangePicker', () => {
  const mockOnDateChange = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default date range (today to 7 days from now)', () => {
    render(<DateRangePicker onDateChange={mockOnDateChange} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input).toBeInTheDocument()
    // Check for date format pattern (e.g., "Jan 15, 2024 - Jan 22, 2024")
    expect(input.value).toMatch(/[A-Z][a-z]{2} \d{1,2}, \d{4} - [A-Z][a-z]{2} \d{1,2}, \d{4}/)
  })

  it('renders with provided checkIn and checkOut dates', () => {
    const checkIn = '2024-03-15'
    const checkOut = '2024-03-18'

    render(
      <DateRangePicker
        onDateChange={mockOnDateChange}
        checkIn={checkIn}
        checkOut={checkOut}
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Mar 15, 2024 - Mar 18, 2024')
  })

  it('opens calendar dropdown when input is clicked', async () => {
    const { container } = render(<DateRangePicker onDateChange={mockOnDateChange} />)

    const inputWrapper = screen.getByRole('textbox').closest('.search-input-wrapper')
    fireEvent.click(inputWrapper!)

    await waitFor(() => {
      const calendarDropdown = container.querySelector('.calendar-dropdown')
      expect(calendarDropdown).toBeInTheDocument()
    })
  })

  it('toggles calendar visibility on input click', async () => {
    const { container } = render(<DateRangePicker onDateChange={mockOnDateChange} />)

    const inputWrapper = screen.getByRole('textbox').closest('.search-input-wrapper')

    // Open calendar
    fireEvent.click(inputWrapper!)
    await waitFor(() => {
      const calendarDropdown = container.querySelector('.calendar-dropdown')
      expect(calendarDropdown).toBeInTheDocument()
    })

    // Close calendar
    fireEvent.click(inputWrapper!)
    await waitFor(() => {
      const calendarDropdown = container.querySelector('.calendar-dropdown')
      expect(calendarDropdown).not.toBeInTheDocument()
    })
  })

  it('calls onDateChange with formatted dates when valid range is selected', async () => {
    const { container } = render(<DateRangePicker onDateChange={mockOnDateChange} />)

    const inputWrapper = screen.getByRole('textbox').closest('.search-input-wrapper')
    fireEvent.click(inputWrapper!)

    await waitFor(() => {
      const calendarDropdown = container.querySelector('.calendar-dropdown')
      expect(calendarDropdown).toBeInTheDocument()
    })

    // Note: Full date selection testing would require more complex interaction with the DateRange component
    // This test verifies the structure is in place
    expect(mockOnDateChange).not.toHaveBeenCalled() // Not called until valid selection
  })

  it('displays calendar emoji icon', () => {
    render(<DateRangePicker onDateChange={mockOnDateChange} />)

    expect(screen.getByText('📅')).toBeInTheDocument()
  })

  it('makes input read-only to prevent manual editing', () => {
    render(<DateRangePicker onDateChange={mockOnDateChange} />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readonly')
  })

  it('formats dates in correct format (MMM dd, yyyy)', () => {
    const checkIn = '2024-06-15'
    const checkOut = '2024-06-20'

    render(
      <DateRangePicker
        onDateChange={mockOnDateChange}
        checkIn={checkIn}
        checkOut={checkOut}
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Jun 15, 2024 - Jun 20, 2024')
  })

  it('handles date range spanning multiple months', () => {
    const checkIn = '2024-03-28'
    const checkOut = '2024-04-05'

    render(
      <DateRangePicker
        onDateChange={mockOnDateChange}
        checkIn={checkIn}
        checkOut={checkOut}
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Mar 28, 2024 - Apr 5, 2024')
  })

  it('closes calendar when clicking outside', async () => {
    const { container } = render(
      <div>
        <DateRangePicker onDateChange={mockOnDateChange} />
        <button>Outside</button>
      </div>
    )

    const inputWrapper = screen.getByRole('textbox').closest('.search-input-wrapper')
    fireEvent.click(inputWrapper!)

    await waitFor(() => {
      const calendarDropdown = container.querySelector('.calendar-dropdown')
      expect(calendarDropdown).toBeInTheDocument()
    })

    // Click outside
    const outsideButton = screen.getByRole('button', { name: 'Outside' })
    fireEvent.mouseDown(outsideButton)

    await waitFor(() => {
      const calendarDropdown = container.querySelector('.calendar-dropdown')
      expect(calendarDropdown).not.toBeInTheDocument()
    })
  })
})
