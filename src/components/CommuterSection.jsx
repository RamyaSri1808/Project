import React, { useState, useMemo } from 'react';
import { Bike, Car, Bus, Navigation, Eye, Wind, CloudRain, CheckCircle } from 'lucide-react';
import { COMMUTE_MODES, calculateCommuterReport } from '../utils/lifestyleCalculators';
import { formatTemp } from '../services/weatherService';

const MODE_ICONS = {
  bike: Bike,
  car: Car,
  transit: Bus,
};

export function CommuterSection({ weather, unit }) {
  const [mode, setMode] = useState('bike');

  const report = useMemo(
    () =>
      calculateCommuterReport({
        current: weather.current,
        hourly: weather.hourly,
        mode,
        corridor: weather.location.corridor,
      }),
    [weather, mode]
  );

  return (
    <section id="section-commuter" className="wx-card smart-card">
      <div className="wx-card-header">
        <div className="wx-card-title-row">
          <div className="feature-icon-badge commute-badge">
            <Navigation size={19} />
          </div>
          <div>
            <h2>Commuter Comfort &amp; Travel Advisor</h2>
            <p className="card-subtitle">
              Corridor: <strong>{report.corridor}</strong> — Glare, crosswind &amp; road conditions
            </p>
          </div>
        </div>
        <span
          className={`pill-status ${
            report.overallScore >= 75 ? 'good' : report.overallScore >= 55 ? 'moderate' : 'poor'
          }`}
        >
          Commute Index {report.overallScore}/100
        </span>
      </div>

      <div className="commute-mode-tabs">
        {Object.entries(COMMUTE_MODES).map(([key, item]) => {
          const Icon = MODE_ICONS[key] || Navigation;
          return (
            <button
              key={key}
              type="button"
              className={`mode-tab ${mode === key ? 'active' : ''}`}
              onClick={() => setMode(key)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="commute-periods-grid">
        {[report.morning, report.evening].map((period) => (
          <div key={period.periodName} className="commute-period-card">
            <div className="cp-top">
              <div>
                <span className="muted-xs">{period.periodName}</span>
                <h4>{period.status} Ride / Drive</h4>
              </div>
              <div className="cp-score">{period.comfortScore}%</div>
            </div>

            <div className="cp-metrics">
              <span>
                Temp: <strong>{formatTemp(period.tempC, unit)}°{unit}</strong>
              </span>
              <span>
                <Wind size={13} /> {period.windSpeedKmh} km/h {period.windDir}
              </span>
              <span>
                <Eye size={13} /> {period.visibilityKm} km vis
              </span>
              <span>
                <CloudRain size={13} /> {period.precipProb}% rain
              </span>
            </div>

            <p className="cp-glare">{period.glareNote}</p>
          </div>
        ))}
      </div>

      <div className="commute-bottom-bar">
        <div className="best-dep-box">
          <span className="muted-xs">Recommended Departure Window</span>
          <strong>{report.bestDeparture}</strong>
        </div>

        <ul className="commute-checklist">
          {report.checklist.map((tip, idx) => (
            <li key={idx}>
              <CheckCircle size={14} />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
