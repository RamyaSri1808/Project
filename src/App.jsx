import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, RefreshCw, Globe } from 'lucide-react';
import {
  PRESET_LOCATIONS,
  buildFallbackWeather,
  fetchWeatherForLocation,
  searchLocations,
  formatTemp,
} from './services/weatherService';
import {
  calculateLaundryDrying,
  calculateRunningWindows,
  calculateHydrationPlan,
  calculateCommuterReport,
} from './utils/lifestyleCalculators';
import { LeftOptionRail } from './components/LeftOptionRail';
import {
  CurrentHeroCard,
  TodayPeriodsCard,
  WeatherDetailsCard,
  HourlyForecastCard,
  DailyForecastCard,
} from './components/ForecastCards';
import { LaundrySystem } from './components/LaundrySystem';
import { RunningHydrationSection } from './components/RunningHydrationSection';
import { CommuterSection } from './components/CommuterSection';
import { RightRail } from './components/RightRail';
import { WeatherConditionIcon } from './components/WeatherIcons';

const TOP_TABS = [
  { id: 'today', label: 'Today' },
  { id: 'hourly', label: 'Hourly' },
  { id: 'tenday', label: '10 Day' },
  { id: 'laundry', label: 'Laundry Drying' },
  { id: 'running', label: 'Running & Hydration' },
  { id: 'commuter', label: 'Commuter' },
];

