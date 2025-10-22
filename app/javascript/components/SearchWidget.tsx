import { useState, useEffect } from 'react';
import axios from 'axios';
import DateRangePicker from './DateRangePicker';

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

export default function SearchWidget({ onSearch }: SearchWidgetProps) {
  const [location, setLocation] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  // Fetch cities from API on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/boom/cities');
        const citiesArray = response.data.cities || [];
        setAllCities(citiesArray);
        setFilteredCities(citiesArray);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Filter cities based on search input
  useEffect(() => {
    if (searchInput.trim() === '') {
      setFilteredCities(allCities);
    } else {
      const filtered = allCities.filter(city =>
        city.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchInput, allCities]);

  const handleSearch = () => {
    onSearch({ location, checkIn, checkOut, adults, children });
  };

  const selectCity = (city: string) => {
    setLocation(city);
    setSearchInput('');
    setShowLocationDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setLocation(value);
    setShowLocationDropdown(true);
  };

  const handleInputFocus = () => {
    setShowLocationDropdown(true);
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
              onChange={handleInputChange}
              onFocus={handleInputFocus}
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
              {isLoadingCities ? (
                <div className="location-option no-results">
                  Loading cities...
                </div>
              ) : filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <div
                    key={city}
                    className="location-option"
                    onClick={() => selectCity(city)}
                  >
                    <span className="icon">📍</span>
                    {city}
                  </div>
                ))
              ) : (
                <div className="location-option no-results">
                  No cities found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Check-in / Check-out */}
        <div className="search-field">
          <label className="search-label">Check-in / Check-out</label>
          <DateRangePicker
            onDateChange={(checkInDate, checkOutDate) => {
              setCheckIn(checkInDate);
              setCheckOut(checkOutDate);
            }}
            checkIn={checkIn}
            checkOut={checkOut}
          />
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
