import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Container, Modal } from 'react-bootstrap';
import { ResponsiveContainer, LineChart, PieChart, Pie, Cell, Legend, Line, XAxis, Tooltip } from 'recharts';
import { FaTasks, FaWarehouse } from 'react-icons/fa';
import { gsap } from 'gsap';
import '../styles/SmartCommandCenter.css';
import '../styles/WeatherWidget.css';
import { getWeatherData } from '../services/weatherService';
import Detector from '../components/Detector';

// --- WEATHER WIDGET ---
const WeatherWidget = ({ weatherData }) => {
    const widgetRef = useRef(null);
    const sunRef = useRef(null);
    const cloud1Ref = useRef(null);
    const cloud2Ref = useRef(null);
    const raindropsRef = useRef(null);

    useLayoutEffect(() => {
        if (!weatherData || !widgetRef.current) return;
        const condition = weatherData.main.toLowerCase();

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            gsap.set([sunRef.current, cloud1Ref.current, cloud2Ref.current, raindropsRef.current.children], { clearProps: "all", opacity: 0 });

            if (condition.includes("clear")) {
                tl.to(widgetRef.current, { background: "linear-gradient(to bottom, #87CEEB, #fde6a8)", duration: 2 })
                  .to(sunRef.current, { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }, 0);
            } else if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm")) {
                tl.to(widgetRef.current, { background: "linear-gradient(to bottom, #4b6cb7, #182848)", duration: 2 })
                  .to([cloud1Ref.current, cloud2Ref.current], { opacity: 1, x: "+=10", yoyo: true, repeat: -1, duration: 5, stagger: 1 }, 0)
                  .fromTo(raindropsRef.current.children, { y: -50, opacity: 0 }, { opacity: 1, y: 200, repeat: -1, duration: 0.8, stagger: { each: 0.05, from: "random" }, ease: "power1.in" }, 0);
            } else if (condition.includes("clouds")) {
                tl.to(widgetRef.current, { background: "linear-gradient(to bottom, #bdc3c7, #2c3e50)", duration: 2 })
                  .to([cloud1Ref.current, cloud2Ref.current], { opacity: 1, x: "+=15", yoyo: true, repeat: -1, duration: 8, stagger: 2 }, 0)
                  .to(sunRef.current, { opacity: 0.5, scale: 1 }, 0);
            } else {
                tl.to(widgetRef.current, { background: "linear-gradient(to bottom, #B0C4DE, #E6E6FA)", duration: 2 })
                  .to([cloud1Ref.current, cloud2Ref.current], { opacity: 0.7, x: "+=5", yoyo: true, repeat: -1, duration: 10 }, 0)
                  .to(sunRef.current, { opacity: 0.4, scale: 1 }, 0);
            }
        }, widgetRef);
        return () => ctx.revert();
    }, [weatherData]);

    return (
        <div className="widget-card weather-widget" ref={widgetRef}>
            <div className="weather-animation-container">
                <div className="sun" ref={sunRef}></div>
                <div className="cloud cloud-1" ref={cloud1Ref}></div>
                <div className="cloud cloud-2" ref={cloud2Ref}></div>
                <div className="raindrops" ref={raindropsRef}>
                    {[...Array(30)].map((_, i) => <div key={i} className="raindrop" style={{left: `${Math.random() * 100}%`}}></div>)}
                </div>
            </div>
            <div className="weather-content-overlay">
                <h3 className="widget-title">Today's Weather</h3>
                {weatherData ? (
                    <div className="weather-info">
                        <h1>{Math.round(weatherData.temperature)}°C</h1>
                        <p>{weatherData.location}</p>
                        <p>💧 {weatherData.humidity}%</p>
                        <p className="condition-text">{weatherData.main}</p>
                    </div>
                ) : <p className="loading-text">Loading...</p>}
            </div>
        </div>
    );
};

