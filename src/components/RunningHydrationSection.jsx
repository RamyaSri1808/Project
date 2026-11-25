import React, { useState, useMemo } from 'react';
import { Footprints, Droplets, Flame, Sparkles, Clock } from 'lucide-react';
import {
  ACTIVITY_LEVELS,
  calculateRunningWindows,
  calculateHydrationPlan,
} from '../utils/lifestyleCalculators';
import { formatTemp } from '../services/weatherService';

export function RunningHydrationSection({ weather, unit }) {
  const { current, hourly, aqi } = weather;
  const [weightKg, setWeightKg] = useState(68);
  const [activityLevel, setActivityLevel] = useState('moderate-run');
  const [outdoorMinutes, setOutdoorMinutes] = useState(45);

  const runData = useMemo(
    () => calculateRunningWindows(hourly, aqi.value),
    [hourly, aqi.value]
  );

  const hydration = useMemo(
    () =>
      calculateHydrationPlan({
        tempC: current.tempC,
        humidity: current.humidity,
        uvIndex: current.uvIndex,
        weightKg,
        activityLevel,
        outdoorMinutes,
      }),
    [current, weightKg, activityLevel, outdoorMinutes]
  );

  return (
    <div className="dual-lifestyle-grid">
      {/* Outdoor Running Time Card */}
      <section id="section-running" className="wx-card smart-card">
        <div className="wx-card-header">
          <div className="wx-card-title-row">
            <div className="feature-icon-badge run-badge">
              <Footprints size={19} />
            </div>
            <div>
              <h2>Outdoor Running Time</h2>
              <p className="card-subtitle">
                Heat stress, UV, humidity &amp; AQI ({aqi.value}) window scoring
              </p>
            </div>
          </div>
          <span className="pill-status good">
            Best: {runData.overallBest?.timeLabel || '6 AM'}
          </span>
        </div>

        <div className="run-windows-pair">
          <div className="run-window-box best">
            <span className="muted-xs">Best Morning Run</span>
            <div className="run-time-val">{runData.bestMorning?.timeLabel}</div>
            <div className="run-sub-metrics">
              <span>{formatTemp(runData.bestMorning?.tempC ?? 22, unit)}°{unit}</span>
              <span>•</span>
              <span>Score {runData.bestMorning?.runScore}/100</span>
            </div>
            <p className="run-note">{runData.bestMorning?.note}</p>
          </div>

          <div className="run-window-box">
            <span className="muted-xs">Best Evening Run</span>
            <div className="run-time-val">{runData.bestEvening?.timeLabel}</div>
            <div className="run-sub-metrics">
              <span>{formatTemp(runData.bestEvening?.tempC ?? 26, unit)}°{unit}</span>
              <span>•</span>
              <span>Score {runData.bestEvening?.runScore}/100</span>
            </div>
            <p className="run-note">{runData.bestEvening?.note}</p>
          </div>
        </div>

        <h3 className="subhead-sm">Hourly Run Comfort Timeline</h3>
        <div className="run-timeline-list">
          {runData.timeline.slice(0, 8).map((slot, idx) => (
            <div key={`${slot.timeLabel}-${idx}`} className="run-timeline-row">
              <span className="rt-time">{slot.timeLabel}</span>
              <span className="rt-temp">{formatTemp(slot.tempC, unit)}°</span>
              <div className="rt-bar-track">
                <div
                  className={`rt-bar-fill status-${slot.status.toLowerCase()}`}
                  style={{ width: `${slot.runScore}%` }}
                />
              </div>
              <span className={`rt-badge status-${slot.status.toLowerCase()}`}>
                {slot.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Hydration Advisor Card */}
      <section id="section-hydration" className="wx-card smart-card">
        <div className="wx-card-header">
          <div className="wx-card-title-row">
            <div className="feature-icon-badge hydration-badge">
              <Droplets size={19} />
            </div>
            <div>
              <h2>Daily Hydration Advisor</h2>
              <p className="card-subtitle">
                Personalized water &amp; electrolyte plan for {weather.location.name}
              </p>
            </div>
          </div>
          <span
            className={`pill-status ${
              hydration.sweatRisk === 'High'
                ? 'poor'
                : hydration.sweatRisk === 'Moderate'
                  ? 'moderate'
                  : 'good'
            }`}
          >
            Sweat Loss: {hydration.sweatRisk}
          </span>
        </div>

        <div className="hydration-hero">
          <div className="hydration-big-stat">
            <span className="muted-xs">Recommended Intake</span>
            <div className="hydration-liters">
              {hydration.totalLiters} <span>Liters</span>
            </div>
            <small>
              ≈ {hydration.glasses} glasses (250 ml) • ~{hydration.hourlyReminderMl} ml/hr awake
            </small>
          </div>
          <div className="electrolyte-chip">
            <Sparkles size={15} />
            <span>{hydration.electrolyteAdvice}</span>
          </div>
        </div>

        <div className="hydration-inputs-grid">
          <label className="mini-input-card">
            <div className="slider-head">
              <span>Body Weight</span>
              <strong>{weightKg} kg</strong>
            </div>
            <input
              type="range"
              min="45"
              max="115"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
            />
          </label>

          <label className="mini-input-card">
            <div className="slider-head">
              <span>Outdoor Time</span>
              <strong>{outdoorMinutes} min</strong>
            </div>
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={outdoorMinutes}
              onChange={(e) => setOutdoorMinutes(Number(e.target.value))}
            />
          </label>

          <div className="mini-input-card full-span">
            <label htmlFor="activity-select">Daily Activity Level</label>
            <select
              id="activity-select"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
            >
              {Object.entries(ACTIVITY_LEVELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="subhead-sm">Timed Hydration Schedule</h3>
        <div className="hydration-schedule">
          {hydration.schedule.map((item) => (
            <div key={item.window} className="hydration-slot">
              <span className="hs-time">
                <Clock size={12} /> {item.window}
              </span>
              <span className="hs-tip">{item.tip}</span>
              <strong className="hs-amt">{item.amountMl} ml</strong>
            </div>
          ))}
        </div>

        <div className="heat-footer-note">
          <Flame size={14} />
          <span>
            Calculated with {formatTemp(current.tempC, unit)}°{unit} ambient temp, {current.humidity}% humidity &amp; UV {current.uvIndex}.
          </span>
        </div>
      </section>
    </div>
  );
}
