import React, { useState, useEffect } from 'react';
import WeatherWidget from '../components/WeatherWidget'; // Import your new widget
import { getWeatherData } from '../services/weatherService'; // We reuse our service
import '../styles/SmartDashboard.css'; // Import the new styles

// Placeholders for the other widgets we will build
const PlaceholderWidget = ({ title }) => <div className="widget-card"><h3 className="widget-title">{title}</h3></div>;

function SmartDashboard() {
    const [weatherData, setWeatherData] = useState(null);

    useEffect(() => {
        // Fetch live weather data when the dashboard loads
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const data = await getWeatherData(latitude, longitude);
                    const mainCondition = data.weather && data.weather[0] ? data.weather[0].main : "Clear";
                    setWeatherData({ ...data, main: mainCondition });
                } catch (error) {
                    console.error("Could not fetch weather data for dashboard.");
                }
            });
        }
    }, []);

    return (
        <div className="command-center">
            <h1 className="dashboard-title">Smart Command Center</h1>
            <div className="command-center-grid">
                <WeatherWidget weatherData={weatherData} />
                <PlaceholderWidget title="AI Insights & Yield Prediction" />
                <PlaceholderWidget title="Soil Health Analysis" />
                <PlaceholderWidget title="Recent Pest Detections" />
                <PlaceholderWidget title="Actionable Tasks" />
                <PlaceholderWidget title="Water Management" />
            </div>
        </div>
    );
}

export default SmartDashboard;
