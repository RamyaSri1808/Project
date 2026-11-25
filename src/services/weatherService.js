export const PRESET_LOCATIONS = [
  {
    id: 'gundimeda-vijayawada',
    name: 'Gundimeda, Vijayawada',
    region: 'Andhra Pradesh',
    country: 'India',
    lat: 16.4632,
    lon: 80.6258,
    corridor: 'Gundimeda – Prakasam Barrage – Vijayawada',
  },
  {
    id: 'benz-circle-vijayawada',
    name: 'Benz Circle, Vijayawada',
    region: 'Andhra Pradesh',
    country: 'India',
    lat: 16.4995,
    lon: 80.6561,
    corridor: 'MG Road – Benz Circle – Kanuru',
  },
  {
    id: 'mangalagiri',
    name: 'Mangalagiri',
    region: 'Andhra Pradesh',
    country: 'India',
    lat: 16.4307,
    lon: 80.5681,
    corridor: 'NH-16 Mangalagiri – Tadepalli',
  },
  {
    id: 'amaravati',
    name: 'Amaravati',
    region: 'Andhra Pradesh',
    country: 'India',
    lat: 16.5131,
    lon: 80.5165,
    corridor: 'Seed Access Road – Secretariat',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    region: 'Telangana',
    country: 'India',
    lat: 17.385,
    lon: 78.4867,
    corridor: 'HITEC City – Banjara Hills',
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    region: 'Andhra Pradesh',
    country: 'India',
    lat: 17.6868,
    lon: 83.2185,
    corridor: 'Beach Road – MVP Colony',
  },
];

const WMO_LABELS = {
  0: { label: 'Clear Sky', icon: 'sun' },
  1: { label: 'Mostly Clear', icon: 'partly-sunny' },
  2: { label: 'Partly Cloudy', icon: 'partly-cloudy' },
  3: { label: 'Cloudy', icon: 'cloudy' },
  45: { label: 'Mist / Fog', icon: 'fog' },
  48: { label: 'Morning Haze', icon: 'fog' },
  51: { label: 'Light Drizzle', icon: 'drizzle' },
  53: { label: 'Moderate Drizzle', icon: 'drizzle' },
  61: { label: 'Light Rain', icon: 'rain' },
  63: { label: 'Moderate Rain', icon: 'rain' },
  65: { label: 'Heavy Rain', icon: 'heavy-rain' },
  80: { label: 'Passing Showers', icon: 'rain' },
  81: { label: 'Rain Showers', icon: 'rain' },
  95: { label: 'Thunderstorm', icon: 'storm' },
};

export function describeWmoCode(code, isNight = false) {
  const entry = WMO_LABELS[code] || { label: 'Partly Cloudy', icon: 'partly-cloudy' };
  if (isNight && (entry.icon === 'sun' || entry.icon === 'partly-sunny')) {
    return {
      label: code === 0 ? 'Clear Night' : 'Mostly Clear',
      icon: code === 0 ? 'moon' : 'partly-night',
    };
  }
  return entry;
}

