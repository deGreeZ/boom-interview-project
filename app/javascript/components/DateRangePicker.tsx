import { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { addDays, addMonths, endOfMonth, differenceInDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface DateRangePickerProps {
  onDateChange: (checkIn: string, checkOut: string) => void;
  checkIn?: string;
  checkOut?: string;
}

export default function DateRangePicker({ onDateChange, checkIn, checkOut }: DateRangePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: checkIn ? new Date(checkIn) : new Date(),
      endDate: checkOut ? new Date(checkOut) : addDays(new Date(), 7),
      key: 'selection'
    }
  ]);
  const [error, setError] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Calculate max date: 3 months from now, end of that month
  const maxDate = endOfMonth(addMonths(new Date(), 3));

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (ranges: any) => {
    const { selection } = ranges;
    const daysDifference = differenceInDays(selection.endDate, selection.startDate);

    // Always update the state to show the selection
    setDateRange([selection]);

    // If user is still selecting (clicking first date), don't validate yet
    if (daysDifference === 0) {
      setError(null);
      return;
    }

    // Validate the completed range
    if (daysDifference < 1) {
      setError('Minimum stay is 1 night');
      return;
    }

    if (daysDifference > 14) {
      setError('Maximum stay is 14 nights');
      return;
    }

    // Clear error and notify parent if validation passes
    setError(null);

    // Format dates as YYYY-MM-DD for the parent component
    const checkInDate = selection.startDate.toISOString().split('T')[0];
    const checkOutDate = selection.endDate.toISOString().split('T')[0];

    onDateChange(checkInDate, checkOutDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="date-range-picker" ref={calendarRef}>
      <div
        className="search-input-wrapper date-picker-input"
        onClick={() => setShowCalendar(!showCalendar)}
        style={{ cursor: 'pointer' }}
      >
        <span className="icon">📅</span>
        <input
          type="text"
          readOnly
          value={`${formatDate(dateRange[0].startDate)} - ${formatDate(dateRange[0].endDate)}`}
          className="search-input"
          style={{ cursor: 'pointer' }}
        />
      </div>

      {showCalendar && (
        <div className="calendar-dropdown">
          {error && (
            <div className="date-picker-error">
              {error}
            </div>
          )}
          <DateRange
            ranges={dateRange}
            onChange={handleSelect}
            months={2}
            direction="horizontal"
            minDate={new Date()}
            maxDate={maxDate}
            rangeColors={['#4a5568']}
            showDateDisplay={false}
          />
        </div>
      )}
    </div>
  );
}
