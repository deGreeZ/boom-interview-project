import { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { addDays } from 'date-fns';
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
  const calendarRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = (ranges: any) => {
    const { selection } = ranges;
    setDateRange([selection]);

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
          <DateRange
            ranges={dateRange}
            onChange={handleSelect}
            months={2}
            direction="horizontal"
            minDate={new Date()}
            rangeColors={['#4a5568']}
            showDateDisplay={false}
          />
        </div>
      )}
    </div>
  );
}
