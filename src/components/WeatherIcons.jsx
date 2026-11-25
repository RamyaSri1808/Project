import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
} from 'lucide-react';

export function WeatherConditionIcon({ icon, size = 28, className = '' }) {
  const props = { size, className, strokeWidth: 2 };

  switch (icon) {
    case 'sun':
      return <Sun {...props} color="#f59e0b" fill="#fde68a" />;
    case 'moon':
      return <Moon {...props} color="#cbd5e1" fill="#94a3b8" />;
    case 'partly-sunny':
      return <CloudSun {...props} color="#f59e0b" />;
    case 'partly-night':
      return <CloudMoon {...props} color="#94a3b8" />;
    case 'cloudy':
      return <Cloud {...props} color="#64748b" fill="#e2e8f0" />;
    case 'fog':
      return <CloudFog {...props} color="#64748b" />;
    case 'drizzle':
      return <CloudDrizzle {...props} color="#0284c7" />;
    case 'rain':
    case 'heavy-rain':
      return <CloudRain {...props} color="#0369a1" />;
    case 'storm':
      return <CloudLightning {...props} color="#7c3aed" />;
    case 'partly-cloudy':
    default:
      return <CloudSun {...props} color="#0284c7" />;
  }
}

export function DaylightArc({ sunrise = '06:16 AM', sunset = '05:34 PM', isDay = true }) {
  const progress = isDay ? 0.62 : 0.95;
  const angle = Math.PI * (1 - progress);
  const cx = 90;
  const cy = 62;
  const r = 52;
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy - r * Math.sin(angle);

  return (
    <div className="daylight-arc-box">
      <svg viewBox="0 0 180 82" className="daylight-svg" aria-label="Sunrise and sunset arc">
        <line x1="16" y1="62" x2="164" y2="62" stroke="#cbd5e1" strokeWidth="1.5" />
        <path
          d="M 38 62 A 52 52 0 0 1 142 62"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="4"
          strokeDasharray="4 4"
        />
        <path
          d={`M 38 62 A 52 52 0 0 1 ${sunX.toFixed(1)} ${sunY.toFixed(1)}`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle
          cx={sunX}
          cy={sunY}
          r="6"
          fill={isDay ? '#f59e0b' : '#64748b'}
          stroke="#ffffff"
          strokeWidth="2"
        />
      </svg>
      <div className="daylight-times">
        <div>
          <span className="muted-xs">Sunrise</span>
          <strong>{sunrise}</strong>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="muted-xs">Sunset</span>
          <strong>{sunset}</strong>
        </div>
      </div>
    </div>
  );
}
