import React, { useState, useEffect, useMemo } from 'react';
import { Shirt, Wind, Sun, Droplets, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import {
  FABRIC_PROFILES,
  calculateLaundryDrying,
  findBestLaundryWindows,
} from '../utils/lifestyleCalculators';
import { formatTemp } from '../services/weatherService';

export function LaundrySystem({ weather, unit }) {
  const { current, hourly } = weather;
  const [fabricType, setFabricType] = useState('cotton');
  const [exposure, setExposure] = useState('direct-sun');
  const [customMode, setCustomMode] = useState(false);

  const [windSpeedKmh, setWindSpeedKmh] = useState(current.windSpeedKmh);
  const [sunlightWm2, setSunlightWm2] = useState(
    current.solarWm2 > 0 ? current.solarWm2 : 560
  );
  const [humidity, setHumidity] = useState(current.humidity);

  useEffect(() => {
    if (!customMode) {
      setWindSpeedKmh(current.windSpeedKmh);
      setSunlightWm2(current.solarWm2 > 0 ? current.solarWm2 : 560);
      setHumidity(current.humidity);
    }
  }, [current, customMode]);

  const result = useMemo(
    () =>
      calculateLaundryDrying({
        windSpeedKmh,
        sunlightWm2,
        humidity,
        tempC: current.tempC,
        fabricType,
        exposure,
      }),
    [windSpeedKmh, sunlightWm2, humidity, current.tempC, fabricType, exposure]
  );

  const windows = useMemo(
    () => findBestLaundryWindows(hourly, fabricType),
    [hourly, fabricType]
  );

  const resetToLive = () => {
    setCustomMode(false);
    setWindSpeedKmh(current.windSpeedKmh);
    setSunlightWm2(current.solarWm2 > 0 ? current.solarWm2 : 560);
    setHumidity(current.humidity);
  };

  return (
    <section id="section-laundry" className="wx-card smart-card">
      <div className="wx-card-header">
        <div className="wx-card-title-row">
          <div className="feature-icon-badge laundry-badge">
            <Shirt size={19} />
          </div>
          <div>
            <h2>Smart Laundry Drying System</h2>
            <p className="card-subtitle">
              Real-time evaporation time calculated from Wind Speed, Sunlight (W/m²) &amp; Humidity
            </p>
          </div>
        </div>
        <div className="header-actions">
          <span className={`pill-status ${result.statusTone}`}>
            Score {result.dryingScore}/100
          </span>
          {customMode && (
            <button type="button" className="btn-reset-live" onClick={resetToLive}>
              <RotateCcw size={13} /> Sync Live
            </button>
          )}
        </div>
      </div>

      <div className="laundry-grid">
        <div className="laundry-result-panel">
          <div className="laundry-hero-box">
            <span className="eyebrow-label">Estimated Dry Time ({result.fabricLabel})</span>
            <div className="laundry-time-big">{result.durationLabel}</div>
            <div className="laundry-meta-row">
              <span>
                <Clock size={14} /> Ready around <strong>{result.readyByTime}</strong>
              </span>
              <span>
                <CheckCircle2 size={14} /> {result.rating}
              </span>
            </div>
            {current.solarWm2 === 0 && !customMode && (
              <p className="night-sim-note">
                It is currently nighttime in {weather.location.name}; showing daytime sunlight baseline (560 W/m²) for tomorrow&apos;s wash planning. Adjust sliders to test any condition.
              </p>
            )}
          </div>

          <div className="laundry-controls-row">
            <div className="control-group">
              <label htmlFor="fabric-select">Fabric Load</label>
              <select
                id="fabric-select"
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
              >
                {Object.entries(FABRIC_PROFILES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label>Drying Spot</label>
              <div className="segmented-toggle">
                <button
                  type="button"
                  className={exposure === 'direct-sun' ? 'active' : ''}
                  onClick={() => setExposure('direct-sun')}
                >
                  Open Terrace / Sun
                </button>
                <button
                  type="button"
                  className={exposure === 'covered' ? 'active' : ''}
                  onClick={() => setExposure('covered')}
                >
                  Covered Balcony
                </button>
              </div>
            </div>
          </div>

          <div className="factor-bars">
            <div className="factor-bar-item">
              <div className="factor-bar-label">
                <span>
                  <Wind size={14} /> Wind Airflow
                </span>
                <strong>{windSpeedKmh} km/h</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill wind-fill"
                  style={{ width: `${result.factors.windImpact}%` }}
                />
              </div>
            </div>

            <div className="factor-bar-item">
              <div className="factor-bar-label">
                <span>
                  <Sun size={14} /> Effective Sunlight
                </span>
                <strong>{result.effectiveSolar} W/m²</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill sun-fill"
                  style={{ width: `${result.factors.sunImpact}%` }}
                />
              </div>
            </div>

            <div className="factor-bar-item">
              <div className="factor-bar-label">
                <span>
                  <Droplets size={14} /> Air Dryness (100 - RH)
                </span>
                <strong>{humidity}% RH</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill humidity-fill"
                  style={{ width: `${result.factors.drynessImpact}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="laundry-sim-panel">
          <h3>Interactive Drying Simulator</h3>
          <p className="muted-sm">
            Slide parameters to model wind, sunlight, and humidity impact in real time.
          </p>

          <div className="slider-stack">
            <label className="slider-row">
              <div className="slider-head">
                <span>Wind Speed</span>
                <strong>{windSpeedKmh} km/h</strong>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                value={windSpeedKmh}
                onChange={(e) => {
                  setCustomMode(true);
                  setWindSpeedKmh(Number(e.target.value));
                }}
              />
            </label>

            <label className="slider-row">
              <div className="slider-head">
                <span>Sunlight (Solar Irradiance)</span>
                <strong>{sunlightWm2} W/m²</strong>
              </div>
              <input
                type="range"
                min="0"
                max="950"
                step="10"
                value={sunlightWm2}
                onChange={(e) => {
                  setCustomMode(true);
                  setSunlightWm2(Number(e.target.value));
                }}
              />
            </label>

            <label className="slider-row">
              <div className="slider-head">
                <span>Relative Humidity</span>
                <strong>{humidity}%</strong>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={humidity}
                onChange={(e) => {
                  setCustomMode(true);
                  setHumidity(Number(e.target.value));
                }}
              />
            </label>
          </div>

          <div className="best-window-callout">
            <div>
              <span className="muted-xs">Best Hang-Out Window Today</span>
              <strong>
                {windows.bestSlot
                  ? `${windows.bestSlot.timeLabel} (${windows.bestSlot.durationLabel})`
                  : '10 AM – 2 PM'}
              </strong>
            </div>
            <span className="temp-chip">
              {formatTemp(current.tempC, unit)}°{unit} ambient
            </span>
          </div>

          <div className="hourly-drying-strip">
            {windows.slots.slice(0, 6).map((slot, i) => (
              <div
                key={`${slot.timeLabel}-${i}`}
                className={`dry-slot ${
                  windows.bestSlot && slot.timeLabel === windows.bestSlot.timeLabel ? 'best' : ''
                }`}
              >
                <span className="slot-t">{slot.timeLabel}</span>
                <div className="slot-bar-wrap">
                  <div
                    className="slot-bar"
                    style={{ height: `${Math.max(18, slot.dryingScore)}%` }}
                  />
                </div>
                <strong className="slot-dur">{slot.durationLabel}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
