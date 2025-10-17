import React, { useState, useEffect } from 'react';
import { Container, Modal } from 'react-bootstrap';
import { ResponsiveContainer, LineChart, PieChart, Pie, Cell, Legend, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { FaCloudSun, FaTasks, FaWarehouse } from 'react-icons/fa';
import '../styles/FuturisticDashboard.css'; // Your beautiful CSS for this page
import { getWeatherData } from '../services/weatherService';
import Detector from '../components/Detector';

// --- WIDGET COMPONENTS (All 6 complete widgets are now included in this one file for stability) ---

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const weatherData = await getWeatherData(latitude, longitude);
                    setWeather(weatherData);
                } catch (error) {
                    console.error("Could not fetch weather data for widget.");
                    setWeather({ temperature: 25, location: 'N/A', humidity: 60 });
                }
            }, () => {
                setWeather({ temperature: 25, location: 'N/A', humidity: 60 });
            });
        }
    }, []);
    return (
        <div className="widget-card">
            <h3 className="widget-title">Today's Weather</h3>
            {weather ? (
                <div className="weather-content">
                    <FaCloudSun className="weather-icon" />
                    <div className="weather-temp">{Math.round(weather.temperature)}°C</div>
                    <div className="weather-location">{weather.location}</div>
                    <div className="weather-details"><span>💧 {weather.humidity}%</span></div>
                </div>
            ) : <p className="loading-text">Loading weather...</p>}
        </div>
    );
};

const AiInsightsWidget = () => {
    const yieldData = [
        { month: 'Feb', "Predicted Yield": 320, "Actual Yield": 310 },
        { month: 'Mar', "Predicted Yield": 350, "Actual Yield": 360 },
        { month: 'Apr', "Predicted Yield": 380, "Actual Yield": null },
    ];
    return (
        <div className="widget-card">
            <h3 className="widget-title">AI Insights & Yield Prediction</h3>
            <p className="ai-recommendation">"Optimal planting conditions detected for Zone B. Recommend seeding within 48 hours."</p>
            <ResponsiveContainer width="100%" height={150}>
                <LineChart data={yieldData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="month" fontSize="0.8rem" stroke="var(--text-secondary)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background-secondary)', border: '1px solid var(--border-color)' }}/>
                    <Legend />
                    <Line type="monotone" dataKey="Predicted Yield" stroke="#8884d8" strokeWidth={2}/>
                    <Line type="monotone" dataKey="Actual Yield" stroke="#82ca9d" strokeWidth={2}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const SoilHealthWidget = () => {
    const soilData = [
        { name: 'Nitrogen', value: 40 },
        { name: 'Phosphorus', value: 30 },
        { name: 'Potassium', value: 30 }
    ];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
    return (
        <div className="widget-card">
            <h3 className="widget-title">Soil Health Analysis</h3>
            <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                    <Pie data={soilData} dataKey="value" nameKey="name" cx="50%" cy="50%" labelLine={false} outerRadius={60} fill="#8884d8" label={(entry) => `${entry.value}%`}>
                        {soilData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background-secondary)', border: '1px solid var(--border-color)' }}/>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const RecentDetectionsWidget = ({ onLaunch }) => {
    const detections = [
        { id: 1, pest: 'Aphids', zone: 'Zone A', time: '2h ago' },
        { id: 2, pest: 'Powdery Mildew', zone: 'Zone C', time: '8h ago' }
    ];
    return (
        <div className="widget-card">
            <h3 className="widget-title">Recent Pest Detections</h3>
            <ul className="detection-log">
                {detections.map(d => <li key={d.id}><strong>{d.pest}</strong> in {d.zone} ({d.time})</li>)}
            </ul>
            <button className="widget-button" onClick={onLaunch}>Launch AI Detector</button>
        </div>
    );
};

const ActionableTasksWidget = () => {
    const tasks = [
        { id: 1, task: 'Fertilize Zone C', priority: 'High', due: 'In 2 days' },
        { id: 2, task: 'Check irrigation pump', priority: 'Medium', due: 'Today' },
        { id: 3, task: 'Scout for aphids in Zone A', priority: 'High', due: 'Tomorrow' },
    ];
    return (
        <div className="widget-card">
            <h3 className="widget-title"><FaTasks /> Actionable Tasks</h3>
            <ul className="task-list">
                {tasks.map(t => (
                    <li key={t.id} className={`task-item priority-${t.priority.toLowerCase()}`}>
                        <div className="task-info">
                            <span className="task-name">{t.task}</span>
                            <span className="task-due">{t.due}</span>
                        </div>
                        <div className="task-priority">{t.priority}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const WaterManagementWidget = () => {
    const waterData = [
        { day: 'Mon', usage: 450 }, { day: 'Tue', usage: 500 }, { day: 'Wed', usage: 420 },
        { day: 'Thu', usage: 550 }, { day: 'Fri', usage: 480 }, { day: 'Sat', usage: 600 },
        { day: 'Sun', usage: 520 },
    ];
    return (
        <div className="widget-card">
            <h3 className="widget-title"><FaWarehouse /> Water Management</h3>
            <div className="water-status">
                <div className="status-item"><span>Reservoir Level</span><strong>85%</strong></div>
                <div className="status-item"><span>System Status</span><strong className="status-ok">ACTIVE</strong></div>
            </div>
            <p className="widget-subtitle">Weekly Water Consumption (Liters)</p>
            <ResponsiveContainer width="100%" height={100}>
                <BarChart data={waterData}>
                    <XAxis dataKey="day" fontSize="0.8rem" stroke="var(--text-secondary)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background-secondary)', border: '1px solid var(--border-color)' }}/>
                    <Bar dataKey="usage" fill="var(--accent-color)" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


// --- The Main Dashboard Component ---
function SmartCommandCenter() {
  const [isDetectorModalOpen, setIsDetectorModalOpen] = useState(false);
  const openDetectorModal = () => setIsDetectorModalOpen(true);
  const closeDetectorModal = () => setIsDetectorModalOpen(false);

  return (
    <>
      <div className="command-center">
        <h1 className="dashboard-title">Smart Command Center</h1>
        <div className="command-center-grid full-grid">
          <WeatherWidget />
          <AiInsightsWidget />
          <SoilHealthWidget />
          <RecentDetectionsWidget onLaunch={openDetectorModal} />
          <ActionableTasksWidget />
          <WaterManagementWidget />
        </div>
      </div>
      <Modal show={isDetectorModalOpen} onHide={closeDetectorModal} size="lg" centered dialogClassName="detector-modal">
        <Modal.Body><Detector /></Modal.Body>
      </Modal>
    </>
  );
}

export default SmartCommandCenter;