export default function App() {
  const [selectedLoc, setSelectedLoc] = useState(PRESET_LOCATIONS[0]);
  const [weather, setWeather] = useState(() => buildFallbackWeather(PRESET_LOCATIONS[0]));
  const [unit, setUnit] = useState('C');
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const loadWeather = async (loc) => {
    setLoading(true);
    setWeather(buildFallbackWeather(loc));
    const live = await fetchWeatherForLocation(loc);
    setWeather(live);
    setLoading(false);
  };

  useEffect(() => {
    loadWeather(selectedLoc);
  }, [selectedLoc]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const results = await searchLocations(query);
      if (!cancelled) setSearchResults(results);
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    const sectionMap = {
      today: 'section-today',
      laundry: 'section-laundry',
      running: 'section-running',
      hydration: 'section-hydration',
      commuter: 'section-commuter',
      hourly: 'section-hourly',
      tenday: 'section-tenday',
    };
    const targetId = sectionMap[tabId];
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 40);
    }
  };

  const laundrySummary = useMemo(
    () =>
      calculateLaundryDrying({
        windSpeedKmh: weather.current.windSpeedKmh,
        sunlightWm2: weather.current.solarWm2 > 0 ? weather.current.solarWm2 : 560,
        humidity: weather.current.humidity,
        tempC: weather.current.tempC,
        fabricType: 'cotton',
        exposure: 'direct-sun',
      }),
    [weather]
  );

  const runSummary = useMemo(
    () => calculateRunningWindows(weather.hourly, weather.aqi.value),
    [weather]
  );

  const hydrationSummary = useMemo(
    () =>
      calculateHydrationPlan({
        tempC: weather.current.tempC,
        humidity: weather.current.humidity,
        uvIndex: weather.current.uvIndex,
      }),
    [weather]
  );

  const commuterSummary = useMemo(
    () =>
      calculateCommuterReport({
        current: weather.current,
        hourly: weather.hourly,
        mode: 'bike',
        corridor: weather.location.corridor,
      }),
    [weather]
  );

  return (
    <div className="app-shell">
      {/* Primary Weather.com-style Header */}
      <header className="wx-header">
        <div className="wx-header-inner">
          <div className="wx-brand" onClick={() => handleSelectTab('today')}>
            <div className="brand-square">
              <span>The</span>
              <strong>Weather</strong>
              <span>Smart</span>
            </div>
            <div className="brand-sub">
              <span>IN • Andhra Pradesh</span>
            </div>
          </div>

          <div className="wx-search-wrap" ref={searchRef}>
            <div className="wx-search-box">
              <Search size={17} className="search-icon" />
              <input
                type="text"
                placeholder="Search City, Locality or Area (e.g. Gundimeda, Vijayawada)"
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
              />
              {query && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setQuery('')}
                >
                  ×
                </button>
              )}
            </div>

            {searchOpen && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    className="search-option"
                    onClick={() => {
                      setSelectedLoc(loc);
                      setQuery('');
                      setSearchOpen(false);
                    }}
                  >
                    <MapPin size={15} />
                    <div>
                      <strong>{loc.name}</strong>
                      <span>
                        {loc.region}
                        {loc.country ? `, ${loc.country}` : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="wx-header-controls">
            <div className="locale-pill">
              <Globe size={14} /> IN
            </div>
            <div className="unit-toggle" role="group" aria-label="Temperature Unit">
              <button
                type="button"
                className={unit === 'C' ? 'active' : ''}
                onClick={() => setUnit('C')}
              >
                °C
              </button>
              <button
                type="button"
                className={unit === 'F' ? 'active' : ''}
                onClick={() => setUnit('F')}
              >
                °F
              </button>
            </div>
            <button
              type="button"
              className="refresh-btn"
              title="Refresh weather data"
              onClick={() => loadWeather(selectedLoc)}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Saved Locations Quick Strip */}
        <div className="saved-locations-bar">
          <div className="saved-locations-inner">
            {PRESET_LOCATIONS.map((loc) => {
              const isSelected = loc.id === selectedLoc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  className={`saved-loc-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedLoc(loc)}
                >
                  <WeatherConditionIcon
                    icon={isSelected ? weather.current.icon : 'partly-sunny'}
                    size={15}
                  />
                  <span>{loc.name}</span>
                  {isSelected && (
                    <strong>{formatTemp(weather.current.tempC, unit)}°</strong>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Navigation Bar (Radar & Allergy Tracker removed) */}
        <nav className="wx-subnav" aria-label="Forecast Sections">
          <div className="wx-subnav-inner">
            {TOP_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`subnav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleSelectTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main 3-Zone Responsive Layout */}
      <main className="wx-main-container">
        <LeftOptionRail
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          laundrySummary={laundrySummary}
          runSummary={runSummary}
          hydrationSummary={hydrationSummary}
          commuterSummary={commuterSummary}
          current={weather.current}
          unit={unit}
        />

        <div className="wx-center-column">
          <CurrentHeroCard weather={weather} unit={unit} />
          <TodayPeriodsCard weather={weather} unit={unit} />
          <WeatherDetailsCard weather={weather} unit={unit} />

          <LaundrySystem weather={weather} unit={unit} />
          <RunningHydrationSection weather={weather} unit={unit} />
          <CommuterSection weather={weather} unit={unit} />

          <HourlyForecastCard
            weather={weather}
            unit={unit}
            expandedDefault={activeTab === 'hourly'}
          />
          <DailyForecastCard
            weather={weather}
            unit={unit}
            expandedDefault={activeTab === 'tenday'}
          />
        </div>

        <RightRail
          weather={weather}
          laundrySummary={laundrySummary}
          runSummary={runSummary}
          hydrationSummary={hydrationSummary}
          commuterSummary={commuterSummary}
          onSelectTab={handleSelectTab}
        />
      </main>

      <footer className="wx-footer">
        <div className="wx-footer-inner">
          <div>
            <strong>WeatherSmart IN — Gundimeda, Vijayawada Locality Edition</strong>
            <p>
              Built for rapid daily decisions: Smart Laundry Drying, Outdoor Running Windows, Hydration Planning &amp; Commuter Comfort.
            </p>
          </div>
          <span className="footer-note">
            Data: {weather.source} • No Radar / No Allergy Tracker
          </span>
        </div>
      </footer>
    </div>
  );
}