// --- AI INSIGHTS WIDGET (Corrected with GSAP animation) ---
const AiInsightsWidget = () => {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const [data, setData] = useState([
        { month: "Feb", Predicted: 320, Actual: 310 },
        { month: "Mar", Predicted: 350, Actual: 360 },
        { month: "Apr", Predicted: 380, Actual: 365 },
    ]);

    const animateChart = () => {
        if (!containerRef.current) return;

        const paths = containerRef.current.querySelectorAll(".recharts-line path");
        if (!paths.length) {
            requestAnimationFrame(animateChart);
            return;
        }

        paths.forEach((path, i) => {
            const length = path.getTotalLength();
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 });
            gsap.to(path, { strokeDashoffset: 0, duration: 1.6, delay: i * 0.3, ease: "power3.out" });
        });

        const dots = containerRef.current.querySelectorAll(".recharts-dot");
        gsap.fromTo(dots, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.04, ease: "back.out(1.4)" });

        gsap.to(titleRef.current, { opacity: 0.85, scale: 1.03, repeat: -1, yoyo: true, duration: 1.8, ease: "sine.inOut" });
        gsap.to(containerRef.current, { boxShadow: "0 0 25px rgba(0, 255, 255, 0.35)", repeat: -1, yoyo: true, duration: 2, ease: "sine.inOut" });
    };

    useEffect(() => {
        const t = setTimeout(animateChart, 50);
        return () => clearTimeout(t);
    }, [data]);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => prev.map(row => {
                const jitter = () => Math.round(Math.random() * 18 - 9);
                return { ...row, Predicted: Math.max(200, row.Predicted + jitter()), Actual: Math.max(200, row.Actual + jitter()) };
            }));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="widget-card ai-widget" ref={containerRef}>
            <h3 className="widget-title" ref={titleRef}>AI Insights & Yield Prediction</h3>
            <p className="ai-recommendation">"Optimal planting conditions detected for Zone B. Recommend seeding within 48 hours."</p>
            <ResponsiveContainer width="100%" height={150}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="#bbb" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.7)", border: "1px solid #00eaff" }} labelStyle={{ color: "#fff" }} />
                    <Legend />
                    <Line type="monotone" dataKey="Predicted" stroke="#00eaff" strokeWidth={3} dot={{ r: 3, fill: "#00eaff" }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Actual" stroke="#00ffa2" strokeWidth={3} dot={{ r: 3, fill: "#00ffa2" }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- SOIL HEALTH WIDGET ---
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
                    <Pie data={soilData} dataKey="value" nameKey="name" cx="50%" cy="50%" labelLine={false} outerRadius={60} label={(entry) => `${entry.value}%`}>
                        {soilData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background-secondary)', border: '1px solid var(--border-color)' }}/>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- RECENT DETECTIONS WIDGET ---
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

// --- ACTIONABLE TASKS WIDGET ---
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

// --- WATER MANAGEMENT WIDGET ---
const WaterManagementWidget = () => {
    const [reservoirLevel, setReservoirLevel] = useState(85);
    const widgetRef = useRef(null);
    const waterRef = useRef(null);
    const waveRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                waterRef.current,
                { yPercent: 100 },
                { yPercent: 100 - reservoirLevel, duration: 2, ease: "power3.out" }
            );

            gsap.to(waveRef.current, {
                attr: { d: "M0,10 C25,0 25,20 50,10 S75,0 100,10 V100 H0 Z" },
                duration: 3,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
            });
        }, widgetRef);

        return () => ctx.revert();
    }, [reservoirLevel]);

    return (
        <div className="widget-card water-widget" ref={widgetRef}>
            <h3 className="widget-title"><FaWarehouse /> Water Management</h3>

            <div className="water-reservoir">
                <svg className="reservoir-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0077ff" />
                            <stop offset="100%" stopColor="#00eaff" />
                        </linearGradient>
                    </defs>
                    <g ref={waterRef}>
                        <path ref={waveRef} d="M0,15 C25,25 25,5 50,15 S75,25 100,15 V100 H0 Z" fill="url(#waterGradient)" />
                    </g>
                    <rect x="0" y="0" width="100" height="100" stroke="#00ffff55" strokeWidth="2" fill="transparent" />
                </svg>

                <div className="reservoir-label">{reservoirLevel}%</div>

                <div className="bubbles">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="bubble" style={{ left: `${Math.random() * 90 + 5}%`, animationDelay: `${Math.random() * 5}s` }}></div>
                    ))}
                </div>
            </div>

            <div className="water-status">
                <div className="status-item">
                    <span>System Status</span>
                    <strong className="status-ok">ACTIVE</strong>
                </div>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD ---
function SmartCommandCenter() {
    const [isDetectorModalOpen, setIsDetectorModalOpen] = useState(false);
    const [weatherData, setWeatherData] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const data = await getWeatherData(latitude, longitude);
                    setWeatherData(data);
                } catch {
                    setWeatherData({ temperature: 25, location: 'N/A', humidity: 60, main: 'Clear' });
                }
            }, () => {
                setWeatherData({ temperature: 25, location: 'N/A', humidity: 60, main: 'Clear' });
            });
        }
    }, []);

    const openDetectorModal = () => setIsDetectorModalOpen(true);
    const closeDetectorModal = () => setIsDetectorModalOpen(false);

    return (
        <>
            <div className="command-center">
                <h1 className="dashboard-title">Smart Command Center</h1>
                <div className="command-center-grid full-grid">
                    <WeatherWidget weatherData={weatherData} />
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
