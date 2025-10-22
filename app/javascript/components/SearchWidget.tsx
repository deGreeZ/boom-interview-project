import { useState } from 'react';

interface SearchWidgetProps {
  onSearch: (searchParams: SearchParams) => void;
}

export interface SearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

const cities = ['Hollywood', 'Pompano Beach', 'Deerfield Beach', 'Plantation'];

export default function SearchWidget({ onSearch }: SearchWidgetProps) {
  const [location, setLocation] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const handleSearch = () => {
    onSearch({ location, checkIn, checkOut, adults, children });
  };

  const selectCity = (city: string) => {
    setLocation(city);
    setShowLocationDropdown(false);
  };

  return (
    <div className="search-widget">
      <div className="search-widget-container">
        {/* Location */}
        <div className="search-field">
          <label className="search-label">Location</label>
          <div className="search-input-wrapper">
            <span className="icon">📍</span>
            <input
              type="text"
              placeholder="Select city"
              value={location}
              readOnly
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="search-input"
            />
            <button
              className="dropdown-toggle"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            >
              {showLocationDropdown ? '▲' : '▼'}
            </button>
          </div>
          {showLocationDropdown && (
            <div className="location-dropdown">
              {cities.map((city) => (
                <div
                  key={city}
                  className="location-option"
                  onClick={() => selectCity(city)}
                >
                  <span className="icon">📍</span>
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Check-in / Check-out */}
        <div className="search-field">
          <label className="search-label">Check-in / Check-out</label>
          <div className="search-input-wrapper">
            <span className="icon">📅</span>
            <input
              type="date"
              placeholder="Select date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Adults */}
        <div className="search-field">
          <label className="search-label">Adults</label>
          <div className="counter-wrapper">
            <button
              className="counter-btn"
              onClick={() => setAdults(Math.max(1, adults - 1))}
            >
              −
            </button>
            <span className="counter-value">{adults}</span>
            <button
              className="counter-btn"
              onClick={() => setAdults(adults + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="search-field">
          <label className="search-label">Children</label>
          <div className="counter-wrapper">
            <button
              className="counter-btn"
              onClick={() => setChildren(Math.max(0, children - 1))}
            >
              −
            </button>
            <span className="counter-value">{children}</span>
            <button
              className="counter-btn"
              onClick={() => setChildren(children + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Search Button */}
        <button className="search-btn" onClick={handleSearch}>
          <span className="icon">🔍</span>
          Search
        </button>
      </div>
    </div>
  );
}