export function buildFallbackWeather(location) {
  const isCoastal = location.name.includes('Visakhapatnam');
  const isHyd = location.name.includes('Hyderabad');
  const baseTemp = isHyd ? 24 : isCoastal ? 27 : 26;
  const highTemp = isHyd ? 29 : isCoastal ? 31 : 32;
  const lowTemp = isHyd ? 18 : isCoastal ? 23 : 21;
  const baseHumidity = isCoastal ? 74 : isHyd ? 54 : 64;

  const now = new Date();
  const currentHour = now.getHours();

  const hourly = Array.from({ length: 24 }, (_, idx) => {
    const h = (currentHour + idx) % 24;
    const isDay = h >= 6 && h <= 17;
    const tempCurve = Math.sin(((h - 5) / 24) * Math.PI * 2);
    const temp = Math.round(
      lowTemp + ((highTemp - lowTemp) * (tempCurve + 1)) / 2
    );
    const feelsLike = temp + (baseHumidity > 65 ? 2 : 1);
    const humidity = Math.max(
      38,
      Math.min(88, Math.round(baseHumidity - tempCurve * 16))
    );
    const windSpeed = Math.round(11 + Math.max(0, tempCurve) * 8 + (idx % 3));
    const solar = isDay
      ? Math.max(80, Math.round(Math.sin(((h - 6) / 12) * Math.PI) * 820))
      : 0;
    const uv = isDay ? Math.max(1, Math.round((solar / 820) * 8)) : 0;
    const precipProb = h >= 15 && h <= 19 ? 15 : 5;
    const wmo = h >= 12 && h <= 16 ? 1 : isDay ? 2 : 0;
    const desc = describeWmoCode(wmo, !isDay);

    const dateObj = new Date(now.getTime() + idx * 3600 * 1000);
    return {
      timeIso: dateObj.toISOString(),
      hour: h,
      timeLabel:
        idx === 0
          ? 'Now'
          : dateObj.toLocaleTimeString('en-IN', {
              hour: 'numeric',
              hour12: true,
            }),
      tempC: temp,
      feelsLikeC: feelsLike,
      humidity,
      windSpeedKmh: windSpeed,
      windDir: isCoastal ? 'ESE' : 'ENE',
      solarWm2: solar,
      uvIndex: uv,
      precipProb,
      visibilityKm: h >= 5 && h <= 7 ? 7.5 : 10,
      pressureMb: 1013,
      dewPointC: Math.round(temp - (100 - humidity) / 5),
      condition: desc.label,
      icon: desc.icon,
      isDay,
    };
  });

  const dayNames = ['Today', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const daily = Array.from({ length: 10 }, (_, idx) => {
    const d = new Date(now.getTime() + idx * 86400 * 1000);
    const dayOffset = Math.round(Math.sin(idx * 0.9) * 2);
    const precip = idx === 3 || idx === 6 ? 35 : idx === 4 ? 20 : 10;
    const wmo = precip >= 30 ? 80 : idx % 2 === 0 ? 1 : 2;
    const desc = describeWmoCode(wmo, false);

    return {
      dateLabel:
        idx === 0
          ? 'Today'
          : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      shortDay: idx === 0 ? 'Today' : dayNames[idx] || d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateNum: d.getDate(),
      highC: highTemp + dayOffset,
      lowC: lowTemp + (idx % 2 === 0 ? 0 : 1),
      precipProb: precip,
      windSpeedKmh: 14 + (idx % 5),
      humidity: baseHumidity + (precip >= 30 ? 10 : 0),
      uvMax: precip >= 30 ? 5 : 8,
      condition: desc.label,
      icon: desc.icon,
    };
  });

  const nowSlot = hourly[0];
  return {
    source: 'Offline / Baseline Model',
    updatedAt: now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    location,
    current: {
      tempC: baseTemp,
      feelsLikeC: baseTemp + 2,
      highC: highTemp,
      lowC: lowTemp,
      humidity: nowSlot.humidity,
      windSpeedKmh: nowSlot.windSpeedKmh,
      windGustKmh: nowSlot.windSpeedKmh + 8,
      windDir: nowSlot.windDir,
      uvIndex: nowSlot.uvIndex,
      solarWm2: nowSlot.solarWm2 || 540,
      pressureMb: 1013,
      dewPointC: nowSlot.dewPointC,
      visibilityKm: 10,
      cloudCover: 22,
      precipProb: 10,
      condition: nowSlot.condition,
      icon: nowSlot.icon,
      isDay: nowSlot.isDay,
      sunrise: '06:16 AM',
      sunset: '05:34 PM',
      moonPhase: 'Waning Gibbous',
      moonIllumination: 78,
    },
    periods: [
      {
        name: 'Morning',
        tempC: lowTemp + 4,
        condition: 'Sunny & Mild Breeze',
        icon: 'partly-sunny',
        precipProb: 5,
      },
      {
        name: 'Afternoon',
        tempC: highTemp,
        condition: 'Warm & Bright Sun',
        icon: 'sun',
        precipProb: 10,
      },
      {
        name: 'Evening',
        tempC: baseTemp,
        condition: 'Clear River Breeze',
        icon: 'partly-night',
        precipProb: 10,
      },
      {
        name: 'Overnight',
        tempC: lowTemp,
        condition: 'Calm & Pleasant',
        icon: 'moon',
        precipProb: 5,
      },
    ],
    hourly,
    daily,
    aqi: {
      value: isHyd ? 92 : isCoastal ? 54 : 68,
      category: isHyd ? 'Moderate' : 'Satisfactory',
      primaryPollutant: 'PM2.5',
      pm25: isHyd ? 31 : 21,
      pm10: isHyd ? 64 : 46,
      o3: 38,
      advice:
        'Air quality is clean along the Krishna riverfront; comfortable for outdoor running and commuting.',
    },
  };
}

function degToCompass(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export async function fetchWeatherForLocation(location) {
  const fallback = buildFallbackWeather(location);
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
    `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,visibility,wind_speed_10m,wind_direction_10m,uv_index,shortwave_radiation,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=auto&forecast_days=10`;

  const aqiUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}` +
    `&current=us_aqi,pm10,pm2_5,ozone&timezone=auto`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const [wRes, aRes] = await Promise.all([
      fetch(weatherUrl, { signal: controller.signal }),
      fetch(aqiUrl, { signal: controller.signal }).catch(() => null),
    ]);
    clearTimeout(timer);

    if (!wRes.ok) return fallback;
    const w = await wRes.json();
    const a = aRes && aRes.ok ? await aRes.json() : null;

    if (!w.current || !w.hourly || !w.daily) return fallback;

    const nowIsoPrefix = w.current.time.slice(0, 13);
    let startIdx = w.hourly.time.findIndex((t) => t.startsWith(nowIsoPrefix));
    if (startIdx < 0) startIdx = 0;

    const hourly = Array.from({ length: 24 }, (_, idx) => {
      const i = Math.min(startIdx + idx, w.hourly.time.length - 1);
      const tDate = new Date(w.hourly.time[i]);
      const isDay = Boolean(w.hourly.is_day[i]);
      const desc = describeWmoCode(w.hourly.weather_code[i], !isDay);
      const tempC = Math.round(w.hourly.temperature_2m[i]);
      const humidity = Math.round(w.hourly.relative_humidity_2m[i]);

      return {
        timeIso: w.hourly.time[i],
        hour: tDate.getHours(),
        timeLabel:
          idx === 0
            ? 'Now'
            : tDate.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true }),
        tempC,
        feelsLikeC: Math.round(w.hourly.apparent_temperature[i]),
        humidity,
        windSpeedKmh: Math.round(w.hourly.wind_speed_10m[i]),
        windDir: degToCompass(w.hourly.wind_direction_10m[i] || 75),
        solarWm2: Math.round(w.hourly.shortwave_radiation?.[i] ?? 0),
        uvIndex: Math.round(w.hourly.uv_index?.[i] ?? 0),
        precipProb: Math.round(w.hourly.precipitation_probability?.[i] ?? 0),
        visibilityKm: Number(((w.hourly.visibility?.[i] ?? 10000) / 1000).toFixed(1)),
        pressureMb: Math.round(w.current.surface_pressure || 1013),
        dewPointC: Math.round(tempC - (100 - humidity) / 5),
        condition: desc.label,
        icon: desc.icon,
        isDay,
      };
    });

    const daily = w.daily.time.map((dateStr, idx) => {
      const d = new Date(dateStr + 'T12:00:00');
      const desc = describeWmoCode(w.daily.weather_code[idx], false);
      return {
        dateLabel:
          idx === 0
            ? 'Today'
            : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        shortDay:
          idx === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateNum: d.getDate(),
        highC: Math.round(w.daily.temperature_2m_max[idx]),
        lowC: Math.round(w.daily.temperature_2m_min[idx]),
        precipProb: Math.round(w.daily.precipitation_probability_max?.[idx] ?? 0),
        windSpeedKmh: Math.round(w.daily.wind_speed_10m_max?.[idx] ?? 12),
        humidity: fallback.daily[idx]?.humidity ?? 60,
        uvMax: Math.round(w.daily.uv_index_max?.[idx] ?? 6),
        condition: desc.label,
        icon: desc.icon,
      };
    });

    const isDayNow = Boolean(w.current.is_day);
    const curDesc = describeWmoCode(w.current.weather_code, !isDayNow);
    const sunriseStr = w.daily.sunrise?.[0]
      ? new Date(w.daily.sunrise[0]).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : fallback.current.sunrise;
    const sunsetStr = w.daily.sunset?.[0]
      ? new Date(w.daily.sunset[0]).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : fallback.current.sunset;

    const slotByHour = (targetHour) =>
      hourly.find((h) => h.hour === targetHour) || hourly[0];

    const aqiVal = Math.round(a?.current?.us_aqi ?? fallback.aqi.value);
    const aqiCat =
      aqiVal <= 50
        ? 'Good'
        : aqiVal <= 100
          ? 'Satisfactory'
          : aqiVal <= 150
            ? 'Moderate'
            : 'Poor';

    return {
      source: 'Live Open-Meteo Feed',
      updatedAt: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      location,
      current: {
        tempC: Math.round(w.current.temperature_2m),
        feelsLikeC: Math.round(w.current.apparent_temperature),
        highC: daily[0].highC,
        lowC: daily[0].lowC,
        humidity: Math.round(w.current.relative_humidity_2m),
        windSpeedKmh: Math.round(w.current.wind_speed_10m),
        windGustKmh: Math.round(w.current.wind_gusts_10m || w.current.wind_speed_10m + 6),
        windDir: degToCompass(w.current.wind_direction_10m || 75),
        uvIndex: hourly[0].uvIndex,
        solarWm2: hourly[0].solarWm2,
        pressureMb: Math.round(w.current.surface_pressure || 1013),
        dewPointC: Math.round(
          w.current.temperature_2m - (100 - w.current.relative_humidity_2m) / 5
        ),
        visibilityKm: hourly[0].visibilityKm,
        cloudCover: Math.round(w.current.cloud_cover ?? 20),
        precipProb: hourly[0].precipProb,
        condition: curDesc.label,
        icon: curDesc.icon,
        isDay: isDayNow,
        sunrise: sunriseStr,
        sunset: sunsetStr,
        moonPhase: fallback.current.moonPhase,
        moonIllumination: fallback.current.moonIllumination,
      },
      periods: [
        {
          name: 'Morning',
          tempC: slotByHour(9).tempC,
          condition: slotByHour(9).condition,
          icon: slotByHour(9).icon,
          precipProb: slotByHour(9).precipProb,
        },
        {
          name: 'Afternoon',
          tempC: slotByHour(14).tempC,
          condition: slotByHour(14).condition,
          icon: slotByHour(14).icon,
          precipProb: slotByHour(14).precipProb,
        },
        {
          name: 'Evening',
          tempC: slotByHour(19).tempC,
          condition: slotByHour(19).condition,
          icon: slotByHour(19).icon,
          precipProb: slotByHour(19).precipProb,
        },
        {
          name: 'Overnight',
          tempC: slotByHour(2).tempC,
          condition: slotByHour(2).condition,
          icon: slotByHour(2).icon,
          precipProb: slotByHour(2).precipProb,
        },
      ],
      hourly,
      daily,
      aqi: {
        value: aqiVal,
        category: aqiCat,
        primaryPollutant: 'PM2.5',
        pm25: Math.round(a?.current?.pm2_5 ?? fallback.aqi.pm25),
        pm10: Math.round(a?.current?.pm10 ?? fallback.aqi.pm10),
        o3: Math.round(a?.current?.ozone ?? fallback.aqi.o3),
        advice:
          aqiVal <= 100
            ? 'Air quality is favorable for outdoor running, cycling, and open-window ventilation.'
            : 'Moderate particulate load — prefer early morning outdoor workouts and keep a mask handy in traffic.',
      },
    };
  } catch {
    return fallback;
  }
}

export async function searchLocations(query) {
  const q = query.trim();
  if (!q) return PRESET_LOCATIONS;

  const localMatches = PRESET_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q.toLowerCase()) ||
      loc.region.toLowerCase().includes(q.toLowerCase())
  );

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`
    );
    if (!res.ok) return localMatches;
    const data = await res.json();
    const remote = (data.results || []).map((r) => ({
      id: `geo-${r.id}`,
      name: r.name,
      region: r.admin1 || '',
      country: r.country || '',
      lat: r.latitude,
      lon: r.longitude,
      corridor: `${r.name} Local Commute Corridor`,
    }));

    const seen = new Set(localMatches.map((l) => l.name.toLowerCase()));
    return [
      ...localMatches,
      ...remote.filter((r) => !seen.has(r.name.toLowerCase())),
    ].slice(0, 6);
  } catch {
    return localMatches;
  }
}

export function formatTemp(tempC, unit) {
  if (unit === 'F') {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
}
