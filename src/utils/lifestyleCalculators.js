export const FABRIC_PROFILES = {
  synthetics: { label: 'Sportswear / Synthetics', baseMinutes: 55 },
  cotton: { label: 'Cotton Shirts & Tees', baseMinutes: 90 },
  delicates: { label: 'Delicates / Linen', baseMinutes: 75 },
  towels: { label: 'Bath Towels', baseMinutes: 140 },
  denim: { label: 'Heavy Denim / Jeans', baseMinutes: 175 },
};

/**
 * Physics-inspired laundry drying time calculator using wind speed,
 * sunlight (solar irradiance W/m²), relative humidity, and temperature.
 */
export function calculateLaundryDrying({
  windSpeedKmh,
  sunlightWm2,
  humidity,
  tempC = 28,
  fabricType = 'cotton',
  exposure = 'direct-sun',
}) {
  const profile = FABRIC_PROFILES[fabricType] || FABRIC_PROFILES.cotton;
  const effectiveSolar = exposure === 'direct-sun' ? sunlightWm2 : sunlightWm2 * 0.25;

  // Higher humidity strongly reduces vapor pressure deficit; lower humidity speeds drying.
  const humidityFactor = Math.max(0.55, Math.min(2.5, Math.pow(humidity / 55, 1.3)));

  // Wind strips the saturated moisture boundary layer around fabric fibers.
  const windMultiplier = 1 + Math.min(windSpeedKmh, 40) * 0.024;

  // Solar irradiance heats fabric water molecules directly.
  const sunMultiplier = 1 + Math.min(effectiveSolar, 950) * 0.00055;

  // Ambient temperature raises saturation vapor pressure.
  const tempMultiplier = Math.pow(1.022, Math.max(-5, Math.min(20, tempC - 22)));

  const rawMinutes =
    (profile.baseMinutes * humidityFactor * 1.45) /
    (windMultiplier * sunMultiplier * tempMultiplier);

  const estimatedMinutes = Math.max(25, Math.min(480, Math.round(rawMinutes / 5) * 5));
  const hours = Math.floor(estimatedMinutes / 60);
  const mins = estimatedMinutes % 60;
  const durationLabel =
    hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins} min`;

  // Ready-by timestamp from now
  const readyDate = new Date(Date.now() + estimatedMinutes * 60 * 1000);
  const readyByTime = readyDate.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Score 0 - 100
  const dryingScore = Math.max(
    8,
    Math.min(
      98,
      Math.round(
        100 -
          (humidity - 30) * 0.65 +
          Math.min(windSpeedKmh, 30) * 0.9 +
          (effectiveSolar / 900) * 26 -
          (estimatedMinutes > 180 ? 18 : 0)
      )
    )
  );

  let rating = 'Ideal for Outdoor Line';
  let statusTone = 'good';
  if (dryingScore < 42) {
    rating = 'Slow — Use Covered Spin-Dry';
    statusTone = 'poor';
  } else if (dryingScore < 65) {
    rating = 'Moderate Drying Speed';
    statusTone = 'moderate';
  } else if (dryingScore < 82) {
    rating = 'Good Outdoor Drying';
    statusTone = 'good';
  }

  // Factor strength bars (0-100) for UI transparency
  const windImpact = Math.min(100, Math.round((windSpeedKmh / 28) * 100));
  const sunImpact = Math.min(100, Math.round((effectiveSolar / 850) * 100));
  const drynessImpact = Math.max(5, Math.min(100, Math.round(100 - (humidity - 20) * 1.15)));

  return {
    estimatedMinutes,
    durationLabel,
    readyByTime,
    dryingScore,
    rating,
    statusTone,
    fabricLabel: profile.label,
    effectiveSolar: Math.round(effectiveSolar),
    factors: {
      windImpact,
      sunImpact,
      drynessImpact,
    },
  };
}

export function findBestLaundryWindows(hourly, fabricType = 'cotton') {
  const daytime = hourly.filter((h) => h.hour >= 7 && h.hour <= 17);
  const scored = (daytime.length ? daytime : hourly.slice(0, 12)).map((slot) => {
    const res = calculateLaundryDrying({
      windSpeedKmh: slot.windSpeedKmh,
      sunlightWm2: slot.solarWm2 || (slot.isDay ? 520 : 0),
      humidity: slot.humidity,
      tempC: slot.tempC,
      fabricType,
      exposure: 'direct-sun',
    });
    return {
      timeLabel: slot.timeLabel,
      hour: slot.hour,
      precipProb: slot.precipProb,
      windSpeedKmh: slot.windSpeedKmh,
      humidity: slot.humidity,
      solarWm2: slot.solarWm2,
      ...res,
    };
  });

  const sorted = [...scored].sort((a, b) => b.dryingScore - a.dryingScore);
  return {
    bestSlot: sorted[0] || null,
    slots: scored,
  };
}

/**
 * Evaluates hourly outdoor running windows using temperature, humidity,
 * UV load, wind, rain risk, and AQI.
 */
export function calculateRunningWindows(hourly, aqiValue = 68) {
  const evaluated = hourly.slice(0, 18).map((slot) => {
    let score = 95;
    // Ideal running temp: 16-24°C
    if (slot.tempC > 24) score -= (slot.tempC - 24) * 4.2;
    if (slot.tempC < 14) score -= (14 - slot.tempC) * 2.5;
    // Humidity penalty above 62%
    if (slot.humidity > 62) score -= (slot.humidity - 62) * 0.65;
    // UV glare/heat stress
    if (slot.uvIndex >= 6) score -= (slot.uvIndex - 5) * 4.5;
    // Rain risk
    score -= slot.precipProb * 0.55;
    // AQI penalty
    if (aqiValue > 100) score -= (aqiValue - 100) * 0.25;

    const clamped = Math.max(15, Math.min(98, Math.round(score)));
    const status =
      clamped >= 78
        ? 'Optimal'
        : clamped >= 58
          ? 'Good'
          : clamped >= 40
            ? 'Caution'
            : 'Avoid';

    let note = 'Crisp air & low heat stress';
    if (slot.uvIndex >= 7) note = 'High UV — shade route + cap needed';
    else if (slot.tempC >= 31) note = 'High thermal load — slow pace by 15%';
    else if (slot.precipProb >= 40) note = 'Wet surface / shower risk';
    else if (slot.humidity >= 76) note = 'Muggy air — extra hydration needed';

    return {
      ...slot,
      runScore: clamped,
      status,
      note,
    };
  });

  const practicalHours = evaluated.filter((h) => h.hour >= 5 && h.hour <= 21);
  const pool = practicalHours.length ? practicalHours : evaluated;
  const morning = pool
    .filter((h) => h.hour >= 5 && h.hour <= 9)
    .sort((a, b) => b.runScore - a.runScore)[0];
  const evening = pool
    .filter((h) => h.hour >= 17 && h.hour <= 21)
    .sort((a, b) => b.runScore - a.runScore)[0];
  const overallBest = [...pool].sort((a, b) => b.runScore - a.runScore)[0];

  return {
    bestMorning: morning || overallBest,
    bestEvening: evening || overallBest,
    overallBest,
    timeline: evaluated,
  };
}

export const ACTIVITY_LEVELS = {
  sedentary: { label: 'Indoor / Desk Day', extraMl: 0 },
  commute: { label: 'Daily Commute & Errands', extraMl: 350 },
  'moderate-run': { label: 'Outdoor Run / Brisk Walk', extraMl: 750 },
  'intense-workout': { label: 'Long Run / Sports', extraMl: 1200 },
};

export function calculateHydrationPlan({
  tempC,
  humidity,
  uvIndex,
  weightKg = 68,
  activityLevel = 'moderate-run',
  outdoorMinutes = 45,
}) {
  const baseMl = weightKg * 33;
  const heatExtraMl = Math.max(0, tempC - 24) * 65 + Math.max(0, humidity - 60) * 6;
  const activityExtra = ACTIVITY_LEVELS[activityLevel]?.extraMl ?? 600;
  const exposureExtra = Math.round((outdoorMinutes / 30) * (180 + uvIndex * 22));

  const totalMl = Math.round((baseMl + heatExtraMl + activityExtra + exposureExtra) / 50) * 50;
  const totalLiters = (totalMl / 1000).toFixed(1);
  const glasses = Math.round(totalMl / 250);

  const sweatRisk =
    tempC >= 32 || (tempC >= 28 && humidity >= 70)
      ? 'High'
      : tempC >= 26
        ? 'Moderate'
        : 'Low';

  const electrolyteAdvice =
    sweatRisk === 'High'
      ? 'Add 1 electrolyte / ORS packet after outdoor run'
      : sweatRisk === 'Moderate'
        ? 'Include coconut water or lemon-salt water midday'
        : 'Plain water meets daily mineral balance';

  const schedule = [
    { window: '6:30 AM', amountMl: Math.round(totalMl * 0.16), tip: 'Morning rehydration before walk/run' },
    { window: '10:30 AM', amountMl: Math.round(totalMl * 0.22), tip: 'Steady sips as UV rises' },
    { window: '2:00 PM', amountMl: Math.round(totalMl * 0.27), tip: 'Peak heat window — chilled water' },
    { window: '6:00 PM', amountMl: Math.round(totalMl * 0.22), tip: 'Post-commute / evening recovery' },
    { window: '9:00 PM', amountMl: Math.round(totalMl * 0.13), tip: 'Light evening top-up' },
  ];

  return {
    totalMl,
    totalLiters,
    glasses,
    sweatRisk,
    electrolyteAdvice,
    hourlyReminderMl: Math.round(totalMl / 14),
    schedule,
  };
}

export const COMMUTE_MODES = {
  bike: { label: 'Two-Wheeler / Bike' },
  car: { label: 'Car / Cab' },
  transit: { label: 'Bus / Metro / Walk' },
};

export function calculateCommuterReport({
  current,
  hourly,
  mode = 'bike',
  corridor = 'Gundimeda – Prakasam Barrage – Vijayawada',
}) {
  const morningSlot = hourly.find((h) => h.hour === 8) || hourly[1] || hourly[0];
  const eveningSlot = hourly.find((h) => h.hour === 18) || hourly[6] || hourly[0];

  const evalSlot = (slot, periodName, glareNote) => {
    let score = 94;
    score -= slot.precipProb * 0.6;
    if (slot.windSpeedKmh > 22) score -= (slot.windSpeedKmh - 22) * 1.4;
    if (slot.tempC > 31) score -= (slot.tempC - 31) * 3;
    if (slot.visibilityKm < 6) score -= (6 - slot.visibilityKm) * 8;
    if (mode === 'bike' && slot.precipProb >= 35) score -= 12;
    if (mode === 'car' && slot.tempC >= 33) score -= 4;

    const comfortScore = Math.max(20, Math.min(98, Math.round(score)));
    const status =
      comfortScore >= 78 ? 'Smooth' : comfortScore >= 58 ? 'Moderate' : 'Challenging';

    return {
      periodName,
      timeLabel: slot.timeLabel,
      tempC: slot.tempC,
      windSpeedKmh: slot.windSpeedKmh,
      windDir: slot.windDir,
      precipProb: slot.precipProb,
      visibilityKm: slot.visibilityKm,
      comfortScore,
      status,
      glareNote,
    };
  };

  const morning = evalSlot(
    morningSlot,
    'Morning Commute (8–10 AM)',
    'Eastward sun glare crossing Prakasam Barrage / NH-16 — keep visor clean.'
  );
  const evening = evalSlot(
    eveningSlot,
    'Evening Return (5:30–8 PM)',
    'Dusk contrast drop after 5:45 PM; pleasant river cross-breeze.'
  );

  const avgScore = Math.round((morning.comfortScore + evening.comfortScore) / 2);
  const checklist = [];

  if (current.uvIndex >= 5 || current.solarWm2 > 450) {
    checklist.push('Polarized sunglasses / tinted visor for bright glare');
  }
  if (current.windSpeedKmh >= 16) {
    checklist.push(
      mode === 'bike'
        ? `Crosswind ${current.windSpeedKmh} km/h (${current.windDir}) on open bridge stretches — steady grip`
        : `Moderate ${current.windDir} crosswind (${current.windSpeedKmh} km/h) on river bridge`
    );
  }
  if (Math.max(morning.precipProb, evening.precipProb) >= 30) {
    checklist.push('Pack compact rain poncho / allow +10 min travel buffer');
  } else {
    checklist.push('Dry road surface expected — normal travel buffer');
  }
  if (current.tempC >= 29) {
    checklist.push(
      mode === 'car'
        ? 'Pre-ventilate cabin 2 min before switching AC to recirculate'
        : 'Carry 500 ml chilled water bottle for commute'
    );
  } else {
    checklist.push('Comfortable ambient air — low thermal fatigue');
  }

  return {
    corridor,
    modeLabel: COMMUTE_MODES[mode]?.label || 'Two-Wheeler / Bike',
    overallScore: avgScore,
    morning,
    evening,
    bestDeparture:
      morning.comfortScore >= evening.comfortScore
        ? '7:45 AM – 8:30 AM (Coolest & clearest)'
        : '6:15 PM – 7:15 PM (Lower heat & glare)',
    checklist,
  };
}
