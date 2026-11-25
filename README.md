# WeatherSmart IN — Gundimeda, Vijayawada Weather & Lifestyle Hub

A hackathon weather web application inspired by Weather.com's Gundimeda, Vijayawada forecast layout, customized by **removing** the Allergy Tracker and Radar sections and replacing them with actionable daily decision systems:

- **Left-Side Quick Options Rail**: Instant access to Today's Forecast, Laundry Drying Time, Outdoor Running Time, Hydration Advisor, Commuter System, Hourly Breakdown, and 10-Day Outlook, plus a live Quick Dry Formula card.
- **Smart Laundry Drying Time System**: Calculates fabric drying duration and ready-by time using **Wind Speed (km/h)**, **Sunlight / Solar Irradiance (W/m²)**, **Relative Humidity (%)**, ambient temperature, fabric type, and open-terrace vs. covered-balcony exposure, complete with an interactive simulator and best hang-out hour finder.
- **Outdoor Running Time Advisor**: Scores hourly running conditions using temperature, humidity, UV index, precipitation risk, and Air Quality Index (AQI) to recommend the best morning and evening run windows.
- **Daily Hydration Advisor**: Calculates daily water intake (liters & 250 ml glasses), sweat loss risk, electrolyte advice, and a timed hydration schedule based on local weather, body weight, activity level, and outdoor duration.
- **Commuter Comfort & Travel System**: Evaluates morning and evening commute windows for the Gundimeda – Prakasam Barrage – Vijayawada corridor across Two-Wheeler/Bike, Car/Cab, and Bus/Transit modes with sun-glare, crosswind, visibility, and rain advisories.

## Run Locally

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```
