import React, { useState } from 'react';
import {
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  Sun,
  Eye,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  CloudRain,
} from 'lucide-react';
import { WeatherConditionIcon, DaylightArc } from './WeatherIcons';
import { formatTemp } from '../services/weatherService';

export function CurrentHeroCard({ weather, unit }) {
  const { location, current, updatedAt, source } = weather;

  return (
    <section
      id="section-today"
      className={`hero-weather-card ${current.isDay ? 'theme-day' : 'theme-night'}`}
    >
      <div className="hero-top-row">
        <div>
          <h1 className="hero-location">
            {location.name}, {location.region}
          </h1>
          <p className="hero-timestamp">
            As of {updatedAt} IST • {source}
          </p>
        </div>
        <span className="hero-locality-pill">Today&apos;s Locality Forecast</span>
      </div>

      <div className="hero-main-row">
        <div className="hero-temp-block">
          <div className="hero-temp-value">
            {formatTemp(current.tempC, unit)}°
          </div>
          <div className="hero-condition-text">{current.condition}</div>
          <div className="hero-daynight">
            Day {formatTemp(current.highC, unit)}° • Night {formatTemp(current.lowC, unit)}°
          </div>
        </div>

        <div className="hero-icon-block">
          <WeatherConditionIcon icon={current.icon} size={76} />
          <div className="hero-quick-badges">
            <span>Wind {current.windSpeedKmh} km/h</span>
            <span>Humidity {current.humidity}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TodayPeriodsCard({ weather, unit }) {
  const { location, periods } = weather;
  return (
    <section className="wx-card">
      <div className="wx-card-header">
        <h2>Today&apos;s Forecast for {location.name}</h2>
      </div>
      <div className="periods-grid">
        {periods.map((p, idx) => (
          <div key={p.name} className={`period-col ${idx === 1 ? 'active-period' : ''}`}>
            <span className="period-name">{p.name}</span>
            <strong className="period-temp">{formatTemp(p.tempC, unit)}°</strong>
            <div className="period-icon">
              <WeatherConditionIcon icon={p.icon} size={32} />
            </div>
            <div className="period-precip">
              <CloudRain size={13} />
              <span>{p.precipProb}%</span>
            </div>
            <span className="period-cond">{p.condition}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WeatherDetailsCard({ weather, unit }) {
  const { location, current } = weather;

  const metrics = [
    {
      label: 'High / Low',
      value: `${formatTemp(current.highC, unit)}° / ${formatTemp(current.lowC, unit)}°`,
      icon: Thermometer,
    },
    {
      label: 'Wind',
      value: `${current.windDir} ${current.windSpeedKmh} km/h`,
      icon: Wind,
    },
    {
      label: 'Humidity',
      value: `${current.humidity}%`,
      icon: Droplets,
    },
    {
      label: 'Dew Point',
      value: `${formatTemp(current.dewPointC, unit)}°`,
      icon: Droplets,
    },
    {
      label: 'Pressure',
      value: `${current.pressureMb} mb`,
      icon: Gauge,
    },
    {
      label: 'UV Index',
      value: `${current.uvIndex} of 11`,
      icon: Sun,
    },
    {
      label: 'Visibility',
      value: `${current.visibilityKm} km`,
      icon: Eye,
    },
    {
      label: 'Sunlight',
      value: `${current.solarWm2} W/m²`,
      icon: Sun,
    },
  ];

  return (
    <section className="wx-card">
      <div className="wx-card-header">
        <h2>Weather Today in {location.name}</h2>
      </div>

      <div className="details-top-split">
        <div className="feels-like-box">
          <span className="muted-sm">Feels Like</span>
          <div className="feels-like-temp">{formatTemp(current.feelsLikeC, unit)}°</div>
          <span className="muted-xs">
            Wind gusts up to {current.windGustKmh} km/h
          </span>
        </div>

        <DaylightArc
          sunrise={current.sunrise}
          sunset={current.sunset}
          isDay={current.isDay}
        />
      </div>

      <div className="details-metrics-grid">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="detail-metric-row">
              <span className="dm-label">
                <Icon size={16} />
                {m.label}
              </span>
              <strong className="dm-value">{m.value}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HourlyForecastCard({ weather, unit, expandedDefault = false }) {
  const [showAll, setShowAll] = useState(expandedDefault);
  const visible = showAll ? weather.hourly.slice(0, 18) : weather.hourly.slice(0, 6);

  return (
    <section id="section-hourly" className="wx-card">
      <div className="wx-card-header">
        <h2>Hourly Forecast</h2>
        <button
          type="button"
          className="wx-link-btn"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? (
            <>
              Show Less <ChevronUp size={15} />
            </>
          ) : (
            <>
              Next 18 Hours <ChevronDown size={15} />
            </>
          )}
        </button>
      </div>

      <div className="hourly-strip">
        {visible.map((slot, i) => (
          <div key={`${slot.timeLabel}-${i}`} className={`hourly-col ${i === 0 ? 'now' : ''}`}>
            <span className="h-time">{slot.timeLabel}</span>
            <strong className="h-temp">{formatTemp(slot.tempC, unit)}°</strong>
            <div className="h-icon">
              <WeatherConditionIcon icon={slot.icon} size={26} />
            </div>
            <div className="h-precip">
              <CloudRain size={12} /> {slot.precipProb}%
            </div>
            <div className="h-extra">{slot.windSpeedKmh} km/h</div>
            <div className="h-extra muted-xs">{slot.humidity}% RH</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DailyForecastCard({ weather, unit, expandedDefault = false }) {
  const [showTen, setShowTen] = useState(expandedDefault);
  const days = showTen ? weather.daily : weather.daily.slice(0, 5);

  const minLow = Math.min(...weather.daily.map((d) => d.lowC));
  const maxHigh = Math.max(...weather.daily.map((d) => d.highC));
  const span = Math.max(1, maxHigh - minLow);

  return (
    <section id="section-tenday" className="wx-card">
      <div className="wx-card-header">
        <h2>10-Day Weather Forecast</h2>
        <button
          type="button"
          className="wx-link-btn"
          onClick={() => setShowTen((v) => !v)}
        >
          {showTen ? (
            <>
              5-Day View <ChevronUp size={15} />
            </>
          ) : (
            <>
              Full 10 Days <ChevronDown size={15} />
            </>
          )}
        </button>
      </div>

      <div className="daily-rows">
        {days.map((d, idx) => {
          const leftPct = ((d.lowC - minLow) / span) * 100;
          const widthPct = Math.max(14, ((d.highC - d.lowC) / span) * 100);
          return (
            <div key={`${d.dateLabel}-${idx}`} className="daily-row">
              <span className="d-day">{d.dateLabel}</span>
              <span className="d-cond">
                <WeatherConditionIcon icon={d.icon} size={22} />
                <span>{d.condition}</span>
              </span>
              <span className="d-precip">
                <CloudRain size={13} /> {d.precipProb}%
              </span>
              <span className="d-wind">
                <Wind size={13} /> {d.windSpeedKmh} km/h
              </span>
              <div className="d-range-wrap">
                <span className="d-low">
                  <ArrowDown size={11} />
                  {formatTemp(d.lowC, unit)}°
                </span>
                <div className="d-range-bar">
                  <div
                    className="d-range-fill"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  />
                </div>
                <span className="d-high">
                  <ArrowUp size={11} />
                  {formatTemp(d.highC, unit)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
