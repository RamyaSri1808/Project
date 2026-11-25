import React from 'react';
import {
  Wind,
  Moon,
  Sparkles,
  Shirt,
  Footprints,
  Droplets,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

export function RightRail({
  weather,
  laundrySummary,
  runSummary,
  hydrationSummary,
  commuterSummary,
  onSelectTab,
}) {
  const { aqi, current, location } = weather;
  const aqiPercent = Math.min(100, Math.max(8, Math.round((aqi.value / 250) * 100)));

  return (
    <aside className="right-rail" aria-label="Air Quality and Local Summary">
      {/* Air Quality Index Card */}
      <div className="wx-card rail-card">
        <div className="wx-card-header compact">
          <h3>Air Quality Index</h3>
          <span className="aqi-pill">{aqi.category}</span>
        </div>

        <div className="aqi-main-row">
          <div className="aqi-circle">
            <strong>{aqi.value}</strong>
            <span>US AQI</span>
          </div>
          <div className="aqi-desc">
            <p>{aqi.advice}</p>
          </div>
        </div>

        <div className="aqi-bar-track">
          <div className="aqi-marker" style={{ left: `${aqiPercent}%` }} />
        </div>

        <div className="aqi-pollutants">
          <div>
            <span>PM2.5</span>
            <strong>{aqi.pm25} µg/m³</strong>
          </div>
          <div>
            <span>PM10</span>
            <strong>{aqi.pm10} µg/m³</strong>
          </div>
          <div>
            <span>Ozone</span>
            <strong>{aqi.o3} µg/m³</strong>
          </div>
        </div>
      </div>

      {/* Today's Smart Lifestyle Snapshot */}
      <div className="wx-card rail-card">
        <div className="wx-card-header compact">
          <h3>Smart Daily Snapshot</h3>
          <Sparkles size={16} color="#1b4de4" />
        </div>
        <div className="snapshot-list">
          <button
            type="button"
            className="snapshot-item"
            onClick={() => onSelectTab('laundry')}
          >
            <span className="snap-icon laundry">
              <Shirt size={15} />
            </span>
            <div>
              <strong>Laundry Drying</strong>
              <small>
                {laundrySummary.durationLabel} • Ready {laundrySummary.readyByTime}
              </small>
            </div>
          </button>

          <button
            type="button"
            className="snapshot-item"
            onClick={() => onSelectTab('running')}
          >
            <span className="snap-icon run">
              <Footprints size={15} />
            </span>
            <div>
              <strong>Best Run Window</strong>
              <small>
                {runSummary.overallBest?.timeLabel} ({runSummary.overallBest?.status})
              </small>
            </div>
          </button>

          <button
            type="button"
            className="snapshot-item"
            onClick={() => onSelectTab('hydration')}
          >
            <span className="snap-icon hydro">
              <Droplets size={15} />
            </span>
            <div>
              <strong>Hydration Target</strong>
              <small>
                {hydrationSummary.totalLiters} L ({hydrationSummary.glasses} glasses)
              </small>
            </div>
          </button>

          <button
            type="button"
            className="snapshot-item"
            onClick={() => onSelectTab('commuter')}
          >
            <span className="snap-icon commute">
              <Navigation size={15} />
            </span>
            <div>
              <strong>Commuter Comfort</strong>
              <small>
                Index {commuterSummary.overallScore}/100 • {commuterSummary.morning.status}
              </small>
            </div>
          </button>
        </div>
      </div>

      {/* Moon & Astronomy */}
      <div className="wx-card rail-card">
        <div className="wx-card-header compact">
          <h3>Sun &amp; Moon</h3>
          <Moon size={16} color="#475569" />
        </div>
        <div className="astro-rows">
          <div>
            <span>Sunrise / Sunset</span>
            <strong>
              {current.sunrise} / {current.sunset}
            </strong>
          </div>
          <div>
            <span>Moon Phase</span>
            <strong>{current.moonPhase}</strong>
          </div>
          <div>
            <span>Illumination</span>
            <strong>{current.moonIllumination}%</strong>
          </div>
        </div>
      </div>

      {/* Local Advisory (Replaces Allergy Tracker & Radar) */}
      <div className="wx-card rail-card local-insight-card">
        <div className="wx-card-header compact">
          <h3>{location.name} Insights</h3>
          <ShieldCheck size={16} color="#0284c7" />
        </div>
        <ul className="insight-bullets">
          <li>
            <Wind size={14} />
            <span>
              Steady {current.windDir} breeze ({current.windSpeedKmh} km/h) speeds terrace laundry drying and keeps evening humidity comfortable.
            </span>
          </li>
          <li>
            <Droplets size={14} />
            <span>
              Dew point at {current.dewPointC}°C — ideal for morning jogs before 8:30 AM and post-5:30 PM riverfront commutes.
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
