import React from 'react';
import {
  CloudSun,
  Shirt,
  Footprints,
  Droplets,
  Navigation,
  Clock,
  CalendarDays,
  Wind,
  Sun,
} from 'lucide-react';
import { formatTemp } from '../services/weatherService';

export function LeftOptionRail({
  activeTab,
  onSelectTab,
  laundrySummary,
  runSummary,
  hydrationSummary,
  commuterSummary,
  current,
  unit,
}) {
  const navItems = [
    {
      id: 'today',
      label: 'Today Forecast',
      sub: `${formatTemp(current.tempC, unit)}°${unit} • ${current.condition}`,
      icon: CloudSun,
    },
    {
      id: 'laundry',
      label: 'Laundry Drying Time',
      sub: `${laundrySummary.durationLabel} (${laundrySummary.dryingScore}/100)`,
      icon: Shirt,
      highlight: true,
    },
    {
      id: 'running',
      label: 'Outdoor Running Time',
      sub: `Best: ${runSummary.overallBest?.timeLabel || '6 AM'}`,
      icon: Footprints,
    },
    {
      id: 'hydration',
      label: 'Hydration Advisor',
      sub: `${hydrationSummary.totalLiters} L (${hydrationSummary.glasses} glasses)`,
      icon: Droplets,
    },
    {
      id: 'commuter',
      label: 'Commuter System',
      sub: `Comfort ${commuterSummary.overallScore}/100`,
      icon: Navigation,
      highlight: true,
    },
    {
      id: 'hourly',
      label: 'Hourly Breakdown',
      sub: 'Next 24 hours',
      icon: Clock,
    },
    {
      id: 'tenday',
      label: '10-Day Outlook',
      sub: 'Extended forecast',
      icon: CalendarDays,
    },
  ];

  return (
    <aside className="left-option-rail" aria-label="Smart Weather Options">
      <div className="left-rail-card">
        <div className="left-rail-heading">Weather &amp; Lifestyle Tools</div>
        <nav className="left-rail-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`left-nav-btn ${isActive ? 'active' : ''} ${
                  item.highlight ? 'featured' : ''
                }`}
                onClick={() => onSelectTab(item.id)}
              >
                <span className="left-nav-icon">
                  <Icon size={17} />
                </span>
                <span className="left-nav-text">
                  <strong>{item.label}</strong>
                  <small>{item.sub}</small>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="left-rail-card live-laundry-mini">
        <div className="mini-card-head">
          <Shirt size={15} />
          <span>Quick Dry Formula</span>
        </div>
        <div className="mini-dry-big">{laundrySummary.durationLabel}</div>
        <div className="mini-dry-factors">
          <div>
            <Wind size={12} /> {current.windSpeedKmh} km/h
          </div>
          <div>
            <Sun size={12} /> {current.solarWm2 || 560} W/m²
          </div>
          <div>
            <Droplets size={12} /> {current.humidity}% RH
          </div>
        </div>
        <button
          type="button"
          className="mini-open-btn"
          onClick={() => onSelectTab('laundry')}
        >
          Open Drying Simulator
        </button>
      </div>
    </aside>
  );
}
